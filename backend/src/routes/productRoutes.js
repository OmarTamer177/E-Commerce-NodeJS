const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new product
router.post("/", verifyToken, requireAdmin, async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: req.body.image,
            stock: req.body.stock
        });

        await newProduct.save();
        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a product
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, category, image, stock },
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a product
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a product to the cart (NOT TESTED)
router.post('/add-to-cart/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check if the product is already in the cart
        const existingCartItem = await CartItem.findOne({ user: req.user.id, product: product._id });
        if (existingCartItem) {
            existingCartItem.quantity += req.body.quantity || 1; // Increment quantity
            await existingCartItem.save();
            return res.json({ message: 'Product quantity updated in cart', cartItem: existingCartItem });
        }
        
        // get the cart for the user
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id });
            await cart.save();
        }

        // Add product to cart
        const cartItem = new CartItem({
            user: req.user.id, // Get user ID from token
            product: product._id,
            quantity: req.body.quantity || 1 // Default quantity to 1 if not provided
        });
        await cartItem.save();
        res.json({ message: 'Product added to cart successfully', product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;