USE OnlineDB;
GO

CREATE OR ALTER PROCEDURE InsertBatchOnlineOrders
AS
BEGIN
    DECLARE @counter INT = 1;
    DECLARE @batch_size INT = 1000;  -- Số lượng đơn hàng cần chèn mỗi batch
    DECLARE @total_orders INT = 1000000; -- Tổng số đơn hàng cần chèn
    DECLARE @order_id BIGINT;
    DECLARE @created DATETIME;
    DECLARE @shipping_fee FLOAT;
    DECLARE @status VARCHAR(255);
    DECLARE @note NVARCHAR(255);
    DECLARE @subtotal FLOAT;
    DECLARE @total FLOAT;
    DECLARE @recipient_address NVARCHAR(255);
    DECLARE @recipient_name NVARCHAR(255);
    DECLARE @recipient_phone VARCHAR(255);
    DECLARE @customer_id BIGINT;
    DECLARE @product_id BIGINT;
    DECLARE @quantity INT;
    DECLARE @product_price FLOAT;
    DECLARE @price FLOAT;
    DECLARE @stock INT;
    DECLARE @num_products INT;

    -- Bắt đầu vòng lặp
    WHILE @counter <= @total_orders
    BEGIN
        -- Bắt đầu giao dịch cho mỗi batch
        BEGIN TRANSACTION;

        PRINT 'Processing batch ' + CAST(@counter AS NVARCHAR(10)) + ' of ' + CAST(@total_orders / @batch_size AS NVARCHAR(10));

        -- Khởi tạo các giá trị cần thiết cho đơn hàng
        SET @created = GETDATE();
        SET @status = (SELECT TOP 1 status FROM (VALUES ('CANCELLED'), ('COMPLETED'), ('PENDING')) AS t(status) ORDER BY NEWID());
        SET @note = NEWID();  -- Tạo UUID ngẫu nhiên cho note
        SET @shipping_fee = ROUND(RAND() * 45 + 5, 2);  -- Giá trị ngẫu nhiên từ 5 đến 50
        SET @subtotal = 0;
        SET @total = @shipping_fee;

        -- Lấy thông tin ngẫu nhiên của customer từ OutUserDB.customer
        SELECT TOP 1
            @recipient_address = address,
            @recipient_name = name,
            @recipient_phone = phone,
            @customer_id = id
        FROM [OutUserDB].[dbo].[Customer]
        ORDER BY NEWID();

        -- Kiểm tra xem recipient_address có NULL không và xử lý
        IF @recipient_address IS NULL OR @recipient_name IS NULL OR @recipient_phone IS NULL
        BEGIN
            RAISERROR('Customer data is missing! Please check customer details.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Chèn dữ liệu vào bảng OrderTable
        INSERT INTO [dbo].[OrderTable] ([created], [shipping_fee], [status], [subtotal], [total], [note], [recipient_address], [recipient_name], [recipient_phone], [customer_id])
        VALUES
        (
            @created, 
            @shipping_fee,
            @status,
            @subtotal,
            @total,
            @note,
            @recipient_address,
            @recipient_name,
            @recipient_phone,
            @customer_id
        );

        -- Lấy order_id của đơn hàng vừa chèn
        SET @order_id = SCOPE_IDENTITY();

        -- Lấy số lượng sản phẩm ngẫu nhiên từ 1 đến 3
        SET @num_products = ROUND(RAND() * 3 + 1, 0);

        -- Lấy các sản phẩm ngẫu nhiên
        ;WITH RandomProducts AS (
            SELECT TOP (@num_products) id, price
            FROM [OnlineDB].[dbo].[Product]
            ORDER BY NEWID()
        )
        -- Thực thi SELECT từ CTE để lấy dữ liệu
        SELECT id, price
        INTO #TempRandomProducts
        FROM RandomProducts;

        -- Lặp qua các sản phẩm đã chọn ngẫu nhiên
        DECLARE product_cursor CURSOR FOR
        SELECT id, price
        FROM #TempRandomProducts;

        OPEN product_cursor;
        FETCH NEXT FROM product_cursor INTO @product_id, @product_price;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Lấy quantity ngẫu nhiên từ 1 đến 5
            SET @quantity = ROUND(RAND() * 5 + 1, 0);

            -- Kiểm tra số lượng tồn kho của sản phẩm
            SELECT @stock = stock
            FROM [dbo].[Product]
            WHERE id = @product_id;

            -- Kiểm tra xem số lượng tồn kho có đủ không
            IF @quantity > @stock
            BEGIN
                -- Nếu không đủ, báo lỗi và dừng thủ tục
                RAISERROR('Not enough stock for product_id = %I64d. Available stock = %d, Requested quantity = %d.', 16, 1, @product_id, @stock, @quantity);
                CLOSE product_cursor;
                DEALLOCATE product_cursor;
                DROP TABLE #TempRandomProducts;  -- Xóa bảng tạm
                ROLLBACK TRANSACTION; -- Dừng thủ tục
                RETURN;
            END

            -- Tính toán subtotal cho sản phẩm (price * quantity)
            SET @price = @product_price * @quantity;

            -- Cộng vào subtotal tổng
            SET @subtotal = @subtotal + @price;

            -- Chèn dữ liệu vào bảng OrderDetail cho mỗi sản phẩm
            INSERT INTO [dbo].[OrderDetail] ([order_id], [product_id], [quantity], [price])
            VALUES
            (
                @order_id,  -- Đảm bảo sử dụng order_id đã có
                @product_id,
                @quantity,
                @price
            );

            -- Giảm số lượng tồn kho trong bảng Product
            UPDATE [dbo].[Product]
            SET stock = stock - @quantity
            WHERE id = @product_id;

            -- Lấy sản phẩm tiếp theo
            FETCH NEXT FROM product_cursor INTO @product_id, @product_price;
        END;

        -- Đóng và giải phóng con trỏ
        CLOSE product_cursor;
        DEALLOCATE product_cursor;

        -- Xóa bảng tạm
        DROP TABLE #TempRandomProducts;

        -- Tính toán tổng tiền (total = subtotal + shipping fee)
        SET @total = @subtotal + @shipping_fee;

        -- Cập nhật lại OrderTable với subtotal và total
        UPDATE [dbo].[OrderTable]
        SET [subtotal] = @subtotal, [total] = @total
        WHERE id = @order_id;

        -- Cam kết giao dịch cho batch này
        COMMIT TRANSACTION;

        -- Tăng biến đếm lên
        SET @counter = @counter + 1;

        -- In thông tin về đơn hàng vừa chèn (để kiểm tra)
        PRINT 'Inserted Order ID: ' + CAST(@order_id AS NVARCHAR(20));

    END

    PRINT 'Batch processing completed for 1 million orders.';
END;
GO
