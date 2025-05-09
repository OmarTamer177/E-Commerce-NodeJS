const express = require('express');
const router = express.Router();
const Refund = require('../models/Refund');
const Order = require('../models/Order');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Request a refund
router.post('/request', verifyToken, async (req, res) => {
    try {
        console.log('Refund request received:', req.body); // Log request body
        console.log('User from token:', req.user); // Log user info

        const { orderId, reason } = req.body;
        
        // Check if order exists and belongs to user
        const order = await Order.findOne({ 
            _id: orderId,
            user_id: req.user.id
        });

        console.log('Found order:', order); // Log found order

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if refund already exists
        const existingRefund = await Refund.findOne({ order: orderId });
        console.log('Existing refund:', existingRefund); // Log existing refund

        if (existingRefund) {
            return res.status(400).json({ message: 'Refund already requested for this order' });
        }

        // Create refund request
        const refund = new Refund({
            order: orderId,
            user: req.user.id,
            amount: order.price,
            reason: reason || 'Refund requested by customer'
        });

        console.log('New refund object:', refund); // Log new refund object

        await refund.save();
        res.status(201).json({ message: 'Refund request submitted successfully', refund });
    } catch (error) {
        console.error('Detailed refund error:', error); // Log detailed error
        res.status(500).json({ 
            message: 'Error requesting refund', 
            error: error.message,
            stack: error.stack // Include stack trace for debugging
        });
    }
});

// Get user's refund requests
router.get('/my-refunds', verifyToken, async (req, res) => {
    try {
        const refunds = await Refund.find({ user: req.user._id })
            .populate('order')
            .sort({ createdAt: -1 });
        res.json(refunds);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching refunds', error: error.message });
    }
});

// Admin: Get all refund requests
router.get('/all', verifyToken, requireAdmin, async (req, res) => {
    try {
        const refunds = await Refund.find()
            .populate('order')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(refunds);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching refunds', error: error.message });
    }
});

// Admin: Update refund status
router.patch('/:refundId/status', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const refund = await Refund.findById(req.params.refundId);

        if (!refund) {
            return res.status(404).json({ message: 'Refund request not found' });
        }

        refund.status = status;
        refund.updatedAt = Date.now();
        await refund.save();

        // If refund is approved, update order status
        if (status === 'approved') {
            await Order.findByIdAndUpdate(refund.order, { status: 'refunded' });
        }

        res.json({ message: 'Refund status updated successfully', refund });
    } catch (error) {
        res.status(500).json({ message: 'Error updating refund status', error: error.message });
    }
});

module.exports = router; 