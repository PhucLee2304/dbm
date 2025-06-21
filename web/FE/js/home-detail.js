// Kiểm tra trạng thái đăng nhập
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const loginLink = document.getElementById("login-link");
    const logoutLink = document.getElementById("logout-link");

    if (token) {
        // Nếu đã đăng nhập
        loginLink.style.display = "none";
        logoutLink.style.display = "inline";

        // Xử lý sự kiện đăng xuất
        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    } else {
        // Nếu chưa đăng nhập
        loginLink.style.display = "inline";
        logoutLink.style.display = "none";
    }
});

let url = `http://localhost:8080/home/public/product/random`;

async function fetchProducts(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderProducts(data.data);
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
    }
}

function renderProducts(products) {
    const productList = document.getElementById("product-list");
    if (!productList) return;
    productList.innerHTML = "";
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <a href="detail.html?id=${product.id}">
                <img src="https://516family.com/wp-content/uploads/2020/03/423A7988-731x1024.jpg" alt="${product.name}" width="100%">
                <h3>${product.name}</h3>
                <p>Giá: ${product.price} VNĐ</p>
            </a>
        `;
        productList.appendChild(productCard);
    });
}

async function searchProducts() {
    const searchInput = document.getElementById("search-name");
    if (!searchInput) return;

    const searchName = searchInput.value;
    if (searchName) {
        let url = `http://localhost:8080/home/public/product/search?keyword=${encodeURIComponent(searchName)}`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            renderProducts(data.data);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        }
    }
}

function randomProducts() {
    fetchProducts(url);
}

if (document.getElementById("product-list")) {
    fetchProducts(url);
}

async function fetchProductDetail() {
    const productDetail = document.getElementById("product-detail");
    if (!productDetail) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId) {
        productDetail.innerHTML = "<h2>Không tìm thấy sản phẩm</h2>";
        return;
    }
    try {
        const response = await fetch(`http://localhost:8080/home/public/product/${productId}`);
        const data = await response.json();
        
        // Lưu thông tin sản phẩm vào localStorage để sử dụng ở trang đặt hàng
        localStorage.setItem('selectedProduct', JSON.stringify(data.data));
        
        productDetail.innerHTML = `
            <img src="https://516family.com/wp-content/uploads/2020/03/423A7988-731x1024.jpg" alt="${data.data.name}" style="width: 100%; max-width: 300px; margin-bottom: 20px;">
            <div class="product-info">
                <h2>${data.data.name}</h2>
                <p><strong>Danh mục:</strong> ${data.data.categoryName}</p>
                <p><strong>Giá:</strong> ${data.data.price} VNĐ</p>
                <p><strong>Nhà cung cấp:</strong> ${data.data.supplierName}</p>
                <p><strong>Số lượng:</strong> ${data.data.stock}</p>
                <button class="buy-button" onclick="goToOrderPage()">Mua</button>
            </div>
        `;
    } catch (error) {
        productDetail.innerHTML = "<h2>Lỗi khi tải chi tiết sản phẩm</h2>";
        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
    }
}

// Hàm chuyển hướng đến trang đặt hàng online
function goToOrderPage() {
    const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));
    if (selectedProduct) {
        // Chuyển hướng đến trang đặt hàng với thông tin sản phẩm
        window.location.href = `online-order.html?productId=${selectedProduct.id}&productName=${encodeURIComponent(selectedProduct.name)}&productPrice=${selectedProduct.price}&productImage=${encodeURIComponent(selectedProduct.name)}`;
    } else {
        alert("Không thể tìm thấy thông tin sản phẩm. Vui lòng thử lại.");
    }
}

fetchProductDetail();
