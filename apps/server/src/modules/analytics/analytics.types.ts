export interface AnalyticsDashboardResponse {
  totalMeters: number;
  totalConsumers: number;
  activeAlerts: number;
  highRiskTheftsLast30Days: number;
  totalConsumptionLast30Days: number;
}

export interface TheftHeatmapData {
  id: string;
  lat: number | null;
  lng: number | null;
  riskLevel?: string;
  probability?: number;
}
