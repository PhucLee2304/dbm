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
    const productSearch = document.getElementById('productSearch');
    const productResults = document.getElementById('productResults');
    const productImage = document.getElementById('productImage');
    const productName = document.getElementById('productName');
    const productPrice = document.getElementById('productPrice');
    const productId = document.getElementById('productId');
    const quantity = document.getElementById('quantity');
    const decreaseQuantity = document.getElementById('decreaseQuantity');
    const increaseQuantity = document.getElementById('increaseQuantity');
    const productSubtotal = document.getElementById('productSubtotal');
    const shippingFee = document.getElementById('shippingFee');
    const totalPrice = document.getElementById('totalPrice');
    const orderButton = document.getElementById('orderButton');
    const orderSuccessModal = document.getElementById('orderSuccessModal');
    const closeModal = document.querySelector('.close');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    
    let selectedProduct = null;
    
    // // Kiểm tra xác thực
    // function checkAuthentication() {
    //     const token = localStorage.getItem('token');
    //     if (!token) {
    //         showToast("Error", "Vui lòng đăng nhập để đặt hàng", "error");
    //         setTimeout(() => {
    //             window.location.href = "../html/login.html";
    //         }, 2000);
    //         return false;
    //     }

    //     try {
    //         const base64Url = token.split('.')[1];
    //         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    //         const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    //             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    //         }).join(''));

    //         const payload = JSON.parse(jsonPayload);
    //         console.log("Token payload:", payload); // Thêm log để kiểm tra
            
    //         // Kiểm tra role với nhiều cách ghi khác nhau
    //         const role = payload.role || payload.Role || '';
    //         const roleStr = typeof role === 'string' ? role.toUpperCase() : '';
            
    //         if (roleStr !== 'CUSTOMER') {
    //             showToast("Error", "Bạn cần đăng nhập bằng tài khoản khách hàng để đặt hàng", "error");
    //             setTimeout(() => {
    //                 window.location.href = "../html/login.html";
    //             }, 2000);
    //             return false;
    //         }
    //         return true;
    //     } catch (e) {
    //         console.error("Error parsing token:", e);
    //         showToast("Error", "Token không hợp lệ, vui lòng đăng nhập lại", "error");
    //         setTimeout(() => {
    //             window.location.href = "../html/login.html";
    //         }, 2000);
    //         return false;
    //     }
    // }
    
    // Xử lý tìm kiếm sản phẩm
    productSearch.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length > 1) {
            // Sử dụng API /home/public/product/search để tìm kiếm sản phẩm
            fetch(`http://localhost:8080/home/public/product/search?keyword=${encodeURIComponent(query)}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data.length > 0) {
                    displayProductResults(data.data);
                } else {
                    productResults.innerHTML = '<li>Không tìm thấy sản phẩm</li>';
                    productResults.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error searching products:', error);
                showToast("Error", "Không thể kết nối đến máy chủ", "error");
            });
        } else {
            productResults.style.display = 'none';
        }
    });
    
    // Hiển thị kết quả tìm kiếm
    function displayProductResults(products) {
        productResults.innerHTML = '';
        
        products.forEach(product => {
            const li = document.createElement('li');
            li.textContent = `${product.name} - ${product.price.toLocaleString('vi-VN')} VND`;
            li.addEventListener('click', function() {
                selectProduct(product);
                productResults.style.display = 'none';
                productSearch.value = product.name;
            });
            productResults.appendChild(li);
        });
        
        productResults.style.display = 'block';
    }
    
    // Chọn sản phẩm
    function selectProduct(product) {
        selectedProduct = product;
        
        // Cập nhật giao diện với sản phẩm đã chọn
        productId.value = product.id;
        productName.textContent = product.name;
        productPrice.textContent = `${product.price.toLocaleString('vi-VN')} VND`;
        
        if (product.image) {
            productImage.src = product.image;
        } else {
            productImage.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(product.name);
        }
        
        // Kích hoạt các nút điều khiển số lượng
        quantity.disabled = false;
        decreaseQuantity.disabled = false;
        increaseQuantity.disabled = false;
        orderButton.disabled = false;
        
        // Cập nhật tổng giá
        updateTotalPrice();
    }
    
    // Xử lý nút tăng/giảm số lượng
    decreaseQuantity.addEventListener('click', function() {
        if (quantity.value > 1) {
            quantity.value = parseInt(quantity.value) - 1;
            updateTotalPrice();
        }
    });
    
    increaseQuantity.addEventListener('click', function() {
        quantity.value = parseInt(quantity.value) + 1;
        updateTotalPrice();
    });
    
    quantity.addEventListener('change', function() {
        if (this.value < 1) {
            this.value = 1;
        }
        updateTotalPrice();
    });
    
    // Cập nhật tổng giá
    function updateTotalPrice() {
        if (!selectedProduct) return;
        
        const qty = parseInt(quantity.value);
        const price = selectedProduct.price;
        const subtotal = price * qty;
        
        // Phí vận chuyển: 10% của subtotal, làm tròn đến 1000 đồng
        const shipping = Math.round(subtotal * 0.1 / 1000) * 1000;
        const total = subtotal + shipping;
        
        productSubtotal.textContent = `${subtotal.toLocaleString('vi-VN')} VND`;
        shippingFee.textContent = `${shipping.toLocaleString('vi-VN')} VND`;
        totalPrice.textContent = `${total.toLocaleString('vi-VN')} VND`;
    }
    
    // Xử lý nút đặt hàng
    orderButton.addEventListener('click', function() {
        if (!checkAuthentication()) return;
        
        if (!selectedProduct) {
            showToast("Error", "Vui lòng chọn sản phẩm", "error");
            return;
        }
        
        const qty = parseInt(quantity.value);
        if (qty < 1) {
            showToast("Error", "Số lượng phải lớn hơn 0", "error");
            return;
        }
        
        // Gọi API tạo đơn hàng online tạm thời
        const token = localStorage.getItem('token');
        const orderRequest = {
            productId: parseInt(productId.value),
            quantity: qty
        };
        
        fetch('http://localhost:8080/order/add/temp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderRequest)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast("Success", "Đặt hàng thành công", "success");
                displayOrderSuccess(data.data);
            } else {
                showToast("Error", data.message || "Không thể tạo đơn hàng", "error");
            }
        })
        .catch(error => {
            console.error('Error creating order:', error);
            showToast("Error", "Không thể kết nối đến máy chủ", "error");
        });
    });
    
    // Hiển thị thông tin đơn hàng thành công
    function displayOrderSuccess(order) {
        // Lấy thông tin chi tiết đơn hàng từ kết quả API
        const orderDetails = order.orderDetails && order.orderDetails.length > 0 ? order.orderDetails[0] : null;
        const orderOnline = order.orderOnline || {};
        
        // Cập nhật thông tin modal
        document.getElementById('orderId').textContent = order.id || '';
        document.getElementById('recipientName').textContent = orderOnline.recipientName || '';
        document.getElementById('recipientAddress').textContent = orderOnline.recipientAddress || '';
        document.getElementById('recipientPhone').textContent = orderOnline.recipientPhone || '';
        
        if (orderDetails) {
            const productInfo = orderDetails.branchProduct ? orderDetails.branchProduct.product : selectedProduct;
            document.getElementById('orderProductName').textContent = productInfo.name || '';
            document.getElementById('orderQuantity').textContent = orderDetails.quantity || '';
            document.getElementById('orderPrice').textContent = productInfo.price.toLocaleString('vi-VN') || '';
        } else {
            document.getElementById('orderProductName').textContent = selectedProduct ? selectedProduct.name : '';
            document.getElementById('orderQuantity').textContent = quantity.value;
            document.getElementById('orderPrice').textContent = selectedProduct ? selectedProduct.price.toLocaleString('vi-VN') : '';
        }
        
        document.getElementById('orderShippingFee').textContent = order.shippingFee.toLocaleString('vi-VN') || '';
        document.getElementById('orderTotal').textContent = order.total.toLocaleString('vi-VN') || '';
        
        // Hiển thị modal
        orderSuccessModal.style.display = 'flex';
    }
    
    // Đóng modal
    closeModal.addEventListener('click', function() {
        orderSuccessModal.style.display = 'none';
    });
    
    continueShoppingBtn.addEventListener('click', function() {
        orderSuccessModal.style.display = 'none';
        window.location.href = '../html/home.html';
    });
    
    // Đóng popup khi click bên ngoài
    window.addEventListener('click', function(event) {
        if (event.target === orderSuccessModal) {
            orderSuccessModal.style.display = 'none';
        }
        
        if (!productSearch.contains(event.target) && !productResults.contains(event.target)) {
            productResults.style.display = 'none';
        }
    });
    
    // Kiểm tra xác thực khi tải trang
    checkAuthentication();
});