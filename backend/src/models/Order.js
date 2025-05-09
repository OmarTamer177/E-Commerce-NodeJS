const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_number: String,
  price: Number,
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  status: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']
  },
  payment_method: {
    type: String,
    enum: ['cash_on_delivery', 'credit_card', 'debit_card', 'paypal'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
