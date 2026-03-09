-- ============================================
-- SEED DATA FOR ALL TABLES
-- Insert in order to respect foreign key constraints
-- ============================================

-- 1. ROLES (no dependencies)
INSERT INTO roles (name, description) VALUES
('Administrador', 'Acceso completo al sistema'),
('Director', 'Gestión de unidades administrativas y proyectos'),
('Coordinador', 'Gestión de departamentos y actividades'),
('Analista', 'Visualización y reportes'),
('Auditor', 'Revisión y seguimiento de actividades');

-- 2. USERS (depends on roles)
INSERT INTO users (username, email, password_hash, role_id) VALUES
('admin', 'admin@sistema.gob', '$2b$10$hashplaceholder', 1),
('admin2', 'admin2@sistema.gob', '$2b$10$sJkuzSzBsbmSmhgPmYCJzu1NrXiAQYDCePKCA/5h3BsAJa/pUTgm.', 1),
('director.plan', 'director@sistema.gob', '$2b$10$hashplaceholder', 2),
('coordinador.tec', 'coordinador@sistema.gob', '$2b$10$hashplaceholder', 3),
('analista1', 'analista1@sistema.gob', '$2b$10$hashplaceholder', 4),
('analista2', 'analista2@sistema.gob', '$2b$10$hashplaceholder', 4),
('auditor.ext', 'auditor@sistema.gob', '$2b$10$hashplaceholder', 5);

-- 3. ACCIONES (no dependencies)
INSERT INTO acciones (description) VALUES
('Construcción de infraestructura'),
('Capacitación y formación'),
('Adquisición de equipamiento'),
('Implementación de sistemas'),
('Desarrollo de software'),
('Mantenimiento preventivo'),
('Mantenimiento correctivo'),
('Estudios e investigaciones'),
('Consultoría especializada'),
('Promoción y difusión');

-- 4. MEDIDAS (no dependencies)
INSERT INTO medidas (description, name) VALUES
('Cantidad, distancia, número de beneficiarios, etc.', 'Cantidad'),
('Porcentaje de avance o cumplimiento', 'Porcentaje');

-- 5. EJES (no dependencies)
INSERT INTO ejes (nombre, descripcion, ano) VALUES
('Eje 1: Desarrollo Económico', 'Fortalecimiento de la economía local y regional', 2024),
('Eje 2: Infraestructura', 'Mejora de infraestructura básica', 2024),
('Eje 3: Educación y Cultura', 'Promoción de la educación y cultura', 2024),
('Eje 4: Salud y Bienestar', 'Mejora de servicios de salud', 2024),
('Eje 5: Medio Ambiente', 'Protección y conservación ambiental', 2024),
('Eje 6: Seguridad', 'Fortalecimiento de la seguridad pública', 2024);

-- 6. UNIDAD_ADMINISTRATIVA (no dependencies)
INSERT INTO unidad_administrativa (nombre, descripcion) VALUES
('Dirección General de Planeación', 'Unidad encargada de la planeación estratégica'),
('Dirección de Finanzas', 'Gestión de recursos financieros'),
('Dirección de Infraestructura', 'Obras públicas e infraestructura'),
('Dirección de Desarrollo Social', 'Programas sociales y desarrollo comunitario'),
('Dirección de Educación', 'Gestión educativa y formación'),
('Dirección de Salud', 'Servicios de salud y bienestar');

-- 7. DEPARTAMENTOS (depends on unidad_administrativa)
INSERT INTO departamentos (nombre, descripcion, unidad_administrativa_id) VALUES
('Departamento de Proyectos', 'Gestión de proyectos de inversión', 1),
('Departamento de Presupuesto', 'Programación presupuestaria', 2),
('Departamento de Contabilidad', 'Registro contable y fiscal', 2),
('Departamento de Obras', 'Ejecución de obras públicas', 3),
('Departamento de Mantenimiento', 'Mantenimiento de infraestructura', 3),
('Departamento de Programas Sociales', 'Ejecución de programas sociales', 4),
('Departamento de Capacitación', 'Formación y capacitación', 5),
('Departamento de Servicios Médicos', 'Atención médica y servicios', 6);

-- 8. PRESUPUESTOS (depends on unidad_administrativa, departamentos, users)
INSERT INTO presupuestos (monto, ano, unidad_administrativa_id, departamento_id, assigned_by) VALUES
(5000000.00, 2024, 1, 1, 1),
(3500000.00, 2024, 2, 2, 1),
(2800000.00, 2024, 2, 3, 1),
(8000000.00, 2024, 3, 4, 2),
(2500000.00, 2024, 3, 5, 2),
(4200000.00, 2024, 4, 6, 2),
(1800000.00, 2024, 5, 7, 2),
(3200000.00, 2024, 2, 8, 2),
(6000000.00, 2024, 1, 1, 1),
(4500000.00, 2024, 3, 4, 2);

-- 9. PROYECTOS (depends on unidad_administrativa, departamentos, acciones, medidas, ejes, presupuestos, users)
INSERT INTO proyectos (nombre, descripcion, unidad_administrativa_id, departamento_id, accion_id, medida_id, evaluacion, ejes_id, estado_actual, asignado_a, presupuesto_id, created_by) VALUES
('Rehabilitación Carretera Norte', 'Rehabilitación de 25 km de carretera', 3, 4, 1, 2, 'Proyecto priorizado por impacto regional', 2, 'En ejecución', 4, 4, 1),
('Centro de Capacitación Tecnológica', 'Construcción de centro de capacitación', 5, 7, 1, 1, 'Alto impacto en empleabilidad', 3, 'En planeación', 7, 7, 1),
('Programa de Becas Educativas', 'Becas para estudiantes de bajos recursos', 4, 6, 2, 2, 'Cobertura en 15 comunidades', 3, 'En ejecución', 6, 6, 2),
('Adquisición de Equipo Médico', 'Equipamiento para clínicas rurales', 6, 8, 3, 3, 'Beneficiará 5 comunidades', 4, 'En licitación', 8, 8, 2),
('Sistema de Gestión Documental', 'Digitalización de archivos', 1, 1, 4, 4, 'Mejora en eficiencia administrativa', 1, 'En desarrollo', 1, 1, 1),
('Plataforma de Servicios Digitales', 'App para trámites en línea', 1, 1, 5, 5, 'Modernización administrativa', 1, 'En planeación', 9, 9, 1),
('Mantenimiento Edificios Gubernamentales', 'Mantenimiento preventivo anual', 3, 5, 6, 2, 'Programa establecido', 2, 'En ejecución', 5, 5, 2),
('Estudio de Impacto Ambiental', 'Evaluación de proyectos prioritarios', 1, 1, 8, 3, 'Requerido por normativa', 5, 'Iniciado', 1, 1, 3),
('Campaña de Prevención de Salud', 'Jornadas de salud preventiva', 6, 8, 9, 2, 'Cobertura municipal', 4, 'En ejecución', 8, 8, 3),
('Feria de Empleo Regional', 'Vinculación laboral', 4, 6, 10, 1, 'Proyecto trimestral', 1, 'Planificado', 6, 6, 2);

-- 10. ACTIVIDADES_PLANEADAS (depends on proyectos, users)
INSERT INTO actividades_planeadas (proyecto_id, descripcion, ano, meta_anual, meta_trimestral1, meta_trimestral2, meta_trimestral3, meta_trimestral4, porcentaje_anual_esperado, observaciones, created_by) VALUES
(1, 'Limpieza y despalme', 2024, 25000.00, 6250.00, 6250.00, 6250.00, 6250.00, 100, 'Primer etapa de rehabilitación', 1),
(1, 'Suministro de material', 2024, 15000.00, 5000.00, 5000.00, 5000.00, 0.00, 100, 'Material de construcción', 1),
(1, 'Pavimentación', 2024, 10000.00, 0.00, 2500.00, 5000.00, 2500.00, 100, 'Capa de rodadura', 1),
(2, 'Construcción de aulas', 2024, 8.00, 2.00, 2.00, 2.00, 2.00, 100, 'Aulas equipadas', 1),
(2, 'Equipamiento tecnológico', 2024, 50.00, 0.00, 25.00, 25.00, 0.00, 100, 'Computadoras y proyectores', 1),
(3, 'Convocatoria de becas', 2024, 500.00, 500.00, 0.00, 0.00, 0.00, 100, 'Primera convocatoria año', 2),
(3, 'Segunda convocatoria', 2024, 300.00, 0.00, 150.00, 150.00, 0.00, 100, 'Segunda convocatoria año', 2),
(4, 'Adquisición de equipos básicos', 2024, 20.00, 20.00, 0.00, 0.00, 0.00, 100, 'Equipos de diagnóstico', 2),
(4, 'Adquisición de equipos especializados', 2024, 10.00, 0.00, 5.00, 5.00, 0.00, 100, 'Equipos de especialidad', 2),
(5, 'Digitalización de archivos históricos', 2024, 50000.00, 10000.00, 15000.00, 15000.00, 10000.00, 100, 'Archivos 2010-2024', 1);

-- 11. ACTIVIDADES_EJECUTADAS (depends on actividades_planeadas, users)
INSERT INTO actividades_ejecutadas (actividad_planeada_id, trimestre, real_actualizado, porcentaje_cumplimiento, observaciones, evidencia, calificacion, updated_by) VALUES
(1, 1, 6500.00, 104, 'Superó meta esperada por condiciones climáticas favorables', 'foto1.jpg,acta1.pdf', 9.5, 3),
(2, 1, 5200.00, 104, 'Entrega completa anticipada', 'factura1.pdf', 10.0, 3),
(3, 2, 2600.00, 104, 'Buen avance de obra', 'foto2.jpg', 9.0, 4),
(4, 2, 2.00, 100, 'Construcción según programa', 'acta2.pdf', 9.0, 3),
(5, 2, 28.00, 112, 'Más equipos de los planeados por donación', 'inventario.pdf', 10.0, 3),
(6, 1, 520.00, 104, 'Alta demanda de becas', 'listado.pdf', 9.5, 4),
(7, 3, 160.00, 107, 'Cobertura extendida', 'reporte.pdf', 9.0, 4),
(8, 1, 22.00, 110, 'Equipos adquiridos con especificaciones superiores', 'factura2.pdf', 9.5, 3),
(9, 2, 5.00, 100, 'Entrega conforme', 'acta3.pdf', 9.0, 3),
(10, 1, 11000.00, 110, 'Equipo de digitalización eficiente', 'reporte2.pdf', 9.5, 1);

ALTER TABLE medidas ADD COLUMN name VARCHAR(255);
UPDATE medidas SET name = description;
-- ============================================
-- END OF SEED DATA
-- ============================================

