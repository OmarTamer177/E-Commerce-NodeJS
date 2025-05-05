// --- Cart Count Initialization ---
updateCartCount();

function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cart-count").textContent = totalItems;
  const itemCountText = document.getElementById("cart-item-count");
  if (itemCountText) itemCountText.textContent = `${totalItems} ITEM${totalItems !== 1 ? 'S' : ''} IN YOUR BAG`;
}

// --- Fetch Products from Local Storage ---
function getProducts() {
  return JSON.parse(localStorage.getItem('adminProducts')) || [];
}

// --- Display Products ---
function displayProducts(filter = 'all') {
  const grid = document.getElementById('products-grid');
  const title = document.getElementById('page-title');
  grid.innerHTML = '';

  const products = getProducts();
  let filteredProducts = [...products];

  // Apply filter
  switch (filter) {
    case 'new':
      filteredProducts = products.filter(p => p.isNew);
      title.textContent = 'New Arrivals';
      break;
    case 'men':
      filteredProducts = products.filter(p => p.category === 'men');
      title.textContent = "Men's Collection";
      break;
    case 'women':
      filteredProducts = products.filter(p => p.category === 'women');
      title.textContent = "Women's Collection";
      break;
    default:
      title.textContent = 'All Products';
      break;
  }

  // No Products Message
  if (filteredProducts.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem;">No products available.</p>`;
    return;
  }

  // Render Cards
  filteredProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <a href="product_details.html?id=${product.id}" style="text-decoration:none;color:inherit;">
        <img src="${product.image}" alt="${product.name}" class="product-img">
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">EGP ${product.price.toLocaleString()}</p>
        </div>
      </a>
      <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
    `;
    grid.appendChild(productCard);
  });

  // Attach event listeners after render
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', addToCart);
  });
}

// --- Add Product to Cart ---
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
  const productSize = product.size || 'ONE SIZE';

  const existing = cart.find(item => item.name === product.name && item.size === productSize);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name: product.name,
      size: productSize,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// --- Filter Buttons ---
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    displayProducts(this.getAttribute('data-filter'));
  });
});

// --- URL-based Filter Parsing ---
function checkUrlFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const type = urlParams.get('type');

  let filter = 'all';

  if (type === 'new') filter = 'new';
  else if (category === 'men') filter = 'men';
  else if (category === 'women') filter = 'women';

  // Apply filter styles
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    }
  });

  displayProducts(filter);

  // Update title if specific
  if (category && type !== 'all') {
    let title = '';
    if (category === 'men') title += "Men's ";
    if (category === 'women') title += "Women's ";
    title += type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
    document.getElementById('page-title').textContent = title;
  }
}

// --- Init ---
checkUrlFilters();

// --- Cross-tab Sync for Admin Products ---
window.addEventListener('storage', function (event) {
  if (event.key === 'adminProducts') {
    checkUrlFilters();
  }
});