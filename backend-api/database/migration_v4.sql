-- Migration v4: Add new fields for actividades ejecutadas
-- Date: 2026-03-19
-- Description: Add razon, obstaculos, and documentacion_adjunta columns to actividades_ejecutadas table

-- Add new columns if they don't exist
ALTER TABLE actividades_ejecutadas 
ADD COLUMN IF NOT EXISTS razon TEXT;

ALTER TABLE actividades_ejecutadas 
ADD COLUMN IF NOT EXISTS obstaculos TEXT;

ALTER TABLE actividades_ejecutadas 
ADD COLUMN IF NOT EXISTS documentacion_adjunta JSONB;

-- Add comments for documentation
COMMENT ON COLUMN actividades_ejecutadas.razon IS 'Razón o justificación del avance obtenido';
COMMENT ON COLUMN actividades_ejecutadas.obstaculos IS 'Obstáculos o dificultades enfrentadas';
COMMENT ON COLUMN actividades_ejecutadas.documentacion_adjunta IS 'Documentación adjunta (JSON array of file names/URLs)';
