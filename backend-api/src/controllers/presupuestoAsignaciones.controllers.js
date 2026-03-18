import { pool } from '../db.js';

// Asignar presupuesto a un proyecto con descuento automático
export const asignarPresupuestoAProyecto = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { presupuesto_id, proyecto_id, monto_asignado, observaciones } = req.body;
        const asignado_por = req.user?.id;

        // Validar datos requeridos
        if (!presupuesto_id || !proyecto_id || !monto_asignado) {
            return res.status(400).json({ message: "Faltan datos requeridos" });
        }

        if (monto_asignado <= 0) {
            return res.status(400).json({ message: "El monto debe ser mayor a 0" });
        }

        // Verificar que el presupuesto existe y tiene saldo disponible
        const presupuestoResult = await client.query(
            'SELECT monto, monto_asignado FROM presupuestos WHERE id = $1',
            [presupuesto_id]
        );

        if (presupuestoResult.rows.length === 0) {
            return res.status(404).json({ message: "Presupuesto no encontrado" });
        }

        const presupuesto = presupuestoResult.rows[0];
        const monto_disponible = parseFloat(presupuesto.monto) - parseFloat(presupuesto.monto_asignado || 0);

        if (monto_asignado > monto_disponible) {
            return res.status(400).json({ 
                message: `Monto insuficiente. Disponible: $${monto_disponible.toFixed(2)}`
            });
        }

        // Verificar si ya existe una asignación para este proyecto
        const existingAsignacion = await client.query(
            'SELECT id, monto_asignado FROM presupuesto_asignaciones WHERE presupuesto_id = $1 AND proyecto_id = $2',
            [presupuesto_id, proyecto_id]
        );

        let asignacion;

        if (existingAsignacion.rows.length > 0) {
            // Actualizar asignación existente (ajustar diferencia)
            const diferencia = monto_asignado - existingAsignacion.rows[0].monto_asignado;
            
            if (diferencia > monto_disponible) {
                return res.status(400).json({ 
                    message: `Monto insuficiente para ajustar asignación. Disponible: $${monto_disponible.toFixed(2)}`
                });
            }

            await client.query(
                `UPDATE presupuesto_asignaciones 
                 SET monto_asignado = $1, observaciones = $2, asignado_por = $3 
                 WHERE id = $4`,
                [monto_asignado, observaciones, asignado_por, existingAsignacion.rows[0].id]
            );

            // Actualizar monto asignado en presupuesto
            await client.query(
                'UPDATE presupuestos SET monto_asignado = monto_asignado + $1 WHERE id = $2',
                [diferencia, presupuesto_id]
            );

            asignacion = { id: existingAsignacion.rows[0].id, action: 'updated', diferencia };
        } else {
            // Crear nueva asignación
            const result = await client.query(
                `INSERT INTO presupuesto_asignaciones 
                 (presupuesto_id, proyecto_id, monto_asignado, asignado_por, observaciones) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [presupuesto_id, proyecto_id, monto_asignado, asignado_por, observaciones]
            );

            // Actualizar monto asignado en presupuesto
            await client.query(
                'UPDATE presupuestos SET monto_asignado = monto_asignado + $1 WHERE id = $2',
                [monto_asignado, presupuesto_id]
            );

            asignacion = { ...result.rows[0], action: 'created' };
        }

        // Actualizar el proyecto con el monto asignado y estado presupuestal
        await client.query(
            `UPDATE proyectos 
             SET presupuesto_id = $1, monto_asignado = $2, estado_presupuestal = 'asignado' 
             WHERE id = $3`,
            [presupuesto_id, monto_asignado, proyecto_id]
        );

        await client.query('COMMIT');

        // Obtener datos actualizados
        const updatedPresupuesto = await pool.query(
            'SELECT * FROM presupuestos WHERE id = $1',
            [presupuesto_id]
        );

        res.status(201).json({
            message: asignacion.action === 'created' ? 'Presupuesto asignado correctamente' : 'Asignación actualizada correctamente',
            asignacion,
            presupuesto: updatedPresupuesto.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al asignar presupuesto:', error);
        res.status(500).json({ message: "Error al asignar presupuesto al proyecto" });
    } finally {
        client.release();
    }
};

// Obtener asignaciones de un presupuesto
export const getAsignacionesByPresupuesto = async (req, res) => {
    try {
        const { presupuesto_id } = req.params;

        const { rows } = await pool.query(
            `SELECT pa.*, p.nombre as proyecto_nombre, p.estado_actual
             FROM presupuesto_asignaciones pa
             JOIN proyectos p ON pa.proyecto_id = p.id
             WHERE pa.presupuesto_id = $1
             ORDER BY pa.fecha_asignacion DESC`,
            [presupuesto_id]
        );

        // Obtener totales del presupuesto
        const presupuesto = await pool.query(
            'SELECT monto, monto_asignado FROM presupuestos WHERE id = $1',
            [presupuesto_id]
        );

        res.json({
            asignaciones: rows,
            presupuesto: presupuesto.rows[0] || {},
            monto_disponible: presupuesto.rows[0] 
                ? parseFloat(presupuesto.rows[0].monto) - parseFloat(presupuesto.rows[0].monto_asignado || 0)
                : 0
        });

    } catch (error) {
        console.error('Error al obtener asignaciones:', error);
        res.status(500).json({ message: "Error al obtener las asignaciones" });
    }
};

// Obtener asignación de un proyecto
export const getAsignacionByProyecto = async (req, res) => {
    try {
        const { proyecto_id } = req.params;

        const { rows } = await pool.query(
            `SELECT pa.*, pr.monto as presupuesto_total, pr.monto_asignado as presupuesto_asignado
             FROM presupuesto_asignaciones pa
             JOIN presupuestos pr ON pa.presupuesto_id = pr.id
             WHERE pa.proyecto_id = $1`,
            [proyecto_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "No hay asignación de presupuesto para este proyecto" });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error('Error al obtener asignación:', error);
        res.status(500).json({ message: "Error al obtener la asignación" });
    }
};

// Eliminar asignación de presupuesto (revertir descuento)
export const eliminarAsignacion = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;

        // Obtener la asignación
        const asignacionResult = await client.query(
            'SELECT * FROM presupuesto_asignaciones WHERE id = $1',
            [id]
        );

        if (asignacionResult.rows.length === 0) {
            return res.status(404).json({ message: "Asignación no encontrada" });
        }

        const asignacion = asignacionResult.rows[0];

        // Revertir monto en presupuesto
        await client.query(
            'UPDATE presupuestos SET monto_asignado = monto_asignado - $1 WHERE id = $2',
            [asignacion.monto_asignado, asignacion.presupuesto_id]
        );

        // Actualizar proyecto
        await client.query(
            `UPDATE proyectos 
             SET presupuesto_id = NULL, monto_asignado = 0, estado_presupuestal = 'sin_asignar' 
             WHERE id = $1`,
            [asignacion.proyecto_id]
        );

        // Eliminar asignación
        await client.query('DELETE FROM presupuesto_asignaciones WHERE id = $1', [id]);

        await client.query('COMMIT');

        res.json({ message: "Asignación eliminada correctamente" });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar asignación:', error);
        res.status(500).json({ message: "Error al eliminar la asignación" });
    } finally {
        client.release();
    }
};
