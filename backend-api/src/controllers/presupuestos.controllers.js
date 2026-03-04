import { pool } from '../db.js';

export const getPresupuestos = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM presupuestos');
    res.json(rows);
};

export const getPresupuestoById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM presupuestos WHERE id = $1', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Presupuesto not found" });
    }
    res.json(rows[0]);
};

export const createPresupuesto = async (req, res) => {
    try {
        const { monto, ano, unidad_administrativa_id, departamento_id, assigned_by } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO presupuestos (monto, ano, unidad_administrativa_id, departamento_id, assigned_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [monto, ano, unidad_administrativa_id, departamento_id, assigned_by]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al crear el presupuesto" });
    }
};

export const updatePresupuesto = async (req, res) => {
    try {
        const { id } = req.params;
        const { monto, ano, unidad_administrativa_id, departamento_id, assigned_by } = req.body;
        const { rows, rowCount } = await pool.query(
            'UPDATE presupuestos SET monto = $1, ano = $2, unidad_administrativa_id = $3, departamento_id = $4, assigned_by = $5 WHERE id = $6 RETURNING *',
            [monto, ano, unidad_administrativa_id, departamento_id, assigned_by, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Presupuesto not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar el presupuesto" });
    }
};

export const deletePresupuesto = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM presupuestos WHERE id = $1 RETURNING *', [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Presupuesto not found" });
    }
    return res.sendStatus(204);
};
