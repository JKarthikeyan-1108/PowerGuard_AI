import http from 'http';
import app from './app';
import config from './config';
import logger from './config/logger';
import { initSocketIO } from './socket';
import { initMQTTSubscriber } from './services/mqtt.service';
import { schedulerService } from './services/scheduler.service';
const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Initialize MQTT Subscriber
const mqttClient = initMQTTSubscriber(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

// Initialize Scheduler
schedulerService.start();

// Start server
server.listen(config.port, () => {
  logger.info(`⚡ PowerGuard Server running on port ${config.port}`);
  logger.info(`📡 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 API: http://localhost:${config.port}/api`);
  logger.info(`❤️  Health: http://localhost:${config.port}/api/health`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
