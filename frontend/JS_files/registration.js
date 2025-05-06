document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('profileImage');
    const preview = document.getElementById('preview');
    let uploadedImage = '';

    // Click to open file picker
    dropArea.addEventListener('click', () => fileInput.click());

    // Drag and drop handlers
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('hover');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('hover');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('hover');
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // File input change
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        handleFile(file);
    });

    function handleFile(file) {
        if (!file || !file.type.match('image.*')) {
            alert('Please select a valid image file');
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

    // Form submit handler
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

        let isValid = true;

        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'address1'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                document.getElementById(`${fieldId}Error`).style.display = 'block';
                isValid = false;
            }
        });

        const email = document.getElementById('email').value;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        }

        const password = document.getElementById('password').value;
        if (password && password.length < 6) {
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        }

        if (!isValid) return;

        const formData = {
            name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
            email: email,
            password: password,
            address: document.getElementById('address1').value,
            role: 'customer'
        };
        console.log(formData)

        try {
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok) {
                alert('Registration successful! You can now log in.');
                window.location.href = '/login.html';
            } else {
                if (data?.error?.includes('email')) {
                    document.getElementById('emailError').textContent = 'This email is already registered';
                    document.getElementById('emailError').style.display = 'block';
                } else {
                    alert('Registration failed: ' + (data.error || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('An error occurred during registration. Please check the console for more details.');
        }
    });

    // Email validation
    document.getElementById('email').addEventListener('blur', function() {
        const email = this.value;
        const emailError = document.getElementById('emailError');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailError.style.display = 'block';
        } else {
            emailError.style.display = 'none';
        }
    });

    // Password validation
    document.getElementById('password').addEventListener('input', function() {
        const passwordError = document.getElementById('passwordError');
        if (this.value.length > 0 && this.value.length < 6) {
            passwordError.style.display = 'block';
        } else {
            passwordError.style.display = 'none';
        }
    });
});
