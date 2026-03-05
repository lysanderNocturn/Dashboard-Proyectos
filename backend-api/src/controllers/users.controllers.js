import { pool } from '../db.js';

// Optimize: Select only needed columns instead of SELECT *
const USER_COLUMNS = 'id, username, email, role_id, created_at, updated_at';
const PUBLIC_USER_COLUMNS = 'id, username, email, role_id';

export const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_USER_COLUMNS} FROM users ORDER BY username ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    
    const { rows } = await pool.query(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
      [parseInt(id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

export const createUser = async (req, res) => {
  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.username || !data.email || !data.password_hash) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ message: "Formato de email inválido" });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, created_at`,
      [data.username.trim(), data.email.trim().toLowerCase(), data.password_hash]
    );
    
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error?.code === '23505') {
      const field = error.constraint?.includes('username') ? 'usuario' : 'email';
      return res.status(409).json({ message: `El ${field} ya existe` });
    }
    return res.status(500).json({ message: "Error al crear usuario" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    
    const { rowCount } = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [parseInt(id)]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role_id } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    
    // Validate required fields
    if (!username?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Usuario y email son requeridos" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Formato de email inválido" });
    }
    
    const { rows, rowCount } = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, role_id = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING ${USER_COLUMNS}`,
      [username.trim(), email.trim().toLowerCase(), role_id || null, parseInt(id)]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    return res.json(rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error?.code === '23505') {
      const field = error.constraint?.includes('username') ? 'usuario' : 'email';
      return res.status(409).json({ message: `El ${field} ya está en uso` });
    }
    return res.status(500).json({ message: "Error al actualizar usuario" });
  }
};
