import { pool } from '../db.js';

export const getRoles = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM roles');
    res.json(rows);
};

export const getRolById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Rol not found" });
    }
    res.json(rows[0]);
};

export const createRol = async (req, res) => {
    try {
        const { name, description } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(409).json({ message: "El rol ya existe" });
        }
        return res.status(500).json({ message: "Error al crear el rol" });
    }
};

export const updateRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const { rows, rowCount } = await pool.query(
            'UPDATE roles SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Rol not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar el rol" });
    }
};

export const deleteRol = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Rol not found" });
    }
    return res.sendStatus(204);
};
