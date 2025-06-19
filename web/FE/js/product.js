// Hàm hiển thị thông báo
function showToast(title, message, type, duration) {
    Toastify({
        text: `${title}: ${message}`,
        duration: duration || 5000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            backgroundColor: type === "success" ? "green" : type === "error" ? "red" : "yellow",
        }
    }).showToast();
}

// Khởi tạo khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
    // ============== DOM Elements ==============
    const tableBody = document.querySelector("tbody");
    const searchInput = document.querySelector(".search-box input");
    const searchBtn = document.querySelector(".search-box button");
    const addBtn = document.querySelector(".add-btn");
    const modal = document.getElementById("product-modal");
    const modalTitle = document.getElementById("modal-title");
    const closeModal = document.querySelector(".close");
    const form = document.getElementById("product-form");
    const idInput = document.getElementById("product-id");
    const nameInput = document.getElementById("product-name");
    const categoryInput = document.getElementById("product-category");
    const supplierInput = document.getElementById("product-supplier");
    const priceInput = document.getElementById("product-price");
    const branchStocksContainer = document.getElementById("branch-stocks");
    const minStockInput = document.getElementById("min-stock"); // Thay đổi từ categoryFilter
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");
    const stockStatusFilter = document.getElementById("stock-status");
    const applyFilterBtn = document.getElementById("apply-filter");
    const resetFilterBtn = document.getElementById("reset-filter");

    let products = [];
// <<<<<<< hieu

//     // ============== Load Categories và Suppliers động từ API ==============
//     // Load categories
//     $.ajax({
//         type: "GET",
//         url: "http://localhost:8080/category/admin/all",
//         headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
//         success: function(response) {
//             if (response.success) {
//                 response.data.forEach(cat => {
//                     categoryInput.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
//                 });
//             } else {
//                 showToast("Lỗi", response.message, "error");
//             }
//         },
//         error: function(error) {
//             console.error("Lỗi khi tải danh mục:", error);
//             showToast("Lỗi", "Lỗi khi kết nối server danh mục", "error");
//         }
//     });

//     // Load suppliers
// //    $.ajax({
// //        type: "GET",
// //        url: "http://localhost:8080/supplier/all",
// //        headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
// //        success: function(response) {
// //            if (response.success) {
// //                response.data.forEach(sup => {
// //                    supplierInput.innerHTML += `<option value="${sup.id}">${sup.name}</option>`;
// //                });
// //            } else {
// //                showToast("Lỗi", "Không load được danh sách nhà cung cấp", "error");
// //            }
// //       },
// //       error: function(error) {
// //            console.error("Lỗi khi tải nhà cung cấp:", error);
// //            showToast("Lỗi", "Lỗi khi kết nối server nhà cung cấp", "error");
// //        }
// //    });
// =======
//     let filteredProducts = [];
//     let currentPage = 1;
//     const productsPerPage = 10;
//     let totalProducts = 0;
// >>>>>>> master

    // ============== Modal Controls ==============
    addBtn.addEventListener("click", () => {
        form.reset();
        idInput.value = "";

        document.querySelectorAll(".branch-input .stock-input").forEach(input => {
            input.value = "";
        });

        modalTitle.textContent = "Thêm sản phẩm mới";
        modal.style.display = "block";
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // ============== Hàm tính toán thống kê ==============
    function calculateStatistics(products) {
        if (!products || products.length === 0) {
            // Reset all stats
            document.getElementById("total-products").textContent = "0";
            document.getElementById("inventory-value").textContent = "$0";
            document.getElementById("highest-price").textContent = "$0";
            document.getElementById("lowest-price").textContent = "$0";
            document.getElementById("average-price").textContent = "$0";
            document.getElementById("out-of-stock").textContent = "0";
            document.getElementById("top-category").textContent = "-";
            document.getElementById("total-stock").textContent = "0";
            return;
        }

        // 1. Tổng số sản phẩm
        document.getElementById("total-products").textContent = products.length;

        // 2. Tính các giá trị liên quan đến kho hàng
        let totalValue = 0;
        let totalStock = 0;
        let outOfStockCount = 0;
        products.forEach(product => {
            const productStock = product.branchStockDTOs.reduce((sum, branch) => sum + branch.stock, 0);
            totalValue += product.price * productStock;
            totalStock += productStock;
            if (productStock === 0) outOfStockCount++;
        });
        document.getElementById("inventory-value").textContent = `$${totalValue.toFixed(2)}`;
        document.getElementById("total-stock").textContent = totalStock;
        document.getElementById("out-of-stock").textContent = outOfStockCount;

        // 3. Tính toán giá cả
        const prices = products.map(p => p.price);
        const maxPrice = Math.max(...prices).toFixed(2);
        const minPrice = Math.min(...prices).toFixed(2);
        const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);

        document.getElementById("highest-price").textContent = `$${maxPrice}`;
        document.getElementById("lowest-price").textContent = `$${minPrice}`;
        document.getElementById("average-price").textContent = `$${avgPrice}`;

        // 4. Danh mục phổ biến nhất
        const categoryCount = {};
        products.forEach(product => {
            categoryCount[product.categoryName] = (categoryCount[product.categoryName] || 0) + 1;
        });
        const topCategory = Object.entries(categoryCount).reduce((a, b) => a[1] > b[1] ? a : b, ["-", 0])[0];
        document.getElementById("top-category").textContent = topCategory;
    }

    // ============== Hàm phân trang ==============
    function renderPagination(totalItems) {
        totalProducts = totalItems;
        const totalPages = Math.ceil(totalItems / productsPerPage);
        const pageNumbers = document.getElementById("page-numbers");
        pageNumbers.innerHTML = "";

        // Hiển thị tối đa 5 trang
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 3) {
            endPage = Math.min(5, totalPages);
        } else if (currentPage >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement("button");
            pageBtn.className = `page-btn ${i === currentPage ? "active" : ""}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => changePage(i);
            pageNumbers.appendChild(pageBtn);
        }

        // Cập nhật trạng thái nút điều hướng
        document.getElementById("first-page").disabled = currentPage === 1;
        document.getElementById("prev-page").disabled = currentPage === 1;
        document.getElementById("next-page").disabled = currentPage === totalPages;
        document.getElementById("last-page").disabled = currentPage === totalPages;
    }

    // ============== Hàm chuyển trang ==============
    function changePage(page) {
        currentPage = page;
        renderTable(filteredProducts.length > 0 ? filteredProducts : products);
    }

    // ============== Hàm áp dụng bộ lọc ==============
    function applyFilters() {
        const minStock = parseInt(minStockInput.value) || 0;
        const minPrice = parseFloat(minPriceInput.value) || 0;
        const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
        const stockStatus = stockStatusFilter.value;

        filteredProducts = products.filter(product => {
            // Tính tổng số lượng tồn kho
            const totalStock = product.branchStockDTOs.reduce((sum, branch) => sum + branch.stock, 0);

            // Lọc theo số lượng tồn kho tối thiểu
            if (totalStock < minStock) return false;

            // Lọc theo khoảng giá
            if (product.price < minPrice || product.price > maxPrice) return false;

            // Lọc theo tình trạng tồn kho
            if (stockStatus) {
                if (stockStatus === "in-stock" && totalStock <= 0) return false;
                if (stockStatus === "out-of-stock" && totalStock > 0) return false;
            }

            return true;
        });

        currentPage = 1;
        renderTable(filteredProducts);
    }

    // ============== Reset filter ==============
    function resetFilters() {
        minStockInput.value = "";
        minPriceInput.value = "";
        maxPriceInput.value = "";
        stockStatusFilter.value = "";
        filteredProducts = [];
        currentPage = 1;
        renderTable(products);
    }

    // ============== Data Functions ==============
    function fetchProducts() {
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/product/admin/all",
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
            success: function(response) {
                if (response.success) {
                    products = response.data;
                    filteredProducts = [];
                    renderTable(products);
                } else {
                    showToast("Lỗi máy chủ", response.message, "error");
                }
            },
            error: function(error){
                console.error("Lỗi client: " + error);
                showToast("Lỗi", error.responseText, "error");
            }
        });
    }

    function renderTable(data) {
        tableBody.innerHTML = "";
// <<<<<<< hieu
//         if (data.length === 0) {
//             tableBody.innerHTML = '<tr><td colspan="7" class="no-data">Không có dữ liệu</td></tr>';
// =======

//         if (!data || data.length === 0) {
//             tableBody.innerHTML = '<tr><td colspan="7" class="no-data">No data found</td></tr>';
//             renderPagination(0);
//             calculateStatistics([]);
// >>>>>>> master
            return;
        }

        calculateStatistics(data);

        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = Math.min(startIndex + productsPerPage, data.length);
        const paginatedData = data.slice(startIndex, endIndex);

        paginatedData.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.categoryName}</td>
                <td>${product.supplierName}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                    <ul class="branch-stock-list">
                        ${product.branchStockDTOs.map(branch => `
                            <li class="branch-stock-item">
                                <span>${branch.branch.address}</span>
                                <span>${branch.stock}</span>
                            </li>
                        `).join("")}
                    </ul>
                </td>
                <td>
                    <button class="edit-btn" onclick="editProduct(${product.id})">Cập nhật</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Xóa</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        renderPagination(data.length);
    }

    // ============== Global Functions ==============
    window.editProduct = function(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;

        idInput.value = product.id;
        nameInput.value = product.name;
        priceInput.value = product.price.toFixed(2);

        document.querySelectorAll(".branch-input").forEach(div => {
            const branchId = parseInt(div.querySelector(".branch-id").value);
            const stockInput = div.querySelector(".stock-input");
            const branchStock = product.branchStockDTOs.find(b => b.branch.id === branchId);
            stockInput.value = branchStock ? branchStock.stock : "";
        });

        modalTitle.textContent = "Cập nhật sản phẩm";
        modal.style.display = "block";
    };

    window.deleteProduct = function(id) {
        if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            $.ajax({
                type: "DELETE",
                url: `http://localhost:8080/product/admin/delete/${id}`,
                headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
                success: function(response) {
                    if (response.success) {
                        showToast("Thành công", response.message, "success");
                        fetchProducts();
                    } else {
                        showToast("Lỗi máy chủ", response.message, "error");
                    }
                },
                error: function(error){
                    console.error("Lỗi client: " + error);
                    showToast("Lỗi", error.responseText, "error");
                }
            });
        }
    };

    // ============== Form Submit ==============
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const mapBranchStock = {};
        document.querySelectorAll(".branch-input").forEach(div => {
            const branchId = parseInt(div.querySelector(".branch-id").value);
            const stockVal = div.querySelector(".stock-input").value;
            if (stockVal !== "" && parseInt(stockVal) >= 0) {
                mapBranchStock[branchId] = parseInt(stockVal);
            }
        });

        const request = {
            name: nameInput.value.trim(),
            categoryId: parseInt(categoryInput.value),
            supplierId: parseInt(supplierInput.value),
            price: parseFloat(priceInput.value),
            mapBranchStock: mapBranchStock
        };

        if (!request.name || !request.categoryId ||
            !request.supplierId || isNaN(request.price)) {
            return showToast("Lỗi", "Vui lòng điền đầy đủ thông tin", "error");
        }

        const isEditMode = !!idInput.value;
        const url = isEditMode
            ? `http://localhost:8080/product/admin/update/${idInput.value}`
            : "http://localhost:8080/product/admin/add";

        $.ajax({
            type: isEditMode ? "PUT" : "POST",
            url: url,
            contentType: "application/json",
            data: JSON.stringify(request),
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
            success: function(response) {
                if (response.success) {
                    fetchProducts();
                    modal.style.display = "none";
                    showToast("Thành công", response.message, "success");
                } else {
                    showToast("Lỗi", response.message, "error");
                }
            },
            error: function(error){
                console.error("Lỗi client: " + error);
                showToast("Lỗi", error.responseText, "error");
            }
        });
    });

    // ============== Search Function ==============
    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            renderTable(products);
            return;
        }

        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.categoryName.toLowerCase().includes(query) ||
            p.supplierName.toLowerCase().includes(query)
        );
        filteredProducts = filtered;
        currentPage = 1;
        renderTable(filtered);
    });

    // ============== Event Listeners ==============
    applyFilterBtn.addEventListener("click", applyFilters);
    resetFilterBtn.addEventListener("click", resetFilters);

    document.getElementById("first-page").addEventListener("click", () => changePage(1));
    document.getElementById("prev-page").addEventListener("click", () => changePage(currentPage - 1));
    document.getElementById("next-page").addEventListener("click", () => changePage(currentPage + 1));
    document.getElementById("last-page").addEventListener("click", () => {
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        changePage(totalPages);
    });

    // ============== Khởi tạo ==============
    fetchProducts();
});