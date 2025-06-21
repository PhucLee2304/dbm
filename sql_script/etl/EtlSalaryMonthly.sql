USE dbm;
GO

CREATE OR ALTER PROCEDURE EtlSalaryMonthly
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @month INT, @year INT;

    -- Con tr? duy?t t?t c? các c?p tháng/n?m có trong OfflineDB
    DECLARE month_cursor CURSOR FOR
    SELECT DISTINCT month, year
    FROM OfflineDB.dbo.salary_monthly;

    OPEN month_cursor;
    FETCH NEXT FROM month_cursor INTO @month, @year;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT CONCAT('?ang ETL l??ng tháng ', @month, '/', @year);

        -- B?ng t?m l?u d? li?u tháng ?ang x? lý
        IF OBJECT_ID('tempdb..#salary_temp') IS NOT NULL DROP TABLE #salary_temp;

        CREATE TABLE #salary_temp (
            staff_id BIGINT,
            month INT,
            year INT,
            total_hours FLOAT,
            hourly_salary FLOAT,
            total_salary FLOAT
        );

        -- L?y d? li?u t? OfflineDB
        INSERT INTO #salary_temp (staff_id, month, year, total_hours, hourly_salary, total_salary)
        SELECT staff_id, month, year, total_hours, hourly_salary, total_salary
        FROM OfflineDB.dbo.salary_monthly
        WHERE month = @month AND year = @year;

        -- Xoá d? li?u c? ? DBM
        DELETE FROM dbm.dbo.salary_monthly WHERE month = @month AND year = @year;

        -- Chèn d? li?u m?i vào DBM
        INSERT INTO dbm.dbo.salary_monthly (staff_id, month, year, total_hours, hourly_salary, total_salary, paid, created_at)
        SELECT staff_id, month, year, total_hours, hourly_salary, total_salary, 0, GETDATE()
        FROM #salary_temp;

        PRINT CONCAT('? ?ã ETL xong tháng ', @month, '/', @year);

        FETCH NEXT FROM month_cursor INTO @month, @year;
    END

    CLOSE month_cursor;
    DEALLOCATE month_cursor;

    PRINT N'? ETL SalaryMonthly: Hoàn t?t x? lý t?t c? các tháng.';
END
GO
EXEC EtlSalaryMonthly;
