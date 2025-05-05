const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Coupon = require('../models/Coupon');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new coupon
router.post('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { code, percentage } = req.body;
        const newCoupon = new Coupon({ code, percentage });
        await newCoupon.save();
        res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all coupons
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single coupon by ID
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a coupon
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { code, percentage } = req.body;
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { code, percentage },
            { new: true }
        );
        if (!updatedCoupon) return res.status(404).json({ message: 'Coupon not found' });
        res.json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a coupon
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = router;