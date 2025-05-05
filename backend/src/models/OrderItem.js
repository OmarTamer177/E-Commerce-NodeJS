const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  quantity: Number
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
