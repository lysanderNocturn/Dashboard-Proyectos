-- Script para actualizar contraseñas de usuarios
-- Ejecutar en la base de datos nodepg

-- Actualizar todas las contraseñas a "admin" (hash bcrypt válido)
UPDATE users 
SET password_hash = '$2b$10$BM4OHXmmEYTGhDaWkpaAT.Jc6yD/pHjfGhaPlSPjFOFRBDLDS6nsK';

-- Verificar que se actualizaron
SELECT id, username, email, role_id FROM users;
