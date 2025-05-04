// Cart count
let cartItems = JSON.parse(localStorage.getItem('cart'))?.length || 0;
document.getElementById("cart-count").textContent = cartItems;

// Get products from localStorage (shared with admin)
function getProducts() {
    return JSON.parse(localStorage.getItem('adminProducts')) || [];
}

// Display products
function displayProducts(filter = 'all') {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    let products = getProducts();
    let filteredProducts = products;
    
    if (filter === 'new') {
        filteredProducts = products.filter(p => p.isNew);
        document.getElementById('page-title').textContent = 'New Arrivals';
    } else if (filter === 'men') {
        filteredProducts = products.filter(p => p.category === 'men');
        document.getElementById('page-title').textContent = "Men's Collection";
    } else if (filter === 'women') {
        filteredProducts = products.filter(p => p.category === 'women');
        document.getElementById('page-title').textContent = "Women's Collection";
    } else {
        document.getElementById('page-title').textContent = 'All Products';
    }

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem;">No products available.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
        <a href="product_details.html?id=${product.id}" style="text-decoration:none;color:inherit;">
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        </a>
        `;
        grid.appendChild(productCard);
    });

    // Add event listeners to new buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Add to cart function
function addToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const productId = parseInt(e.target.getAttribute('data-id'));
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert("Product not found!");
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    document.getElementById("cart-count").textContent = cart.length;
    
    alert(`${product.name} added to cart!`);
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        displayProducts(this.getAttribute('data-filter'));
    });
});

// URL filters
function checkUrlFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const type = urlParams.get('type');

    if (category && type) {
        let filter = 'all';
        if (category === 'men') filter = 'men';
        if (category === 'women') filter = 'women';
        if (type === 'new') filter = 'new';

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            }
        });

        displayProducts(filter);

        // Title update
        if (type !== 'all') {
            let title = '';
            if (category === 'men') title += "Men's ";
            if (category === 'women') title += "Women's ";
            title += type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
            document.getElementById('page-title').textContent = title;
        }
    } else {
        displayProducts();
    }
}

// Initialize
checkUrlFilters();

// Optional: Listen for storage changes (if admin adds products in another tab)
window.addEventListener('storage', function(event) {
    if (event.key === 'adminProducts') {
        checkUrlFilters(); // Refresh products when admin adds new ones
    }
});