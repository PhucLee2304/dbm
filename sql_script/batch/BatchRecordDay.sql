USE OfflineDB;
GO

CREATE OR ALTER PROCEDURE InsertBatchRecordDay
AS
BEGIN
    DECLARE @batch_size INT = 10;       -- Số bản ghi mỗi batch
    DECLARE @total_records INT = 50;    -- Tổng số bản ghi cần chèn mỗi ngày
    DECLARE @current_batch INT;
    DECLARE @counter INT;

    DECLARE @start_day DATE = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);  -- Ngày 1 của tháng hiện tại
    DECLARE @end_day DATE = CAST(GETDATE() AS DATE);                                 -- Ngày hiện tại
    DECLARE @day DATE = @start_day;

    -- Vòng lặp từ ngày 1 đến ngày hiện tại
    WHILE @day <= @end_day
    BEGIN
        PRINT 'Bắt đầu chèn bản ghi cho ngày: ' + CAST(@day AS NVARCHAR(10));

        SET @current_batch = 1;
        SET @counter = 0;

        -- Lặp để chèn dữ liệu theo batch cho mỗi ngày
        WHILE @counter < @total_records
        BEGIN
            BEGIN TRANSACTION;

            PRINT '  Đang xử lý batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' cho ngày ' + CAST(@day AS NVARCHAR(10));

            DECLARE @staff_id BIGINT;
            DECLARE @time_sheet_id BIGINT;
            DECLARE @checkin DATETIME;
            DECLARE @checkout DATETIME;
            DECLARE @in_status VARCHAR(255);
            DECLARE @out_status VARCHAR(255);

            DECLARE @inner_counter INT = 0;

            WHILE @inner_counter < @batch_size AND @counter < @total_records
            BEGIN
                -- Chọn ngẫu nhiên một nhân viên
                SELECT TOP 1
                    @staff_id = id
                FROM [dbo].[Staff]
                ORDER BY NEWID();

                -- Lấy time_sheet_id tương ứng
                SELECT @time_sheet_id = id
                FROM [dbo].[TimeSheet]
                WHERE staff_id = @staff_id;

                -- Kiểm tra trùng lặp bản ghi
                IF EXISTS (SELECT 1 FROM [dbo].[RecordDay] WHERE time_sheet_id = @time_sheet_id AND day = @day)
                BEGIN
                    PRINT '    Bỏ qua vì đã tồn tại: staff_id = ' + CAST(@staff_id AS NVARCHAR(10)) + ', day = ' + CAST(@day AS NVARCHAR(10));
                    SET @counter = @counter + 1;
                    CONTINUE;
                END

                -- Tạo giờ check-in và check-out ngẫu nhiên
                SET @checkin = DATEADD(MINUTE, ROUND(RAND() * 60, 0), CAST(CAST(@day AS NVARCHAR(10)) + ' 07:30:00' AS DATETIME));
                SET @checkout = DATEADD(MINUTE, ROUND(RAND() * 30, 0), CAST(CAST(@day AS NVARCHAR(10)) + ' 16:30:00' AS DATETIME));

                SET @in_status = CASE WHEN @checkin > CAST(CAST(@day AS NVARCHAR(10)) + ' 08:00:00' AS DATETIME) THEN 'LATE' ELSE 'ONTIME' END;
                SET @out_status = CASE WHEN @checkout < CAST(CAST(@day AS NVARCHAR(10)) + ' 17:00:00' AS DATETIME) THEN 'EARLY' ELSE 'ONTIME' END;

                INSERT INTO [dbo].[RecordDay] (day, time_sheet_id, checkin, checkout, in_status, out_status)
                VALUES (@day, @time_sheet_id, @checkin, @checkout, @in_status, @out_status);

                SET @counter = @counter + 1;
                SET @inner_counter = @inner_counter + 1;
            END

            COMMIT TRANSACTION;

            PRINT '  Batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' cho ngày ' + CAST(@day AS NVARCHAR(10)) + ' hoàn tất.';
            SET @current_batch = @current_batch + 1;
        END

        SET @day = DATEADD(DAY, 1, @day);  -- Tăng ngày
    END

    PRINT 'Đã hoàn tất chèn dữ liệu từ ngày 1 đến hiện tại.';
END;
GO
