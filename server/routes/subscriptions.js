const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Get user subscription
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update subscription
router.post('/', async (req, res) => {
  try {
    const { userId, planType, status } = req.body;
    
    // Calculate trial end date if applicable
    const trialEnd = status === 'trial' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      : null;

    // Check if subscription exists
    const [existing] = await pool.execute(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [userId]
    );

    let result;
    if (existing.length > 0) {
      // Update existing subscription
      const [updateResult] = await pool.execute(
        `UPDATE subscriptions 
         SET plan_type = ?, status = ?, trial_end = ?
         WHERE user_id = ?`,
        [planType, status, trialEnd, userId]
      );
      
      // Get updated subscription
      const [rows] = await pool.execute(
        'SELECT * FROM subscriptions WHERE user_id = ?',
        [userId]
      );
      result = rows[0];
    } else {
      // Create new subscription
      const [insertResult] = await pool.execute(
        `INSERT INTO subscriptions (user_id, plan_type, status, trial_end)
         VALUES (?, ?, ?, ?)`,
        [userId, planType, status, trialEnd]
      );
      
      // Get created subscription
      const [rows] = await pool.execute(
        'SELECT * FROM subscriptions WHERE id = ?',
        [insertResult.insertId]
      );
      result = rows[0];
    }

    res.json(result);
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
