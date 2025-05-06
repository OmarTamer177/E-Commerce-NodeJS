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
  
});
