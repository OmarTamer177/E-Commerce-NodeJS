const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user's orders
router.get('/user-orders', verifyToken, async (req, res) => {
    try {
        
        const userId = req.user.id;
        const orders = await Order.find({ user_id: userId });
        
        
        const ordersData = [];

        for (const order of orders) {
        const orderItems = await OrderItem.find(
            { order_id: order._id },
            '-order_id -_id -__v'
        ).populate('product_id', 'name price');

        const formattedItems = orderItems.map(item => ({
            product: item.product_id?.name,
            price: item.product_id?.price,
            quantity: item.quantity,
            subtotal: (item.product_id?.price || 0) * item.quantity
        }));

        const total = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);

        ordersData.push({
            order_id: order._id,
            order_number: order.order_number,
            price: total,
            items: formattedItems,
            status: order.status,
            payment_method: order.payment_method
        });
        }

        res.json({ orders: ordersData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
      const orders = await Order.find().populate('user_id', 'name email');
  
      const ordersData = [];
  
      for (const order of orders) {
        const orderItems = await OrderItem.find(
          { order_id: order._id },
          '-order_id -_id -__v'
        ).populate('product_id', 'name price');
  
        const formattedItems = orderItems.map(item => ({
          product: item.product_id?.name,
          price: item.product_id?.price,
          quantity: item.quantity,
          subtotal: (item.product_id?.price || 0) * item.quantity
        }));
  
        const total = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);
  
        ordersData.push({
          _id: order._id,
          order_number: order.order_number,
          user: {
            name: order.user_id?.name,
            email: order.user_id?.email
          },
          price: total,
          items: formattedItems,
          status: order.status,
          payment_method: order.payment_method,
          refund_reason: order.refund_reason,
          createdAt: order.createdAt
        });
      }
  
      res.json({ orders: ordersData });
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
        );
        if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order updated successfully', order: updatedOrder });
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

// Add this new route for order cancellation
router.post('/:id/cancel', verifyToken, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user_id: req.user.id
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow cancellation if payment method is cash on delivery
        if (order.payment_method !== 'cash_on_delivery') {
            return res.status(400).json({ 
                message: 'Only cash on delivery orders can be cancelled. For other payment methods, please request a refund.' 
            });
        }

        // Only allow cancellation if order is not already delivered or cancelled
        if (['Delivered', 'Cancelled', 'Refunded'].includes(order.status)) {
            return res.status(400).json({ 
                message: 'Cannot cancel an order that is already delivered, cancelled, or refunded' 
            });
        }

        order.status = 'Cancelled';
        await order.save();

        res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling order', error: error.message });
    }
});

module.exports = router;