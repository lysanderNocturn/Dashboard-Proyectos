import { pool } from '../db.js';

export const getActividadesEjecutadas = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ae.*, ap.descripcion as actividad_planificada 
       FROM actividades_ejecutadas ae
       LEFT JOIN actividades_planeadas ap ON ae.actividad_planeada_id = ap.id
       ORDER BY ae.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error getting actividades ejecutadas:', error);
    res.status(500).json({ message: "Error al obtener actividades ejecutadas" });
  }
};

export const getActividadEjecutadaById = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "ID de actividad inválido" });
  }
  const { rows } = await pool.query('SELECT * FROM actividades_ejecutadas WHERE id = $1', [parseInt(id)]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "Actividad Ejecutada no encontrada" });
  }
  res.json(rows[0]);
};

export const createActividadEjecutada = async (req, res) => {
  try {
    const { actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by, razon, obstaculos, documentacion_adjunta } = req.body;
    
    if (!actividad_planeada_id) {
      return res.status(400).json({ message: "ID de actividad planificada es requerido" });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO actividades_ejecutadas (actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by, razon, obstaculos, documentacion_adjunta) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by, razon, obstaculos, documentacion_adjunta]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating actividad ejecutada:', error);
    return res.status(500).json({ message: "Error al crear la actividad ejecutada" });
  }
};

export const updateActividadEjecutada = async (req, res) => {
  try {
    const { id } = req.params;
    const { actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by, razon, obstaculos, documentacion_adjunta } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "ID de actividad inválido" });
    }
    
    const { rows, rowCount } = await pool.query(
      `UPDATE actividades_ejecutadas SET actividad_planeada_id = $1, trimestre = $2, real_actualizado = $3, porcentaje_cumplimiento = $4, observaciones = $5, evidencia = $6, calificacion = $7, updated_by = $8, razon = $9, obstaculos = $10, documentacion_adjunta = $11 WHERE id = $12 RETURNING *`,
      [actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by, razon, obstaculos, documentacion_adjunta, parseInt(id)]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Actividad Ejecutada no encontrada" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Error updating actividad ejecutada:', error);
    return res.status(500).json({ message: "Error al actualizar la actividad ejecutada" });
  }
};

export const deleteActividadEjecutada = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "ID de actividad inválido" });
  }
  const { rowCount } = await pool.query('DELETE FROM actividades_ejecutadas WHERE id = $1', [parseInt(id)]);
  if (rowCount === 0) {
    return res.status(404).json({ message: "Actividad Ejecutada no encontrada" });
  }
  return res.sendStatus(204);
};
