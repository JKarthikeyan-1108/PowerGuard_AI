# PowerGuard AI — Vercel Deployment & Production Guide

This guide walks you through deploying the complete **PowerGuard AI** full-stack prototype to Vercel from GitHub.

---

## 1. Local Pre-Deployment Verification

Before triggering a remote deployment, verify that the local build, type checking, and unit tests pass without errors:

```bash
# 1. Navigate to the web application
cd apps/web

# 2. Run TypeScript type check
npm run type-check
# Expected: Exits with code 0 (zero errors)

# 3. Run unit tests
npm run test
# Expected: 4 test files passed, 13 tests passed

# 4. Run production build
npm run build
# Expected: Compiled successfully in ~10s, 47 static/serverless routes generated
```

---

## 2. Commit & Push to GitHub

Stage and commit all changes, then push to your repository:

```bash
git add .
git commit -m "feat: complete PowerGuard AI prototype with Kaggle ML, Firebase, and Vercel endpoints"
git push origin main
```

---

## 3. Deploying to Vercel (Step-by-Step)

### Step 3.1: Import Project in Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository (`JKarthikeyan-1108/PowerGuard_AI` or your fork).
4. Under **Configure Project**:
   - **Framework Preset**: Select `Next.js`.
   - **Root Directory**: Click `Edit` and select `apps/web` (recommended for standard Next.js monorepo setups).
     *(Note: If you leave Root Directory as `./`, Vercel will automatically read the root `vercel.json`)*.
   - **Build Command**: `next build` (or leave default).
   - **Output Directory**: `.next` (or leave default).
   - **Install Command**: `npm install` (or leave default).

### Step 3.2: Configure Environment Variables

Under **Environment Variables** in the Vercel project configuration, add the following variables:

#### Frontend & Firebase Client (Exposed to Browser)
| Variable Name | Example / Description |
| :--- | :--- |
| `NEXT_PUBLIC_APP_NAME` | `PowerGuard AI` |
| `NEXT_PUBLIC_APP_URL` | `https://<your-vercel-deployment>.vercel.app` |
| `NEXT_PUBLIC_API_URL` | `/api` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `powerguard-ai.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `powerguard-ai` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `powerguard-ai.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789012:web:abcdef123456` |

#### Serverless & Firebase Admin (SERVER-SIDE ONLY — NEVER EXPOSE)
| Variable Name | Example / Description |
| :--- | :--- |
| `FIREBASE_PROJECT_ID` | `powerguard-ai` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@powerguard-ai.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\nMIIEvgIB...-----END PRIVATE KEY-----\n"` |
| `IOT_DEVICE_API_KEY` | `powerguard-iot-secret-2026` |

> **IMPORTANT TIP ON FIREBASE PRIVATE KEY**:  
> In Vercel, paste the `FIREBASE_PRIVATE_KEY` including the quotes and `\n` characters, or use the single-line `FIREBASE_SERVICE_ACCOUNT_JSON` string. PowerGuard's `firebase-admin.ts` automatically handles newline expansion (`.replace(/\\n/g, '\n')`).

5. Click **Deploy**.

---

## 4. Post-Deployment Verification Checklist

Once the deployment completes and Vercel issues a production URL (e.g., `https://powerguard-ai.vercel.app`), verify each critical component:

### 1. Health Endpoint Verification
```bash
curl -X GET https://<your-deployment>.vercel.app/api/health
```
**Expected Response**:
```json
{
  "status": "healthy",
  "service": "PowerGuard AI Platform",
  "mlEngine": { "status": "active", "version": "v1.0" },
  "firebase": { "clientConfigured": true }
}
```

### 2. ML Prediction Endpoint Verification
Test anomaly scoring directly against the deployed serverless function:
```bash
curl -X POST https://<your-deployment>.vercel.app/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "MTR-001",
    "voltage": 230.5,
    "current": 12.4,
    "power": 2850,
    "powerFactor": 0.95,
    "frequency": 50.0
  }'
```
**Expected Result**: `isAnomaly: false`, `riskLevel: "NORMAL"`.

Test anomaly detection with a simulated meter bypass (near-zero current):
```bash
curl -X POST https://<your-deployment>.vercel.app/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "MTR-002",
    "voltage": 229.0,
    "current": 0.08,
    "power": 18,
    "powerFactor": 0.40,
    "frequency": 50.0
  }'
```
**Expected Result**: `isAnomaly: true`, `riskLevel: "HIGH_RISK"`, explanation identifying current shunt bypass.

### 3. IoT Sensor Ingestion Verification
Send a reading using the sensor simulator or curl:
```bash
python scripts/sensor_simulator.py --url https://<your-deployment>.vercel.app/api/ingest --iterations 5
```

### 4. Dashboard Visual Verification
Open `https://<your-deployment>.vercel.app` in your browser:
- Log in using demo credentials or register a new user.
- Verify that Consumer, Utility, and Administrator dashboards render with responsive charts and telemetry feeds.
- Verify that simulated readings display the `[Demo / Simulated]` badge while real readings show the `[ESP32 Hardware]` badge.

---

## 5. Troubleshooting & Solutions

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Build fails with missing dependency** | Vercel cached old node_modules | In Vercel Project Settings, check **Redeploy with existing build cache** disabled, or run `npm run build` locally to confirm package-lock.json is committed. |
| **API routes return 401 Unauthorized** | Missing or mismatched `IOT_DEVICE_API_KEY` | Ensure `IOT_DEVICE_API_KEY` in Vercel environment variables matches the `x-api-key` header sent by ESP32 or simulator. |
| **Firebase Admin initialization error** | Malformed Private Key with literal backslashes | Ensure the private key in Vercel has quotes or set `FIREBASE_SERVICE_ACCOUNT_JSON` containing the raw JSON object string. |
| **CORS errors on API calls** | Request origin not allowed | `vercel.json` includes permissive CORS headers for `/api/*`. Verify that client requests include standard headers. |
| **Serverless Function timeout (>10s)** | Heavy external service connection hang | The built-in Isolation Forest runs locally within 5ms. If `AI_SERVICE_URL` is configured, verify that the external Python host is responsive. |
