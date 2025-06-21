USE OfflineDB;
GO

CREATE OR ALTER PROCEDURE InsertSalaryMonthly
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @month INT, @year INT;

    -- T?o con tr? l?y t?t c? c�c c?p th�ng/n?m c� trong b?ng RecordDay
    DECLARE month_cursor CURSOR FOR
    SELECT DISTINCT MONTH(day) AS month, YEAR(day) AS year
    FROM RecordDay;

    OPEN month_cursor;
    FETCH NEXT FROM month_cursor INTO @month, @year;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Xo� d? li?u c? n?u ?� t?n t?i
        DELETE FROM salary_monthly WHERE month = @month AND year = @year;

        -- T�nh l??ng v� ch�n v�o b?ng
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

        PRINT CONCAT('?� t�nh xong l??ng cho th�ng ', @month, '/', @year);

        FETCH NEXT FROM month_cursor INTO @month, @year;
    END

    CLOSE month_cursor;
    DEALLOCATE month_cursor;

    PRINT N'?� ho�n t?t t�nh l??ng cho t?t c? c�c th�ng.';
END
GO
EXEC InsertSalaryMonthly;
