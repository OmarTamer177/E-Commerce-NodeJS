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
        console.log('Checkout request received:', req.body); // Add logging
        const userId = req.user.id;
        const { paymentMethod, cardDetails, paypalEmail } = req.body;

        // Validate payment method
        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }

        // Map frontend payment method to backend format
        const paymentMethodMap = {
            'cod': 'cash_on_delivery',
            'credit_card': 'credit_card',
            'debit_card': 'debit_card',
            'paypal': 'paypal'
        };

        const backendPaymentMethod = paymentMethodMap[paymentMethod];
        if (!backendPaymentMethod) {
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        // Validate payment details based on method
        if (backendPaymentMethod === 'credit_card' || backendPaymentMethod === 'debit_card') {
            if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
                return res.status(400).json({ message: 'Card details are required' });
            }
        } else if (backendPaymentMethod === 'paypal') {
            if (!paypalEmail) {
                return res.status(400).json({ message: 'PayPal email is required' });
            }
        }

        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            console.log('Cart not found for user:', userId);
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Check if the cart is empty
        const cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');
        if (!cartItems || cartItems.length === 0) {
            console.log('Cart is empty for user:', userId);
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total price
        let price = cartItems.reduce((total, item) => {
            return total + (item.product_id?.price || 0) * item.quantity;
        }, 0);
        price = price + (price * 0.14) + 85; // Add 14% tax + shipping cost
        
        let discount = 0;
        // Add a coupon code if provided
        const couponCode = req.body.discountCode;
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
            order_number: `ORD-${Date.now()}`,
            payment_method: backendPaymentMethod
        });

        console.log('Creating order:', order); // Add logging
        await order.save();
        
        // Move the cart items to the order items
        for (const item of cartItems) {
            await OrderItem.create({
                order_id: order._id,
                product_id: item.product_id,
                quantity: item.quantity
            });

            // Reduce the stock of the product
            const product = await Product.findById(item.product_id);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            }
        }

        // Clear the cart
        await CartItem.deleteMany({ cart_id: cart._id });

        // Return success response with order details
        res.json({ 
            message: 'Checkout successful', 
            order: {
                id: order._id,
                order_number: order.order_number,
                total: order.price,
                status: order.status
            }
        });

    } catch (error) {
        console.error('Checkout error:', error); // Add detailed error logging
        res.status(500).json({ 
            message: 'Payment processing failed',
            error: error.message,
            stack: error.stack // Include stack trace for debugging
        });
    }
});

module.exports = router;