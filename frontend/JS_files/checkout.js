// Constants
const SHIPPING_COST = 85.00;
const API_BASE_URL = 'http://localhost:8000/api';

// DOM Elements
const cartItemsEl = document.getElementById("cartItems");
const summarySectionEl = document.getElementById("summarySection");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const payBtn = document.getElementById("payNowBtn");
const errorMessageEl = document.getElementById("errorMessage");

// Initialize checkout page
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    showLoginPrompt();
    return;
  }

  try {
    // Verify token and load cart
    const [profileResponse, cartResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }),
      fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    ]);

    if (!profileResponse.ok) {
      localStorage.removeItem("token");
      showLoginPrompt();
      return;
    }

    if (!cartResponse.ok) {
      throw new Error('Failed to load cart');
    }

    const cartData = await cartResponse.json();
    const cartItems = cartData.items || [];

    if (cartItems.length === 0) {
      showEmptyCart();
      return;
    }

    renderCartItems(cartItems);
    calculateTotals(cartItems);
    payBtn.disabled = false;

  } catch (error) {
    console.error('Checkout initialization error:', error);
    errorMessageEl.textContent = 'Failed to initialize checkout. Please try again.';
  }
});

function showLoginPrompt() {
  errorMessageEl.innerHTML = `
    Please login to proceed with checkout.<br>
    <button onclick="redirectToLogin()" class="login-redirect-btn">Login Now</button>
  `;
}

function showEmptyCart() {
  cartItemsEl.innerHTML = '<p>No items in your cart.</p>';
  summarySectionEl.style.display = 'none';
  payBtn.disabled = true;
  errorMessageEl.textContent = 'Your cart is empty.';
}

function renderCartItems(items) {
  cartItemsEl.innerHTML = '';
  
  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'product-summary';
    itemEl.innerHTML = `
      <img src="${item.imageUrl || 'https://via.placeholder.com/60'}" alt="${item.name}">
      <div class="product-info">
        <p><strong>${item.name}</strong></p>
        <p>Size: ${item.size || 'N/A'}</p>
        <p>EGP ${item.price.toFixed(2)}</p>
        <p>Qty: ${item.quantity || 1}</p>
      </div>
    `;
    cartItemsEl.appendChild(itemEl);
  });
}

function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const total = subtotal + SHIPPING_COST;
  
  subtotalEl.textContent = `EGP ${subtotal.toFixed(2)}`;
  totalEl.textContent = `EGP ${total.toFixed(2)}`;
  summarySectionEl.style.display = 'block';
}

// Handle payment submission
payBtn.addEventListener('click', async () => {
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const billingSameAsShipping = document.getElementById('same').checked;
  const token = localStorage.getItem('token');
  
  if (!token) {
    showLoginPrompt();
    return;
  }

  try {
    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';
    errorMessageEl.textContent = '';
    
    // Get latest cart first
    const cartResponse = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!cartResponse.ok) {
      throw new Error('Failed to verify cart contents');
    }
    
    const cartData = await cartResponse.json();
    if (!cartData.items || cartData.items.length === 0) {
      throw new Error('Your cart is empty');
    }
    
    // Process checkout
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        paymentMethod,
        billingSameAsShipping,
        shippingCost: SHIPPING_COST
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment processing failed');
    }
    
    const result = await response.json();
    
    if (paymentMethod === 'myfatoorah' && result.paymentUrl) {
      window.location.href = result.paymentUrl;
    } else {
      window.location.href = '../Html_files/order-confirmation.html';
    }
  } catch (error) {
    console.error('Payment error:', error);
    errorMessageEl.textContent = error.message || 'Payment failed. Please try again.';
    payBtn.disabled = false;
    payBtn.textContent = 'Pay now';
  }
});

function redirectToLogin() {
  window.location.href = '../Html_files/login.html';
}