export interface DownloadReportQuery {
  format?: 'pdf' | 'excel' | 'csv';
  type?: 'alerts' | 'billing' | 'theft' | 'energy' | 'revenue' | 'loss' | 'co2';
}
