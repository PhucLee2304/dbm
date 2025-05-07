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
    const staffTableBody = document.querySelector('#staffTable tbody');
    const searchInput = document.getElementById('searchInput');
    const branchFilter = document.getElementById('branchFilter');
    const activeFilter = document.getElementById('activeFilter');
    const searchButton = document.getElementById('searchButton');
    const resetButton = document.getElementById('resetButton');
    const viewModal = document.getElementById('viewModal');
    const editModal = document.getElementById('editModal');
    const addModal = document.getElementById('addModal');
    const addStaffBtn = document.getElementById('addStaffBtn');
    const closeButtons = document.querySelectorAll('.close');
    const editStaffBtn = document.getElementById('editStaffBtn');
    const saveStaffBtn = document.getElementById('saveStaffBtn');
    const createStaffBtn = document.getElementById('createStaffBtn');
    const cancelViewBtn = document.getElementById('cancelViewBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    
    let currentStaffData = null;
    let staffList = [];
    
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
    

    // Lấy danh sách nhân viên từ API
    async function fetchStaffList() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/user/admin/staff/all', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                staffList = data.data;
                displayStaff(staffList);
            } else {
                showToast("Error", data.message || "Không thể lấy danh sách nhân viên", "error");
                staffTableBody.innerHTML = '<tr><td colspan="8" class="no-data">Không thể lấy dữ liệu: ' + data.message + '</td></tr>';
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
            showToast("Error", "Không thể kết nối đến máy chủ", "error");
            staffTableBody.innerHTML = '<tr><td colspan="8" class="no-data">Không thể kết nối đến máy chủ</td></tr>';
        }
    }

    // Hiển thị danh sách nhân viên trong bảng
    function displayStaff(staffList) {
        staffTableBody.innerHTML = '';
        
        if (!staffList || staffList.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="8" class="no-data">Không có dữ liệu</td>';
            staffTableBody.appendChild(tr);
            return;
        }
        
        staffList.forEach(staff => {
            // Kiểm tra dữ liệu null safety
            const staffId = staff.id || 'N/A';
            const userName = staff.user && staff.user.name ? staff.user.name : 'N/A';
            const userEmail = staff.user && staff.user.email ? staff.user.email : 'N/A';
            const userPhone = staff.user && staff.user.phone ? staff.user.phone : 'N/A';
            const userActive = staff.user && staff.user.active !== undefined ? staff.user.active : false;
            const branchAddress = staff.branch && staff.branch.address ? staff.branch.address : 'N/A';
            const staffCode = staff.code || 'N/A';

            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${staffId}</td>
                <td>${userName}</td>
                <td>${userEmail}</td>
                <td>${userPhone}</td>
                <td>
                    <span class="status-badge status-${userActive ? 'active' : 'inactive'}">${userActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span>
                </td>
                <td>${branchAddress}</td>
                <td>${staffCode}</td>
                <td class="action-icons">
                    <button class="view-btn" data-id="${staffId}">Xem</button>
                </td>
            `;
            staffTableBody.appendChild(tr);
        });

        // Thêm event listener cho các nút Xem
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const staffId = this.getAttribute('data-id');
                viewStaffDetails(staffId);
            });
        });
    }

    // Xem chi tiết nhân viên
    function viewStaffDetails(staffId) {
        const staff = staffList.find(s => s.id.toString() === staffId.toString());
        if (!staff) {
            showToast("Error", "Không tìm thấy thông tin nhân viên", "error");
            return;
        }

        currentStaffData = staff;

        // Cập nhật thông tin vào modal view
        document.getElementById('viewStaffID').textContent = staff.id || 'N/A';
        document.getElementById('viewName').textContent = staff.user && staff.user.name ? staff.user.name : 'N/A';
        document.getElementById('viewEmail').textContent = staff.user && staff.user.email ? staff.user.email : 'N/A';
        document.getElementById('viewPhone').textContent = staff.user && staff.user.phone ? staff.user.phone : 'N/A';
        document.getElementById('viewAddress').textContent = staff.user && staff.user.address ? staff.user.address : 'N/A';
        
        const isActive = staff.user && staff.user.active !== undefined ? staff.user.active : false;
        document.getElementById('viewActive').textContent = isActive ? 'Đang hoạt động' : 'Ngừng hoạt động';
        document.getElementById('viewActive').className = isActive ? 'status-active' : 'status-inactive';
        
        document.getElementById('viewBranch').textContent = staff.branch && staff.branch.address ? staff.branch.address : 'N/A';
        document.getElementById('viewCode').textContent = staff.code || 'N/A';
        
        // Format expiryDate to local date format
        let expiryDate = 'N/A';
        if (staff.expiryDate) {
            const date = new Date(staff.expiryDate);
            expiryDate = date.toLocaleDateString('vi-VN');
        }
        document.getElementById('viewExpiryDate').textContent = expiryDate;
        
        // Format salary with thousand separator
        let salary = 'N/A';
        if (staff.salary !== undefined) {
            salary = staff.salary.toLocaleString('vi-VN');
        }
        document.getElementById('viewSalary').textContent = salary;

        viewModal.style.display = 'block';
    }

    // Mở modal chỉnh sửa nhân viên
    editStaffBtn.addEventListener('click', function() {
        if (!currentStaffData) {
            showToast("Error", "Không có dữ liệu nhân viên để chỉnh sửa", "error");
            return;
        }

        // Ẩn modal view và hiện modal edit
        viewModal.style.display = 'none';

        // Cập nhật thông tin vào form edit
        document.getElementById('editStaffID').value = currentStaffData.id;
        document.getElementById('editName').value = currentStaffData.user && currentStaffData.user.name ? currentStaffData.user.name : '';
        document.getElementById('editEmail').value = currentStaffData.user && currentStaffData.user.email ? currentStaffData.user.email : '';
        document.getElementById('editPhone').value = currentStaffData.user && currentStaffData.user.phone ? currentStaffData.user.phone : '';
        document.getElementById('editAddress').value = currentStaffData.user && currentStaffData.user.address ? currentStaffData.user.address : '';
        
        // Chọn branch option
        const branchId = currentStaffData.branch && currentStaffData.branch.id ? currentStaffData.branch.id : '';
        const branchSelect = document.getElementById('editBranch');
        for (let i = 0; i < branchSelect.options.length; i++) {
            if (branchSelect.options[i].value == branchId) {
                branchSelect.selectedIndex = i;
                break;
            }
        }
        
        // Format expiryDate for input date format (YYYY-MM-DD)
        let expiryDateFormatted = '';
        if (currentStaffData.expiryDate) {
            const date = new Date(currentStaffData.expiryDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            expiryDateFormatted = `${year}-${month}-${day}`;
        }
        document.getElementById('editExpiryDate').value = expiryDateFormatted;
        
        document.getElementById('editSalary').value = currentStaffData.salary || 0;

        editModal.style.display = 'block';
    });

    // Lưu thông tin nhân viên đã chỉnh sửa
    saveStaffBtn.addEventListener('click', async function() {
        if (!currentStaffData) {
            showToast("Error", "Không có dữ liệu nhân viên để cập nhật", "error");
            return;
        }

        const staffId = document.getElementById('editStaffID').value;
        const name = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const phone = document.getElementById('editPhone').value.trim();
        const address = document.getElementById('editAddress').value.trim();
        const branchId = document.getElementById('editBranch').value;
        const expiryDate = document.getElementById('editExpiryDate').value;
        const salary = document.getElementById('editSalary').value;

        // Validate input
        if (!name || !email || !phone || !address || !expiryDate || !salary) {
            showToast("Error", "Vui lòng điền đầy đủ thông tin", "error");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/user/admin/staff/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: parseInt(staffId),
                    name: name,
                    email: email,
                    phone: phone,
                    address: address,
                    branchId: parseInt(branchId),
                    expiryDate: expiryDate,
                    salary: parseFloat(salary)
                })
            });
            
            const data = await response.json();
            if (data.success) {
                showToast("Success", "Cập nhật thông tin nhân viên thành công", "success");
                editModal.style.display = 'none';
                
                // Reload staff list
                fetchStaffList();
            } else {
                showToast("Error", data.message || "Không thể cập nhật thông tin nhân viên", "error");
            }
        } catch (error) {
            console.error("Error updating staff:", error);
            showToast("Error", "Không thể kết nối đến máy chủ", "error");
        }
    });

    // Mở modal thêm nhân viên mới
    addStaffBtn.addEventListener('click', function() {
        // Hiển thị modal thêm nhân viên
        addModal.style.display = 'block';
        
        // Reset form
        document.getElementById('addName').value = '';
        document.getElementById('addEmail').value = '';
        document.getElementById('addPhone').value = '';
        document.getElementById('addAddress').value = '';
        document.getElementById('addPassword').value = '';
        document.getElementById('addBranch').value = '1'; // Default to ONLINE
        
        // Set default expiry date to one year from now
        const oneYearLater = new Date();
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        const year = oneYearLater.getFullYear();
        const month = String(oneYearLater.getMonth() + 1).padStart(2, '0');
        const day = String(oneYearLater.getDate()).padStart(2, '0');
        document.getElementById('addExpiryDate').value = `${year}-${month}-${day}`;
        
        document.getElementById('addSalary').value = '0';
    });
    
    // Tạo nhân viên mới
    createStaffBtn.addEventListener('click', async function() {
        // Validate form
        const name = document.getElementById('addName').value.trim();
        const email = document.getElementById('addEmail').value.trim();
        const phone = document.getElementById('addPhone').value.trim();
        const address = document.getElementById('addAddress').value.trim();
        const password = document.getElementById('addPassword').value.trim();
        const branchId = document.getElementById('addBranch').value;
        const expiryDate = document.getElementById('addExpiryDate').value;
        const salary = document.getElementById('addSalary').value;
        
        if (!name || !email || !phone || !address || !password || !expiryDate || !salary) {
            showToast("Error", "Vui lòng điền đầy đủ thông tin", "error");
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/auth/admin/add/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    address: address,
                    password: password,
                    branchId: parseInt(branchId),
                    expiryDate: expiryDate,
                    salary: parseFloat(salary)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast("Success", "Thêm nhân viên mới thành công", "success");
                addModal.style.display = 'none';
                // Refresh staff list
                fetchStaffList();
            } else {
                showToast("Error", data.message || "Không thể thêm nhân viên mới", "error");
            }
        } catch (error) {
            console.error("Error adding staff:", error);
            showToast("Error", "Không thể kết nối đến máy chủ", "error");
        }
    });

    // Tìm kiếm nhân viên
    function searchStaff() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedBranch = branchFilter.value;
        const selectedActive = activeFilter.value;
        
        const filteredStaff = staffList.filter(staff => {
            // Kiểm tra theo từ khóa tìm kiếm
            const searchMatches = 
                (staff.id.toString().includes(searchTerm)) ||
                (staff.user && staff.user.name && staff.user.name.toLowerCase().includes(searchTerm)) ||
                (staff.user && staff.user.email && staff.user.email.toLowerCase().includes(searchTerm)) ||
                (staff.user && staff.user.phone && staff.user.phone.includes(searchTerm)) ||
                (staff.code && staff.code.toLowerCase().includes(searchTerm)) ||
                (staff.branch && staff.branch.address && staff.branch.address.toLowerCase().includes(searchTerm));
            
            // Kiểm tra theo chi nhánh
            const branchMatches = selectedBranch === '' || 
                (staff.branch && staff.branch.address && staff.branch.address === selectedBranch);
            
            // Kiểm tra theo trạng thái active
            const activeMatches = selectedActive === '' ||
                (staff.user && staff.user.active !== undefined && staff.user.active === (selectedActive === 'true'));
            
            return searchMatches && branchMatches && activeMatches;
        });
        
        displayStaff(filteredStaff);
    }

    // Gán sự kiện cho các phần tử tìm kiếm
    searchInput.addEventListener('input', searchStaff);
    branchFilter.addEventListener('change', searchStaff);
    activeFilter.addEventListener('change', searchStaff);
    searchButton.addEventListener('click', searchStaff);
    
    // Đặt lại tất cả các bộ lọc
    resetButton.addEventListener('click', function() {
        searchInput.value = '';
        branchFilter.value = '';
        activeFilter.value = '';
        displayStaff(staffList);
    });

    // Đóng modal khi click vào nút đóng hoặc nút hủy
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewModal.style.display = 'none';
            editModal.style.display = 'none';
            addModal.style.display = 'none';
        });
    });

    cancelViewBtn.addEventListener('click', function() {
        viewModal.style.display = 'none';
    });

    cancelEditBtn.addEventListener('click', function() {
        editModal.style.display = 'none';
    });
    
    cancelAddBtn.addEventListener('click', function() {
        addModal.style.display = 'none';
    });

    // Đóng modal khi click bên ngoài modal
    window.onclick = function(event) {
        if (event.target == viewModal) {
            viewModal.style.display = 'none';
        }
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
        if (event.target == addModal) {
            addModal.style.display = 'none';
        }
    }

    // Khởi tạo
    if (checkAuthentication()) {
        fetchStaffList();
    }
});
