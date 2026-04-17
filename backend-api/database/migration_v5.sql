-- Migration v5: Add new fields for proyecto activities model
-- Date: 2026-04-16
-- Description: Add presupuesto_total and actividades columns to proyectos table for new activity-based model

-- Add new columns to proyectos table
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS presupuesto_total DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS actividades JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN proyectos.presupuesto_total IS 'Total budget assigned to the project from selected presupuesto';
COMMENT ON COLUMN proyectos.actividades IS 'Array of project activities with their details (name, description, measures, goals, evaluations, budget allocation)';

-- Create index for better JSON queries
CREATE INDEX IF NOT EXISTS idx_proyectos_actividades ON proyectos USING gin(actividades);