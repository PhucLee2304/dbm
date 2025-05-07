USE DBM;  -- Switch to DBM database
GO

CREATE OR ALTER PROCEDURE BatchEtlSupplier
AS
BEGIN
    DECLARE @batch_size INT = 500;  -- Set batch size to 500
    DECLARE @current_offset INT = 0;  -- Start from the beginning
    DECLARE @total_records INT;
    DECLARE @counter INT = 1;  -- Loop counter for batches

    -- Get the total number of suppliers in the source table
    SELECT @total_records = COUNT(*) FROM [OutUserDB].[dbo].[Supplier];

    -- Loop through the data in batches
    WHILE @current_offset < @total_records
    BEGIN
        PRINT 'Processing batch starting at offset ' + CAST(@current_offset AS NVARCHAR(10));

        -- MERGE operation: Only process the next batch of records using OFFSET/FETCH
        MERGE INTO [dbo].[supplier] AS target
        USING (
            SELECT * 
            FROM [OutUserDB].[dbo].[Supplier]
            ORDER BY id  -- Ensure deterministic ordering
            OFFSET @current_offset ROWS
            FETCH NEXT @batch_size ROWS ONLY
        ) AS source
        ON target.id = source.id  -- Compare by id to avoid duplicates
        WHEN MATCHED AND (
            target.name <> source.name OR 
            target.email <> source.email OR 
            target.phone <> source.phone OR 
            target.address <> source.address
        )
            THEN UPDATE SET 
                target.name = source.name,
                target.email = source.email,
                target.phone = source.phone,
                target.address = source.address
        WHEN NOT MATCHED BY TARGET
            THEN 
                -- Insert into target table if the record does not exist
                INSERT (name, email, phone, address)
                VALUES (source.name, source.email, source.phone, source.address)
        WHEN NOT MATCHED BY SOURCE
            THEN 
                -- Delete records from target if they do not exist in the source table
                DELETE;

        -- Increment the offset for the next batch
        SET @current_offset = @current_offset + @batch_size;

        -- Print progress
        PRINT 'Batch ' + CAST(@counter AS NVARCHAR(10)) + ' processed.';

        -- Increment the batch counter
        SET @counter = @counter + 1;
    END

    PRINT 'ETL process completed successfully for Supplier.';
END;
GO
