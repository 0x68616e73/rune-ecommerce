const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const router = express.Router();

// Create a rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    res.json({ message: 'Logged in successfully', user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;