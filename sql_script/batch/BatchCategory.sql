USE OnlineDB
GO

CREATE OR ALTER PROCEDURE InsertBatchCategories
AS
BEGIN
    DECLARE @category_name NVARCHAR(255);
    DECLARE @category_index INT;
    DECLARE @batch_size INT;
    DECLARE @counter INT;

    -- Đặt số lượng category muốn chèn (100 categories)
    SET @batch_size = 10;
    SET @counter = 1;

    -- Bắt đầu vòng lặp
    WHILE @counter <= @batch_size
    BEGIN
        -- Tính toán chỉ mục cho category mới
        SET @category_index = (SELECT COUNT(*) FROM [OnlineDB].[dbo].[Category]) + 1;

        -- Tạo tên category (category 1, category 2,...)
        SET @category_name = 'Category ' + CAST(@category_index AS NVARCHAR(10));

        -- Chèn vào Database1 (OnlineDB)
        INSERT INTO [OnlineDB].[dbo].[Category] ([name], [created])
        VALUES (@category_name, GETDATE());

        -- Chèn vào Database2 (OfflineDB)
        INSERT INTO [OfflineDB].[dbo].[Category] ([name], [created])
        VALUES (@category_name, GETDATE());

        -- Tăng biến đếm lên
        SET @counter = @counter + 1;
    END
    PRINT 'Batch insert completed for 100 categories.';
END;
GO
