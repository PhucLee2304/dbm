// Hàm định dạng số thành tiền tệ VNĐ
function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Hàm hiển thị toast message
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

// Biến lưu trữ các chart instances
let charts = {};

// Cấu hình font chung cho tất cả biểu đồ
Chart.defaults.font.family = "'Segoe UI', 'Roboto', 'Arial', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.font.weight = '500';
Chart.defaults.color = '#2c3e50';

// Cấu hình pixel ratio để text rõ nét hơn
Chart.defaults.devicePixelRatio = window.devicePixelRatio || 2;

// Common chart options cho font rõ nét
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            labels: {
                font: {
                    size: 13,
                    weight: '600',
                    family: "'Segoe UI', 'Roboto', 'Arial', sans-serif"
                },
                color: '#2c3e50',
                usePointStyle: true,
                padding: 15
            }
        },
        title: {
            font: {
                size: 16,
                weight: 'bold',
                family: "'Segoe UI', 'Roboto', 'Arial', sans-serif"
            },
            color: '#2c3e50'
        },
        tooltip: {
            titleFont: {
                size: 13,
                weight: '600',
                family: "'Segoe UI', 'Roboto', 'Arial', sans-serif"
            },
            bodyFont: {
                size: 12,
                weight: '500',
                family: "'Segoe UI', 'Roboto', 'Arial', sans-serif"
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1
        }
    },
    scales: {
        x: {
            title: {
                font: {
                    size: 13,
                    weight: '600',
                    family: "'Segoe UI', 'Roboto', 'Arial', sans-serif"
                },
                color: '#2c3e50'
            },
            ticks: {
                font: {
                    size: 11,
                    weight: '500',
                    family: "'Segoe UI', 'Roboto', 'Arial', sans-serif"
                },
                color: '#2c3e50'
            }
        },
        y: {
            title: {
                font: {
                    size: 13,
                    weight: '600',
                    family: "'Segoe UI', 'Roboto', 'Arial', sans-serif"
                },
                color: '#2c3e50'
            },
            ticks: {
                font: {
                    size: 11,
                    weight: '500',
                    family: "'Segoe UI', 'Roboto', 'Arial', sans-serif"
                },
                color: '#2c3e50'
            }
        }
    }
};

// ==================== DATA FETCHING FUNCTIONS ====================

// Fetch và hiển thị doanh thu
function fetchRevenue() {
    fetch('http://localhost:8080/dashboard/revenue', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderRevenue(data);
    })
    .catch(error => {
        console.error('Error fetching revenue:', error);
        showToast("Lỗi", "Không thể tải dữ liệu doanh thu", "error", 3000);
    });
}

// Fetch và hiển thị tổng users
function fetchTotalUsers() {
    fetch('http://localhost:8080/dashboard/total-users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderTotalUsers(data);
    })
    .catch(error => {
        console.error('Error fetching total users:', error);
        showToast("Lỗi", "Không thể tải dữ liệu tổng người dùng", "error", 3000);
    });
}

// Fetch và hiển thị tổng customers
function fetchTotalCustomers() {
    fetch('http://localhost:8080/dashboard/total-customers', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderTotalCustomers(data);
    })
    .catch(error => {
        console.error('Error fetching total customers:', error);
        showToast("Lỗi", "Không thể tải dữ liệu tổng khách hàng", "error", 3000);
    });
}

// Fetch và hiển thị tổng staffs
function fetchTotalStaffs() {
    fetch('http://localhost:8080/dashboard/total-staffs', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderTotalStaffs(data);
    })
    .catch(error => {
        console.error('Error fetching total staffs:', error);
        showToast("Lỗi", "Không thể tải dữ liệu tổng nhân viên", "error", 3000);
    });
}

// Fetch và hiển thị tổng orders
function fetchTotalOrders() {
    fetch('http://localhost:8080/dashboard/total-orders', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderTotalOrders(data);
    })
    .catch(error => {
        console.error('Error fetching total orders:', error);
        showToast("Lỗi", "Không thể tải dữ liệu tổng đơn hàng", "error", 3000);
    });
}

// Fetch và hiển thị tổng online orders
function fetchTotalOnlineOrders() {
    fetch('http://localhost:8080/dashboard/total-online-orders', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderTotalOnlineOrders(data);
    })
    .catch(error => {
        console.error('Error fetching total online orders:', error);
        showToast("Lỗi", "Không thể tải dữ liệu tổng đơn hàng online", "error", 3000);
    });
}

// Fetch và hiển thị tổng offline orders
function fetchTotalOfflineOrders() {
    fetch('http://localhost:8080/dashboard/total-offline-orders', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderTotalOfflineOrders(data);
    })
    .catch(error => {
        console.error('Error fetching total offline orders:', error);
        showToast("Lỗi", "Không thể tải dữ liệu tổng đơn hàng offline", "error", 3000);
    });
}

// Fetch và hiển thị tổng products
function fetchTotalProducts() {
    fetch('http://localhost:8080/dashboard/total-products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderTotalProducts(data);
    })
    .catch(error => {
        console.error('Error fetching total products:', error);
        showToast("Lỗi", "Không thể tải dữ liệu tổng sản phẩm", "error", 3000);
    });
}

// Fetch và vẽ top products chart
function fetchTopProducts() {
    fetch('http://localhost:8080/dashboard/top-product', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderTopProductsChart(data);
    })
    .catch(error => {
        console.error('Error fetching top products:', error);
        showToast("Lỗi", "Không thể tải dữ liệu sản phẩm bán chạy", "error", 3000);
    });
}

// Fetch và vẽ top staff chart
function fetchTopStaff() {
    fetch('http://localhost:8080/dashboard/top-staff', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderTopStaffChart(data);
    })
    .catch(error => {
        console.error('Error fetching top staff:', error);
        showToast("Lỗi", "Không thể tải dữ liệu nhân viên xuất sắc", "error", 3000);
    });
}

// Fetch và vẽ top customers chart
function fetchTopCustomers() {
    fetch('http://localhost:8080/dashboard/top-customer', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderTopCustomersChart(data);
    })
    .catch(error => {
        console.error('Error fetching top customers:', error);
        showToast("Lỗi", "Không thể tải dữ liệu khách hàng VIP", "error", 3000);
    });
}

// Fetch và vẽ daily revenue chart
function fetchDailyRevenue() {
    fetch('http://localhost:8080/dashboard/daily-revenue-last-month', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        renderDailyRevenueChart(data);
    })
    .catch(error => {
        console.error('Error fetching daily revenue:', error);
        showToast("Lỗi", "Không thể tải dữ liệu doanh thu hàng ngày", "error", 3000);
    });
}

// ==================== RENDERING FUNCTIONS ====================
function connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        stompClient.subscribe('/topic/dashboard/revenue', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderRevenue(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho doanh thu');
            }
        });

        stompClient.subscribe('/topic/dashboard/total-users', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderTotalUsers(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho tổng người dùng');
            }
        });

        stompClient.subscribe('/topic/dashboard/total-customers', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderTotalCustomers(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho tổng khách hàng');
            }
        });

        stompClient.subscribe('/topic/dashboard/total-staffs', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderTotalStaffs(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho tổng nhân viên');
            }
        });

        stompClient.subscribe('/topic/dashboard/total-orders', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderTotalOrders(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho tổng đơn hàng');
            }
        });

        stompClient.subscribe('/topic/dashboard/total-online-orders', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderTotalOnlineOrders(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho tổng đơn hàng online');
            }
        });

        stompClient.subscribe('/topic/dashboard/total-offline-orders', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderTotalOfflineOrders(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho tổng đơn hàng offline');
            }
        });

        stompClient.subscribe('/topic/dashboard/total-products', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderTotalProducts(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho tổng sản phẩm');
            }
        });

        stompClient.subscribe('/topic/dashboard/top-product', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderTopProductsChart(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho sản phẩm bán chạy');
            }
        });

        stompClient.subscribe('/topic/dashboard/top-staff', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderTopStaffChart(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho nhân viên xuất sắc');
            }
        });

        stompClient.subscribe('/topic/dashboard/top-customer', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderTopCustomersChart(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho khách hàng VIP');
            }
        });

        stompClient.subscribe('/topic/dashboard/daily-revenue-last-month', function(message) {
            const response = JSON.parse(message.body);
            if (response && response.success) {
                renderDailyRevenueChart(response);
            } else {
                console.error('Dữ liệu không hợp lệ cho doanh thu hàng ngày');
            }
        });
    });
}

// ==================== RENDERING FUNCTIONS ====================

// Render doanh thu
function renderRevenue(data) {
    if (data && data.success && data.data != null) {
        const formattedRevenue = formatCurrency(data.data);
        document.getElementById('revenue').textContent = formattedRevenue;
    } else {
        document.getElementById('revenue').textContent = "Không có dữ liệu";
    }
}

// Render tổng users
function renderTotalUsers(data) {
    if (data && data.success && data.data != null) {
        document.getElementById('total-users').textContent = data.data.toLocaleString();
    } else {
        document.getElementById('total-users').textContent = "N/A";
    }
}

// Render tổng customers
function renderTotalCustomers(data) {
    if (data && data.success && data.data != null) {
        document.getElementById('total-customers').textContent = data.data.toLocaleString();
    } else {
        document.getElementById('total-customers').textContent = "N/A";
    }
}

// Render tổng staffs
function renderTotalStaffs(data) {
    if (data && data.success && data.data != null) {
        document.getElementById('total-staffs').textContent = data.data.toLocaleString();
    } else {
        document.getElementById('total-staffs').textContent = "N/A";
    }
}

// Render tổng orders
function renderTotalOrders(data) {
    if (data && data.success && data.data != null) {
        document.getElementById('total-orders').textContent = data.data.toLocaleString();
    } else {
        document.getElementById('total-orders').textContent = "N/A";
    }
}

// Render tổng online orders
function renderTotalOnlineOrders(data) {
    if (data && data.success && data.data != null) {
        document.getElementById('total-online-orders').textContent = data.data.toLocaleString();
    } else {
        document.getElementById('total-online-orders').textContent = "N/A";
    }
}

// Render tổng offline orders
function renderTotalOfflineOrders(data) {
    if (data && data.success && data.data != null) {
        document.getElementById('total-offline-orders').textContent = data.data.toLocaleString();
    } else {
        document.getElementById('total-offline-orders').textContent = "N/A";
    }
}

// Render tổng products
function renderTotalProducts(data) {
    if (data && data.success && data.data != null) {
        document.getElementById('total-products').textContent = data.data.toLocaleString();
    } else {
        document.getElementById('total-products').textContent = "N/A";
    }
}

// Vẽ Top Products Chart
function renderTopProductsChart(data) {
    console.log('Rendering top products chart...');
    
    if (data && data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const ctx = document.getElementById('topProductsChart');
        if (!ctx) {
            console.error('Canvas element topProductsChart not found');
            return;
        }
        
        // Destroy existing chart if it exists
        if (charts.topProducts) {
            charts.topProducts.destroy();
        }
        
        try {
            charts.topProducts = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.data.map(item => item.name || 'Unknown'),
                    datasets: [{
                        label: 'Số lượng bán',
                        data: data.data.map(item => item.totalQuantitySold || 0),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        // Lưu trữ data gốc để sử dụng trong tooltip
                        originalData: data.data
                    }]
                },
                options: {
                    ...commonChartOptions,
                    plugins: {
                        ...commonChartOptions.plugins,
                        tooltip: {
                            ...commonChartOptions.plugins.tooltip,
                            callbacks: {
                                title: function(context) {
                                    return context[0].label;
                                },
                                label: function(context) {
                                    // Lấy data gốc từ dataset
                                    const originalData = context.dataset.originalData;
                                    const dataIndex = context.dataIndex;
                                    const productData = originalData[dataIndex];
                                    
                                    return [
                                        'Số lượng bán: ' + (productData.totalQuantitySold || 0).toLocaleString() + ' sản phẩm',
                                        'Doanh thu: ' + formatCurrency(productData.totalRevenue || 0)
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        ...commonChartOptions.scales,
                        x: {
                            ...commonChartOptions.scales.x,
                            display: true,
                            title: {
                                ...commonChartOptions.scales.x.title,
                                display: true,
                                text: 'Sản phẩm'
                            }
                        },
                        y: {
                            ...commonChartOptions.scales.y,
                            display: true,
                            title: {
                                ...commonChartOptions.scales.y.title,
                                display: true,
                                text: 'Số lượng bán'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });
            console.log('Top products chart rendered successfully');
        } catch (error) {
            console.error('Error creating top products chart:', error);
        }
    } else {
        console.log('No data available for top products chart');
    }
}

// Vẽ Top Staff Chart
function renderTopStaffChart(data) {
    console.log('Rendering top staff chart...');
    
    if (data && data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const ctx = document.getElementById('topStaffChart');
        if (!ctx) {
            console.error('Canvas element topStaffChart not found');
            return;
        }
        
        if (charts.topStaff) {
            charts.topStaff.destroy();
        }
        
        try {
            charts.topStaff = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.data.map(item => item.staffName || 'Unknown'),
                    datasets: [{
                        label: 'Doanh thu (VNĐ)',
                        data: data.data.map(item => item.totalRevenue || 0),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        // Lưu trữ data gốc để sử dụng trong tooltip
                        originalData: data.data
                    }]
                },
                options: {
                    ...commonChartOptions,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        ...commonChartOptions.plugins,
                        legend: {
                            ...commonChartOptions.plugins.legend,
                            position: 'top'
                        },
                        tooltip: {
                            ...commonChartOptions.plugins.tooltip,
                            callbacks: {
                                title: function(context) {
                                    return context[0].label;
                                },
                                label: function(context) {
                                    // Lấy data gốc từ dataset
                                    const originalData = context.dataset.originalData;
                                    const dataIndex = context.dataIndex;
                                    const staffData = originalData[dataIndex];
                                    
                                    return [
                                        'Doanh thu: ' + formatCurrency(staffData.totalRevenue || 0),
                                        'Số lượng bán: ' + (staffData.totalQuantitySold || 0).toLocaleString() + ' sản phẩm'
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ...commonChartOptions.scales.x,
                            display: true,
                            title: {
                                ...commonChartOptions.scales.x.title,
                                display: true,
                                text: 'Nhân viên'
                            }
                        },
                        y: {
                            ...commonChartOptions.scales.y,
                            display: true,
                            title: {
                                ...commonChartOptions.scales.y.title,
                                display: true,
                                text: 'Doanh thu (VNĐ)'
                            },
                            beginAtZero: true,
                            ticks: {
                                ...commonChartOptions.scales.y.ticks,
                                callback: function(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    }
                }
            });
            console.log('Top staff chart rendered successfully');
        } catch (error) {
            console.error('Error creating top staff chart:', error);
        }
    } else {
        console.log('No data available for top staff chart');
    }
}

// Vẽ Top Customers Chart
function renderTopCustomersChart(data) {
    console.log('Rendering top customers chart...');
    
    if (data && data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const ctx = document.getElementById('topCustomersChart');
        if (!ctx) {
            console.error('Canvas element topCustomersChart not found');
            return;
        }
        
        if (charts.topCustomers) {
            charts.topCustomers.destroy();
        }
        
        try {
            charts.topCustomers = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.data.map(item => item.name || 'Unknown'),
                    datasets: [{
                        label: 'Tổng chi tiêu (VNĐ)',
                        data: data.data.map(item => item.totalSpent || 0),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    ...commonChartOptions,
                    scales: {
                        ...commonChartOptions.scales,
                        x: {
                            ...commonChartOptions.scales.x,
                            display: true,
                            title: {
                                ...commonChartOptions.scales.x.title,
                                display: true,
                                text: 'Khách hàng'
                            }
                        },
                        y: {
                            ...commonChartOptions.scales.y,
                            display: true,
                            title: {
                                ...commonChartOptions.scales.y.title,
                                display: true,
                                text: 'Tổng chi tiêu (VNĐ)'
                            },
                            beginAtZero: true,
                            ticks: {
                                ...commonChartOptions.scales.y.ticks,
                                callback: function(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    }
                }
            });
            console.log('Top customers chart rendered successfully');
        } catch (error) {
            console.error('Error creating top customers chart:', error);
        }
    } else {
        console.log('No data available for top customers chart');
    }
}

// Vẽ Daily Revenue Chart
function renderDailyRevenueChart(data) {
    console.log('Rendering daily revenue chart...');
    
    if (data && data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const ctx = document.getElementById('dailyRevenueChart');
        if (!ctx) {
            console.error('Canvas element dailyRevenueChart not found');
            return;
        }
        
        if (charts.dailyRevenue) {
            charts.dailyRevenue.destroy();
        }
        
        try {
            // Sort data by date
            const sortedData = data.data.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
            
            charts.dailyRevenue = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedData.map(item => {
                        const date = new Date(item.orderDate);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                    }),
                    datasets: [{
                        label: 'Doanh thu (VNĐ)',
                        data: sortedData.map(item => item.dailyRevenue || 0),
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        // Lưu trữ data gốc để sử dụng trong tooltip
                        originalData: sortedData
                    }]
                },
                options: {
                    ...commonChartOptions,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        ...commonChartOptions.plugins,
                        tooltip: {
                            ...commonChartOptions.plugins.tooltip,
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                title: function(context) {
                                    return 'Ngày ' + context[0].label;
                                },
                                label: function(context) {
                                    // Lấy data gốc từ dataset
                                    const originalData = context.dataset.originalData;
                                    const dataIndex = context.dataIndex;
                                    const dayData = originalData[dataIndex];
                                    
                                    return [
                                        'Doanh thu: ' + formatCurrency(dayData.dailyRevenue || 0),
                                        'Số đơn hàng: ' + (dayData.totalOrders || 0) + ' đơn'
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ...commonChartOptions.scales.x,
                            display: true,
                            title: {
                                ...commonChartOptions.scales.x.title,
                                display: true,
                                text: 'Ngày'
                            }
                        },
                        y: {
                            ...commonChartOptions.scales.y,
                            display: true,
                            title: {
                                ...commonChartOptions.scales.y.title,
                                display: true,
                                text: 'Doanh thu (VNĐ)'
                            },
                            beginAtZero: true,
                            ticks: {
                                ...commonChartOptions.scales.y.ticks,
                                callback: function(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    }
                }
            });
            console.log('Daily revenue chart rendered successfully');
        } catch (error) {
            console.error('Error creating daily revenue chart:', error);
        }
    } else {
        console.log('No data available for daily revenue chart');
    }
}

// ==================== LOGOUT FUNCTION ====================

// Khởi tạo logout button
function initializeLogoutButton() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            // Hiển thị confirmation dialog
            if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
                logout();
            }
        });
    }
}

// Hàm đăng xuất
function logout() {
    try {
        // Xóa token khỏi localStorage
        localStorage.removeItem("token");
        
        // Xóa các dữ liệu khác nếu có
        // localStorage.removeItem("userRole");
        // localStorage.removeItem("userInfo");
        
        // Hiển thị thông báo đăng xuất thành công
        // showToast("Success", "Đăng xuất thành công", "success", 2000);
        
        // Chuyển hướng về trang login sau 2 giây
        setTimeout(() => {
            window.location.href = "login.html";
        }, 500);
        
    } catch (error) {
        console.error("Error during logout:", error);
        showToast("Lỗi", "Có lỗi xảy ra khi đăng xuất", "error");
    }
}

// Kiểm tra authentication khi load trang
function checkAuthentication() {
    const token = localStorage.getItem("token");
    
    if (!token) {
        // Nếu không có token, chuyển hướng về login
        showToast("Cảnh báo", "Vui lòng đăng nhập để truy cập", "error", 3000);
        setTimeout(() => {
            window.location.href = "login.html";
        }, 3000);
        return false;
    }
    
    return true;
}

// ==================== EXPORT PDF FUNCTION ====================

// Khởi tạo export button
function initializeExportButton() {
    const exportBtn = document.getElementById("export-report-btn");
    if (exportBtn) {
        exportBtn.addEventListener("click", function () {
            fetch("http://localhost:8080/dashboard/export-pdf", {
                method: "GET",
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Lỗi khi tải báo cáo PDF");
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "bao_cao_doanh_thu.pdf";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                showToast("Thành công", "Báo cáo đã được tải xuống", "success", 3000);
            })
            .catch(error => {
                console.error("Lỗi khi tải file PDF:", error);
                showToast("Lỗi", "Không thể tải báo cáo. Vui lòng thử lại sau.", "error");
            });
        });
    }
}

// ==================== MAIN FUNCTION ====================

// Hàm main để load tất cả dữ liệu dashboard
function main() {
    console.log('Loading dashboard data...');
    
    // Load statistics
    console.log('Loading statistics...');
    fetchRevenue();
    fetchTotalUsers();
    fetchTotalCustomers();
    fetchTotalStaffs();
    fetchTotalOrders();
    fetchTotalOnlineOrders();
    fetchTotalOfflineOrders();
    fetchTotalProducts();

    // Load charts sau một khoảng delay ngắn để đảm bảo DOM ready
    setTimeout(() => {
        console.log('Loading charts...');
        fetchTopProducts();
        fetchTopStaff();
        fetchTopCustomers();
        fetchDailyRevenue();
        
        // Hiển thị thông báo thành công sau khi load xong
        setTimeout(() => {
            showToast("Thành công", "Tải dashboard thành công", "success", 3000);
        }, 1000);
    }, 500);

    // Kết nối WebSocket để nhận dữ liệu thời gian thực
    connectWebSocket();
}

// ==================== INITIALIZATION ====================

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dashboard...');
    
    // Kiểm tra authentication trước khi load dashboard
    if (!checkAuthentication()) {
        return; // Dừng initialization nếu chưa đăng nhập
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        showToast("Lỗi", "Thư viện Chart.js chưa được tải", "error");
        return;
    }
    
    // Initialize buttons
    initializeExportButton();
    initializeLogoutButton();
    
    // Call main function
    main();
});