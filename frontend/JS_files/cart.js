function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  sidebar.classList.toggle('show');
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

  cartItems.innerHTML = '';
  let subtotal = 0;

  if (cart.length === 0) {
    cartItemCount.textContent = "0 ITEMS IN YOUR BAG";
    cartSubtotal.textContent = `EGP 0`;
    cartItems.innerHTML = `<p style="text-align:center;padding:2rem;">Your cart is empty.</p>`;
    document.getElementById("cart-count").textContent = 0;
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
}

function updateQty(index, newQty) {
  cart[index].qty = parseInt(newQty);
  saveCart();
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

document.addEventListener('DOMContentLoaded', renderCart);
