// profile.js

// Load profile
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
  
    if (!user) {
      alert('Please log in.');
      window.location.href = 'login.html';
      return;
    }
  
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    if (user.profilePic) {
      document.getElementById('profileImage').src = user.profilePic;
    }
  });
  
  // Update profile
  document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    let user = JSON.parse(localStorage.getItem('loggedInUser'));
  
    user.name = document.getElementById('name').value;
    user.profilePic = document.getElementById('profilePic').value;
  
    // Update in users array
    let users = JSON.parse(localStorage.getItem('users'));
    users = users.map(u => u.email === user.email ? user : u);
  
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(user));
  
    alert('Profile updated!');
    location.reload();
  });
  