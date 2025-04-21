INSERT INTO user_table (active, address, email, name, password, phone, role) VALUES
(1, N'123 Đường Lý Thường Kiệt, Hà Nội', 'an.nguyen@example.com', N'Nguyễn Văn An', 'pass123', '0912345678', 'CUSTOMER'),
(1, N'45 Trần Phú, Đà Nẵng', 'binh.tran@example.com', N'Trần Thị Bình', 'pass456', '0987654321', 'STAFF'),
(1, N'78 Nguyễn Huệ, TP.HCM', 'huy.le@example.com', N'Lê Văn Huy', 'pass789', '0909090909', 'ADMIN');


INSERT INTO staff (code, expiry_date, salary, user_id) VALUES
('STF001', '2025-12-31', 15000000, 2),
('STF002', '2025-10-15', 13000000, 3);

INSERT INTO category (name) VALUES
(N'Đồ điện tử'),
(N'Đồ gia dụng'),
(N'Sách');

INSERT INTO supplier (name, address) VALUES
(N'Công ty Thiết bị Ánh Dương', N'456 Đường 3/2, Cần Thơ'),
(N'Nhà cung cấp Minh Châu', N'12 Nguyễn Trãi, Huế'),
(N'CTCP Văn hóa Trí Tuệ Việt', N'88 Lê Lợi, Hà Nội');

INSERT INTO product (name, price, category_id, supplier_id) VALUES
(N'Tai nghe Bluetooth', 1200000, 1, 1),
(N'Nồi cơm điện', 950000, 2, 2),
(N'Sách giáo khoa lớp 10', 80000, 3, 3);

INSERT INTO order_table (created, shipping_fee, status, subtotal, total, staff_id) VALUES
(GETDATE(), 30000, 'PENDING', 1200000, 1230000, 1),
(GETDATE(), 25000, 'COMPLETED', 950000, 975000, 2),
(GETDATE(), 15000, 'CANCELLED', 80000, 95000, 1);

INSERT INTO order_detail (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 1200000),
(2, 2, 1, 950000),
(3, 3, 1, 80000);

INSERT INTO time_sheet (staff_id) VALUES
(1),
(2);

INSERT INTO record_day (day, time_sheet_id, checkin, checkout, status) VALUES
('2025-04-15', 1, '2025-04-15 08:00:00', '2025-04-15 17:00:00', 'ONTIME'),
('2025-04-16', 1, '2025-04-16 08:30:00', '2025-04-16 17:15:00', 'LATE'),
('2025-04-15', 2, '2025-04-15 08:05:00', '2025-04-15 17:00:00', 'ONTIME');
