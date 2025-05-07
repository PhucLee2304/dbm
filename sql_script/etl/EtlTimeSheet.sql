USE dbm;
GO

CREATE OR ALTER PROCEDURE EtlTimeSheet
AS
BEGIN
	
	EXEC EtlStaff

    ------------------------------------------------------------
    -- 1. ETL TimeSheet
    ------------------------------------------------------------
    MERGE dbm.dbo.time_sheet AS target
    USING (
        SELECT 
            ts.id AS source_time_sheet_id,
            s_dbm.id AS target_staff_id
        FROM OfflineDB.dbo.TimeSheet ts
        JOIN OfflineDB.dbo.Staff s_off ON ts.staff_id = s_off.id
        JOIN dbm.dbo.staff s_dbm ON s_off.code = s_dbm.code
    ) AS source
    ON target.staff_id = source.target_staff_id
    WHEN NOT MATCHED THEN
        INSERT (staff_id)
        VALUES (source.target_staff_id);

    ------------------------------------------------------------
    -- 2. ETL RecordDay
    ------------------------------------------------------------
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

    PRINT 'ETL TimeSheet & RecordDay completed successfully.';
END;
GO