const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, initDb, testConnection } = require('./db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS Configuration
app.use(cors({
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Parse JSON bodies
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({ 
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      return res.status(500).json({ message: 'Database connection error' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    console.log('User created successfully:', { userId: result.insertId, email });

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Failed to create account' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Failed to login' });
  }
});

// Subscription Routes
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { userId, planType } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
    
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for existing subscription
    const [existingSubscriptions] = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status != ?',
      [userId, 'cancelled']
    );

    if (existingSubscriptions.length > 0) {
      // Update existing subscription
      await pool.query(
        'UPDATE subscriptions SET plan_type = ?, status = ?, payment_processed = ? WHERE user_id = ?',
        [planType, planType === 'basic' ? 'active' : 'pending', planType === 'basic', userId]
      );
    } else {
      // Create new subscription
      await pool.query(
        'INSERT INTO subscriptions (user_id, plan_type, status, payment_processed) VALUES (?, ?, ?, ?)',
        [userId, planType, planType === 'basic' ? 'active' : 'pending', planType === 'basic']
      );
    }

    res.json({
      userId,
      planType,
      status: planType === 'basic' ? 'active' : 'pending',
      paymentProcessed: planType === 'basic'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: error.message || 'Failed to create subscription' });
  }
});

// Payment Routes
app.post('/api/payments', async (req, res) => {
  try {
    const { cardNumber, expiry, cvv, cardName } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');

    // Get user's subscription
    const [subscriptions] = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = ? AND plan_type = ? ORDER BY created_at DESC LIMIT 1',
      [decoded.userId, 'premium']
    );

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No pending premium subscription found' });
    }

    const subscription = subscriptions[0];

    // In a real application, you would process the payment here
    // For this demo, we'll just simulate a successful payment
    
    // Update subscription status
    await pool.query(
      'UPDATE subscriptions SET status = ?, payment_processed = TRUE WHERE id = ?',
      ['active', subscription.id]
    );

    res.json({
      success: true,
      message: 'Payment processed successfully',
      subscription: {
        id: subscription.id,
        planType: 'premium',
        status: 'active',
        paymentProcessed: true
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: error.message || 'Payment processing failed' });
  }
});

// Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

// Start server
const startServer = async () => {
  try {
    await initDb();
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('CORS enabled for all origins in development');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
