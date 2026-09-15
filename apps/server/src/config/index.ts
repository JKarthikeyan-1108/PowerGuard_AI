import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const isProduction = (process.env.NODE_ENV || 'development') === 'production';

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.SERVER_PORT || '4000', 10),
  
  database: {
    url: process.env.DATABASE_URL || 'mysql://root:powerguard@localhost:3306/powerguard',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
    accessTokenMaxAge: 15 * 60 * 1000,        // 15 minutes in ms
    refreshTokenMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },

  csrf: {
    secret: process.env.CSRF_SECRET || 'dev-csrf-secret-change-in-production',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID || '',
  },

  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  },

  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOG_DIR || './logs',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
} as const;

export default config;
