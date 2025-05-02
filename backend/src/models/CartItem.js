const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  cart_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  quantity: Number
});

module.exports = mongoose.model('CartItem', cartItemSchema);
