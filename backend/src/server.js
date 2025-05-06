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

// Middleware to serve static files from the public directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
const { verifyToken, requireAdmin } = require('./middleware/authMiddleware.js');

// Routes "Endpoints"
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const couponRoutes = require('./routes/couponRoutes');
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);

// Admin page
app.get('/api/admin/check', verifyToken, requireAdmin, (req, res) => {
    res.json({ message: 'Authorized admin' });
  });
  

app.get("/admin", (req, res) => {
    console.log("Admin page accessed");
    res.sendFile(path.join(__dirname, '../../frontend/Html_files', 'admin.html'));
})


// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/Html_files', 'home.html'));
});


app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, '../frontend/Html_files', `${page}.html`);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('Page not found');
        }
    });
});

// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening to Port ${PORT}...`);
});