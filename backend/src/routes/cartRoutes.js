const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Coupon = require('../models/Coupon');
const OrderItem = require('../models/OrderItem');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get cart items
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from token
        const cart = await Cart.findOne({ user_id: userId });
        console.log(cart);
        const cartId = cart._id;
        const cartItems = await CartItem.find({ cart_id: cartId }).populate('product_id');

        const formattedCart = cartItems.map(item => ({
            _id: item._id,
            quantity: item.quantity,
            product: {
                _id: item.product_id._id,
                name: item.product_id.name,
                price: item.product_id.price,
                description: item.product_id.description,
                category: item.product_id.category,
                size: item.product_id.size,
                stock: item.product_id.stock,
                img: item.product_id.img,
            }
        }));

        res.json(formattedCart);
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

// Checkout cart
router.post('/checkout', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from token
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Check if the cart is empty
        const cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');
        if (!cartItems) return res.status(400).json({ message: 'Cart is empty' });

        // Calculate total price
        const price = cartItems.reduce((total, item) => {
            return total + (item.product_id?.price || 0) * item.quantity;
        }, 0);
        price = price + (price * 0.14) + 85; // Add 14% tax + shipping cost
        
        let discount = 0;
        // Add a copoun code if provided
        const couponCode = req.body.code;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode });
            if (!coupon) return res.status(400).json({ message: 'Invalid coupon code' });
            discount = (coupon.percentage / 100);
        }

        // Create an order
        const order = new Order({
            user_id: userId,
            price: price * (1 - discount),  
            status: 'Pending',
            order_number: `ORD-${Date.now()}`
        });

        await order.save();
        
        // Move the cart items to the order items
        for (const item of cartItems) {
            await OrderItem.create({
                order_id: order._id,
                product_id: item.product_id,
                quantity: item.quantity
            });

            // Reduce the stock of the product here
            const product = await Product.findById(item.product_id);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            }
        }

        // For now, we'll just clear the cart
        await CartItem.deleteMany({ cart_id: cart._id });
        res.json({ message: 'Checkout successful, cart cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;