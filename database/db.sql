-- Database: db_interagua

DROP DATABASE IF EXISTS db_interagua;

CREATE DATABASE db_interagua
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
    
    
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
    mz VARCHAR(150) NOT NULL,
    villa VARCHAR(150) NOT NULL,
    
);

CREATE TABLE registro(
    id BIGSERIAL PRIMARY KEY,
    idUsuario BIGINT NOT NULL REFERENCES usuario(id),
    codigoVivienda NOT NULL REFERENCES vivienda(codigo),
    imagen VARCHAR(150) NOT NULL,
    lectura VARCHAR(150),
    gps VARCHAR(150),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tareas(
    id BIGSERIAL PRIMARY KEY,
    idUsuario BIGINT NOT NULL REFERENCES usuario(id),
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    
);
