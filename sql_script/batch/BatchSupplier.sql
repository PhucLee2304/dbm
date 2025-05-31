USE OutUserDB;
GO

CREATE OR ALTER PROCEDURE InsertSupplierBatch
AS
BEGIN
    DECLARE @batch_size INT = 1000;  -- Kích thước mỗi nhóm (batch)
    DECLARE @current_batch INT = 1;   -- Biến để theo dõi nhóm hiện tại
    DECLARE @total_records INT = 10000;  -- Tổng số bản ghi cần chèn
    DECLARE @supplier_name NVARCHAR(255);
    DECLARE @supplier_email NVARCHAR(255);
    DECLARE @supplier_phone NVARCHAR(255);
    DECLARE @supplier_address NVARCHAR(255);
    DECLARE @supplier_index INT;
    DECLARE @counter INT;

    -- Lặp qua các nhóm dữ liệu
    WHILE @current_batch <= @total_records / @batch_size + 1
    BEGIN
        -- Xử lý dữ liệu theo nhóm
        SET @counter = 0;

        -- Tạo và chèn dữ liệu cho mỗi nhóm
        WHILE @counter < @batch_size
        BEGIN
            -- Tính toán chỉ mục cho nhà cung cấp mới
            SET @supplier_index = (@current_batch - 1) * @batch_size + @counter + 1;

            -- Tạo tên nhà cung cấp ngẫu nhiên
            SET @supplier_name = 'Supplier ' + CAST(@supplier_index AS NVARCHAR(255));

            -- Tạo email nhà cung cấp ngẫu nhiên theo dạng supplier1@example.com, supplier2@example.com,...
            SET @supplier_email = 'supplier' + CAST(@supplier_index AS NVARCHAR(10)) + '@gmail.com';

            -- Tạo số điện thoại nhà cung cấp ngẫu nhiên
            SET @supplier_phone = '00000000' + CAST(@supplier_index AS NVARCHAR(10));

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
                GETDATE()  -- Ngày tạo
            );

            SET @counter = @counter + 1;
        END

        -- Cập nhật biến nhóm
        SET @current_batch = @current_batch + 1;

        PRINT 'Batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' processed.';
    END

    PRINT 'ETL process completed successfully for Supplier.';
END;
GO
