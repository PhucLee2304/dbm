USE DBM;  -- Chuyển sang cơ sở dữ liệu DBM
GO

CREATE OR ALTER PROCEDURE BatchEtlOnlineOrder
AS
BEGIN
    DECLARE @batch_size INT = 500;  -- Define batch size as 500
    DECLARE @counter INT = 0;  -- Counter for processed records
    DECLARE @total_records INT;
    DECLARE @current_batch INT = 1;
    
    -- Get total records to process
    SELECT @total_records = COUNT(*) FROM [OnlineDB].[dbo].[OrderTable];
    
    -- Start processing in batches
    WHILE @counter < @total_records
    BEGIN
        -- Start a transaction for this batch
        BEGIN TRANSACTION;

        PRINT 'Processing batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' of ' + CAST(@total_records / @batch_size + 1 AS NVARCHAR(10));

        -- Create temporary table to store data that needs to be migrated
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

        -- Insert data into #TempOrderTable for the current batch
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
        WHERE tgt.id IS NULL
        ORDER BY src.id
        OFFSET @counter ROWS FETCH NEXT @batch_size ROWS ONLY;  -- Batch processing by offset

        -- If there are no new orders to process, exit the loop
        IF (SELECT COUNT(*) FROM #TempOrderTable) = 0
        BEGIN
            PRINT 'No new orders to migrate in this batch.';
            DROP TABLE #TempOrderTable;
            COMMIT TRANSACTION;
            BREAK;  -- Exit the loop if no new orders in this batch
        END

        -- Processing steps for this batch (same as before, using #TempOrderTable)
        DECLARE @OriginalId BIGINT, @created DATETIME, @shipping_fee FLOAT, 
                @status VARCHAR(255), @subtotal FLOAT, @total FLOAT;

        CREATE TABLE #OrderIdMapping (
            OriginalId BIGINT,  -- ID from OnlineDB.OrderTable
            NewOrderId BIGINT   -- New ID in dbm.order_table
        );

        -- Step 1: Insert into order_table and get new ID
        DECLARE @NewOrderId BIGINT;

        DECLARE order_cursor CURSOR FOR 
            SELECT id, created, shipping_fee, status, subtotal, total
            FROM #TempOrderTable;
        
        OPEN order_cursor;
        FETCH NEXT FROM order_cursor INTO @OriginalId, @created, @shipping_fee, @status, @subtotal, @total;

        -- Loop through each order and insert into order_table
        WHILE @@FETCH_STATUS = 0
        BEGIN
            INSERT INTO [dbo].[order_table] (created, shipping_fee, status, subtotal, total)
            VALUES (@created, @shipping_fee, @status, @subtotal, @total);

            -- Get the new ID from order_table
            SET @NewOrderId = SCOPE_IDENTITY();

            -- Insert into OrderIdMapping table
            INSERT INTO #OrderIdMapping (OriginalId, NewOrderId)
            VALUES (@OriginalId, @NewOrderId);

            FETCH NEXT FROM order_cursor INTO @OriginalId, @created, @shipping_fee, @status, @subtotal, @total;
        END

        CLOSE order_cursor;
        DEALLOCATE order_cursor;

        -- Step 2: Insert into order_online with new order_id
        PRINT 'Inserting into order_online...';

        SET IDENTITY_INSERT [dbo].[order_online] ON;

        INSERT INTO [dbo].[order_online] (id, order_id, customer_id, recipient_name, recipient_phone, recipient_address, note)
        SELECT 
            t.id,                  -- Use original ID as ID for order_online
            m.NewOrderId,          -- Use new ID from order_table as order_id
            t.customer_id,
            t.recipient_name, 
            t.recipient_phone,
            t.recipient_address,
            t.note
        FROM #TempOrderTable t
        JOIN #OrderIdMapping m ON t.id = m.OriginalId;

        SET IDENTITY_INSERT [dbo].[order_online] OFF;

        -- Step 3: Process order details
        PRINT 'Processing order details...';

        CREATE TABLE #TempOrderDetail (
            original_order_id BIGINT,  -- Original order ID from OnlineDB
            new_order_id BIGINT,       -- New order ID from dbm.order_table
            product_id BIGINT,
            quantity INT,
            price FLOAT,
            branch_id BIGINT           -- Will be updated later
        );
        
        INSERT INTO #TempOrderDetail (original_order_id, product_id, quantity, price, new_order_id)
        SELECT 
            d.order_id,
            d.product_id,
            d.quantity,
            d.price,
            m.NewOrderId                -- Map new ID from OrderIdMapping
        FROM [OnlineDB].[dbo].[OrderDetail] d
        INNER JOIN #OrderIdMapping m ON d.order_id = m.OriginalId;

        -- Update branch_id for order details
        UPDATE td
        SET branch_id = 2
        FROM #TempOrderDetail td;

        -- Insert valid order details
        INSERT INTO [dbo].[order_detail] (order_id, branch_id, product_id, quantity, price)
        SELECT 
            new_order_id,          -- Use new order ID
            branch_id,
            product_id,
            quantity,
            price
        FROM #TempOrderDetail
        WHERE branch_id IS NOT NULL;  -- Only insert rows with valid branch_id

        -- Cleanup and final counts
        PRINT 'Final data in order_table:';
        SELECT COUNT(*) FROM [dbo].[order_table];

        PRINT 'Final data in order_online:';
        SELECT COUNT(*) FROM [dbo].[order_online];

        PRINT 'Final data in order_detail:';
        SELECT COUNT(*) FROM [dbo].[order_detail];

        -- Drop temp tables and commit transaction
        DROP TABLE #TempOrderTable;
        DROP TABLE #OrderIdMapping;
        DROP TABLE #TempOrderDetail;

        COMMIT TRANSACTION;

        PRINT 'Batch ETL process completed successfully for Online Orders.';

        -- Update counter for next batch
        SET @counter = @counter + @batch_size;
        SET @current_batch = @current_batch + 1;
    END

    PRINT 'ETL process completed successfully for Online Orders.';
END;
GO
