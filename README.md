# ⚡ PowerGuard

**Intelligent Smart Electricity Theft Detection and Energy Analytics using AI, Machine Learning & IoT**

Enterprise-grade SaaS platform for real-time electricity monitoring, AI-powered theft detection, demand forecasting, and comprehensive energy analytics.

- **AI & Analytics**: Predicts energy consumption patterns and detects potential theft using advanced machine learning models.
- **Enterprise Security**: Role-based access control, secure HttpOnly cookies, API rate limiting, and comprehensive audit logging.

## Documentation

- 📖 [Deployment Guide](DEPLOYMENT.md) - Instructions for setting up PowerGuard in production using Docker.
- 🧪 [Testing Guide](TESTING.md) - Instructions for running Unit, Integration, and E2E tests across the stack.

---

## 🏗️ Architecture

| Service | Tech Stack | Port |
|---------|-----------|------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Shadcn UI | `5173` (dev) / `3000` (prod) |
| **Backend** | Node.js, Express, Prisma ORM, Socket.IO, JWT | `4000` |
| **AI Service** | FastAPI, scikit-learn, XGBoost, KMeans | `8000` |
| **Database** | MySQL 8 | `3306` |
| **MQTT Broker** | Eclipse Mosquitto | `1883` |
| **Reverse Proxy** | Nginx | `80` |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- MySQL 8
- (Optional) Docker & Docker Compose

### 1. Clone & Configure

```bash
git clone <repository-url>
cd PowerGuard
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Start the Backend

```bash
cd apps/server
npm install
npx prisma generate
npx prisma db push
npm run db:seed    # Seed with 50 consumers, 200 meters, 100K+ readings
npm run dev
```

### 3. Start the Frontend

```bash
cd apps/web
npm install
npm run dev        # Opens at http://localhost:5173
```

### 4. Start the AI Service

```bash
cd apps/ai
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 5. Docker (Full Stack)

```bash
docker compose up --build
# App: http://localhost:80
```

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@powerguard.io | Password123 |
| **Utility Officer** | james.wilson@powerguard.io | Password123 |
| **Consumer** | alice.anderson@email.com | Password123 |

## 🤖 AI/ML Models

| Model | Algorithm | Purpose | Accuracy |
|-------|-----------|---------|----------|
| Theft Detection | Isolation Forest + Random Forest | Anomaly detection & classification | 94.2% |
| Bill Prediction | Linear Regression | Monthly bill forecasting | 87.6% |
| Demand Forecast | Statistical Decomposition | Area demand prediction | 89.0% |
| Consumer Clustering | KMeans | Usage pattern segmentation | N/A |

## 📊 API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register consumer
- `POST /api/auth/refresh` — Refresh token
- `GET /api/auth/profile` — Get profile

### Resources
- `GET/POST /api/users` — User management
- `GET/POST /api/meters` — Meter management
- `GET /api/alerts` — Alert management
- `GET /api/analytics/overview` — Dashboard stats
- `GET /api/transformers` — Transformer monitoring
- `GET /api/notifications` — Notifications
- `GET /api/audit-logs` — Audit trail
- `GET /api/system/health` — System health

### AI Service
- `POST /api/ai/detect-theft` — Run theft detection
- `POST /api/ai/predict-bill` — Predict monthly bill
- `POST /api/ai/forecast-demand` — Forecast demand
- `POST /api/ai/cluster-consumers` — Consumer clustering
- `GET /api/ai/models` — List ML models

## 🗂️ Project Structure

```
PowerGuard/
├── apps/
│   ├── web/          # React 19 + Vite + Shadcn UI
│   ├── server/       # Express + Prisma + Socket.IO
│   └── ai/           # FastAPI + scikit-learn + XGBoost
├── docker/           # Dockerfiles & Nginx config
├── docker-compose.yml
└── .github/workflows/
```

## 📄 License

MIT — Built for enterprise energy intelligence.
