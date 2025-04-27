// catalog.js

// Dummy product database
const dummyProducts = [
    {
      id: '1',
      name: 'Laptop',
      description: 'A high-performance laptop.',
      price: 999.99,
      image: 'https://via.placeholder.com/300x200?text=Laptop'
    },
    {
      id: '2',
      name: 'Smartphone',
      description: 'Latest model smartphone.',
      price: 699.99,
      image: 'https://via.placeholder.com/300x200?text=Smartphone'
    },
    {
      id: '3',
      name: 'Headphones',
      description: 'Noise-cancelling headphones.',
      price: 199.99,
      image: 'https://via.placeholder.com/300x200?text=Headphones'
    }
  ];
  
  // Load products
  document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
  
    dummyProducts.forEach(product => {
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';
  
      card.innerHTML = `
        <div class="card h-100">
          <img src="${product.image}" class="card-img-top" alt="${product.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.description}</p>
            <div class="mt-auto">
              <h6>$${product.price.toFixed(2)}</h6>
              <button class="btn btn-primary w-100 mt-2" onclick="addToCart('${product.id}')">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
  
      productList.appendChild(card);
    });
  });
  
  // Add to cart (simple localStorage)
  function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart!');
  }
  