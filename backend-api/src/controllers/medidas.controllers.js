import { pool } from '../db.js';

export const getMedidas = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM medidas ORDER BY description ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error getting medidas:', error);
    res.status(500).json({ message: "Error al obtener medidas" });
  }
};

export const getMedidaById = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "ID de medida inválido" });
  }
  const { rows } = await pool.query('SELECT * FROM medidas WHERE id = $1', [parseInt(id)]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "Medida no encontrada" });
  }
  res.json(rows[0]);
};

export const createMedida = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description?.trim()) {
      return res.status(400).json({ message: "La descripción es requerida" });
    }
    const { rows } = await pool.query(
      'INSERT INTO medidas (description) VALUES ($1) RETURNING *',
      [description.trim()]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating medida:', error);
    return res.status(500).json({ message: "Error al crear la medida" });
  }
};

export const updateMedida = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "ID de medida inválido" });
    }
    const { rows, rowCount } = await pool.query(
      'UPDATE medidas SET description = $1 WHERE id = $2 RETURNING *',
      [description, parseInt(id)]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Medida no encontrada" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Error updating medida:', error);
    return res.status(500).json({ message: "Error al actualizar la medida" });
  }
};

export const deleteMedida = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "ID de medida inválido" });
  }
  const { rowCount } = await pool.query('DELETE FROM medidas WHERE id = $1', [parseInt(id)]);
  if (rowCount === 0) {
    return res.status(404).json({ message: "Medida no encontrada" });
  }
  return res.sendStatus(204);
};
