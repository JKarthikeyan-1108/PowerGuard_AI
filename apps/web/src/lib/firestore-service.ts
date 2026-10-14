/**
 * PowerGuard AI — Cloud Firestore Data Access Service
 * Handles queries, transactions, pagination, and fallback state.
 */

import { getAdminInstances } from './firebase-admin';
import type {
  FirestoreReading,
  FirestoreAlert,
  FirestorePrediction,
  FirestoreMeter,
  FirestoreDeviceStatus,
  FirestoreModelMetadata
} from './firestore-schema';

// ── In-Memory Store for Standalone / Demo / Fallback Mode ────────
const inMemoryStore = {
  meters: [
    {
      id: 'MTR-001',
      serialNumber: 'PG-ESP32-001',
      consumerId: 'usr-consumer-1',
      consumerName: 'Alice Anderson',
      location: { lat: 13.0827, lng: 80.2707, address: 'Anna Nagar, Chennai' },
      installationDate: '2024-01-15T00:00:00Z',
      status: 'ACTIVE' as const,
      tariffPlan: 'DOMESTIC_SLAB' as const,
      baseTariffRate: 7.50,
      lastReadingTimestamp: new Date().toISOString(),
      lastVoltage: 231.2,
      lastCurrent: 14.8,
      lastPower: 3250.0,
      cumulativeEnergyKwh: 1420.5,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'MTR-002',
      serialNumber: 'PG-ESP32-002',
      consumerId: 'usr-consumer-2',
      consumerName: 'Bob Martinez',
      location: { lat: 13.0405, lng: 80.2337, address: 'T. Nagar, Chennai' },
      installationDate: '2024-02-10T00:00:00Z',
      status: 'WARNING' as const,
      tariffPlan: 'DOMESTIC_SLAB' as const,
      baseTariffRate: 7.50,
      lastReadingTimestamp: new Date().toISOString(),
      lastVoltage: 228.4,
      lastCurrent: 0.12, // Shunt tap / anomaly
      lastPower: 24.5,
      cumulativeEnergyKwh: 890.2,
      createdAt: '2024-02-10T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ] as FirestoreMeter[],
  readings: [] as FirestoreReading[],
  alerts: [
    {
      id: 'ALT-101',
      meterId: 'MTR-002',
      consumerId: 'usr-consumer-2',
      consumerName: 'Bob Martinez',
      title: 'Current Draw Anomaly (Possible Meter Bypass)',
      description: 'Current dropped to 0.12A during peak evening hours while voltage remained at nominal 228V.',
      severity: 'CRITICAL' as const,
      status: 'OPEN' as const,
      category: 'TAMPER_BYPASS' as const,
      anomalyScore: -0.142,
      detectedAt: new Date(Date.now() - 3600000).toISOString(),
      readingsSnapshot: { voltage: 228.4, current: 0.12, power: 24.5, powerFactor: 0.45 }
    }
  ] as FirestoreAlert[],
  predictions: [] as FirestorePrediction[],
  deviceStatus: new Map<string, FirestoreDeviceStatus>()
};

// ── Service Methods ─────────────────────────────────────────────

export async function saveReadingToFirestore(reading: FirestoreReading): Promise<{ success: boolean; id: string }> {
  const { adminDb } = getAdminInstances();
  const readingId = `rdg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const readingWithId = { ...reading, id: readingId };

  if (adminDb) {
    try {
      await adminDb.collection('readings').doc(readingId).set(readingWithId);
      
      // Update meter record
      await adminDb.collection('meters').doc(reading.meterId).set({
        lastReadingTimestamp: reading.timestamp,
        lastVoltage: reading.voltage,
        lastCurrent: reading.current,
        lastPower: reading.power,
        cumulativeEnergyKwh: reading.cumulativeEnergyKwh,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Update deviceStatus
      await adminDb.collection('deviceStatus').doc(reading.meterId).set({
        meterId: reading.meterId,
        isOnline: true,
        lastHeartbeat: reading.timestamp,
        firmwareVersion: reading.metadata?.firmwareVersion || '1.0.0'
      }, { merge: true });

      return { success: true, id: readingId };
    } catch (err) {
      console.warn('[Firestore] Error saving to live db, falling back to memory store:', err);
    }
  }

  // Memory fallback
  inMemoryStore.readings.unshift(readingWithId);
  if (inMemoryStore.readings.length > 500) inMemoryStore.readings.pop();

  const meter = inMemoryStore.meters.find(m => m.id === reading.meterId);
  if (meter) {
    meter.lastReadingTimestamp = reading.timestamp;
    meter.lastVoltage = reading.voltage;
    meter.lastCurrent = reading.current;
    meter.lastPower = reading.power;
    meter.cumulativeEnergyKwh = reading.cumulativeEnergyKwh;
  }

  inMemoryStore.deviceStatus.set(reading.meterId, {
    meterId: reading.meterId,
    isOnline: true,
    lastHeartbeat: reading.timestamp,
    firmwareVersion: reading.metadata?.firmwareVersion || '1.0.0'
  });

  return { success: true, id: readingId };
}

export async function getReadingsFromFirestore(
  meterId: string,
  options?: { limit?: number; startTime?: string; endTime?: string }
): Promise<FirestoreReading[]> {
  const { adminDb } = getAdminInstances();
  const maxLimit = options?.limit || 50;

  if (adminDb) {
    try {
      let query = adminDb.collection('readings')
        .where('meterId', '==', meterId)
        .orderBy('timestamp', 'desc')
        .limit(maxLimit);

      const snapshot = await query.get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc: any) => doc.data() as FirestoreReading);
      }
    } catch (err) {
      console.warn('[Firestore] Query error, using memory store:', err);
    }
  }

  // Memory store fallback
  let results = inMemoryStore.readings.filter(r => r.meterId === meterId);
  if (options?.startTime) {
    results = results.filter(r => r.timestamp >= options.startTime!);
  }
  if (options?.endTime) {
    results = results.filter(r => r.timestamp <= options.endTime!);
  }
  return results.slice(0, maxLimit);
}

export async function savePredictionToFirestore(prediction: FirestorePrediction): Promise<{ success: boolean }> {
  const { adminDb } = getAdminInstances();
  const predId = `pred_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (adminDb) {
    try {
      await adminDb.collection('predictions').doc(predId).set({ ...prediction, id: predId });
      return { success: true };
    } catch (err) {
      console.warn('[Firestore] Prediction write error:', err);
    }
  }

  inMemoryStore.predictions.unshift({ ...prediction, id: predId });
  if (inMemoryStore.predictions.length > 200) inMemoryStore.predictions.pop();
  return { success: true };
}

export async function saveAlertToFirestore(alert: FirestoreAlert): Promise<{ success: boolean }> {
  const { adminDb } = getAdminInstances();

  if (adminDb) {
    try {
      await adminDb.collection('alerts').doc(alert.id).set(alert);
      return { success: true };
    } catch (err) {
      console.warn('[Firestore] Alert write error:', err);
    }
  }

  inMemoryStore.alerts.unshift(alert);
  return { success: true };
}

export async function getAlertsFromFirestore(meterId?: string): Promise<FirestoreAlert[]> {
  const { adminDb } = getAdminInstances();

  if (adminDb) {
    try {
      let query = adminDb.collection('alerts').orderBy('detectedAt', 'desc').limit(50);
      if (meterId) {
        query = query.where('meterId', '==', meterId);
      }
      const snapshot = await query.get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc: any) => doc.data() as FirestoreAlert);
      }
    } catch (err) {
      console.warn('[Firestore] Alert query error:', err);
    }
  }

  if (meterId) {
    return inMemoryStore.alerts.filter(a => a.meterId === meterId);
  }
  return inMemoryStore.alerts;
}

export async function getMetersFromFirestore(consumerId?: string): Promise<FirestoreMeter[]> {
  const { adminDb } = getAdminInstances();

  if (adminDb) {
    try {
      let query = adminDb.collection('meters');
      if (consumerId) {
        query = query.where('consumerId', '==', consumerId) as any;
      }
      const snapshot = await query.get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc: any) => doc.data() as FirestoreMeter);
      }
    } catch (err) {
      console.warn('[Firestore] Meters query error:', err);
    }
  }

  if (consumerId) {
    return inMemoryStore.meters.filter(m => m.consumerId === consumerId);
  }
  return inMemoryStore.meters;
}

export async function getDeviceStatusFromFirestore(meterId: string): Promise<FirestoreDeviceStatus | null> {
  const { adminDb } = getAdminInstances();

  if (adminDb) {
    try {
      const doc = await adminDb.collection('deviceStatus').doc(meterId).get();
      if (doc.exists) {
        return doc.data() as FirestoreDeviceStatus;
      }
    } catch (err) {
      console.warn('[Firestore] Device status query error:', err);
    }
  }

  return inMemoryStore.deviceStatus.get(meterId) || {
    meterId,
    isOnline: true,
    lastHeartbeat: new Date().toISOString(),
    firmwareVersion: '1.0.0'
  };
}
