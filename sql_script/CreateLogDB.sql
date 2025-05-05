use Logs
go

create table SupplierLog(
	id INT IDENTITY(1,1) PRIMARY KEY,
	last_import_date DATETIME
)