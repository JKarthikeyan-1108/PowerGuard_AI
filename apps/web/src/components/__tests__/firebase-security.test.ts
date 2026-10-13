import { describe, it, expect } from 'vitest';
import type { UserRole, FirestoreReading } from '../../lib/firestore-schema';

describe('Firestore Security & Role-Based Access Contracts', () => {
  const evaluateMeterReadAccess = (userRole: UserRole, userUid: string, meterOwnerUid: string) => {
    if (['ADMIN', 'SUPER_ADMIN', 'UTILITY_OPERATOR'].includes(userRole)) {
      return true;
    }
    return userRole === 'CONSUMER' && userUid === meterOwnerUid;
  };

  it('allows Admins and Utility Operators to view any consumer meter', () => {
    expect(evaluateMeterReadAccess('ADMIN', 'admin-1', 'consumer-99')).toBe(true);
    expect(evaluateMeterReadAccess('UTILITY_OPERATOR', 'operator-1', 'consumer-99')).toBe(true);
  });

  it('allows Consumers to view only their own assigned meter', () => {
    expect(evaluateMeterReadAccess('CONSUMER', 'consumer-99', 'consumer-99')).toBe(true);
    expect(evaluateMeterReadAccess('CONSUMER', 'consumer-99', 'consumer-100')).toBe(false);
  });

  it('validates required fields for incoming sensor readings', () => {
    const validateReading = (r: Partial<FirestoreReading>) => {
      const hasRequiredKeys = Boolean(
        r.meterId &&
        r.timestamp &&
        typeof r.voltage === 'number' &&
        typeof r.current === 'number' &&
        typeof r.power === 'number' &&
        r.dataSource &&
        r.validationStatus
      );
      const isWithinPhysicalRange = (
        (r.voltage ?? 0) >= 100 && (r.voltage ?? 0) <= 350 &&
        (r.current ?? 0) >= 0 && (r.current ?? 0) <= 150
      );
      return hasRequiredKeys && isWithinPhysicalRange;
    };

    const validReading: FirestoreReading = {
      meterId: 'MTR-001',
      timestamp: new Date().toISOString(),
      voltage: 230.5,
      current: 12.4,
      power: 2850,
      cumulativeEnergyKwh: 142.1,
      frequency: 50.0,
      powerFactor: 0.95,
      dataSource: 'ESP32_PZEM004T',
      isSimulated: false,
      validationStatus: 'VALID',
    };

    expect(validateReading(validReading)).toBe(true);

    // Missing meter ID
    expect(validateReading({ ...validReading, meterId: '' })).toBe(false);

    // Out of bounds voltage
    expect(validateReading({ ...validReading, voltage: 480 })).toBe(false);
  });
});
