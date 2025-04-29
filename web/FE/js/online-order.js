function showToast(title, message, type, duration) {
    Toastify({
        text: `${title}: ${message}`,
        duration: duration || 5000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3",
            color: "white",
            fontWeight: "bold"
        }
    }).showToast();
}

function checkAuthentication() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showToast("Error", "Vui lòng đăng nhập để đặt hàng", "error");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
        return false;
    }
    
    return true;
}

async function searchProducts(keyword) {
    try {
        const response = await fetch(`http://localhost:8080/home/public/product/search?keyword=${encodeURIComponent(keyword)}`, {
            method: 'POST'
        });
        const data = await response.json();
        if (data.success) {
            return data.data;
        }
        return [];
    } catch (error) {
        console.error('Error searching products:', error);
        showToast("Error", "Không thể kết nối đến máy chủ", "error");
        return [];
    }
}

async function createOnlineOrder(productId, quantity) {
    if (!checkAuthentication()) return null;

    try {
        const token = localStorage.getItem('token');
        
        const orderData = {
            productId: productId,
            quantity: quantity
        };
        
        console.log("Sending order data:", orderData);
        
        const response = await fetch('http://localhost:8080/order/add/temp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        if (data.success) {
            showToast("Success", "Đặt hàng thành công", "success");
            return data.data;
        } else {
            showToast("Error", data.message || "Không thể tạo đơn hàng", "error");
            return null;
        }
    } catch (error) {
        console.error('Error creating order:', error);
        showToast("Error", "Không thể kết nối đến máy chủ", "error");
        return null;
    }
}

function displayOrderSuccess(order) {
    const orderDetails = order.orderDetails && order.orderDetails.length > 0 ? order.orderDetails[0] : null;
    
    console.log("Order data:", order);
    
    // Cập nhật thông tin trong modal
    document.getElementById('orderId').textContent = order.id || '';
    
    if (orderDetails) {
        const productInfo = orderDetails.branchProduct ? orderDetails.branchProduct.product : null;
        if (productInfo) {
            document.getElementById('orderProductName').textContent = productInfo.name || '';
            document.getElementById('orderQuantity').textContent = orderDetails.quantity || '';
            document.getElementById('orderPrice').textContent = productInfo.price.toLocaleString('vi-VN') || '';
        }
    } else {
        // Lấy thông tin sản phẩm từ trang hiện tại
        document.getElementById('orderProductName').textContent = document.getElementById('productName').textContent || '';
        document.getElementById('orderQuantity').textContent = document.getElementById('quantity').value || '';
        document.getElementById('orderPrice').textContent = document.getElementById('productPrice').textContent || '';
    }
    
    document.getElementById('orderShippingFee').textContent = order.shippingFee.toLocaleString('vi-VN') || '';
    document.getElementById('orderTotal').textContent = order.total.toLocaleString('vi-VN') || '';
    
    // Hiển thị modal
    const orderSuccessModal = document.getElementById('orderSuccessModal');
    if (orderSuccessModal) {
        orderSuccessModal.style.display = 'flex';
    }
}

function updateTotalPrice() {
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const priceText = document.getElementById('productPrice').textContent;
    const price = parseFloat(priceText.replace(/[^0-9.-]+/g, '')) || 0;

    const subtotal = price * quantity;
    const shippingFee = Math.round(subtotal * 0.1 / 1000) * 1000; // 10% phí vận chuyển, làm tròn đến 1000
    const total = subtotal + shippingFee;

    document.getElementById('productSubtotal').textContent = subtotal.toLocaleString('vi-VN') + ' VND';
    document.getElementById('shippingFee').textContent = shippingFee.toLocaleString('vi-VN') + ' VND';
    document.getElementById('totalPrice').textContent = total.toLocaleString('vi-VN') + ' VND';
}

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xác thực khi tải trang
    if (!checkAuthentication()) {
        return;
    }

    const productSearch = document.getElementById('productSearch');
    const productResults = document.getElementById('productResults');
    const productImage = document.getElementById('productImage');
    const productName = document.getElementById('productName');
    const productPrice = document.getElementById('productPrice');
    const productId = document.getElementById('productId');
    const quantity = document.getElementById('quantity');
    const decreaseQuantity = document.getElementById('decreaseQuantity');
    const increaseQuantity = document.getElementById('increaseQuantity');
    const orderButton = document.getElementById('orderButton');
    const orderSuccessModal = document.getElementById('orderSuccessModal');
    const closeModal = document.querySelector('.close');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    
    let selectedProduct = null;
    
    // Lấy thông tin sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productIdFromUrl = urlParams.get('productId');
    
    if (productIdFromUrl) {
        const productNameFromUrl = urlParams.get('productName');
        const productPriceFromUrl = urlParams.get('productPrice');
        const productImageFromUrl = urlParams.get('productImage');
        
        if (productIdFromUrl && productNameFromUrl && productPriceFromUrl) {
            const productFromUrl = {
                id: parseInt(productIdFromUrl),
                name: productNameFromUrl,
                price: parseFloat(productPriceFromUrl),
                image: productImageFromUrl || 'https://via.placeholder.com/150?text=' + encodeURIComponent(productNameFromUrl)
            };
            
            selectProduct(productFromUrl);
            
            if (productSearch) {
                productSearch.value = productNameFromUrl;
            }
        }
    }
    
    // Xử lý tìm kiếm sản phẩm
    if (productSearch) {
        productSearch.addEventListener('input', async function() {
            const query = this.value.trim();
            if (query.length > 1) {
                const products = await searchProducts(query);
                if (products.length > 0) {
                    displayProductResults(products);
                } else {
                    productResults.innerHTML = '<li>Không tìm thấy sản phẩm</li>';
                    productResults.style.display = 'block';
                }
            } else {
                productResults.style.display = 'none';
            }
        });
    }
    
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
        
        productId.value = product.id;
        productName.textContent = product.name;
        productPrice.textContent = `${product.price.toLocaleString('vi-VN')} VND`;
        
        if (product.image) {
            productImage.src = product.image;
        } else {
            productImage.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(product.name);
        }
        
        quantity.disabled = false;
        decreaseQuantity.disabled = false;
        increaseQuantity.disabled = false;
        orderButton.disabled = false;
        
        updateTotalPrice();
    }
    
    // Điều khiển số lượng
    if (decreaseQuantity) {
        decreaseQuantity.addEventListener('click', function() {
            if (quantity.value > 1) {
                quantity.value = parseInt(quantity.value) - 1;
                updateTotalPrice();
            }
        });
    }
    
    if (increaseQuantity) {
        increaseQuantity.addEventListener('click', function() {
            quantity.value = parseInt(quantity.value) + 1;
            updateTotalPrice();
        });
    }
    
    if (quantity) {
        quantity.addEventListener('change', function() {
            if (this.value < 1) {
                this.value = 1;
            }
            updateTotalPrice();
        });
    }
    
    // Xử lý đặt hàng
    if (orderButton) {
        orderButton.addEventListener('click', async function() {
            const productId = document.getElementById('productId').value;
            const quantity = document.getElementById('quantity').value;

            if (!productId || !quantity) {
                showToast("Error", "Vui lòng chọn sản phẩm và số lượng", "error");
                return;
            }

            const order = await createOnlineOrder(parseInt(productId), parseInt(quantity));
            if (order) {
                displayOrderSuccess(order);
            }
        });
    }
    
    // Đóng modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            orderSuccessModal.style.display = 'none';
        });
    }
    
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            orderSuccessModal.style.display = 'none';
            window.location.href = 'home.html';
        });
    }
    
    // Đóng popup khi click bên ngoài
    window.addEventListener('click', function(event) {
        if (orderSuccessModal && event.target === orderSuccessModal) {
            orderSuccessModal.style.display = 'none';
        }
        
        if (productSearch && productResults && !productSearch.contains(event.target) && !productResults.contains(event.target)) {
            productResults.style.display = 'none';
        }
    });
});