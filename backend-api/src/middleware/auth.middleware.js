import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { JWT_SECRET } from '../config.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('[AUTH] No token provided, path:', req.path);
    return res.status(401).json({ message: 'Token de autenticación requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] Token decoded, userId:', decoded.userId);
    
    const { rows } = await pool.query(
      'SELECT id, username, email, role_id, unidad_administrativa_id FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (rows.length === 0) {
      console.log('[AUTH] User not found in DB');
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.log('[AUTH] Token error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(403).json({ message: 'Token inválido' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    if (!roles.includes(req.user.role_id)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    next();
  };
};
