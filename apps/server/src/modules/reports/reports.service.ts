import { reportsRepository } from './reports.repository';
import { reportService as documentService } from '../../services/report.service';
import { DownloadReportQuery } from './reports.types';
import { AppError } from '../../middleware/errorHandler';

export class ReportsService {
  async generateReport(query: DownloadReportQuery) {
    const { format, type } = query;

    if (type === 'alerts') {
      const recentAlerts = await reportsRepository.getRecentAlerts();

      const reportData = recentAlerts.map((alert: any) => ({
        ID: alert.id,
        METER_SERIAL: alert.meter.serialNumber,
        TYPE: alert.type,
        SEVERITY: alert.severity,
        MESSAGE: alert.message,
        DATE: alert.createdAt.toLocaleString()
      }));

      if (format === 'pdf') {
        const severityCounts = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
        recentAlerts.forEach((a: any) => { 
          severityCounts[a.severity as keyof typeof severityCounts] = (severityCounts[a.severity as keyof typeof severityCounts] || 0) + 1; 
        });
        
        const chartConfig = {
          type: 'bar',
          data: {
            labels: Object.keys(severityCounts),
            datasets: [{ label: 'Alerts', data: Object.values(severityCounts) }]
          }
        };

        const buffer = await documentService.generatePDF('Alerts Report', reportData, chartConfig);
        return { buffer, contentType: 'application/pdf', filename: 'Alerts_Report.pdf' };
      } 
      
      if (format === 'excel') {
        const buffer = await documentService.generateExcel('Alerts', reportData);
        return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'Alerts_Report.xlsx' };
      }
      
      if (format === 'csv') {
        const buffer = await documentService.generateCSV(reportData);
        return { buffer, contentType: 'text/csv', filename: 'Alerts_Report.csv' };
      }
    }

    if (type === 'billing') {
      const consumers = await reportsRepository.getRecentConsumers();
      const billingData = consumers.map((c: any) => ({
        ID: c.id,
        NAME: `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.trim(),
        TYPE: c.connectionType,
        JOIN_DATE: c.createdAt.toLocaleDateString()
      }));

      if (format === 'excel') {
        const buffer = await documentService.generateExcel('Billing', billingData);
        return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'Billing_Report.xlsx' };
      }
      
      if (format === 'csv') {
        const buffer = await documentService.generateCSV(billingData);
        return { buffer, contentType: 'text/csv', filename: 'Billing_Report.csv' };
      }

      if (format === 'pdf') {
         throw new AppError('PDF format not supported for billing report currently', 400);
      }
    }

    if (type === 'theft') {
      const theftData = await reportsRepository.getTheftAnalytics();
      const formattedData = theftData.map((t: any) => ({
        ID: t.id,
        METER: t.meter.serialNumber,
        RISK_LEVEL: t.riskLevel,
        PROBABILITY: (t.probability * 100).toFixed(2) + '%',
        DATE: t.createdAt.toLocaleDateString()
      }));

      if (format === 'pdf') {
        const buffer = await documentService.generatePDF('Theft Analytics Report', formattedData);
        return { buffer, contentType: 'application/pdf', filename: 'Theft_Analytics.pdf' };
      }
      if (format === 'excel') {
        const buffer = await documentService.generateExcel('Theft', formattedData);
        return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'Theft_Analytics.xlsx' };
      }
      if (format === 'csv') {
        const buffer = await documentService.generateCSV(formattedData);
        return { buffer, contentType: 'text/csv', filename: 'Theft_Analytics.csv' };
      }
    }

    if (type === 'energy') {
      const energyData = await reportsRepository.getEnergyAnalytics();
      const formattedData = energyData.map((e: any) => ({
        ID: e.id,
        METER: e.meter.serialNumber,
        VALUE_KWH: e.value,
        ANOMALY: e.isAnomaly ? 'YES' : 'NO',
        DATE: e.timestamp.toLocaleString()
      }));

      if (format === 'pdf') {
        const buffer = await documentService.generatePDF('Energy Analytics Report', formattedData);
        return { buffer, contentType: 'application/pdf', filename: 'Energy_Analytics.pdf' };
      }
      if (format === 'excel') {
        const buffer = await documentService.generateExcel('Energy', formattedData);
        return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'Energy_Analytics.xlsx' };
      }
      if (format === 'csv') {
        const buffer = await documentService.generateCSV(formattedData);
        return { buffer, contentType: 'text/csv', filename: 'Energy_Analytics.csv' };
      }
    }

    if (type === 'revenue') {
      const revenueData = await reportsRepository.getRevenueAnalytics();
      const formattedData = revenueData.map((r: any) => ({
        ID: r.id,
        CONSUMER: `${r.consumer.user?.firstName || ''} ${r.consumer.user?.lastName || ''}`.trim(),
        MONTH: r.month.toLocaleDateString(),
        PREDICTED_BILL: `$${r.predictedAmount.toFixed(2)}`,
        CONFIDENCE: r.confidence ? `${(r.confidence * 100).toFixed(1)}%` : 'N/A'
      }));

      if (format === 'pdf') {
        const buffer = await documentService.generatePDF('Revenue Analytics Report', formattedData);
        return { buffer, contentType: 'application/pdf', filename: 'Revenue_Analytics.pdf' };
      }
      if (format === 'excel') {
        const buffer = await documentService.generateExcel('Revenue', formattedData);
        return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'Revenue_Analytics.xlsx' };
      }
      if (format === 'csv') {
        const buffer = await documentService.generateCSV(formattedData);
        return { buffer, contentType: 'text/csv', filename: 'Revenue_Analytics.csv' };
      }
    }

    if (type === 'loss') {
      const lossData = await reportsRepository.getLossAnalytics();
      const formattedData = lossData.map((l: any) => ({
        TRANSFORMER_ID: l.serialNumber,
        NAME: l.name,
        CAPACITY: l.capacity,
        CURRENT_LOAD: l.currentLoad,
        LOSS_ESTIMATE: (l.currentLoad * 0.05).toFixed(2) // 5% technical loss mock
      }));

      if (format === 'pdf') {
        const buffer = await documentService.generatePDF('Loss Analytics Report', formattedData);
        return { buffer, contentType: 'application/pdf', filename: 'Loss_Analytics.pdf' };
      }
      if (format === 'excel') {
        const buffer = await documentService.generateExcel('Loss', formattedData);
        return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'Loss_Analytics.xlsx' };
      }
      if (format === 'csv') {
        const buffer = await documentService.generateCSV(formattedData);
        return { buffer, contentType: 'text/csv', filename: 'Loss_Analytics.csv' };
      }
    }

    if (type === 'co2') {
      const co2Data = await reportsRepository.getCO2Analytics();
      const formattedData = co2Data.map((c: any) => ({
        RECOMMENDATION: c.title,
        CONSUMER: `${c.consumer.user?.firstName || ''} ${c.consumer.user?.lastName || ''}`.trim(),
        ESTIMATED_SAVINGS_KWH: c.estimatedSavings,
        CO2_REDUCTION_KG: (c.estimatedSavings * 0.707).toFixed(2) // EPA avg 0.707 kg/kWh
      }));

      if (format === 'pdf') {
        const buffer = await documentService.generatePDF('CO2 Savings Report', formattedData);
        return { buffer, contentType: 'application/pdf', filename: 'CO2_Savings.pdf' };
      }
      if (format === 'excel') {
        const buffer = await documentService.generateExcel('CO2', formattedData);
        return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'CO2_Savings.xlsx' };
      }
      if (format === 'csv') {
        const buffer = await documentService.generateCSV(formattedData);
        return { buffer, contentType: 'text/csv', filename: 'CO2_Savings.csv' };
      }
    }

    throw new AppError('Invalid format or type requested', 400);
  }
}

export const reportsService = new ReportsService();
