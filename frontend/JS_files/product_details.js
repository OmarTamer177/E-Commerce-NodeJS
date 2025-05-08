// Utility: Extract product ID from URL
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Fetch and display product details
async function loadProductDetails() {
  const productId = getProductIdFromURL();
  if (!productId) {
    alert('Product ID not found in URL');
    return;
  }

  try {
    const res = await fetch(`http://localhost:8000/api/products/${productId}`);
    if (!res.ok) throw new Error('Failed to load product data');
    const product = await res.json();
    localStorage.setItem('currentProduct', JSON.stringify(product));
    const reviewsRes = await fetch(`http://localhost:8000/api/products/reviews/${productId}`);
    if (!reviewsRes.ok) throw new Error('Failed to load reviews');
    const reviews = await reviewsRes.json();


    const container = document.querySelector('.product-container');

    container.innerHTML = `
      <div class="product-image">
        <img src="data:${product.img.contentType};base64,${product.img.data}" alt="${product.name}">
      </div>
      
      <div class="product-details">
        <h1 class="product-title">${product.name}</h1>
        
        <div class="product-price">
          <p>Price: EGP ${product.price.toLocaleString()}</p>
        </div>
        
        <div class="size-options">
          <div class="size-title">SIZE :</div>
          <div class="size-title">${product.size}</div>
        </div>

        <div class="stock">
          <div class="size-title">STOCK :</div>
          <div class="size-title">${product.stock}</div>
        </div>
        
        <div class="quantity-cart">
          <div class="quantity-selector">
            <button class="quantity-btn">-</button>
            <input type="text" class="quantity-value" value="1">
            <button class="quantity-btn">+</button>
          </div>
          <button class="add-to-cart">Add to cart</button>
        </div>
        
        <div class="payment-info">
          <p>Secure online payment</p>
        </div>
      </div>

      <div class="reviews-section">
        <h2>Reviews</h2>
        <div class="reviews-list">
          ${
            reviews.length > 0
              ? reviews.map(r => `
                  <div class="review">
                    <p><strong>${r.user_id.name}</strong> ★ ${r.rating}/5</p>
                    <p>${r.review}</p>
                  </div>
                `).join('')
              : '<p>No reviews yet for this product.</p>'
          }
        </div>

      </div>
    `;

    document.getElementById('submit-review').addEventListener('click', async () => {
      const review = document.getElementById('review-comment').value.trim();
      const rating = document.getElementById('review-rating').value;
      const productId = getProductIdFromURL();
      const token = localStorage.getItem('token');
    
      if (!token) return alert('You must be logged in to submit a review.');
      if (!review || !rating) return alert('Please provide a rating and comment.');
    
      try {
        const res = await fetch(`http://localhost:8000/api/products/review/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({rating, review })
        });
    
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to submit review.');
        }
    
        alert('Review submitted!');
        loadProductDetails(); // Refresh page to show new review
      } catch (err) {
        alert(err.message);
      }
    });
    
  } catch (err) {
    alert('Error loading product details: ' + err.message);
  }
}


function setupAddToCart() {
  document.querySelector('.add-to-cart').addEventListener('click', async () => {
    const product = JSON.parse(localStorage.getItem('currentProduct'));
    if (!product || !product._id) {
      alert('Product not found.');
      return;
    }
    const qty = parseInt(document.querySelector('.quantity-value').value) || 1;

    // Replace this with however you're storing the user's token
    const token = localStorage.getItem('token'); 
    if (!token) {
      alert('You must be logged in to add to cart.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/products/add-to-cart/${product._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: qty })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.message || 'Failed to add to cart');
      }

      alert('Product added to cart!');
      updateCartCount(); // Update UI if needed

    } catch (error) {
      console.error('Add to cart error:', error);
      alert(`Error: ${error.message}`);
    }
  });
}


function createQuantitySelector() {
  const quantityCart = document.createElement('div');
  quantityCart.className = 'quantity-cart';

  const quantitySelector = document.createElement('div');
  quantitySelector.className = 'quantity-selector';

  // Minus Button
  const minusBtn = document.createElement('button');
  minusBtn.className = 'quantity-btn';
  minusBtn.textContent = '-';

  // Input Field
  const qtyInput = document.createElement('input');
  qtyInput.type = 'number'; // numeric input type
  qtyInput.className = 'quantity-value';
  qtyInput.value = '1';
  qtyInput.min = '1';

  // Plus Button
  const plusBtn = document.createElement('button');
  plusBtn.className = 'quantity-btn';
  plusBtn.textContent = '+';

  // Append buttons and input to selector
  quantitySelector.appendChild(minusBtn);
  quantitySelector.appendChild(qtyInput);
  quantitySelector.appendChild(plusBtn);

  quantityCart.appendChild(quantitySelector);

  // Event Listeners
  minusBtn.addEventListener('click', () => {
    let current = parseInt(qtyInput.value);
    if (current > 1) {
      qtyInput.value = current - 1;
    }
  });

  plusBtn.addEventListener('click', () => {
    let current = parseInt(qtyInput.value);
    qtyInput.value = current + 1;
  });

  // Ensure the value is numeric after the change
  qtyInput.addEventListener('input', () => {
    if (isNaN(parseInt(qtyInput.value)) || qtyInput.value < 1) {
      qtyInput.value = '1';
    }
  });

  return quantityCart;
}




// Update cart count in navbar
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
}

// === Initialize on Page Load ===
// === Initialize on Page Load ===
document.addEventListener('DOMContentLoaded', async () => {
  await loadProductDetails();  // Wait for product to be fully loaded and rendered
  setupAddToCart();            // Then attach event listener to the rendered button
  updateCartCount();
  updateCartCount();
});
