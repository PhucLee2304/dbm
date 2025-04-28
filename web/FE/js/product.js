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

// Hàm kiểm tra xác thực và quyền ADMIN
// function checkAuthentication() {
//     const token = localStorage.getItem("token");
//     if (!token) {
//         showToast("Lỗi", "Vui lòng đăng nhập để sử dụng chức năng này", "error");
//         setTimeout(() => {
//             window.location.href = "../html/login.html";
//         }, 2000);
//         return false;
//     }

//     try {
//         // Giải mã token để kiểm tra role
//         const base64Url = token.split('.')[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
//             '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

//         const payload = JSON.parse(jsonPayload);
//         if (payload.role !== "ADMIN") {
//             showToast("Lỗi", "Bạn không có quyền truy cập", "error");
//             setTimeout(() => {
//                 window.location.href = "../html/home.html";
//             }, 2000);
//             return false;
//         }
//         return true;
//     } catch (e) {
//         console.error("Lỗi giải mã token:", e);
//         showToast("Lỗi", "Token không hợp lệ", "error");
//         setTimeout(() => {
//             window.location.href = "../html/login.html";
//         }, 2000);
//         return false;
//     }
// }

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

    let products = [];

    // ============== Load Categories và Suppliers động từ API ==============
    // Load categories
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/category/all",
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
        success: function(response) {
            if (response.success) {
                response.data.forEach(cat => {
                    categoryInput.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
                });
            } else {
                showToast("Error", "Không load được danh sách danh mục", "error");
            }
        },
        error: function(error) {
            console.error("Error loading categories:", error);
            showToast("Error", "Lỗi khi kết nối server danh mục", "error");
        }
    });

    // Load suppliers
//    $.ajax({
//        type: "GET",
//        url: "http://localhost:8080/supplier/all",
//        headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
//        success: function(response) {
//            if (response.success) {
//                response.data.forEach(sup => {
//                    supplierInput.innerHTML += `<option value="${sup.id}">${sup.name}</option>`;
//                });
//            } else {
//                showToast("Error", "Không load được danh sách nhà cung cấp", "error");
//            }
//       },
//       error: function(error) {
//            console.error("Error loading suppliers:", error);
//            showToast("Error", "Lỗi khi kết nối server nhà cung cấp", "error");
//        }
//    });

    // ============== Modal Controls ==============
    addBtn.addEventListener("click", () => {
        form.reset();
        idInput.value = "";

        document.querySelectorAll(".branch-input .stock-input").forEach(input => {
            input.value = "";
        });

        modalTitle.textContent = "Add new product";
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

     // ============== Data Functions ==============
    function fetchProducts() {
        // if (!checkAuthentication()) return;
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/product/admin/all",
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
            success: function(response) {
                if (response.success) {
                    products = response.data;
                    renderTable(products);
                } else {
                    showToast("Server error", response.message, "error");
                }
            },
            error: function(error){
                console.error("Client error: " + error);
                showToast("Error", error.responseText, "error");
            }
            // error: function(xhr) {
            //     let errorMsg = "Lỗi không xác định";
            //     if (xhr.status === 0) {
            //         errorMsg = "Không thể kết nối server. Kiểm tra kết nối mạng!";
            //     } else if (xhr.status === 401) {
            //         errorMsg = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!";
            //     } else if (xhr.status === 403) {
            //         errorMsg = "Bạn không có quyền truy cập!";
            //     }
            //     showToast("Lỗi", errorMsg, "error");
            // }
        });
    }

    function renderTable(data) {
        tableBody.innerHTML = "";
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">No data found</td></tr>';
            return;
        }

        data.forEach(product => {
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
                    <button class="edit-btn" onclick="editProduct(${product.id})">Update</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // ============== Global Functions ==============
    window.editProduct = function(id) {
        // if (!checkAuthentication()) return;

        const product = products.find(p => p.id === id);
        if (!product) return;

        idInput.value = product.id;
        nameInput.value = product.name;
        categoryInput.value = product.categoryId;
        supplierInput.value = product.supplierId;
        priceInput.value = product.price;

        document.querySelectorAll(".branch-input").forEach(div => {
            const branchId = parseInt(div.querySelector(".branch-id").value);
            const stockInput = div.querySelector(".stock-input");
            const dto = product.branchStockDTOs.find(b => b.branch.id === branchId);
            stockInput.value = dto ? dto.stock : "";
        });

        modalTitle.textContent = "Update product";
        modal.style.display = "block";
    };

    window.deleteProduct = function(id) {
        // if (!checkAuthentication()) return;

        if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            $.ajax({
                type: "DELETE",
                url: `http://localhost:8080/product/admin/delete/${id}`,
                headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
                success: function(response) {
                    if (response.success) {
                        showToast("Success", response.message, "success");
                        fetchProducts();
                    } else {
                        showToast("Server error", response.message, "error");
                    }
                },
                error: function(error){
                    console.error("Client error: " + error);
                    showToast("Error", error.responseText, "error");
                }
                // error: function(xhr) {
                //     showToast("Lỗi", `Xóa thất bại (${xhr.status})`, "error");
                // }
            });
        }
    };

    // ============== Form Submit ==============
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        // if (!checkAuthentication()) return;

        const branchStocks = [];
        document.querySelectorAll(".branch-input").forEach(div => {
            const branchId = parseInt(div.querySelector("\.branch-id").value);
            const stockVal = div.querySelector("\.stock-input").value;
            if (stockVal !== "" && parseInt(stockVal) >= 0) {
                branchStocks.push({
                    branch: { id: branchId },
                    stock: parseInt(stockVal)
                });
            }
        });

        const request = {
            name: nameInput.value.trim(),
            categoryId: parseInt(categoryInput.value),
            supplierId: parseInt(supplierInput.value),
            price: parseFloat(priceInput.value),
            branchStockDTOs: branchStocks
        };

        // Validate dữ liệu
        if (!request.name || !request.categoryName ||
            !request.supplierName || isNaN(request.price)) {
            return showToast("Error", "Please fill in all information", "error");
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
                    showToast("Success", response.message, "success");
                } else {
                    showToast("Error", response.message, "error");
                }
            },
            error: function(error){
                console.error("Client error: " + error);
                showToast("Error", error.responseText, "error");
            }
            // error: function(xhr) {
            //     showToast("Lỗi", `Thao tác thất bại (${xhr.status})`, "error");
            // }
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
        renderTable(filtered);
    });

    // Khởi tạo
    fetchProducts();
});
