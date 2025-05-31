USE DBM;  -- Chuyển sang cơ sở dữ liệu DBM
GO

CREATE OR ALTER PROCEDURE EtlCustomer
AS
BEGIN
    DECLARE @new_user_id_table TABLE (user_id BIGINT);  -- Khai báo bảng để lưu nhiều user_id

    -- Xử lý MERGE dữ liệu từ OutUserDB.dbo.customer vào DBM.dbo.user_table (role = 'CUSTOMER')
    MERGE INTO [dbo].[user_table] AS target
    USING [OutUserDB].[dbo].[Customer] AS source
    ON target.email = source.email  -- So sánh theo email để tránh trùng lặp
    WHEN MATCHED AND (
        target.active <> source.active OR 
        target.address <> source.address OR 
        target.email <> source.email OR 
        target.name <> source.name OR 
        target.phone <> source.phone OR 
        target.password <> source.password
    )
        THEN UPDATE SET 
            target.active = source.active,
            target.address = source.address,
            target.email = source.email,
            target.name = source.name,
            target.phone = source.phone,
            target.password = source.password,
            target.role = 'CUSTOMER'  -- Cập nhật role là CUSTOMER
    WHEN NOT MATCHED BY TARGET
        THEN 
            -- Chèn vào bảng user_table và lấy user_id vào bảng tạm
            INSERT (active, address, email, name, phone, password, role)
            VALUES (source.active, source.address, source.email, source.name, source.phone, source.password, 'CUSTOMER')
            OUTPUT inserted.id INTO @new_user_id_table;  -- Lưu tất cả user_id vào bảng tạm

    -- Chèn vào bảng customer với user_id từ bảng tạm
    INSERT INTO [dbo].[customer] (user_id)
    SELECT user_id FROM @new_user_id_table;  -- Chèn tất cả user_id mới vào bảng customer

    PRINT 'ETL process completed successfully for Customer.';
END;
GO
