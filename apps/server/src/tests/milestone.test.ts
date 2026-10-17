import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

describe('PowerGuard Vertical Milestone E2E Test', () => {
  let adminToken: string;
  let testMeterSerial: string;
  let testMeterId: string;

  beforeAll(async () => {
    // Find or create an admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin1@powerguard.io' },
    });

    if (adminUser) {
      // Login to get tokens
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin1@powerguard.io',
          password: 'Password123',
        });
      
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);

      // Extract access token from set-cookie header or body
      const cookieHeader = loginRes.headers['set-cookie'];
      if (cookieHeader) {
        const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
        const match = cookies.find((c: string) => c.startsWith('access_token='));
        if (match) {
          adminToken = match.split(';')[0].replace('access_token=', '');
        }
      }
    }

    // Find an active meter
    const meter = await prisma.meter.findFirst({
      where: { status: 'ACTIVE' },
    });
    if (meter) {
      testMeterSerial = meter.serialNumber;
      testMeterId = meter.id;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Security & Authorization Enforcement', () => {
    it('should reject unauthorized access to protected meter routes', async () => {
      const res = await request(app).get('/api/meters');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Access token required');
    });

    it('should reject meter reading ingestion without valid API key or token', async () => {
      const res = await request(app)
        .post('/api/meters/reading')
        .send({
          serialNumber: testMeterSerial || 'MTR-TEST',
          value: 12.5,
          voltage: 230,
          current: 5,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. User Authentication', () => {
    it('should authenticate admin user and return structured user profile', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin1@powerguard.io',
          password: 'Password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('admin1@powerguard.io');
      expect(res.body.data.user.role).toBe('ADMIN');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin1@powerguard.io',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. IoT Device Telemetry Ingestion & Persistence', () => {
    it('should accept valid reading from an authorized IoT device via x-api-key', async () => {
      if (!testMeterSerial) {
        console.warn('Skipping test: No test meter available');
        return;
      }

      const readingValue = 42.15;
      const res = await request(app)
        .post('/api/meters/reading')
        .set('x-api-key', 'powerguard-iot-secret-2026')
        .send({
          serialNumber: testMeterSerial,
          value: readingValue,
          voltage: 230.5,
          current: 6.2,
          powerFactor: 0.94,
          frequency: 50.0,
          timestamp: new Date().toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify persistence in database
      const savedReading = await prisma.meterReading.findFirst({
        where: {
          meterId: testMeterId,
          value: readingValue,
        },
      });

      expect(savedReading).not.toBeNull();
      expect(savedReading?.voltage).toBeCloseTo(230.5, 1);
    });
  });

  describe('4. Anomaly Detection & Persistence', () => {
    it('should ingest and record an anomalous electrical reading', async () => {
      if (!testMeterSerial) return;

      const anomalyValue = 99.99;
      const res = await request(app)
        .post('/api/meters/reading')
        .set('x-api-key', 'powerguard-iot-secret-2026')
        .send({
          serialNumber: testMeterSerial,
          value: anomalyValue,
          voltage: 170.0,
          current: 48.0,
          powerFactor: 0.35,
          frequency: 47.5,
          timestamp: new Date().toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify that the reading was recorded in DB
      const reading = await prisma.meterReading.findFirst({
        where: {
          meterId: testMeterId,
          value: anomalyValue,
        },
      });

      expect(reading).not.toBeNull();
    });
  });

  describe('5. Dashboard Data Retrieval by Authorized User', () => {
    it('should allow authorized admin to query meter list and readings', async () => {
      if (!adminToken) return;

      const res = await request(app)
        .get('/api/meters')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should allow authorized admin to query historical readings for a meter', async () => {
      if (!adminToken || !testMeterId) return;

      const res = await request(app)
        .get(`/api/meters/${testMeterId}/readings`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should allow authorized admin to review alerts and update alert status', async () => {
      if (!adminToken) return;

      const alertsRes = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(alertsRes.status).toBe(200);
      expect(alertsRes.body.success).toBe(true);
      expect(Array.isArray(alertsRes.body.data)).toBe(true);
      expect(alertsRes.body.data.length).toBeGreaterThan(0);

      const firstAlert = alertsRes.body.data[0];
      const updateRes = await request(app)
        .put(`/api/alerts/${firstAlert.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ACKNOWLEDGED' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.status).toBe('ACKNOWLEDGED');
    });

    it('should return analytics overview for the dashboard', async () => {
      if (!adminToken) return;

      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalMeters).toBeGreaterThan(0);
      expect(res.body.data.totalConsumers).toBeGreaterThan(0);
    });
  });
});
