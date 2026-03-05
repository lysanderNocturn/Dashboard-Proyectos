-- Migration to add new fields to proyectos table
-- NOTE: These columns may already exist if db.sql was already updated
-- Using IF NOT EXISTS to prevent errors on fresh installs

-- Add new columns to proyectos table (only if they don't exist)
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS objetivo TEXT,
ADD COLUMN IF NOT EXISTS meta_total DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS duracion_anos INTEGER CHECK (duracion_anos >= 1 AND duracion_anos <= 3) DEFAULT 1,
ADD COLUMN IF NOT EXISTS medida_tipo VARCHAR(20) CHECK (medida_tipo IN ('cantidad', 'porcentaje')) DEFAULT 'cantidad',
ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
ADD COLUMN IF NOT EXISTS fecha_fin DATE;

-- Create table for project trimestre distribution
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

-- Update actividades_planeadas to reference proyectos_trimestres if needed
-- (keeping existing structure for backwards compatibility)

-- Add comments for documentation
COMMENT ON COLUMN proyectos.objetivo IS 'Objetivo general del proyecto';
COMMENT ON COLUMN proyectos.meta_total IS 'Meta total a alcanzar (cantidad o porcentaje)';
COMMENT ON COLUMN proyectos.duracion_anos IS 'Duración del proyecto en años (máximo 3)';
COMMENT ON COLUMN proyectos.medida_tipo IS 'Tipo de medida: cantidad o porcentaje';
COMMENT ON TABLE proyectos_trimestres IS 'Distribución de metas por año y trimestre';
