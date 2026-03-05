// Utility functions for database operations
import { pool } from '../db.js';

/**
 * Execute a query with error handling
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Query results
 */
export const executeQuery = async (query, params = [], options = {}) => {
  try {
    const { allowEmpty = false } = options;
    const result = await pool.query(query, params);
    
    if (!allowEmpty && result.rowCount === 0 && query.toUpperCase().includes('WHERE')) {
      return null;
    }
    
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

/**
 * Check if a record exists in a table
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<boolean>}
 */
export const recordExists = async (table, id) => {
  const result = await pool.query(
    `SELECT 1 FROM ${table} WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rowCount > 0;
};

/**
 * Get a single record by ID
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {Array} columns - Columns to select (default: all)
 * @returns {Promise<Object|null>}
 */
export const getById = async (table, id, columns = ['*']) => {
  const cols = columns.join(', ');
  const result = await pool.query(
    `SELECT ${cols} FROM ${table} WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Health check for database connection
 * @returns {Promise<Object>}
 */
export const healthCheck = async () => {
  const start = Date.now();
  await pool.query('SELECT 1');
  const responseTime = Date.now() - start;
  
  return {
    status: 'healthy',
    responseTime: `${responseTime}ms`,
    timestamp: new Date().toISOString()
  };
};

export default {
  executeQuery,
  recordExists,
  getById,
  healthCheck
};
