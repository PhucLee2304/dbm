const API_BASE = 'http://localhost:8080';

function showTab(tabId) {
    let tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

function showAddStaffForm() {
    showTab('add-car');
}

function showEditForm(staff) {
    document.getElementById('branch-update').value = staff.branchName;
    document.getElementById('name-update').value = staff.name;
    document.getElementById('email-update').value = staff.email;
    document.getElementById('phone-update').value = staff.phone;
    document.getElementById('fix-car').setAttribute('data-id', staff.id);
    showTab('fix-car');
}

function ajaxRequest(method, url, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
    if (method !== 'GET') {
        xhr.setRequestHeader('Content-Type', 'application/json');
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            callback(xhr.status, xhr.responseText);
        }
    };
    xhr.send(data ? JSON.stringify(data) : null);
}

function loadStaffList() {
    ajaxRequest('GET', `${API_BASE}/user/admin/staff/all`, null, function (status, responseText) {
        if (status === 200) {
            const data = JSON.parse(responseText);
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = '';

            if (data.data) {
                data.data.forEach(staff => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${staff.id}</td>
                        <td>${staff.branchName}</td>
                        <td>${staff.email}</td>
                        <td>${staff.name}</td>
                        <td>${staff.phone}</td>
                        <td><button onclick='showEditForm(${JSON.stringify(staff)})'>Update</button></td>
                        <td><button style="background-color:red" onclick="deleteStaff(${staff.id})">Delete</button></td>
                    `;
                    tbody.appendChild(row);
                });
            }
        } else {
            console.error('Failed to load staff list');
        }
    });
}

function addStaff() {
    const body = {
        name: document.getElementById('name-add').value,
        email: document.getElementById('email-add').value,
        phone: document.getElementById('phone-add').value,
        address: document.getElementById('address-add').value || "Chưa cập nhật",
        password: "123456",
        branchId: parseInt(document.getElementById('branch-id-add').value),
        salary: parseInt(document.getElementById('salary-add').value) || 10000000
    };

    if (!body.name || !body.email || !body.phone || !body.branchId) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;}

        ajaxRequest('POST', `${API_BASE}/auth/admin/add/staff`, body, function (status, responseText) {
            if (status === 200) {
                const data = JSON.parse(responseText);
                if (data.success) {
                    alert("Thêm staff thành công!");
                    showTab('cars');
                    loadStaffList();
                } else {
                    alert("Lỗi: " + (data.message || "Thêm thất bại"));
                }
            } else {
                console.error(responseText);
                alert("Lỗi kết nối server");
            }
        });
    }
    
    function updateStaff() {
        const id = document.getElementById('fix-car').getAttribute('data-id');
        const body = {
            id: id,
            name: document.getElementById('name-update').value,
            email: document.getElementById('email-update').value,
            phone: document.getElementById('phone-update').value,
            branchName: document.getElementById('branch-update').value
        };
    
        ajaxRequest('PUT', `${API_BASE}/user/admin/staff/update`, body, function (status, responseText) {
            if (status === 200) {
                showTab('cars');
                loadStaffList();
            } else {
                console.error('Failed to update staff:', responseText);
            }
        });
    }
    
    function deleteStaff(id) {
        if (confirm("Bạn có chắc muốn xoá nhân viên này?")) {
            ajaxRequest('DELETE', `${API_BASE}/user/admin/block/${id}`, null, function (status, responseText) {
                if (status === 200) {
                    loadStaffList();
                } else {
                    console.error('Failed to delete staff:', responseText);
                }
            });
        }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        showTab('cars');
        loadStaffList();
    });