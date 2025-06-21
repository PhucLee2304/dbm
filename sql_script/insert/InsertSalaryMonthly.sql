USE OfflineDB;
GO

CREATE OR ALTER PROCEDURE InsertSalaryMonthly
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @month INT, @year INT;

    DECLARE month_cursor CURSOR FOR
    SELECT DISTINCT MONTH(day) AS month, YEAR(day) AS year
    FROM RecordDay;

    OPEN month_cursor;
    FETCH NEXT FROM month_cursor INTO @month, @year;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT CONCAT(N'Đang tính lương tháng ', @month, '/', @year);

        MERGE salary_monthly AS target
        USING (
            SELECT
                s.id AS staff_id,
                @month AS month,
                @year AS year,
                SUM(DATEDIFF(MINUTE, rd.checkin, rd.checkout)) / 60.0 AS total_hours,
                s.salary AS hourly_salary,
                SUM(DATEDIFF(MINUTE, rd.checkin, rd.checkout)) / 60.0 * s.salary AS total_salary
            FROM Staff s
            JOIN TimeSheet ts ON ts.staff_id = s.id
            JOIN RecordDay rd ON rd.time_sheet_id = ts.id
            WHERE MONTH(rd.day) = @month AND YEAR(rd.day) = @year
            GROUP BY s.id, s.salary
        ) AS source
        ON target.staff_id = source.staff_id AND target.month = source.month AND target.year = source.year
        WHEN MATCHED THEN
            UPDATE SET
                target.total_hours = source.total_hours,
                target.hourly_salary = source.hourly_salary,
                target.total_salary = source.total_salary
        WHEN NOT MATCHED THEN
            INSERT (staff_id, month, year, total_hours, hourly_salary, total_salary, created_at)
            VALUES (source.staff_id, source.month, source.year, source.total_hours, source.hourly_salary, source.total_salary, GETDATE());

        PRINT CONCAT(N'Đã tính xong lương tháng ', @month, '/', @year);

        FETCH NEXT FROM month_cursor INTO @month, @year;
    END

    CLOSE month_cursor;
    DEALLOCATE month_cursor;

    PRINT N'Đã hoàn tất tính lương cho tất cả các tháng.';
END
GO

EXEC InsertSalaryMonthly;