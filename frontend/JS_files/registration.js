document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
        
        // Validate form
        let isValid = true;
        
        // Required fields validation
        const requiredFields = [
            'firstName', 'lastName', 'email', 'password', 
            'address1', 'town', 'postcode'
        ];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                document.getElementById(`${fieldId}Error`).style.display = 'block';
                isValid = false;
            }
        });
        
        // Email validation
        const email = document.getElementById('email').value;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        }
        
        // Password validation
        const password = document.getElementById('password').value;
        if (password && password.length < 6) {
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        // Prepare data for submission
        const formData = {
            name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            address: [
                document.getElementById('address1').value,
                document.getElementById('address2').value,
                document.getElementById('town').value,
                document.getElementById('postcode').value
            ].filter(Boolean).join(', '),
            title: document.getElementById('title').value,
            dob: document.getElementById('dob').value,
            newsletter: document.querySelector('input[name="newsletter"]:checked').value === 'true',
            partnerOffers: document.querySelector('input[name="partnerOffers"]:checked').value === 'true',
            role: 'customer' // Default role as per your schema
        };
        
        try {
            // Send data to backend
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Registration successful
                alert('Registration successful! You can now log in.');
                window.location.href = '/login.html'; // Redirect to login page
            } else {
                // Handle errors from server
                if (data.error.includes('email')) {
                    document.getElementById('emailError').textContent = 'This email is already registered';
                    document.getElementById('emailError').style.display = 'block';
                } else {
                    alert('Registration failed: ' + data.error);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    });
    
    // Real-time validation for email
    document.getElementById('email').addEventListener('blur', function() {
        const email = this.value;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            document.getElementById('emailError').style.display = 'block';
        } else {
            document.getElementById('emailError').style.display = 'none';
        }
    });
    
    // Real-time validation for password
    document.getElementById('password').addEventListener('input', function() {
        if (this.value.length > 0 && this.value.length < 6) {
            document.getElementById('passwordError').style.display = 'block';
        } else {
            document.getElementById('passwordError').style.display = 'none';
        }
    });
});