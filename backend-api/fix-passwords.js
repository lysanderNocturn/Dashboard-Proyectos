// Script para actualizar contraseñas en la base de datos
// Ejecutar: node fix-passwords.js

import { pool } from './src/db.js';
import bcrypt from 'bcrypt';

async function updatePasswords() {
  try {
    const hashedPassword = await bcrypt.hash('admin', 10);
    console.log('Hash generado:', hashedPassword);
    
    // Actualizar todos los usuarios
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 RETURNING id, username, email',
      [hashedPassword]
    );
    
    console.log('Usuarios actualizados:', result.rowCount);
    result.rows.forEach(user => {
      console.log(`- ${user.username} (${user.email})`);
    });
    
    console.log('\n¡Contraseña actualizada exitosamente!');
    console.log('Credenciales: admin / admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updatePasswords();
