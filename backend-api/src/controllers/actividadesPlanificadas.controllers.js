import { pool } from '../db.js';

export const getActividadesPlanificadas = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ap.*, p.nombre as proyecto_nombre 
       FROM actividades_planeadas ap
       LEFT JOIN proyectos p ON ap.proyecto_id = p.id
       ORDER BY ap.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error getting actividades planificadas:', error);
    res.status(500).json({ message: "Error al obtener actividades planificadas" });
  }
};

export const getActividadPlanificadaById = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "ID de actividad inválido" });
  }
  const { rows } = await pool.query('SELECT * FROM actividades_planeadas WHERE id = $1', [parseInt(id)]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "Actividad Planificada no encontrada" });
  }
  res.json(rows[0]);
};

export const createActividadPlanificada = async (req, res) => {
  try {
    const { proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones, created_by } = req.body;
    
    if (!proyecto_id || !descripcion) {
      return res.status(400).json({ message: "Proyecto y descripción son requeridos" });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO actividades_planeadas (proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones, created_by]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating actividad planificada:', error);
    return res.status(500).json({ message: "Error al crear la actividad planificada" });
  }
};

export const updateActividadPlanificada = async (req, res) => {
  try {
    const { id } = req.params;
    const { proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "ID de actividad inválido" });
    }
    
    const { rows, rowCount } = await pool.query(
      `UPDATE actividades_planeadas SET proyecto_id = $1, descripcion = $2, ano = $3, meta_anual = $4, meta_trimestral1 = $5, meta_trimestral2 = $6, meta_trimestral3 = $7, meta_trimestral4 = $8, porcentaje_anual_esperado = $9, observaciones = $10 WHERE id = $11 RETURNING *`,
      [proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones, parseInt(id)]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Actividad Planificada no encontrada" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Error updating actividad planificada:', error);
    return res.status(500).json({ message: "Error al actualizar la actividad planificada" });
  }
};

export const deleteActividadPlanificada = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "ID de actividad inválido" });
  }
  const { rowCount } = await pool.query('DELETE FROM actividades_planeadas WHERE id = $1', [parseInt(id)]);
  if (rowCount === 0) {
    return res.status(404).json({ message: "Actividad Planificada no encontrada" });
  }
  return res.sendStatus(204);
};
