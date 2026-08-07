import { PrismaClient, UserStatus, MeterType, MeterStatus, AlertType, AlertSeverity, AlertStatus, RiskLevel, ReadingSource, ReportType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAccountNumber(): string {
  return `PG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function main() {
  console.log('🌱 Starting Enterprise PowerGuard Database Seed...\n');
  const now = new Date();
  
  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.$transaction([
    prisma.consumerClusterAssignment.deleteMany(),
    prisma.consumerCluster.deleteMany(),
    prisma.theftPrediction.deleteMany(),
    prisma.billPrediction.deleteMany(),
    prisma.recommendation.deleteMany(),
    prisma.energyForecast.deleteMany(),
    prisma.meterReading.deleteMany(),
    prisma.alert.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.systemLog.deleteMany(),
    prisma.report.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.meter.deleteMany(),
    prisma.transformer.deleteMany(),
    prisma.consumerProfile.deleteMany(),
    prisma.adminProfile.deleteMany(),
    prisma.utilityOfficer.deleteMany(),
    prisma.area.deleteMany(),
    prisma.user.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.role.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash('Password123', 12);

  // ── Roles & Permissions ──────────────────────────
  console.log('🔑 Creating Roles & Permissions...');
  const adminRole = await prisma.role.create({ data: { name: 'ADMIN', description: 'System Administrator' } });
  const officerRole = await prisma.role.create({ data: { name: 'UTILITY_OFFICER', description: 'Utility Officer' } });
  const consumerRole = await prisma.role.create({ data: { name: 'CONSUMER', description: 'End Consumer' } });

  const pAll = await prisma.permission.create({ data: { action: '*', resource: '*' } });
  const pReadMeters = await prisma.permission.create({ data: { action: 'read', resource: 'meters' } });
  const pUpdateMeters = await prisma.permission.create({ data: { action: 'update', resource: 'meters' } });

  await prisma.role.update({ where: { id: adminRole.id }, data: { permissions: { connect: [{ id: pAll.id }] } } });
  await prisma.role.update({ where: { id: officerRole.id }, data: { permissions: { connect: [{ id: pReadMeters.id }, { id: pUpdateMeters.id }] } } });
  await prisma.role.update({ where: { id: consumerRole.id }, data: { permissions: { connect: [{ id: pReadMeters.id }] } } });

  // ── Areas ──────────────────────────────────────
  console.log('📍 Creating 20 Areas...');
  const areaData = Array.from({ length: 20 }).map((_, i) => ({
    name: `Area ${i + 1} - ${crypto.randomBytes(2).toString('hex')}`,
    code: `AR-${String(i + 1).padStart(3, '0')}`,
    riskLevel: randomItem(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']) as RiskLevel,
    population: Math.floor(Math.random() * 50000) + 5000,
  }));
  await prisma.area.createMany({ data: areaData });
  const areas = await prisma.area.findMany();

  // ── Transformers ────────────────────────────────
  console.log('⚡ Creating 50 Transformers...');
  const transformerData = Array.from({ length: 50 }).map((_, i) => ({
    name: `TRF-${String(i + 1).padStart(3, '0')}`,
    serialNumber: `TRF${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    capacity: randomItem([250, 500, 1000, 1500, 2000]),
    latitude: 37.7749 + randomFloat(-0.2, 0.2, 4),
    longitude: -122.4194 + randomFloat(-0.2, 0.2, 4),
    areaId: randomItem(areas).id,
  }));
  await prisma.transformer.createMany({ data: transformerData });
  const transformers = await prisma.transformer.findMany();

  // ── Admin Users ──────────────────────────────────
  console.log('👤 Creating 5 Admins...');
  for (let i = 0; i < 5; i++) {
    await prisma.user.create({
      data: {
        email: `admin${i + 1}@powerguard.io`,
        passwordHash,
        firstName: 'System',
        lastName: `Admin${i + 1}`,
        status: 'ACTIVE',
        roles: { connect: [{ id: adminRole.id }] },
        adminProfile: { create: { department: 'IT', accessLevel: 'ROOT' } }
      }
    });
  }

  // ── Utility Officers ──────────────────────────────
  console.log('🔧 Creating 20 Utility Officers...');
  for (let i = 0; i < 20; i++) {
    await prisma.user.create({
      data: {
        email: `officer${i + 1}@powerguard.io`,
        passwordHash,
        firstName: 'Field',
        lastName: `Officer${i + 1}`,
        status: 'ACTIVE',
        roles: { connect: [{ id: officerRole.id }] },
        utilityOfficer: {
          create: {
            employeeId: `EMP-OFF-${i + 1}`,
            department: 'Field Operations',
            designation: 'Senior Inspector'
          }
        }
      }
    });
  }

  // ── Consumers ───────────────────────────────────
  console.log('🏠 Creating 500 Consumers and Profiles...');
  const consumerUsers = [];
  const consumerProfiles = [];
  
  for (let i = 0; i < 500; i++) {
    const id = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const meterType = randomItem(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL']) as MeterType;
    
    consumerUsers.push({
      id,
      email: `consumer${i + 1}@email.com`,
      passwordHash,
      firstName: 'Test',
      lastName: `Consumer${i + 1}`,
      status: 'ACTIVE' as UserStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    consumerProfiles.push({
      id: profileId,
      userId: id,
      accountNumber: generateAccountNumber(),
      address: `${100 + i} Main St`,
      city: 'San Francisco',
      state: 'CA',
      zipCode: `941${String(i % 30).padStart(2, '0')}`,
      areaId: randomItem(areas).id,
      tariffRate: meterType === 'RESIDENTIAL' ? 5.0 : 8.5,
      connectionType: meterType,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  await prisma.user.createMany({ data: consumerUsers });
  await prisma.consumerProfile.createMany({ data: consumerProfiles });
  
  // Link roles to consumer users
  const createdConsumers = await prisma.user.findMany({ where: { email: { contains: 'consumer' } } });
  for (const c of createdConsumers) {
    // Note: createMany doesn't support nested connections in mysql easily, so we update
    await prisma.user.update({
      where: { id: c.id },
      data: { roles: { connect: [{ id: consumerRole.id }] } }
    });
  }

  const profiles = await prisma.consumerProfile.findMany();

  // ── Meters ───────────────────────────────────
  console.log('📟 Creating 600 Smart Meters...');
  const meterData = [];
  for (let i = 0; i < 600; i++) {
    // Distribute among consumers, some consumers get multiple
    const consumer = profiles[i % profiles.length];
    const transformer = transformers[i % transformers.length];
    
    meterData.push({
      serialNumber: `MTR-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
      type: consumer.connectionType,
      status: randomItem(['ACTIVE', 'ACTIVE', 'ACTIVE', 'FAULTY', 'MAINTENANCE']) as MeterStatus,
      consumerId: consumer.id,
      transformerId: transformer.id,
      latitude: transformer.latitude + randomFloat(-0.02, 0.02, 5),
      longitude: transformer.longitude + randomFloat(-0.02, 0.02, 5),
    });
  }
  await prisma.meter.createMany({ data: meterData });
  const meters = await prisma.meter.findMany({ select: { id: true, type: true } });

  // ── Meter Readings ────────────────────────────────
  console.log('📊 Generating 100,000 Historical Meter Readings (1 Year)...');
  const readingsBatch = [];
  const TOTAL_READINGS = 100000;
  
  for (let i = 0; i < TOTAL_READINGS; i++) {
    const meter = randomItem(meters);
    // Random date in the past year
    const daysAgo = Math.floor(Math.random() * 365);
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const baseVal = meter.type === 'RESIDENTIAL' ? 1.5 : 10.5;
    const isAnomaly = Math.random() < 0.01;
    let value = baseVal * randomFloat(0.5, 1.5);
    if (isAnomaly) value *= 5; // spike
    
    readingsBatch.push({
      meterId: meter.id,
      value: parseFloat(value.toFixed(2)),
      voltage: randomFloat(220, 240, 1),
      current: randomFloat(1, 30, 1),
      timestamp,
      isAnomaly,
      source: 'SMART_METER' as ReadingSource
    });
  }
  
  // Chunk insert
  const CHUNK = 5000;
  for (let i = 0; i < readingsBatch.length; i += CHUNK) {
    await prisma.meterReading.createMany({ data: readingsBatch.slice(i, i + CHUNK) });
    process.stdout.write(`\r  📊 Inserted ${Math.min(i + CHUNK, readingsBatch.length)} / ${TOTAL_READINGS}`);
  }
  console.log();

  // ── Alerts ────────────────────────────────────────
  console.log('🚨 Creating 5,000 Alerts...');
  const alertData = [];
  for (let i = 0; i < 5000; i++) {
    const meter = randomItem(meters);
    alertData.push({
      type: randomItem(['THEFT_DETECTED', 'ANOMALY_DETECTED', 'HIGH_CONSUMPTION', 'METER_TAMPER']) as AlertType,
      severity: randomItem(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']) as AlertSeverity,
      status: randomItem(['NEW', 'ACKNOWLEDGED', 'RESOLVED']) as AlertStatus,
      title: `Automated Alert System`,
      description: `Irregularity detected on meter tracking.`,
      meterId: meter.id,
      createdAt: new Date(now.getTime() - Math.random() * 100 * 24 * 60 * 60 * 1000)
    });
  }
  for (let i = 0; i < alertData.length; i += CHUNK) {
    await prisma.alert.createMany({ data: alertData.slice(i, i + CHUNK) });
  }

  // ── Notifications ──────────────────────────────────
  console.log('🔔 Creating 5,000 Notifications...');
  const notifData = [];
  for (let i = 0; i < 5000; i++) {
    notifData.push({
      userId: randomItem(createdConsumers).id,
      title: 'System Notice',
      body: 'Your weekly summary is available.',
      type: 'info',
      read: Math.random() > 0.5,
      createdAt: new Date(now.getTime() - Math.random() * 50 * 24 * 60 * 60 * 1000)
    });
  }
  for (let i = 0; i < notifData.length; i += CHUNK) {
    await prisma.notification.createMany({ data: notifData.slice(i, i + CHUNK) });
  }

  // ── Reports ──────────────────────────────────
  console.log('📑 Creating 1,000 Reports...');
  const adminUsers = await prisma.user.findMany({ where: { email: { contains: 'admin' } } });
  const reportData = [];
  for (let i = 0; i < 1000; i++) {
    reportData.push({
      title: `System Analysis Report ${i}`,
      type: randomItem(['CONSUMPTION', 'THEFT_ANALYSIS', 'DEMAND_FORECAST']) as ReportType,
      generatedBy: randomItem(adminUsers).id,
      status: 'COMPLETED',
      createdAt: new Date(now.getTime() - Math.random() * 300 * 24 * 60 * 60 * 1000)
    });
  }
  await prisma.report.createMany({ data: reportData });

  // ── Recommendations ──────────────────────────────────
  console.log('💡 Creating 1,000 Recommendations...');
  const recData = [];
  for (let i = 0; i < 1000; i++) {
    recData.push({
      consumerId: randomItem(profiles).id,
      type: 'ENERGY_SAVING',
      title: 'Optimize HVAC Usage',
      content: 'You can save up to 15% by adjusting your thermostat schedule.',
      estimatedSavings: randomFloat(50, 200),
      createdAt: new Date(now.getTime() - Math.random() * 100 * 24 * 60 * 60 * 1000)
    });
  }
  await prisma.recommendation.createMany({ data: recData });

  console.log('\n✅ Enterprise Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
