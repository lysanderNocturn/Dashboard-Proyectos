import { pool } from '../db.js';

// Obtener todos los reportes (con filtros)
export const getReportes = async (req, res) => {
    try {
        const { tipo, ano, trimestre, proyecto_id, unidad_administrativa_id, estado } = req.query;
        
        // Construir query dinámica
        let query = `
            SELECT r.*, 
                   p.nombre as proyecto_nombre,
                   u.nombre as unidad_nombre,
                   CONCAT(creator.username, ' ', COALESCE(creator.email, '')) as creador_nombre,
                   CONCAT(updater.username, ' ', COALESCE(updater.email, '')) as actualizador_nombre
            FROM reportes r
            JOIN proyectos p ON r.proyecto_id = p.id
            LEFT JOIN unidad_administrativa u ON r.unidad_administrativa_id = u.id
            LEFT JOIN users creator ON r.created_by = creator.id
            LEFT JOIN users updater ON r.updated_by = updater.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        if (tipo) {
            query += ` AND r.tipo_reporte = $${paramCount}`;
            params.push(tipo);
            paramCount++;
        }

        if (ano) {
            query += ` AND r.ano = $${paramCount}`;
            params.push(parseInt(ano));
            paramCount++;
        }

        if (trimestre) {
            query += ` AND r.trimestre = $${paramCount}`;
            params.push(parseInt(trimestre));
            paramCount++;
        }

        if (proyecto_id) {
            query += ` AND r.proyecto_id = $${paramCount}`;
            params.push(parseInt(proyecto_id));
            paramCount++;
        }

        if (unidad_administrativa_id) {
            query += ` AND r.unidad_administrativa_id = $${paramCount}`;
            params.push(parseInt(unidad_administrativa_id));
            paramCount++;
        }

        if (estado) {
            query += ` AND r.estado = $${paramCount}`;
            params.push(estado);
            paramCount++;
        }

        query += ` ORDER BY r.ano DESC, r.trimestre DESC, r.created_at DESC`;

        const { rows } = await pool.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error('Error al obtener reportes:', error);
        res.status(500).json({ message: "Error al obtener los reportes" });
    }
};

// Obtener reporte por ID
export const getReporteById = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT r.*, 
                    p.nombre as proyecto_nombre,
                    u.nombre as unidad_nombre
             FROM reportes r
             JOIN proyectos p ON r.proyecto_id = p.id
             LEFT JOIN unidad_administrativa u ON r.unidad_administrativa_id = u.id
             WHERE r.id = $1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Reporte no encontrado" });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener reporte:', error);
        res.status(500).json({ message: "Error al obtener el reporte" });
    }
};

// Obtener reportes por proyecto
export const getReportesByProyecto = async (req, res) => {
    try {
        const { proyecto_id } = req.params;
        const { tipo } = req.query;

        let query = `
            SELECT r.*, 
                   CONCAT(creator.username, ' ', COALESCE(creator.email, '')) as creador_nombre
            FROM reportes r
            LEFT JOIN users creator ON r.created_by = creator.id
            WHERE r.proyecto_id = $1
        `;

        const params = [proyecto_id];

        if (tipo) {
            query += ` AND r.tipo_reporte = $2`;
            params.push(tipo);
        }

        query += ` ORDER BY r.ano DESC, r.trimestre DESC`;

        const { rows } = await pool.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error('Error al obtener reportes del proyecto:', error);
        res.status(500).json({ message: "Error al obtener los reportes" });
    }
};

// Crear reporte (solo administradores de unidad pueden crear)
export const createReporte = async (req, res) => {
    try {
        const { 
            proyecto_id, 
            tipo_reporte, 
            ano, 
            trimestre, 
            titulo, 
            contenido, 
            cumplimiento_meta, 
            observaciones, 
            evidencia,
            unidad_administrativa_id 
        } = req.body;

        // Validaciones
        if (!proyecto_id || !tipo_reporte || !ano || !titulo) {
            return res.status(400).json({ message: "Faltan datos requeridos" });
        }

        if (tipo_reporte === 'trimestral' && (!trimestre || trimestre < 1 || trimestre > 4)) {
            return res.status(400).json({ message: "Trimestre inválido para reporte trimestral" });
        }

        // Obtener datos del proyecto para verificar unidad administrativa
        const proyectoResult = await pool.query(
            'SELECT unidad_administrativa_id, departamento_id FROM proyectos WHERE id = $1',
            [proyecto_id]
        );

        if (proyectoResult.rows.length === 0) {
            return res.status(404).json({ message: "Proyecto no encontrado" });
        }

        const proyecto = proyectoResult.rows[0];
        const ua_id = unidad_administrativa_id || proyecto.unidad_administrativa_id;

        // Verificar si el usuario tiene permisos (es admin de unidad o admin global)
        // Por ahora permitimos crear si viene en el request o usar la del proyecto
        const created_by = req.user?.id;

        const { rows } = await pool.query(
            `INSERT INTO reportes 
             (proyecto_id, tipo_reporte, ano, trimestre, titulo, contenido, cumplimiento_meta, 
              observaciones, evidencia, unidad_administrativa_id, created_by, estado) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'borrador') 
             RETURNING *`,
            [
                proyecto_id, tipo_reporte, ano, trimestre || null, titulo, 
                contenido, cumplimiento_meta || 0, observaciones, evidencia, 
                ua_id, created_by
            ]
        );

        res.status(201).json(rows[0]);

    } catch (error) {
        console.error('Error al crear reporte:', error);
        if (error?.code === '23505') {
            return res.status(409).json({ message: "Ya existe un reporte para este proyecto, año y trimestre" });
        }
        res.status(500).json({ message: "Error al crear el reporte" });
    }
};

// Actualizar reporte (solo el creador o admin de unidad pueden modificar)
export const updateReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            titulo, 
            contenido, 
            cumplimiento_meta, 
            observaciones, 
            evidencia, 
            estado 
        } = req.body;

        const updated_by = req.user?.id;

        // Verificar que el reporte existe
        const existingReporte = await pool.query(
            'SELECT * FROM reportes WHERE id = $1',
            [id]
        );

        if (existingReporte.rows.length === 0) {
            return res.status(404).json({ message: "Reporte no encontrado" });
        }

        const { rows } = await pool.query(
            `UPDATE reportes 
             SET titulo = COALESCE($1, titulo),
                 contenido = COALESCE($2, contenido),
                 cumplimiento_meta = COALESCE($3, cumplimiento_meta),
                 observaciones = COALESCE($4, observaciones),
                 evidencia = COALESCE($5, evidencia),
                 estado = COALESCE($6, estado),
                 updated_by = $7,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $8
             RETURNING *`,
            [titulo, contenido, cumplimiento_meta, observaciones, evidencia, estado, updated_by, id]
        );

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al actualizar reporte:', error);
        res.status(500).json({ message: "Error al actualizar el reporte" });
    }
};

// Eliminar reporte
export const deleteReporte = async (req, res) => {
    try {
        const { id } = req.params;

        const { rowCount } = await pool.query(
            'DELETE FROM reportes WHERE id = $1',
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ message: "Reporte no encontrado" });
        }

        res.sendStatus(204);

    } catch (error) {
        console.error('Error al eliminar reporte:', error);
        res.status(500).json({ message: "Error al eliminar el reporte" });
    }
};

// Obtener reportes por unidad administrativa
export const getReportesByUnidad = async (req, res) => {
    try {
        const { unidad_id } = req.params;
        const { tipo, ano } = req.query;

        let query = `
            SELECT r.*, p.nombre as proyecto_nombre
            FROM reportes r
            JOIN proyectos p ON r.proyecto_id = p.id
            WHERE r.unidad_administrativa_id = $1
        `;

        const params = [unidad_id];

        if (tipo) {
            query += ` AND r.tipo_reporte = $2`;
            params.push(tipo);
        }

        if (ano) {
            query += tipo ? ` AND r.ano = $3` : ` AND r.ano = $2`;
            params.push(parseInt(ano));
        }

        query += ` ORDER BY r.ano DESC, r.trimestre DESC`;

        const { rows } = await pool.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error('Error al obtener reportes de unidad:', error);
        res.status(500).json({ message: "Error al obtener los reportes" });
    }
};
