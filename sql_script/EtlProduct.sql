-- EXEC ETL_Product;
USE dbm;
GO

CREATE OR ALTER PROCEDURE EtlProduct
AS
BEGIN
    SET NOCOUNT ON;

    -------------------------------------------
    -- 0. ETL vào bảng category từ cả hai nguồn
    -------------------------------------------
    MERGE dbm.dbo.category AS target
    USING (
        SELECT name
        FROM (
            SELECT name FROM OfflineDB.dbo.Category
            UNION 
            SELECT name FROM OnlineDB.dbo.Category
        ) AS c
    ) AS source
    ON target.name = source.name
    WHEN NOT MATCHED THEN
        INSERT (name)
        VALUES (source.name);

    -------------------------------------------
    -- 1. ETL vào bảng supplier từ OutUserDB
    -------------------------------------------
    -- Enable IDENTITY_INSERT for supplier table
    --SET IDENTITY_INSERT dbm.dbo.supplier ON;
    
    --MERGE dbm.dbo.supplier AS target
    --USING (
    --    SELECT DISTINCT os.id, os.name, os.email, os.phone, os.address
    --    FROM OutUserDB.dbo.Supplier os
    --    INNER JOIN (
    --        SELECT DISTINCT supplier_id 
    --        FROM OfflineDB.dbo.Product
    --        WHERE supplier_id IS NOT NULL
    --        UNION
    --        SELECT DISTINCT supplier_id 
    --        FROM OnlineDB.dbo.Product
    --        WHERE supplier_id IS NOT NULL
    --    ) AS p ON os.id = p.supplier_id
    --) AS source
    --ON target.id = source.id
    --WHEN NOT MATCHED THEN
    --    INSERT (id, name, email, phone, address)
    --    VALUES (source.id, source.name, source.email, source.phone, source.address);
    
    ---- Disable IDENTITY_INSERT after the merge
    --SET IDENTITY_INSERT dbm.dbo.supplier OFF;

    -------------------------------------------
    -- 2. ETL vào bảng product
    -------------------------------------------
    -- First, ensure we have categories mapped correctly
    WITH CategoryMapping AS (
        SELECT 
            src.id AS source_id, 
            tgt.id AS target_id,
            src.name
        FROM (
            SELECT id, name FROM OfflineDB.dbo.Category
            UNION
            SELECT id, name FROM OnlineDB.dbo.Category
        ) AS src
        JOIN dbm.dbo.category AS tgt ON src.name = tgt.name
    ),
    CombinedSource AS (
        SELECT 
            cm.target_id AS category_id,
            p.supplier_id,
            p.name,
            p.price,
            ROW_NUMBER() OVER (PARTITION BY p.name ORDER BY 
                CASE WHEN p.source_db = 'Online' THEN 1 ELSE 2 END) AS rn
        FROM (
            SELECT category_id, supplier_id, name, price, 'Offline' AS source_db
            FROM OfflineDB.dbo.Product
            UNION ALL
            SELECT category_id, supplier_id, name, price, 'Online' AS source_db
            FROM OnlineDB.dbo.Product
        ) AS p
        LEFT JOIN CategoryMapping cm ON p.category_id = cm.source_id
    )
    
    MERGE dbm.dbo.product AS target
    USING (
        SELECT category_id, supplier_id, name, price
        FROM CombinedSource
        WHERE rn = 1
    ) AS source
	ON target.name = source.name
    WHEN MATCHED THEN
        UPDATE SET 
            target.category_id = source.category_id,
            target.supplier_id = source.supplier_id,
            target.price = source.price
    WHEN NOT MATCHED THEN
        INSERT (category_id, supplier_id, name, price)
        VALUES (source.category_id, source.supplier_id, source.name, source.price);

    -------------------------------------------
    -- 3. ETL vào bảng branch_product
    -------------------------------------------
    WITH StockSource AS (
        SELECT 
            1 AS branch_id,
            p.name,
            p.stock
        FROM OnlineDB.dbo.Product p
        UNION ALL
        SELECT 
            2 AS branch_id,
            p.name,
            p.stock
        FROM OfflineDB.dbo.Product p
    ),
    RankedStock AS (
        SELECT *, 
               ROW_NUMBER() OVER (PARTITION BY branch_id, name ORDER BY name) AS rn
        FROM StockSource
    ),
    SourceWithProductId AS (
        SELECT rs.branch_id, p.id AS product_id, ISNULL(rs.stock, 0) AS stock
        FROM RankedStock rs
        JOIN dbm.dbo.product p ON rs.name = p.name
        WHERE rs.rn = 1
    )

    MERGE dbm.dbo.branch_product AS target
    USING SourceWithProductId AS source
    ON target.branch_id = source.branch_id AND target.product_id = source.product_id
    WHEN MATCHED THEN
        UPDATE SET 
            target.stock = source.stock
    WHEN NOT MATCHED THEN
        INSERT (branch_id, product_id, stock)
        VALUES (source.branch_id, source.product_id, source.stock);

    PRINT 'ETL process completed successfully.';
END;
GO