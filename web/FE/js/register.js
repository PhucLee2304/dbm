function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === "password" ? "text" : "password";
}

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    errorMessage.textContent = '';
    successMessage.textContent = '';

    if (password !== confirmPassword) {
        errorMessage.textContent = '❌ Mật khẩu không khớp. Vui lòng nhập lại.';
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = '❌ Mật khẩu phải có ít nhất 6 ký tự.';
        return;
    }

    console.log({ name, email, phone, address, password });

    successMessage.textContent = '✅ Đăng ký thành công!';
    this.reset();
});
