--create database OutUserDB
use OutUserDB

create table Customer(
	id BIGINT IDENTITY(1,1) PRIMARY KEY,
    active BIT NOT NULL,
    address NVARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL UNIQUE,
	created DATE NOT NULL
)

create table Supplier(
	id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
	email NVARCHAR(255) NOT NULL UNIQUE,
	phone NVARCHAR(255) NOT NULL UNIQUE,
    address NVARCHAR(255) NOT NULL UNIQUE,
	created DATE NOT NULL
)