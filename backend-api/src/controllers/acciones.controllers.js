import { pool } from '../db.js';

export const getAcciones = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM acciones');
    res.json(rows);
};

export const getAccionById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM acciones WHERE id = $1', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Accion not found" });
    }
    res.json(rows[0]);
};

export const createAccion = async (req, res) => {
    try {
        const { description } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO acciones (description) VALUES ($1) RETURNING *',
            [description]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al crear la accion" });
    }
};

export const updateAccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const { rows, rowCount } = await pool.query(
            'UPDATE acciones SET description = $1 WHERE id = $2 RETURNING *',
            [description, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Accion not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar la accion" });
    }
};

export const deleteAccion = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM acciones WHERE id = $1 RETURNING *', [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Accion not found" });
    }
    return res.sendStatus(204);
};
