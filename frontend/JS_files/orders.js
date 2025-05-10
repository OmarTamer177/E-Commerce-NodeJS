document.addEventListener("DOMContentLoaded", async () => {
    const ordersList = document.getElementById("ordersList");
    const errorMessage = document.getElementById("errorMessage");
    const token = localStorage.getItem("token");
  
    if (!token) {
      ordersList.innerHTML = "Please log in to view your orders.";
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8000/api/orders/user-orders", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch orders.");
      }
  
      const data = await response.json();
      const orders = data.orders;
  
      if (!orders || orders.length === 0) {
        ordersList.innerHTML = "<p>No orders found.</p>";
        return;
      }
  
      ordersList.innerHTML = "";
  
      orders.forEach(order => {
        const card = document.createElement("div");
        card.className = "order-card";
  
        const header = `
          <div class="order-header">
            <span>Order No: ${order.order_number}</span>
            <span>Status: ${order.status}</span>
          </div>
        `;
  
        const productsHTML = order.items.map(item => `
          <p>${item.product} — Qty: ${item.quantity} — EGP ${item.price.toLocaleString()} 
          <br><small>Subtotal: EGP ${item.subtotal.toLocaleString()}</small></p>
        `).join("");
  
        // Determine button text and action based on payment method
        const isCashOnDelivery = order.payment_method === 'cash_on_delivery';
        const buttonText = isCashOnDelivery ? 'Cancel Order' : 'Request Refund';
        const buttonClass = isCashOnDelivery ? 'cancel-btn' : 'refund-btn';
  
        const body = `
          <div class="order-products">${productsHTML}</div>
          <p><strong>Total Price: EGP ${order.price.toLocaleString()}</strong></p>
          <button class="${buttonClass}" data-order-id="${order.order_id}">${buttonText}</button>
        `;
  
        card.innerHTML = header + body;
        ordersList.appendChild(card);
      });
  
      // Attach event listeners after rendering
      document.querySelectorAll('.refund-btn, .cancel-btn').forEach(button => {
        button.addEventListener('click', async () => {
          const orderId = button.getAttribute('data-order-id');
          const isCancelButton = button.classList.contains('cancel-btn');
          
          console.log(`${isCancelButton ? 'Cancelling' : 'Requesting refund for'} order:`, orderId);
          
          if (!orderId) {
            alert('Error: Order ID not found');
            return;
          }
  
          try {
            const endpoint = isCancelButton 
              ? `http://localhost:8000/api/orders/${orderId}/cancel`
              : 'http://localhost:8000/api/refunds/request';
            
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                orderId: orderId,
                reason: isCancelButton ? 'Order cancelled by customer' : 'Refund requested by customer'
              })
            });
  
            if (!response.ok) {
              const errorData = await response.json();
              console.error('Error response:', errorData);
              throw new Error(errorData.message || `Failed to ${isCancelButton ? 'cancel order' : 'request refund'}`);
            }
  
            const result = await response.json();
            console.log('Success:', result);
  
            alert(`${isCancelButton ? 'Order cancelled' : 'Refund request submitted'} successfully!`);
            button.disabled = true;
            button.textContent = isCancelButton ? 'Order Cancelled' : 'Refund Requested';
  
          } catch (error) {
            console.error('Error:', error);
            alert(`Failed to ${isCancelButton ? 'cancel order' : 'request refund'}: ${error.message}`);
          }
        });
      });
  
    } catch (e) {
      console.error("Orders error:", e);
      errorMessage.textContent = "Could not load your orders. Please try again later.";
    }
});
  
function requestRefund(orderId) {
    window.location.href = `refund?orderId=${orderId}`;
}
  