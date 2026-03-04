import { pool } from '../db.js';

export const getUsers = async (req, res) =>{
    const {rows} = await pool.query('SELECT * FROM users');
    res.json(rows);
};

export const getUserById = async (req, res) =>{
    const {id} = req.params;
    const {rows} = await pool.query(`SELECT * FROM users WHERE id = $1`, [id])

    if (rows.length === 0){
        return res.status(404).json({message: "usuario no encontrado"});
    }
    res.json(rows);
}; 

export const createUser = async (req, res) =>{
    try {
    const data = req.body;
    console.log(data);
    const rows = await pool.query(`INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)`, [data.username, data.email, data.password_hash]);
    return res.send(rows);
    } catch (error) {
        console.error(error); 
        if (error?.code === '23505') {
            return res.status(409).json({ message: "El usuario ya existe" });
        }
        return res.status(500).json({message: "Error al crear el usuario"});
    }
};

export const deleteUser = async (req, res) =>{
    const {id} = req.params
    const {rows, rowCount} = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
    console.log({rows});
    if (rowCount === 0){
        return res.status(404).json({message: "usuario no encontrado"});
    }
    return res.sendStatus(204);
};

export const updateUser = async (req, res) =>{
    try {
    const {id} = req.params
    const {username, email, role_id} = req.body;
    const {rows, rowCount} = await pool.query(
        `UPDATE users SET username = $1, email = $2, role_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`, 
        [username, email, role_id || null, id]
    );
    if (rowCount === 0){
        return res.status(404).json({message: "usuario no encontrado"});
    }
    return res.send(rows[0]);
} catch (error) {
    console.error(error);
    return res.status(509).json({message: "ya existe un usuario con ese email"});
}
};