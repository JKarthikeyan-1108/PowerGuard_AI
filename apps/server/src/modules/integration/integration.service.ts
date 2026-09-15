import ExcelJS from 'exceljs';
import fs from 'fs';
import prisma from '../../config/database';
import logger from '../../config/logger';
import { parse } from 'csv-parse';

export class IntegrationService {
  
  /**
   * Processes a CSV or Excel file containing Meter Registration data
   */
  public async importMeters(filePath: string, tenantId: string, mimetype: string): Promise<any> {
    try {
      let meters: any[] = [];
      
      if (mimetype === 'text/csv' || filePath.endsWith('.csv')) {
        meters = await this.parseCSV(filePath);
      } else {
        meters = await this.parseExcel(filePath);
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of meters) {
        try {
          // Expecting headers: SerialNumber, Type, Latitude, Longitude, Phase
          await prisma.meter.create({
            data: {
              serialNumber: row.SerialNumber,
              type: row.Type || 'RESIDENTIAL',
              latitude: parseFloat(row.Latitude),
              longitude: parseFloat(row.Longitude),
              organizationId: tenantId
            }
          });
          successCount++;
        } catch (err) {
          logger.warn(`Failed to import meter ${row.SerialNumber}`);
          errorCount++;
        }
      }

      return { total: meters.length, success: successCount, failed: errorCount };
    } finally {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  private parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(parse({ columns: true, trim: true }))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  private async parseExcel(filePath: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    
    if (!worksheet) return [];

    const results: any[] = [];
    let headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        headers = row.values as string[];
        // ExcelJS returns values starting at index 1
        headers.shift(); 
      } else {
        const rowData: any = {};
        const values = row.values as any[];
        values.shift();
        
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });
        results.push(rowData);
      }
    });

    return results;
  }

  /**
   * Generates a CSV export of active alerts for Power BI / Auditing
   */
  public async exportAlerts(tenantId: string): Promise<string> {
    // Filter alerts via meters that belong to this organization
    const alerts = await prisma.alert.findMany({
      where: {
        meter: {
          organizationId: tenantId
        }
      },
      include: { meter: true }
    });

    let csvContent = 'Alert ID,Meter Serial,Type,Severity,Status,Created At\n';
    
    alerts.forEach(alert => {
      csvContent += `${alert.id},${(alert as any).meter?.serialNumber || 'N/A'},${alert.type},${alert.severity},${alert.status},${alert.createdAt.toISOString()}\n`;
    });

    return csvContent;
  }
}

export const integrationService = new IntegrationService();
