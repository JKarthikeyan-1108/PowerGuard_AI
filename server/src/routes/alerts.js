// ============================================================
// PowerGuard - Alert API Routes
// ============================================================

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const demoAlerts = [
  { id: 'ALT-001', type: 'possible_theft', title: 'Possible Energy Theft Detected', message: 'Unusual consumption pattern detected for meter MTR-047', severity: 'high', meterId: 'MTR-047', area: 'Sector 15', timestamp: new Date().toISOString(), isRead: false, isResolved: false },
  { id: 'ALT-002', type: 'high_usage', title: 'High Usage Alert', message: 'Consumption exceeds 150% of average for consumer C-1024', severity: 'medium', meterId: 'MTR-012', area: 'Model Town', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: false, isResolved: false },
  { id: 'ALT-003', type: 'meter_offline', title: 'Meter Offline', message: 'Smart meter MTR-089 has been offline for 2 hours', severity: 'medium', meterId: 'MTR-089', area: 'Civil Lines', timestamp: new Date(Date.now() - 7200000).toISOString(), isRead: true, isResolved: false },
  { id: 'ALT-004', type: 'transformer_overload', title: 'Transformer Overload Warning', message: 'Transformer TR-05 running at 92% capacity', severity: 'high', area: 'Industrial Area', timestamp: new Date(Date.now() - 10800000).toISOString(), isRead: false, isResolved: false },
];

router.get('/', authenticateToken, (req, res) => {
  const { severity, type, resolved } = req.query;
  let filtered = [...demoAlerts];
  if (severity) filtered = filtered.filter(a => a.severity === severity);
  if (type) filtered = filtered.filter(a => a.type === type);
  if (resolved !== undefined) filtered = filtered.filter(a => a.isResolved === (resolved === 'true'));
  res.json({ alerts: filtered, total: filtered.length });
});

router.put('/:id/resolve', authenticateToken, (req, res) => {
  const alert = demoAlerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.isResolved = true;
  res.json({ message: 'Alert resolved', alert });
});

module.exports = router;
