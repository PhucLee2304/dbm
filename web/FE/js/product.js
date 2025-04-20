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
function checkAuthentication() {
    const token = localStorage.getItem("token");
    if (!token) {
        showToast("Lỗi", "Vui lòng đăng nhập để sử dụng chức năng này", "error");
        setTimeout(() => {
            window.location.href = "../html/login.html";
        }, 2000);
        return false;
    }

    try {
        // Giải mã token để kiểm tra role
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

        const payload = JSON.parse(jsonPayload);
        if (payload.role !== "ADMIN") {
            showToast("Lỗi", "Bạn không có quyền truy cập", "error");
            setTimeout(() => {
                window.location.href = "../html/home.html";
            }, 2000);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Lỗi giải mã token:", e);
        showToast("Lỗi", "Token không hợp lệ", "error");
        setTimeout(() => {
            window.location.href = "../html/login.html";
        }, 2000);
        return false;
    }
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
    const addBranchBtn = document.getElementById("add-branch");

    let products = [];

    // ============== Modal Controls ==============
    addBtn.addEventListener("click", () => {
        if (!checkAuthentication()) return;
        form.reset();
        idInput.value = "";
        // Xóa tất cả các branch input trừ tiêu đề
        while (branchStocksContainer.children.length > 1) {
            branchStocksContainer.removeChild(branchStocksContainer.lastChild);
        }
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

    // ============== Branch Stock Handling ==============
    addBranchBtn.addEventListener("click", () => {
        const newInput = document.createElement("div");
        newInput.className = "branch-input";
        newInput.innerHTML = `
            <select class="branch-select">
                <option value="1">ONLINE</option>
                <option value="2">HaNoi</option>
                <option value="3">HCM</option>
            </select>
            <input type="number" class="stock-input" min="0" placeholder="Số lượng">
            <button type="button" class="remove-branch">×</button>
        `;
        branchStocksContainer.appendChild(newInput);
    });

    branchStocksContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-branch")) {
            e.target.parentElement.remove();
        }
    });

    // ============== Data Functions ==============
    function fetchProducts() {
        if (!checkAuthentication()) return;

        $.ajax({
            type: "GET",
            url: "http://localhost:8080/product/admin/all",
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
            success: function(response) {
                if (response.status) {
                    products = response.data;
                    renderTable(products);
                } else {
                    showToast("Lỗi", "Không thể tải sản phẩm: " + response.message, "error");
                }
            },
            error: function(xhr) {
                let errorMsg = "Lỗi không xác định";
                if (xhr.status === 0) {
                    errorMsg = "Không thể kết nối server. Kiểm tra kết nối mạng!";
                } else if (xhr.status === 401) {
                    errorMsg = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!";
                } else if (xhr.status === 403) {
                    errorMsg = "Bạn không có quyền truy cập!";
                }
                showToast("Lỗi", errorMsg, "error");
            }
        });
    }

    function renderTable(data) {
        tableBody.innerHTML = "";
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">Không có dữ liệu</td></tr>';
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
                    <button class="edit-btn" onclick="editProduct(${product.id})">Sửa</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Xóa</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // ============== Global Functions ==============
    window.editProduct = function(id) {
        if (!checkAuthentication()) return;

        const product = products.find(p => p.id === id);
        if (!product) return;

        while (branchStocksContainer.children.length > 1) {
            branchStocksContainer.removeChild(branchStocksContainer.lastChild);
        }

        idInput.value = product.id;
        nameInput.value = product.name;
        categoryInput.value = product.categoryName;
        supplierInput.value = product.supplierName;
        priceInput.value = product.price;

        // Thêm branch inputs
        product.branchStockDTOs.forEach(branch => {
            const newInput = document.createElement("div");
            newInput.className = "branch-input";
            newInput.innerHTML = `
                <select class="branch-select">
                    <option value="1" ${branch.branch.id === 1 ? "selected" : ""}>ONLINE</option>
                    <option value="2" ${branch.branch.id === 2 ? "selected" : ""}>HaNoi</option>
                    <option value="3" ${branch.branch.id === 3 ? "selected" : ""}>HCM</option>
                </select>
                <input type="number" class="stock-input" value="${branch.stock}" min="0">
                <button type="button" class="remove-branch">×</button>
            `;
            branchStocksContainer.appendChild(newInput);
        });

        modalTitle.textContent = "Chỉnh sửa sản phẩm";
        modal.style.display = "block";
    };

    window.deleteProduct = function(id) {
        if (!checkAuthentication()) return;

        if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            $.ajax({
                type: "DELETE",
                url: `http://localhost:8080/product/admin/delete/${id}`,
                headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
                success: function(response) {
                    if (response.status === "SUCCESS") {
                        fetchProducts();
                        showToast("Thành công", "Đã xóa sản phẩm", "success");
                    } else {
                        showToast("Lỗi", response.message, "error");
                    }
                },
                error: function(xhr) {
                    showToast("Lỗi", `Xóa thất bại (${xhr.status})`, "error");
                }
            });
        }
    };

    // ============== Form Submit ==============
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!checkAuthentication()) return;

        const branchStocks = [];
        document.querySelectorAll(".branch-input").forEach(input => {
            const branchId = input.querySelector(".branch-select").value;
            const stock = input.querySelector(".stock-input").value;
            if (stock && stock >= 0) {
                branchStocks.push({
                    branch: { id: parseInt(branchId) },
                    stock: parseInt(stock)
                });
            }
        });

        const productData = {
            name: nameInput.value.trim(),
            categoryName: categoryInput.value.trim(),
            supplierName: supplierInput.value.trim(),
            price: parseFloat(priceInput.value),
            branchStockDTOs: branchStocks
        };

        // Validate dữ liệu
        if (!productData.name || !productData.categoryName ||
            !productData.supplierName || isNaN(productData.price)) {
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
            data: JSON.stringify(productData),
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
            success: function(response) {
                if (response.status === "SUCCESS") {
                    fetchProducts();
                    modal.style.display = "none";
                    showToast("Thành công", isEditMode ? "Cập nhật thành công" : "Thêm sản phẩm thành công", "success");
                } else {
                    showToast("Lỗi", response.message, "error");
                }
            },
            error: function(xhr) {
                showToast("Lỗi", `Thao tác thất bại (${xhr.status})`, "error");
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
        renderTable(filtered);
    });

    // Khởi tạo
    fetchProducts();
});