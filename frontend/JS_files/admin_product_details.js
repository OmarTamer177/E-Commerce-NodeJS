document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
  
    if (!productId) {
      alert("No product ID specified.");
      return;
    }
  
    const token = localStorage.getItem('token');
  
    async function loadProduct() {
      try {
        const response = await fetch(`http://localhost:8000/api/products/${productId}`);
        if (!response.ok) throw new Error("Product not found");
  
        const product = await response.json();
        document.getElementById('name').value = product.name;
        document.getElementById('description').value = product.description;
        document.getElementById('price').value = product.price;
        document.getElementById('gender').value = product.gender;
        document.getElementById('category').value = product.category;
        document.getElementById('size').value = product.size;
        document.getElementById('isNew').value = product.isNew;
        document.getElementById('stock').value = product.stock;
  
      } catch (err) {
        alert("Failed to load product: " + err.message);
      }
    }
  
    document.getElementById('product-form').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const updatedProduct = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        gender: document.getElementById('gender').value,
        category: document.getElementById('category').value,
        size: document.getElementById('size').value,
        isNew: document.getElementById('isNew').value === 'true',
        stock: parseInt(document.getElementById('stock').value),
      };
  
      try {
        const response = await fetch(`http://localhost:8000/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedProduct)
        });
  
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }
  
        alert("Product updated successfully!");
      } catch (err) {
        alert("Failed to update product: " + err.message);
      }
    });
  
    document.getElementById('delete-btn').addEventListener('click', async () => {
      if (!confirm("Are you sure you want to delete this product?")) return;
  
      try {
        const response = await fetch(`http://localhost:8000/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }
  
        alert("Product deleted successfully!");
        window.location.href = "admin";
        window.close(); // close the tab
      } catch (err) {
        alert("Failed to delete product: " + err.message);
      }
    });
  
    loadProduct();
  });
  