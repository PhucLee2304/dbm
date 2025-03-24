document.addEventListener('DOMContentLoaded', function() {
    const productSearch = document.getElementById('productSearch');
    const productResults = document.getElementById('productResults');
    const addProductButton = document.getElementById('addProductButton');
    const totalPriceSpan = document.getElementById('totalPrice');
    const generateReceiptButton = document.getElementById('generateReceipt');
    const receiptDiv = document.getElementById('receipt');
    const selectedProductsContainer = document.getElementById('selectedProductsContainer');
    const productSize = document.getElementById('productSize');

    const productPrices = {};

    productSearch.addEventListener('input', function() {
        const query = productSearch.value.toLowerCase();
        if (query.length > 0) {
            fetchProducts(query);
        } else {
            productResults.innerHTML = '';
        }
    });

    function fetchProducts(query) {
        fetch('/db/orders.json')
            .then(response => response.json())
            .then(data => {
                const filteredProducts = data.filter(product => product.name.toLowerCase().includes(query));
                displayProductResults(filteredProducts);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }

    function displayProductResults(products) {
        productResults.innerHTML = '';
        products.forEach(product => {
            const li = document.createElement('li');
            li.textContent = `${product.name} - ${product.price} VND`;
            li.addEventListener('click', function() {
                productSearch.value = product.name;
                productResults.innerHTML = '';
                productPrices[product.name] = product.price;
            });
            productResults.appendChild(li);
        });
    }

    function updateTotalPrice() {
        let totalPrice = 0;
        const selectedProducts = selectedProductsContainer.querySelectorAll('.selected-product');

        selectedProducts.forEach(productDiv => {
            const product = productDiv.querySelector('.product-name').textContent.trim().replace(',', '');
            const quantity = parseInt(productDiv.querySelector('.product-quantity').value, 10);
            const price = productPrices[product] || 0;
            totalPrice += price * quantity;
        });

        totalPriceSpan.textContent = totalPrice;
    }

    addProductButton.addEventListener('click', function() {
        const selectedProduct = productSearch.value;
        const size = productSize.value;
        if (selectedProduct && size && productPrices[selectedProduct] !== undefined) {
            const productDiv = document.createElement('div');
            productDiv.classList.add('selected-product');
            productDiv.innerHTML = `
                <span class="product-name">${selectedProduct}, </span> <span class="product-size">Size: ${size}</span>
                <input type="number" class="product-quantity" min="1" value="1" required>
                <button type="button" class="remove-product-button">Remove</button>
            `;
            selectedProductsContainer.appendChild(productDiv);

            productDiv.querySelector('.product-quantity').addEventListener('input', updateTotalPrice);
            productDiv.querySelector('.remove-product-button').addEventListener('click', function() {
                productDiv.remove();
                updateTotalPrice();
            });

            updateTotalPrice();
        }
    });

    generateReceiptButton.addEventListener('click', function() {
        const employeeCode = document.getElementById('employeeCode').value;
        const orderID = generateOrderID(employeeCode);
        const userName = document.getElementById('userName').value;
        const userPhone = document.getElementById('userPhone').value;
        const employeeName = document.getElementById('employeeName').value;
        const branchName = document.getElementById('branchName').value;
        const selectedProducts = [];

        selectedProductsContainer.querySelectorAll('.selected-product').forEach(productDiv => {
            const product = productDiv.querySelector('.product-name').textContent.trim().replace(',', '');
            const size = productDiv.querySelector('.product-size').textContent.split(': ')[1];
            const quantity = parseInt(productDiv.querySelector('.product-quantity').value, 10);
            selectedProducts.push({ product, size, quantity });
        });

        const totalPrice = totalPriceSpan.textContent;

        const order = {
            orderID,
            userName,
            userPhone,
            employeeName,
            employeeCode,
            branchName,
            selectedProducts,
            totalPrice
        };

        saveOrder(order);
        displayReceipt(order);
    });

    function generateOrderID(employeeCode) {
        const prefix = employeeCode.substring(0, 2).toUpperCase();
        const randomNumber = Math.floor(100 + Math.random() * 900).toString();
        return prefix + randomNumber;
    }

    function saveOrder(order) {
        fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function displayReceipt(order) {
        let productsHtml = '';
        order.selectedProducts.forEach(product => {
            productsHtml += `<p>Product: ${product.product}, Size: ${product.size}, Quantity: ${product.quantity}</p>`;
        });

        receiptDiv.innerHTML = `
            <h2>Receipt</h2>
            <p>Branch: ${order.branchName}</p>
            <p>Order ID: ${order.orderID}</p>
            <p>Name: ${order.userName}</p>
            <p>Phone: ${order.userPhone}</p>
            <p>Employee: ${order.employeeName}</p>
            <p>Employee Code: ${order.employeeCode}</p>
            ${productsHtml}
            <p>Total Price: ${order.totalPrice} VND</p>
        `;
    }
});