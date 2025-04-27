// auth.js

// Dummy users database
let users = JSON.parse(localStorage.getItem('users')) || [];

// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      alert('Login successful!');
      window.location.href = 'index.html';
    } else {
      alert('Invalid credentials.');
    }
  });
}

// Handle Register
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      alert('Email already registered.');
    } else {
      const newUser = { name, email, password, profilePic: '' };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      alert('Registration successful!');
      window.location.href = 'login.html';
    }
  });
}
