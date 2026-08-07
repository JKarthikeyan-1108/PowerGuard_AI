import cron from 'node-cron';
import logger from '../config/logger';
import { reportService } from './report.service';
import { emailService } from './email.service';
import prisma from '../config/database';
import { monitoringService } from './monitoring.service';

class SchedulerService {
  public start() {
    // 1. Daily Operations Report - Runs every day at 00:00 (Midnight)
    cron.schedule('0 0 * * *', async () => {
      logger.info('Running scheduled job: Daily Operations Report');
      await this.generateAndSendDailyReport();
    });

    // 2. Monthly Billing Export - Runs on the 1st of every month at 01:00 AM
    cron.schedule('0 1 1 * *', async () => {
      logger.info('Running scheduled job: Monthly Billing Export');
      await this.generateAndSendMonthlyBilling();
    });

    // 3. Metrics Snapshot — Every 30 seconds for monitoring time-series
    cron.schedule('*/30 * * * * *', () => {
      monitoringService.recordSnapshot();
    });

    logger.info('Scheduler service started with cron jobs');
  }

  private async generateAndSendDailyReport() {
    try {
      // Fetch recent anomalies/alerts from DB
      const recentAlerts = await prisma.alert.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: { meter: true }
      });

      const reportData = recentAlerts.map((alert: any) => ({
        ID: alert.id,
        METER_SERIAL: alert.meter.serialNumber,
        TYPE: alert.type,
        SEVERITY: alert.severity,
        MESSAGE: alert.message,
        DATE: alert.createdAt.toLocaleString()
      }));

      // Generate Chart Config
      const severityCounts = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
      recentAlerts.forEach((a: any) => { severityCounts[a.severity as keyof typeof severityCounts] = (severityCounts[a.severity as keyof typeof severityCounts] || 0) + 1; });
      
      const chartConfig = {
        type: 'pie',
        data: {
          labels: Object.keys(severityCounts),
          datasets: [{ data: Object.values(severityCounts) }]
        },
        options: { title: { display: true, text: 'Alerts by Severity (Last 24h)' } }
      };

      // Generate PDF
      const pdfBuffer = await reportService.generatePDF('Daily Operations Report', reportData, chartConfig);

      // Generate Excel (as a secondary attachment)
      const excelBuffer = await reportService.generateExcel('Alerts', reportData);

      // Send Email
      await emailService.sendEmail({
        to: 'admin@powerguard.io',
        subject: `PowerGuard Daily Operations Report - ${new Date().toLocaleDateString()}`,
        text: `Please find attached the daily operations report for ${new Date().toLocaleDateString()}. \n\nTotal Alerts: ${recentAlerts.length}`,
        attachments: [
          { filename: 'Daily_Report.pdf', content: pdfBuffer },
          { filename: 'Daily_Report.xlsx', content: excelBuffer }
        ]
      });

    } catch (error) {
      logger.error('Failed to execute daily report job:', error);
    }
  }

  private async generateAndSendMonthlyBilling() {
    try {
      const consumers = await prisma.consumerProfile.findMany();
      
      const billingData = consumers.map((c: any) => ({
        ID: c.id,
        FIRST_NAME: c.firstName,
        LAST_NAME: c.lastName,
        TYPE: c.connectionType,
        ADDRESS: c.address || 'N/A',
        JOIN_DATE: c.createdAt.toLocaleDateString()
      }));

      // Generate CSV Export
      const csvBuffer = await reportService.generateCSV(billingData);

      await emailService.sendEmail({
        to: 'finance@powerguard.io',
        subject: `PowerGuard Monthly Billing Export - ${new Date().toLocaleDateString()}`,
        text: `Attached is the complete monthly billing export.`,
        attachments: [
          { filename: 'Monthly_Billing.csv', content: csvBuffer }
        ]
      });

    } catch (error) {
      logger.error('Failed to execute monthly billing job:', error);
    }
  }
}

export const schedulerService = new SchedulerService();
