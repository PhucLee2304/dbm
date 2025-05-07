USE OfflineDB;  -- Thay "YourDatabase" bằng tên cơ sở dữ liệu thực tế
GO

CREATE PROCEDURE InsertRecordDay
AS
BEGIN
    DECLARE @staff_id BIGINT;
    DECLARE @time_sheet_id BIGINT;
    DECLARE @day DATE = GETDATE();  -- Ngày hiện tại cho chấm công
    DECLARE @checkin DATETIME;
    DECLARE @checkout DATETIME;
    DECLARE @in_status VARCHAR(255);
    DECLARE @out_status VARCHAR(255);

    -- Chọn một nhân viên ngẫu nhiên từ bảng Staff
    SELECT TOP 1
        @staff_id = id
    FROM [dbo].[Staff]
    ORDER BY NEWID();  -- Sắp xếp ngẫu nhiên và chọn 1 bản ghi

    -- Lấy time_sheet_id cho nhân viên vừa chọn
    SELECT @time_sheet_id = id
    FROM [dbo].[TimeSheet]
    WHERE staff_id = @staff_id;

    -- Kiểm tra xem đã có bản ghi với time_sheet_id và day này chưa
    IF EXISTS (SELECT 1 FROM [dbo].[RecordDay] WHERE time_sheet_id = @time_sheet_id AND day = @day)
    BEGIN
        RAISERROR('Record for this day and staff already exists.', 16, 1);
        RETURN; -- Dừng thủ tục nếu bản ghi đã tồn tại
    END

    -- Tính toán giờ vào ngẫu nhiên từ 7:30 AM đến 8:30 AM
	SET @checkin = DATEADD(MINUTE, ROUND(RAND() * 60 + 450, 0), CAST(CAST(@day AS NVARCHAR(10)) + ' 07:30:00' AS DATETIME));

	-- Tính toán giờ ra ngẫu nhiên từ 4:30 PM đến 5:00 PM
	SET @checkout = DATEADD(MINUTE, ROUND(RAND() * 30 + 270, 0), CAST(CAST(@day AS NVARCHAR(10)) + ' 16:30:00' AS DATETIME));

    -- Kiểm tra trạng thái vào (Late/OnTime)
	IF @checkin > CAST(CAST(@day AS NVARCHAR(10)) + ' 08:00:00' AS DATETIME)
		SET @in_status = 'LATE';
	ELSE
		SET @in_status = 'ONTIME';

	-- Kiểm tra trạng thái ra (Early/OnTime)
	IF @checkout < CAST(CAST(@day AS NVARCHAR(10)) + ' 17:00:00' AS DATETIME)
		SET @out_status = 'EARLY';
	ELSE
		SET @out_status = 'ONTIME';

    -- Chèn vào bảng RecordDay với dữ liệu chấm công
    INSERT INTO [dbo].[RecordDay] (day, time_sheet_id, checkin, checkout, in_status, out_status)
    VALUES
    (
        @day,
        @time_sheet_id,
        @checkin,
        @checkout,
        @in_status,
        @out_status
    );

END;
GO
