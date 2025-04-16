INSERT INTO category (name)
VALUES 
    (N'Áo thun'),
    (N'Áo sơ mi'),
    (N'Áo khoác'),
    (N'Quần jean'),
    (N'Quần short'),
    (N'Váy'),
    (N'Đầm'),
    (N'Đồ thể thao'),
    (N'Đồ ngủ'),
    (N'Đồ lót'),
    (N'Phụ kiện'),
    (N'Giày dép');

INSERT INTO supplier (name, address)
VALUES
    (N'Công ty Dệt May ABC', N'123 Lê Lợi, Quận 1, TP.HCM'),
    (N'Fashion House XYZ', N'45 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội'),
    (N'Nhà cung cấp StylePro', N'678 Nguyễn Trãi, Quận 5, TP.HCM');

INSERT INTO product (name, price, category_id, supplier_id)
VALUES
    (N'Áo thun nam basic', 150000, 1, 1),
    (N'Áo sơ mi nữ công sở', 250000, 2, 2),
    (N'Áo khoác jean nam', 450000, 3, 3),
    (N'Quần jean skinny nữ', 350000, 4, 1),
    (N'Váy xòe hoa nhí', 280000, 6, 2),
    (N'Đồ ngủ cotton nữ', 190000, 9, 3),
    (N'Áo thể thao nam', 220000, 8, 1),
    (N'Giày sneaker trắng', 500000, 12, 2);


-- Khách hàng 1
INSERT INTO user_table (active, address, email, name, password, phone, role)
VALUES (1, N'12 Nguyễn Huệ, TP.HCM', N'khach1@example.com', N'Nguyễn Văn A', 'pass123', '0912345678', 'CUSTOMER');
--INSERT INTO customer (user_id) VALUES (SCOPE_IDENTITY());

-- Khách hàng 2
INSERT INTO user_table (active, address, email, name, password, phone, role)
VALUES (1, N'34 Trần Phú, Hà Nội', N'khach2@example.com', N'Trần Thị B', 'pass456', '0987654321', 'CUSTOMER');
--INSERT INTO customer (user_id) VALUES (SCOPE_IDENTITY());

-- Khách hàng 3
INSERT INTO user_table (active, address, email, name, password, phone, role)
VALUES (1, N'56 Nguyễn Trãi, Đà Nẵng', N'khach3@example.com', N'Lê Văn C', 'pass789', '0909090909', 'CUSTOMER');
--INSERT INTO customer (user_id) VALUES (SCOPE_IDENTITY());


---- Nhân viên 1
--INSERT INTO user_table (active, address, email, name, password, phone, role)
--VALUES (1, '78 Hai Bà Trưng, TP.HCM', 'nhanvien1@example.com', 'Phạm Thị D', 'staffpass1', '0933111222', 'STAFF');
--DECLARE @userId1 BIGINT = SCOPE_IDENTITY();
--INSERT INTO staff (code, expiry_date, salary, user_id)
--VALUES ('STF001', DATEADD(YEAR, 1, GETDATE()), 8000, @userId1);

---- Nhân viên 2
--INSERT INTO user_table (active, address, email, name, password, phone, role)
--VALUES (1, '89 Điện Biên Phủ, Hà Nội', 'nhanvien2@example.com', 'Hoàng Văn E', 'staffpass2', '0977888999', 'STAFF');
--DECLARE @userId2 BIGINT = SCOPE_IDENTITY();
--INSERT INTO staff (code, expiry_date, salary, user_id)
--VALUES ('STF002', DATEADD(YEAR, 1, GETDATE()), 7500, @userId2);



-- Đơn hàng 1
INSERT INTO order_table (created, shipping_fee, status, subtotal, total, note, recipient_address, recipient_name, recipient_phone, customer_id)
VALUES (GETDATE(), 30000, 'COMPLETED', 450000, 480000, N'Giao nhanh trong ngày', N'12 Nguyễn Huệ, TP.HCM', N'Nguyễn Văn A', '0912345678', 1);

-- Đơn hàng 2
INSERT INTO order_table (created, shipping_fee, status, subtotal, total, note, recipient_address, recipient_name, recipient_phone, customer_id)
VALUES (GETDATE(), 25000, 'PENDING', 300000, 325000, N'Giao giờ hành chính', N'34 Trần Phú, Hà Nội', N'Trần Thị B', '0987654321', 2);

-- Đơn hàng 3
INSERT INTO order_table (created, shipping_fee, status, subtotal, total, note, recipient_address, recipient_name, recipient_phone, customer_id)
VALUES (GETDATE(), 40000, 'CANCELLED', 600000, 640000, N'Hủy vì đặt nhầm size', N'56 Nguyễn Trãi, Đà Nẵng', N'Lê Văn C', '0909090909', 3);

-- Chi tiết đơn hàng 1 (ID giả định là 1)
INSERT INTO order_detail (order_id, product_id, quantity, price)
VALUES
    (1, 1, 2, 150000), -- Áo thun
    (1, 2, 1, 150000); -- Áo sơ mi

-- Chi tiết đơn hàng 2 (ID giả định là 2)
INSERT INTO order_detail (order_id, product_id, quantity, price)
VALUES
    (2, 4, 1, 350000);

-- Chi tiết đơn hàng 3 (ID giả định là 3)
INSERT INTO order_detail (order_id, product_id, quantity, price)
VALUES
    (3, 3, 2, 300000);


---- Time sheet cho nhân viên 1
--INSERT INTO time_sheet (staff_id) VALUES (1);

---- Time sheet cho nhân viên 2
--INSERT INTO time_sheet (staff_id) VALUES (3);

---- Mẫu cho nhân viên 1 (ID time_sheet phai tu tim)
--INSERT INTO record_day (day, time_sheet_id, checkin, checkout, status)
--VALUES 
--    ('2025-04-08', 1, '2025-04-08 08:00:00.000000', '2025-04-08 17:00:00.000000', 'ONTIME'),
--    ('2025-04-09', 1, '2025-04-09 08:30:00.000000', '2025-04-09 17:15:00.000000', 'LATE'),
--    ('2025-04-10', 1, '2025-04-10 00:00:00.000000', '2025-04-10 00:00:00.000000', 'ABSENT');

---- Mẫu cho nhân viên 2 (ID time_sheet phai tu tim)
--INSERT INTO record_day (day, time_sheet_id, checkin, checkout, status)
--VALUES 
--    ('2025-04-08', 6, '2025-04-08 08:10:00.000000', '2025-04-08 17:20:00.000000', 'ONTIME'),
--    ('2025-04-09', 6, '2025-04-09 00:00:00.000000', '2025-04-09 00:00:00.000000', 'ABSENT'),
--    ('2025-04-10', 6, '2025-04-10 08:45:00.000000', '2025-04-10 17:10:00.000000', 'LATE');
