USE OnlineDB;
GO

CREATE OR ALTER PROCEDURE InsertBatchProduct
AS
BEGIN
    DECLARE @counter INT = 1;
    DECLARE @batch_size INT = 50;  -- Số lượng sản phẩm cần chèn
    DECLARE @product_name NVARCHAR(255);
    DECLARE @product_price FLOAT;
    DECLARE @category_id BIGINT;
    DECLARE @supplier_id BIGINT;
    DECLARE @stock_db1 BIGINT;
    DECLARE @stock_db2 BIGINT;

    -- Bắt đầu vòng lặp
    WHILE @counter <= @batch_size
    BEGIN
        -- Tạo tên sản phẩm (Product 1, Product 2, ...)
        SET @product_name = 'Product ' + CAST(@counter AS NVARCHAR(10));

        -- Tạo giá ngẫu nhiên cho sản phẩm
        SET @product_price = ROUND(RAND() * 1000, 2);  -- Giá ngẫu nhiên từ 0 đến 1000

        -- Lấy category_id ngẫu nhiên từ bảng Category của OnlineDB
        SET @category_id = (SELECT TOP 1 id FROM [OnlineDB].[dbo].[Category] ORDER BY NEWID());

        -- Lấy supplier_id ngẫu nhiên từ bảng Supplier của OfflineDB
        SET @supplier_id = (SELECT TOP 1 id FROM [OutUserDB].[dbo].[Supplier] ORDER BY NEWID());

        -- Tạo số lượng hàng trong kho cho Database1 và Database2
        SET @stock_db1 = ROUND(RAND() * 6000000, 5000000);  -- stock cho Database1 từ 0 đến 6000000
        SET @stock_db2 = ROUND(RAND() * 6000000, 5000000);  -- stock cho Database2 từ 0 đến 6000000

        -- Chèn vào OnlineDB.Product
        INSERT INTO [OnlineDB].[dbo].[Product] ([name], [price], [category_id], [supplier_id], [stock], [created])
        VALUES (@product_name, @product_price, @category_id, @supplier_id, @stock_db1, GETDATE());

        -- Chèn vào OfflineDB.Product
        INSERT INTO [OfflineDB].[dbo].[Product] ([name], [price], [category_id], [supplier_id], [stock], [created])
        VALUES (@product_name, @product_price, @category_id, @supplier_id, @stock_db2, GETDATE());

        -- Tăng biến đếm lên
        SET @counter = @counter + 1;
    END

    PRINT 'Batch insert completed for 10000 products.';
END;
GO
