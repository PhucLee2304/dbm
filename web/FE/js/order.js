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
    const viewModal = document.getElementById('viewModal');
    const closeModal = document.querySelector('.close');
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    let currentOrderId = null;
    let orders = [];

    // Kiểm tra xác thực và vai trò admin/staff
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
            console.log("Token payload:", payload); // Thêm log để kiểm tra
            
            // Kiểm tra role với nhiều cách ghi khác nhau
            const role = payload.role || payload.Role || '';
            const roleStr = typeof role === 'string' ? role.toUpperCase() : '';
            
            if (roleStr !== 'ADMIN' && roleStr !== 'STAFF') {
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

    // Hiển thị thông báo khi không có API
    function showNoApiNotice() {
        ordersTableBody.innerHTML = '';
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="9" class="no-data">API chưa được triển khai: GET /order/all</td>';
        ordersTableBody.appendChild(tr);
        showToast("Info", "API GET /order/all chưa được triển khai trong backend", "orange", 5000);
    }

    // Hiển thị đơn hàng trong bảng
    function displayOrders(orders) {
        ordersTableBody.innerHTML = '';
        
        if (!orders || orders.length === 0) {
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
        
        showToast("Info", "API GET /order/{orderId} chưa được triển khai trong backend", "orange", 5000);
        
        // Tạm thời sử dụng dữ liệu từ danh sách orders đã có
        const order = orders.find(o => o.id === orderId);
        if (order) {
            displayOrderDetails(order);
            viewModal.style.display = 'block';
        } else {
            showToast("Error", "Không tìm thấy thông tin đơn hàng", "error");
        }
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
        updateStatusBtn.style.display = 'none'; // Ẩn nút vì API chưa được triển khai
        
        // Hiển thị các mục đơn hàng
        const orderItemsTableBody = document.querySelector('#orderItemsTable tbody');
        orderItemsTableBody.innerHTML = '';
        
        if (order.orderDetails && order.orderDetails.length > 0) {
            order.orderDetails.forEach(item => {
                const productName = item.product ? item.product.name : 
                                   (item.branchProduct && item.branchProduct.product ? 
                                   item.branchProduct.product.name : 'N/A');
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${productName}</td>
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
            (order.customer && order.customer.name && order.customer.name.toLowerCase().includes(searchTerm)) ||
            (order.customer && order.customer.phone && order.customer.phone.toLowerCase().includes(searchTerm)) ||
            (order.staff && order.staff.name && order.staff.name.toLowerCase().includes(searchTerm)) ||
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
    if (checkAuthentication()) {
        showNoApiNotice();
    }
});