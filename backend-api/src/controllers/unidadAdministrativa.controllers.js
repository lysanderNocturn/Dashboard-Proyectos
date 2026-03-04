import { pool } from '../db.js';

export const getUnidadAdministrativas = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM unidad_administrativa');
    res.json(rows);
};

export const getUnidadAdministrativaById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM unidad_administrativa WHERE id = $1', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Unidad Administrativa not found" });
    }
    res.json(rows[0]);
};

export const createUnidadAdministrativa = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO unidad_administrativa (nombre, descripcion) VALUES ($1, $2) RETURNING *',
            [nombre, descripcion]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(409).json({ message: "La unidad administrativa ya existe" });
        }
        return res.status(500).json({ message: "Error al crear la unidad administrativa" });
    }
};

export const updateUnidadAdministrativa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        const { rows, rowCount } = await pool.query(
            'UPDATE unidad_administrativa SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
            [nombre, descripcion, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Unidad Administrativa not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar la unidad administrativa" });
    }
};

export const deleteUnidadAdministrativa = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM unidad_administrativa WHERE id = $1 RETURNING *', [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Unidad Administrativa not found" });
    }
    return res.sendStatus(204);
};
