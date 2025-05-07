USE dbm;
GO

CREATE OR ALTER PROCEDURE BatchEtlTimeSheet
AS
BEGIN
    DECLARE @batch_size INT = 500;  -- Set batch size to 500
    DECLARE @counter INT = 0;  -- Initialize counter for processed records
    DECLARE @total_records INT;
    DECLARE @current_batch INT = 1;
    
    -- Get the total number of records to process for TimeSheet and RecordDay
    SELECT @total_records = COUNT(*) 
    FROM OfflineDB.dbo.TimeSheet ts
    JOIN OfflineDB.dbo.Staff s_off ON ts.staff_id = s_off.id
    JOIN dbm.dbo.staff s_dbm ON s_off.code = s_dbm.code;

    -- Start processing in batches
    WHILE @counter < @total_records
    BEGIN
        -- Start a transaction for this batch
        BEGIN TRANSACTION;

        PRINT 'Processing batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' of ' + CAST(@total_records / @batch_size + 1 AS NVARCHAR(10));

        -- Step 1: ETL TimeSheet
        MERGE dbm.dbo.time_sheet AS target
        USING (
            SELECT 
                ts.id AS source_time_sheet_id,
                s_dbm.id AS target_staff_id
            FROM OfflineDB.dbo.TimeSheet ts
            JOIN OfflineDB.dbo.Staff s_off ON ts.staff_id = s_off.id
            JOIN dbm.dbo.staff s_dbm ON s_off.code = s_dbm.code
            ORDER BY ts.id
            OFFSET @counter ROWS FETCH NEXT @batch_size ROWS ONLY  -- Batch processing using OFFSET and FETCH
        ) AS source
        ON target.staff_id = source.target_staff_id
        WHEN NOT MATCHED THEN
            INSERT (staff_id)
            VALUES (source.target_staff_id);

        -- Step 2: ETL RecordDay
        MERGE dbm.dbo.record_day AS target
        USING (
            SELECT 
                rd.day,
                rd.checkin,
                rd.checkout,
                rd.in_status,
                rd.out_status,
                t_dbm.id AS target_time_sheet_id
            FROM OfflineDB.dbo.RecordDay rd
            JOIN OfflineDB.dbo.TimeSheet ts ON rd.time_sheet_id = ts.id
            JOIN OfflineDB.dbo.Staff s_off ON ts.staff_id = s_off.id
            JOIN dbm.dbo.staff s_dbm ON s_off.code = s_dbm.code
            JOIN dbm.dbo.time_sheet t_dbm ON t_dbm.staff_id = s_dbm.id
            ORDER BY rd.time_sheet_id, rd.day
            OFFSET @counter ROWS FETCH NEXT @batch_size ROWS ONLY  -- Batch processing for RecordDay
        ) AS source
        ON target.time_sheet_id = source.target_time_sheet_id AND target.day = source.day
        WHEN MATCHED AND (
            target.checkin <> source.checkin OR
            target.checkout <> source.checkout OR
            target.check_in_status <> source.in_status OR
            target.check_out_status <> source.out_status
        ) THEN UPDATE SET
            target.checkin = source.checkin,
            target.checkout = source.checkout,
            target.check_in_status = source.in_status,
            target.check_out_status = source.out_status
        WHEN NOT MATCHED THEN
            INSERT (time_sheet_id, day, checkin, checkout, check_in_status, check_out_status)
            VALUES (source.target_time_sheet_id, source.day, source.checkin, source.checkout, source.in_status, source.out_status);

        -- Commit transaction for this batch
        COMMIT TRANSACTION;

        -- Update counter for next batch
        SET @counter = @counter + @batch_size;
        SET @current_batch = @current_batch + 1;

        -- Print progress
        PRINT 'Batch ' + CAST(@current_batch - 1 AS NVARCHAR(10)) + ' completed.';
    END

    PRINT 'ETL TimeSheet & RecordDay process completed successfully.';
END;
GO
