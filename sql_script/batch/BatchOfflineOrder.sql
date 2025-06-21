USE OfflineDB;
GO

CREATE OR ALTER PROCEDURE InsertBatchOfflineOrders
AS
BEGIN
    DECLARE @batch_size INT = 50;  -- Chèn 1000 đơn hàng mỗi batch
    DECLARE @total_orders INT = 500; -- Tổng số đơn hàng cần chèn
    DECLARE @current_batch INT = 1;  -- Biến đếm cho vòng lặp chính
    DECLARE @order_id BIGINT;
    DECLARE @created DATETIME;
    DECLARE @shipping_fee FLOAT;
    DECLARE @status VARCHAR(255);
    DECLARE @subtotal FLOAT;
    DECLARE @total FLOAT;
    DECLARE @staff_id BIGINT;
    DECLARE @product_id BIGINT;
    DECLARE @quantity INT;
    DECLARE @product_price FLOAT;
    DECLARE @price FLOAT;
    DECLARE @stock INT;
    DECLARE @num_products INT;

    -- Bắt đầu vòng lặp xử lý từng batch
    WHILE @current_batch <= @total_orders / @batch_size
    BEGIN
        DECLARE @counter INT = 1; -- Biến đếm cho số lượng đơn hàng trong mỗi batch

        -- Bắt đầu giao dịch cho mỗi batch
        BEGIN TRANSACTION;

        PRINT 'Processing batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' of ' + CAST(@total_orders / @batch_size AS NVARCHAR(10));

        -- Khởi tạo các giá trị cần thiết cho đơn hàng
        SET @shipping_fee = 0;
        SET @subtotal = 0;
        SET @total = @shipping_fee;

        -- Lấy thời gian hiện tại
        SET @created = DATEADD(SECOND, FLOOR(RAND() * 86400), DATEADD(DAY, -FLOOR(RAND() * 30), CAST(GETDATE() AS DATETIME)));

        -- Lấy status ngẫu nhiên (CANCELLED, COMPLETED, PENDING)
        SET @status = (SELECT TOP 1 status FROM (VALUES ('CANCELLED'), ('COMPLETED'), ('PENDING')) AS t(status) ORDER BY NEWID());

        -- Lấy staff_id ngẫu nhiên từ bảng Staff
        SELECT TOP 1 @staff_id = id FROM [dbo].[Staff] ORDER BY NEWID();

        -- Lặp qua số lượng đơn hàng cần chèn trong mỗi batch
        WHILE @counter <= @batch_size
        BEGIN
            -- Chèn vào bảng OrderTable trước để lấy order_id
            INSERT INTO [dbo].[OrderTable] ([created], [shipping_fee], [status], [subtotal], [total], [staff_id])
            VALUES
            (
                @created, 
                @shipping_fee,
                @status,
                @subtotal,
                @total,
                @staff_id
            );

            -- Lấy order_id của đơn hàng vừa chèn
            SET @order_id = SCOPE_IDENTITY();

            -- Lấy số lượng sản phẩm ngẫu nhiên từ 1 đến 3
            SET @num_products = ROUND(RAND() * 3 + 1, 0);

            -- Lấy các sản phẩm ngẫu nhiên
            ;WITH RandomProducts AS (
                SELECT TOP (@num_products) id, price
                FROM [OfflineDB].[dbo].[Product]
                ORDER BY NEWID()
            )
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
                    RETURN; -- Dừng thủ tục
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

            -- Tăng biến đếm lên cho mỗi đơn hàng trong batch
            SET @counter = @counter + 1;  -- Tăng số lượng đã xử lý

        END

        -- Cam kết giao dịch cho batch này
        COMMIT TRANSACTION;

        -- Tăng biến đếm cho batch tiếp theo
        SET @current_batch = @current_batch + 1;

        PRINT 'Processed batch ' + CAST(@current_batch AS NVARCHAR(10));

    END

    PRINT 'Batch processing completed for 1 million orders.';
END;
GO
