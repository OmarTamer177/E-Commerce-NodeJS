// orders.js

// Dummy order history
let orders = JSON.parse(localStorage.getItem('orders')) || [];

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) {
    alert('Please log in.');
    window.location.href = 'login.html';
    return;
  }

  const userOrders = orders.filter(order => order.email === user.email);

  const ordersTable = document.getElementById('ordersTable');
  ordersTable.innerHTML = '';

  if (userOrders.length === 0) {
    ordersTable.innerHTML = '<tr><td colspan="4" class="text-center">No orders yet.</td></tr>';
    return;
  }

  userOrders.forEach(order => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${order.id}</td>
      <td>${new Date(order.date).toLocaleDateString()}</td>
      <td>$${order.total.toFixed(2)}</td>
      <td>${order.status}</td>
    `;

    ordersTable.appendChild(row);
  });
});
