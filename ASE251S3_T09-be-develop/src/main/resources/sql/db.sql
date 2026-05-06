-- ========================================
-- 1. CREAR BASE DE DATOS
-- ========================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'agro_db')
BEGIN
    CREATE DATABASE agro_db;
END
GO

USE agro_db;
GO

-- ========================================
-- 2. ELIMINAR TABLAS (SI EXISTEN)
-- ========================================
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS contacto;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS categoria;
GO

-- ========================================
-- 3. CREAR TABLAS
-- ========================================

-- Tabla categoria
CREATE TABLE categoria (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    codigo VARCHAR(30) NOT NULL UNIQUE,
    prioridad INT,
    es_destacada BIT,
    fecha_vigencia DATE,
    state CHAR(1) NOT NULL,
    created_at DATETIME2,
    updated_at DATETIME2,
    deleted_at DATETIME2,
    restored_at DATETIME2
);

-- Tabla cliente
CREATE TABLE cliente (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    direccion VARCHAR(150),
    fecha_nacimiento DATE,
    limite_credito DECIMAL(10,2),
    state CHAR(1) NOT NULL,
    created_at DATETIME2,
    updated_at DATETIME2,
    deleted_at DATETIME2,
    restored_at DATETIME2
);

-- Tabla contacto
CREATE TABLE contacto (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    cargo VARCHAR(100),
    extension INT,
    principal BIT,
    fecha_registro DATE,
    state CHAR(1) NOT NULL,
    created_at DATETIME2,
    updated_at DATETIME2,
    deleted_at DATETIME2,
    restored_at DATETIME2
);

-- Tabla pedido
CREATE TABLE pedido (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    fecha DATE NOT NULL,
    total FLOAT NOT NULL,
    numero VARCHAR(30) NOT NULL UNIQUE,
    cantidad INT,
    confirmado BIT,
    fecha_entrega DATE,
    observacion VARCHAR(255),
    state CHAR(1) NOT NULL,
    created_at DATETIME2,
    updated_at DATETIME2,
    deleted_at DATETIME2,
    restored_at DATETIME2
);

-- Tabla producto
CREATE TABLE producto (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    precio FLOAT NOT NULL,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    stock INT,
    es_activo BIT,
    fecha_vencimiento DATE,
    state CHAR(1) NOT NULL,
    created_at DATETIME2,
    updated_at DATETIME2,
    deleted_at DATETIME2,
    restored_at DATETIME2
);

-- Tabla proveedores
CREATE TABLE proveedores (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ruc CHAR(11) NOT NULL,
    cellphone CHAR(9) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    address VARCHAR(150),
    email VARCHAR(100),
    state CHAR(1) NOT NULL,
    created_at DATETIME2,
    updated_at DATETIME2,
    deleted_at DATETIME2,
    restored_at DATETIME2
);
GO

-- ========================================
-- 4. INSERTAR DATOS
-- ========================================

INSERT INTO categoria (
    nombre, descripcion, codigo, prioridad, es_destacada, fecha_vigencia,
    state, created_at, updated_at, deleted_at, restored_at
) VALUES
('Fertilizantes', 'Productos para nutrir plantas', 'CAT-001', 1, 1, '2026-01-01', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Herramientas', 'Herramientas agrícolas', 'CAT-002', 2, 1, '2026-01-01', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Semillas', 'Variedad de semillas', 'CAT-003', 3, 0, '2026-01-01', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Pesticidas', 'Control de plagas', 'CAT-004', 4, 0, '2026-01-01', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Riego', 'Sistemas de riego', 'CAT-005', 5, 1, '2026-01-01', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Sustratos', 'Tierra y sustratos', 'CAT-006', 6, 0, '2026-01-01', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Maquinaria', 'Maquinaria agrícola', 'CAT-007', 7, 1, '2026-01-01', 'I', SYSDATETIME(), NULL, SYSDATETIME(), NULL),
('Accesorios', 'Accesorios varios', 'CAT-008', 8, 0, '2026-01-01', 'A', SYSDATETIME(), NULL, NULL, SYSDATETIME());

INSERT INTO cliente (
    nombre, email, telefono, apellido, direccion, fecha_nacimiento, limite_credito,
    state, created_at, updated_at, deleted_at, restored_at
) VALUES
('Juan', 'juanperez@mail.com', '999111222', 'Perez', 'Lima', '1994-03-10', 2500.00, 'A', SYSDATETIME(), NULL, NULL, NULL),
('Ana', 'ana.torres@mail.com', '988222333', 'Torres', 'Arequipa', '1992-08-21', 3000.00, 'A', SYSDATETIME(), NULL, NULL, NULL),
('Luis', 'luis.m@mail.com', '977333444', 'Mendoza', 'Cusco', '1988-11-15', 1800.00, 'A', SYSDATETIME(), NULL, NULL, NULL),
('Maria', 'maria.lopez@mail.com', '966444555', 'Lopez', 'Trujillo', '1996-05-30', 3200.00, 'I', SYSDATETIME(), NULL, SYSDATETIME(), NULL),
('Carlos', 'carlos.r@mail.com', '955555666', 'Rojas', 'Piura', '1990-01-12', 1500.00, 'A', SYSDATETIME(), NULL, NULL, NULL),
('Jorge', 'jorge.r@mail.com', '944666777', 'Ramirez', 'Tacna', '1987-07-22', 2800.00, 'A', SYSDATETIME(), NULL, NULL, NULL),
('Sofia', 'sofia.c@mail.com', '933777888', 'Castro', 'Ica', '1998-04-01', 2100.00, 'A', SYSDATETIME(), NULL, NULL, NULL),
('Pedro', 'pedro.d@mail.com', '922888999', 'Diaz', 'Puno', '1991-09-19', 2600.00, 'A', SYSDATETIME(), NULL, NULL, SYSDATETIME());

INSERT INTO contacto (
    nombre, telefono, email, cargo, extension, principal, fecha_registro,
    state, created_at, updated_at, deleted_at, restored_at
) VALUES
('Juan Perez', '999111222', 'juanperez@mail.com', 'Comprador', 101, 1, '2026-01-10', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Ana Torres', '988222333', 'ana.torres@mail.com', 'Asistente', 102, 0, '2026-01-10', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Luis Mendoza', '977333444', 'luis.m@mail.com', 'Gerente', 103, 1, '2026-01-10', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Maria Lopez', '966444555', 'maria.lopez@mail.com', 'Vendedora', 104, 0, '2026-01-10', 'I', SYSDATETIME(), NULL, SYSDATETIME(), NULL),
('Carlos Rojas', '955555666', 'carlos.r@mail.com', 'Logistica', 105, 0, '2026-01-10', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Jorge Ramirez', '944666777', 'jorge.r@mail.com', 'Supervisor', 106, 1, '2026-01-10', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Sofia Castro', '933777888', 'sofia.c@mail.com', 'Analista', 107, 0, '2026-01-10', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Pedro Diaz', '922888999', 'pedro.d@mail.com', 'Operador', 108, 0, '2026-01-10', 'A', SYSDATETIME(), NULL, NULL, SYSDATETIME());

INSERT INTO pedido (
    fecha, total, numero, cantidad, confirmado, fecha_entrega, observacion,
    state, created_at, updated_at, deleted_at, restored_at
) VALUES
('2026-04-01', 150.50, 'PED-001', 3, 1, '2026-04-05', 'Entrega parcial', 'A', SYSDATETIME(), NULL, NULL, NULL),
('2026-04-02', 200.00, 'PED-002', 5, 1, '2026-04-06', 'Entrega completa', 'A', SYSDATETIME(), NULL, NULL, NULL),
('2026-04-03', 99.99, 'PED-003', 2, 0, '2026-04-07', 'Pendiente de pago', 'A', SYSDATETIME(), NULL, NULL, NULL),
('2026-04-04', 300.00, 'PED-004', 7, 1, '2026-04-08', 'Urgente', 'I', SYSDATETIME(), NULL, SYSDATETIME(), NULL),
('2026-04-05', 120.75, 'PED-005', 1, 0, '2026-04-09', 'Sin observaciones', 'A', SYSDATETIME(), NULL, NULL, NULL),
('2026-04-06', 450.10, 'PED-006', 10, 1, '2026-04-10', 'Cliente preferencial', 'A', SYSDATETIME(), NULL, NULL, NULL),
('2026-04-07', 80.00, 'PED-007', 4, 1, '2026-04-11', 'Reprogramado', 'A', SYSDATETIME(), NULL, NULL, NULL),
('2026-04-08', 210.30, 'PED-008', 6, 0, '2026-04-12', 'Prueba restauracion', 'A', SYSDATETIME(), NULL, NULL, SYSDATETIME());

INSERT INTO producto (
    nombre, descripcion, precio, codigo, stock, es_activo, fecha_vencimiento,
    state, created_at, updated_at, deleted_at, restored_at
) VALUES
('Fertilizante NPK', 'Fertilizante completo', 50.00, 'PROD-001', 100, 1, '2027-01-01', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Pala', 'Herramienta de acero', 30.00, 'PROD-002', 40, 1, '2030-01-01', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Semilla de maiz', 'Semilla hibrida', 10.00, 'PROD-003', 500, 1, '2026-12-31', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Insecticida', 'Control de plagas', 25.00, 'PROD-004', 70, 1, '2027-06-30', 'I', SYSDATETIME(), NULL, SYSDATETIME(), NULL),
('Aspersor', 'Riego eficiente', 15.00, 'PROD-005', 120, 1, '2030-01-01', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Sustrato universal', 'Tierra para plantas', 12.00, 'PROD-006', 90, 1, '2028-05-15', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Tractor', 'Maquinaria agricola', 5000.00, 'PROD-007', 5, 1, '2035-01-01', 'A', SYSDATETIME(), NULL, NULL, NULL),
('Guantes', 'Accesorio de proteccion', 5.00, 'PROD-008', 250, 1, '2030-01-01', 'A', SYSDATETIME(), NULL, NULL, SYSDATETIME());

INSERT INTO proveedores (
    ruc, cellphone, company_name, contact_name, address, email,
    state, created_at, updated_at, deleted_at, restored_at
) VALUES
('20123456789', '987654321', 'AgroPeru SAC', 'Luis Mendoza', 'Lima', 'contacto@agroperu.pe', 'A', SYSDATETIME(), NULL, NULL, NULL),
('20987654321', '912345678', 'Fertilizantes del Sur', 'Ana Torres', 'Arequipa', 'ventas@fertisur.pe', 'A', SYSDATETIME(), NULL, NULL, NULL),
('20456789123', '999888777', 'BioCrop Peru', 'Carlos Rojas', 'Cusco', 'info@biocrop.pe', 'A', SYSDATETIME(), NULL, NULL, NULL),
('20765432109', '987123456', 'AgroTech Solutions', 'Maria Lopez', 'Trujillo', 'hola@agrotech.pe', 'I', SYSDATETIME(), NULL, SYSDATETIME(), NULL),
('20234567890', '912987654', 'GreenFields S.A.', 'Jorge Ramirez', 'Piura', 'contacto@greenfields.pe', 'I', SYSDATETIME(), NULL, SYSDATETIME(), NULL),
('20876543210', '911234567', 'AgroAndes', 'Sofia Castro', 'Lambayeque', 'ventas@agroandes.pe', 'A', SYSDATETIME(), NULL, NULL, NULL),
('20345678901', '922345678', 'CampoFertil', 'Pedro Diaz', 'Tacna', 'admin@campofertil.pe', 'A', SYSDATETIME(), NULL, NULL, NULL),
('20567890123', '933456789', 'SolAgro', 'Lucia Vega', 'Ica', 'contacto@solagro.pe', 'A', SYSDATETIME(), NULL, NULL, SYSDATETIME());

GO

-- ========================================
-- 5. VERIFICACIÓN
-- ========================================
SELECT * FROM categoria;
SELECT * FROM cliente;
SELECT * FROM contacto;
SELECT * FROM pedido;
SELECT * FROM producto;
SELECT * FROM proveedores;