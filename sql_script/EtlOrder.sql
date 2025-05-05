USE dbm;  -- Chuyển sang cơ sở dữ liệu DBM
GO

CREATE PROCEDURE EtlOrder
AS
BEGIN
    --DECLARE @current_time DATETIME;
    --SET @current_time = GETDATE();  -- Lấy thời gian hiện tại

    -- Chèn và cập nhật dữ liệu từ onlinedb.dbo.OrderTable vào dbm.dbo.OrderTable
    MERGE INTO [dbo].[order_table] AS target
    USING [OnlineDB].[dbo].[OrderTable] AS source
    ON target.id = source.id
    WHEN MATCHED AND (target.created <> source.created OR target.status <> source.status OR target.shipping_fee <> source.shipping_fee OR target.subtotal <> source.subtotal OR target.total <> source.total)
        THEN UPDATE SET 
            target.created = source.created,
            target.shipping_fee = source.shipping_fee,
            target.status = source.status,
            target.subtotal = source.subtotal,
            target.total = source.total
    WHEN NOT MATCHED BY TARGET
        THEN INSERT (created, shipping_fee, status, subtotal, total)
        VALUES (source.created, source.shipping_fee, source.status, source.subtotal, source.total);

    -- Chèn và cập nhật dữ liệu từ offlinedb.dbo.OrderTable vào dbm.dbo.OrderTable
    MERGE INTO [dbo].[order_table] AS target
    USING [OfflineDB].[dbo].[OrderTable] AS source
    ON target.id = source.id
    WHEN MATCHED AND (target.created <> source.created OR target.status <> source.status OR target.shipping_fee <> source.shipping_fee OR target.subtotal <> source.subtotal OR target.total <> source.total)
        THEN UPDATE SET 
            target.created = source.created,
            target.shipping_fee = source.shipping_fee,
            target.status = source.status,
            target.subtotal = source.subtotal,
            target.total = source.total
    WHEN NOT MATCHED BY TARGET
        THEN INSERT (created, shipping_fee, status, subtotal, total)
        VALUES (source.created, source.shipping_fee, source.status, source.subtotal, source.total);

    -- Cập nhật bảng online_order từ onlinedb.dbo.OrderTable vào dbm.dbo.online_order
    MERGE INTO [dbo].[order_online] AS target
    USING [OnlineDB].[dbo].[OrderTable] AS source
    ON target.order_id = source.id
    WHEN MATCHED AND (target.note <> source.note OR target.recipient_address <> source.recipient_address OR target.recipient_name <> source.recipient_name OR target.recipient_phone <> source.recipient_phone)
        THEN UPDATE SET
            target.note = source.note,
            target.recipient_address = source.recipient_address,
            target.recipient_name = source.recipient_name,
            target.recipient_phone = source.recipient_phone
    WHEN NOT MATCHED BY TARGET
        THEN INSERT (order_id, note, recipient_address, recipient_name, recipient_phone)
        VALUES (source.id, source.note, source.recipient_address, source.recipient_name, source.recipient_phone);

    -- Cập nhật bảng offline_order từ offlinedb.dbo.OrderTable vào dbm.dbo.offline_order
    MERGE INTO [dbo].[order_offline] AS target
    USING [OfflineDB].[dbo].[OrderTable] AS source
    ON target.order_id = source.id
    WHEN MATCHED AND (target.staff_id <> source.staff_id)
        THEN UPDATE SET
            target.staff_id = source.staff_id
    WHEN NOT MATCHED BY TARGET
        THEN INSERT (order_id, staff_id)
        VALUES (source.id, source.staff_id);

    -- Cập nhật bảng OrderDetail từ onlinedb.dbo.OrderDetail
    MERGE INTO [dbo].[order_detail] AS target
    USING [OnlineDB].[dbo].[OrderDetail] AS source
    ON target.order_id = source.order_id AND target.product_id = source.product_id
    WHEN MATCHED AND (target.quantity <> source.quantity OR target.price <> source.price)
        THEN UPDATE SET 
            target.quantity = source.quantity,
            target.price = source.price
    WHEN NOT MATCHED BY TARGET
        THEN INSERT (order_id, product_id, quantity, price)
        VALUES (source.order_id, source.product_id, source.quantity, source.price);

    -- Cập nhật bảng OrderDetail từ offlinedb.dbo.OrderDetail
    MERGE INTO [dbo].[order_detail] AS target
    USING [OfflineDB].[dbo].[OrderDetail] AS source
    ON target.order_id = source.order_id AND target.product_id = source.product_id
    WHEN MATCHED AND (target.quantity <> source.quantity OR target.price <> source.price)
        THEN UPDATE SET 
            target.quantity = source.quantity,
            target.price = source.price
    WHEN NOT MATCHED BY TARGET
        THEN INSERT (order_id, product_id, quantity, price)
        VALUES (source.order_id, source.product_id, source.quantity, source.price);

    PRINT 'ETL process completed successfully for Order and OrderDetail.';
END;
GO
