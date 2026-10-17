# PowerGuard AI — Deployment Guide

This document provides complete instructions for deploying the **PowerGuard AI** platform to production.

---

## 📌 Deployment Overview

| Component | Target Platform | Description |
| :--- | :--- | :--- |
| **Frontend & Serverless API** | **Vercel** *(Recommended)* | Next.js 15 App Router, React 19 Dashboards, and Serverless Route Handlers (`/api/ingest`, `/api/predict`, `/api/health`, `/api/simulator`). |
| **Database & Auth** | **Firebase** | Cloud Firestore NoSQL Database & Firebase Authentication (Google OAuth, Email/Password, Phone OTP). |
| **ML Inference (Optional Python Microservice)** | **Render / Railway / Cloud Run** | FastAPI Python microservice running scikit-learn models (optional; Vercel has built-in zero-cold-start inference). |
| **Full-Stack Self-Hosted (Alternative)** | **Docker / Linux VPS** | Complete containerized deployment with MySQL, Mosquitto MQTT, Express, FastAPI, and Next.js. |

> [!IMPORTANT]
> **Netlify Deprecation / Removal Notice**:
> Netlify configuration and dependencies have been completely removed from this repository. PowerGuard AI is optimized specifically for **Vercel** to leverage Next.js 15 App Router native serverless functions, Edge Middleware, optimized image processing, and instant zero-cold-start telemetry ingestion.

---

## 🚀 Part 1: Deploying to Vercel (Recommended)

PowerGuard AI's web tier (`apps/web`) is ready for 1-click deployment on Vercel.

### Option A: Via Vercel Web Dashboard (Git Integration)

1. **Push your repository** to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." → "Project"**.
3. Import your **PowerGuard** repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Next.js` (automatically detected)
   - **Root Directory**: Click *Edit* and select `apps/web` (or leave as `./` if using the root `vercel.json`)
   - **Build Command**: `npm run build` (or `cd apps/web && npm run build` if Root Directory is `./`)
   - **Output Directory**: `.next` (or `apps/web/.next` if Root Directory is `./`)
   - **Install Command**: `npm install` (or `npm --prefix apps/web install` if Root Directory is `./`)

5. **Configure Environment Variables** in Vercel:
   Add the following environment variables under **Project Settings → Environment Variables**:

   #### Client-Side Variables (Exposed to Browser)
   | Variable | Example Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_APP_NAME` | `PowerGuard AI` | Display name of the application |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production URL on Vercel |
   | `NEXT_PUBLIC_API_URL` | `/api` | Base path for API requests |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` | Firebase Web API Key |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `powerguard-ai.firebaseapp.com` | Firebase Auth Domain |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `powerguard-ai` | Firebase Project ID |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `powerguard-ai.appspot.com` | Firebase Storage Bucket |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` | Firebase Sender ID |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123...:web:...` | Firebase App ID |

   #### Server-Side Variables (Secret — Never Exposed)
   | Variable | Example Value | Description |
   | :--- | :--- | :--- |
   | `FIREBASE_PROJECT_ID` | `powerguard-ai` | Firebase Project ID |
   | `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxx@...` | Service Account Email |
   | `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\n..."` | Service Account Private Key (keep quotes and `\n`) |
   | `IOT_DEVICE_API_KEY` | `powerguard-iot-secret-2026` | API key required by ESP32 / Simulator to ingest telemetry |
   | `AI_SERVICE_URL` | `https://your-ai-service.railway.app` | *(Optional)* URL of external Python AI service |
   | `BACKEND_URL` | `https://api.yourdomain.com` | *(Optional)* If proxying to external Express server |

6. Click **Deploy**. Vercel will build and launch your application globally on its Edge network.

---

### Option B: Via Vercel CLI

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the repository root:
   ```bash
   vercel
   ```
   Or deploy directly from `apps/web`:
   ```bash
   cd apps/web
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

---

## ⚡ Part 2: Verifying Vercel Serverless Endpoints

Once deployed to Vercel (e.g. `https://powerguard.vercel.app`):

1. **System Health Check**:
   ```bash
   curl -X GET https://your-app.vercel.app/api/health
   # Expected response: {"status":"healthy","service":"PowerGuard Web & API (Vercel)","timestamp":"..."}
   ```

2. **Ingest Test Telemetry**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/ingest \
     -H "Content-Type: application/json" \
     -H "x-api-key: powerguard-iot-secret-2026" \
     -d '{
       "meterId": "MTR-TEST-001",
       "voltage": 230.5,
       "current": 4.8,
       "activePower": 1106.4,
       "powerFactor": 0.98,
       "frequency": 50.0
     }'
   ```

3. **Evaluate ML Inference**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/predict \
     -H "Content-Type: application/json" \
     -d '{
       "voltage": 230.0,
       "current": 0.1,
       "activePower": 23.0,
       "powerFactor": 0.15
     }'
   ```

---

## 🐳 Part 3: Alternative Self-Hosted Deployment (Docker Compose)

For private intranet or on-premise utility control centers:

### Prerequisites
- Ubuntu 22.04 LTS (Minimum 4GB RAM, 2 vCPUs)
- Docker Engine & Docker Compose v2+
- Port 80, 443, 1883 (MQTT) open

### Steps
1. Clone the repository and configure `.env`:
   ```bash
   git clone https://github.com/JKarthikeyan-1108/PowerGuard_AI.git
   cd PowerGuard
   cp .env.example .env
   ```
2. Build and run containers:
   ```bash
   docker compose up --build -d
   ```
3. Initialize the database:
   ```bash
   docker exec -it powerguard-server npx prisma db push
   docker exec -it powerguard-server npm run db:seed
   ```
4. Check service status:
   ```bash
   docker compose ps
   ```

---

## 🔒 Security Best Practices

1. **Rotate Secrets Regularly**: Ensure `IOT_DEVICE_API_KEY`, `JWT_SECRET`, and `FIREBASE_PRIVATE_KEY` are kept confidential.
2. **Firestore Security Rules**: Deploy `firestore.rules` using the Firebase CLI (`firebase deploy --only firestore:rules`) to protect all collections.
3. **CORS Headers**: Configured in `vercel.json` to safely restrict or allow authorized utility origins.
4. **Environment Separation**: Always use separate Firebase projects and API keys for Development, Staging, and Production.
