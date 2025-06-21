USE OfflineDB;
GO

CREATE OR ALTER PROCEDURE InsertSalaryMonthly
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @month INT, @year INT;

    -- T?o con tr? l?y t?t c? các c?p tháng/n?m có trong b?ng RecordDay
    DECLARE month_cursor CURSOR FOR
    SELECT DISTINCT MONTH(day) AS month, YEAR(day) AS year
    FROM RecordDay;

    OPEN month_cursor;
    FETCH NEXT FROM month_cursor INTO @month, @year;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Xoá d? li?u c? n?u ?ã t?n t?i
        DELETE FROM salary_monthly WHERE month = @month AND year = @year;

        -- Tính l??ng và chèn vào b?ng
        INSERT INTO salary_monthly (staff_id, month, year, total_hours, hourly_salary, total_salary)
        SELECT
            s.id AS staff_id,
            @month,
            @year,
            SUM(DATEDIFF(MINUTE, rd.checkin, rd.checkout)) / 60.0 AS total_hours,
            s.salary AS hourly_salary,
            SUM(DATEDIFF(MINUTE, rd.checkin, rd.checkout)) / 60.0 * s.salary AS total_salary
        FROM Staff s
        JOIN TimeSheet ts ON ts.staff_id = s.id
        JOIN RecordDay rd ON rd.time_sheet_id = ts.id
        WHERE MONTH(rd.day) = @month AND YEAR(rd.day) = @year
        GROUP BY s.id, s.salary;

        PRINT CONCAT('?ã tính xong l??ng cho tháng ', @month, '/', @year);

        FETCH NEXT FROM month_cursor INTO @month, @year;
    END

    CLOSE month_cursor;
    DEALLOCATE month_cursor;

    PRINT N'?ã hoàn t?t tính l??ng cho t?t c? các tháng.';
END
GO
EXEC InsertSalaryMonthly;
