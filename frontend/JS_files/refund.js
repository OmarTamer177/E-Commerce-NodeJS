document.addEventListener('DOMContentLoaded', async () => {
    const refundForm = document.getElementById('refundForm');
    const orderInfo = document.getElementById('orderInfo');
    const errorMessage = document.getElementById('errorMessage');
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (!orderId) {
        errorMessage.textContent = 'No order specified';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        // Fetch order details
        const response = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        const order = await response.json();
        
        // Display order details
        orderInfo.innerHTML = `
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> EGP ${order.totalAmount}</p>
            <p><strong>Status:</strong> ${order.status}</p>
        `;

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    }

    // Handle refund form submission
    refundForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const reason = document.getElementById('reason').value;

        try {
            const response = await fetch('http://localhost:8000/api/refunds/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId,
                    reason
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit refund request');
            }

            alert('Refund request submitted successfully');
            window.location.href = 'orders.html';

        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
}); 