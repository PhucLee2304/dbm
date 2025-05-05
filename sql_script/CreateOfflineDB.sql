--CREATE DATABASE OfflineDB;

USE OfflineDB;
go

--CREATE TABLE user_table (
    --id BIGINT IDENTITY(1,1) PRIMARY KEY,
    --active BIT NOT NULL,
    --address NVARCHAR(255) NOT NULL,
    --email VARCHAR(255) NOT NULL UNIQUE,
    --name NVARCHAR(255) NOT NULL,
    --password VARCHAR(255) NOT NULL,
    --phone VARCHAR(255) NOT NULL UNIQUE,
    --role VARCHAR(255) NOT NULL CHECK (role IN ('CUSTOMER', 'STAFF', 'ADMIN'))
--);

--CREATE TABLE customer (
--    id BIGINT IDENTITY(1,1) PRIMARY KEY,
--    user_id BIGINT,
--    FOREIGN KEY (user_id) REFERENCES user_table(id)
--);

CREATE TABLE Staff (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATE NOT NULL,
    salary FLOAT NOT NULL CHECK (salary >= 0),
	created DATE NOT NULL
    --user_id BIGINT,
    --FOREIGN KEY (user_id) REFERENCES user_table(id)
);

CREATE TABLE Category (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
	created DATE NOT NULL
);

--CREATE TABLE supplier (
--    id BIGINT IDENTITY(1,1) PRIMARY KEY,
--    name NVARCHAR(255) NOT NULL,
--    address NVARCHAR(255) NOT NULL
--);

CREATE TABLE Product (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
    price FLOAT NOT NULL CHECK (price >= 0),
    category_id BIGINT,
    supplier_id BIGINT,
	stock BIGINT,
	created DATE NOT NULL
    FOREIGN KEY (category_id) REFERENCES Category(id),
    --FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);

CREATE TABLE OrderTable (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    created DATETIME NOT NULL,
    shipping_fee FLOAT NOT NULL,
    status VARCHAR(255) NOT NULL CHECK (status IN ('CANCELLED', 'COMPLETED', 'PENDING')),
    subtotal FLOAT NOT NULL CHECK (subtotal >= 0),
    total FLOAT NOT NULL,
	--note NVARCHAR(255),
    --recipient_address NVARCHAR(255) NOT NULL,
    --recipient_name NVARCHAR(255) NOT NULL,
    --recipient_phone VARCHAR(255) NOT NULL,
    --customer_id BIGINT,
	staff_id BIGINT,
	FOREIGN KEY (staff_id) REFERENCES Staff(id)
    --FOREIGN KEY (customer_id) REFERENCES user_table(id)
);

CREATE TABLE OrderDetail (
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price FLOAT NOT NULL CHECK (price >= 0),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES OrderTable(id),
    FOREIGN KEY (product_id) REFERENCES Product(id)
);

CREATE TABLE TimeSheet (
	id BIGINT IDENTITY(1,1) PRIMARY KEY,
    staff_id BIGINT,
    FOREIGN KEY (staff_id) REFERENCES Staff(id)
);

CREATE TABLE RecordDay (
    day DATE NOT NULL,
    time_sheet_id BIGINT NOT NULL,
    checkin DATETIME NOT NULL,
    checkout DATETIME NOT NULL,
    in_status VARCHAR(255) CHECK (in_status IN ('LATE', 'ONTIME')),
	out_status VARCHAR(255) CHECK (out_status IN ('EARLY', 'ONTIME')),
    PRIMARY KEY (day, time_sheet_id),
    FOREIGN KEY (time_sheet_id) REFERENCES TimeSheet(id)
);