// ============================================================
// PowerGuard - Express Backend Server
// JWT Auth, REST APIs, Smart Meter Simulator, WebSocket
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const meterRoutes = require('./routes/meters');
const alertRoutes = require('./routes/alerts');
const predictionRoutes = require('./routes/predictions');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const { startSimulator } = require('./simulator/meterSimulator');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// ============================================================
// Middleware
// ============================================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.path}`);
  next();
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/meters', meterRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PowerGuard API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ============================================================
// WebSocket Server for Real-time Meter Data
// ============================================================
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Broadcast meter data to all connected clients
function broadcastMeterData(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({ type: 'meter_reading', data }));
    }
  });
}

// Start smart meter simulator
startSimulator(broadcastMeterData);

// ============================================================
// Start Server
// ============================================================
server.listen(PORT, () => {
  console.log(`\n⚡ PowerGuard API Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
