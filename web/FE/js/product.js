document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("tbody");
    const searchInput = document.querySelector(".search-box input");
    const searchBtn = document.querySelector(".search-box button");
    const addBtn = document.querySelector(".add-btn");

    const modal = document.getElementById("product-modal");
    const modalTitle = document.getElementById("modal-title");
    const closeModal = document.querySelector(".close");
    const form = document.getElementById("product-form");

    const idInput = document.getElementById("product-id");
    const nameInput = document.getElementById("product-name");
    const sizeInput = document.getElementById("product-size");
    const priceInput = document.getElementById("product-price");
    const branch1Input = document.getElementById("product-branch1");
    const branch2Input = document.getElementById("product-branch2");

    let products = [
        { id: 1, name: "Men's T-Shirt", size: "S", price: "250,000 VND", branch1: 1000, branch2: 2000 },
        { id: 2, name: "Jeans", size: "M", price: "400,000 VND", branch1: 1000, branch2: 2000 }
    ];
    let nextId = 3;

    function renderTable(data) {
        tableBody.innerHTML = "";
        data.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.size}</td>
                <td>${product.price}</td>
                <td>${product.branch1}</td>
                <td>${product.branch2}</td>
                <td>
                    <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    window.editProduct = function(id) {
        const product = products.find(p => p.id === id);
        idInput.value = product.id;
        nameInput.value = product.name;
        sizeInput.value = product.size;
        priceInput.value = product.price;
        branch1Input.value = product.branch1;
        branch2Input.value = product.branch2;

        modalTitle.textContent = "Edit Product";
        modal.style.display = "block";
    };

    window.deleteProduct = function(id) {
        if (confirm("Are you sure you want to delete this product?")) {
            products = products.filter(p => p.id !== id);
            renderTable(products);
        }
    };

    addBtn.addEventListener("click", () => {
        form.reset();
        idInput.value = "";
        modalTitle.textContent = "Add Product";
        modal.style.display = "block";
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    form.addEventListener("submit", (e) => {
    console.log(" form s")
        e.preventDefault();
        const id = idInput.value;

        const request = {
            id: id ? parseInt(id) : nextId++,
            name: nameInput.value,
            size: sizeInput.value,
            price: priceInput.value,
            branch1: parseInt(branch1Input.value),
            branch2: parseInt(branch2Input.value)
        };

        // call api add
          $.ajax({
                    type: "POST",
                    url: "http://localhost:8080/auth/public/login",
                    contentType: "application/json",
                    data: JSON.stringify(request);,
                    credentials: "include",
                    success: function(response) {
                       //todo
                       console.log("success ");
                        products.push(newProduct);
                    },
                    error: function(error){
                        console.error("Client error: " + error);
                    },
                });
        if (id) {
            const index = products.findIndex(p => p.id === parseInt(id));
            products[index] = newProduct;
        } else {

        }

        modal.style.display = "none";
        renderTable(products);
    });

    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.toLowerCase().trim();
        const filtered = products.filter(p => p.name.toLowerCase().includes(query));
        renderTable(filtered);
    });
    // call api get
    renderTable(products);
});
