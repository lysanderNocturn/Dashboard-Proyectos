-- Migration v3: Sistema de asignaciones de presupuesto y reportes
-- Para el municipio de Rincón de Romos

-- 1. Agregar columna para identificar si un rol es de unidad administrativa específica
ALTER TABLE roles 
ADD COLUMN IF NOT EXISTS es_rol_unidad BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nivel INTEGER DEFAULT 0;

-- Actualizar roles existentes
UPDATE roles SET nivel = 1 WHERE id = 1; -- Administrador (global)
UPDATE roles SET nivel = 2 WHERE id = 2; -- Director
UPDATE roles SET nivel = 3 WHERE id = 3; -- Coordinador
UPDATE roles SET nivel = 4 WHERE id = 4; -- Analista
UPDATE roles SET nivel = 5 WHERE id = 5; -- Auditor

-- 2. Crear tabla de asignaciones de presupuesto a proyectos
-- Esta tabla registra cuánto dinero se ha asignado de un presupuesto a cada proyecto
CREATE TABLE IF NOT EXISTS presupuesto_asignaciones (
    id SERIAL PRIMARY KEY,
    presupuesto_id INTEGER NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
    proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    monto_asignado DECIMAL(15, 2) NOT NULL CHECK (monto_asignado > 0),
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INTEGER REFERENCES users(id) ON DELETE SET NULL,
    observaciones TEXT,
    UNIQUE(presupuesto_id, proyecto_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_presupuesto_asignaciones_presupuesto ON presupuesto_asignaciones(presupuesto_id);
CREATE INDEX IF NOT EXISTS idx_presupuesto_asignaciones_proyecto ON presupuesto_asignaciones(proyecto_id);

-- 3. Agregar columnas a presupuestos para control de saldo
-- Nota: No usamos GENERATED COLUMN por compatibilidad, calculamos monto_disponible en el código
ALTER TABLE presupuestos 
ADD COLUMN IF NOT EXISTS monto_asignado DECIMAL(15, 2) DEFAULT 0;

-- 4. Crear tabla de reportes trimestrales y anuales
CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    tipo_reporte VARCHAR(20) NOT NULL CHECK (tipo_reporte IN ('trimestral', 'anual')),
    ano INTEGER NOT NULL CHECK (ano >= 2020),
    trimestre INTEGER CHECK (trimestre >= 1 AND trimestre <= 4),
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT,
    cumplimiento_meta DECIMAL(5, 2) CHECK (cumplimiento_meta >= 0 AND cumplimiento_meta <= 100),
    observaciones TEXT,
    evidencia TEXT,
    estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviado', 'aprobado', 'rechazado')),
    unidad_administrativa_id INTEGER REFERENCES unidad_administrativa(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proyecto_id, tipo_reporte, ano, trimestre)
);

-- Índices para reportes
CREATE INDEX IF NOT EXISTS idx_reportes_proyecto ON reportes(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON reportes(tipo_reporte);
CREATE INDEX IF NOT EXISTS idx_reportes_unidad ON reportes(unidad_administrativa_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);

-- 5. Agregar columna de rol de unidad administrativa a users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS es_admin_unidad BOOLEAN DEFAULT FALSE;

-- 6. Agregar columnas adicionales a proyectos para control de finanzas
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS monto_asignado DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estado_presupuestal VARCHAR(50) DEFAULT 'sin_asignar' CHECK (estado_presupuestal IN ('sin_asignar', 'asignado', 'ejecutado', 'cancelado'));

-- 7. Agregar columna para identificar si finanzas creó el proyecto
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS creado_por_finanzas BOOLEAN DEFAULT FALSE;

-- 8. Agregar columna para año del presupuesto
ALTER TABLE presupuestos
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'activo' CHECK (estado IN ('activo', 'ejecutado', 'cerrado'));

-- Comentarios para documentación
COMMENT ON TABLE presupuesto_asignaciones IS 'Asignaciones de presupuesto a proyectos con descuento automático';
COMMENT ON TABLE reportes IS 'Reportes trimestrales y anuales de proyectos';
COMMENT ON COLUMN presupuesto_asignaciones.monto_asignado IS 'Monto asignado del presupuesto al proyecto';
COMMENT ON COLUMN reportes.tipo_reporte IS 'Tipo de reporte: trimestral o anual';
COMMENT ON COLUMN reportes.estado IS 'Estado del reporte: borrador, enviado, aprobado, rechazado';
