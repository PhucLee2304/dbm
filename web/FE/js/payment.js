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
    const productSearch = document.getElementById('productSearch');
    const productResults = document.getElementById('productResults');
    const addProductButton = document.getElementById('addProductButton');
    const totalPriceSpan = document.getElementById('totalPrice');
    const generateReceiptButton = document.getElementById('generateReceipt');
    const receiptDiv = document.getElementById('receipt');
    const selectedProductsContainer = document.getElementById('selectedProductsContainer');

    // Store product information for selected products
    const selectedProducts = {};

    // // Kiểm tra xác thực và vai trò staff
    // function checkAuthentication() {
    //     const token = localStorage.getItem('token');
    //     if (!token) {
    //         showToast("Error", "Vui lòng đăng nhập để sử dụng chức năng này", "error");
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
            
    //         if (roleStr !== 'STAFF') {
    //             showToast("Error", `Bạn không có quyền truy cập trang này. Vai trò hiện tại: ${roleStr}`, "error");
    //             setTimeout(() => {
    //                 window.location.href = "../html/home.html";
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

    // // Kiểm tra xác thực khi trang tải
    // if(!checkAuthentication()) {
    //     return;
    // }

    productSearch.addEventListener('input', function() {
        const query = productSearch.value.toLowerCase();
        if (query.length > 0) {
            fetchProducts(query);
        } else {
            productResults.innerHTML = '';
        }
    });

    function fetchProducts(query) {
        // if (!checkAuthentication()) return;
        
        const token = localStorage.getItem('token');
        
        $.ajax({
            type: "POST",
            url: `http://localhost:8080/order/staff/product/search?keyword=${encodeURIComponent(query)}`,
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(response) {
                if (response.success) {
                    displayProductResults(response.data);
                } else {
                    showToast("Error", response.message || "Không thể tìm kiếm sản phẩm", "error");
                }
            },
            error: function(error) {
                console.error("Error searching products:", error);
                showToast("Error", "Không thể kết nối đến máy chủ", "error");
            }
        });
    }

    function displayProductResults(products) {
        productResults.innerHTML = '';
        products.forEach(product => {
            const li = document.createElement('li');
            li.textContent = `${product.name} - ${product.price.toLocaleString('vi-VN')} VND`;
            li.addEventListener('click', function() {
                productSearch.value = product.name;
                productResults.innerHTML = '';
                selectedProducts[product.id] = product;
            });
            productResults.appendChild(li);
        });
    }

    function updateTotalPrice() {
        let totalPrice = 0;
        const selectedItems = selectedProductsContainer.querySelectorAll('.selected-product');

        selectedItems.forEach(productDiv => {
            const productId = productDiv.dataset.productId;
            const quantity = parseInt(productDiv.querySelector('.product-quantity').value, 10);
            const product = selectedProducts[productId];
            if (product) {
                totalPrice += product.price * quantity;
            }
        });

        totalPriceSpan.textContent = totalPrice.toLocaleString('vi-VN');
    }

    addProductButton.addEventListener('click', function() {
        const selectedProductName = productSearch.value;
        
        // Find the product by name
        const productId = Object.keys(selectedProducts).find(
            id => selectedProducts[id].name === selectedProductName
        );
        
        if (!productId) {
            showToast("Error", "Vui lòng chọn sản phẩm từ danh sách", "error");
            return;
        }
        
        const product = selectedProducts[productId];
        
        // Check if the product already exists
        const existingProduct = Array.from(selectedProductsContainer.querySelectorAll('.selected-product'))
            .find(el => el.dataset.productId === productId);
            
        if (existingProduct) {
            const quantityInput = existingProduct.querySelector('.product-quantity');
            quantityInput.value = parseInt(quantityInput.value) + 1;
            updateTotalPrice();
            return;
        }
        
        // Add new product
        const productDiv = document.createElement('div');
        productDiv.classList.add('selected-product');
        productDiv.dataset.productId = productId;
        
        productDiv.innerHTML = `
            <span class="product-name">${product.name}</span>
            <input type="number" class="product-quantity" min="1" value="1" required>
            <button type="button" class="remove-product-button">Xóa</button>
        `;
        
        selectedProductsContainer.appendChild(productDiv);

        productDiv.querySelector('.product-quantity').addEventListener('input', updateTotalPrice);
        productDiv.querySelector('.remove-product-button').addEventListener('click', function() {
            productDiv.remove();
            updateTotalPrice();
        });

        updateTotalPrice();
        productSearch.value = '';
    });

    generateReceiptButton.addEventListener('click', function() {
        if (!checkAuthentication()) return;
        
        const selectedItems = selectedProductsContainer.querySelectorAll('.selected-product');
        if (selectedItems.length === 0) {
            showToast("Error", "Vui lòng chọn ít nhất một sản phẩm", "error");
            return;
        }
        
        // Create items array for the API request
        const items = [];
        
        selectedItems.forEach(productDiv => {
            const productId = productDiv.dataset.productId;
            const quantity = parseInt(productDiv.querySelector('.product-quantity').value, 10);
            
            // Format as required by backend API
            const item = {};
            item[productId] = quantity;
            items.push(item);
        });
        
        const orderRequest = {
            items: items
        };
        
        // Send the order to the backend
        const token = localStorage.getItem('token');
        
        $.ajax({
            type: "POST",
            url: "http://localhost:8080/order/staff/add",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            data: JSON.stringify(orderRequest),
            success: function(response) {
                if (response.success) {
                    showToast("Success", "Đã tạo đơn hàng thành công", "success");
                    displayReceipt(response.data);
                } else {
                    showToast("Server error", response.message || "Không thể tạo đơn hàng", "error");
                }
            },
            error: function(error) {
                console.error("Error creating order:", error);
                showToast("Error", "Không thể kết nối đến máy chủ", "error");
            }
        });
    });

    function displayReceipt(order) {
        let productsHtml = '';
        
        // Hiển thị chi tiết đơn hàng
        if (order.orderDetails && order.orderDetails.length > 0) {
            order.orderDetails.forEach(item => {
                productsHtml += `<p>Sản phẩm: ${item.branchProduct.product.name}, Số lượng: ${item.quantity}, Giá: ${item.price.toLocaleString('vi-VN')} VND</p>`;
            });
        } else {
            productsHtml = '<p>Không có thông tin sản phẩm</p>';
        }

        receiptDiv.innerHTML = `
            <h2>Hóa đơn</h2>
            <p>Chi nhánh: ${order.branch ? order.branch.name : 'N/A'}</p>
            <p>Mã đơn hàng: ${order.id}</p>
            <p>Nhân viên: ${order.staff ? order.staff.name : 'N/A'}</p>
            ${productsHtml}
            <p>Tổng tiền: ${order.total.toLocaleString('vi-VN')} VND</p>
            <p>Ngày tạo: ${new Date(order.created).toLocaleString('vi-VN')}</p>
        `;
        
        // Clear the form for next order
        selectedProductsContainer.innerHTML = '';
        updateTotalPrice();
    }
});