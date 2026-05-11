-- ========================================
-- BASE DE DATOS: agro_db
-- Sistema de Gestion Agricola
-- Version final corregida con JSON, geography,
-- JOINs y Stored Procedures
-- ========================================

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
-- 2. ELIMINAR TABLAS (orden por dependencias FK)
-- ========================================
DROP TABLE IF EXISTS detalle_pedido;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS contacto;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS categoria;
GO

-- ========================================
-- 3. CREAR TABLAS (objetos MAESTRO primero)
-- ========================================

-- [MAESTRO] Tabla categoria
CREATE TABLE categoria (
    id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    descripcion    VARCHAR(255),
    codigo         VARCHAR(30)  NOT NULL UNIQUE,
    prioridad      INT          CHECK (prioridad > 0),
    es_destacada   BIT          NOT NULL DEFAULT 0,
    fecha_vigencia DATE,
    state          CHAR(1)      NOT NULL DEFAULT 'A'
                                CONSTRAINT ck_categoria_state CHECK (state IN ('A','I')),
    created_at     DATETIME2    NOT NULL DEFAULT SYSDATETIME(),
    updated_at     DATETIME2,
    deleted_at     DATETIME2,
    restored_at    DATETIME2
);

-- [MAESTRO] Tabla cliente
-- JSON  : preferencias guarda config del cliente {"notificaciones":true,"idioma":"es","descuento":5}
-- GEOGRAPHY: ubicacion guarda coordenadas GPS reales
CREATE TABLE cliente (
    id               BIGINT        IDENTITY(1,1) PRIMARY KEY,
    nombre           VARCHAR(100)  NOT NULL,
    apellido         VARCHAR(100)  NOT NULL,
    email            VARCHAR(100)  NOT NULL UNIQUE,
    telefono         VARCHAR(20)   NOT NULL,
    direccion        VARCHAR(150),
    fecha_nacimiento DATE,
    limite_credito   DECIMAL(10,2) CHECK (limite_credito >= 0),
    preferencias     NVARCHAR(MAX),   -- JSON
    ubicacion        GEOGRAPHY,       -- SPATIAL
    state            CHAR(1)       NOT NULL DEFAULT 'A'
                                   CONSTRAINT ck_cliente_state CHECK (state IN ('A','I')),
    created_at       DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    updated_at       DATETIME2,
    deleted_at       DATETIME2,
    restored_at      DATETIME2
);

-- [MAESTRO] Tabla contacto
CREATE TABLE contacto (
    id             BIGINT       IDENTITY(1,1) PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    telefono       VARCHAR(20)  NOT NULL,
    email          VARCHAR(100) NOT NULL,
    cargo          VARCHAR(100),
    extension      INT          CHECK (extension > 0),
    principal      BIT          NOT NULL DEFAULT 0,
    fecha_registro DATE,
    state          CHAR(1)      NOT NULL DEFAULT 'A'
                                CONSTRAINT ck_contacto_state CHECK (state IN ('A','I')),
    created_at     DATETIME2    NOT NULL DEFAULT SYSDATETIME(),
    updated_at     DATETIME2,
    deleted_at     DATETIME2,
    restored_at    DATETIME2
);

-- [MAESTRO] Tabla producto
-- FLOAT: precio | BIT: es_activo | DATE: fecha_vencimiento
CREATE TABLE producto (
    id                BIGINT       IDENTITY(1,1) PRIMARY KEY,
    nombre            VARCHAR(100) NOT NULL,
    descripcion       VARCHAR(255),
    precio            FLOAT        NOT NULL CHECK (precio > 0),
    codigo            VARCHAR(30)  NOT NULL UNIQUE,
    stock             INT          NOT NULL DEFAULT 100 CHECK (stock >= 0),
    es_activo         BIT          NOT NULL DEFAULT 1,
    fecha_vencimiento DATE,
    state             CHAR(1)      NOT NULL DEFAULT 'A'
                                   CONSTRAINT ck_producto_state CHECK (state IN ('A','I')),
    created_at        DATETIME2    NOT NULL DEFAULT SYSDATETIME(),
    updated_at        DATETIME2,
    deleted_at        DATETIME2,
    restored_at       DATETIME2
);

-- [MAESTRO] Tabla proveedores
-- GEOGRAPHY: ubicacion GPS de la sede del proveedor
CREATE TABLE proveedores (
    id           BIGINT       IDENTITY(1,1) PRIMARY KEY,
    ruc          CHAR(11)     NOT NULL UNIQUE,
    cellphone    CHAR(9)      NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    address      VARCHAR(150),
    email        VARCHAR(100),
    ubicacion    GEOGRAPHY,      -- SPATIAL
    state        CHAR(1)      NOT NULL DEFAULT 'A'
                              CONSTRAINT ck_proveedores_state CHECK (state IN ('A','I')),
    created_at   DATETIME2    NOT NULL DEFAULT SYSDATETIME(),
    updated_at   DATETIME2,
    deleted_at   DATETIME2,
    restored_at  DATETIME2
);

-- [TRANSACCIONAL] Tabla pedido
-- FK a cliente | CHECK en metodo_pago
CREATE TABLE pedido (
    id          BIGINT      IDENTITY(1,1) PRIMARY KEY,
    numero      VARCHAR(30) NOT NULL UNIQUE,
    fecha       DATE        NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    cliente_id  BIGINT      NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL
                            CONSTRAINT ck_pedido_metodo
                            CHECK (metodo_pago IN ('efectivo','digital','credito','transferencia')),
    total       FLOAT       NOT NULL CHECK (total >= 0),
    state       CHAR(1)     NOT NULL DEFAULT 'A'
                            CONSTRAINT ck_pedido_state CHECK (state IN ('A','I')),
    created_at  DATETIME2   NOT NULL DEFAULT SYSDATETIME(),
    updated_at  DATETIME2,
    deleted_at  DATETIME2,
    restored_at DATETIME2,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

-- [TRANSACCIONAL] Tabla detalle_pedido
-- FK a pedido y producto | UNIQUE compuesto evita duplicar producto en mismo pedido
CREATE TABLE detalle_pedido (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    pedido_id       BIGINT NOT NULL,
    producto_id     BIGINT NOT NULL,
    cantidad        INT    NOT NULL CHECK (cantidad > 0),
    precio_unitario FLOAT  NOT NULL CHECK (precio_unitario > 0),
    subtotal        FLOAT  NOT NULL CHECK (subtotal > 0),
    CONSTRAINT fk_detalle_pedido          FOREIGN KEY (pedido_id)   REFERENCES pedido(id),
    CONSTRAINT fk_detalle_producto        FOREIGN KEY (producto_id) REFERENCES producto(id),
    CONSTRAINT uq_detalle_pedido_producto UNIQUE (pedido_id, producto_id)
);
GO

-- ========================================
-- 4. INSERTAR DATOS
-- ========================================

INSERT INTO categoria (nombre, descripcion, codigo, prioridad, es_destacada, fecha_vigencia, state)
VALUES
('Fertilizantes', 'Productos para nutrir plantas', 'CAT-001', 1, 1, '2026-12-31', 'A'),
('Herramientas',  'Herramientas agricolas',        'CAT-002', 2, 1, '2026-12-31', 'A'),
('Semillas',      'Variedad de semillas',           'CAT-003', 3, 0, '2026-12-31', 'A'),
('Pesticidas',    'Control de plagas',              'CAT-004', 4, 0, '2026-12-31', 'A'),
('Riego',         'Sistemas de riego',              'CAT-005', 5, 1, '2026-12-31', 'A'),
('Sustratos',     'Tierra y sustratos',             'CAT-006', 6, 0, '2026-12-31', 'A'),
('Maquinaria',    'Maquinaria agricola',            'CAT-007', 7, 1, '2026-12-31', 'I'),
('Accesorios',    'Accesorios varios',              'CAT-008', 8, 0, '2026-12-31', 'A');

-- Clientes con JSON (preferencias) y GEOGRAPHY (coordenadas GPS)
-- geography::Point(latitud, longitud, SRID=4326)
INSERT INTO cliente
    (nombre, apellido, email, telefono, direccion,
     fecha_nacimiento, limite_credito, preferencias, ubicacion, state)
VALUES
('Juan',  'Perez',   'juanperez@mail.com',   '999111222', 'Lima',
 '1994-03-10', 2500.00,
 '{"notificaciones":true,"idioma":"es","descuento":5}',
 geography::Point(-12.0464,-77.0428,4326), 'A'),

('Ana',   'Torres',  'ana.torres@mail.com',  '988222333', 'Arequipa',
 '1992-08-21', 3000.00,
 '{"notificaciones":false,"idioma":"es","descuento":10}',
 geography::Point(-16.4090,-71.5375,4326), 'A'),

('Luis',  'Mendoza', 'luis.m@mail.com',      '977333444', 'Cusco',
 '1988-11-15', 1800.00,
 '{"notificaciones":true,"idioma":"es","descuento":0}',
 geography::Point(-13.5319,-71.9675,4326), 'A'),

('Maria', 'Lopez',   'maria.lopez@mail.com', '966444555', 'Trujillo',
 '1996-05-30', 3200.00,
 '{"notificaciones":true,"idioma":"es","descuento":15}',
 geography::Point(-8.1116,-79.0289,4326),  'I'),

('Carlos','Rojas',   'carlos.r@mail.com',    '955555666', 'Piura',
 '1990-01-12', 1500.00,
 '{"notificaciones":false,"idioma":"es","descuento":0}',
 geography::Point(-5.1945,-80.6328,4326),  'A'),

('Jorge', 'Ramirez', 'jorge.r@mail.com',     '944666777', 'Tacna',
 '1987-07-22', 2800.00,
 '{"notificaciones":true,"idioma":"es","descuento":8}',
 geography::Point(-18.0066,-70.2462,4326), 'A'),

('Sofia', 'Castro',  'sofia.c@mail.com',     '933777888', 'Ica',
 '1998-04-01', 2100.00,
 '{"notificaciones":false,"idioma":"es","descuento":3}',
 geography::Point(-14.0678,-75.7286,4326), 'A'),

('Pedro', 'Diaz',    'pedro.d@mail.com',     '922888999', 'Puno',
 '1991-09-19', 2600.00,
 '{"notificaciones":true,"idioma":"es","descuento":0}',
 geography::Point(-15.8402,-70.0219,4326), 'A');

INSERT INTO contacto
    (nombre, telefono, email, cargo, extension, principal, fecha_registro, state)
VALUES
('Juan Perez',    '999111222', 'juanperez@mail.com',   'Comprador',  101, 1, '2026-01-10', 'A'),
('Ana Torres',    '988222333', 'ana.torres@mail.com',  'Asistente',  102, 0, '2026-01-10', 'A'),
('Luis Mendoza',  '977333444', 'luis.m@mail.com',      'Gerente',    103, 1, '2026-01-10', 'A'),
('Maria Lopez',   '966444555', 'maria.lopez@mail.com', 'Vendedora',  104, 0, '2026-01-10', 'I'),
('Carlos Rojas',  '955555666', 'carlos.r@mail.com',    'Logistica',  105, 0, '2026-01-10', 'A'),
('Jorge Ramirez', '944666777', 'jorge.r@mail.com',     'Supervisor', 106, 1, '2026-01-10', 'A'),
('Sofia Castro',  '933777888', 'sofia.c@mail.com',     'Analista',   107, 0, '2026-01-10', 'A'),
('Pedro Diaz',    '922888999', 'pedro.d@mail.com',     'Operador',   108, 0, '2026-01-10', 'A');

INSERT INTO producto
    (nombre, descripcion, precio, codigo, stock, es_activo, fecha_vencimiento, state)
VALUES
('Fertilizante NPK',  'Fertilizante completo',    50.00, 'PROD-001', 100, 1, '2027-01-01', 'A'),
('Pala',              'Herramienta de acero',      30.00, 'PROD-002',  40, 1, '2030-01-01', 'A'),
('Semilla de maiz',   'Semilla hibrida',           10.00, 'PROD-003', 500, 1, '2026-12-31', 'A'),
('Insecticida',       'Control de plagas',         25.00, 'PROD-004',  70, 1, '2027-06-30', 'I'),
('Aspersor',          'Riego eficiente',           15.00, 'PROD-005', 120, 1, '2030-01-01', 'A'),
('Sustrato universal','Tierra para plantas',       12.00, 'PROD-006',  90, 1, '2028-05-15', 'A'),
('Tractor',           'Maquinaria agricola',     5000.00, 'PROD-007',   5, 1, '2035-01-01', 'A'),
('Guantes',           'Accesorio de proteccion',   5.00, 'PROD-008', 250, 1, '2030-01-01', 'A');

-- Proveedores con GEOGRAPHY (sede de la empresa)
INSERT INTO proveedores
    (ruc, cellphone, company_name, contact_name, address, email, ubicacion, state)
VALUES
('20123456789','987654321','AgroPeru SAC',           'Luis Mendoza', 'Lima',        'contacto@agroperu.pe',   geography::Point(-12.0464,-77.0428,4326), 'A'),
('20987654321','912345678','Fertilizantes del Sur',  'Ana Torres',   'Arequipa',    'ventas@fertisur.pe',     geography::Point(-16.4090,-71.5375,4326), 'A'),
('20456789123','999888777','BioCrop Peru',           'Carlos Rojas', 'Cusco',       'info@biocrop.pe',        geography::Point(-13.5319,-71.9675,4326), 'A'),
('20765432109','987123456','AgroTech Solutions',     'Maria Lopez',  'Trujillo',    'hola@agrotech.pe',       geography::Point(-8.1116,-79.0289,4326),  'I'),
('20234567890','912987654','GreenFields S.A.',       'Jorge Ramirez','Piura',       'contacto@greenfields.pe',geography::Point(-5.1945,-80.6328,4326),  'I'),
('20876543210','911234567','AgroAndes',              'Sofia Castro', 'Lambayeque',  'ventas@agroandes.pe',    geography::Point(-6.7714,-79.8409,4326),  'A'),
('20345678901','922345678','CampoFertil',            'Pedro Diaz',   'Tacna',       'admin@campofertil.pe',   geography::Point(-18.0066,-70.2462,4326), 'A'),
('20567890123','933456789','SolAgro',                'Lucia Vega',   'Ica',         'contacto@solagro.pe',    geography::Point(-14.0678,-75.7286,4326), 'A');

INSERT INTO pedido (numero, fecha, cliente_id, metodo_pago, total, state)
VALUES
('PED-001','2026-04-01', 1, 'efectivo', 110.00, 'A'),
('PED-002','2026-04-02', 2, 'digital',   65.00, 'A'),
('PED-003','2026-04-03', 3, 'digital',   75.00, 'A'),
('PED-004','2026-04-04', 4, 'efectivo',  50.00, 'I');

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
VALUES
(1, 1, 1,  50.00,  50.00),
(1, 2, 2,  30.00,  60.00),
(2, 3, 5,  10.00,  50.00),
(2, 8, 3,   5.00,  15.00),
(3, 4, 3,  25.00,  75.00),
(4, 5, 2,  15.00,  30.00),
(4, 6, 1,  12.00,  12.00);
GO

-- ========================================
-- 5. CONSULTAS DE VERIFICACION CON JOINS
-- ========================================

-- [JOIN 1] INNER JOIN: pedidos con nombre completo del cliente
SELECT
    p.numero                        AS nro_pedido,
    p.fecha                         AS fecha_pedido,
    c.nombre + ' ' + c.apellido     AS cliente,
    c.email,
    p.metodo_pago,
    p.total,
    p.state
FROM pedido p
INNER JOIN cliente c ON p.cliente_id = c.id
ORDER BY p.fecha;

-- [JOIN 2] INNER JOIN encadenado: detalle completo (4 tablas)
SELECT
    p.numero                        AS nro_pedido,
    c.nombre + ' ' + c.apellido     AS cliente,
    pr.nombre                       AS producto,
    pr.codigo,
    dp.cantidad,
    dp.precio_unitario,
    dp.subtotal
FROM detalle_pedido dp
INNER JOIN pedido   p  ON dp.pedido_id   = p.id
INNER JOIN cliente  c  ON p.cliente_id   = c.id
INNER JOIN producto pr ON dp.producto_id = pr.id
ORDER BY p.numero, pr.nombre;

-- [JOIN 3] LEFT JOIN: todos los clientes aunque no tengan pedidos + dato JSON
SELECT
    c.nombre + ' ' + c.apellido              AS cliente,
    c.email,
    c.limite_credito,
    COUNT(p.id)                              AS total_pedidos,
    ISNULL(SUM(p.total), 0)                  AS monto_total_comprado,
    JSON_VALUE(c.preferencias,'$.descuento') AS descuento_pct
FROM cliente c
LEFT JOIN pedido p ON c.id = p.cliente_id AND p.state = 'A'
GROUP BY c.nombre, c.apellido, c.email, c.limite_credito, c.preferencias
ORDER BY monto_total_comprado DESC;

-- [JOIN 4] LEFT JOIN: productos mas vendidos con stock actual
SELECT
    pr.codigo,
    pr.nombre                       AS producto,
    pr.precio,
    pr.stock,
    pr.es_activo,
    ISNULL(SUM(dp.cantidad), 0)     AS unidades_vendidas,
    ISNULL(SUM(dp.subtotal), 0)     AS ingreso_total
FROM producto pr
LEFT JOIN detalle_pedido dp ON pr.id = dp.producto_id
GROUP BY pr.id, pr.codigo, pr.nombre, pr.precio, pr.stock, pr.es_activo
ORDER BY unidades_vendidas DESC;

-- [JOIN 5] JSON + GEOGRAPHY: preferencias y coordenadas GPS de clientes activos
-- Nota: se usa STY() para latitud y STX() para longitud (compatible con todas las versiones)
SELECT
    c.nombre + ' ' + c.apellido                      AS cliente,
    JSON_VALUE(c.preferencias,'$.idioma')             AS idioma,
    JSON_VALUE(c.preferencias,'$.notificaciones')     AS notificaciones,
    JSON_VALUE(c.preferencias,'$.descuento')          AS descuento,
    c.ubicacion.Lat                                 AS latitud,
    c.ubicacion.Long                                 AS longitud
FROM cliente c
WHERE c.state = 'A'
  AND c.ubicacion IS NOT NULL;
GO

-- ========================================
-- 6. STORED PROCEDURES
-- ========================================
-- Un Stored Procedure (SP) es un bloque de codigo SQL
-- guardado en el servidor con un nombre. Se llama con EXEC.
-- Ventajas: reutilizacion, seguridad, rendimiento, mantenimiento.
-- ========================================

-- --------------------------------------------------
-- SP 1: Registrar un nuevo pedido con su detalle
-- Parametros: numero, fecha, cliente_id, metodo_pago,
--             producto_id, cantidad
-- Valida: cliente activo, producto activo, stock suficiente
-- Usa transaccion para garantizar integridad total
-- --------------------------------------------------
DROP PROCEDURE IF EXISTS sp_registrar_pedido;
GO
CREATE PROCEDURE sp_registrar_pedido
    @numero      VARCHAR(30),
    @fecha       DATE,
    @cliente_id  BIGINT,
    @metodo_pago VARCHAR(20),
    @producto_id BIGINT,
    @cantidad    INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @precio_unit  FLOAT;
    DECLARE @stock_actual INT;
    DECLARE @subtotal     FLOAT;
    DECLARE @pedido_id    BIGINT;

    -- Validar cliente activo
    IF NOT EXISTS (SELECT 1 FROM cliente WHERE id = @cliente_id AND state = 'A')
    BEGIN
        RAISERROR('El cliente no existe o esta inactivo.', 16, 1);
        RETURN;
    END

    -- Obtener precio y stock del producto
    SELECT @precio_unit  = precio,
           @stock_actual = stock
    FROM producto
    WHERE id = @producto_id AND state = 'A';

    IF @precio_unit IS NULL
    BEGIN
        RAISERROR('El producto no existe o esta inactivo.', 16, 1);
        RETURN;
    END

    -- Validar stock suficiente
    IF @stock_actual < @cantidad
    BEGIN
        RAISERROR('Stock insuficiente para el producto solicitado.', 16, 1);
        RETURN;
    END

    SET @subtotal = @precio_unit * @cantidad;

    BEGIN TRANSACTION;
    BEGIN TRY
        -- Insertar cabecera del pedido
        INSERT INTO pedido (numero, fecha, cliente_id, metodo_pago, total, state)
        VALUES (@numero, @fecha, @cliente_id, @metodo_pago, @subtotal, 'A');

        SET @pedido_id = SCOPE_IDENTITY();

        -- Insertar detalle del pedido
        INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (@pedido_id, @producto_id, @cantidad, @precio_unit, @subtotal);

        -- Descontar stock del producto
        UPDATE producto
        SET stock      = stock - @cantidad,
            updated_at = SYSDATETIME()
        WHERE id = @producto_id;

        COMMIT TRANSACTION;

        -- Retornar resumen con JOIN
        SELECT
            p.numero,
            p.fecha,
            c.nombre + ' ' + c.apellido AS cliente,
            pr.nombre                   AS producto,
            dp.cantidad,
            dp.precio_unitario,
            dp.subtotal                 AS total
        FROM pedido p
        INNER JOIN cliente        c  ON p.cliente_id   = c.id
        INNER JOIN detalle_pedido dp ON p.id           = dp.pedido_id
        INNER JOIN producto       pr ON dp.producto_id = pr.id
        WHERE p.id = @pedido_id;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        -- CORRECCION: declarar variable antes de THROW
        DECLARE @msg NVARCHAR(500) = 'Error al registrar el pedido: ' + ERROR_MESSAGE();
        THROW 50001, @msg, 1;
    END CATCH
END;
GO

-- --------------------------------------------------
-- SP 2: Consultar historial de compras de un cliente
-- Parametros: cliente_id, fecha_desde (opcional), fecha_hasta (opcional)
-- Devuelve 3 resultsets: datos del cliente, detalle de pedidos, resumen
-- --------------------------------------------------
DROP PROCEDURE IF EXISTS sp_historial_cliente;
GO
CREATE PROCEDURE sp_historial_cliente
    @cliente_id  BIGINT,
    @fecha_desde DATE = NULL,
    @fecha_hasta DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Fechas por defecto si no se pasan
    SET @fecha_desde = ISNULL(@fecha_desde, '2000-01-01');
    SET @fecha_hasta = ISNULL(@fecha_hasta, CAST(GETDATE() AS DATE));

    -- Validar que el cliente existe
    IF NOT EXISTS (SELECT 1 FROM cliente WHERE id = @cliente_id)
    BEGIN
        RAISERROR('Cliente no encontrado.', 16, 1);
        RETURN;
    END

    -- Resultado 1: datos del cliente con JSON y GEOGRAPHY
    -- CORRECCION: STY() = latitud, STX() = longitud (en lugar de .Lat y .Long)
    SELECT
        c.nombre + ' ' + c.apellido                  AS cliente,
        c.email,
        c.telefono,
        c.limite_credito,
        JSON_VALUE(c.preferencias,'$.descuento')      AS descuento_pct,
        c.ubicacion.Lat                             AS latitud,
        c.ubicacion.Long                             AS longitud
    FROM cliente c
    WHERE c.id = @cliente_id;

    -- Resultado 2: detalle de pedidos con INNER JOINs
    SELECT
        p.numero                    AS nro_pedido,
        p.fecha,
        p.metodo_pago,
        pr.codigo                   AS cod_producto,
        pr.nombre                   AS producto,
        dp.cantidad,
        dp.precio_unitario,
        dp.subtotal,
        p.total                     AS total_pedido,
        p.state                     AS estado
    FROM pedido p
    INNER JOIN detalle_pedido dp ON p.id           = dp.pedido_id
    INNER JOIN producto       pr ON dp.producto_id = pr.id
    WHERE p.cliente_id = @cliente_id
      AND p.fecha BETWEEN @fecha_desde AND @fecha_hasta
    ORDER BY p.fecha DESC, pr.nombre;

    -- Resultado 3: resumen del periodo
    SELECT
        COUNT(DISTINCT p.id)  AS total_pedidos,
        SUM(dp.cantidad)      AS unidades_compradas,
        SUM(dp.subtotal)      AS monto_total
    FROM pedido p
    INNER JOIN detalle_pedido dp ON p.id = dp.pedido_id
    WHERE p.cliente_id = @cliente_id
      AND p.fecha BETWEEN @fecha_desde AND @fecha_hasta
      AND p.state = 'A';
END;
GO

-- ========================================
-- 7. EJECUTAR LOS STORED PROCEDURES
-- ========================================

-- SP1: Registrar pedido para Juan Perez (id=1)
--      comprando 10 unidades de Semilla de maiz (id=3)
EXEC sp_registrar_pedido
    @numero      = 'PED-005',
    @fecha       = '2026-05-01',
    @cliente_id  = 1,
    @metodo_pago = 'digital',
    @producto_id = 3,
    @cantidad    = 10;

-- SP2: Ver historial completo de Juan Perez en 2026
EXEC sp_historial_cliente
    @cliente_id  = 1,
    @fecha_desde = '2026-01-01',
    @fecha_hasta = '2026-12-31';
GO