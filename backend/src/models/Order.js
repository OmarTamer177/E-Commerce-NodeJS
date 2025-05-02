const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_number: String,
  price: Number,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('Order', orderSchema);
