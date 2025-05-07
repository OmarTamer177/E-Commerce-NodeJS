document.addEventListener('DOMContentLoaded', function () {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('image');
  const preview = document.getElementById('preview');
  const saveButton = document.getElementById('save-product');
  const productList = document.getElementById('product-list');

  let uploadedImage = '';

  // Sidebar section switch
  window.showSection = function (sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
      section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    if (sectionId === 'view-products') displayProducts();
    else if (sectionId === 'manage-users') handleManageUsers();
    else if (sectionId === 'view-orders') displayOrders(); 
    else if (sectionId === 'manage-coupons') displayCoupons(); 
    else if (sectionId === 'manage-reviews') loadProductsForReview(); 

    
  };

  // Drag and drop events
  dropArea.addEventListener('click', () => fileInput.click());

  dropArea.addEventListener('dragover', e => {
    e.preventDefault();
    dropArea.classList.add('hover');
  });

  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('hover'));

  dropArea.addEventListener('drop', e => {
    e.preventDefault();
    dropArea.classList.remove('hover');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    handleFile(file);
  });

  saveButton.addEventListener('click', saveProduct);

  function handleFile(file) {
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      uploadedImage = e.target.result;
      preview.src = uploadedImage;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  async function saveProduct() {
    const product = {
      name: document.getElementById('name').value,
      price: parseFloat(document.getElementById('price').value),
      stock: parseInt(document.getElementById('quantity').value),
      category: document.getElementById('category').value,
      gender: document.getElementById('gender').value,
      description: document.getElementById('description').value,
      size: document.getElementById('size').value,
      isNew: document.getElementById('isNew').value === 'true',
      image: uploadedImage ? { data: uploadedImage.split(',')[1], contentType: 'image/jpeg' } : undefined // Ensuring correct format for backend
    };

    if (!product.name || isNaN(product.price) || isNaN(product.stock)) {
      alert("Please fill in all required fields.");
      return;
    }

    const token = localStorage.getItem('token'); // You must store the token after login
    if (!token) {
      alert("No authorization token found.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error ${response.status}: ${error}`);
      }

      alert('Product added successfully to backend!');
      resetForm();

    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to add product: ' + error.message);
    }
  }

  function resetForm() {
    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('type').value = '';
    document.getElementById('description').value = '';
    document.getElementById('size').value = '';
    preview.src = '';
    preview.style.display = 'none';
    uploadedImage = '';
  }

  async function displayProducts() {
    productList.innerHTML = '';
  
    try {
      const response = await fetch('http://localhost:8000/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
  
      const products = await response.json();
  
      if (!Array.isArray(products) || products.length === 0) {
        productList.innerHTML = '<li>No products found.</li>';
        return;
      }
  
      products.forEach(product => {
        const item = document.createElement('li');
        item.innerHTML = `
          <a href="admin_product_details.html?id=${product._id}" style="text-decoration:none; color:inherit;">
            <strong>${product.name}</strong> - $${product.price.toFixed(2)} (${product.stock} pcs)<br/>
            <em>${product.description}</em><br/>
            <strong>Size:</strong> ${product.size}<br/>
            <img src="data:${product.img.contentType};base64,${product.img.data}" width="100" />
          </a>
          <hr/>
        `;

        productList.appendChild(item);
      });
  
    } catch (error) {
      productList.innerHTML = `<li>Error loading products: ${error.message}</li>`;
    }
  }
  
  function addUser() {
    const email = document.getElementById('user-email').value;
    const role = document.getElementById('user-role').value;

    if (!email) {
      alert('Please enter user email.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('adminUsers')) || [];
    users.push({ email, role });
    localStorage.setItem('adminUsers', JSON.stringify(users));

    alert('User added successfully!');
    document.getElementById('user-email').value = '';
  }

  function handleManageUsers() {
    const token = localStorage.getItem("token");
    const manageUsersSection = document.getElementById("manage-users");
    manageUsersSection.style.display = "block";
  
    const usersList = document.getElementById("users-list");
    usersList.innerHTML = "<p>Loading users...</p>";
  
    fetch("http://localhost:8000/api/users/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((users) => {
        usersList.innerHTML = "";
        users.forEach((user) => {
          const userCard = document.createElement("div");
          userCard.className = "product-card";
  
          userCard.innerHTML = `
          <h3>${user.name || "Unnamed User"}</h3>
          <p>Email: ${user.email}</p>
          <p>Role: ${user.role}</p>
          <button class="delete-btn">Delete</button>
        `;

        const deleteBtn = userCard.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteUser(user._id));

  
          usersList.appendChild(userCard);
        });
      })
      .catch((error) => {
        usersList.innerHTML = `<p style="color:red;">${error.message}</p>`;
      });
  }
  
  function deleteUser(userId) {
    const token = localStorage.getItem("token");
    const confirmed = confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;
  
    fetch(`http://localhost:8000/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete user");
        alert("User deleted successfully");
        handleManageUsers(); // Refresh list
      })
      .catch((err) => {
        console.error(err);
        alert("Error deleting user.");
      });
  }
  
  async function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = ''; // Clear previous content
  
    const token = localStorage.getItem('token');
    if (!token) {
      alert("No authorization token found.");
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
  
      const data = await response.json();
      const orders = data.orders;
  
      if (!Array.isArray(orders) || orders.length === 0) {
        ordersList.innerHTML = '<p>No orders found.</p>';
        return;
      }
  
      orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'product-card';
  
        const userName = order.user?.name || 'Unknown User';
        const userEmail = order.user?.email || 'N/A';
        const price = typeof order.price === 'number' ? order.price.toFixed(2) : '0.00';
  
        orderCard.innerHTML = `
          <h3>Order Number: ${order.order_number}</h3>
          <p><strong>User:</strong> ${userName} (${userEmail})</p>
          <p><strong>Total Price:</strong> $${price}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <button class="update-btn">Update Order Status</button>
        `;
  
        // Attach the event listener correctly
        const updateBtn = orderCard.querySelector('.update-btn');
        updateBtn.addEventListener('click', () => updateOrderStatus(order.order_id));
  
        ordersList.appendChild(orderCard);
      });
  
    } catch (error) {
      ordersList.innerHTML = `<p style="color:red;">Error loading orders: ${error.message}</p>`;
    }
  }
  
  
  // Function to handle updating the order status
  async function updateOrderStatus(orderId) {
    const newStatus = prompt('Enter the new status for the order (e.g., shipped, delivered):');
    if (!newStatus) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
      alert("No authorization token found.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error updating status: ${error}`);
      }
  
      alert('Order status updated successfully!');
      displayOrders();  // Refresh the orders list
  
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status: ' + error.message);
    }
  }
  
  async function displayCoupons() {
    const couponsList = document.getElementById('coupons-list');
    couponsList.innerHTML = ''; // Clear previous content
  
    const token = localStorage.getItem('token');
    if (!token) {
      alert("No authorization token found.");
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8000/api/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
  
      const coupons = await response.json();
  
      if (!Array.isArray(coupons) || coupons.length === 0) {
        couponsList.innerHTML = '<p>No coupons found.</p>';
        return;
      }
  
      coupons.forEach(coupon => {
        const couponCard = document.createElement('div');
        couponCard.className = 'product-card';
  
        couponCard.innerHTML = `
          <h3>Code: ${coupon.code}</h3>
          <p><strong>Discount:</strong> ${coupon.percentage}%</p>
          <button class="delete-coupon-btn" data-id="${coupon._id}">Delete</button>
        `;
  
        couponsList.appendChild(couponCard);
      });

      // Add delete event listeners
    document.querySelectorAll('.delete-coupon-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await deleteCoupon(id);
      });
    });
  
    } catch (error) {
      couponsList.innerHTML = `<p style="color:red;">Error loading coupons: ${error.message}</p>`;
    }
  }

  async function createCoupon(e) {
    e.preventDefault();
  
    const code = document.getElementById('coupon-code').value.trim();
    const percentage = parseInt(document.getElementById('coupon-percentage').value);
  
    if (!code || isNaN(percentage) || percentage < 1 || percentage > 100) {
      alert('Please enter a valid coupon code and discount percentage.');
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      alert("No authorization token found.");
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8000/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, percentage })
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error creating coupon: ${error}`);
      }
  
      document.getElementById('create-coupon-form').reset();
      displayCoupons();
  
    } catch (error) {
      alert(error.message);
    }
  }
  
  
  async function deleteCoupon(id) {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
      alert("No authorization token found.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8000/api/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error deleting coupon: ${error}`);
      }
  
      displayCoupons();
  
    } catch (error) {
      alert('Failed to delete coupon: ' + error.message);
    }
  }

  async function loadProductsForReview() {
    const token = localStorage.getItem('token');
    const productButtonsContainer = document.getElementById('product-buttons');
    productButtonsContainer.innerHTML = '';
  
    try {
      const res = await fetch('http://localhost:8000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!res.ok) throw new Error('Failed to fetch products');
  
      const products = await res.json();
  
      if (!Array.isArray(products) || products.length === 0) {
        productButtonsContainer.innerHTML = '<p>No products found.</p>';
        return;
      }
  
      products.forEach(product => {
        const btn = document.createElement('button');
        btn.className = 'product-select-btn';  // Style this in your CSS
        btn.textContent = product.name;
        btn.onclick = () => displayProductReviews(product._id);
        productButtonsContainer.appendChild(btn);
      });
    } catch (err) {
      productButtonsContainer.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
  }
  

  async function displayProductReviews(productId) {
    const token = localStorage.getItem('token');
    const reviewsList = document.getElementById('reviews-list');
    reviewsList.innerHTML = '';
  
    try {
      const res = await fetch(`http://localhost:8000/api/products/reviews/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!res.ok) throw new Error('Failed to fetch reviews');
  
      const reviews = await res.json();
  
      if (!Array.isArray(reviews) || reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews for this product.</p>';
        return;
      }
  
      reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'product-card';
  
        card.innerHTML = `
          <h4>${review.user?.name || 'Anonymous'} (${review.user?.email || 'N/A'})</h4>
          <p><strong>Rating:</strong> ${review.rating}</p>
          <p><strong>Comment:</strong> ${review.comment || 'No comment'}</p>
          <button class="delete-review-btn" data-id="${review._id}">Delete</button>
        `;
  
        reviewsList.appendChild(card);
      });
  
      document.querySelectorAll('.delete-review-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const reviewId = btn.getAttribute('data-id');
          await deleteReview(reviewId, productId);
        });
      });
  
    } catch (err) {
      reviewsList.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
  }
  
  

  async function deleteReview(reviewId, productId) {
    if (!confirm('Are you sure you want to delete this review?')) return;
  
    const token = localStorage.getItem('token');
  
    try {
      const res = await fetch(`http://localhost:8000/api/products/review/id/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error deleting review: ${errText}`);
      }
  
      alert('Review deleted.');
      displayProductReviews(productId); // Refresh reviews
  
    } catch (err) {
      alert('Failed to delete review: ' + err.message);
    }
  }
  
  

  document.getElementById('create-coupon-form').addEventListener('submit', createCoupon);  

});
