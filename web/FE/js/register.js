function showToast(title, message, type, duration) {
    Toastify({
        text: `${title}: ${message}`,
        duration: duration || 5000,
        close: false,
        gravity: "top",
        position: "right",
        style: {
            backgroundColor: type == "success" ? "green" : type == "error" ? "red" : "yellow",
            position: "fixed",
            zIndex: 9999,
            right: "20px", 
            top: "20px",
        }
    }).showToast();
}

document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault();

    localStorage.clear();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showToast("Lỗi", "Mật khẩu và xác nhận mật khẩu không khớp", "error");
        return;
    }

    const request = {
        name: name,
        email: email,
        phone: phone,
        address: address,
        password: password,
    };

    $.ajax({
        type: "POST",
        url: "http://localhost:8080/auth/public/add/customer",
        contentType: "application/json",
        data: JSON.stringify(request),
        success: function(response) {
            if(response.success){
                localStorage.setItem("token", response.data.token);
                showToast("Thành công", response.message, "success", 1000);
                if(response.data.role === "ADMIN"){
                    setTimeout(function() {
                        window.location.href = "../html/dashboard.html";
                    }, 1000);
                }else if(response.data.role === "STAFF"){
                    setTimeout(function() {
                        window.location.href = "../html/payment.html";
                    }, 1000);
                }else{
                    setTimeout(function() {
                        window.location.href = "../html/home.html";
                    }, 1000); 
                }
                
            } else {
                showToast("Lỗi máy chủ", response.message, "error");
            }
        },
        error: function(error){
            console.error("Lỗi client: " + error);
        },
    });
});
