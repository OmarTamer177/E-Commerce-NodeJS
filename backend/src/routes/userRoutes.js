const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Please login to view your profile.' });
    }
  
    // Don't send sensitive data like password
    const { _id, name, email, address, role } = req.user;
    res.status(200).json({
      message: 'User profile retrieved successfully',
      user: {
        id: _id,
        name,
        email,
        address,
        role,
      },
    });
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, email, address } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, email, address },
            { new: true }
        ).select('-password'); // Exclude password from the response

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from the response
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single user by ID
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Exclude password from the response
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a user
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id).select('-password'); // Exclude password from the response
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;