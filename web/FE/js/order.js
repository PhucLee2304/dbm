document.addEventListener('DOMContentLoaded', function() {
    const ordersTableBody = document.querySelector('#ordersTable tbody');
    const searchInput = document.getElementById('searchInput');
    const editModal = document.getElementById('editModal');
    const closeModal = document.querySelector('.close');
    const editOrderForm = document.getElementById('editOrderForm');
    let orders = [];
    let currentEditOrderId = null;

    function fetchOrders() {
        // Sample data to display
        orders = [
            {
                branchName: 'Ha Noi',
                orderId: 'HN001',
                customerName: 'Hieu',
                phone: '0123456789',
                employeeName: 'Employee 1',
                employeeCode: 'HN123',
                product: 'T-shirt',
                size: 'M',
                quantity: 1,
                totalPrice: 1000
            },
            {
                branchName: 'Hai Duong',
                orderId: 'HD002',
                customerName: 'Nam',
                phone: '0987654321',
                employeeName: 'Employee 2',
                employeeCode: 'HD002',
                product: 'Jean',
                size: 'L',
                quantity: 2,
                totalPrice: 3000
            },
            {
                branchName: 'Phu Tho',
                orderId: 'PT003',
                customerName: 'Nguyen Hieu',
                phone: '0112233445',
                employeeName: 'Employee 3',
                employeeCode: 'PT003',
                product: 'Iphone 16 Plus',
                size: 'XL',
                quantity: 1,
                totalPrice: 2000
            }
        ];
        displayOrders(orders);
    }

    function displayOrders(orders) {
        ordersTableBody.innerHTML = '';
        orders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.branchName}</td>
                <td>${order.orderId}</td>
                <td>${order.customerName}</td>
                <td>${order.phone}</td>
                <td>${order.employeeName}</td>
                <td>${order.employeeCode}</td>
                <td>${order.product}</td>
                <td>${order.size}</td>
                <td>${order.quantity}</td>
                <td>${order.totalPrice}</td>
                <td class="action-icons">
                    <a href="#" style="color: blue;" onclick="editOrder('${order.orderId}')">Edit</a>
                    <a href="#" style="color: blue;" onclick="deleteOrder('${order.orderId}')">Delete</a>
                </td>
            `;
            ordersTableBody.appendChild(tr);
        });
    }

    window.editOrder = function(orderId) {
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
            currentEditOrderId = orderId;
            document.getElementById('editBranchName').value = order.branchName;
            document.getElementById('editOrderID').value = order.orderId;
            document.getElementById('editCustomerName').value = order.customerName;
            document.getElementById('editPhone').value = order.phone;
            document.getElementById('editEmployeeName').value = order.employeeName;
            document.getElementById('editEmployeeCode').value = order.employeeCode;
            document.getElementById('editProduct').value = order.product;
            document.getElementById('editSize').value = order.size;
            document.getElementById('editQuantity').value = order.quantity;
            document.getElementById('editTotalPrice').value = order.totalPrice;
            editModal.style.display = 'block';
        }
    }

    window.deleteOrder = function(orderId) {
        orders = orders.filter(o => o.orderId !== orderId);
        displayOrders(orders);
    }

    function searchOrders() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredOrders = orders.filter(order => 
            order.branchName.toLowerCase().includes(searchTerm) ||
            order.orderId.toLowerCase().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.phone.toLowerCase().includes(searchTerm) ||
            order.employeeName.toLowerCase().includes(searchTerm) ||
            order.employeeCode.toLowerCase().includes(searchTerm) ||
            order.product.toLowerCase().includes(searchTerm) ||
            order.size.toLowerCase().includes(searchTerm) ||
            order.quantity.toString().includes(searchTerm) ||
            order.totalPrice.toString().includes(searchTerm)
        );
        displayOrders(filteredOrders);
    }

    searchInput.addEventListener('input', searchOrders);

    closeModal.addEventListener('click', function() {
        editModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    }

    editOrderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const order = orders.find(o => o.orderId === currentEditOrderId);
        if (order) {
            order.branchName = document.getElementById('editBranchName').value;
            order.customerName = document.getElementById('editCustomerName').value;
            order.phone = document.getElementById('editPhone').value;
            order.employeeName = document.getElementById('editEmployeeName').value;
            order.employeeCode = document.getElementById('editEmployeeCode').value;
            order.product = document.getElementById('editProduct').value;
            order.size = document.getElementById('editSize').value;
            order.quantity = document.getElementById('editQuantity').value;
            order.totalPrice = document.getElementById('editTotalPrice').value;
            displayOrders(orders);
            editModal.style.display = 'none';
        }
    });

    fetchOrders();
});