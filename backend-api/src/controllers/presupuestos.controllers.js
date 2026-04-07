import { pool } from '../db.js';

export const getPresupuestos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM presupuestos');
    const total = parseInt(countResult.rows[0].count);

    const { rows } = await pool.query(
      'SELECT * FROM presupuestos ORDER BY ano DESC, created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error getting presupuestos:', error);
    res.status(500).json({ message: "Error al obtener presupuestos" });
  }
};

export const getPresupuestoById = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "ID de presupuesto inválido" });
  }
  const { rows } = await pool.query('SELECT * FROM presupuestos WHERE id = $1', [parseInt(id)]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "Presupuesto no encontrado" });
  }
  res.json(rows[0]);
};

export const createPresupuesto = async (req, res) => {
    try {
        const { monto, ano, unidad_administrativa_id, departamento_id, assigned_by } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO presupuestos (monto, ano, unidad_administrativa_id, departamento_id, assigned_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [monto, ano, unidad_administrativa_id, departamento_id, assigned_by]
        );
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al crear el presupuesto" });
    }
};

export const updatePresupuesto = async (req, res) => {
    try {
        const { id } = req.params;
        const { monto, ano, unidad_administrativa_id, departamento_id, assigned_by } = req.body;
        const { rows, rowCount } = await pool.query(
            'UPDATE presupuestos SET monto = $1, ano = $2, unidad_administrativa_id = $3, departamento_id = $4, assigned_by = $5 WHERE id = $6 RETURNING *',
            [monto, ano, unidad_administrativa_id, departamento_id, assigned_by, id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: "Presupuesto not found" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar el presupuesto" });
    }
};

export const deletePresupuesto = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM presupuestos WHERE id = $1 RETURNING *', [id]);
    if (rowCount === 0) {
        return res.status(404).json({ message: "Presupuesto not found" });
    }
    return res.sendStatus(204);
};
