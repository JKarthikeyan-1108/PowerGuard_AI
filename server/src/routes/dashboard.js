// ============================================================
// PowerGuard - Dashboard API Routes
// Consumer, Utility, and Admin dashboard data
// ============================================================

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/dashboard/consumer
 * Consumer dashboard data
 */
router.get('/consumer', authenticateToken, authorizeRoles('consumer', 'admin'), (req, res) => {
  res.json({
    liveData: {
      voltage: 230 + (Math.random() - 0.5) * 20,
      current: 0.5 + Math.random() * 9.5,
      power: 100 + Math.random() * 4900,
      energy: 125 + Math.random() * 50,
      frequency: 49.5 + Math.random(),
      powerFactor: 0.7 + Math.random() * 0.3,
    },
    todayUsage: 18.5,
    monthlyUsage: 342,
    currentBill: 2450,
    nextMonthBill: 2680,
    energyScore: 78,
    carbonFootprint: 12.5,
    electricityCost: 7.5,
  });
});

/**
 * GET /api/dashboard/utility
 * Utility dashboard data
 */
router.get('/utility', authenticateToken, authorizeRoles('utility', 'admin'), (req, res) => {
  res.json({
    totalConsumers: 8750,
    activeConsumers: 8420,
    liveMeters: 7890,
    todayTheftAlerts: 12,
    areaConsumption: [
      { area: 'Sector 15', consumption: 45200, consumers: 1250 },
      { area: 'Model Town', consumption: 38700, consumers: 980 },
      { area: 'Civil Lines', consumption: 52100, consumers: 1450 },
      { area: 'Industrial Area', consumption: 125000, consumers: 320 },
    ],
  });
});

/**
 * GET /api/dashboard/admin
 * Admin dashboard data
 */
router.get('/admin', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({
    totalUsers: 8859,
    totalConsumers: 8750,
    totalOfficers: 102,
    totalMeters: 7890,
    activeMeters: 7120,
    systemHealth: {
      cpu: 42,
      memory: 67,
      disk: 54,
      uptime: '99.97%',
      apiLatency: 45,
      dbConnections: 18,
      activeWebSockets: 234,
      mlServiceStatus: 'online',
    },
  });
});

module.exports = router;
