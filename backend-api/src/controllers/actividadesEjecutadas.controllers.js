import { pool } from '../db.js';

export const getActividadesEjecutadas = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM actividades_ejecutadas');
    res.json(rows);
};

export const getActividadEjecutadaById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM actividades_ejecutadas WHERE id = $1', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Actividad Ejecutada not found" });
    }
    res.json(rows[0]);
};

export const createActividadEjecutada = async (req, res) => {
    try {
        const { actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO actividades_ejecutadas (actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al crear la actividad ejecutada" });
    }
};

export const updateActividadEjecutada = async (req, res) => {
    try {
        const { id } = req.params;
        const { actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by } = req.body;
        const { rows, rowCount } = await pool.query(
            `UPDATE actividades_ejecutadas SET actividad_planeada_id = $1, trimestre = $2, real_actualizado = $3, porcentaje_cumplimiento = $4, observaciones = $5, evidencia = $6, calificacion = $7, updated_by = $8 WHERE id = $9 RETURNING *`,
            [actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Actividad Ejecutada not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar la actividad ejecutada" });
    }
};

export const deleteActividadEjecutada = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM actividades_ejecutadas WHERE id = $1 RETURNING *', [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Actividad Ejecutada not found" });
    }
    return res.sendStatus(204);
};
