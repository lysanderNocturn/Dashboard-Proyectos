-- Migration to add new fields to proyectos table
-- NOTE: These columns may already exist if db.sql was already updated
-- Using IF NOT EXISTS to prevent errors on fresh installs

-- FIX: Change asignado_a to reference users instead of presupuestos (was incorrectly defined)
ALTER TABLE proyectos
DROP CONSTRAINT IF EXISTS proyectos_asignado_a_fkey,
ADD CONSTRAINT proyectos_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES users(id) ON DELETE SET NULL;

-- Add new columns to proyectos table (only if they don't exist)
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS objetivo TEXT,
ADD COLUMN IF NOT EXISTS meta_total DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS duracion_anos INTEGER CHECK (duracion_anos >= 1 AND duracion_anos <= 3) DEFAULT 1,
ADD COLUMN IF NOT EXISTS medida_tipo VARCHAR(20) CHECK (medida_tipo IN ('cantidad', 'porcentaje')) DEFAULT 'cantidad',
ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
ADD COLUMN IF NOT EXISTS fecha_fin DATE;

-- Create table for project trimester distribution
CREATE TABLE IF NOT EXISTS proyectos_trimestres (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE CASCADE,
    ano INTEGER NOT NULL CHECK (ano >= 1 AND ano <= 3),
    trimestre INTEGER NOT NULL CHECK (trimestre >= 1 AND trimestre <= 4),
    meta DECIMAL(15, 2) NOT NULL DEFAULT 0,
    porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (porcentaje >= 0 AND porcentaje <= 100),
    UNIQUE(proyecto_id, ano, trimestre)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_proyectos_trimestres_proyecto ON proyectos_trimestres(proyecto_id);

-- Additional indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado_actual);
CREATE INDEX IF NOT EXISTS idx_proyectos_presupuesto ON proyectos(presupuesto_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_unidad ON proyectos(unidad_administrativa_id);

-- Add unidad_administrativa_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS unidad_administrativa_id INTEGER REFERENCES unidad_administrativa(id) ON DELETE SET NULL;

-- Update actividades_planeadas meta_trimestral columns to have DEFAULT 0
-- This ensures new activities start with 0 as the objective for each quarter
-- so users can define them incrementally as the project progresses
ALTER TABLE actividades_planeadas 
ALTER COLUMN meta_trimestral1 SET DEFAULT 0,
ALTER COLUMN meta_trimestral2 SET DEFAULT 0,
ALTER COLUMN meta_trimestral3 SET DEFAULT 0,
ALTER COLUMN meta_trimestral4 SET DEFAULT 0;

-- Update actividades_planeadas to reference proyectos_trimestres if needed
-- (keeping existing structure for backwards compatibility)

-- Add comments for documentation
COMMENT ON COLUMN proyectos.objetivo IS 'Objetivo general del proyecto';
COMMENT ON COLUMN proyectos.meta_total IS 'Meta total a alcanzar (cantidad o porcentaje)';
COMMENT ON COLUMN proyectos.duracion_anos IS 'Duracion del proyecto en anos (maximo 3)';
COMMENT ON COLUMN proyectos.medida_tipo IS 'Tipo de medida: cantidad o porcentaje';
COMMENT ON TABLE proyectos_trimestres IS 'Distribucion de metas por ano y trimestre';
