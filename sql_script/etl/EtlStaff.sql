USE DBM;
GO

CREATE OR ALTER PROCEDURE EtlStaff
AS
BEGIN
    DECLARE @new_user_id TABLE (user_id BIGINT, code VARCHAR(255), expiry_date DATE, salary FLOAT);  -- Bảng tạm lưu user_id, code, expiry_date, salary

    -- MERGE dữ liệu từ OfflineDB.dbo.staff vào DBM.dbo.user_table (role = 'STAFF')
    MERGE INTO [dbo].[user_table] AS target
    USING [OfflineDB].[dbo].[Staff] AS source
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
            target.role = 'STAFF'  -- Cập nhật role là STAFF
    WHEN NOT MATCHED BY TARGET
        THEN 
            -- Chèn vào bảng user_table và lưu user_id vào bảng tạm
            INSERT (active, address, email, name, phone, password, role)
            VALUES (source.active, source.address, source.email, source.name, source.phone, source.password, 'STAFF')
            OUTPUT inserted.id, source.code, source.expiry_date, source.salary INTO @new_user_id(user_id, code, expiry_date, salary);  -- Lưu user_id, code, expiry_date, salary vào bảng tạm

    -- Chèn vào bảng staff với user_id từ bảng tạm
    IF EXISTS (SELECT 1 FROM @new_user_id)
    BEGIN
        INSERT INTO [dbo].[staff] (user_id, code, expiry_date, salary)
        SELECT n.user_id, n.code, n.expiry_date, n.salary
        FROM @new_user_id n;  -- Chèn tất cả dữ liệu từ bảng tạm vào bảng staff
    END

    -- Cập nhật bảng DBM.dbo.staff với giá trị mặc định cho branch_id nếu chưa có
    UPDATE [dbo].[staff]
    SET branch_id = ISNULL(branch_id, 2)  -- Nếu NULL, gán giá trị mặc định là 2
    WHERE branch_id IS NULL;

    PRINT 'ETL process completed successfully for Staff.';
END;
GO
