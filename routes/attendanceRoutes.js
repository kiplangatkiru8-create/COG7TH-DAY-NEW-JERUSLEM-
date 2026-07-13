const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Attendance = require('../models/Attendance');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const logger = require('../config/logger');

// Record attendance
router.post('/', authMiddleware, roleMiddleware(['admin', 'pastor', 'secretary']), async (req, res) => {
  try {
    const { memberId, eventDate, eventType, status, notes } = req.body;
    const attendance = await Attendance.create({
      memberId,
      eventDate,
      eventType,
      status,
      notes
    });
    logger.info(`Attendance recorded for member ${memberId}`);
    res.status(201).json(attendance);
  } catch (error) {
    logger.error('Record attendance error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get attendance by date range
router.get('/date-range', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const attendance = await Attendance.findAll({
      where: {
        eventDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: ['Member']
    });
    res.json(attendance);
  } catch (error) {
    logger.error('Get attendance error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get member attendance
router.get('/member/:memberId', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
      where: { memberId: req.params.memberId }
    });
    res.json(attendance);
  } catch (error) {
    logger.error('Get member attendance error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;