// Cart Functions with Authentication Check
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const loginSidebar = document.getElementById('loginSidebar');
  
  // Close login sidebar if open
  if (loginSidebar.classList.contains('show')) {
    loginSidebar.classList.remove('show');
  }
  
  sidebar.classList.toggle('show');
  
  // If opening cart, render it
  if (sidebar.classList.contains('show')) {
    renderCart();
  }
}

let cart = [];

function loadCart() {
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    cart = JSON.parse(storedCart);
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
  loadCart(); // Ensure latest data
  const cartItems = document.getElementById('cartItems');
  const cartItemCount = document.getElementById('cart-item-count');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const checkoutBtn = document.getElementById('checkout-btn');

  cartItems.innerHTML = '';
  let subtotal = 0;

  if (cart.length === 0) {
    cartItemCount.textContent = "0 ITEMS IN YOUR BAG";
    cartSubtotal.textContent = `EGP 0`;
    cartItems.innerHTML = `<p style="text-align:center;padding:2rem;">Your cart is empty.</p>`;
    document.getElementById("cart-count").textContent = 0;
    checkoutBtn.style.display = 'none';
    return;
  }

  cart.forEach((item, index) => {
    subtotal += item.price * item.qty;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="item-details">
        <h4>${item.name}</h4>
        <p>UK SIZE: ${item.size}</p>
        <p>EGP ${item.price.toLocaleString()}</p>
        <div class="qty">
          QTY: <input type="number" min="1" value="${item.qty}" onchange="updateQty(${index}, this.value)">
        </div>
        <button class="remove-btn" onclick="removeItem(${index})">REMOVE ITEM</button>
      </div>
    `;
    cartItems.appendChild(itemDiv);
  });

  cartItemCount.textContent = `${cart.length} ITEM${cart.length !== 1 ? 'S' : ''} IN YOUR BAG`;
  cartSubtotal.textContent = `EGP ${subtotal.toLocaleString()}`;
  document.getElementById("cart-count").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  
  // Show checkout button and add click handler
  checkoutBtn.style.display = 'block';
  checkoutBtn.onclick = handleCheckout;
}

function updateQty(index, newQty) {
  const qty = parseInt(newQty);
  if (qty < 1) return;
  
  cart[index].qty = qty;
  saveCart();
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

// Enhanced Checkout Handler with Authentication Check
async function handleCheckout() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Not logged in - show login sidebar and prevent checkout
    document.getElementById('cartSidebar').classList.remove('show');
    document.getElementById('loginSidebar').classList.add('show');
    return;
  }
  
  try {
    // Verify token is still valid
    const response = await fetch('http://localhost:8000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      localStorage.removeItem("token");
      document.getElementById('cartSidebar').classList.remove('show');
      document.getElementById('loginSidebar').classList.add('show');
      return;
    }
    
    // Token is valid - proceed to checkout
    window.location.href = "../Html_files/checkout.html";
  } catch (error) {
    console.error('Verification error:', error);
    alert('Failed to verify your session. Please try again.');
  }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  
  // Optional: Update cart count in navbar immediately
  loadCart();
  document.getElementById("cart-count").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
});

// Add this to your cart HTML button:
// <button id="checkout-btn" style="display:none;">PROCEED TO CHECKOUT</button>