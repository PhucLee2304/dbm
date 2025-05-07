function showToast(title, message, type, duration) {
    Toastify({
        text: `${title}: ${message}`,
        duration: duration || 5000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            backgroundColor: type === "success" ? "green" : type === "error" ? "red" : "orange",
        }
    }).showToast();
}

document.addEventListener('DOMContentLoaded', function() {
    const customerTableBody = document.querySelector('#customerTable tbody');
    const searchInput = document.getElementById('searchInput');
    const activeFilter = document.getElementById('activeFilter');
    const searchButton = document.getElementById('searchButton');
    const resetButton = document.getElementById('resetButton');
    const viewModal = document.getElementById('viewModal');
    const closeButtons = document.querySelectorAll('.close');
    const blockCustomerBtn = document.getElementById('blockCustomerBtn');
    const cancelViewBtn = document.getElementById('cancelViewBtn');
    
    let currentCustomerData = null;
    let customerList = [];
    
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
    
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }
    
    function checkAuthentication() {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast("Error", "Vui lòng đăng nhập để sử dụng chức năng này", "error");
            setTimeout(() => {
                window.location.href = "../html/login.html";
            }, 2000);
            return false;
        }
    
        const payload = parseJwt(token);
        if (!payload || payload.scope !== 'ADMIN') {
            showToast("Error", "Bạn không có quyền truy cập chức năng này", "error");
            setTimeout(() => {
                window.location.href = "../html/dashboard.html";
            }, 2000);
            return false;
        }
    
        return true;
    }
    
    // Lấy danh sách khách hàng từ API
    async function fetchCustomerList() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/user/admin/customer/all', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                customerList = data.data;
                displayCustomers(customerList);
            } else {
                showToast("Error", data.message || "Không thể lấy danh sách khách hàng", "error");
                customerTableBody.innerHTML = '<tr><td colspan="7" class="no-data">Không thể lấy dữ liệu: ' + data.message + '</td></tr>';
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
            showToast("Error", "Không thể kết nối đến máy chủ", "error");
            customerTableBody.innerHTML = '<tr><td colspan="7" class="no-data">Không thể kết nối đến máy chủ</td></tr>';
        }
    }

    // Hiển thị danh sách khách hàng trong bảng
    function displayCustomers(customerList) {
        customerTableBody.innerHTML = '';
        
        if (!customerList || customerList.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="7" class="no-data">Không có dữ liệu</td>';
            customerTableBody.appendChild(tr);
            return;
        }
        
        customerList.forEach(customer => {
            // Kiểm tra dữ liệu null safety
            const customerId = customer.id || 'N/A';
            const userName = customer.user && customer.user.name ? customer.user.name : 'N/A';
            const userEmail = customer.user && customer.user.email ? customer.user.email : 'N/A';
            const userPhone = customer.user && customer.user.phone ? customer.user.phone : 'N/A';
            const userAddress = customer.user && customer.user.address ? customer.user.address : 'N/A';
            const userActive = customer.user && customer.user.active !== undefined ? customer.user.active : false;
            const userId = customer.user && customer.user.id ? customer.user.id : 'N/A';

            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${customerId}</td>
                <td>${userName}</td>
                <td>${userEmail}</td>
                <td>${userPhone}</td>
                <td>${userAddress}</td>
                <td>
                    <span class="status-badge status-${userActive ? 'active' : 'inactive'}">${userActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span>
                </td>
                <td class="action-icons">
                    <button class="view-btn" data-id="${customerId}">Xem</button>
                    ${userActive ? `<button class="block-btn" data-userid="${userId}">Block</button>` : ''}
                </td>
            `;
            customerTableBody.appendChild(tr);
        });

        // Thêm event listener cho các nút Xem và Block
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const customerId = this.getAttribute('data-id');
                viewCustomerDetails(customerId);
            });
        });
        
        document.querySelectorAll('.block-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-userid');
                blockUser(userId);
            });
        });
    }

    // Xem chi tiết khách hàng
    function viewCustomerDetails(customerId) {
        const customer = customerList.find(c => c.id.toString() === customerId.toString());
        if (!customer) {
            showToast("Error", "Không tìm thấy thông tin khách hàng", "error");
            return;
        }

        currentCustomerData = customer;

        // Cập nhật thông tin vào modal view
        document.getElementById('viewCustomerID').textContent = customer.id || 'N/A';
        document.getElementById('viewName').textContent = customer.user && customer.user.name ? customer.user.name : 'N/A';
        document.getElementById('viewEmail').textContent = customer.user && customer.user.email ? customer.user.email : 'N/A';
        document.getElementById('viewPhone').textContent = customer.user && customer.user.phone ? customer.user.phone : 'N/A';
        document.getElementById('viewAddress').textContent = customer.user && customer.user.address ? customer.user.address : 'N/A';
        
        const isActive = customer.user && customer.user.active !== undefined ? customer.user.active : false;
        document.getElementById('viewActive').textContent = isActive ? 'Đang hoạt động' : 'Ngừng hoạt động';
        document.getElementById('viewActive').className = isActive ? 'status-active' : 'status-inactive';
        
        // Chỉ hiển thị nút Block nếu khách hàng đang active
        if (isActive) {
            blockCustomerBtn.style.display = 'block';
        } else {
            blockCustomerBtn.style.display = 'none';
        }
        
        viewModal.style.display = 'block';
    }

    // Block khách hàng
    async function blockUser(userId) {
        if (!userId) {
            showToast("Error", "ID người dùng không hợp lệ", "error");
            return;
        }
        
        if (!confirm("Bạn có chắc chắn muốn khóa người dùng này?")) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/user/admin/block/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                showToast("Success", "Đã khóa người dùng thành công", "success");
                
                // Đóng modal nếu đang mở
                viewModal.style.display = 'none';
                
                // Cập nhật lại danh sách khách hàng
                fetchCustomerList();
            } else {
                showToast("Error", data.message || "Không thể khóa người dùng", "error");
            }
        } catch (error) {
            console.error("Error blocking user:", error);
            showToast("Error", "Không thể kết nối đến máy chủ", "error");
        }
    }
    
    // Event listener cho nút Block trong modal
    blockCustomerBtn.addEventListener('click', function() {
        if (!currentCustomerData || !currentCustomerData.user || !currentCustomerData.user.id) {
            showToast("Error", "Không tìm thấy thông tin người dùng", "error");
            return;
        }
        
        blockUser(currentCustomerData.user.id);
    });

    // Tìm kiếm khách hàng
    function searchCustomers() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedActive = activeFilter.value;
        
        const filteredCustomers = customerList.filter(customer => {
            // Kiểm tra theo từ khóa tìm kiếm
            const searchMatches = 
                (customer.id.toString().includes(searchTerm)) ||
                (customer.user && customer.user.name && customer.user.name.toLowerCase().includes(searchTerm)) ||
                (customer.user && customer.user.email && customer.user.email.toLowerCase().includes(searchTerm)) ||
                (customer.user && customer.user.phone && customer.user.phone.includes(searchTerm)) ||
                (customer.user && customer.user.address && customer.user.address.toLowerCase().includes(searchTerm));
            
            // Kiểm tra theo trạng thái active
            const activeMatches = selectedActive === '' ||
                (customer.user && customer.user.active !== undefined && customer.user.active === (selectedActive === 'true'));
            
            return searchMatches && activeMatches;
        });
        
        displayCustomers(filteredCustomers);
    }

    // Gán sự kiện cho các phần tử tìm kiếm
    searchInput.addEventListener('input', searchCustomers);
    activeFilter.addEventListener('change', searchCustomers);
    searchButton.addEventListener('click', searchCustomers);
    
    // Đặt lại tất cả các bộ lọc
    resetButton.addEventListener('click', function() {
        searchInput.value = '';
        activeFilter.value = '';
        displayCustomers(customerList);
    });

    // Đóng modal khi click vào nút đóng hoặc nút hủy
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewModal.style.display = 'none';
        });
    });

    cancelViewBtn.addEventListener('click', function() {
        viewModal.style.display = 'none';
    });

    // Đóng modal khi click bên ngoài modal
    window.onclick = function(event) {
        if (event.target == viewModal) {
            viewModal.style.display = 'none';
        }
    }

    // Khởi tạo
    if (checkAuthentication()) {
        fetchCustomerList();
    }
});
