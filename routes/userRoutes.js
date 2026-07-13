const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const logger = require('../config/logger');

// Get all users (admin only)
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    logger.error('Get users error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update user role (admin only)
router.put('/:id/role', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update({ role });
    logger.info(`User role updated: ${user.email} to ${role}`);
    res.json(user);
  } catch (error) {
    logger.error('Update user role error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Deactivate user (admin only)
router.put('/:id/deactivate', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update({ isActive: false });
    logger.info(`User deactivated: ${user.email}`);
    res.json({ message: 'User deactivated' });
  } catch (error) {
    logger.error('Deactivate user error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;