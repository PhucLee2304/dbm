use OnlineDB
go

CREATE PROCEDURE InsertProduct
AS
BEGIN
    DECLARE @product_name NVARCHAR(255);
    DECLARE @product_price FLOAT;
    DECLARE @category_id BIGINT;
    DECLARE @supplier_id BIGINT;
    DECLARE @stock_db1 BIGINT;
    DECLARE @stock_db2 BIGINT;

    -- Tạo tên sản phẩm (Product 1, Product 2,...)
    SET @product_name = 'Product ' + CAST((SELECT COUNT(*) FROM [OnlineDB].[dbo].[Product]) + 1 AS NVARCHAR(10));

    -- Tạo giá ngẫu nhiên cho sản phẩm
    SET @product_price = ROUND(RAND() * 1000, 2); -- Giá ngẫu nhiên từ 0 đến 1000

    -- Lấy category_id ngẫu nhiên từ bảng Category của Database1
    SET @category_id = (SELECT TOP 1 id FROM [OnlineDB].[dbo].[Category] ORDER BY NEWID());

    -- Lấy supplier_id ngẫu nhiên từ bảng Supplier của outuserDb
    SET @supplier_id = (SELECT TOP 1 id FROM [OutUserDB].[dbo].[Supplier] ORDER BY NEWID());

    -- Tạo số lượng hàng trong kho cho Database1 và Database2
    SET @stock_db1 = ROUND(RAND() * 6000000, 5000000); -- stock cho Database1 từ 0 đến 100
    SET @stock_db2 = ROUND(RAND() * 6000000, 5000000); -- stock cho Database2 từ 0 đến 100

    -- Chèn vào Database1
    INSERT INTO [OnlineDB].[dbo].[Product] ([name], [price], [category_id], [supplier_id], [stock])
    VALUES (@product_name, @product_price, @category_id, @supplier_id, @stock_db1);

    -- Chèn vào Database2
    INSERT INTO [OfflineDB].[dbo].[Product] ([name], [price], [category_id], [supplier_id], [stock])
    VALUES (@product_name, @product_price, @category_id, @supplier_id, @stock_db2);

END;
GO
