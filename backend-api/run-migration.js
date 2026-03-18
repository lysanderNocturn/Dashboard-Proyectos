import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'dirplan34',
  database: 'nodepg',
  port: 5000
});

async function runMigration() {
  try {
    console.log('Leyendo archivo de migración...');
    const sql = readFileSync(join(__dirname, 'database/migration_v3.sql'), 'utf-8');
    
    console.log('Ejecutando migración...');
    await pool.query(sql);
    
    console.log('¡Migración completada exitosamente!');
  } catch (error) {
    console.error('Error al ejecutar migración:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
