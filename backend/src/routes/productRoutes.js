const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Review = require('../models/Review');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new product
router.post("/", verifyToken, requireAdmin, async (req, res) => {
    try {
        // Check if a product with the same name already exists
        const existingProduct = await Product.findOne({ name: req.body.name });
        if (existingProduct) {
            return res.status(400).json({ message: "A product with this name already exists" });
        }
        
        const { name, description, price, gender, category, size, isNew, stock, image } = req.body;

        const newProduct = new Product({
            name,
            description,
            price,
            gender,
            category,
            size: size || "M",
            img: image ? {
                data: image.data,
                contentType: image.contentType,
            } : undefined,
            isNew: isNew === 'true' || isNew === true,
            stock,
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
        const { name, description, price, gender, category, size, image, isNew, stock } = req.body;

        // Check if the image is provided and process it correctly
        const processedImage = image ? {
            data: image.data.split(',')[1], // Removing base64 header part
            contentType: 'image/jpeg', // or dynamically detect the contentType
        } : undefined;
  

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, gender, category, size, image: processedImage, isNew, stock },
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

// Add a product to the cart
router.post('/add-to-cart/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Get the cart for the user
        let cart = await Cart.findOne({ user_id: req.user.id });
        if (!cart) {
            console.log("No cart found, creating a new one");
            cart = new Cart({ user_id: req.user.id });
            await cart.save();
        }

        // Check if the product quantity is in stock
        if (req.body.quantity > product.stock) {
            return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
        }
        
        // Check if the product is already in the cart
        const existingCartItem = await CartItem.findOne({ cart_id: cart._id, product_id: product._id });
        if (existingCartItem) {
            
            if (existingCartItem.quantity + (req.body.quantity || 1) > product.stock) {
                return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
            }
            
            existingCartItem.quantity += req.body.quantity || 1; // Increment quantity
            await existingCartItem.save();
            return res.json({ message: 'Product quantity updated in cart', cartItem: existingCartItem });
        }
        
        // Add product to cart
        const cartItem = new CartItem({
            cart_id: cart._id,
            product_id: product._id,
            quantity: req.body.quantity || 1 // Default quantity to 1 if not provided
        });
        await cartItem.save();
        res.json({ message: 'Product added to cart successfully', product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a review to a product
router.post('/review/:id', verifyToken, async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
  
      const existingReview = await Review.findOne({ product_id: product._id, user_id: req.user.id });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
      }
  
      const review = new Review({
        product_id: product._id,
        user_id: req.user.id,
        rating: req.body.rating,
        review: req.body.review
      });
  
      await review.save();
  
      res.json({ message: 'Review added successfully', review });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Update a review for a product
router.put('/review/:id', verifyToken, async (req, res) => {
    try {
      const productId = req.params.id;
      const userId = req.user.id;
  
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
  
      const review = await Review.findOne({ product_id: productId, user_id: userId });
      if (!review) {
        return res.status(404).json({ message: 'Review not found for this user and product' });
      }
  
      // Update the fields
      if (req.body.rating !== undefined) review.rating = req.body.rating;
      if (req.body.comment !== undefined) review.comment = req.body.comment;
  
      await review.save();
  
      res.json({ message: 'Review updated successfully', review });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Get all reviews for a product
router.get('/reviews/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
  
      const reviews = await Review.find({ product_id: product._id }).populate('user_id', 'name');
  
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Delete a review by review ID
router.delete('/review/id/:reviewId', verifyToken, async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const userId = req.user.id;

        // Find the review by ID
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Only allow the review's author or an admin to delete
        if (review.user_id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await Review.findByIdAndDelete(reviewId);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update product stock
router.patch('/:id/stock', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { quantity, type, note } = req.body;
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update stock
        product.stock += quantity;

        // Add to stock history if it exists
        if (product.stockHistory) {
            product.stockHistory.push({
                quantity,
                type,
                note,
                date: new Date()
            });
        }

        await product.save();
        res.json({ message: 'Stock updated successfully', product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;