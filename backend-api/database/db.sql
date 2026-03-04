CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE acciones (
    id SERIAL PRIMARY KEY,
    description TEXT
);

CREATE TABLE medidas (
    id SERIAL PRIMARY KEY,
    description TEXT
);

CREATE TABLE ejes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    ano INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unidad_administrativa (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departamentos(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    unidad_administrativa_id INTEGER REFERENCES unidad_administrativa(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE presupuestos(
    id SERIAL PRIMARY KEY,
    monto DECIMAL(15, 2) NOT NULL,
    ano INTEGER NOT NULL,
    unidad_administrativa_id INTEGER REFERENCES unidad_administrativa(id) ON DELETE SET NULL,
    departamento_id INTEGER REFERENCES departamentos(id) ON DELETE SET NULL,
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proyectos(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    unidad_administrativa_id INTEGER REFERENCES unidad_administrativa(id) ON DELETE SET NULL,
    departamento_id INTEGER REFERENCES departamentos(id) ON DELETE SET NULL,
    accion_id INTEGER REFERENCES acciones(id) ON DELETE SET NULL,
    medida_id INTEGER REFERENCES medidas(id) ON DELETE SET NULL,
    evaluacion TEXT,
    ejes_id INTEGER REFERENCES ejes(id) ON DELETE SET NULL,
    estado_actual VARCHAR(50) NOT NULL,
    asignado_a INTEGER REFERENCES presupuestos(id) ON DELETE SET NULL,
    presupuesto_id INTEGER REFERENCES presupuestos(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE actividades_planeadas (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE CASCADE,
    descripcion TEXT,
    ano INTEGER NOT NULL,
    meta_anual DECIMAL(15, 2) NOT NULL,
    meta_trimestral1 DECIMAL(15, 2) NOT NULL,
    meta_trimestral2 DECIMAL(15, 2) NOT NULL,
    meta_trimestral3 DECIMAL(15, 2) NOT NULL,
    meta_trimestral4 DECIMAL(15, 2) NOT NULL,
    porcentaje_anual_esperado INTEGER CHECK (porcentaje_anual_esperado >= 0 AND porcentaje_anual_esperado <= 100),
    observaciones TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE actividades_ejecutadas (
    id SERIAL PRIMARY KEY,
    actividad_planeada_id INTEGER REFERENCES actividades_planeadas(id) ON DELETE CASCADE,
    trimestre INTEGER CHECK (trimestre >= 1 AND trimestre <= 4),
    real_actualizado DECIMAL(15, 2) DEFAULT 0,
    porcentaje_cumplimiento INTEGER CHECK (porcentaje_cumplimiento >= 0 AND porcentaje_cumplimiento <= 500),
    observaciones TEXT,
    evidencia TEXT,
    calificacion DECIMAL(3, 1) CHECK (calificacion >= 0 AND calificacion <= 10),
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--indices --

CREATE INDEX idx_proyectos_ejes ON proyectos(ejes_id);
CREATE INDEX idx_proyectos_departamento ON proyectos(departamento_id);
CREATE INDEX idx_actividades_proyecto ON actividades_planeadas(proyecto_id);

--trigger 

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    
ALTER TABLE users
ADD COLUMN role_id INTEGER,
ADD FOREIGN KEY (role_id) REFERENCES roles(id),
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
