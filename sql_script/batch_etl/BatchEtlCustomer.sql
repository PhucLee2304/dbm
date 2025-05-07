USE DBM;  -- Switch to DBM database
GO

CREATE OR ALTER PROCEDURE BatchEtlCustomer
AS
BEGIN
    DECLARE @batch_size INT = 500;  -- Set batch size to 1000
    DECLARE @current_offset INT = 0;  -- Start from the beginning
    DECLARE @total_records INT;
    DECLARE @new_user_id_table TABLE (user_id BIGINT);  -- Table to store new user IDs

    -- Get the total number of customers in the source table
    SELECT @total_records = COUNT(*) FROM [OutUserDB].[dbo].[Customer];

    -- Loop through the data in batches
    WHILE @current_offset < @total_records
    BEGIN
        PRINT 'Processing batch starting at offset ' + CAST(@current_offset AS NVARCHAR(10));

        -- MERGE operation: Only process the next batch of records using OFFSET/FETCH
        MERGE INTO [dbo].[user_table] AS target
        USING (
            SELECT * FROM [OutUserDB].[dbo].[Customer]
            ORDER BY email
            OFFSET @current_offset ROWS
            FETCH NEXT @batch_size ROWS ONLY
        ) AS source
        ON target.email = source.email  -- Compare by email to avoid duplicates
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
                target.role = 'CUSTOMER'  -- Update role as CUSTOMER
        WHEN NOT MATCHED BY TARGET
            THEN 
                -- Insert into user_table and store user_id in the temporary table
                INSERT (active, address, email, name, phone, password, role)
                VALUES (source.active, source.address, source.email, source.name, source.phone, source.password, 'CUSTOMER')
                OUTPUT inserted.id INTO @new_user_id_table;  -- Capture all new user_id

        -- Insert into the customer table using the new user_ids from the temporary table
        INSERT INTO [dbo].[customer] (user_id)
        SELECT user_id FROM @new_user_id_table;

        -- Clear the temporary table for the next batch
        DELETE FROM @new_user_id_table;

        -- Increment the offset for the next batch
        SET @current_offset = @current_offset + @batch_size;

        -- Print progress message
        PRINT 'Batch ' + CAST(@current_offset / @batch_size AS NVARCHAR(10)) + ' completed.';

    END

    PRINT 'ETL process completed successfully for Customer.';
END;
GO
