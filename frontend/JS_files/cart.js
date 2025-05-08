let cart = [];

// Load cart from localStorage
function loadCart() {
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    cart = JSON.parse(storedCart);
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Toggle Cart Sidebar with Auth Check
function toggleCart() {
  const loginSidebar = document.getElementById('loginSidebar');
  let cartSidebar = document.getElementById('cartSidebar');

  // Create cartSidebar if it doesn't exist
  if (!cartSidebar) {
    cartSidebar = document.createElement('div');
    cartSidebar.id = 'cartSidebar';
    cartSidebar.className = 'sidebar'; // Add your sidebar class
    document.body.appendChild(cartSidebar);
  }

  // Close login sidebar if open
  if (loginSidebar?.classList.contains('show')) {
    loginSidebar.classList.remove('show');
  }

  // Toggle visibility
  cartSidebar.classList.toggle('show');

  // Populate sidebar HTML structure
  if (cartSidebar.classList.contains('show')) {
    cartSidebar.innerHTML = `
      <div class="cart-header">
        <h3>Your Cart</h3>
        <button onclick="toggleCart()" class="close-btn">&times;</button>
      </div>
      <div id="cart-container" class="cart-items"></div>
      <div class="cart-footer">
        <button onclick="handleCheckout()" id="checkout-btn">PROCEED TO CHECKOUT</button>
      </div>
    `;
    renderCart();
  }
}


// Render Cart Contents
async function renderCart() {
  const container = document.getElementById('cart-container');
  if (!container) {
    console.warn('Cart container not found.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to view your cart.');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/api/cart', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart items.');
    }

    const cartItems = await response.json();

    container.innerHTML = '';

    if (cartItems.length === 0) {
      container.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }
    total=0;
    quan=cartItems.quantity;
    cartItems.forEach(item => {
      const product = item.product; // Full product object from backend
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
    
      const imgSrc = product.img && product.img.data
        ? `data:${product.img.contentType};base64,${product.img.data}`
        : 'https://via.placeholder.com/100';
    
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
    
      itemDiv.innerHTML = `
        <div class="cart-item-img">
          <img src="${imgSrc}" alt="${product.name}" />
        </div>
        <div class="cart-info">
          <h4>${product.name}</h4>
          <p>Size: ${item.size || 'ONE SIZE'}</p>
          <p>Qty: ${item.quantity}</p>
          <p>Price: EGP ${product.price.toLocaleString()}</p>
          <p><strong>Subtotal: EGP ${itemTotal.toLocaleString()}</strong></p>
          <button class="remove-item-btn" data-id="${item._id}">🗑️ Remove</button>
        </div>
      `;
    
      container.appendChild(itemDiv);
    });

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const itemId = btn.getAttribute('data-id');
        const token = localStorage.getItem('token');
    
        if (!token) {
          alert("You must be logged in.");
          return;
        }
    
        try {
          const res = await fetch(`http://localhost:8000/api/cart/${itemId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
    
          if (!res.ok) throw new Error('Failed to remove item');
    
          alert('Item removed successfully!');
          renderCart(); // Refresh cart
    
        } catch (err) {
          console.error(err);
          alert('Could not remove item.');
        }
      });
    });
    
    
    
    // Add total to the end
    const totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    totalDiv.innerHTML = `<h3>Total: EGP ${total.toLocaleString()}</h3>`;
    container.appendChild(totalDiv);

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

// Update Quantity in Cart
function updateQty(index, newQty) {
  const qty = parseInt(newQty);
  if (qty < 1) return;

  cart[index].qty = qty;
  saveCart();
  renderCart();
}

// Remove Item from Cart
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

// Checkout with Auth Check
async function handleCheckout() {
  const token = localStorage.getItem('token');

  if (!token) {
    document.getElementById('cartSidebar')?.classList.remove('show');
    document.getElementById('loginSidebar')?.classList.add('show');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      document.getElementById('cartSidebar')?.classList.remove('show');
      document.getElementById('loginSidebar')?.classList.add('show');
      return;
    }

    // Token is valid
    window.location.href = '../Html_files/checkout.html';
  } catch (error) {
    console.error('Verification error:', error);
    alert('Failed to verify your session. Please try again.');
  }
}

// Initialize Cart on Page Load
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  renderCart();
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountElement.textContent = count;
  }
});
