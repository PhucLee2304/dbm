USE DBM;
GO

CREATE OR ALTER PROCEDURE BatchEtlStaff
AS
BEGIN
    DECLARE @batch_size INT = 500;  -- Set batch size to 500
    DECLARE @total_records INT = (SELECT COUNT(*) FROM [OfflineDB].[dbo].[Staff]);  -- Get total number of records in source table
    DECLARE @current_batch INT = 1;  -- Batch counter
    DECLARE @counter INT = 0;  -- Counter for batch iteration

    -- Start loop to process in batches
    WHILE @counter < @total_records
    BEGIN
        -- Start transaction for each batch
        BEGIN TRANSACTION;

        PRINT 'Processing batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' of ' + CAST(@total_records / @batch_size + 1 AS NVARCHAR(10));

        -- Declare a temporary table to store the data of new or updated records
        DECLARE @new_user_id TABLE (
            user_id BIGINT, 
            code VARCHAR(255), 
            expiry_date DATE, 
            salary FLOAT
        );

        -- Perform the MERGE operation
        MERGE INTO [dbo].[user_table] AS target
        USING (SELECT TOP (@batch_size) * FROM [OfflineDB].[dbo].[Staff] WHERE id > @counter) AS source
        ON target.email = source.email  -- Matching condition
        WHEN MATCHED AND (
            target.active <> source.active OR 
            target.address <> source.address OR 
            target.email <> source.email OR 
            target.name <> source.name OR 
            target.phone <> source.phone OR 
            target.password <> source.password
        )
            THEN UPDATE SET 
                target.active = source.active,
                target.address = source.address,
                target.email = source.email,
                target.name = source.name,
                target.phone = source.phone,
                target.password = source.password,
                target.role = 'STAFF'  -- Update role as STAFF
        WHEN NOT MATCHED BY TARGET
            THEN 
                -- Insert new records into the user_table and store user_id into the temp table
                INSERT (active, address, email, name, phone, password, role)
                VALUES (source.active, source.address, source.email, source.name, source.phone, source.password, 'STAFF')
                OUTPUT inserted.id, source.code, source.expiry_date, source.salary INTO @new_user_id(user_id, code, expiry_date, salary);  -- Store in the temp table

        -- Insert new user data into the staff table
        IF EXISTS (SELECT 1 FROM @new_user_id)
        BEGIN
            INSERT INTO [dbo].[staff] (user_id, code, expiry_date, salary)
            SELECT n.user_id, n.code, n.expiry_date, n.salary
            FROM @new_user_id n;
        END

        -- Update staff table if branch_id is null
        UPDATE [dbo].[staff]
        SET branch_id = ISNULL(branch_id, 2)  -- Set default value for branch_id if null
        WHERE branch_id IS NULL;

        -- Commit the transaction for this batch
        COMMIT TRANSACTION;

        -- Print batch processed information
        PRINT 'Batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' processed successfully.';

        -- Update the counter to continue to the next batch
        SET @counter = @counter + @batch_size;
        SET @current_batch = @current_batch + 1;
    END

    PRINT 'ETL process completed successfully for Staff with batch processing.';
END;
GO
