import mqtt from 'mqtt';
import { z } from 'zod';
import logger from '../config/logger';
import { readingProcessor, ReadingPayload } from './realtime/ReadingProcessor';
import { alertProcessor, AlertPayload } from './realtime/AlertProcessor';
import { heartbeatMonitor, HeartbeatPayload } from './realtime/HeartbeatMonitor';
import { metricsCollector } from './monitoring.service';
import { structuredLog } from './structured-logger.service';

let mqttClient: mqtt.MqttClient;

export const initMQTTSubscriber = (brokerUrl: string) => {
  logger.info(`🔌 Connecting to MQTT Broker at ${brokerUrl}`);

  mqttClient = mqtt.connect(brokerUrl, {
    clientId: `powerguard_server_${Math.random().toString(16).slice(2, 10)}`,
    clean: false, // Persistent session
    connectTimeout: 4000,
    reconnectPeriod: 2000, // Reconnect every 2 seconds
    queueQoSZero: true, 
  });

  mqttClient.on('connect', () => {
    logger.info('✅ MQTT Connected successfully');
    metricsCollector.setMqttConnected(true);
    structuredLog.mqtt({ event: 'CONNECT' });
    
    // Subscribe to all relevant topics
    const topics = [
      'meters/+/reading',
      'meters/+/status',
      'meters/+/heartbeat',
      'meters/+/alert',
      'transformers/+/status'
    ];

    mqttClient.subscribe(topics, { qos: 1 }, (err, granted) => {
      if (err) {
        logger.error('❌ MQTT Subscribe error:', err);
        structuredLog.mqtt({ event: 'ERROR', error: err.message });
      } else if (granted) {
        metricsCollector.setMqttTopicCount(granted.length);
        structuredLog.mqtt({ event: 'SUBSCRIBE', details: `${granted.length} topics` });
        logger.info(`📡 Subscribed to MQTT topics: ${granted.map(g => g.topic).join(', ')}`);
      }
    });

    // Publish system health
    mqttClient.publish('system/health', JSON.stringify({ status: 'ONLINE', timestamp: new Date() }), { qos: 1, retain: true });
  });

  mqttClient.on('reconnect', () => {
    logger.warn('⚠️ MQTT Reconnecting...');
    metricsCollector.recordMqttReconnect();
    structuredLog.mqtt({ event: 'RECONNECT' });
  });

  mqttClient.on('offline', () => {
    logger.warn('⚠️ MQTT Offline - Messages will be queued');
    metricsCollector.setMqttConnected(false);
    structuredLog.mqtt({ event: 'DISCONNECT', details: 'Broker offline' });
    mqttClient.publish('system/health', JSON.stringify({ status: 'OFFLINE', timestamp: new Date() }), { qos: 1, retain: true });
  });

  mqttClient.on('error', (error) => {
    logger.error('❌ MQTT Error:', error);
    structuredLog.mqtt({ event: 'ERROR', error: error.message });
  });

  mqttClient.on('message', async (topic, message) => {
    metricsCollector.recordMqttMessage();
    try {
      const parts = topic.split('/');
      const deviceType = parts[0]; // meters or transformers
      const serialNumber = parts[1];
      const eventType = parts[2]; // reading, status, heartbeat, alert

      const payloadString = message.toString();
      let rawPayload;
      try {
        rawPayload = JSON.parse(payloadString);
      } catch (e) {
        logger.error(`❌ Invalid JSON on topic ${topic}: ${payloadString}`);
        return;
      }

      rawPayload.serialNumber = rawPayload.serialNumber || serialNumber;

      if (deviceType === 'meters') {
        switch (eventType) {
          case 'reading':
            await readingProcessor.process(rawPayload as ReadingPayload);
            break;
          case 'alert':
            await alertProcessor.process(rawPayload as AlertPayload);
            break;
          case 'heartbeat':
          case 'status':
            await heartbeatMonitor.process({
              serialNumber,
              status: rawPayload.status || 'ONLINE',
              firmwareVersion: rawPayload.firmwareVersion,
              uptime: rawPayload.uptime,
              timestamp: rawPayload.timestamp
            });
            break;
          default:
            logger.debug(`Unhandled meter event type: ${eventType}`);
        }
      } else if (deviceType === 'transformers') {
        // Simple log for now
        logger.debug(`Transformer status update: ${serialNumber} -> ${JSON.stringify(rawPayload)}`);
      }

    } catch (error: any) {
      logger.error(`❌ MQTT Processing Error on ${topic}: ${error.message}`);
    }
  });

  return mqttClient;
};

export const getMQTTClient = (): mqtt.MqttClient => {
  if (!mqttClient) {
    throw new Error('MQTT Client not initialized');
  }
  return mqttClient;
};
