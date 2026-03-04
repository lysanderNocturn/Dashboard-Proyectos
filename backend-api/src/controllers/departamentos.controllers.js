import { pool } from '../db.js';

export const getDepartamentos = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM departamentos');
    res.json(rows);
};

export const getDepartamentoById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM departamentos WHERE id = $1', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Departamento not found" });
    }
    res.json(rows[0]);
};

export const createDepartamento = async (req, res) => {
    try {
        const { nombre, descripcion, unidad_administrativa_id } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO departamentos (nombre, descripcion, unidad_administrativa_id) VALUES ($1, $2, $3) RETURNING *',
            [nombre, descripcion, unidad_administrativa_id]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
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
        const { rows, rowCount } = await pool.query(
            'UPDATE departamentos SET nombre = $1, descripcion = $2, unidad_administrativa_id = $3 WHERE id = $4 RETURNING *',
            [nombre, descripcion, unidad_administrativa_id, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Departamento not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar el departamento" });
    }
};

export const deleteDepartamento = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM departamentos WHERE id = $1 RETURNING *', [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Departamento not found" });
    }
    return res.sendStatus(204);
};
