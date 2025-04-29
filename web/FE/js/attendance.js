document.addEventListener('DOMContentLoaded', function () {
    const checkInButton = document.getElementById('checkInButton');
    const checkOutButton = document.getElementById('checkOutButton');

    // Extract staffEmail from JWT token
    function getStaffEmailFromToken() {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast("Error", "Vui lòng đăng nhập để sử dụng chức năng này", "error");
            setTimeout(() => {
                window.location.href = "../html/login.html";
            }, 2000);
            return null;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub; // Extract the "sub" field as staffEmail
        } catch (error) {
            showToast("Error", "Lỗi khi giải mã token", "error");
            return null;
        }
    }

    const staffEmail = getStaffEmailFromToken();
    if (!staffEmail) return;

    checkInButton.addEventListener('click', function () {
        fetch(`http://localhost:8080/attend/checkin?staffEmail=${encodeURIComponent(staffEmail)}`, {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast("Success", data.message, "success");
                } else {
                    showToast("Error", data.message, "error");
                }
            })
            .catch(error => {
                showToast("Error", "Không thể kết nối đến máy chủ", "error");
            });
    });

    checkOutButton.addEventListener('click', function () {
        fetch(`http://localhost:8080/attend/checkout?staffEmail=${encodeURIComponent(staffEmail)}`, {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast("Success", data.message, "success");
                } else {
                    showToast("Error", data.message, "error");
                }
            })
            .catch(error => {
                showToast("Error", "Không thể kết nối đến máy chủ", "error");
            });
    });
});
