// Utility: Extract product ID from URL
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

let selectedRating = 0; // Global rating value

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
        <div class="product-price"><p>Price: EGP ${product.price.toLocaleString()}</p></div>
        <div class="size-options"><div class="size-title">SIZE :</div><div class="size-title">${product.size}</div></div>
        <div class="stock"><div class="size-title">STOCK :</div><div class="size-title">${product.stock}</div></div>
        <div class="quantity-cart">
          <div class="quantity-selector">
            <button class="quantity-btn">-</button>
            <input type="text" class="quantity-value" value="1">
            <button class="quantity-btn">+</button>
          </div>
          <button class="add-to-cart">Add to cart</button>
        </div>
        <div class="payment-info"><p>Secure online payment</p></div>
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

        <div class="submit-review">
          <textarea id="review-comment" placeholder="Write your review here..."></textarea>
          <div class="star-rating">
            <span class="star" data-value="1">★</span>
            <span class="star" data-value="2">★</span>
            <span class="star" data-value="3">★</span>
            <span class="star" data-value="4">★</span>
            <span class="star" data-value="5">★</span>
          </div>
          <button id="submit-review">Submit Review</button>
        </div>
      </div>
    `;

    setupReviewStars();
    document.getElementById('submit-review').addEventListener('click', handleSubmitReview);

  } catch (err) {
    alert('Error loading product details: ' + err.message);
  }
}

// Handle review submission
async function handleSubmitReview() {
  const review = document.getElementById('review-comment').value.trim();
  const rating = selectedRating;
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
      body: JSON.stringify({ rating, review })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to submit review.');
    }

    alert('Review submitted!');
    loadProductDetails(); // Refresh
  } catch (err) {
    alert(err.message);
  }
}

// Setup review star selection
function setupReviewStars() {
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    const value = parseInt(star.getAttribute('data-value'));

    star.addEventListener('mouseover', () => {
      stars.forEach(s => s.classList.toggle('hover', parseInt(s.getAttribute('data-value')) <= value));
    });

    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });

    star.addEventListener('click', () => {
      selectedRating = value;
      stars.forEach(s => s.classList.toggle('selected', parseInt(s.getAttribute('data-value')) <= selectedRating));
    });
  });
}

// Add to cart functionality
function setupAddToCart() {
  document.querySelector('.product-container').addEventListener('click', async (e) => {
    if (!e.target.classList.contains('add-to-cart')) return;

    const product = JSON.parse(localStorage.getItem('currentProduct'));
    if (!product || !product._id) return alert('Product not found.');

    const qty = parseInt(document.querySelector('.quantity-value').value) || 1;
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in to add to cart.');

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
      updateCartCount();
    } catch (error) {
      console.error('Add to cart error:', error);
      alert(`Error: ${error.message}`);
    }
  });
}

// Update cart count in navbar
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  // You can update your navbar here with the count
}

// Quantity selector logic
function setupQuantityButtons() {
  document.querySelector('.product-container').addEventListener('click', (e) => {
    const input = document.querySelector('.quantity-value');
    if (!input) return;

    if (e.target.textContent === '+') {
      input.value = parseInt(input.value || '1') + 1;
    } else if (e.target.textContent === '-') {
      const current = parseInt(input.value);
      input.value = current > 1 ? current - 1 : 1;
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadProductDetails();
  setupAddToCart();
  setupQuantityButtons();
  updateCartCount();
});
