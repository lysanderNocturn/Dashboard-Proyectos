import { pool } from "../db.js";

export const getProyectos = async (req, res) =>{
    const {rows} = await pool.query('SELECT * FROM proyectos');
    res.json(rows);
};

export const getProyectoById = async (req, res) =>{
    const {id} = req.params;
    const {rows} = await pool.query(`SELECT * FROM proyectos WHERE id = $1`, [id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: "Proyecto not found" });
    }
    res.json(rows[0]);
};

export const createProyecto = async (req, res) =>{
    try {
        const data = req.body;
        console.log(data);
        const rows = await pool.query(
            `INSERT INTO proyectos (nombre, descripcion, estado_actual, evaluacion) 
             VALUES ($1, $2, $3, $4) RETURNING *`, 
            [data.nombre, data.descripcion, data.estado_actual, data.evaluacion]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al crear el proyecto" });
    }
};

export const deleteProyecto = async (req, res) =>{
    const {id} = req.params;
    const {rows, rowCount} = await pool.query(`DELETE FROM proyectos WHERE id = $1 RETURNING *`, [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Proyecto not found" });
    }
    return res.sendStatus(204);
};

export const updateProyecto = async (req, res) =>{
    try {
        const {id} = req.params;
        const {nombre, descripcion, estado_actual, evaluacion} = req.body;
        const {rows, rowCount} = await pool.query(
            `UPDATE proyectos SET nombre = $1, descripcion = $2, estado_actual = $3, evaluacion = $4 WHERE id = $5 RETURNING *`, 
            [nombre, descripcion, estado_actual, evaluacion, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Proyecto not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar el proyecto" });
    }
};
