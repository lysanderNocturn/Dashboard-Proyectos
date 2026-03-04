import { pool } from '../db.js';

export const getActividadesPlanificadas = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM actividades_planeadas');
    res.json(rows);
};

export const getActividadPlanificadaById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM actividades_planeadas WHERE id = $1', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Actividad Planificada not found" });
    }
    res.json(rows[0]);
};

export const createActividadPlanificada = async (req, res) => {
    try {
        const { proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones, created_by } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO actividades_planeadas (proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones, created_by]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al crear la actividad planificada" });
    }
};

export const updateActividadPlanificada = async (req, res) => {
    try {
        const { id } = req.params;
        const { proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones } = req.body;
        const { rows, rowCount } = await pool.query(
            `UPDATE actividades_planeadas SET proyecto_id = $1, descripcion = $2, ano = $3, meta_anual = $4, meta_trimestral1 = $5, meta_trimestral2 = $6, meta_trimestral3 = $7, meta_trimestral4 = $8, porcentaje_anual_esperado = $9, observaciones = $10 WHERE id = $11 RETURNING *`,
            [proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Actividad Planificada not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar la actividad planificada" });
    }
};

export const deleteActividadPlanificada = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM actividades_planeadas WHERE id = $1 RETURNING *', [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Actividad Planificada not found" });
    }
    return res.sendStatus(204);
};
