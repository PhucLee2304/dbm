// all_product script

// let currentPage = 1;
// let totalPages = 1;
let url = `http://localhost:8080/home/public/product/random`;
async function fetchProducts(url) {
    // const pageSize = document.getElementById("items-per-page").value;
    // const searchName = document.getElementById("search-name").value;
    // const searchId = document.getElementById("search-id").value;
    // const category = document.getElementById("filter-category").value;
    // const sortType = document.getElementById("filter-sort").value;

    // let url = `http://localhost:8080/api/products?page=${currentPage}&size=${pageSize}`;
    // if (searchName) url += `&name=${encodeURIComponent(searchName)}`;
    // if (searchId) url += `&id=${encodeURIComponent(searchId)}`;
    // if (category) url += `&category=${encodeURIComponent(category)}`;
    // if (sortType) url += `&sort=${encodeURIComponent(filter-sort)}`;

    // let url = `http://localhost:8080/home/public/product/random`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        // const data = {
        //     "products": [
        //         { "id": "50", "name": "Casual Shirt", "category": "shirts", "price": 200000, "image": "https://picsum.photos/200/300?random=1" },
        //         { "id": "51", "name": "Formal Pants", "category": "pants", "price": 350000, "image": "https://picsum.photos/200/300?random=2" },
        //         { "id": "52", "name": "Denim Jacket", "category": "shirts", "price": 500000, "image": "https://picsum.photos/200/300?random=3" },
        //         { "id": "53", "name": "Chino Pants", "category": "pants", "price": 400000, "image": "https://picsum.photos/200/300?random=4" },
        //         { "id": "54", "name": "Graphic T-Shirt", "category": "shirts", "price": 150000, "image": "https://picsum.photos/200/300?random=5" },
        //         { "id": "55", "name": "Slim Fit Jeans", "category": "pants", "price": 500000, "image": "https://picsum.photos/200/300?random=6" },
        //         { "id": "56", "name": "Polo Shirt", "category": "shirts", "price": 280000, "image": "https://picsum.photos/200/300?random=7" },
        //         { "id": "57", "name": "Jogger Pants", "category": "pants", "price": 450000, "image": "https://picsum.photos/200/300?random=8" },
        //         { "id": "58", "name": "Hoodie", "category": "shirts", "price": 600000, "image": "https://picsum.photos/200/300?random=9" },
        //         { "id": "59", "name": "Shorts", "category": "pants", "price": 320000, "image": "https://picsum.photos/200/300?random=10" }
        //     ],
        //     "totalPages": 100000,
        //     "totalProduct": 1000000
        // };
        // renderProducts(data.products);
        renderProducts(data.data);
        // totalPages = data.totalPages;
        // updatePagination();
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}
function renderProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        const tempId = product.name.split(" ")[1];
        productCard.innerHTML = `
            <a href="detail.html?id=${tempId}">
                <img src="${product.name}" alt="${product.name}" width="100%">
                <h3>${product.name}</h3>
                <p>Price: ${product.price} VND</p>
            </a>
        `;
        productList.appendChild(productCard);
    });
}

// function renderProducts(products) {
//     const productList = document.getElementById("product-list");
//     productList.innerHTML = "";
//     products.forEach(product => {
//         const productCard = document.createElement("div");
//         productCard.classList.add("product-card");
//         productCard.innerHTML = `
//             <a href="product.html?id=${product.id}">
//                 <img src="${product.image}" alt="${product.name}" width="100%">
//                 <h3>${product.name}</h3>
//                 <p>ID: ${product.id}</p>
//                 <p>Price: ${product.price} VND</p>
//             </a>
//         `;
//         productList.appendChild(productCard);
//     });
// }

// function updatePagination() {
//     document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages}`;
//     document.getElementById("prev-page").disabled = currentPage === 1;
//     document.getElementById("next-page").disabled = currentPage === totalPages;
// }

// document.getElementById("prev-page").addEventListener("click", () => {
//     if (currentPage > 1) {
//         currentPage--;
//         fetchProducts();
//     }
// });

// document.getElementById("next-page").addEventListener("click", () => {
//     if (currentPage < totalPages) {
//         currentPage++;
//         fetchProducts();
//     }
// });

// document.getElementById("items-per-page").addEventListener("change", () => {
//     currentPage = 1;
//     fetchProducts();
// });

// window.applyFilters = () => {
//     currentPage = 1;
//     fetchProducts();
// };

function searchProducts() {
    const searchName = document.getElementById("search-name").value;
    if (searchName) {
        let url = `http://localhost:8080/home/public/product/search?keyword=${encodeURIComponent(searchName)}`;
        fetchProducts(url);
    }
}
function randomProducts() {
    fetchProducts(url);
}

fetchProducts(url);
// product script

async function fetchProductDetail() {
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
if (!productId) {
    document.getElementById("product-detail").innerHTML = "<h2>Product not found</h2>";
    return;
}
try {
    const response = await fetch(`http://localhost:8080/home/public/product/detail?id=${productId}`);
    const data = await response.json();
    // const product = {
    //     id: 50,
    //     name: "Casual Shirt",
    //     category: "shirts",
    //     price: 200000,
    //     image: "https://picsum.photos/200/300?random=1"
    // };
    document.getElementById("product-detail").innerHTML = `
        <img src="${data.data.name}" alt="${data.data.name}">
        <div class="product-info">
            <h2>${data.data.name}</h2>
            <p><strong>Category:</strong> ${data.data.categoryName}</p>
            <p><strong>Price:</strong> ${data.data.price} VND</p>
            <p><strong>Supplier:</strong> ${data.data.supplierName}</p>
            <p><strong>Stock:</strong> ${data.data.stock} VND</p>
            <p><strong>Description:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
    `;
} catch (error) {
    document.getElementById("product-detail").innerHTML = "<h2>Error loading product details</h2>";
    console.error("Error fetching product details:", error);
}
}

fetchProductDetail();