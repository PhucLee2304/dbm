function showToast(title, message, type, duration) {
    Toastify({
        text: `${title}: ${message}`,
        duration: duration || 5000,
        close: false,
        gravity: "top",
        position: "right",
        style: {
            backgroundColor: type === "success" ? "green" : type === "error" ? "red" : "yellow",
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
        showToast("Error", "Password and confirm password do not match", "error");
        return;
    }

    const request = {
        name: name,
        email: email,
        phone: phone,
        address: address,
        password: password,
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8080/auth/public/add/customer', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) { // 4 = DONE
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    localStorage.setItem('token', response.data.token);
                    showToast("Success", response.message, "success", 1000);

                    setTimeout(function() {
                        if (response.data.role === "ADMIN") {
                            window.location.href = "../html/dashboard.html";
                        } else if (response.data.role === "STAFF") {
                            window.location.href = "../html/payment.html";
                        } else {
                            window.location.href = "../html/home.html";
                        }
                    }, 1000);
                } else {
                    showToast("Server error", response.message, "error");
                }
            } else {
                console.error('Client error:', xhr.statusText);
            }
        }
    };

    xhr.onerror = function() {
        console.error('Request failed.');
        showToast("Error", "Request failed", "error");
    };

    xhr.send(JSON.stringify(request));
});
