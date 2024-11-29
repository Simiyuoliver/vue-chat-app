const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Get all messages
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.name, u.photo_url
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new message
router.post('/', async (req, res) => {
  try {
    const { userId, content } = req.body;
    
    const result = await pool.query(
      'INSERT INTO messages (user_id, content) VALUES ($1, $2) RETURNING *',
      [userId, content]
    );

    // Get user info for the response
    const messageWithUser = await pool.query(`
      SELECT m.*, u.name, u.photo_url
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `, [result.rows[0].id]);

    res.status(201).json(messageWithUser.rows[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
