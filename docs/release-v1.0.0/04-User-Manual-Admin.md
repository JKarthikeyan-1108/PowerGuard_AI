# Admin User Manual

As a System Administrator, you have full access to the PowerGuard platform, including system monitoring, user management, and AI model configurations.

## 1. Dashboard & System Health
- **Navigation:** Click on `System Health` or `Monitoring` in the sidebar.
- **Monitoring Dashboard:** Provides a real-time overview of CPU, Memory, API request rates, Socket.IO connections, and MQTT broker health.
- **Action:** If a service shows `DEGRADED` or `DOWN`, check the respective logs via the server terminal or log aggregation tool.

## 2. Managing Users & Roles
- **Navigation:** Click on `Users`.
- **Function:** Create new users, reset passwords, and assign roles (`CONSUMER`, `UTILITY_OFFICER`, `ADMIN`).
- **Best Practice:** Ensure utility officers only have access to their designated zones if zone restrictions are applied.

## 3. Meter & Transformer Management
- **Navigation:** Click on `Meters` or `Transformers`.
- **Function:** Provision new IoT smart meters, associate them with consumers, and link them to specific grid transformers.
- **Status:** You can manually override a meter's status to `FAULTY` or `MAINTENANCE`.

## 4. Demo Mode
- **Navigation:** Click on `Demo Mode`.
- **Function:** The demo mode allows you to simulate real-world IoT data for presentations or testing.
- **Usage:** Select scenarios (e.g., Electricity Theft, Transformer Failure), set the simulation speed, and click "Start Demo". You can also click "Run Presentation" for an automated sequence of events.
- **Warning:** Simulated data generates real alerts in the system. Use this primarily on staging environments or for demonstration purposes.

## 5. Audit Logs
- **Navigation:** Click on `Audit Logs`.
- **Function:** View a cryptographic, tamper-evident log of all sensitive actions performed in the system (e.g., user creation, meter provisioning, alert dismissal).
