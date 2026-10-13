import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveReadingToFirestore } from '@/lib/firestore-service';
import type { FirestoreReading, DataSource } from '@/lib/firestore-schema';

const IngestPayloadSchema = z.object({
  meterId: z.string().min(1, 'Meter ID is required'),
  consumerId: z.string().optional(),
  voltage: z.number().min(100, 'Voltage too low (<100V)').max(350, 'Voltage too high (>350V)'),
  current: z.number().min(0, 'Current cannot be negative').max(150, 'Current exceeds 150A limit'),
  power: z.number().min(0, 'Power cannot be negative').max(50000, 'Power exceeds 50kW limit'),
  powerFactor: z.number().min(0, 'Power factor minimum 0.0').max(1.0, 'Power factor maximum 1.0'),
  frequency: z.number().min(45, 'Frequency out of range (<45Hz)').max(65, 'Frequency out of range (>65Hz)').default(50.0),
  cumulativeEnergyKwh: z.number().min(0, 'Cumulative energy cannot be negative').default(0),
  timestamp: z.string().optional(),
  dataSource: z.enum(['ESP32_PZEM004T', 'SIMULATOR_NORMAL', 'SIMULATOR_THEFT', 'BENCHMARK']).default('ESP32_PZEM004T'),
  isSimulated: z.boolean().default(false),
  metadata: z.object({
    firmwareVersion: z.string().optional(),
    wifiRssi: z.number().optional(),
    sensorStatus: z.string().optional(),
  }).optional(),
});

const DEFAULT_API_KEYS = new Set([
  'pg-sim-key-2026',
  'esp32-pzem004t-key-auth',
  process.env.IOT_DEVICE_API_KEY || 'powerguard-iot-secret-2026',
]);

export async function POST(req: NextRequest) {
  try {
    // 1. Device Authentication
    const apiKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '') ||
      new URL(req.url).searchParams.get('apiKey');

    // In production, reject if not authenticated
    const isDev = process.env.NODE_ENV !== 'production';
    if (!apiKey || (!DEFAULT_API_KEYS.has(apiKey) && !isDev)) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Valid x-api-key header or Bearer token required for smart meter ingestion.',
        },
        { status: 401 }
      );
    }

    // 2. Validate Payload
    const body = await req.json();
    const parseResult = IngestPayloadSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Malformed or out-of-range sensor reading',
          validationErrors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const readingTimestamp = data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString();

    const readingRecord: FirestoreReading = {
      meterId: data.meterId,
      consumerId: data.consumerId,
      timestamp: readingTimestamp,
      voltage: parseFloat(data.voltage.toFixed(2)),
      current: parseFloat(data.current.toFixed(3)),
      power: parseFloat(data.power.toFixed(2)),
      cumulativeEnergyKwh: parseFloat(data.cumulativeEnergyKwh.toFixed(4)),
      frequency: parseFloat(data.frequency.toFixed(2)),
      powerFactor: parseFloat(data.powerFactor.toFixed(3)),
      apparentPowerKva: parseFloat(((data.voltage * data.current) / 1000.0).toFixed(3)),
      dataSource: data.dataSource as DataSource,
      isSimulated: data.isSimulated || data.dataSource.startsWith('SIMULATOR'),
      validationStatus: 'VALID',
      metadata: data.metadata,
    };

    // 3. Save Reading to Firestore
    const saveResult = await saveReadingToFirestore(readingRecord);

    // 4. Automatically trigger ML Anomaly Detection
    let anomalyResult = {
      isAnomaly: false,
      anomalyScore: 0.05,
      riskLevel: 'NORMAL',
    };

    try {
      const baseUrl = req.nextUrl.origin;
      const predictRes = await fetch(`${baseUrl}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meterId: data.meterId,
          consumerId: data.consumerId,
          voltage: data.voltage,
          current: data.current,
          power: data.power,
          powerFactor: data.powerFactor,
          frequency: data.frequency,
          cumulativeEnergyKwh: data.cumulativeEnergyKwh,
          timestamp: readingTimestamp,
        }),
      });

      if (predictRes.ok) {
        const pData = await predictRes.json();
        anomalyResult = {
          isAnomaly: Boolean(pData.isAnomaly),
          anomalyScore: pData.anomalyScore,
          riskLevel: pData.riskLevel,
        };
      }
    } catch (err) {
      console.warn('[Ingest] Prediction trigger warning:', err);
    }

    return NextResponse.json(
      {
        status: 'success',
        readingId: saveResult.id,
        meterId: data.meterId,
        timestamp: readingTimestamp,
        validationStatus: 'VALID',
        isSimulated: readingRecord.isSimulated,
        mlInference: anomalyResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      { error: 'Internal ingestion error', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
