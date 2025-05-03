const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Order = require('../models/Order');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user's orders
router.get('/user-orders', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from token
        const orders = await Order.find({ user: userId }).populate('products.product', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').populate('products.product', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single order by ID
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email').populate('products.product', 'name price');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Order status
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email').populate('products.product', 'name price');
        if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update order stock
router.put('/update-stock/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { products } = req.body; // Array of product IDs and quantities
        const order = await Order.findById(req.params.id).populate('products.product', 'name price stock');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        for (const item of order.products) {
            const product = products.find(p => p.product.toString() === item.product.toString());
            if (product) {
                item.product.stock -= product.quantity;
                await item.product.save();
            }
        }

        await order.save();
        res.json({ message: 'Stock updated successfully', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an order
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id).populate('user', 'name email').populate('products.product', 'name price');
        if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully', order: deletedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});