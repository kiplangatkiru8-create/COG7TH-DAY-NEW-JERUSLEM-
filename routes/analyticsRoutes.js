const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const logger = require('../config/logger');

// Get member statistics
router.get('/members/statistics', authMiddleware, roleMiddleware(['admin', 'pastor']), async (req, res) => {
  try {
    const totalMembers = await Member.count();
    const activeMembers = await Member.count({ where: { status: 'active' } });
    const inactiveMembers = await Member.count({ where: { status: 'inactive' } });

    res.json({
      totalMembers,
      activeMembers,
      inactiveMembers,
      conversionRate: ((activeMembers / totalMembers) * 100).toFixed(2) + '%'
    });
  } catch (error) {
    logger.error('Members statistics error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get attendance statistics
router.get('/attendance/statistics', authMiddleware, roleMiddleware(['admin', 'pastor']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const attendanceData = await Attendance.findAll({
      where: {
        eventDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      }
    });

    const presentCount = attendanceData.filter(a => a.status === 'present').length;
    const absentCount = attendanceData.filter(a => a.status === 'absent').length;
    const lateCount = attendanceData.filter(a => a.status === 'late').length;

    res.json({
      totalRecords: attendanceData.length,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      attendanceRate: ((presentCount / attendanceData.length) * 100).toFixed(2) + '%'
    });
  } catch (error) {
    logger.error('Attendance statistics error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get department breakdown
router.get('/departments/breakdown', authMiddleware, roleMiddleware(['admin', 'pastor']), async (req, res) => {
  try {
    const departments = await Member.findAll({
      attributes: ['department'],
      raw: true,
      group: ['department']
    });

    const breakdown = await Promise.all(
      departments.map(async (dept) => ({
        department: dept.department || 'Unassigned',
        count: await Member.count({ where: { department: dept.department } })
      }))
    );

    res.json(breakdown);
  } catch (error) {
    logger.error('Department breakdown error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;