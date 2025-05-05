USE DBM;  -- Chuyển sang cơ sở dữ liệu DBM
GO

CREATE PROCEDURE EtlSupplier
AS
BEGIN
    --DECLARE @last_import_date DATETIME;
    --DECLARE @current_time DATETIME;

    -- Lấy thời gian hiện tại (ngày giờ hiện tại)
    --SET @current_time = GETDATE();

    -- Lấy thời gian thực hiện ETL lần trước (nếu có) từ bảng ETL_Log
 --   SELECT TOP 1 @last_import_date = last_import_date
 --   FROM [Logs].[dbo].[SupplierLog]
	--ORDER BY id DESC

    -- Nếu chưa có bản ghi nào, thì khởi tạo @last_import_date với giá trị một ngày trước
    --IF @last_import_date IS NULL
    --BEGIN
    --    SET @last_import_date = '2025-05-01';  -- Giá trị khởi tạo, lấy dữ liệu từ một ngày trước
    --END

	MERGE INTO [dbo].[supplier] AS target
	USING [OutUserDB].[dbo].[Supplier] AS source
	ON target.id = source.id
	WHEN MATCHED AND (target.name <> source.name OR target.email <> source.email OR target.phone <> source.phone OR target.address <> source.address) THEN
        -- Cập nhật dữ liệu nếu bản ghi đã tồn tại và có sự thay đổi
        UPDATE SET 
            target.name = source.name,
            target.email = source.email,
            target.phone = source.phone,
            target.address = source.address
    WHEN NOT MATCHED BY TARGET THEN
        -- Chèn mới bản ghi nếu chưa tồn tại trong bảng đích
        INSERT (name, email, phone, address)
        VALUES (source.name, source.email, source.phone, source.address)
    WHEN NOT MATCHED BY SOURCE THEN
        -- Xóa bản ghi trong bảng đích nếu không còn tồn tại trong bảng nguồn
        DELETE;

    -- Cập nhật bảng ETL_Log với thời gian hiện tại (ngày giờ thực hiện)
    --INSERT INTO [Logs].[dbo].[SupplierLog] (last_import_date)
    --VALUES (@current_time);

    PRINT 'ETL process completed successfully for Supplier.';
END;
GO
