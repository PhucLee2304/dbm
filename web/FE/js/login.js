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

document.addEventListener('DOMContentLoaded', function() {
    localStorage.clear();

    const form = document.getElementById('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const request = {
            email: email,
            password: password
        };

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8080/auth/public/login', true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) { // done
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        localStorage.setItem('token', response.data.token);
                        showToast("Success", response.message, "success", 1000);

                        setTimeout(function() {
                            if (response.data.role === "ADMIN") {
                                window.location.href = "../html/product.html";
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

        xhr.send(JSON.stringify(request));
    });
});
