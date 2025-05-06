const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  category: String,
  size: {
    type: String,
    enum: ['S', 'M', 'L'],
    default: 'M'
  },
  img: {
    data: String,
    contentType: String,
  },
  isNew: {
    type: Boolean,
    default: false
  },  
  stock: Number
});

module.exports = mongoose.model('Product', productSchema);
