// Toggle login sidebar
function toggleLogin() {
    const loginSidebar = document.getElementById('loginSidebar');
    loginSidebar.classList.toggle('show');
    
    // Close cart if open
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar.classList.contains('show')) {
      cartSidebar.classList.remove('show');
    }
  }
  
  // Update user icon click event
  document.querySelector('.navbar-right a[href="login.html"]').addEventListener('click', function(e) {
    e.preventDefault();
    toggleLogin();
  });
  
  // Login form submission
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Login successful
        alert('Login successful!');
        window.location.reload();
      } else {
        alert('Login failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during login. Please try again.');
    }
  });