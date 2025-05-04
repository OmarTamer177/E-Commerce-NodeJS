// DOM Elements
const sizeButtons = document.querySelectorAll('.size-btn');
const minusBtn = document.querySelector('.quantity-btn:first-child');
const plusBtn = document.querySelector('.quantity-btn:last-child');
const quantityInput = document.querySelector('.quantity-value');
const addToCartBtn = document.querySelector('.add-to-cart');
const buyNowBtn = document.querySelector('.buy-now');
const cartCount = document.getElementById('cart-count');

// State
let currentProduct = null;
let selectedSize = 'M'; // Default size
let quantity = 1;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  // Load product from URL ID
  loadProductFromURL();
  
  // Initialize cart count
  updateCartCount();
  
  // Set up event listeners
  setupEventListeners();
});

// Load product based on URL ID
function loadProductFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    alert('No product specified!');
    window.location.href = 'products.html';
    return;
  }

  // Get product from localStorage (replace with API call in real implementation)
  const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
  currentProduct = products.find(p => p.id == productId);
  
  if (!currentProduct) {
    alert('Product not found!');
    window.location.href = 'products.html';
    return;
  }

  // Update page with product data
  renderProductDetails();
}

// Display product information
function renderProductDetails() {
  document.querySelector('.product-title').textContent = currentProduct.name;
  document.querySelector('.product-image img').src = currentProduct.image;
  document.querySelector('.product-image img').alt = currentProduct.name;
  
  // You can add more fields here:
  // document.querySelector('.product-price').textContent = `$${currentProduct.price.toFixed(2)}`;
  // document.querySelector('.product-description').textContent = currentProduct.description;
}

// Set up all event listeners
function setupEventListeners() {
  // Size selection
  sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      sizeButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      selectedSize = button.textContent;
    });
  });

  // Quantity adjustment
  minusBtn.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      quantityInput.value = quantity;
    }
  });

  plusBtn.addEventListener('click', () => {
    quantity++;
    quantityInput.value = quantity;
  });

  quantityInput.addEventListener('change', () => {
    quantity = parseInt(quantityInput.value) || 1;
    quantityInput.value = quantity;
  });

  // Add to cart
  addToCartBtn.addEventListener('click', addToCart);

  // Buy now
  buyNowBtn.addEventListener('click', buyNow);
}

// Add item to cart
function addToCart() {
  if (!currentProduct) return;
  
  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: currentProduct.price,
    size: selectedSize,
    quantity: quantity,
    image: currentProduct.image
  };

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(cartItem);
  localStorage.setItem('cart', JSON.stringify(cart));
  
  updateCartCount();
  alert(`${cartItem.name} (Size: ${cartItem.size}) added to cart!`);
}

// Buy now functionality
function buyNow() {
  addToCart();
  window.location.href = 'cart.html';
}

// Update cart count in navbar
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cartCount.textContent = cart.length;
}

// Toggle info sections
function toggleInfo(id) {
  const content = document.getElementById(id);
  const icon = content.previousElementSibling.querySelector('i');
  
  content.classList.toggle('active');
  if (content.classList.contains('active')) {
    icon.classList.replace('fa-plus', 'fa-minus');
  } else {
    icon.classList.replace('fa-minus', 'fa-plus');
  }
}

// Make toggleInfo function globally available for HTML onclick
window.toggleInfo = toggleInfo;