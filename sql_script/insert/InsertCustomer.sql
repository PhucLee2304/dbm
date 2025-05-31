use OutUserDB
go

CREATE OR ALTER PROCEDURE InsertCustomer
AS
BEGIN
    DECLARE @user_id BIGINT;
    DECLARE @user_email VARCHAR(255);
    DECLARE @user_phone VARCHAR(20);
    DECLARE @user_index INT;

    -- Tính toán chỉ mục cho khách hàng mới
    SET @user_index = (SELECT COUNT(*) FROM [dbo].[Customer]) + 1;

    -- Tạo email ngẫu nhiên
    SET @user_email = 'email' + CAST(@user_index AS VARCHAR(10)) + '@gmail.com';

    -- Tạo số điện thoại ngẫu nhiên từ 0000000001 đến 0000000010
    SET @user_phone = RIGHT('000000000' + CAST(@user_index AS VARCHAR(10)), 10);

    -- Chèn thông tin vào bảng Customer
    INSERT INTO [OutUserDB].[dbo].[Customer] ([active], [address], [email], [name], [password], [phone], [created])
    VALUES
    (
        1, -- active
        'Address ' + CAST(@user_index AS NVARCHAR(255)), -- address (Address 1, Address 2, ...)
        @user_email, -- email (email1@gmail.com, email2@gmail.com, ...)
        'Customer ' + CAST(@user_index AS NVARCHAR(255)), -- name (Customer 1, Customer 2, ...)
        '1234', -- password (mặc định là 1234)
        @user_phone, -- phone (0000000001, 0000000002, ...),
		GETDATE()
    );

    -- Lấy ID của người dùng vừa chèn vào bảng Customer
    SET @user_id = SCOPE_IDENTITY();

    -- (Nếu có bảng khác cần chèn liên kết, có thể làm như ví dụ dưới đây)
    -- INSERT INTO [dbo].[customer_details] ([user_id], [additional_column])
    -- VALUES
    -- (
    --    @user_id,
    --    'Some value'
    -- );
END;
GO