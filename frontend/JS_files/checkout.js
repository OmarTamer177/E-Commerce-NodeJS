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
const cardPaymentForm = document.getElementById('cardPaymentForm');
const paypalForm = document.getElementById('paypalForm');

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

    const cartItems = await cartResponse.json();

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
    const product = item.product;

    if (!product) {
      console.warn("Product info missing in cart item:", item);
      return;
    }

    const imgSrc = product.img && product.img.data
      ? `data:${product.img.contentType};base64,${product.img.data}`
      : 'https://via.placeholder.com/60';

    const itemEl = document.createElement('div');
    itemEl.className = 'product-summary';
    itemEl.innerHTML = `
      <img src="${imgSrc}" alt="${product.name}">
      <div class="product-info">
        <p><strong>${product.name}</strong></p>
        <p>Size: ${product.size || 'N/A'}</p>
        <p>EGP ${product.price.toFixed(2)}</p>
        <p>Qty: ${item.quantity || 1}</p>
      </div>
    `;

    cartItemsEl.appendChild(itemEl);
  });
}


function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => {
    const product = item.product;
    const quantity = item.quantity || 1;
    const price = product && product.price ? product.price : 0;
    return sum + (price * quantity);
  }, 0);

  const beftax = 1.14*subtotal;
  const total= beftax + SHIPPING_COST


  subtotalEl.textContent = `EGP ${subtotal.toFixed(2)}`;
  totalEl.textContent = `EGP ${total.toFixed(2)}`;
  summarySectionEl.style.display = 'block';
}

// Handle payment submission
payBtn.addEventListener('click', async () => {
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
  const billingSameAsShipping = document.getElementById('same').checked;
  const token = localStorage.getItem('token');
  const discountCode = document.getElementById('discountCode')?.value || null;

  if (!token) {
    showLoginPrompt();
    return;
  }

  if (!paymentMethod) {
    errorMessageEl.textContent = 'Please select a payment method';
    return;
  }

  // Validate payment form fields based on selected method
  if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
    const cardNumber = document.getElementById('cardNumber').value;
    const cardHolder = document.getElementById('cardHolder').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      errorMessageEl.textContent = 'Please fill in all card details';
      return;
    }
  } else if (paymentMethod === 'paypal') {
    const paypalEmail = document.getElementById('paypalEmail').value;
    if (!paypalEmail) {
      errorMessageEl.textContent = 'Please enter your PayPal email';
      return;
    }
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
    if (!cartData || cartData.length === 0) {
      throw new Error('Your cart is empty');
    }
    // Prepare payment data
    const paymentData = {
      paymentMethod,
      billingSameAsShipping,
      discountCode,
      cardDetails: paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? {
        cardNumber: document.getElementById('cardNumber').value,
        cardHolder: document.getElementById('cardHolder').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
      } : null,
      paypalEmail: paymentMethod === 'paypal' ? document.getElementById('paypalEmail').value : null
    };

    // Send checkout request
    const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment processing failed');
    }
    const result = await response.json();
    console.log('Checkout successful:', result);
    // Redirect to orders page
    window.location.href = '/orders';

  } catch (error) {
    console.error('Payment error:', error);
    errorMessageEl.textContent = error.message || 'Payment failed. Please try again.';
    payBtn.disabled = false;
    payBtn.textContent = 'Pay now';
  }
});
function redirectToLogin() {
  window.location.href = '/login';
}
// Add this event listener for payment method selection
document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        // Hide all payment forms first
        cardPaymentForm.classList.add('hidden');
        paypalForm.classList.add('hidden');

        // Show the appropriate form based on selection
        const selectedMethod = e.target.value;
        if (selectedMethod === 'credit_card' || selectedMethod === 'debit_card') {
            cardPaymentForm.classList.remove('hidden');
        } else if (selectedMethod === 'paypal') {
            paypalForm.classList.remove('hidden');
        }
    });
});
// Add input formatting for card details
document.getElementById('cardNumber')?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    e.target.value = value;
});
document.getElementById('expiryDate')?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});
document.getElementById('cvv')?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});