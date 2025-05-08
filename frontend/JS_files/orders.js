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
  
        const body = `
          <div class="order-products">${productsHTML}</div>
          <p><strong>Total Price: EGP ${order.price.toLocaleString()}</strong></p>
          <button class="refund-btn" data-id="${order.order_id}">Request Refund</button>
        `;
  
        card.innerHTML = header + body;
        ordersList.appendChild(card);
      });
  
      // ✅ Attach event listeners *after* rendering
      document.querySelectorAll('.refund-btn').forEach(button => {
        button.addEventListener('click', async () => {
          const orderId = button.getAttribute('data-id');
  
          try {
            const res = await fetch('http://localhost:8000/api/orders/request-refund', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ order_id: orderId })
            });
  
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || 'Refund failed');
            }
  
            alert('Refund request sent successfully!');
            button.disabled = true;
            button.textContent = 'Refund Requested';
  
          } catch (err) {
            console.error(err);
            alert('An error occurred while requesting refund.');
          }
        });
      });
  
    } catch (e) {
      console.error("Orders error:", e);
      errorMessage.textContent = "Could not load your orders. Please try again later.";
    }
  });
  