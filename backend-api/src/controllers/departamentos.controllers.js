import { pool } from '../db.js';

export const getDepartamentos = async (req, res) => {
  try {
    const { unidad_id } = req.query;
    let query = 'SELECT * FROM departamentos';
    const params = [];
    
    if (unidad_id) {
      query += ' WHERE unidad_administrativa_id = $1';
      params.push(parseInt(unidad_id));
    }
    
    query += ' ORDER BY nombre ASC';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error getting departamentos:', error);
    res.status(500).json({ message: "Error al obtener departamentos" });
  }
};

export const getDepartamentoById = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "ID de departamento inválido" });
  }
  const { rows } = await pool.query('SELECT * FROM departamentos WHERE id = $1', [parseInt(id)]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "Departamento no encontrado" });
  }
  res.json(rows[0]);
};

export const createDepartamento = async (req, res) => {
  try {
    const { nombre, descripcion, unidad_administrativa_id } = req.body;
    
    if (!nombre?.trim()) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }
    
    const { rows } = await pool.query(
      'INSERT INTO departamentos (nombre, descripcion, unidad_administrativa_id) VALUES ($1, $2, $3) RETURNING *',
      [nombre.trim(), descripcion, unidad_administrativa_id]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating departamento:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: "El departamento ya existe" });
    }
    return res.status(500).json({ message: "Error al crear el departamento" });
  }
};

export const updateDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, unidad_administrativa_id } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "ID de departamento inválido" });
    }
    
    const { rows, rowCount } = await pool.query(
      'UPDATE departamentos SET nombre = $1, descripcion = $2, unidad_administrativa_id = $3 WHERE id = $4 RETURNING *',
      [nombre, descripcion, unidad_administrativa_id, parseInt(id)]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Departamento no encontrado" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Error updating departamento:', error);
    return res.status(500).json({ message: "Error al actualizar el departamento" });
  }
};

export const deleteDepartamento = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "ID de departamento inválido" });
  }
  const { rowCount } = await pool.query('DELETE FROM departamentos WHERE id = $1', [parseInt(id)]);
  if (rowCount === 0) {
    return res.status(404).json({ message: "Departamento no encontrado" });
  }
  return res.sendStatus(204);
};
