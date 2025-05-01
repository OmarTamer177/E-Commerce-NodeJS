// checkout.js

const dummyProducts = [
    { id: '1', name: 'Laptop', description: 'A high-performance laptop.', price: 999.99, image: 'https://via.placeholder.com/300x200?text=Laptop' },
    { id: '2', name: 'Smartphone', description: 'Latest model smartphone.', price: 699.99, image: 'https://via.placeholder.com/300x200?text=Smartphone' },
    { id: '3', name: 'Headphones', description: 'Noise-cancelling headphones.', price: 199.99, image: 'https://via.placeholder.com/300x200?text=Headphones' }
  ];
  
  document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkoutForm');
  
    if (!checkoutForm) return;
  
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        alert('You must be logged in to place an order.');
        window.location.href = 'login.html';
        return;
      }
  
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
  
      let total = 0;
      cart.forEach(productId => {
        const product = dummyProducts.find(p => p.id === productId);
        if (product) {
          total += product.price;
        }
      });
  
      const newOrder = {
        id: 'ORD-' + Math.floor(Math.random() * 100000),
        email: user.email,
        date: new Date().toISOString(),
        total: total,
        status: 'Pending',
        items: cart
      };
  
      let orders = JSON.parse(localStorage.getItem('orders')) || [];
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
  
      // Clear the cart after placing order
      localStorage.removeItem('cart');
  
      alert('Order placed successfully! Thank you for shopping.');
      window.location.href = 'orders.html';
    });
  });
  