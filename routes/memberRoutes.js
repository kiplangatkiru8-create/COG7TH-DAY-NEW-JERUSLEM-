const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const logger = require('../config/logger');

// Get all members
router.get('/', authMiddleware, async (req, res) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (error) {
    logger.error('Get members error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get member by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    logger.error('Get member error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create member
router.post('/', authMiddleware, roleMiddleware(['admin', 'pastor', 'secretary']), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, address, department } = req.body;
    const member = await Member.create({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      department
    });
    logger.info(`Member created: ${firstName} ${lastName}`);
    res.status(201).json(member);
  } catch (error) {
    logger.error('Create member error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update member
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'pastor', 'secretary']), async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    await member.update(req.body);
    logger.info(`Member updated: ${member.firstName} ${member.lastName}`);
    res.json(member);
  } catch (error) {
    logger.error('Update member error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete member
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    await member.destroy();
    logger.info(`Member deleted: ${member.firstName} ${member.lastName}`);
    res.json({ message: 'Member deleted' });
  } catch (error) {
    logger.error('Delete member error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;