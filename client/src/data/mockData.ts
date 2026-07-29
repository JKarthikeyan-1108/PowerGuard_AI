// ============================================================
// PowerGuard - Mock Data for Frontend Development
// Provides realistic data for all dashboards without backend
// ============================================================

import type {
  User, MeterReading, Alert, Notification, Recommendation,
  ChartDataPoint, AreaConsumption, TransformerStatus,
  InspectionItem, HighRiskConsumer, MonthlyReport,
  SystemLog, SmartMeter, TheftDetection
} from '../types';

// ============================================================
// Users
// ============================================================
export const mockUsers: User[] = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh@consumer.com', role: 'consumer', phone: '+91 98765 43210', createdAt: '2025-01-15', lastLogin: '2026-07-29T12:30:00' },
  { id: '2', name: 'Priya Sharma', email: 'priya@utility.com', role: 'utility', phone: '+91 87654 32109', createdAt: '2025-02-20', lastLogin: '2026-07-29T10:15:00' },
  { id: '3', name: 'Admin User', email: 'admin@powerguard.in', role: 'admin', phone: '+91 76543 21098', createdAt: '2024-12-01', lastLogin: '2026-07-29T13:00:00' },
];

// ============================================================
// Live Meter Reading
// ============================================================
export function generateMeterReading(meterId = 'MTR-001'): MeterReading {
  const baseVoltage = 230;
  const voltageVariation = (Math.random() - 0.5) * 20;
  const voltage = baseVoltage + voltageVariation;
  const current = 0.5 + Math.random() * 9.5;
  const powerFactor = 0.7 + Math.random() * 0.3;
  const power = voltage * current * powerFactor;
  const frequency = 49.5 + Math.random() * 1.0;
  const energy = 125.5 + Math.random() * 50;

  return {
    id: `RD-${Date.now()}`,
    meterId,
    voltage: Math.round(voltage * 10) / 10,
    current: Math.round(current * 100) / 100,
    power: Math.round(power * 10) / 10,
    energy: Math.round(energy * 100) / 100,
    frequency: Math.round(frequency * 100) / 100,
    powerFactor: Math.round(powerFactor * 100) / 100,
    timestamp: new Date().toISOString(),
    isAnomaly: Math.random() < 0.05,
  };
}

// ============================================================
// Consumption History (Last 24 hours, hourly)
// ============================================================
export function generateConsumptionHistory(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 3600000);
    const hourOfDay = hour.getHours();
    // Simulate realistic usage pattern
    let baseUsage = 0.5;
    if (hourOfDay >= 6 && hourOfDay <= 9) baseUsage = 2.5; // Morning peak
    if (hourOfDay >= 10 && hourOfDay <= 16) baseUsage = 1.5; // Day
    if (hourOfDay >= 17 && hourOfDay <= 22) baseUsage = 3.0; // Evening peak
    if (hourOfDay >= 23 || hourOfDay <= 5) baseUsage = 0.3; // Night
    
    data.push({
      name: `${hourOfDay.toString().padStart(2, '0')}:00`,
      value: Math.round((baseUsage + (Math.random() - 0.5) * 1.0) * 100) / 100,
      timestamp: hour.toISOString(),
    });
  }
  return data;
}

// ============================================================
// Monthly Consumption (Last 12 months)
// ============================================================
export function generateMonthlyConsumption(): ChartDataPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const data: ChartDataPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthIdx = (now.getMonth() - i + 12) % 12;
    // Summer months have higher usage
    let baseUsage = 180;
    if (monthIdx >= 3 && monthIdx <= 6) baseUsage = 280; // Summer
    if (monthIdx >= 10 || monthIdx <= 1) baseUsage = 220; // Winter
    data.push({
      name: months[monthIdx],
      value: Math.round(baseUsage + (Math.random() - 0.5) * 60),
      value2: Math.round((baseUsage + (Math.random() - 0.5) * 60) * 7.5), // Bill amount
    });
  }
  return data;
}

// ============================================================
// Voltage/Current History
// ============================================================
export function generateVoltageHistory(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  for (let i = 59; i >= 0; i--) {
    data.push({
      name: `${i}m`,
      value: 225 + Math.random() * 15,
    });
  }
  return data;
}

export function generateCurrentHistory(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  for (let i = 59; i >= 0; i--) {
    data.push({
      name: `${i}m`,
      value: 1 + Math.random() * 8,
    });
  }
  return data;
}

// ============================================================
// Alerts
// ============================================================
export const mockAlerts: Alert[] = [
  { id: 'ALT-001', type: 'possible_theft', title: 'Possible Energy Theft Detected', message: 'Unusual consumption pattern detected for meter MTR-047 in Sector 15. AI confidence: 87%', severity: 'high', meterId: 'MTR-047', area: 'Sector 15', timestamp: '2026-07-29T12:45:00', isRead: false, isResolved: false },
  { id: 'ALT-002', type: 'high_usage', title: 'High Usage Alert', message: 'Consumption exceeds 150% of average for consumer ID C-1024', severity: 'medium', meterId: 'MTR-012', consumerId: 'C-1024', area: 'Model Town', timestamp: '2026-07-29T11:30:00', isRead: false, isResolved: false },
  { id: 'ALT-003', type: 'meter_offline', title: 'Meter Offline', message: 'Smart meter MTR-089 has been offline for 2 hours', severity: 'medium', meterId: 'MTR-089', area: 'Civil Lines', timestamp: '2026-07-29T10:00:00', isRead: true, isResolved: false },
  { id: 'ALT-004', type: 'transformer_overload', title: 'Transformer Overload Warning', message: 'Transformer TR-05 in Industrial Area is running at 92% capacity', severity: 'high', area: 'Industrial Area', timestamp: '2026-07-29T09:15:00', isRead: false, isResolved: false },
  { id: 'ALT-005', type: 'abnormal_voltage', title: 'Voltage Fluctuation', message: 'Voltage dropped to 195V on meter MTR-034. Below safe threshold.', severity: 'critical', meterId: 'MTR-034', area: 'Green Park', timestamp: '2026-07-29T08:45:00', isRead: true, isResolved: true },
  { id: 'ALT-006', type: 'abnormal_current', title: 'Abnormal Current Spike', message: 'Current spike of 45A detected on meter MTR-056', severity: 'high', meterId: 'MTR-056', area: 'Rajpur Road', timestamp: '2026-07-29T07:30:00', isRead: false, isResolved: false },
];

// ============================================================
// Notifications
// ============================================================
export const mockNotifications: Notification[] = [
  { id: 'NOT-001', title: 'Bill Generated', message: 'Your electricity bill for July 2026 has been generated. Amount: ₹2,450', type: 'info', timestamp: '2026-07-29T12:00:00', isRead: false },
  { id: 'NOT-002', title: 'Energy Saving Tip', message: 'Switch to LED bulbs to save up to 75% on lighting costs', type: 'success', timestamp: '2026-07-28T10:00:00', isRead: true },
  { id: 'NOT-003', title: 'Maintenance Scheduled', message: 'Scheduled maintenance for your area on Aug 2, 2026. 10:00 AM - 2:00 PM', type: 'warning', timestamp: '2026-07-27T15:00:00', isRead: false },
  { id: 'NOT-004', title: 'Payment Received', message: 'Payment of ₹2,180 received. Thank you!', type: 'success', timestamp: '2026-07-25T09:00:00', isRead: true },
];

// ============================================================
// Recommendations
// ============================================================
export const mockRecommendations: Recommendation[] = [
  { id: 'REC-001', title: 'Reduce AC Usage', description: 'Set your AC to 24°C instead of 20°C. Each degree saves 6% energy.', category: 'appliance', estimatedSavings: 450, priority: 'high', icon: 'Thermometer' },
  { id: 'REC-002', title: 'Switch to LED Lighting', description: 'Replace CFL/incandescent bulbs with LED. Saves 75% on lighting costs.', category: 'equipment', estimatedSavings: 320, priority: 'high', icon: 'Lightbulb' },
  { id: 'REC-003', title: 'Turn Off Standby Devices', description: 'Unplug devices when not in use. Standby power wastes 5-10% of household energy.', category: 'behavior', estimatedSavings: 180, priority: 'medium', icon: 'Power' },
  { id: 'REC-004', title: 'Shift Heavy Appliance Usage', description: 'Use washing machine and iron during off-peak hours (10 PM - 6 AM) for lower tariffs.', category: 'schedule', estimatedSavings: 250, priority: 'medium', icon: 'Clock' },
  { id: 'REC-005', title: 'Install Solar Panels', description: 'A 3kW rooftop solar system can offset 70% of your electricity bill.', category: 'equipment', estimatedSavings: 1800, priority: 'low', icon: 'Sun' },
  { id: 'REC-006', title: 'Use 5-Star Rated Appliances', description: 'When replacing appliances, choose 5-star BEE rated products for 30-40% less energy use.', category: 'equipment', estimatedSavings: 400, priority: 'medium', icon: 'Star' },
];

// ============================================================
// Area Consumption (Utility)
// ============================================================
export const mockAreaConsumption: AreaConsumption[] = [
  { area: 'Sector 15', consumption: 45200, consumers: 1250, avgUsage: 36.2, trend: 'up' },
  { area: 'Model Town', consumption: 38700, consumers: 980, avgUsage: 39.5, trend: 'stable' },
  { area: 'Civil Lines', consumption: 52100, consumers: 1450, avgUsage: 35.9, trend: 'down' },
  { area: 'Industrial Area', consumption: 125000, consumers: 320, avgUsage: 390.6, trend: 'up' },
  { area: 'Green Park', consumption: 28900, consumers: 750, avgUsage: 38.5, trend: 'stable' },
  { area: 'Rajpur Road', consumption: 41300, consumers: 1100, avgUsage: 37.5, trend: 'down' },
  { area: 'Nehru Colony', consumption: 33400, consumers: 890, avgUsage: 37.5, trend: 'up' },
  { area: 'Gandhi Nagar', consumption: 36800, consumers: 920, avgUsage: 40.0, trend: 'stable' },
];

// ============================================================
// Transformer Status (Utility)
// ============================================================
export const mockTransformerStatus: TransformerStatus[] = [
  { id: 'TR-01', name: 'Sector 15 Main', area: 'Sector 15', load: 78, capacity: 500, status: 'normal', temperature: 62 },
  { id: 'TR-02', name: 'Model Town Sub', area: 'Model Town', load: 65, capacity: 350, status: 'normal', temperature: 58 },
  { id: 'TR-03', name: 'Civil Lines Main', area: 'Civil Lines', load: 85, capacity: 500, status: 'warning', temperature: 71 },
  { id: 'TR-04', name: 'Green Park Sub', area: 'Green Park', load: 45, capacity: 250, status: 'normal', temperature: 52 },
  { id: 'TR-05', name: 'Industrial Main', area: 'Industrial Area', load: 92, capacity: 1000, status: 'critical', temperature: 85 },
  { id: 'TR-06', name: 'Rajpur Road Sub', area: 'Rajpur Road', load: 55, capacity: 350, status: 'normal', temperature: 55 },
];

// ============================================================
// High Risk Consumers (Utility)
// ============================================================
export const mockHighRiskConsumers: HighRiskConsumer[] = [
  { consumerId: 'C-1047', name: 'Vikram Singh', meterId: 'MTR-047', area: 'Sector 15', riskScore: 87, riskLevel: 'high', confidence: 92, reasons: ['Sudden 300% usage increase', 'Irregular consumption pattern', 'Meter tamper flag'], trend: 'increasing' },
  { consumerId: 'C-1089', name: 'Deepak Verma', meterId: 'MTR-089', area: 'Civil Lines', riskScore: 74, riskLevel: 'high', confidence: 85, reasons: ['Meter offline frequently', 'Usage during off-hours only'], trend: 'stable' },
  { consumerId: 'C-1056', name: 'Suresh Patel', meterId: 'MTR-056', area: 'Rajpur Road', riskScore: 68, riskLevel: 'medium', confidence: 78, reasons: ['Current spikes detected', 'Abnormal power factor'], trend: 'increasing' },
  { consumerId: 'C-1023', name: 'Meena Devi', meterId: 'MTR-023', area: 'Model Town', riskScore: 55, riskLevel: 'medium', confidence: 71, reasons: ['Usage pattern mismatch', 'Low power factor'], trend: 'decreasing' },
  { consumerId: 'C-1078', name: 'Ramesh Gupta', meterId: 'MTR-078', area: 'Gandhi Nagar', riskScore: 42, riskLevel: 'low', confidence: 65, reasons: ['Slight deviation from pattern'], trend: 'stable' },
];

// ============================================================
// Inspection Queue (Utility)
// ============================================================
export const mockInspectionQueue: InspectionItem[] = [
  { id: 'INS-001', consumerId: 'C-1047', consumerName: 'Vikram Singh', meterId: 'MTR-047', area: 'Sector 15', riskLevel: 'high', riskScore: 87, reason: 'AI detected 300% usage anomaly', status: 'pending' },
  { id: 'INS-002', consumerId: 'C-1089', consumerName: 'Deepak Verma', meterId: 'MTR-089', area: 'Civil Lines', riskLevel: 'high', riskScore: 74, reason: 'Meter frequently goes offline', status: 'in_progress', scheduledDate: '2026-07-30' },
  { id: 'INS-003', consumerId: 'C-1056', consumerName: 'Suresh Patel', meterId: 'MTR-056', area: 'Rajpur Road', riskLevel: 'medium', riskScore: 68, reason: 'Current spike detected', status: 'pending' },
  { id: 'INS-004', consumerId: 'C-1034', consumerName: 'Amit Kumar', meterId: 'MTR-034', area: 'Green Park', riskLevel: 'medium', riskScore: 52, reason: 'Voltage anomaly detected', status: 'completed' },
];

// ============================================================
// Monthly Reports (Utility)
// ============================================================
export const mockMonthlyReports: MonthlyReport[] = [
  { month: 'Jul 2026', totalConsumption: 401500, totalRevenue: 30112500, theftDetected: 12, newConnections: 45, disconnections: 8 },
  { month: 'Jun 2026', totalConsumption: 385200, totalRevenue: 28890000, theftDetected: 9, newConnections: 52, disconnections: 5 },
  { month: 'May 2026', totalConsumption: 358900, totalRevenue: 26917500, theftDetected: 15, newConnections: 38, disconnections: 11 },
  { month: 'Apr 2026', totalConsumption: 342100, totalRevenue: 25657500, theftDetected: 7, newConnections: 41, disconnections: 6 },
];

// ============================================================
// Smart Meters
// ============================================================
export const mockMeters: SmartMeter[] = [
  { id: '1', meterId: 'MTR-001', consumerId: 'C-1001', consumerName: 'Rajesh Kumar', area: 'Sector 15', location: { lat: 28.6139, lng: 77.2090, address: 'A-12, Sector 15' }, status: 'active', installedDate: '2025-01-15' },
  { id: '2', meterId: 'MTR-002', consumerId: 'C-1002', consumerName: 'Anita Sharma', area: 'Model Town', location: { lat: 28.7041, lng: 77.1025, address: 'B-45, Model Town' }, status: 'active', installedDate: '2025-02-20' },
  { id: '3', meterId: 'MTR-003', consumerId: 'C-1003', consumerName: 'Mohammed Ali', area: 'Civil Lines', location: { lat: 28.6829, lng: 77.2210, address: 'C-78, Civil Lines' }, status: 'active', installedDate: '2025-03-10' },
  { id: '4', meterId: 'MTR-047', consumerId: 'C-1047', consumerName: 'Vikram Singh', area: 'Sector 15', location: { lat: 28.6150, lng: 77.2100, address: 'D-23, Sector 15' }, status: 'tampered', installedDate: '2025-04-05' },
  { id: '5', meterId: 'MTR-089', consumerId: 'C-1089', consumerName: 'Deepak Verma', area: 'Civil Lines', location: { lat: 28.6840, lng: 77.2230, address: 'E-56, Civil Lines' }, status: 'inactive', installedDate: '2025-05-12' },
];

// ============================================================
// Theft Detections
// ============================================================
export const mockTheftDetections: TheftDetection[] = [
  { consumerId: 'C-1047', meterId: 'MTR-047', riskScore: 87, riskLevel: 'high', confidence: 92, reasons: ['Sudden 300% usage increase', 'Irregular pattern', 'Meter tamper flag'], detectedAt: '2026-07-29T12:45:00', model: 'xgboost' },
  { consumerId: 'C-1089', meterId: 'MTR-089', riskScore: 74, riskLevel: 'high', confidence: 85, reasons: ['Meter offline frequently', 'Usage only during off-hours'], detectedAt: '2026-07-29T10:30:00', model: 'random_forest' },
  { consumerId: 'C-1056', meterId: 'MTR-056', riskScore: 68, riskLevel: 'medium', confidence: 78, reasons: ['Current spikes', 'Abnormal power factor'], detectedAt: '2026-07-28T15:20:00', model: 'isolation_forest' },
];

// ============================================================
// System Logs (Admin)
// ============================================================
export const mockSystemLogs: SystemLog[] = [
  { id: 'LOG-001', level: 'info', message: 'User login: admin@powerguard.in', source: 'auth-service', timestamp: '2026-07-29T13:00:00' },
  { id: 'LOG-002', level: 'warn', message: 'High memory usage: 85%', source: 'system-monitor', timestamp: '2026-07-29T12:55:00' },
  { id: 'LOG-003', level: 'error', message: 'ML model prediction timeout for consumer C-1089', source: 'ml-service', timestamp: '2026-07-29T12:50:00' },
  { id: 'LOG-004', level: 'info', message: 'Theft alert generated for MTR-047', source: 'alert-service', timestamp: '2026-07-29T12:45:00' },
  { id: 'LOG-005', level: 'info', message: 'Smart meter simulator started with 5s interval', source: 'simulator', timestamp: '2026-07-29T12:30:00' },
  { id: 'LOG-006', level: 'debug', message: 'Database connection pool: 8/20 active', source: 'db-service', timestamp: '2026-07-29T12:25:00' },
  { id: 'LOG-007', level: 'info', message: 'Report generated: Monthly consumption July 2026', source: 'report-service', timestamp: '2026-07-29T12:00:00' },
  { id: 'LOG-008', level: 'warn', message: 'API rate limit approaching for consumer API', source: 'api-gateway', timestamp: '2026-07-29T11:45:00' },
];

// ============================================================
// Demand Forecast Data
// ============================================================
export function generateDemandForecast(period: 'tomorrow' | 'next_week' | 'next_month'): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let points = 24;
  let labels: string[] = [];

  if (period === 'tomorrow') {
    points = 24;
    labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  } else if (period === 'next_week') {
    points = 7;
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  } else {
    points = 30;
    labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  }

  for (let i = 0; i < points; i++) {
    let baseValue = 15000;
    if (period === 'tomorrow') {
      const hour = i;
      if (hour >= 6 && hour <= 9) baseValue = 22000;
      if (hour >= 17 && hour <= 22) baseValue = 28000;
      if (hour >= 23 || hour <= 5) baseValue = 8000;
    }
    data.push({
      name: labels[i],
      value: Math.round(baseValue + (Math.random() - 0.5) * 5000),
      value2: Math.round(baseValue * 0.95 + (Math.random() - 0.5) * 3000), // Last period comparison
    });
  }
  return data;
}
