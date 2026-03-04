import { pool } from '../db.js';

export const getMedidas = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM medidas');
    res.json(rows);
};

export const getMedidaById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM medidas WHERE id = $1', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Medida not found" });
    }
    res.json(rows[0]);
};

export const createMedida = async (req, res) => {
    try {
        const { description } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO medidas (description) VALUES ($1) RETURNING *',
            [description]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al crear la medida" });
    }
};

export const updateMedida = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const { rows, rowCount } = await pool.query(
            'UPDATE medidas SET description = $1 WHERE id = $2 RETURNING *',
            [description, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Medida not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar la medida" });
    }
};

export const deleteMedida = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM medidas WHERE id = $1 RETURNING *', [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Medida not found" });
    }
    return res.sendStatus(204);
};
