document.addEventListener('DOMContentLoaded', function () {
    const editBtn = document.getElementById('editBtn');
    const form = document.getElementById('editProfileForm');
  
    // Enable form fields on edit
    editBtn.addEventListener('click', () => {
      form.querySelectorAll('input:not([type="email"])').forEach(input => {
        input.disabled = false;
      });
    });
  
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      // Reset errors
      document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
      });
  
      let isValid = true;
  
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'password', 'address'];
      requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
          document.getElementById(`${fieldId}Error`).style.display = 'block';
          isValid = false;
        }
      });
  
      // Password check
      const password = document.getElementById('password').value;
      if (password && password.length < 6) {
        document.getElementById('passwordError').style.display = 'block';
        isValid = false;
      }
  
      if (!isValid) return;
  
      const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        password: document.getElementById('password').value,
        address: document.getElementById('address1').value,
      };
  
      try {
        const response = await fetch('http://localhost:8000/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert('Profile updated successfully!');
          window.location.reload();
        } else {
          alert('Update failed: ' + data.error);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong.');
      }
    });
  });
  