use OutUserDB
go

CREATE PROCEDURE InsertSupplier
AS
BEGIN
    --DECLARE @supplier_id BIGINT;
    DECLARE @supplier_name NVARCHAR(255);
    DECLARE @supplier_email NVARCHAR(255);
    DECLARE @supplier_phone NVARCHAR(255);
    DECLARE @supplier_address NVARCHAR(255);
    DECLARE @supplier_index INT;

    -- Tính toán chỉ mục cho nhà cung cấp mới
    SET @supplier_index = (SELECT COUNT(*) FROM [dbo].[Supplier]) + 1;

    -- Tạo tên nhà cung cấp ngẫu nhiên
    SET @supplier_name = 'Supplier ' + CAST(@supplier_index AS NVARCHAR(255));

    -- Tạo email nhà cung cấp ngẫu nhiên theo dạng supplier1@example.com, supplier2@example.com,...
    SET @supplier_email = 'supplier' + CAST(@supplier_index AS NVARCHAR(10)) + '@gmail.com';

    -- Tạo số điện thoại nhà cung cấp ngẫu nhiên
    SET @supplier_phone = @supplier_index;

    -- Tạo địa chỉ nhà cung cấp ngẫu nhiên
    SET @supplier_address = 'Address ' + CAST(@supplier_index AS NVARCHAR(255));

    -- Chèn dữ liệu vào bảng Supplier
    INSERT INTO [OutUserDB].[dbo].[Supplier] ([name], [email], [phone], [address], [created])
    VALUES
    (
        @supplier_name, -- Tên nhà cung cấp (Supplier 1, Supplier 2,...)
        @supplier_email, -- Email nhà cung cấp (supplier1@example.com,...)
        @supplier_phone, -- Số điện thoại nhà cung cấp (000000001, 000000002,...)
        @supplier_address, -- Địa chỉ nhà cung cấp (Address 1, Address 2,...)
		GETDATE()
    );
END;
GO
