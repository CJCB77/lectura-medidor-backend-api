-- Database: db_interagua

-- DROP DATABASE IF EXISTS db_interagua;

-- CREATE DATABASE db_interagua;
    
    
CREATE TABLE rol(
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50)
);    

CREATE TABLE usuario(
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    role BIGINT NOT NULL REFERENCES rol(id),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vivienda(
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(150) NOT NULL UNIQUE,
    direccion VARCHAR(150) NOT NULL,
    mz VARCHAR(150) NOT NULL,
    villa VARCHAR(150) NOT NULL,
    
);

CREATE TABLE registro(
    id BIGSERIAL PRIMARY KEY,
    idUsuario BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    codigoVivienda NOT NULL REFERENCES vivienda(codigo) ON DELETE CASCADE,
    imagen VARCHAR(150) NOT NULL,
    lectura VARCHAR(150),
    gps VARCHAR(150),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tareas(
    id BIGSERIAL PRIMARY KEY,
    idUsuario BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    
);

CREATE TABLE cliente(
	id BIGSERIAL PRIMARY KEY,
	cedula VARCHAR(10) NOT NULL UNIQUE,
	nombres VARCHAR(150) NOT NULL,
	apellidos VARCHAR(150) NOT NULL,
	correo VARCHAR(150) NOT NULL,
	celular VARCHAR(50) NOT NULL
);

CREATE TABLE planilla(
	id BIGSERIAL PRIMARY KEY,
	cedula_cliente VARCHAR(10) NOT NULL REFERENCES cliente(cedula) ON DELETE CASCADE,
	id_registro BIGSERIAL NOT NULL REFERENCES registro(id),
	valor DECIMAL(10,2) NOT NULL,
	fecha_pago DATE NOT NULL,
	fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tareas DROP COLUMN descripcion;

ALTER TABLE tareas ADD completada BOOLEAN DEFAULT FALSE;

ALTER TABLE tareas ADD codigo_vivienda VARCHAR(150) 
NOT NULL REFERENCES vivienda(codigo) DEFAULT 'SAI102';

DELETE FROM tareas WHERE codigo_vivienda = 'SAI102';

INSERT INTO tareas(id_usuario,codigo_vivienda,titulo)
VALUES(23,'CENT103','Tomar lectura de vivienda CENT103');

ALTER TABLE vivienda 
ADD COLUMN id_cliente VARCHAR(10) NOT NULL REFERENCES cliente(cedula) DEFAULT '0920340866';

DELETE FROM registro WHERE imagen_procesada IS NULL;

ALTER TABLE registro DROP COLUMN id_usuario;

ALTER TABLE registro ADD COLUMN id_tarea BIGINT NOT NULL REFERENCES tareas(id) DEFAULT 18;