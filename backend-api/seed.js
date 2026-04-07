import { pool } from './src/db.js';
import fs from 'fs';

const sql = fs.readFileSync('database/seed_data.sql', 'utf8');

pool.query(sql).then(() => {
  console.log('Datos de semilla insertados correctamente');
}).catch(console.error).finally(() => {
  pool.end();
});