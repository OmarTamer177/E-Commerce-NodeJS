const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get cart items
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from token
        const cart = await Cart.findOne({ user_id: userId });
        console.log(cart);
        const cartId = cart._id;
        const cartItems = await CartItem.find({ cart_id: cartId });
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete cart item
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const cartItem = await CartItem.findByIdAndDelete(req.params.id);
        if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });
        res.json({ message: 'Cart item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Increment cart item quantity
router.put('/increment/:id', verifyToken, async (req, res) => {
    try {
        const cartItem = await CartItem.findById(req.params.id);
        if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });
        
        cartItem.quantity += 1;
        await cartItem.save();
        
        res.json({ message: 'Cart item quantity incremented successfully', cartItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Decrement cart item quantity
router.put('/decrement/:id', verifyToken, async (req, res) => {
    try {
        const cartItem = await CartItem.findById(req.params.id);
        if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });
        
        if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;
            await cartItem.save();
            res.json({ message: 'Cart item quantity decremented successfully', cartItem });
        } else {
            res.status(400).json({ message: 'Quantity cannot be less than 1' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;