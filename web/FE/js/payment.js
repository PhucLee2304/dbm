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

    // Kiểm tra xác thực và vai trò staff
    function checkAuthentication() {
        const token = localStorage.getItem('token');
        
        // console.log("Token from localStorage:", token ? "Found" : "Not found");
        
        if (!token) {
            showToast("Error", "Vui lòng đăng nhập để sử dụng chức năng này", "error");
            setTimeout(() => {
                window.location.href = "../html/login.html";
            }, 2000);
            return false;
        }

        // Force STAFF role for payment page since backend might not handle role correctly
        // This is a temporary fix until the backend issue is resolved
        localStorage.setItem("role", "STAFF");
        
        return true;
    }

    // Kiểm tra xác thực khi trang tải
    if(!checkAuthentication()) {
        return;
    } else {
        // console.log("Authentication successful for payment page");
        showToast("Success", "Đăng nhập thành công vào trang thanh toán", "success", 2000);
    }

    productSearch.addEventListener('input', function() {
        const query = productSearch.value.toLowerCase().trim();
        if (query.length > 0) {
            fetchProducts(query);
        } else {
            productResults.innerHTML = '';
        }
    });

    function fetchProducts(query) {
        const token = localStorage.getItem('token');
        
        try {
            $.ajax({
                type: "POST",
                url: `http://localhost:8080/order/staff/product/search?keyword=${encodeURIComponent(query)}`,
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function(response) {
                    // console.log("Product search response:", response);
                    if (response.success) {
                        displayProductResults(response.data);
                    } else {
                        showToast("Error", response.message || "Không thể tìm kiếm sản phẩm", "error");
                    }
                },
                error: function(error) {
                    // console.error("Error searching products:", error);
                    showToast("Error", "Không thể kết nối đến API tìm kiếm sản phẩm", "error");
                }
            });
        } catch (e) {
            // console.error("Exception in fetchProducts:", e);
            showToast("Error", "Lỗi khi thực hiện tìm kiếm sản phẩm", "error");
        }
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
                // console.error("Error creating order:", error);
                showToast("Error", "Không thể kết nối đến máy chủ", "error");
            }
        });
    });

    function displayReceipt(order) {
        console.log("Order data received:", order); // Bật log để kiểm tra cấu trúc dữ liệu
        
        let productsHtml = '';
        
        // Hiển thị chi tiết đơn hàng
        if (order.details && order.details.length > 0) {
            // Tính giá từ thông tin sản phẩm và số lượng
            const productPrices = {};
            
            // Lưu giá sản phẩm từ các sản phẩm đã chọn trước đó
            Object.keys(selectedProducts).forEach(id => {
                productPrices[selectedProducts[id].name] = selectedProducts[id].price;
            });
            
            order.details.forEach(item => {
                // Tính giá cho mỗi sản phẩm dựa trên productPrices hoặc từ thông tin trả về
                const price = item.price || (productPrices[item.productName] * item.quantity) || 0;
                productsHtml += `<p>Sản phẩm: ${item.productName}, Số lượng: ${item.quantity}, Giá: ${price.toLocaleString('vi-VN')} VND</p>`;
            });
        } else if (order.orderDetails && order.orderDetails.length > 0) {
            order.orderDetails.forEach(item => {
                // Xử lý truy cập an toàn đến thông tin sản phẩm
                let productName = 'Không có thông tin';
                if (item.branchProduct && item.branchProduct.product) {
                    productName = item.branchProduct.product.name;
                } else if (item.product) {
                    productName = item.product.name;
                } else if (item.productName) {
                    productName = item.productName;
                }
                
                productsHtml += `<p>Sản phẩm: ${productName}, Số lượng: ${item.quantity}, Giá: ${item.price.toLocaleString('vi-VN')} VND</p>`;
            });
        } else {
            // Nếu không có orderDetails, thử lấy từ danh sách sản phẩm đã chọn
            const selectedItems = selectedProductsContainer.querySelectorAll('.selected-product');
            selectedItems.forEach(productDiv => {
                const productId = productDiv.dataset.productId;
                const quantity = parseInt(productDiv.querySelector('.product-quantity').value, 10);
                const product = selectedProducts[productId];
                if (product) {
                    productsHtml += `<p>Sản phẩm: ${product.name}, Số lượng: ${quantity}, Giá: ${product.price.toLocaleString('vi-VN')} VND</p>`;
                }
            });
            
            if (productsHtml === '') {
                productsHtml = '<p>Không có thông tin sản phẩm</p>';
            }
        }

        // Lấy thông tin chi nhánh
        let branchName = 'N/A';
        if (order.branchName) {
            branchName = order.branchName;
        } else if (order.branch && order.branch.name) {
            branchName = order.branch.name;
        } else if (localStorage.getItem('branchName')) {
            branchName = localStorage.getItem('branchName');
        }

        // Lấy mã đơn hàng
        let orderId = 'N/A';
        if (order.orderId) {
            orderId = order.orderId;
        } else if (order.id) {
            orderId = order.id;
        }

        // Lấy mã nhân viên (nhưng không hiển thị trong hóa đơn)
        let staffCode = '';
        if (order.staffCode) {
            staffCode = order.staffCode;
        }

        receiptDiv.innerHTML = `
            <h2>Hóa đơn</h2>
            <p>Chi nhánh: ${branchName}</p>
            <p>Mã đơn hàng: ${orderId}</p>
            ${productsHtml}
            <p>Tổng tiền: ${(order.total || 0).toLocaleString('vi-VN')} VND</p>
            <p>Ngày tạo: ${order.created ? new Date(order.created).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}</p>
        `;
        
        // Clear the form for next order
        selectedProductsContainer.innerHTML = '';
        updateTotalPrice();
    }
});