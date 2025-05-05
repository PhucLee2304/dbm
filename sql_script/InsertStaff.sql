USE OfflineDB;
GO

CREATE PROCEDURE InsertStaff
AS
BEGIN
    DECLARE @staff_id BIGINT;
    DECLARE @staff_code VARCHAR(255);
    DECLARE @expiry_date DATE;
    DECLARE @salary FLOAT;

    -- Tạo code cho nhân viên (staff1, staff2, ...)
    SET @staff_code = 'Staff' + CAST((SELECT COUNT(*) FROM [dbo].[Staff]) + 1 AS VARCHAR(10));

    -- Lấy expiry_date ngẫu nhiên trong khoảng 1 năm kể từ hôm nay
    SET @expiry_date = DATEADD(DAY, ROUND(RAND() * 365, 0), GETDATE()); -- Random date within 1 year

    -- Lấy salary ngẫu nhiên từ 500 đến 2000
    SET @salary = ROUND(RAND() * 1500 + 500, 2);  -- Salary between 500 and 2000

    -- Chèn dữ liệu vào bảng Staff
    INSERT INTO [dbo].[Staff] ([code], [expiry_date], [salary], [created])
    VALUES
    (
        @staff_code,
        @expiry_date,
        @salary,
		GETDATE()
    );

	SET @staff_id = SCOPE_IDENTITY();

	INSERT INTO [dbo].[TimeSheet] ([staff_id])
	VALUES
	(
		@staff_id
	)

END;
GO
