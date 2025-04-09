let url = `http://localhost:8080/home/public/product/random`;

async function fetchProducts(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderProducts(data.data);
    } catch (error) {
        console.error("Error fetching products:", error);
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
                <img src="${product.name}" alt="${product.name}" width="100%">
                <h3>${product.name}</h3>
                <p>Price: ${product.price} VND</p>
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
            console.error("Error fetching products:", error);
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
        productDetail.innerHTML = "<h2>Product not found</h2>";
        return;
    }
    try {
        const response = await fetch(`http://localhost:8080/home/public/product/${productId}`);
        const data = await response.json();
        productDetail.innerHTML = `
            <img src="${data.data.name}" alt="${data.data.name}">
            <div class="product-info">
                <h2>${data.data.name}</h2>
                <p><strong>Category:</strong> ${data.data.categoryName}</p>
                <p><strong>Price:</strong> ${data.data.price} VND</p>
                <p><strong>Supplier:</strong> ${data.data.supplierName}</p>
                <p><strong>Stock:</strong> ${data.data.stock} VND</p>
                <button class="buy-button" onclick="">Buy</button>
            </div>
        `;
    } catch (error) {
        productDetail.innerHTML = "<h2>Error loading product details</h2>";
        console.error("Error fetching product details:", error);
    }
}

fetchProductDetail();
