use OnlineDB
go

CREATE PROCEDURE InsertOrderDetail
AS
BEGIN
    DECLARE @order_id BIGINT;
    DECLARE @product_id BIGINT;
    DECLARE @quantity INT;
    DECLARE @price FLOAT;
    DECLARE @available_orders INT;
    DECLARE @available_products INT;
    
    -- Kiểm tra xem có đơn hàng nào không
    SELECT @available_orders = COUNT(*)
    FROM [OnlineDB].[dbo].[OrderTable];
    
    -- Kiểm tra xem có sản phẩm nào không
    SELECT @available_products = COUNT(*)
    FROM [OnlineDB].[dbo].[Product];
    
    -- Nếu không có đơn hàng hoặc sản phẩm, không thể tạo chi tiết đơn hàng
    IF @available_orders = 0 OR @available_products = 0
        RETURN;
        
    -- Lấy một order_id ngẫu nhiên từ bảng OrderTable
    SELECT TOP 1 @order_id = id 
    FROM [OnlineDB].[dbo].[OrderTable] 
    ORDER BY NEWID();
    
    -- Lấy một product_id ngẫu nhiên từ bảng Product
    SELECT TOP 1 @product_id = id, @price = price
    FROM [OnlineDB].[dbo].[Product]
    ORDER BY NEWID();
    
    -- Kiểm tra xem đã có chi tiết đơn hàng cho order_id và product_id này chưa
    IF EXISTS (
        SELECT 1 
        FROM [OnlineDB].[dbo].[OrderDetail]
        WHERE order_id = @order_id AND product_id = @product_id
    )
    BEGIN
        -- Nếu đã tồn tại, tìm một sản phẩm khác chưa có trong đơn hàng này
        SELECT TOP 1 @product_id = p.id, @price = p.price
        FROM [OnlineDB].[dbo].[Product] p
        WHERE NOT EXISTS (
            SELECT 1 
            FROM [OnlineDB].[dbo].[OrderDetail] od
            WHERE od.order_id = @order_id AND od.product_id = p.id
        )
        ORDER BY NEWID();
        
        -- Nếu không tìm được sản phẩm mới, thoát procedure
        IF @product_id IS NULL
            RETURN;
    END
    
    -- Tạo số lượng ngẫu nhiên từ 1 đến 5
    SET @quantity = ROUND(RAND() * 4, 0) + 1;
    
    -- Chèn chi tiết đơn hàng vào OnlineDB
    INSERT INTO [OnlineDB].[dbo].[OrderDetail] (order_id, product_id, quantity, price)
    VALUES (@order_id, @product_id, @quantity, @price);
    
    -- Cập nhật lại subtotal và total của đơn hàng
    DECLARE @current_subtotal FLOAT;
    DECLARE @current_shipping_fee FLOAT;
    
    -- Tính tổng giá trị sản phẩm trong đơn hàng
    SELECT @current_subtotal = SUM(quantity * price)
    FROM [OnlineDB].[dbo].[OrderDetail]
    WHERE order_id = @order_id;
    
    -- Lấy phí vận chuyển hiện tại
    SELECT @current_shipping_fee = shipping_fee
    FROM [OnlineDB].[dbo].[OrderTable]
    WHERE id = @order_id;
    
    -- Cập nhật subtotal và total trong đơn hàng
    UPDATE [OnlineDB].[dbo].[OrderTable]
    SET subtotal = @current_subtotal,
        total = @current_subtotal + @current_shipping_fee
    WHERE id = @order_id;
    
    -- Nếu muốn cũng cập nhật vào OfflineDB, bỏ comment dưới đây
    -- INSERT INTO [OfflineDB].[dbo].[OrderDetail] (order_id, product_id, quantity, price)
    -- VALUES (@order_id, @product_id, @quantity, @price);
END;
GO 