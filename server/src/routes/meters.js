// ============================================================
// PowerGuard - Meter API Routes
// ============================================================

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const demoMeters = [
  { id: '1', meterId: 'MTR-001', consumerId: 'C-1001', area: 'Sector 15', status: 'active', consumerName: 'Rajesh Kumar' },
  { id: '2', meterId: 'MTR-002', consumerId: 'C-1002', area: 'Model Town', status: 'active', consumerName: 'Anita Sharma' },
  { id: '3', meterId: 'MTR-003', consumerId: 'C-1003', area: 'Civil Lines', status: 'active', consumerName: 'Mohammed Ali' },
  { id: '4', meterId: 'MTR-047', consumerId: 'C-1047', area: 'Sector 15', status: 'tampered', consumerName: 'Vikram Singh' },
  { id: '5', meterId: 'MTR-089', consumerId: 'C-1089', area: 'Civil Lines', status: 'inactive', consumerName: 'Deepak Verma' },
];

router.get('/', authenticateToken, (req, res) => {
  res.json({ meters: demoMeters, total: demoMeters.length });
});

router.get('/:meterId', authenticateToken, (req, res) => {
  const meter = demoMeters.find(m => m.meterId === req.params.meterId);
  if (!meter) return res.status(404).json({ error: 'Meter not found' });
  res.json(meter);
});

router.get('/:meterId/readings', authenticateToken, (req, res) => {
  const readings = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    voltage: 225 + Math.random() * 15,
    current: 1 + Math.random() * 8,
    power: 100 + Math.random() * 4900,
    energy: 100 + i * 2 + Math.random() * 5,
    frequency: 49.5 + Math.random(),
    powerFactor: 0.7 + Math.random() * 0.3,
  }));
  res.json({ meterId: req.params.meterId, readings });
});

module.exports = router;
