import { NextResponse } from 'next/server';
import { isFirebaseConfigured } from '@/lib/firebase';
import { isFirebaseAdminConfigured } from '@/lib/firebase-admin';
import modelMetadata from '@/lib/ml-artifacts/model_metadata.json';

export async function GET() {
  const uptime = process.uptime();

  return NextResponse.json({
    status: 'healthy',
    service: 'PowerGuard AI Platform',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(uptime),
    mlEngine: {
      status: 'active',
      modelName: modelMetadata.model_name,
      version: modelMetadata.model_version,
      algorithm: modelMetadata.algorithm,
      featureCount: modelMetadata.feature_count,
    },
    firebase: {
      clientConfigured: isFirebaseConfigured,
      adminConfigured: isFirebaseAdminConfigured,
      mode: isFirebaseConfigured ? 'cloud' : 'standalone-fallback',
    },
    endpoints: {
      predict: '/api/predict',
      ingest: '/api/ingest',
      simulator: '/api/simulator',
      health: '/api/health',
    },
  });
}
