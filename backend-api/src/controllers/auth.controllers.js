import { pool } from '../db.js';

// Verificar credenciales de login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }
    
    // Buscar usuario por username
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    
    const user = rows[0];
    
    // Verificar contraseña (comparación simple, en producción usar bcrypt)
    // Por ahora aceptamos 'admin', '123456' o cualquier contraseña que coincida con el hash
    const isValidPassword = password === 'admin' || 
                           password === '123456' || 
                           password === user.password_hash ||
                           user.password_hash.includes('hashplaceholder');
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    
    // Generar token simple (en producción usar JWT)
    const token = Buffer.from(JSON.stringify({ 
      userId: user.id, 
      username: user.username,
      role_id: user.role_id 
    })).toString('base64');
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Verificar contraseña de un usuario (para confirmar cambios)
export const verifyPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }
    
    // Buscar usuario por ID
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const user = rows[0];
    
    // Verificar contraseña
    const isValidPassword = password === 'admin' || 
                           password === '123456' || 
                           password === user.password_hash ||
                           user.password_hash.includes('hashplaceholder');
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    
    res.json({ valid: true, message: 'Contraseña verificada correctamente' });
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Cambiar contraseña de un usuario
export const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }
    
    // Buscar usuario por ID
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const user = rows[0];
    
    // Verificar contraseña actual
    const isValidPassword = currentPassword === 'admin' || 
                           currentPassword === '123456' || 
                           currentPassword === user.password_hash ||
                           user.password_hash.includes('hashplaceholder');
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }
    
    // Actualizar contraseña (guardar como texto plano por simplicidad, en producción usar bcrypt)
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPassword, userId]);
    
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener información del usuario actual
export const getMe = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario requerido' });
    }
    
    const { rows } = await pool.query('SELECT id, username, email, role_id, created_at, updated_at FROM users WHERE id = $1', [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
