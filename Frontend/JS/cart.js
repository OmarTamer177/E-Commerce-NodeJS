// cart.js

const dummyProducts = [
    { id: '1', name: 'Laptop', description: 'A high-performance laptop.', price: 999.99, image: 'https://via.placeholder.com/300x200?text=Laptop' },
    { id: '2', name: 'Smartphone', description: 'Latest model smartphone.', price: 699.99, image: 'https://via.placeholder.com/300x200?text=Smartphone' },
    { id: '3', name: 'Headphones', description: 'Noise-cancelling headphones.', price: 199.99, image: 'https://via.placeholder.com/300x200?text=Headphones' }
  ];
  
  document.addEventListener('DOMContentLoaded', () => {
    displayCartItems();
  });
  
  function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="text-center">Your cart is empty.</p>';
      return;
    }
  
    let total = 0;
    cartItemsContainer.innerHTML = '';
  
    cart.forEach(productId => {
      const product = dummyProducts.find(p => p.id === productId);
      if (product) {
        total += product.price;
  
        const item = document.createElement('div');
        item.className = 'card mb-3';
  
        item.innerHTML = `
          <div class="row g-0">
            <div class="col-md-4">
              <img src="${product.image}" class="img-fluid rounded-start" alt="${product.name}">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description}</p>
                <p class="card-text"><strong>Price: $${product.price.toFixed(2)}</strong></p>
                <button class="btn btn-danger" onclick="removeFromCart('${product.id}')">Remove</button>
              </div>
            </div>
          </div>
        `;
  
        cartItemsContainer.appendChild(item);
      }
    });
  
    const totalDiv = document.createElement('div');
    totalDiv.className = 'text-end mt-3';
    totalDiv.innerHTML = `<h5>Total: $${total.toFixed(2)}</h5>`;
  
    cartItemsContainer.appendChild(totalDiv);
  }
  
  function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(id => id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
  }
  