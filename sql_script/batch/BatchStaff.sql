USE OfflineDB;
GO

CREATE OR ALTER PROCEDURE InsertBatchStaff
AS
BEGIN
    DECLARE @counter INT = 1;
    DECLARE @batch_size INT = 10000;  -- Số lượng nhân viên cần chèn
    DECLARE @staff_id BIGINT;
    DECLARE @staff_code VARCHAR(255);
    DECLARE @expiry_date DATE;
    DECLARE @salary FLOAT;
    DECLARE @active BIT;
    DECLARE @address NVARCHAR(255);
    DECLARE @email VARCHAR(255);
    DECLARE @name NVARCHAR(255);
    DECLARE @password VARCHAR(255);
    DECLARE @phone VARCHAR(255);
    DECLARE @created DATETIME;

    -- Bắt đầu vòng lặp
    WHILE @counter <= @batch_size
    BEGIN
        -- Tạo code cho nhân viên (staff1, staff2, ...)
        SET @staff_code = 'Staff' + CAST(@counter AS VARCHAR(10));

        -- Lấy expiry_date ngẫu nhiên trong khoảng 1 năm kể từ hôm nay
        SET @expiry_date = DATEADD(DAY, ROUND(RAND() * 365, 0), GETDATE()); -- Random date within 1 year

        -- Lấy salary ngẫu nhiên từ 500 đến 2000
        SET @salary = ROUND(RAND() * 1500 + 500, 2);  -- Salary between 500 and 2000

        -- Tạo giá trị ngẫu nhiên cho các trường còn lại
        SET @active = 1;  -- Nhân viên sẽ được active
        SET @address = 'Address ' + CAST(@counter AS VARCHAR(10));  -- Tạo địa chỉ giả
        SET @email = 'staff' + CAST(@counter AS VARCHAR(10)) + '@example.com';  -- Tạo email giả
        SET @name = 'Staff ' + CAST(@counter AS VARCHAR(10));  -- Tạo tên giả
        SET @password = '1234';  -- Mật khẩu mặc định
        SET @phone = '0' + CAST(@counter AS VARCHAR(10));  -- Tạo số điện thoại giả
        SET @created = GETDATE();  -- Ngày tạo là thời gian hiện tại

        -- Chèn dữ liệu vào bảng Staff
        INSERT INTO [dbo].[Staff] ([active], [address], [email], [name], [password], [phone], [code], [expiry_date], [salary], [created])
        VALUES
        (
            @active,
            @address,
            @email,
            @name,
            @password,
            @phone,
            @staff_code,
            @expiry_date,
            @salary,
            @created
        );

        -- Lấy staff_id từ bản ghi vừa chèn
        SET @staff_id = SCOPE_IDENTITY();

        -- Chèn dữ liệu vào bảng TimeSheet
        INSERT INTO [dbo].[TimeSheet] ([staff_id])
        VALUES
        (
            @staff_id
        );

        -- Tăng biến đếm lên
        SET @counter = @counter + 1;
    END

    PRINT 'Batch insert completed for 10000 staff members.';
END;
GO
