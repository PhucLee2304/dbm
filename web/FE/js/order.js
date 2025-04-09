function showToast(title, message, type, duration) {
    Toastify({
        text: `${title}: ${message}`,
        duration: duration || 5000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            backgroundColor: type == "success" ? "green" : type == "error" ? "red" : "yellow",
        }
    }).showToast();
}

document.addEventListener('DOMContentLoaded', function() {
    const ordersTableBody = document.querySelector('#ordersTable tbody');
    const searchInput = document.getElementById('searchInput');
    const viewModal = document.getElementById('viewModal');
    const closeModal = document.querySelector('.close');
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    let currentOrderId = null;
    let orders = [];

    // Kiểm tra xác thực và vai trò admin
    function checkAuthentication() {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast("Error", "Vui lòng đăng nhập để sử dụng chức năng này", "error");
            setTimeout(() => {
                window.location.href = "../html/login.html";
            }, 2000);
            return false;
        }

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            if (payload.role !== 'ADMIN') {
                showToast("Error", "Bạn không có quyền truy cập trang này", "error");
                setTimeout(() => {
                    window.location.href = "../html/home.html";
                }, 2000);
                return false;
            }
            return true;
        } catch (e) {
            console.error("Error parsing token:", e);
            showToast("Error", "Token không hợp lệ, vui lòng đăng nhập lại", "error");
            setTimeout(() => {
                window.location.href = "../html/login.html";
            }, 2000);
            return false;
        }
    }

    // Lấy tất cả đơn hàng từ backend
    function fetchOrders() {
        if (!checkAuthentication()) return;

        // Tạm thời sử dụng dữ liệu mẫu để test giao diện
        generateMockOrders();
        
        // TODO: Khi có API thật, uncomment đoạn code sau
        /*
        const token = localStorage.getItem('token');
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/order/all",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(response) {
                if (response.success) {
                    orders = response.data;
                    displayOrders(orders);
                    showToast("Success", "Đã tải danh sách đơn hàng", "success", 2000);
                } else {
                    showToast("Error", response.message || "Không thể tải danh sách đơn hàng", "error");
                }
            },
            error: function(error) {
                console.error("Error fetching orders:", error);
                showToast("Error", "Không thể kết nối đến máy chủ", "error");
            }
        });
        */
    }

    // Tạo dữ liệu mẫu để test
    function generateMockOrders() {
        orders = [
            {
                id: 1,
                branch: { id: 1, name: "Chi nhánh Hà Nội" },
                customer: null,
                staff: { id: 1, name: "Nguyễn Văn A" },
                status: "COMPLETED",
                created: new Date().toISOString(),
                subtotal: 450000,
                shippingFee: 0,
                total: 450000,
                orderDetails: [
                    {
                        product: { id: 1, name: "Áo phông nam" },
                        quantity: 2,
                        price: 150000
                    },
                    {
                        product: { id: 3, name: "Quần jeans nam" },
                        quantity: 1,
                        price: 150000
                    }
                ]
            },
            {
                id: 2,
                branch: { id: 1, name: "Chi nhánh Hà Nội" },
                customer: null,
                staff: { id: 2, name: "Trần Thị B" },
                status: "PENDING",
                created: new Date().toISOString(),
                subtotal: 250000,
                shippingFee: 0,
                total: 250000,
                orderDetails: [
                    {
                        product: { id: 2, name: "Áo sơ mi nữ" },
                        quantity: 1,
                        price: 120000
                    },
                    {
                        product: { id: 4, name: "Quần jeans nữ" },
                        quantity: 1,
                        price: 130000
                    }
                ]
            }
        ];
        
        displayOrders(orders);
        showToast("Info", "Đang sử dụng dữ liệu mẫu để kiểm tra giao diện", "success", 3000);
    }

    // Hiển thị đơn hàng trong bảng
    function displayOrders(orders) {
        ordersTableBody.innerHTML = '';
        
        if (orders.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="9" class="no-data">Không có dữ liệu</td>';
            ordersTableBody.appendChild(tr);
            return;
        }
        
        orders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.branch ? order.branch.name : 'N/A'}</td>
                <td>${order.id}</td>
                <td>${order.customer ? order.customer.name : 'N/A'}</td>
                <td>${order.customer ? order.customer.phone : 'N/A'}</td>
                <td>${order.staff ? order.staff.name : 'N/A'}</td>
                <td>
                    <span class="status-badge status-${order.status.toLowerCase()}">${formatStatus(order.status)}</span>
                </td>
                <td>${formatDate(order.created)}</td>
                <td>${order.total.toLocaleString('vi-VN')} VND</td>
                <td class="action-icons">
                    <button class="view-btn" onclick="viewOrder(${order.id})">Xem</button>
                    ${order.status === 'PENDING' ? 
                      `<button class="complete-btn" onclick="updateOrderStatus(${order.id}, 'COMPLETED')">Hoàn thành</button>
                       <button class="cancel-btn" onclick="updateOrderStatus(${order.id}, 'CANCELLED')">Hủy</button>` : 
                      ''}
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

    // Xem chi tiết đơn hàng
    window.viewOrder = function(orderId) {
        if (!checkAuthentication()) return;

        currentOrderId = orderId;
        
        // Tìm đơn hàng trong dữ liệu đã có
        const order = orders.find(o => o.id === orderId);
        if (order) {
            displayOrderDetails(order);
            viewModal.style.display = 'block';
        } else {
            showToast("Error", "Không tìm thấy thông tin đơn hàng", "error");
        }
        
        // TODO: Khi có API thật, uncomment đoạn code sau
        /*
        const token = localStorage.getItem('token');
        
        $.ajax({
            type: "GET",
            url: `http://localhost:8080/order/${orderId}`,
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(response) {
                if (response.success) {
                    const order = response.data;
                    displayOrderDetails(order);
                    viewModal.style.display = 'block';
                } else {
                    showToast("Error", response.message || "Không thể tải chi tiết đơn hàng", "error");
                }
            },
            error: function(error) {
                console.error("Error fetching order details:", error);
                showToast("Error", "Không thể kết nối đến máy chủ", "error");
            }
        });
        */
    }

    // Hiển thị chi tiết đơn hàng trong modal
    function displayOrderDetails(order) {
        document.getElementById('viewOrderID').textContent = order.id;
        document.getElementById('viewBranchName').textContent = order.branch ? order.branch.name : 'N/A';
        document.getElementById('viewCustomerName').textContent = order.customer ? order.customer.name : 'N/A';
        document.getElementById('viewPhone').textContent = order.customer ? order.customer.phone : 'N/A';
        document.getElementById('viewEmployeeName').textContent = order.staff ? order.staff.name : 'N/A';
        document.getElementById('viewStatus').textContent = formatStatus(order.status);
        document.getElementById('viewCreated').textContent = formatDate(order.created);
        document.getElementById('viewSubtotal').textContent = order.subtotal.toLocaleString('vi-VN');
        document.getElementById('viewShippingFee').textContent = order.shippingFee.toLocaleString('vi-VN');
        document.getElementById('viewTotal').textContent = order.total.toLocaleString('vi-VN');
        
        // Thêm class cho phần tử trạng thái để tạo kiểu
        document.getElementById('viewStatus').className = `status-${order.status.toLowerCase()}`;
        
        // Hiển thị/ẩn nút cập nhật dựa trên trạng thái đơn hàng
        updateStatusBtn.style.display = order.status === 'PENDING' ? 'block' : 'none';
        
        // Hiển thị các mục đơn hàng
        const orderItemsTableBody = document.querySelector('#orderItemsTable tbody');
        orderItemsTableBody.innerHTML = '';
        
        if (order.orderDetails && order.orderDetails.length > 0) {
            order.orderDetails.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString('vi-VN')} VND</td>
                    <td>${(item.price * item.quantity).toLocaleString('vi-VN')} VND</td>
                `;
                orderItemsTableBody.appendChild(tr);
            });
        } else {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" class="no-data">Không có dữ liệu</td>';
            orderItemsTableBody.appendChild(tr);
        }
    }

    // Cập nhật trạng thái đơn hàng
    window.updateOrderStatus = function(orderId, status) {
        if (!checkAuthentication()) return;
        
        if (!confirm(`Bạn có chắc muốn ${status === 'COMPLETED' ? 'hoàn thành' : 'hủy'} đơn hàng này?`)) {
            return;
        }

        // Tìm và cập nhật đơn hàng trong dữ liệu local
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            displayOrders(orders);
            
            // Đóng modal nếu đang mở
            if (viewModal.style.display === 'block' && currentOrderId === orderId) {
                viewModal.style.display = 'none';
            }
            
            showToast("Success", "Cập nhật trạng thái đơn hàng thành công", "success");
        }
        
        // TODO: Khi có API thật, uncomment đoạn code sau
        /*
        const token = localStorage.getItem('token');
        
        $.ajax({
            type: "PUT",
            url: `http://localhost:8080/order/update-status/${orderId}`,
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({ status: status }),
            success: function(response) {
                if (response.success) {
                    showToast("Success", "Cập nhật trạng thái đơn hàng thành công", "success");
                    // Cập nhật đơn hàng trong danh sách
                    const orderIndex = orders.findIndex(o => o.id === orderId);
                    if (orderIndex !== -1) {
                        orders[orderIndex].status = status;
                        displayOrders(orders);
                    }
                    
                    // Đóng modal nếu đang mở
                    if (viewModal.style.display === 'block' && currentOrderId === orderId) {
                        viewModal.style.display = 'none';
                    }
                } else {
                    showToast("Error", response.message || "Không thể cập nhật trạng thái đơn hàng", "error");
                }
            },
            error: function(error) {
                console.error("Error updating order status:", error);
                showToast("Error", "Không thể kết nối đến máy chủ", "error");
            }
        });
        */
    }

    // Nút cập nhật trạng thái trong modal
    updateStatusBtn.addEventListener('click', function() {
        const statusOptions = ['COMPLETED', 'CANCELLED'];
        const status = prompt('Chọn trạng thái mới (COMPLETED/CANCELLED):', 'COMPLETED');
        
        if (status && statusOptions.includes(status.toUpperCase())) {
            updateOrderStatus(currentOrderId, status.toUpperCase());
        } else if (status) {
            showToast("Error", "Trạng thái không hợp lệ", "error");
        }
    });

    // Chức năng tìm kiếm
    function searchOrders() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            displayOrders(orders);
            return;
        }
        
        const filteredOrders = orders.filter(order => 
            (order.branch && order.branch.name.toLowerCase().includes(searchTerm)) ||
            (order.id.toString().includes(searchTerm)) ||
            (order.customer && order.customer.name.toLowerCase().includes(searchTerm)) ||
            (order.customer && order.customer.phone.toLowerCase().includes(searchTerm)) ||
            (order.staff && order.staff.name.toLowerCase().includes(searchTerm)) ||
            (formatStatus(order.status).toLowerCase().includes(searchTerm)) ||
            (formatDate(order.created).toLowerCase().includes(searchTerm)) ||
            (order.total.toString().includes(searchTerm))
        );
        
        displayOrders(filteredOrders);
    }

    searchInput.addEventListener('input', searchOrders);

    // Chức năng đóng modal
    closeModal.addEventListener('click', function() {
        viewModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == viewModal) {
            viewModal.style.display = 'none';
        }
    }

    // Khởi tạo
    fetchOrders();
});