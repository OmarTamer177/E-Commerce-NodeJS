const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  percentage: Number
});

module.exports = mongoose.model('Coupon', couponSchema);
