const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to send response with token
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: userResponse
  });
};

// Get all users (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access user list' });
    }
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, program, department, yearOfStudy, section, universityRollNo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email and password' });
    }

    // Password Policy: 8+ chars
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Pick only allowed fields
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'student' : (role || 'student'), // Prevent self-promotion to admin
      program,
      department,
      yearOfStudy,
      section,
      universityRollNo
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email });
    // Generic message to prevent email enumeration
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user by ID
router.get('/:id', protect, async (req, res) => {
  try {
    // Only allow self or admin/counsellor
    if (req.user.id !== req.params.id && req.user.role === 'student') {
      return res.status(403).json({ error: 'Not authorized to view this profile' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
router.put('/:id', protect, async (req, res) => {
  try {
    // Ownership Check
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    const { name, email, password, program, department, yearOfStudy, section, universityRollNo } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Pick only allowed fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (program !== undefined) user.program = program;
    if (department !== undefined) user.department = department;
    if (yearOfStudy !== undefined) user.yearOfStudy = yearOfStudy;
    if (section !== undefined) user.section = section;
    if (universityRollNo !== undefined) user.universityRollNo = universityRollNo;
    
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }
      user.password = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, user: userResponse });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;

module.exports = router;