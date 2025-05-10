// --- Cart Count Initialization ---
updateCartCount();

function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const itemCountText = document.getElementById("cart-item-count");
  if (itemCountText) itemCountText.textContent = `${totalItems} ITEM${totalItems !== 1 ? 'S' : ''} IN YOUR BAG`;
}

// --- Fetch Products from Local Storage ---
function getProducts() {
  return JSON.parse(localStorage.getItem('adminProducts')) || [];
}

async function displayProducts(filter = 'all', gender = "male") {
  const grid = document.getElementById('products-grid');
  const title = document.getElementById('page-title');
  grid.innerHTML = '';

  try {
    const response = await fetch('http://localhost:8000/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');

    const products = await response.json();
    let filteredProducts = [...products];

    // Apply filter
    switch (filter) {
      case 'new':
        filteredProducts = products.filter(p => p.isNew);
        title.textContent = 'New Arrivals';
        break;
      case 'male':
        filteredProducts = products.filter(p => p.gender === 'male');
        title.textContent = "Men's Collection";
        break;
      case 'female':
        filteredProducts = products.filter(p => p.gender === 'female');
        title.textContent = "Women's Collection";
        break;
      case 't-shirt':
      case 'pants':
      case 'sweatshirt':
      case 'shorts':
        filteredProducts = products.filter(p => p.category?.toLowerCase() === filter);
        title.textContent = `${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
        break;
      default:
        title.textContent = 'All Products';
        break;
    }

    switch (gender) {
      case 'male':
        filteredProducts = filteredProducts.filter(p => p.gender?.toLowerCase() === gender);
        break;
      case 'female':
        filteredProducts = filteredProducts.filter(p => p.gender?.toLowerCase() === gender);
        break;
      default:
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
        <a href="product_details?id=${product._id}" style="text-decoration:none;color:inherit;">
          <img src="data:${product.img.contentType};base64,${product.img.data}" alt="${product.name}" class="product-img">
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">EGP ${product.price.toLocaleString()}</p>
          </div>
        </a>
      `;
      grid.appendChild(productCard);
    });

    // Attach event listeners after render
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', Product_details);
    });

  } catch (error) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: red;">Error loading products: ${error.message}</p>`;
  }
}


// --- View product details ---
function Product_details(e) {
  e.preventDefault();
  e.stopPropagation();

  const productId = e.target.getAttribute('data-id');
  if (!productId) {
    alert("No product ID found!");
    return;
  }

  // Redirect to the product details page with the ID in the query string
  window.location.href = `product_details?id=${productId}`;
}


// --- Filter Buttons ---
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    const urlParams = new URLSearchParams(window.location.search);
    displayProducts(this.getAttribute('data-filter'), urlParams.get('gender'));
  });
});

// --- URL-based Filter Parsing ---
function checkUrlFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const gender = urlParams.get('gender');
  const type = urlParams.get('type');

  let filter = 'all';

  if (type) {
    const categories = ['t-shirt', 'pants', 'sweatshirt', 'shorts', 'new'];
    if (categories.includes(type)) {
      filter = type;
    }
  } else if (gender === 'male') {
    filter = 'male';
  } else if (gender === 'female') {
    filter = 'female';
  }

  // Apply filter styles
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    }
  });

  displayProducts(filter, gender);

  // Optional: Update page title more specifically
  if (type && gender) {
    let title = `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s ${type.charAt(0).toUpperCase() + type.slice(1)}`;
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