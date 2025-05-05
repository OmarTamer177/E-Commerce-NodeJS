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
            status: order.status
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
      const orders = await Order.find().populate('user_id', 'name email'); // Assuming Order.user_id exists
  
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
          user: {
            name: order.user_id?.name,
            email: order.user_id?.email
          },
          price: total,
          items: formattedItems,
          status: order.status,
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

module.exports = router;