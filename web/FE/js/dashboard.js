// Hàm định dạng số thành tiền tệ VNĐ
function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Gọi API và cập nhật nội dung trong phần tử #revenue
fetch('http://localhost:8080/dashboard/revenue')
    .then(response => response.json())
    .then(result => {
        if (result.success && result.data != null) {
            const formattedRevenue = formatCurrency(result.data);
            document.getElementById('revenue').textContent = formattedRevenue;
        } else {
            document.getElementById('revenue').textContent = "Không có dữ liệu";
        }
    })
    .catch(error => {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
        document.getElementById('revenue').textContent = "Lỗi kết nối";
    });

document.getElementById("export-report-btn").addEventListener("click", function () {
        fetch("http://localhost:8080/dashboard/export-pdf/revenue", {
            method: "GET",
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Lỗi khi tải báo cáo PDF");
            }
            return response.blob(); // Nhận dữ liệu dạng blob
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "bao_cao_doanh_thu.pdf"; // Tên file khi tải về
            document.body.appendChild(a);
            a.click(); // Kích hoạt tải
            document.body.removeChild(a); // Dọn dẹp
            window.URL.revokeObjectURL(url); // Giải phóng URL blob
        })
        .catch(error => {
            console.error("Lỗi khi tải file PDF:", error);
            alert("Không thể tải báo cáo. Vui lòng thử lại sau.");
        });
    });