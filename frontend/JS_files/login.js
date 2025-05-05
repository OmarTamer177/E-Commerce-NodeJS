// Toggle Login Sidebar
function toggleLogin() {
  const loginSidebar = document.getElementById('loginSidebar');
  const cartSidebar = document.getElementById('cartSidebar');

  if (localStorage.getItem("isLoggedIn") !== "true") {
    loginSidebar.classList.toggle("show");
  } else {
    window.location.href = "user.html";
  }  
  
  if (cartSidebar && cartSidebar.classList.contains('show')) {
    cartSidebar.classList.remove('show');
  }
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  try {
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Login failed. Please try again.');
      return;
    }

    // Save token
    localStorage.setItem('token', data.token);
    alert('Login successful!');

    // Fetch user profile
    const profileRes = await fetch('http://localhost:8000/api/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.token}`
      }
    });


    if (profileRes.ok) {
      const profile = await profileRes.json();
      console.log('Welcome:', profile.user.name);

      // Optionally update UI with user's name
      const loginSidebar = document.getElementById('loginSidebar');
      if (loginSidebar) loginSidebar.classList.remove('show');
    }

    window.location.reload(); // Reload to reflect login status
  } catch (err) {
    console.error('Login error:', err);
    alert('An error occurred. Please try again.');
  }
});

// Auto display user name if already logged in
window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('http://localhost:8000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const profile = await response.json();
    }
  } catch (err) {
    console.error('Error auto-fetching user:', err);
  }
});
