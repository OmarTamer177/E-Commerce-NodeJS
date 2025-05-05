document.addEventListener('DOMContentLoaded', function () {
  const editBtn = document.getElementById('editBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const address1 = document.getElementById('address1');
  const dob = document.getElementById('dob');
  const profileName = document.getElementById('profileName');
  const editProfileForm = document.getElementById('editProfileForm');

  // Fetch user data from server
  async function fetchUserData() {
    const token = localStorage.getItem("token");
    const response = await fetch('http://localhost:8000/api/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data;
  }

  // Set user data in form fields
  async function setUserData() {
    const userData = await fetchUserData();
    firstName.value = userData.user.name.split(" ")[0];
    lastName.value = userData.user.name.split(" ")[1] || "";
    email.value = userData.user.email;
    password.value = userData.user.password;
    address1.value = userData.user.address;
    profileName.textContent = `${firstName.value} ${lastName.value}`;
  }

  // Set data on page load
  setUserData();

  // Toggle edit mode
  editBtn.addEventListener('click', function () {
    const isDisabled = firstName.disabled;

    firstName.disabled = !isDisabled;
    lastName.disabled = !isDisabled;
    password.disabled = !isDisabled;
    address1.disabled = !isDisabled;
    dob.disabled = !isDisabled;

    if (isDisabled) {
      editBtn.textContent = 'Save Changes';
    } else {
      editBtn.textContent = 'Edit Profile';
      saveProfile();
    }
  });

  // Save profile to backend
  async function saveProfile() {
    if (validateForm()) {
      const updatedUserData = {
        name: `${firstName.value} ${lastName.value}`,
        email: email.value,
        address: address1.value
      };

      const token = localStorage.getItem("token");

      const response = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedUserData)
      });

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile.');
      }
    }
  }

  // Validate input fields
  function validateForm() {
    let isValid = true;
    clearErrors();

    if (!firstName.value.trim()) {
      showError(firstName, 'First name is required');
      isValid = false;
    }

    if (!lastName.value.trim()) {
      showError(lastName, 'Last name is required');
      isValid = false;
    }

    if (!password.value.trim() || password.value.length < 6) {
      showError(password, 'Password must be at least 6 characters');
      isValid = false;
    }

    if (!address1.value.trim()) {
      showError(address1, 'Address is required');
      isValid = false;
    }

    return isValid;
  }

  function showError(input, message) {
    const errorMessage = input.nextElementSibling;
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }

  function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(errorMessage => {
      errorMessage.style.display = 'none';
    });
  }

  // Prevent default form submission
  editProfileForm.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  // Logout handler
  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('token');
    window.location.href = '../Html_files/home.html'; // Adjust to your login page
  });
});
