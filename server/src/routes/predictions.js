// ============================================================
// PowerGuard - Prediction API Routes
// ============================================================

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/bill/:consumerId', authenticateToken, (req, res) => {
  res.json({
    consumerId: req.params.consumerId,
    currentBill: 2450,
    nextMonthBill: 2680,
    expectedUnits: 357,
    savings: 230,
    predictedAt: new Date().toISOString(),
  });
});

router.get('/theft/:meterId', authenticateToken, (req, res) => {
  const riskScore = Math.random() * 100;
  res.json({
    meterId: req.params.meterId,
    riskScore: Math.round(riskScore * 10) / 10,
    riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
    confidence: 85 + Math.random() * 12,
    reasons: ['Irregular consumption pattern', 'Usage anomaly detected', 'Low power factor'],
    model: 'xgboost',
    detectedAt: new Date().toISOString(),
  });
});

router.get('/demand/:period', authenticateToken, (req, res) => {
  const { period } = req.params;
  const points = period === 'tomorrow' ? 24 : period === 'next_week' ? 7 : 30;
  const predictions = Array.from({ length: points }, (_, i) => ({
    name: period === 'tomorrow' ? `${i}:00` : period === 'next_week' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i] : `Day ${i+1}`,
    value: 15000 + Math.random() * 10000,
    value2: 14000 + Math.random() * 9000,
  }));
  res.json({ period, predictions, peakDemand: 28500, avgDemand: 18200, confidence: 89.5 });
});

router.get('/recommendations/:consumerId', authenticateToken, (req, res) => {
  res.json({
    consumerId: req.params.consumerId,
    recommendations: [
      { id: 'REC-001', title: 'Reduce AC Usage', description: 'Set AC to 24°C instead of 20°C', estimatedSavings: 450, priority: 'high', category: 'appliance' },
      { id: 'REC-002', title: 'Switch to LED', description: 'Replace CFL/incandescent with LED', estimatedSavings: 320, priority: 'high', category: 'equipment' },
      { id: 'REC-003', title: 'Turn Off Standby', description: 'Unplug devices when not in use', estimatedSavings: 180, priority: 'medium', category: 'behavior' },
      { id: 'REC-004', title: 'Shift Usage to Off-Peak', description: 'Use heavy appliances during 10PM-6AM', estimatedSavings: 250, priority: 'medium', category: 'schedule' },
    ],
    totalSavings: 1200,
  });
});

module.exports = router;
