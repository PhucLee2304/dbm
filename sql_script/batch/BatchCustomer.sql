USE OutUserDB
GO

CREATE OR ALTER PROCEDURE InsertCustomerBatch
AS
BEGIN
    DECLARE @batch_size INT = 1000;  -- Kích thước mỗi nhóm (batch)
    DECLARE @current_batch INT = 1;   -- Biến để theo dõi nhóm hiện tại
    DECLARE @total_records INT = 1000000;  -- Tổng số bản ghi cần chèn
    DECLARE @user_id BIGINT;
    DECLARE @user_email VARCHAR(255);
    DECLARE @user_phone VARCHAR(20);
    DECLARE @user_index INT;

    -- Lặp qua các nhóm dữ liệu
    WHILE @current_batch <= @total_records / @batch_size + 1
    BEGIN
        -- Xử lý dữ liệu theo nhóm
        DECLARE @counter INT = 0;

        -- Tạo và chèn dữ liệu cho mỗi nhóm
        WHILE @counter < @batch_size
        BEGIN
            -- Tính toán chỉ mục cho khách hàng mới
            SET @user_index = (@current_batch - 1) * @batch_size + @counter + 1;

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

            -- Chèn vào bảng liên kết (nếu có)
            -- INSERT INTO [dbo].[customer_details] ([user_id], [additional_column])
            -- VALUES
            -- (
            --     @user_id,
            --     'Some value'
            -- );

            SET @counter = @counter + 1;
        END

        -- Cập nhật biến nhóm
        SET @current_batch = @current_batch + 1;

        PRINT 'Batch ' + CAST(@current_batch AS NVARCHAR(10)) + ' processed.';
    END

    PRINT 'ETL process completed successfully for Customer.';
END;
GO
