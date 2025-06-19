// Function hiển thị thông báo toast
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

// Kiểm tra xem người dùng đã đăng nhập chưa
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// Định dạng ngày tháng
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Lấy class CSS tương ứng với trạng thái đơn hàng
function getStatusClass(status) {
    switch (status) {
        case "PENDING":
            return "status-pending";
        case "COMPLETED":
            return "status-completed";
        case "CANCELLED":
            return "status-cancelled";
        default:
            return "";
    }
}

// Chuyển đổi trạng thái đơn hàng sang tiếng Việt
function translateStatus(status) {
    switch (status) {
        case "PENDING":
            return "Chờ xử lý";
        case "COMPLETED":
            return "Hoàn thành";
        case "CANCELLED":
            return "Đã hủy";
        default:
            return status;
    }
}

// Định dạng giá tiền theo VND
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(price);
}

// Lấy danh sách đơn hàng của khách hàng
function fetchMyOrders() {
    if (!checkAuth()) return;

    $.ajax({
        type: "GET",
        url: "http://localhost:8080/api/customer/orders",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        },
        success: function(response) {
            if (response.success) {
                displayOrders(response.data);
            } else {
                showToast("Lỗi", response.message, "error");
                $("#orders-list").html("<div class='error'>Không thể tải đơn hàng: " + response.message + "</div>");
            }
        },
        error: function(error) {
            console.error("Lỗi khi tải đơn hàng:", error);
            $("#orders-list").html("<div class='error'>Không thể tải đơn hàng. Vui lòng thử lại sau.</div>");
        }
    });
}

// Hiển thị danh sách đơn hàng
function displayOrders(orders) {
    if (!orders || orders.length === 0) {
        $("#orders-list").html("<div class='empty-orders'>Bạn chưa có đơn hàng nào.</div>");
        return;
    }

    // Sắp xếp đơn hàng theo ngày tạo giảm dần (mới nhất lên đầu)
    orders.sort((a, b) => new Date(b.created) - new Date(a.created));

    let ordersHTML = "";
    orders.forEach(order => {
        let orderDetailsHTML = "";
        
        if (order.orderDetails && order.orderDetails.length) {
            orderDetailsHTML = "<div class='order-items'><h4>Sản phẩm:</h4>";
            order.orderDetails.forEach(detail => {
                orderDetailsHTML += `
                    <div class="order-item">
                        <span>${detail.branchProduct.product.name} x ${detail.quantity}</span>
                        <span>${formatPrice(detail.price)}</span>
                    </div>
                `;
            });
            orderDetailsHTML += "</div>";
        }

        ordersHTML += `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <h3>Đơn hàng #${order.id}</h3>
                        <p>Ngày đặt: ${formatDate(order.created)}</p>
                    </div>
                    <div class="order-status ${getStatusClass(order.status)}">${translateStatus(order.status)}</div>
                </div>
                
                <div class="order-details">
                    <p><strong>Người nhận:</strong> ${order.recipientName || 'N/A'}</p>
                    <p><strong>Số điện thoại:</strong> ${order.recipientPhone || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> ${order.recipientAddress || 'N/A'}</p>
                    ${order.note ? `<p><strong>Ghi chú:</strong> ${order.note}</p>` : ''}
                </div>
                
                ${orderDetailsHTML}
                
                <div class="order-total">
                    <p>Giá trị đơn hàng: ${formatPrice(order.subtotal)}</p>
                    <p>Phí vận chuyển: ${formatPrice(order.shippingFee)}</p>
                    <p>Tổng cộng: ${formatPrice(order.total)}</p>
                </div>
                
                <div class="order-actions">
                    ${order.status === "PENDING" ? 
                        `<button class="btn-cancel" data-id="${order.id}">Hủy đơn hàng</button>` : 
                        ''}
                </div>
            </div>
        `;
    });

    $("#orders-list").html(ordersHTML);

    // Thêm sự kiện click cho các nút hủy đơn hàng
    $(".btn-cancel").on("click", function() {
        const orderId = $(this).data("id");
        cancelOrder(orderId);
    });
}

// Hủy đơn hàng
function cancelOrder(orderId) {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
        return;
    }

    $.ajax({
        type: "POST",
        url: `http://localhost:8080/api/customer/orders/${orderId}/cancel`,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        },
        success: function(response) {
            if (response.success) {
                showToast("Thành công", "Đơn hàng đã được hủy thành công", "success");
                // Tải lại danh sách đơn hàng
                setTimeout(() => {
                    fetchMyOrders();
                }, 1000);
            } else {
                showToast("Lỗi", response.message, "error");
            }
        },
        error: function(error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            showToast("Lỗi", "Không thể hủy đơn hàng. Vui lòng thử lại sau.", "error");
        }
    });
}

// Xử lý đăng xuất
function setupLogout() {
    $("#logout").on("click", function(e) {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });
}

// Khi trang tải xong
$(document).ready(function() {
    if (checkAuth()) {
        fetchMyOrders();
        setupLogout();
    }
});