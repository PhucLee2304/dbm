use OnlineDB
go

CREATE PROCEDURE InsertOrderTable
AS
BEGIN
    DECLARE @created DATETIME;
    DECLARE @shipping_fee FLOAT;
    DECLARE @status VARCHAR(255);
    DECLARE @subtotal FLOAT;
    DECLARE @total FLOAT;
    DECLARE @note NVARCHAR(255);
    DECLARE @recipient_address NVARCHAR(255);
    DECLARE @recipient_name NVARCHAR(255);
    DECLARE @recipient_phone VARCHAR(255);
    DECLARE @customer_id BIGINT;
    
    -- Tạo thời gian đặt hàng (ngẫu nhiên trong 30 ngày gần đây)
    SET @created = DATEADD(DAY, -ROUND(RAND() * 30, 0), GETDATE());
    
    -- Tạo phí vận chuyển ngẫu nhiên từ 15000 đến 50000
    SET @shipping_fee = ROUND(RAND() * 35000 + 15000, 0);
    
    -- Chọn trạng thái ngẫu nhiên ('CANCELLED', 'COMPLETED', 'PENDING')
    DECLARE @random_status INT = ROUND(RAND() * 2, 0);
    IF @random_status = 0
        SET @status = 'CANCELLED';
    ELSE IF @random_status = 1
        SET @status = 'COMPLETED';
    ELSE
        SET @status = 'PENDING';
    
    -- Tạo giá trị ngẫu nhiên cho subtotal (từ 50000 đến 2000000)
    SET @subtotal = ROUND(RAND() * 1950000 + 50000, 0);
    
    -- Tính tổng đơn hàng = subtotal + shipping_fee
    SET @total = @subtotal + @shipping_fee;
    
    -- Ghi chú ngẫu nhiên
    DECLARE @random_note INT = ROUND(RAND() * 2, 0);
    IF @random_note = 0
        SET @note = N'Giao hàng giờ hành chính';
    ELSE IF @random_note = 1
        SET @note = N'Giao hàng cuối tuần';
    ELSE
        SET @note = N'Gọi trước khi giao';
    
    -- Lấy customer_id ngẫu nhiên từ OutUserDB
    SELECT TOP 1 @customer_id = id FROM [OutUserDB].[dbo].[Customer] ORDER BY NEWID();
    
    -- Lấy thông tin khách hàng từ OutUserDB để làm thông tin người nhận
    SELECT TOP 1 
        @recipient_name = name,
        @recipient_phone = phone,
        @recipient_address = address
    FROM [OutUserDB].[dbo].[Customer]
    WHERE id = @customer_id;
    
    -- Nếu không tìm thấy customer hoặc thiếu thông tin, tạo thông tin ngẫu nhiên
    IF @recipient_name IS NULL OR @recipient_phone IS NULL OR @recipient_address IS NULL
    BEGIN
        SET @recipient_name = N'Khách hàng ' + CAST(ROUND(RAND() * 1000, 0) AS NVARCHAR(10));
        SET @recipient_phone = '09' + CAST(ROUND(RAND() * 100000000, 0) AS NVARCHAR(10));
        SET @recipient_address = N'Địa chỉ ' + CAST(ROUND(RAND() * 1000, 0) AS NVARCHAR(10));
    END
    
    -- Chèn vào Database OnlineDB
    INSERT INTO [OnlineDB].[dbo].[OrderTable] (created, shipping_fee, status, subtotal, total, note, recipient_address, recipient_name, recipient_phone, customer_id)
    VALUES (@created, @shipping_fee, @status, @subtotal, @total, @note, @recipient_address, @recipient_name, @recipient_phone, @customer_id);
    
    -- Chèn vào Database OfflineDB (nếu cần)
    -- INSERT INTO [OfflineDB].[dbo].[OrderTable] (created, shipping_fee, status, subtotal, total, customer_id, staff_id)
    -- VALUES (@created, @shipping_fee, @status, @subtotal, @total, @customer_id, NULL);
END;
GO 