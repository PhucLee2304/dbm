function showToast(title, message, type, duration) {
    Toastify({
        text: `${title}: ${message}`,
        duration: duration || 5000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            backgroundColor: type === "success" ? "green" : type === "error" ? "red" : "orange",
        }
    }).showToast();
}

document.addEventListener('DOMContentLoaded', function() {
    const ordersTableBody = document.querySelector('#ordersTable tbody');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const searchButton = document.getElementById('searchButton');
    const resetButton = document.getElementById('resetButton');
    const viewModal = document.getElementById('viewModal');
    const closeModal = document.querySelector('.close');
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    let currentOrderId = null;
    let orders = [];

    // Kiểm tra xác thực (không cần kiểm tra vai trò ADMIN/STAFF)
    function checkAuthentication() {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast("Error", "Vui lòng đăng nhập để sử dụng chức năng này", "error");
            setTimeout(() => {
                window.location.href = "../html/login.html";
            }, 2000);
            return false;
        }

        // User đã đăng nhập, cho phép xem đơn hàng không cần kiểm tra vai trò
        return true;
    }

    // Lấy danh sách đơn hàng từ API
    async function fetchOrders() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/order/all', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                orders = data.data;
                displayOrders(orders);
            } else {
                showToast("Error", data.message || "Không thể lấy danh sách đơn hàng", "error");
                ordersTableBody.innerHTML = '<tr><td colspan="10" class="no-data">Không thể lấy dữ liệu: ' + data.message + '</td></tr>';
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            showToast("Error", "Không thể kết nối đến máy chủ", "error");
            ordersTableBody.innerHTML = '<tr><td colspan="10" class="no-data">Không thể kết nối đến máy chủ</td></tr>';
        }
    }

    // Hiển thị đơn hàng trong bảng
    function displayOrders(orders) {
        ordersTableBody.innerHTML = '';
        
        if (!orders || orders.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="10" class="no-data">Không có dữ liệu</td>';
            ordersTableBody.appendChild(tr);
            return;
        }
        
        orders.forEach(order => {
            const tr = document.createElement('tr');
            
            // Xác định thông tin dựa trên loại đơn hàng (online/offline)
            // Thêm kiểm tra thêm để tránh N/A cho loại đơn hàng
            let type = order.type || '';
            
            // Nếu không có type nhưng có ID trong bảng orders, thử xác định dựa trên dữ liệu khác
            if (!type && order.id) {
                if (order.customer || order.recipientName || order.recipientPhone || order.recipientAddress) {
                    type = 'ONLINE';
                } else if (order.staff || order.branch) {
                    type = 'OFFLINE';
                } else {
                    type = 'UNKNOWN';
                }
            }
            
            const isOnline = type === 'ONLINE';
            const isOffline = type === 'OFFLINE';
            
            // Thêm kiểm tra safety cho các trường có thể NULL
            const branchName = isOffline && order.branch ? order.branch.address : 'N/A';
            
            let customerName = 'N/A';
            if (isOnline) {
                if (order.customer && order.customer.user && order.customer.user.name) {
                    customerName = order.customer.user.name;
                } else if (order.recipientName) {
                    customerName = order.recipientName;
                }
            } else if (isOffline) {
                customerName = 'Khách lẻ';
            }
            
            let customerPhone = 'N/A';
            if (isOnline) {
                if (order.customer && order.customer.user && order.customer.user.phone) {
                    customerPhone = order.customer.user.phone;
                } else if (order.recipientPhone) {
                    customerPhone = order.recipientPhone;
                }
            }
            
            const staffName = isOffline && order.staff && order.staff.user ? order.staff.user.name : 'N/A';
            
            tr.innerHTML = `
                <td>${branchName}</td>
                <td>${order.id}</td>
                <td>${type || 'UNKNOWN'}</td>
                <td>${customerName}</td>
                <td>${customerPhone}</td>
                <td>${staffName}</td>
                <td>
                    <span class="status-badge status-${(order.status ? order.status.toLowerCase() : 'pending')}">${formatStatus(order.status || 'PENDING')}</span>
                </td>
                <td>${formatDate(order.created)}</td>
                <td>${(order.total || 0).toLocaleString('vi-VN')} VND</td>
                <td class="action-icons">
                    <button class="view-btn" onclick="viewOrder(${order.id})">Xem</button>
                </td>
            `;
            ordersTableBody.appendChild(tr);
        });
    }

    // Định dạng trạng thái để hiển thị
    function formatStatus(status) {
        switch(status) {
            case 'PENDING': return 'Đang xử lý';
            case 'COMPLETED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    }

    // Định dạng ngày để hiển thị
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
    }

    // Hàm chuyển đổi chuỗi ngày sang đối tượng Date
    function parseDate(dateString) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            // Format: dd/mm/yyyy
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date(dateString);
    }

    // Kiểm tra xem đơn hàng có nằm trong khoảng ngày đã chọn không
    function isDateInRange(orderDateStr, startDateStr, endDateStr) {
        if (!startDateStr && !endDateStr) return true;
        
        const orderDate = new Date(orderDateStr);
        orderDate.setHours(0, 0, 0, 0);
        
        if (startDateStr && !endDateStr) {
            const startDate = new Date(startDateStr);
            startDate.setHours(0, 0, 0, 0);
            return orderDate >= startDate;
        }
        
        if (!startDateStr && endDateStr) {
            const endDate = new Date(endDateStr);
            endDate.setHours(23, 59, 59, 999);
            return orderDate <= endDate;
        }
        
        const startDate = new Date(startDateStr);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999);
        
        return orderDate >= startDate && orderDate <= endDate;
    }

    // Tìm kiếm đơn hàng theo nhiều tiêu chí
    function searchOrders() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedType = typeFilter.value;
        const selectedStatus = statusFilter.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        const filteredOrders = orders.filter(order => {
            // Kiểm tra theo từ khóa tìm kiếm
            const searchMatches = 
                (order.branch && order.branch.address && order.branch.address.toLowerCase().includes(searchTerm)) ||
                (order.id.toString().includes(searchTerm)) ||
                (order.customer && order.customer.user && order.customer.user.name && order.customer.user.name.toLowerCase().includes(searchTerm)) ||
                (order.customer && order.customer.user && order.customer.user.phone && order.customer.user.phone.includes(searchTerm)) ||
                (order.staff && order.staff.user && order.staff.user.name && order.staff.user.name.toLowerCase().includes(searchTerm)) ||
                (formatStatus(order.status).toLowerCase().includes(searchTerm)) ||
                (formatDate(order.created).toLowerCase().includes(searchTerm)) ||
                (order.total.toString().includes(searchTerm));
            
            // Kiểm tra theo loại đơn hàng
            const typeMatches = selectedType === '' || order.type === selectedType;
            
            // Kiểm tra theo trạng thái đơn hàng
            const statusMatches = selectedStatus === '' || order.status === selectedStatus;
            
            // Kiểm tra theo ngày
            const dateMatches = isDateInRange(order.created, startDate, endDate);
            
            // Trả về true nếu thỏa mãn tất cả các điều kiện
            return searchMatches && typeMatches && statusMatches && dateMatches;
        });
        
        displayOrders(filteredOrders);
    }

    // Gán sự kiện cho các phần tử tìm kiếm
    searchInput.addEventListener('input', searchOrders);
    typeFilter.addEventListener('change', searchOrders);
    statusFilter.addEventListener('change', searchOrders);
    searchButton.addEventListener('click', searchOrders);
    
    // Đặt lại tất cả các bộ lọc
    resetButton.addEventListener('click', function() {
        searchInput.value = '';
        typeFilter.value = '';
        statusFilter.value = '';
        startDateInput.value = '';
        endDateInput.value = '';
        displayOrders(orders);
    });

    // Xem chi tiết đơn hàng
    window.viewOrder = function(orderId) {
        if (!checkAuthentication()) return;

        currentOrderId = orderId;
        
        fetchOrderDetails(orderId);
    }
    
    // Lấy chi tiết đơn hàng từ API
    async function fetchOrderDetails(orderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/order/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                displayOrderDetails(data.data);
                viewModal.style.display = 'block';
            } else {
                showToast("Error", data.message || "Không thể lấy chi tiết đơn hàng", "error");
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
            showToast("Error", "Không thể kết nối đến máy chủ", "error");
        }
    }

    // Hiển thị chi tiết đơn hàng trong modal
    function displayOrderDetails(order) {
        document.getElementById('viewOrderID').textContent = order.id;
        
        // Xác định thông tin dựa trên loại đơn hàng (online/offline)
        let type = order.type || '';
        
        // Nếu không có type nhưng có ID, thử xác định dựa trên dữ liệu khác
        if (!type && order.id) {
            if (order.customer || order.recipientName || order.recipientPhone || order.recipientAddress) {
                type = 'ONLINE';
            } else if (order.staff || order.branch) {
                type = 'OFFLINE';
            } else {
                type = 'UNKNOWN';
            }
        }
        
        const isOnline = type === 'ONLINE';
        const isOffline = type === 'OFFLINE';
        
        // Cập nhật thông tin chi tiết với kiểm tra null safety
        document.getElementById('viewOrderType').textContent = type || 'UNKNOWN';
        
        // Chi nhánh
        let branchName = 'N/A';
        if (isOffline && order.branch) {
            branchName = order.branch.address || 'N/A';
        }
        document.getElementById('viewBranchName').textContent = branchName;
        
        // Khách hàng
        let customerName = 'N/A';
        if (isOnline) {
            if (order.customer && order.customer.user && order.customer.user.name) {
                customerName = order.customer.user.name;
            } else if (order.recipientName) {
                customerName = order.recipientName;
            }
        } else if (isOffline) {
            customerName = 'Khách lẻ';
        }
        document.getElementById('viewCustomerName').textContent = customerName;
        
        // Số điện thoại
        let phoneNumber = 'N/A';
        if (isOnline) {
            if (order.customer && order.customer.user && order.customer.user.phone) {
                phoneNumber = order.customer.user.phone;
            } else if (order.recipientPhone) {
                phoneNumber = order.recipientPhone;
            }
        }
        document.getElementById('viewPhone').textContent = phoneNumber;
        
        // Nhân viên
        let staffName = 'N/A';
        if (isOffline && order.staff && order.staff.user) {
            staffName = order.staff.user.name || 'N/A';
        }
        document.getElementById('viewEmployeeName').textContent = staffName;
        
        document.getElementById('viewStatus').textContent = formatStatus(order.status || 'PENDING');
        document.getElementById('viewCreated').textContent = formatDate(order.created);
        document.getElementById('viewSubtotal').textContent = (order.subtotal || 0).toLocaleString('vi-VN');
        document.getElementById('viewShippingFee').textContent = (order.shippingFee || 0).toLocaleString('vi-VN');
        document.getElementById('viewTotal').textContent = (order.total || 0).toLocaleString('vi-VN');
        
        // Thêm class cho phần tử trạng thái để tạo kiểu
        document.getElementById('viewStatus').className = `status-${(order.status ? order.status.toLowerCase() : 'pending')}`;
        
        // Hiển thị/ẩn nút cập nhật dựa trên trạng thái đơn hàng
        updateStatusBtn.style.display = (order.status === 'PENDING') ? 'block' : 'none';
        
        // Hiển thị các mục đơn hàng
        const orderItemsTableBody = document.querySelector('#orderItemsTable tbody');
        orderItemsTableBody.innerHTML = '';
        
        if (order.orderDetails && order.orderDetails.length > 0) {
            order.orderDetails.forEach(item => {
                // Xử lý để lấy tên sản phẩm từ cấu trúc dữ liệu
                let productName = 'N/A';
                let quantity = item.quantity || 0;
                let unitPrice = 0;
                let totalPrice = item.price || 0;
                
                if (item.branchProduct && item.branchProduct.product) {
                    productName = item.branchProduct.product.name;
                    unitPrice = quantity > 0 ? totalPrice / quantity : 0;
                }
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${productName}</td>
                    <td>${quantity}</td>
                    <td>${unitPrice.toLocaleString('vi-VN')} VND</td>
                    <td>${totalPrice.toLocaleString('vi-VN')} VND</td>
                `;
                orderItemsTableBody.appendChild(tr);
            });
        } else {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" class="no-data">Không có dữ liệu</td>';
            orderItemsTableBody.appendChild(tr);
        }
    }

    // Chức năng đóng modal
    closeModal.addEventListener('click', function() {
        viewModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == viewModal) {
            viewModal.style.display = 'none';
        }
    }
    
    // Chức năng cập nhật trạng thái đơn hàng
    updateStatusBtn.addEventListener('click', async function() {
        if (!currentOrderId) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/order/update/${currentOrderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                showToast("Success", "Cập nhật trạng thái đơn hàng thành công", "success");
                viewModal.style.display = 'none';
                // Refresh order list
                fetchOrders();
            } else {
                showToast("Error", data.message || "Không thể cập nhật trạng thái đơn hàng", "error");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            showToast("Error", "Không thể kết nối đến máy chủ", "error");
        }
    });

    // Khởi tạo
    if (checkAuthentication()) {
        fetchOrders();
        
        // Thiết lập giá trị mặc định cho các bộ lọc ngày
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        
        // Format date to yyyy-mm-dd
        const formatDateValue = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // Không tự động đặt ngày, để người dùng tự chọn khi cần
        // startDateInput.value = formatDateValue(lastMonth);
        // endDateInput.value = formatDateValue(today);
    }
});