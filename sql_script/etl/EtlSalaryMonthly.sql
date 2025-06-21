USE dbm;
GO

CREATE OR ALTER PROCEDURE EtlSalaryMonthly
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @month INT, @year INT;

    DECLARE month_cursor CURSOR FOR
    SELECT DISTINCT month, year
    FROM OfflineDB.dbo.salary_monthly;

    OPEN month_cursor;
    FETCH NEXT FROM month_cursor INTO @month, @year;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT CONCAT(N'Đang ETL lương tháng ', @month, '/', @year);

        -- Bật IDENTITY_INSERT để chèn thủ công cột ID
        SET IDENTITY_INSERT dbm.dbo.salary_monthly ON;

        MERGE dbm.dbo.salary_monthly AS target
        USING (
            SELECT id, staff_id, month, year, total_hours, hourly_salary, total_salary, created_at
            FROM OfflineDB.dbo.salary_monthly
            WHERE month = @month AND year = @year
        ) AS source
        ON target.id = source.id
        WHEN MATCHED THEN
            UPDATE SET
                target.staff_id = source.staff_id,
                target.month = source.month,
                target.year = source.year,
                target.total_hours = source.total_hours,
                target.hourly_salary = source.hourly_salary,
                target.total_salary = source.total_salary,
                target.paid = 0,
                target.created_at = source.created_at  -- giữ nguyên thời gian tạo
        WHEN NOT MATCHED BY TARGET THEN
            INSERT (id, staff_id, month, year, total_hours, hourly_salary, total_salary, paid, created_at)
            VALUES (source.id, source.staff_id, source.month, source.year, source.total_hours, source.hourly_salary, source.total_salary, 0, source.created_at);

        SET IDENTITY_INSERT dbm.dbo.salary_monthly OFF;

        PRINT CONCAT(N'Đã ETL xong tháng ', @month, '/', @year);

        FETCH NEXT FROM month_cursor INTO @month, @year;
    END

    CLOSE month_cursor;
    DEALLOCATE month_cursor;

    PRINT N'Đã hoàn tất ETL salary_monthly tất cả các tháng.';
END
GO
