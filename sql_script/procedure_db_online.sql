-- Thêm khách hàng mới Exec InsertNewCustomer;
CREATE PROCEDURE InsertNewCustomer
AS
BEGIN
    DECLARE @userId BIGINT;
    DECLARE @RandomName NVARCHAR(255) = CONCAT('Customer_', LEFT(NEWID(), 5));
    DECLARE @RandomAddress NVARCHAR(255) = CONCAT(ABS(CHECKSUM(NEWID())) % 999, ' Main St');
    DECLARE @RandomPassword NVARCHAR(255) = CONCAT('pass', LEFT(NEWID(), 4));

    INSERT INTO user_table (active, address, email, name, password, phone, role)
    VALUES (
        1,
        @RandomAddress,
        CONCAT('customer_', NEWID(), '@example.com'),
        @RandomName,
        @RandomPassword,
        CONCAT('09', CAST(ABS(CHECKSUM(NEWID())) % 1000000000 AS VARCHAR)),
        'CUSTOMER'
    );

    SET @userId = SCOPE_IDENTITY();

    INSERT INTO customer (user_id)
    VALUES (@userId);
END
GO

-- Thêm nhân viên mới Exec InsertNewStaff;
CREATE PROCEDURE InsertNewStaff
AS
BEGIN
    DECLARE @userId BIGINT;
    DECLARE @RandomName NVARCHAR(255) = CONCAT('Staff_', LEFT(NEWID(), 5));
    DECLARE @RandomAddress NVARCHAR(255) = CONCAT(ABS(CHECKSUM(NEWID())) % 999, ' Road');
    DECLARE @RandomPassword NVARCHAR(255) = CONCAT('pw', LEFT(NEWID(), 6));
    DECLARE @RandomSalary FLOAT = CAST(RAND() * 5000 + 3000 AS FLOAT);

    INSERT INTO user_table (active, address, email, name, password, phone, role)
    VALUES (
        1,
        @RandomAddress,
        CONCAT('staff_', NEWID(), '@example.com'),
        @RandomName,
        @RandomPassword,
        CONCAT('08', CAST(ABS(CHECKSUM(NEWID())) % 1000000000 AS VARCHAR)),
        'STAFF'
    );

    SET @userId = SCOPE_IDENTITY();

    INSERT INTO staff (code, expiry_date, salary, user_id)
    VALUES (
        CONCAT('STF', FORMAT(GETDATE(), 'yyyyMMddHHmmss')),
        DATEADD(YEAR, 1, GETDATE()),
        @RandomSalary,
        @userId
    );
END
GO

-- Exec InsertNewSupplier;
CREATE PROCEDURE InsertNewSupplier
AS
BEGIN
    DECLARE @name VARCHAR(255) = CONCAT('Supplier_', NEWID());
    DECLARE @address VARCHAR(255) = CONCAT('Address_', NEWID());

    INSERT INTO supplier (name, address)
    VALUES (@name, @address);
END
GO

--Exec InsertNewProduct;
CREATE PROCEDURE InsertNewProduct
AS
BEGIN
    DECLARE @productName VARCHAR(255) = CONCAT('Product_', NEWID());
    DECLARE @price FLOAT = ROUND(RAND() * 1000000, 0);

    DECLARE @categoryId BIGINT;
    DECLARE @supplierId BIGINT;

    -- Lấy category ngẫu nhiên
    SELECT TOP 1 @categoryId = id FROM category ORDER BY NEWID();

    -- Lấy supplier ngẫu nhiên
    SELECT TOP 1 @supplierId = id FROM supplier ORDER BY NEWID();

    -- Nếu có category và supplier mới thêm rồi thì chèn sản phẩm
    IF @categoryId IS NOT NULL AND @supplierId IS NOT NULL
    BEGIN
        INSERT INTO product (name, price, category_id, supplier_id)
        VALUES (@productName, @price, @categoryId, @supplierId);
    END
END
GO

--Exec InsertRandomOrder;
CREATE PROCEDURE InsertRandomOrder
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @customerId BIGINT;
    DECLARE @orderId BIGINT;
    DECLARE @shippingFee FLOAT = ROUND(RAND() * 30000 + 10000, 0); -- 10k ~ 40k
    DECLARE @status VARCHAR(255);
    DECLARE @subtotal FLOAT = 0;
    DECLARE @total FLOAT;
    DECLARE @recipientName VARCHAR(255);
    DECLARE @recipientPhone VARCHAR(255);
    DECLARE @recipientAddress VARCHAR(255);
    DECLARE @note VARCHAR(255) = 'Giao trong giờ hành chính';

    -- 1. Chọn ngẫu nhiên customer
    SELECT TOP 1 @customerId = id FROM customer ORDER BY NEWID();

    -- Nếu không có customer thì kết thúc
    IF @customerId IS NULL RETURN;

    -- 2. Sinh thông tin người nhận từ customer
    SELECT 
        @recipientName = u.name, 
        @recipientPhone = u.phone, 
        @recipientAddress = u.address
    FROM user_table u
    INNER JOIN customer c ON c.user_id = u.id
    WHERE c.id = @customerId;

    -- 3. Chọn status ngẫu nhiên
    SELECT @status = value 
    FROM (VALUES ('COMPLETED'), ('PENDING'), ('CANCELLED')) AS statuses(value)
    ORDER BY NEWID();

    -- 4. Tạo đơn hàng chính
    INSERT INTO order_table (created, shipping_fee, status, subtotal, total, note, recipient_address, recipient_name, recipient_phone, customer_id)
    VALUES (GETDATE(), @shippingFee, @status, 0, 0, @note, @recipientAddress, @recipientName, @recipientPhone, @customerId);

    SET @orderId = SCOPE_IDENTITY();

    -- 5. Chọn 1-3 sản phẩm ngẫu nhiên
    DECLARE @productId BIGINT, @quantity INT, @price FLOAT, @i INT = 0, @maxItems INT = ROUND(RAND() * 2 + 1, 0);

    WHILE @i < @maxItems
    BEGIN
        -- Lấy sản phẩm ngẫu nhiên
        SELECT TOP 1 @productId = id, @price = price FROM product ORDER BY NEWID();

        -- Nếu sản phẩm tồn tại
        IF @productId IS NOT NULL
        BEGIN
            SET @quantity = ROUND(RAND() * 4 + 1, 0); -- 1~5
            INSERT INTO order_detail (order_id, product_id, quantity, price)
            VALUES (@orderId, @productId, @quantity, @price);

            SET @subtotal = @subtotal + (@quantity * @price);
        END

        SET @i = @i + 1;
    END

    SET @total = @subtotal + @shippingFee;

    -- 6. Cập nhật lại tổng đơn hàng
    UPDATE order_table
    SET subtotal = @subtotal,
        total = @total
    WHERE id = @orderId;
END
GO

--Exec InsertRandomRecordDay;
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

