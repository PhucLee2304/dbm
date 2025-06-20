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
                    ${userActive
                        ? `<button class="block-btn" data-user-id="${staff.user && staff.user.id}">Block</button>`
                        : ''
                    }
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
        // Thêm event listener cho các nút Block
        document.querySelectorAll('.block-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const userId = this.getAttribute('data-user-id'); // <-- dùng user_id từ bảng staff
                console.log("Block userId:", userId); // debug

                if (confirm("Bạn có chắc muốn ngừng hoạt động tài khoản này không?")) {
                    blockUser(userId);
                }
            });
        });

    }

    function blockUser(id) {
    const token = localStorage.getItem("token"); // nếu bạn dùng JWT

    fetch(`http://localhost:8080/user/admin/block/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // chỉ cần nếu backend yêu cầu token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast("Thành công", "Tài khoản đã bị ngừng hoạt động", "success");
            fetchStaffList(); // làm mới danh sách
        } else {
            showToast("Lỗi", data.message || "Không thể ngừng hoạt động tài khoản", "error");
        }
    })
    .catch(error => {
        showToast("Lỗi", error.message || "Đã xảy ra lỗi khi gọi API", "error");
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

        // Mới thêm cho chấm công 
        const attendanceBtn = document.getElementById('attendanceBtn');
        attendanceBtn.setAttribute('data-id', staff.id);
        attendanceBtn.setAttribute('data-name', staff.user?.name || 'Nhân viên');

        // Cập nhật cho nút xem lương
        updateSalaryButtonWithStaffId(staff.id);


        // Gỡ bỏ event cũ (nếu có) và thêm lại
    //     attendanceBtn.replaceWith(attendanceBtn.cloneNode(true));
    // document.getElementById('attendanceBtn').addEventListener('click', function () {
    //     const staffId = this.getAttribute('data-id');
    //     const staffName = this.getAttribute('data-name') || 'Nhân viên';

    //     if (!staffId) {
    //         alert("Không có staffId được gán vào nút Xem chấm công");
    //         return;
    //     }

    //     document.getElementById('attendanceStaffName').textContent = staffName;

    //     fetch(`http://localhost:8080/admin/attendance/${staffId}`, {
    //         method: 'GET',
    //         headers: {
    //             Authorization: 'Bearer ' + localStorage.getItem('token')
    //         }
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //             // Xử lý lỗi 400 riêng
    //             return response.text().then(text => {
    //                 throw new Error(`Lỗi ${response.status}: ${text}`);
    //             });
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         if (Array.isArray(data)) {
    //             renderAttendanceTable(data);
    //             document.getElementById('attendanceModal').style.display = 'block';
    //         } else {
    //             showToast("Error", "Không có dữ liệu chấm công", "error");
    //         }
    //     })

    //     .catch(error => {
    //         console.error("Lỗi khi tải chấm công:", error);
    //         if (error.message.includes("400")) {
    //             showToast("Error", "Nhân viên chưa có dữ liệu chấm công", "error");
    //         } else {
    //             showToast("Error", "Không thể tải dữ liệu chấm công", "error");
    //         }
    //     });
    // });

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

    // Chấm công

    $(document).ready(function () {
    

    // Thay thế phần xử lý chấm công trong staff.js

// Cải thiện event listener cho nút Xem chấm công
attendanceBtn.replaceWith(attendanceBtn.cloneNode(true));
document.getElementById('attendanceBtn').addEventListener('click', function () {
    const staffId = this.getAttribute('data-id');
    const staffName = this.getAttribute('data-name') || 'Nhân viên';

    if (!staffId) {
        showToast("Error", "Không có thông tin nhân viên", "error");
        return;
    }

    // Hiển thị loading state
    document.getElementById('attendanceStaffName').textContent = `${staffName} - Đang tải...`;
    document.getElementById('attendanceModal').style.display = 'block';
    
    // Hiển thị loading trong bảng
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Đang tải dữ liệu...</td></tr>';

    fetch(`http://localhost:8080/admin/attendance/${staffId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP ${response.status}: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Attendance data received:', data); // Debug log
        
        // Cập nhật tên nhân viên
        document.getElementById('attendanceStaffName').textContent = staffName;
        
        if (Array.isArray(data) && data.length > 0) {
            renderAttendanceTable(data);
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">Nhân viên chưa có dữ liệu chấm công</td></tr>';
        }
    })
    .catch(error => {
        console.error("Lỗi khi tải chấm công:", error);
        
        // Cập nhật tên nhân viên
        document.getElementById('attendanceStaffName').textContent = staffName;
        
        if (error.message.includes("400")) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">Nhân viên chưa có dữ liệu chấm công</td></tr>';
            showToast("Info", "Nhân viên chưa có dữ liệu chấm công", "info");
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="error">Không thể tải dữ liệu chấm công</td></tr>';
            showToast("Error", "Không thể tải dữ liệu chấm công", "error");
        }
    });
});

// Cải thiện hàm renderAttendanceTable
function renderAttendanceTable(records) {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';

    if (!records || records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">Không có dữ liệu chấm công</td></tr>';
        return;
    }

    // Sắp xếp theo ngày giảm dần (mới nhất trước)
    records.sort((a, b) => new Date(b.day) - new Date(a.day));

    records.forEach((record, index) => {
        // Format ngày
        const date = formatDate(record.day);
        
        // Format giờ check-in
        const checkIn = formatTime(record.checkin);
        
        // Format giờ check-out
        const checkOut = formatTime(record.checkout);
        
        // Format số giờ làm việc
        const workHours = formatWorkHours(record.totalHours);
        
        // Format trạng thái
        const status = formatStatus(record.checkInStatus, record.checkOutStatus);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td class="checkin-time">${checkIn}</td>
            <td class="checkout-time">${checkOut}</td>
            <td class="work-hours">${workHours}</td>
            <td class="status">${status}</td>
        `;
        
        // Thêm class cho dòng chẵn/lẻ
        if (index % 2 === 0) {
            row.classList.add('even-row');
        }
        
        tbody.appendChild(row);
    });
}

// Hàm format ngày theo định dạng Việt Nam
function formatDate(dateString) {
    if (!dateString) return '—';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Hàm format thời gian
function formatTime(timeString) {
    if (!timeString || timeString === null) return '—';
    
    try {
        const date = new Date(timeString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        return timeString;
    }
}

// Hàm format số giờ làm việc
function formatWorkHours(hours) {
    if (hours === null || hours === undefined) return '0.00';
    
    const numHours = parseFloat(hours);
    if (isNaN(numHours)) return '0.00';
    
    return numHours.toFixed(2);
}

// Hàm format trạng thái với màu sắc
function formatStatus(checkInStatus, checkOutStatus) {
    const checkIn = checkInStatus || '—';
    const checkOut = checkOutStatus || '—';
    
    let statusClass = '';
    let statusText = `${checkIn} / ${checkOut}`;
    
    // Xác định class CSS dựa trên trạng thái
    if (checkIn === 'ON_TIME' && checkOut === 'ON_TIME') {
        statusClass = 'status-good';
    } else if (checkIn === 'LATE' || checkOut === 'EARLY') {
        statusClass = 'status-warning';
    } else if (checkIn === '—' || checkOut === '—') {
        statusClass = 'status-missing';
    }
    
    return `<span class="${statusClass}">${statusText}</span>`;
}

// Đóng modal chấm công - cải thiện
$(document).ready(function() {
    console.log('Setting up attendance modal events'); // Debug log
    
    // Đóng modal khi click nút Đóng - sử dụng event delegation
    $(document).off('click', '#closeAttendanceBtn').on('click', '#closeAttendanceBtn', function() {
        console.log('Close button clicked'); // Debug log
        $('#attendanceModal').hide();
    });
    
    // Đóng modal khi click dấu X - sử dụng event delegation  
    $(document).off('click', '#attendanceModal .close').on('click', '#attendanceModal .close', function() {
        console.log('X button clicked'); // Debug log
        $('#attendanceModal').hide();
    });
    
    // Đóng modal khi click bên ngoài modal
    $(document).off('click', '#attendanceModal').on('click', '#attendanceModal', function(e) {
        if (e.target === this) {
            console.log('Outside modal clicked'); // Debug log
            $(this).hide();
        }
    });
    
    // Ngăn việc đóng modal khi click vào nội dung bên trong
    $(document).off('click', '#attendanceModal .modal-content').on('click', '#attendanceModal .modal-content', function(e) {
        e.stopPropagation();
    });
    
    // Đóng modal bằng phím ESC
    $(document).off('keydown.attendance').on('keydown.attendance', function(e) {
        if (e.key === 'Escape' && $('#attendanceModal').is(':visible')) {
            console.log('ESC key pressed'); // Debug log
            $('#attendanceModal').hide();
        }
    });
});
});

// Thêm vào cuối file staff.js, thay thế phần xử lý lương hiện tại

// Cải thiện event listener cho nút xem lương
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btnViewSalary') {
        const staffId = e.target.getAttribute('data-staffid');
        const staffName = document.getElementById('attendanceStaffName').textContent;
        
        if (!staffId) {
            showToast("Error", "Không có thông tin nhân viên", "error");
            return;
        }
        
        openSalaryModal(staffId, staffName);
    }
});

// Cải thiện hàm mở modal lương
function openSalaryModal(staffId, staffName) {
    // Hiển thị modal và loading state
    document.getElementById('salaryModal').style.display = 'block';
    
    // Cập nhật tiêu đề modal
    const modalTitle = document.querySelector('#salaryModal h3');
    if (modalTitle) {
        modalTitle.textContent = `Thông tin lương - ${staffName || 'Nhân viên'}`;
    }

    const salaryTableBody = document.getElementById('salaryTableBody');
    salaryTableBody.innerHTML = '<tr><td colspan="6" class="loading">Đang tải dữ liệu lương...</td></tr>';

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Tạo mảng promises để tải dữ liệu song song
    const promises = [];
    
    for (let month = 1; month <= 12; month++) {
        const promise = fetch(`http://localhost:8080/admin/salary/calculate?staffId=${staffId}&month=${month}&year=${currentYear}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => ({
            month: month,
            data: data,
            success: true
        }))
        .catch(error => ({
            month: month,
            error: error.message,
            success: false
        }));
        
        promises.push(promise);
    }
    
    // Xử lý kết quả song song
    Promise.all(promises)
        .then(results => {
            renderSalaryTable(results, staffId, currentYear);
        })
        .catch(error => {
            console.error('Lỗi tải dữ liệu lương:', error);
            salaryTableBody.innerHTML = '<tr><td colspan="6" class="error">Không thể tải dữ liệu lương</td></tr>';
            showToast("Error", "Không thể tải dữ liệu lương", "error");
        });
}

// Hàm render bảng lương với dữ liệu đã tải
function renderSalaryTable(results, staffId, year) {
    const salaryTableBody = document.getElementById('salaryTableBody');
    salaryTableBody.innerHTML = '';
    
    // Lọc và sắp xếp kết quả thành công
    const successResults = results
        .filter(result => result.success)
        .sort((a, b) => b.month - a.month); // Sắp xếp tháng giảm dần
    
    if (successResults.length === 0) {
        salaryTableBody.innerHTML = '<tr><td colspan="6" class="no-data">Không có dữ liệu lương</td></tr>';
        return;
    }
    
    successResults.forEach((result, index) => {
        const { month, data } = result;
        
        // Xử lý dữ liệu trả về từ API
        const totalHours = parseFloat(data.totalHours || 0).toFixed(2);
        const hourlySalary = formatSalary(data.hourlySalary);
        const totalSalary = formatSalary(data.totalSalary);
        const isPaid = data.paid === true;
        
        // Xác định trạng thái và màu sắc
        const statusClass = isPaid ? 'status-paid' : 'status-unpaid';
        const statusText = isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';
        
        const tr = document.createElement('tr');
        tr.className = index % 2 === 0 ? 'even-row' : 'odd-row';
        
        tr.innerHTML = `
            <td class="month-cell">${month}/${year}</td>
            <td class="hours-cell">${totalHours}h</td>
            <td class="hourly-salary-cell">${hourlySalary} VNĐ</td>
            <td class="total-salary-cell"><strong>${totalSalary} VNĐ</strong></td>
            <td class="status-cell">
                <span class="salary-status ${statusClass}">${statusText}</span>
            </td>
            <td class="action-cell">
                ${renderActionButton(isPaid, staffId, month, year, totalSalary)}
            </td>
        `;
        
        salaryTableBody.appendChild(tr);
    });
    
    // Thêm tổng kết cuối bảng
    addSalarySummary(successResults, salaryTableBody, year);
}

// Hàm format số tiền
function formatSalary(amount) {
    if (!amount || amount === 0) return '0';
    
    // Xử lý số quá lớn (scientific notation)
    if (typeof amount === 'number' && amount > 1e10) {
        console.warn('Phát hiện lương bất thường:', amount);
        return '0'; // Hoặc có thể return 'N/A'
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';
    
    return numAmount.toLocaleString('vi-VN');
}

// Hàm render nút hành động
function renderActionButton(isPaid, staffId, month, year, totalSalary) {
    if (isPaid) {
        return `
            <button class="btn-view-invoice" 
                    data-staffid="${staffId}" 
                    data-month="${month}" 
                    data-year="${year}"
                    title="Xem chi tiết thanh toán">
                <i class="icon-view"></i> Xem hóa đơn
            </button>
        `;
    } else {
        const isDisabled = totalSalary === '0' ? 'disabled' : '';
        const disabledClass = totalSalary === '0' ? 'btn-disabled' : '';
        const title = totalSalary === '0' ? 'Không có lương để thanh toán' : 'Thanh toán lương';
        
        return `
            <button class="btn-pay-salary ${disabledClass}" 
                    data-staffid="${staffId}" 
                    data-month="${month}" 
                    data-year="${year}"
                    data-amount="${totalSalary}"
                    ${isDisabled}
                    title="${title}">
                <i class="icon-pay"></i> Thanh toán
            </button>
        `;
    }
}

// Hàm thêm tổng kết
function addSalarySummary(results, tableBody, year) {
    const totalPaidSalary = results
        .filter(r => r.data.paid)
        .reduce((sum, r) => sum + parseFloat(r.data.totalSalary || 0), 0);
    
    const totalUnpaidSalary = results
        .filter(r => !r.data.paid)
        .reduce((sum, r) => sum + parseFloat(r.data.totalSalary || 0), 0);
    
    const totalHours = results
        .reduce((sum, r) => sum + parseFloat(r.data.totalHours || 0), 0);
    
    const summaryRow = document.createElement('tr');
    summaryRow.className = 'summary-row';
    summaryRow.innerHTML = `
        <td colspan="2"><strong>Tổng kết ${year}</strong></td>
        <td><strong>${totalHours.toFixed(2)}h</strong></td>
        <td><strong>${formatSalary(totalPaidSalary + totalUnpaidSalary)} VNĐ</strong></td>
        <td>
            <div class="summary-status">
                <span class="status-paid">Đã TT: ${formatSalary(totalPaidSalary)} VNĐ</span><br>
                <span class="status-unpaid">Chưa TT: ${formatSalary(totalUnpaidSalary)} VNĐ</span>
            </div>
        </td>
        <td>—</td>
    `;
    
    tableBody.appendChild(summaryRow);
}

// Xử lý sự kiện thanh toán và xem hóa đơn
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-pay-salary') || e.target.closest('.btn-pay-salary')) {
        const button = e.target.classList.contains('btn-pay-salary') ? e.target : e.target.closest('.btn-pay-salary');
        
        if (button.disabled) return;
        
        const staffId = button.getAttribute('data-staffid');
        const month = button.getAttribute('data-month');
        const year = button.getAttribute('data-year');
        const amount = button.getAttribute('data-amount');
        
        paySalary(staffId, month, year, amount, button);
    }
    
    if (e.target.classList.contains('btn-view-invoice') || e.target.closest('.btn-view-invoice')) {
        const button = e.target.classList.contains('btn-view-invoice') ? e.target : e.target.closest('.btn-view-invoice');
        
        const staffId = button.getAttribute('data-staffid');
        const month = button.getAttribute('data-month');
        const year = button.getAttribute('data-year');
        
        viewInvoice(staffId, month, year);
    }
});

// Hàm thanh toán lương
function paySalary(staffId, month, year, amount, buttonElement) {
    // Xác nhận thanh toán
    const confirmMessage = `Bạn có chắc chắn muốn thanh toán lương tháng ${month}/${year}?\nSố tiền: ${amount} VNĐ`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Disable button và hiển thị loading
    const originalHTML = buttonElement.innerHTML;
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<i class="icon-loading"></i> Đang xử lý...';
    
    fetch(`http://localhost:8080/admin/salary/pay?staffId=${staffId}&month=${month}&year=${year}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP ${response.status}: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Payment response:', data);
        
        if (data.paid === true) {
            showToast("Success", `Thanh toán lương tháng ${month}/${year} thành công!`, "success");
            
            // Cập nhật UI ngay lập tức
            const row = buttonElement.closest('tr');
            const statusCell = row.querySelector('.status-cell');
            const actionCell = row.querySelector('.action-cell');
            
            // Cập nhật trạng thái
            statusCell.innerHTML = '<span class="salary-status status-paid">Đã thanh toán</span>';
            
            // Cập nhật nút hành động
            actionCell.innerHTML = `
                <button class="btn-view-invoice" 
                        data-staffid="${staffId}" 
                        data-month="${month}" 
                        data-year="${year}"
                        title="Xem chi tiết thanh toán">
                    <i class="icon-view"></i> Xem hóa đơn
                </button>
            `;
            
            // Cập nhật tổng kết nếu có
            updateSalarySummary();
            
        } else {
            throw new Error('Thanh toán không thành công');
        }
    })
    .catch(error => {
        console.error('Lỗi thanh toán:', error);
        showToast("Error", `Thanh toán thất bại: ${error.message}`, "error");
        
        // Restore button
        buttonElement.disabled = false;
        buttonElement.innerHTML = originalHTML;
    });
}

// Hàm xem hóa đơn
function viewInvoice(staffId, month, year) {
    const token = localStorage.getItem("token"); // nếu API cần token

    // Gọi API và tải file PDF
    fetch(`http://localhost:8080/admin/salary/invoice/pdf?staffId=${staffId}&month=${month}&year=${year}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // nếu không dùng token thì bỏ dòng này
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Không thể tải hóa đơn PDF");
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary-invoice-${staffId}-${month}-${year}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error("Lỗi khi tải hóa đơn:", error);
        alert("Đã xảy ra lỗi khi tải hóa đơn.");
    });
}


// Hàm cập nhật tổng kết
function updateSalarySummary() {
    // Tính toán lại tổng kết dựa trên trạng thái hiện tại
    const summaryRow = document.querySelector('.summary-row');
    if (summaryRow) {
        // Tính toán lại và cập nhật
        // Implementation sẽ phụ thuộc vào yêu cầu cụ thể
    }
}

// Cải thiện event đóng modal lương
document.getElementById('closeSalaryModal').addEventListener('click', function() {
    document.getElementById('salaryModal').style.display = 'none';
});

// Đóng modal khi click bên ngoài
document.getElementById('salaryModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

// Đóng modal bằng phím ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('salaryModal').style.display === 'block') {
        document.getElementById('salaryModal').style.display = 'none';
    }
});

// Cải thiện việc gán staffId cho nút xem lương trong modal chấm công
function updateSalaryButtonWithStaffId(staffId) {
    const btnViewSalary = document.getElementById('btnViewSalary');
    if (btnViewSalary) {
        btnViewSalary.setAttribute('data-staffid', staffId);
    }
}

///thống kê năng suất
document.getElementById("openProductivityBtn").addEventListener("click", () => {
    loadProductivityData();
    document.getElementById("productivityModal").style.display = "block";
});

document.getElementById("closeProductivityBtn").addEventListener("click", () => {
    document.getElementById("productivityModal").style.display = "none";
});

// Tải dữ liệu từ API
async function loadProductivityData() {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        return;
    }

    try {
        const prodRes = await fetch(`http://localhost:8080/admin/staff/productivity?month=${month}&year=${year}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const alertRes = await fetch(`http://localhost:8080/admin/staff/alerts?month=${month}&year=${year}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!prodRes.ok) {
            const errorText = await prodRes.text();
            console.error("Lỗi productivity:", errorText);
            alert("Không thể tải dữ liệu năng suất: " + prodRes.status);
            return;
        }

        if (!alertRes.ok) {
            const errorText = await alertRes.text();
            console.error("Lỗi alerts:", errorText);
            alert("Không thể tải dữ liệu cảnh báo: " + alertRes.status);
            return;
        }

        const productivityList = await prodRes.json();
        const alertList = await alertRes.json();

        const alertMap = {};
        alertList.forEach(alert => {
            alertMap[alert.staffId] = alert.messages.join(", ");
        });

        const tbody = document.querySelector("#productivityTable tbody");
        tbody.innerHTML = "";

        productivityList.forEach(staff => {
            const productivity = staff.productivity;
            let rating = "Thấp";
            if (productivity >= 7.5) rating = "Tốt";
            else if (productivity >= 5) rating = "Trung bình";

            const alertMsg = alertMap[staff.staffId] || "Không có";

            const row = `
                <tr>
                    <td>${staff.staffCode}</td>
                    <td>${staff.workingDays}</td>
                    <td>${staff.totalHours.toFixed(2)}</td>
                    <td>${staff.productivity.toFixed(2)}</td>
                    <td>${rating}</td>
                    <td>${alertMsg}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error("Lỗi bất ngờ:", err);
        alert("Đã xảy ra lỗi không xác định khi tải thống kê.");
    }
}



});
