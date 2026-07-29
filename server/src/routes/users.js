// ============================================================
// PowerGuard - User Management API Routes
// ============================================================

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

const demoUsers = [
  { id: 1, name: 'Rajesh Kumar', email: 'rajesh@consumer.com', role: 'consumer', status: 'active', area: 'Sector 15', createdAt: '2025-01-15' },
  { id: 2, name: 'Priya Sharma', email: 'priya@utility.com', role: 'utility', status: 'active', department: 'Distribution', createdAt: '2025-02-20' },
  { id: 3, name: 'Admin User', email: 'admin@powerguard.in', role: 'admin', status: 'active', createdAt: '2024-12-01' },
  { id: 4, name: 'Anita Sharma', email: 'anita@consumer.com', role: 'consumer', status: 'active', area: 'Model Town', createdAt: '2025-03-10' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@consumer.com', role: 'consumer', status: 'suspended', area: 'Sector 15', createdAt: '2025-04-05' },
];

router.get('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { role, status } = req.query;
  let filtered = [...demoUsers];
  if (role) filtered = filtered.filter(u => u.role === role);
  if (status) filtered = filtered.filter(u => u.status === status);
  res.json({ users: filtered, total: filtered.length });
});

router.get('/:id', authenticateToken, (req, res) => {
  const user = demoUsers.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const user = demoUsers.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body);
  res.json({ message: 'User updated', user });
});

router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const idx = demoUsers.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  demoUsers.splice(idx, 1);
  res.json({ message: 'User deleted' });
});

module.exports = router;
