USE DBM;  -- Chuyển sang cơ sở dữ liệu DBM
GO

CREATE OR ALTER PROCEDURE EtlOnlineOrder
AS
BEGIN
    BEGIN TRY
        -- Bắt đầu giao dịch để đảm bảo tính toàn vẹn
        BEGIN TRANSACTION;

        PRINT 'Starting ETL process for Online Orders...';

        -- Kiểm tra dữ liệu hiện có
        PRINT 'Current data in order_table:';
        SELECT COUNT(*) AS CurrentOrderCount FROM [dbo].[order_table];
        
        PRINT 'Current data in order_online:';
        SELECT COUNT(*) AS CurrentOnlineOrderCount FROM [dbo].[order_online];

        -- Tạo bảng tạm để lưu trữ dữ liệu từ onlinedb.dbo.OrderTable mà chưa được ETL
        CREATE TABLE #TempOrderTable (
            id BIGINT,
            created DATETIME,
            shipping_fee FLOAT,
            status VARCHAR(255),
            subtotal FLOAT,
            total FLOAT,
            note NVARCHAR(255),
            recipient_address NVARCHAR(255),
            recipient_name NVARCHAR(255),
            recipient_phone VARCHAR(255),
            customer_id BIGINT
        );

        -- Chèn dữ liệu vào bảng tạm từ onlinedb.dbo.OrderTable
        -- Chỉ lấy những đơn hàng chưa có trong hệ thống
        INSERT INTO #TempOrderTable
        SELECT 
            src.id, 
            src.created, 
            src.shipping_fee, 
            src.status, 
            src.subtotal, 
            src.total, 
            src.note, 
            src.recipient_address, 
            src.recipient_name, 
            src.recipient_phone,
            src.customer_id
        FROM [OnlineDB].[dbo].[OrderTable] src
        LEFT JOIN [dbo].[order_online] tgt ON src.id = tgt.id
        WHERE tgt.id IS NULL;  -- Chỉ lấy những đơn hàng chưa tồn tại

        -- In ra số lượng đơn hàng cần ETL
        PRINT 'New orders to be migrated:';
        SELECT COUNT(*) FROM #TempOrderTable;

        -- Nếu không có đơn hàng mới cần ETL thì kết thúc
        IF (SELECT COUNT(*) FROM #TempOrderTable) = 0
        BEGIN
            PRINT 'No new orders to migrate. ETL process completed.';
            DROP TABLE #TempOrderTable;
            COMMIT TRANSACTION;
            RETURN;
        END

        -- In thông tin các đơn hàng sẽ được ETL
        PRINT 'Order IDs to be migrated:';
        SELECT id FROM #TempOrderTable;

        -- Khai báo các biến để sử dụng trong thủ tục
        DECLARE @OriginalId BIGINT, @created DATETIME, @shipping_fee FLOAT, 
                @status VARCHAR(255), @subtotal FLOAT, @total FLOAT;

        -- Tạo bảng tạm để lưu ánh xạ ID
        CREATE TABLE #OrderIdMapping (
            OriginalId BIGINT,  -- ID từ OnlineDB.OrderTable
            NewOrderId BIGINT   -- ID mới trong dbm.order_table
        );

        -- Bước 1: Chèn vào order_table và lấy ID mới
        DECLARE @NewOrderId BIGINT;

        -- Sử dụng con trỏ để duyệt qua các đơn hàng và chèn vào order_table
        DECLARE order_cursor CURSOR FOR 
            SELECT id, created, shipping_fee, status, subtotal, total
            FROM #TempOrderTable;
        
        OPEN order_cursor;
        FETCH NEXT FROM order_cursor INTO @OriginalId, @created, @shipping_fee, @status, @subtotal, @total;

        -- Duyệt qua từng đơn hàng
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Chèn vào order_table
            INSERT INTO [dbo].[order_table] (created, shipping_fee, status, subtotal, total)
            VALUES (@created, @shipping_fee, @status, @subtotal, @total);

            -- Lấy ID mới được tạo sau khi chèn
            SET @NewOrderId = SCOPE_IDENTITY();

            -- Lưu ánh xạ vào bảng tạm
            INSERT INTO #OrderIdMapping (OriginalId, NewOrderId)
            VALUES (@OriginalId, @NewOrderId);

            FETCH NEXT FROM order_cursor INTO @OriginalId, @created, @shipping_fee, @status, @subtotal, @total;
        END
        
        CLOSE order_cursor;
        DEALLOCATE order_cursor;

        -- In ra ánh xạ ID để kiểm tra
        PRINT 'ID Mapping (Original ID -> New Order ID):';
        SELECT OriginalId, NewOrderId FROM #OrderIdMapping;

        -- Bước 2: Chèn vào order_online với ID gốc làm id và ID mới làm order_id
        PRINT 'Inserting into order_online...';
        
        SET IDENTITY_INSERT [dbo].[order_online] ON;
        
        INSERT INTO [dbo].[order_online] (id, order_id, customer_id, recipient_name, recipient_phone, recipient_address, note)
        SELECT 
            t.id,                  -- Sử dụng ID gốc làm ID của order_online
            m.NewOrderId,          -- Sử dụng ID mới từ order_table làm order_id
            t.customer_id,
            t.recipient_name, 
            t.recipient_phone,
            t.recipient_address,
            t.note
        FROM #TempOrderTable t
        JOIN #OrderIdMapping m ON t.id = m.OriginalId;
        
        SET IDENTITY_INSERT [dbo].[order_online] OFF;

        -- Bước 3: Xử lý order_detail
        PRINT 'Processing order details...';
        
        -- Tạo bảng tạm cho order detail
        CREATE TABLE #TempOrderDetail (
            original_order_id BIGINT,  -- ID đơn hàng gốc từ OnlineDB
            new_order_id BIGINT,       -- ID mới trong dbm.order_table
            product_id BIGINT,
            quantity INT,
            price FLOAT,
            branch_id BIGINT           -- Sẽ được cập nhật sau
        );
        
        -- Chèn dữ liệu vào bảng tạm từ OnlineDB.dbo.OrderDetail cho các đơn hàng mới
        INSERT INTO #TempOrderDetail (original_order_id, product_id, quantity, price, new_order_id)
        SELECT 
            d.order_id,
            d.product_id,
            d.quantity,
            d.price,
            m.NewOrderId                -- Ánh xạ ID mới từ bảng ánh xạ
        FROM [OnlineDB].[dbo].[OrderDetail] d
        INNER JOIN #OrderIdMapping m ON d.order_id = m.OriginalId;
        
        -- In ra số lượng chi tiết đơn hàng cần xử lý
        PRINT 'Order details to process:';
        SELECT COUNT(*) FROM #TempOrderDetail;
        
        -- Cập nhật branch_id cho các chi tiết đơn hàng
        UPDATE td
        SET branch_id = (
            SELECT TOP 1 bp.branch_id 
            FROM [dbo].[branch_product] bp 
            WHERE bp.product_id = td.product_id
            ORDER BY bp.branch_id  -- Ví dụ: lấy branch_id nhỏ nhất
        )
        FROM #TempOrderDetail td;
        
        -- Kiểm tra và in ra các chi tiết đơn hàng không có branch_id hợp lệ
        PRINT 'Order details without valid branch_id:';
        SELECT * FROM #TempOrderDetail WHERE branch_id IS NULL;
        
        -- Chèn chi tiết đơn hàng vào bảng đích sử dụng ID mới
        PRINT 'Inserting order details...';
        
        INSERT INTO [dbo].[order_detail] (order_id, branch_id, product_id, quantity, price)
        SELECT 
            new_order_id,          -- Sử dụng ID mới cho order_id
            branch_id,
            product_id,
            quantity,
            price
        FROM #TempOrderDetail
        WHERE branch_id IS NOT NULL;  -- Chỉ chèn những dòng có branch_id hợp lệ
        
        -- In ra số lượng chi tiết đơn hàng đã được chèn
        PRINT 'Order details inserted:';
        SELECT COUNT(*) FROM [dbo].[order_detail] 
        WHERE order_id IN (SELECT NewOrderId FROM #OrderIdMapping);

        -- Xóa bảng tạm
        DROP TABLE #TempOrderTable;
        DROP TABLE #OrderIdMapping;
        DROP TABLE #TempOrderDetail;

        -- Kiểm tra kết quả cuối cùng
        PRINT 'Final data in order_table:';
        SELECT COUNT(*) FROM [dbo].[order_table];
        
        PRINT 'Final data in order_online:';
        SELECT COUNT(*) FROM [dbo].[order_online];
        
        PRINT 'Final data in order_detail:';
        SELECT COUNT(*) FROM [dbo].[order_detail];

        -- Cam kết giao dịch nếu không có lỗi
        COMMIT TRANSACTION;

        PRINT 'ETL process completed successfully for Online Orders.';

    END TRY
    BEGIN CATCH
        -- Nếu có lỗi, hoàn tác giao dịch
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- In ra lỗi để giúp việc gỡ lỗi dễ dàng hơn
        PRINT 'An error occurred during the ETL process:';
        PRINT ERROR_MESSAGE();
        PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR(10));
        PRINT 'Error Procedure: ' + ISNULL(ERROR_PROCEDURE(), 'Not within a procedure');
        PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR(10));
        PRINT 'Error Severity: ' + CAST(ERROR_SEVERITY() AS VARCHAR(10));
        PRINT 'Error State: ' + CAST(ERROR_STATE() AS VARCHAR(10));
    END CATCH;
END;
GO
