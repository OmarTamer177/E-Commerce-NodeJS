// Toggle Login Sidebar or Redirect to Profile
function toggleLogin() {
  const loginSidebar = document.getElementById('loginSidebar');
  const cartSidebar = document.getElementById('cartSidebar');

  const token = localStorage.getItem("token");

  if (!token) {
    // Not logged in — open login sidebar
    loginSidebar.classList.toggle("show");
  } else {
    // Token exists — verify with backend before redirecting
    fetch('http://localhost:8000/api/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) {
        window.location.href = "../Html_files/User.html";
      } else {
        localStorage.removeItem("token");
        loginSidebar.classList.toggle("show");
      }
    })
    .catch(err => {
      console.error('Verification failed:', err);
      localStorage.removeItem("token");
      loginSidebar.classList.toggle("show");
    });
  }

  if (cartSidebar && cartSidebar.classList.contains('show')) {
    cartSidebar.classList.remove('show');
  }
}

// Handle Login Form Submission
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

    // Save token to localStorage
    localStorage.setItem('token', data.token);
    alert('Login successful!');

    // Optionally fetch and confirm user profile
    const profileRes = await fetch('http://localhost:8000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${data.token}`
      }
    });

    if (profileRes.ok) {
      const profile = await profileRes.json();
      console.log('Logged in as:', profile.user.name);
      document.getElementById('loginSidebar').classList.remove('show');
      window.location.href = "../Html_files/User.html";
    } else {
      alert("Could not fetch profile after login.");
    }

  } catch (err) {
    console.error('Login error:', err);
    alert('An error occurred. Please try again.');
  }
});

// Auto Verify on Page Load (Optional for UI update)
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
      console.log('Welcome back,', profile.user.name);
      // You can update UI with username if needed
    } else {
      localStorage.removeItem("token");
    }
  } catch (err) {
    console.error('Auto-fetch user error:', err);
    localStorage.removeItem("token");
  }
});
