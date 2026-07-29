// ============================================================
// PowerGuard - Report API Routes
// ============================================================

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({
    reports: [
      { id: 'RPT-001', title: 'Monthly Consumption Report - July 2026', type: 'monthly', format: 'pdf', generatedAt: new Date().toISOString(), size: 2450000 },
      { id: 'RPT-002', title: 'Theft Detection Summary Q2 2026', type: 'yearly', format: 'pdf', generatedAt: new Date(Date.now() - 86400000).toISOString(), size: 5120000 },
      { id: 'RPT-003', title: 'Area-wise Consumption Analysis', type: 'custom', format: 'excel', generatedAt: new Date(Date.now() - 172800000).toISOString(), size: 1890000 },
    ],
  });
});

router.post('/generate', authenticateToken, (req, res) => {
  const { type, format, dateRange } = req.body;
  res.json({
    message: 'Report generation started',
    reportId: `RPT-${Date.now()}`,
    estimatedTime: '2 minutes',
    status: 'generating',
  });
});

module.exports = router;
