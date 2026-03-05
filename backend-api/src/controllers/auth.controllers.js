import { pool } from '../db.js';
import bcrypt from 'bcrypt';

const generateToken = (user) => {
  return Buffer.from(JSON.stringify({
    userId: user.id,
    username: user.username,
    role_id: user.role_id,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  })).toString('base64');
};

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role_id: user.role_id
});

// Helper function to verify password with bcrypt
// Includes fallback for legacy plain-text passwords (migration path)
const checkPassword = async (inputPassword, storedPassword) => {
  try {
    // Try bcrypt comparison first
    return await bcrypt.compare(inputPassword, storedPassword);
  } catch (error) {
    // Fallback for legacy plain-text passwords during migration period
    console.warn('Password comparison fallback used - consider migrating to bcrypt');
    return inputPassword === storedPassword;
  }
};

// Login endpoint
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }
    
    // Find user
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username.trim()]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    
    const user = rows[0];
    
    // Verify password
    const isValidPassword = await checkPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Verify password endpoint
export const verifyPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ message: 'Datos requeridos' });
    }
    
    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [parseInt(userId)]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (!await checkPassword(password, rows[0].password_hash)) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    
    res.json({ valid: true, message: 'Contraseña verificada' });
  } catch (error) {
    console.error('Verify password error:', error);
    res.status(500).json({ message: 'Error al verificar contraseña' });
  }
};

// Change password endpoint
export const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Get current password
    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [parseInt(userId)]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verify current password
    if (!await checkPassword(currentPassword, rows[0].password_hash)) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }
    
    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, parseInt(userId)]
    );
    
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
};

// Get current user info
export const getMe = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario requerido' });
    }
    
    const { rows } = await pool.query(
      'SELECT id, username, email, role_id, created_at, updated_at FROM users WHERE id = $1',
      [parseInt(userId)]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};
