USE OfflineDB;  -- Switch to OfflineDB database
GO

CREATE OR ALTER PROCEDURE InsertBatchRecordDay
AS
BEGIN
    DECLARE @batch_size INT = 10;  -- Batch size of 500
    DECLARE @total_records INT = 10;  -- Total records to insert
    DECLARE @current_batch INT = 1;  -- Batch counter
    DECLARE @counter INT = 0;  -- Record counter in each batch

    -- Loop to insert records in batches
    WHILE @counter < @total_records
    BEGIN
        -- Start a transaction for each batch
        BEGIN TRANSACTION;

        -- Print batch progress
        PRINT 'Processing batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' of ' + CAST(@total_records / @batch_size + 1 AS NVARCHAR(10));

        -- Insert records in batches
        DECLARE @staff_id BIGINT;
        DECLARE @time_sheet_id BIGINT;
        DECLARE @day DATE = GETDATE();  -- Get current date for attendance
        DECLARE @checkin DATETIME;
        DECLARE @checkout DATETIME;
        DECLARE @in_status VARCHAR(255);
        DECLARE @out_status VARCHAR(255);

        WHILE @counter < @batch_size AND @counter < @total_records
        BEGIN
            -- Select a random staff from the Staff table
            SELECT TOP 1
                @staff_id = id
            FROM [dbo].[Staff]
            ORDER BY NEWID();  -- Random selection

            -- Get the time_sheet_id for the selected staff
            SELECT @time_sheet_id = id
            FROM [dbo].[TimeSheet]
            WHERE staff_id = @staff_id;

            -- Check if a record already exists for the day and staff
            IF EXISTS (SELECT 1 FROM [dbo].[RecordDay] WHERE time_sheet_id = @time_sheet_id AND day = @day)
            BEGIN
                -- Skip the current iteration if record exists, and continue to the next record
                PRINT 'Record for day ' + CAST(@day AS NVARCHAR(10)) + ' and staff_id ' + CAST(@staff_id AS NVARCHAR(10)) + ' already exists. Skipping.';
                SET @counter = @counter + 1;
                CONTINUE;  -- Skip this iteration and continue with the next one
            END

            -- Calculate random check-in time between 7:30 AM and 8:30 AM
            SET @checkin = DATEADD(MINUTE, ROUND(RAND() * 60 + 450, 0), CAST(CAST(@day AS NVARCHAR(10)) + ' 07:30:00' AS DATETIME));

            -- Calculate random checkout time between 4:30 PM and 5:00 PM
            SET @checkout = DATEADD(MINUTE, ROUND(RAND() * 30 + 270, 0), CAST(CAST(@day AS NVARCHAR(10)) + ' 16:30:00' AS DATETIME));

            -- Check-in status (Late/OnTime)
            IF @checkin > CAST(CAST(@day AS NVARCHAR(10)) + ' 08:00:00' AS DATETIME)
                SET @in_status = 'LATE';
            ELSE
                SET @in_status = 'ONTIME';

            -- Checkout status (Early/OnTime)
            IF @checkout < CAST(CAST(@day AS NVARCHAR(10)) + ' 17:00:00' AS DATETIME)
                SET @out_status = 'EARLY';
            ELSE
                SET @out_status = 'ONTIME';

            -- Insert into RecordDay table
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

            -- Increment the counter for the batch
            SET @counter = @counter + 1;
        END

        -- Commit the transaction for the current batch
        COMMIT TRANSACTION;

        -- Reset counter and increment batch number for the next iteration
        SET @counter = 0;
        SET @current_batch = @current_batch + 1;

        PRINT 'Batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' processed successfully.';
    END

    PRINT 'Batch processing completed for 1 million records in RecordDay.';
END;
GO
