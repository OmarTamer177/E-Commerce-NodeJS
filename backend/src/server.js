// Load .env file
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './../../.env') });

// import express and database service
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require('./db.js');

// import Database tables
const User = require("./models/User.js");
const Product = require("./models/Product.js");
const Order = require("./models/Order.js");
const Cart = require("./models/Cart.js");
const CartItem = require("./models/CartItem.js");
const Review = require("./models/Review.js");
const Coupon = require("./models/Coupon.js");

// Connect to database
connectDB();

// App created
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);
app.use('/products', productRoutes);


app.get("/", (req, res) => {
    res.send("<h1>Welcome to our E-Commerce!!</h1>")
})


// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening to Port ${PORT}...`);
});