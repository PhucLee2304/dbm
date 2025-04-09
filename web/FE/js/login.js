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

$(document).ready(function() {
    localStorage.clear();

    $("#form").on("submit", function(event) {
        event.preventDefault();
        
        let email = $("#email").val();
        let password = $("#password").val();

        const request = {
            email: email,
            password: password
        };

        $.ajax({
            type: "POST",
            url: "http://localhost:8080/auth/public/login",
            contentType: "application/json",
            data: JSON.stringify(request),
            credentials: "include",
            success: function(response) {
                if(response.success){
                    localStorage.setItem("token", response.data.token);
                    showToast("Success", response.message, "success", 1000);
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
                    showToast("Server error", response.message, "error");
                }
            },
            error: function(error){
                console.error("Client error: " + error);
            },
        });
    });
});