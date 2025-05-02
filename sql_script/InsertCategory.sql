use OnlineDB
go

CREATE PROCEDURE InsertCategory
AS
BEGIN
    DECLARE @category_name NVARCHAR(255);
    DECLARE @category_index INT;

    -- Tính toán chỉ mục cho category mới
    SET @category_index = (SELECT COUNT(*) FROM [OnlineDB].[dbo].[Category]) + 1;

    -- Tạo tên category (category 1, category 2,...)
    SET @category_name = 'Category ' + CAST(@category_index AS NVARCHAR(10));

    -- Chèn vào Database1
    INSERT INTO [OnlineDB].[dbo].[Category] ([name])
    VALUES (@category_name);

    -- Chèn vào Database2
    INSERT INTO [OfflineDB].[dbo].[Category] ([name])
    VALUES (@category_name);
END;
GO
