document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('image');
    const preview = document.getElementById('preview');
    const saveButton = document.getElementById('save-product');
    let uploadedImage = '';
  
    // File upload handlers
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
  
    // Save product handler
    saveButton.addEventListener('click', saveProduct);
  
    function handleFile(file) {
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }
  
      const reader = new FileReader();
      reader.onload = function(e) {
        uploadedImage = e.target.result;
        preview.src = uploadedImage;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  
    function saveProduct() {
      const product = {
        id: Date.now(),
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        quantity: parseInt(document.getElementById('quantity').value),
        category: document.getElementById('category').value,
        type: document.getElementById('type').value,
        isNew: document.getElementById('isNew').value === 'true',
        image: uploadedImage
      };
  
      // Validation
      if (!product.name || isNaN(product.price) || isNaN(product.quantity) || !product.image) {
        alert("Please fill in all required fields and upload an image.");
        return;
      }
  
      // Save to localStorage
      const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
      products.push(product);
      localStorage.setItem('adminProducts', JSON.stringify(products));
      
      alert('Product added successfully!');
      resetForm();
    }
  
    function resetForm() {
      document.getElementById('name').value = '';
      document.getElementById('price').value = '';
      document.getElementById('quantity').value = '';
      document.getElementById('type').value = '';
      preview.src = '';
      preview.style.display = 'none';
      uploadedImage = '';
    }
  });