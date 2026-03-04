import { pool } from '../db.js';

export const getEjes = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM ejes');
    res.json(rows);
};

export const getEjeById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM ejes WHERE id = $1', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Eje not found" });
    }
    res.json(rows[0]);
};

export const createEje = async (req, res) => {
    try {
        const { nombre, descripcion, ano } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO ejes (nombre, descripcion, ano) VALUES ($1, $2, $3) RETURNING *',
            [nombre, descripcion, ano]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(409).json({ message: "El eje ya existe" });
        }
        return res.status(500).json({ message: "Error al crear el eje" });
    }
};

export const updateEje = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, ano } = req.body;
        const { rows, rowCount } = await pool.query(
            'UPDATE ejes SET nombre = $1, descripcion = $2, ano = $3 WHERE id = $4 RETURNING *',
            [nombre, descripcion, ano, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Eje not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar el eje" });
    }
};

export const deleteEje = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM ejes WHERE id = $1 RETURNING *', [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Eje not found" });
    }
    return res.sendStatus(204);
};
