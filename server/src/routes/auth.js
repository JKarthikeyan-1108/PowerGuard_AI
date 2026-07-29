// ============================================================
// PowerGuard - Authentication Routes
// Login, Register, Forgot Password
// ============================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const router = express.Router();

// In-memory users for demo (replace with MySQL in production)
const demoUsers = [
  { id: 1, name: 'Rajesh Kumar', email: 'rajesh@consumer.com', password: '$2b$10$abcdefghijklmnop', role: 'consumer', phone: '+91 98765 43210' },
  { id: 2, name: 'Priya Sharma', email: 'priya@utility.com', password: '$2b$10$abcdefghijklmnop', role: 'utility', phone: '+91 87654 32109' },
  { id: 3, name: 'Admin User', email: 'admin@powerguard.in', password: '$2b$10$abcdefghijklmnop', role: 'admin', phone: '+91 76543 21098' },
];

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Demo mode: accept any credentials and use role to select user
    let user = demoUsers.find(u => u.role === role) || demoUsers[0];
    
    if (email) {
      const existingUser = demoUsers.find(u => u.email === email);
      if (existingUser) user = existingUser;
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user exists
    const existing = demoUsers.find(u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password || 'demo123', 10);
    
    const newUser = {
      id: demoUsers.length + 1,
      name: name || 'New User',
      email: email || `user${Date.now()}@powerguard.in`,
      password: hashedPassword,
      role: role || 'consumer',
      phone: phone || '',
    };

    demoUsers.push(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    // In production: send email with reset link
    res.json({ message: 'Password reset link sent to ' + email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reset link', message: error.message });
  }
});

module.exports = router;
