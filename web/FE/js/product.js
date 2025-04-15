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

// {
//     "status": 200,
//     "success": true,
//     "message": "Fetch all products successfully",
//     "data": [
//         {
//             "id": 2,
//             "categoryName": "Category 1",
//             "supplierName": "Staff1",
//             "name": "Product 1",
//             "price": 100.0,
//             "branchStockDTOs": [
//                 {
//                     "branch": {
//                         "id": 1,
//                         "address": "ONLINE"
//                     },
//                     "stock": 50
//                 },
//                 {
//                     "branch": {
//                         "id": 2,
//                         "address": "VINHPHUC"
//                     },
//                     "stock": 0
//                 }
//             ]
//         },
//         {
//             "id": 3,
//             "categoryName": "Category 1",
//             "supplierName": "Staff2",
//             "name": "Product 2",
//             "price": 200.0,
//             "branchStockDTOs": [
//                 {
//                     "branch": {
//                         "id": 1,
//                         "address": "ONLINE"
//                     },
//                     "stock": 30
//                 },
//                 {
//                     "branch": {
//                         "id": 2,
//                         "address": "VINHPHUC"
//                     },
//                     "stock": 10
//                 }
//             ]
//         },
//         {
//             "id": 4,
//             "categoryName": "Category 1",
//             "supplierName": "Staff2",
//             "name": "Product Example",
//             "price": 150.0,
//             "branchStockDTOs": [
//                 {
//                     "branch": {
//                         "id": 1,
//                         "address": "ONLINE"
//                     },
//                     "stock": 1000
//                 },
//                 {
//                     "branch": {
//                         "id": 2,
//                         "address": "VINHPHUC"
//                     },
//                     "stock": 3000
//                 },
//                 {
//                     "branch": {
//                         "id": 3,
//                         "address": "PHUTHO"
//                     },
//                     "stock": 2000
//                 }
//             ]
//         }
//     ]
// }


document.addEventListener("DOMContentLoaded", () => {

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
    const sizeInput = document.getElementById("product-size");
    const priceInput = document.getElementById("product-price");
    const branch1Input = document.getElementById("product-branch1");
    const branch2Input = document.getElementById("product-branch2");


    let products = [];

    // Hàm fetchProducts: Lấy danh sách sản phẩm từ API
    function fetchProducts() {
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/product/admin/all",
            headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
            success: function(response) {
                if (response.status) {
                    products = response.data;
                    renderTable(products);
                } else {
                    console.error("Lỗi khi lấy danh sách sản phẩm:", response.message);
                    showToast("Không thể lấy danh sách sản phẩm. Vui lòng thử lại!","error");
                }
            },
            error: function(error) {
                console.error("Lỗi API:", error);
                showToast("Có lỗi xảy ra khi kết nối đến server!","error");
            }
        });
    }

    // Hàm renderTable: Hiển thị danh sách sản phẩm lên bảng
    function renderTable(data) {
        tableBody.innerHTML = "";
        data.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.branch1 || 0}</td>
                <td>${product.branch2 || 0}</td>
                <td>
                    <button class="edit-btn" onclick="editProduct(${product.id})">Sửa</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Xóa</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Hàm editProduct: Mở modal để chỉnh sửa sản phẩm
    window.editProduct = function(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;

        idInput.value = product.id;
        nameInput.value = product.name;
        sizeInput.value = product.size;
        priceInput.value = product.price;
        branch1Input.value = product.branch1 || 0;
        branch2Input.value = product.branch2 || 0;

        modalTitle.textContent = "Chỉnh sửa sản phẩm";
        modal.style.display = "block";
    };

    // Hàm deleteProduct: Xóa sản phẩm
    window.deleteProduct = function(id) {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            $.ajax({
                type: "DELETE",
                url: "http://localhost:8080/product/admin/delete/${id}",
                success: function(response) {
                    if (response.status === "SUCCESS") {
                        fetchProducts(); // Load lại danh sách sau khi xóa
                        showToast("Xóa sản phẩm thành công!","success");
                    } else {
                        showToast("Xóa sản phẩm thất bại: " + response.message,"error");
                    }
                },
                error: function(error) {
                    console.error("Lỗi khi xóa sản phẩm:", error);
                    showToast("Có lỗi xảy ra khi xóa sản phẩm!","error");
                }
            });
        }
    };

    // Sự kiện click nút thêm sản phẩm
    addBtn.addEventListener("click", () => {
        form.reset();
        idInput.value = "";
        modalTitle.textContent = "Thêm sản phẩm mới";
        modal.style.display = "block";
    });

    // Đóng modal khi click nút đóng
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Đóng modal khi click bên ngoài
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Xử lý khi submit form (thêm/chỉnh sửa sản phẩm)
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const productData = {
            name: nameInput.value,
            size: sizeInput.value,
            price: priceInput.value,
            branch1: parseInt(branch1Input.value) || 0,
            branch2: parseInt(branch2Input.value) || 0
        };

        const productId = idInput.value;
        const isEditMode = !!productId;

        // Nếu là chế độ chỉnh sửa (có ID)
        if (isEditMode) {
            $.ajax({
                type: "PUT",
                url: "http://localhost:8080/product/admin/update/${productId}",
                contentType: "application/json",
                data: JSON.stringify(productData),
                success: function(response) {
                    if (response.status === "SUCCESS") {
                        fetchProducts(); // Load lại danh sách
                        modal.style.display = "none";
                        showToast("Cập nhật sản phẩm thành công!","success");
                    } else {
                        alert("Cập nhật thất bại: " + response.message,"error");
                    }
                },
                error: function(error) {
                    console.error("Lỗi khi cập nhật:", error);
                    showToast("Có lỗi xảy ra khi cập nhật sản phẩm!","error");
                }
            });
        }
        // Nếu là thêm mới
        else {
            $.ajax({
                type: "POST",
                url: "http://localhost:8080/product/admin/add",
                contentType: "application/json",
                data: JSON.stringify(productData),
                success: function(response) {
                    if (response.status === "SUCCESS") {
                        fetchProducts(); // Load lại danh sách
                        modal.style.display = "none";
                        showToast("Thêm sản phẩm thành công!","success");
                    } else {
                        showToast("Thêm sản phẩm thất bại: " + response.message,"error");
                    }
                },
                error: function(error) {
                    console.error("Lỗi khi thêm sản phẩm:", error);
                    showToast("Có lỗi xảy ra khi thêm sản phẩm!","error");
                }
            });
        }
    });

    // Tìm kiếm sản phẩm
    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            renderTable(products);
            return;
        }

        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.size.toLowerCase().includes(query) ||
            p.price.toLowerCase().includes(query)
        );
        renderTable(filtered);
    });

    // Load danh sách sản phẩm khi trang được tải
    fetchProducts();
});