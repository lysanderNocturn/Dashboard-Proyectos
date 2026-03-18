import { pool } from "../db.js";

// Helper function to safely parse trimestres
const safeTrimestres = (trimestres) => {
  if (!trimestres) return [];
  if (Array.isArray(trimestres)) return trimestres;
  try {
    return JSON.parse(trimestres);
  } catch {
    return [];
  }
};

export const getProyectos = async (req, res) => {
  try {
    // Support pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM proyectos');
    const total = parseInt(countResult.rows[0].count);
    
    // Optimized: Use a single query with LEFT JOIN to avoid N+1 query problem
    const { rows } = await pool.query(`
      SELECT p.*, 
             pr.monto as presupuesto_monto, pr.ano as presupuesto_ano,
             u.nombre as unidad_nombre, d.nombre as departamento_nombre,
             COALESCE(
               json_agg(
                 DISTINCT jsonb_build_object(
                   'ano', pt.ano,
                   'trimestre', pt.trimestre,
                   'meta', pt.meta,
                   'porcentaje', pt.porcentaje
                 )
               ) FILTER (WHERE pt.id IS NOT NULL),
               '[]'
             ) as trimestres
      FROM proyectos p
      LEFT JOIN presupuestos pr ON p.presupuesto_id = pr.id
      LEFT JOIN unidad_administrativa u ON p.unidad_administrativa_id = u.id
      LEFT JOIN departamentos d ON p.departamento_id = d.id
      LEFT JOIN proyectos_trimestres pt ON p.id = pt.proyecto_id
      GROUP BY p.id, pr.monto, pr.ano, u.nombre, d.nombre
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ message: "Error al obtener los proyectos", error: error.message });
  }
};

export const getProyectoById = async (req, res) => {
  try {
    const { id } = req.params;
    // Optimized: Single query with JOIN instead of N+1
    const { rows } = await pool.query(`
      SELECT p.*, 
             pr.monto as presupuesto_monto, pr.ano as presupuesto_ano,
             u.nombre as unidad_nombre, d.nombre as departamento_nombre,
             COALESCE(
               json_agg(
                 DISTINCT jsonb_build_object(
                   'ano', pt.ano,
                   'trimestre', pt.trimestre,
                   'meta', pt.meta,
                   'porcentaje', pt.porcentaje
                 )
               ) FILTER (WHERE pt.id IS NOT NULL),
               '[]'
             ) as trimestres
      FROM proyectos p
      LEFT JOIN presupuestos pr ON p.presupuesto_id = pr.id
      LEFT JOIN unidad_administrativa u ON p.unidad_administrativa_id = u.id
      LEFT JOIN departamentos d ON p.departamento_id = d.id
      LEFT JOIN proyectos_trimestres pt ON p.id = pt.proyecto_id
      WHERE p.id = $1
      GROUP BY p.id, pr.monto, pr.ano, u.nombre, d.nombre
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({ message: "Error al obtener el proyecto", error: error.message });
  }
};

export const createProyecto = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const data = req.body;
    console.log('Creating proyecto with data:', JSON.stringify(data, null, 2));
    
    // Build the query dynamically based on available columns
    const columns = ['nombre', 'descripcion', 'estado_actual', 'evaluacion'];
    const values = [
      data.nombre || '',
      data.descripcion || '',
      data.estado_actual || 'Activo',
      data.evaluacion || ''
    ];
    let paramCount = 4;
    
    // Add new fields if they exist in the database
    const optionalFields = [
      { name: 'objetivo', value: data.objetivo },
      { name: 'meta_total', value: data.meta_total || 100 },
      { name: 'duracion_anos', value: data.duracion_anos || 1 },
      { name: 'medida_tipo', value: data.medida_tipo || 'porcentaje' },
      { name: 'fecha_inicio', value: data.fecha_inicio === '' ? null : data.fecha_inicio },
      { name: 'fecha_fin', value: data.fecha_fin === '' ? null : data.fecha_fin },
      { name: 'presupuesto_id', value: data.presupuesto_id || null },
      { name: 'unidad_administrativa_id', value: data.unidad_administrativa_id || null },
      { name: 'departamento_id', value: data.departamento_id || null },
      { name: 'ejes_id', value: data.ejes_id || null },
      { name: 'accion_id', value: data.accion_id || null },
      { name: 'medida_id', value: data.medida_id || null },
    ];
    
    for (const field of optionalFields) {
      if (field.value !== undefined) {
        columns.push(field.name);
        values.push(field.value);
        paramCount++;
      }
    }
    
    const query = `INSERT INTO proyectos (${columns.join(', ')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`;
    console.log('Query:', query);
    console.log('Values:', values);
    
    const proyectoResult = await client.query(query, values);
    const proyecto = proyectoResult.rows[0];
    
    // Insert trimestres if provided
    const trimestres = safeTrimestres(data.trimestres);
    if (trimestres.length > 0) {
      for (const trimestre of trimestres) {
        try {
          await client.query(
            `INSERT INTO proyectos_trimestres (proyecto_id, ano, trimestre, meta, porcentaje)
             VALUES ($1, $2, $3, $4, $5)`,
            [proyecto.id, trimestre.ano, trimestre.trimestre, trimestre.meta || 0, trimestre.porcentaje || 0]
          );
        } catch (err) {
          console.error('Error al insertar trimestre:', err);
          // Continue even if one trimestre fails
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Get the proyecto with trimestres
    const { rows: trimestresRows } = await pool.query(
      'SELECT ano, trimestre, meta, porcentaje FROM proyectos_trimestres WHERE proyecto_id = $1 ORDER BY ano, trimestre',
      [proyecto.id]
    );
    
    res.status(201).json({ ...proyecto, trimestres: trimestresRows || [] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ message: "Error al crear el proyecto", error: error.message });
  } finally {
    client.release();
  }
};

export const deleteProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    
    // La eliminación en cascada de la foreign key se encarga de eliminar los registros relacionados
    const { rowCount } = await pool.query('DELETE FROM proyectos WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }
    
    res.sendStatus(204);
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({ message: "Error al eliminar el proyecto", error: error.message });
  }
};

export const updateProyecto = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const data = req.body;
    
    console.log('Updating proyecto with data:', JSON.stringify(data, null, 2));
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 0;
    
    const fields = [
      { name: 'nombre', value: data.nombre },
      { name: 'descripcion', value: data.descripcion },
      { name: 'estado_actual', value: data.estado_actual },
      { name: 'evaluacion', value: data.evaluacion },
      { name: 'objetivo', value: data.objetivo },
      { name: 'meta_total', value: data.meta_total },
      { name: 'duracion_anos', value: data.duracion_anos },
      { name: 'medida_tipo', value: data.medida_tipo },
      { name: 'fecha_inicio', value: data.fecha_inicio === '' ? null : data.fecha_inicio },
      { name: 'fecha_fin', value: data.fecha_fin === '' ? null : data.fecha_fin },
      { name: 'presupuesto_id', value: data.presupuesto_id || null },
      { name: 'unidad_administrativa_id', value: data.unidad_administrativa_id || null },
      { name: 'departamento_id', value: data.departamento_id || null },
      { name: 'ejes_id', value: data.ejes_id || null },
      { name: 'accion_id', value: data.accion_id || null },
      { name: 'medida_id', value: data.medida_id || null },
    ];
    
    for (const field of fields) {
      if (field.value !== undefined) {
        paramCount++;
        updates.push(`${field.name} = $${paramCount}`);
        values.push(field.value);
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }
    
    paramCount++;
    values.push(id);
    
    const query = `UPDATE proyectos SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    console.log('Update query:', query);
    console.log('Update values:', values);
    
    const { rows, rowCount } = await client.query(query, values);
    
    if (rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }
    
    const proyecto = rows[0];
    
    // Update trimestres if provided
    const trimestres = safeTrimestres(data.trimestres);
    if (trimestres.length > 0) {
      // Delete existing trimestres
      await client.query('DELETE FROM proyectos_trimestres WHERE proyecto_id = $1', [id]);
      
      // Insert new trimestres
      for (const trimestre of trimestres) {
        try {
          await client.query(
            `INSERT INTO proyectos_trimestres (proyecto_id, ano, trimestre, meta, porcentaje)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, trimestre.ano, trimestre.trimestre, trimestre.meta || 0, trimestre.porcentaje || 0]
          );
        } catch (err) {
          console.error('Error al insertar trimestre:', err);
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Get updated proyecto with trimestres
    const { rows: trimestresRows } = await pool.query(
      'SELECT ano, trimestre, meta, porcentaje FROM proyectos_trimestres WHERE proyecto_id = $1 ORDER BY ano, trimestre',
      [id]
    );
    
    res.json({ ...proyecto, trimestres: trimestresRows || [] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({ message: "Error al actualizar el proyecto", error: error.message });
  } finally {
    client.release();
  }
};
