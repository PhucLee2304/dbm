
EXEC sp_add_new_staff;
CREATE OR ALTER PROCEDURE sp_add_new_staff
AS
BEGIN
    DECLARE @name NVARCHAR(255) = N'Nhân viên ' + CAST(ABS(CHECKSUM(NEWID())) % 1000 AS NVARCHAR);
    DECLARE @address NVARCHAR(255) = N'P' + CAST(ABS(CHECKSUM(NEWID())) % 500 AS NVARCHAR) + N' Lê Duẩn, Đà Nẵng';
    DECLARE @email NVARCHAR(255) = LOWER(REPLACE(@name, N' ', '')) + CAST(ABS(CHECKSUM(NEWID())) % 9999 AS NVARCHAR) + '@company.com';
    DECLARE @password NVARCHAR(255) = 'pass' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS NVARCHAR);
    DECLARE @phone NVARCHAR(255) = '09' + RIGHT('000000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000000 AS VARCHAR), 9);

    INSERT INTO user_table (active, address, email, name, password, phone, role)
    VALUES (1, @address, @email, @name, @password, @phone, 'STAFF');

    DECLARE @user_id BIGINT = SCOPE_IDENTITY();
    DECLARE @code VARCHAR(255) = 'STF' + RIGHT('0000' + CAST(@user_id AS VARCHAR), 4);
    DECLARE @salary FLOAT = 10000000 + (ABS(CHECKSUM(NEWID())) % 5000000);
    DECLARE @expiry_date DATE = DATEADD(YEAR, 1, GETDATE());

    INSERT INTO staff (code, expiry_date, salary, user_id)
    VALUES (@code, @expiry_date, @salary, @user_id);
END;


EXEC sp_add_new_supplier;
CREATE OR ALTER PROCEDURE sp_add_new_supplier
AS
BEGIN
    DECLARE @name NVARCHAR(255) = N'Nhà cung cấp ' + CAST(ABS(CHECKSUM(NEWID())) % 1000 AS NVARCHAR);
    DECLARE @address NVARCHAR(255) = N'Số ' + CAST(ABS(CHECKSUM(NEWID())) % 100 AS NVARCHAR) + N' Tô Hiến Thành, TP.HCM';

    INSERT INTO supplier (name, address) VALUES (@name, @address);
END;

EXEC sp_add_new_product;
CREATE OR ALTER PROCEDURE sp_add_new_product
AS
BEGIN
    DECLARE @name NVARCHAR(255) = N'Sản phẩm ' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS NVARCHAR);
    DECLARE @price FLOAT = 50000 + (ABS(CHECKSUM(NEWID())) % 5000000);
    DECLARE @category_id BIGINT = (SELECT TOP 1 id FROM category ORDER BY NEWID());
    DECLARE @supplier_id BIGINT = (SELECT TOP 1 id FROM supplier ORDER BY NEWID());

    IF @category_id IS NOT NULL AND @supplier_id IS NOT NULL
    BEGIN
        INSERT INTO product (name, price, category_id, supplier_id)
        VALUES (@name, @price, @category_id, @supplier_id);
    END
END;



EXEC sp_add_new_order;
CREATE OR ALTER PROCEDURE sp_add_new_order
AS
BEGIN
    DECLARE @staff_id BIGINT = (SELECT TOP 1 id FROM staff ORDER BY NEWID());
    IF @staff_id IS NULL RETURN;

    DECLARE @shipping_fee FLOAT = 30000 + (ABS(CHECKSUM(NEWID())) % 20000);
    DECLARE @status VARCHAR(255) = (SELECT TOP 1 value FROM (VALUES ('PENDING'), ('COMPLETED'), ('CANCELLED')) AS s(value) ORDER BY NEWID());

    DECLARE @subtotal FLOAT = 0;

    -- Create Order first (with temporary subtotal)
    INSERT INTO order_table (created, shipping_fee, status, subtotal, total, staff_id)
    VALUES (GETDATE(), @shipping_fee, @status, 0, 0, @staff_id);

    DECLARE @order_id BIGINT = SCOPE_IDENTITY();

    DECLARE @i INT = 0;
    WHILE @i < 3
    BEGIN
        DECLARE @product_id BIGINT = (SELECT TOP 1 id FROM product ORDER BY NEWID());
        DECLARE @quantity INT = 1 + ABS(CHECKSUM(NEWID()) % 5);
        DECLARE @price FLOAT = (SELECT price FROM product WHERE id = @product_id);

        IF NOT EXISTS (
            SELECT 1 FROM order_detail WHERE order_id = @order_id AND product_id = @product_id
        )
        BEGIN
            INSERT INTO order_detail (order_id, product_id, quantity, price)
            VALUES (@order_id, @product_id, @quantity, @price);

            SET @subtotal += (@price * @quantity);
        END

        SET @i += 1;
    END

    UPDATE order_table
    SET subtotal = @subtotal,
        total = @subtotal + @shipping_fee
    WHERE id = @order_id;
END;


Exec InsertRandomRecordDay;
CREATE PROCEDURE InsertRandomRecordDay
AS
BEGIN
    SET NOCOUNT ON;
	--Bạn có thể thay @today bằng 1 ngày cụ thể để thêm bản ghi cho nhiều ngày khác nhau.
	--Có thể mở rộng để thêm dữ liệu cho nhiều ngày liền kề (theo tuần, tháng...) nếu cần.
    DECLARE @today DATE = CAST(GETDATE() AS DATE);
	--DECLARE @today DATE = '2025-07-01';
    DECLARE @datetimeBase DATETIME2(6) = CAST(@today AS DATETIME2(6));  -- 👈 chuyển đổi kiểu
    DECLARE @time_sheet_id BIGINT;
    DECLARE @checkin DATETIME2(6);
    DECLARE @checkout DATETIME2(6);
    DECLARE @status VARCHAR(255);

    DECLARE time_sheet_cursor CURSOR FOR
        SELECT id FROM time_sheet;

    OPEN time_sheet_cursor;
    FETCH NEXT FROM time_sheet_cursor INTO @time_sheet_id;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM record_day 
            WHERE day = @today AND time_sheet_id = @time_sheet_id
        )
        BEGIN
            -- Sinh thời gian checkin ngẫu nhiên từ 7:30 - 9:30 (450 - 570 phút sau nửa đêm)
            SET @checkin = DATEADD(MINUTE, CAST(RAND() * 120 + 450 AS INT), @datetimeBase);
            SET @checkout = DATEADD(HOUR, 8, @checkin);

            -- Xác định status
            IF CAST(@checkin AS TIME) <= '08:15:00'
                SET @status = 'ONTIME';
            ELSE IF CAST(@checkin AS TIME) <= '09:00:00'
                SET @status = 'LATE';
            ELSE
                SET @status = 'ABSENT';

            -- Nếu absent, gán giờ checkin/checkout = 00:00 cùng ngày
            IF @status = 'ABSENT'
            BEGIN
                SET @checkin = DATEADD(SECOND, 0, @datetimeBase);
                SET @checkout = DATEADD(SECOND, 0, @datetimeBase);
            END

            INSERT INTO record_day (day, time_sheet_id, checkin, checkout, status)
            VALUES (@today, @time_sheet_id, @checkin, @checkout, @status);
        END

        FETCH NEXT FROM time_sheet_cursor INTO @time_sheet_id;
    END

    CLOSE time_sheet_cursor;
    DEALLOCATE time_sheet_cursor;
END
GO



--EXEC sp_add_new_attendance;
--CREATE OR ALTER PROCEDURE sp_add_new_attendance
--AS
--BEGIN
--    DECLARE @staff_id BIGINT = (SELECT TOP 1 id FROM staff ORDER BY NEWID());
--    IF @staff_id IS NULL RETURN;

--    INSERT INTO time_sheet (staff_id) VALUES (@staff_id);
--    DECLARE @time_sheet_id BIGINT = SCOPE_IDENTITY();

--    DECLARE @day DATE = CAST(GETDATE() AS DATE);
--    DECLARE @checkin DATETIME2(6) = DATEADD(MINUTE, ABS(CHECKSUM(NEWID()) % 60), CAST(@day AS DATETIME2(6)) + '08:00');
--    DECLARE @checkout DATETIME2(6) = @checkin + '08:00:00';
--    DECLARE @status VARCHAR(255) = (SELECT TOP 1 value FROM (VALUES ('ONTIME'), ('LATE'), ('ABSENT')) AS s(value) ORDER BY NEWID());

--    INSERT INTO record_day (day, time_sheet_id, checkin, checkout, status)
--    VALUES (@day, @time_sheet_id, @checkin, @checkout, @status);
--END;
