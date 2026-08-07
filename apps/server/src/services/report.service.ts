const PdfPrinter = require('pdfmake');
import ExcelJS from 'exceljs';
import QuickChart from 'quickchart-js';
import logger from '../config/logger';

// Font definitions for pdfmake
const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/build/vfs_fonts.js',
    bold: 'node_modules/pdfmake/build/vfs_fonts.js',
    italics: 'node_modules/pdfmake/build/vfs_fonts.js',
    bolditalics: 'node_modules/pdfmake/build/vfs_fonts.js'
  }
};

class ReportService {
  /**
   * Generates a PDF Report with an embedded chart
   */
  async generatePDF(title: string, data: any[], chartConfig?: any): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const printer = new PdfPrinter(fonts);
        const content: any[] = [
          { text: 'PowerGuard Enterprise', style: 'header' },
          { text: title, style: 'subheader' },
          { text: `Generated on: ${new Date().toLocaleString()}`, margin: [0, 0, 0, 20] },
        ];

        // 1. Embed Chart if config is provided
        if (chartConfig) {
          const chart = new QuickChart();
          chart.setConfig(chartConfig);
          chart.setWidth(500);
          chart.setHeight(300);
          
          const chartImageUrl = await chart.getShortUrl();
          // We can insert the image buffer directly into pdfmake
          const imageBuffer = await fetch(chartImageUrl).then(r => r.arrayBuffer());
          
          content.push({
            image: Buffer.from(imageBuffer),
            width: 500,
            margin: [0, 10, 0, 20]
          });
        }

        // 2. Build Table Data
        if (data && data.length > 0) {
          const headers = Object.keys(data[0]).map(k => ({ text: k.toUpperCase(), style: 'tableHeader' }));
          const rows = data.map(item => Object.values(item).map(v => String(v)));
          
          content.push({
            table: {
              headerRows: 1,
              widths: Array(headers.length).fill('*'),
              body: [headers, ...rows]
            },
            layout: 'lightHorizontalLines'
          });
        }

        const docDefinition = {
          content,
          styles: {
            header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
            subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
            tableHeader: { bold: true, fontSize: 12, color: 'black' }
          },
          defaultStyle: {
            // pdfmake requires fonts to be registered, bypassing strict check by relying on standard font fallback if possible.
            // But we defined Roboto above. Note: In production you'd use real font files.
            font: 'Helvetica'
          }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];
        
        pdfDoc.on('data', (chunk: any) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', (err: any) => reject(err));
        
        pdfDoc.end();
      } catch (error) {
        logger.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Generates an Excel Workbook (.xlsx)
   */
  async generateExcel(sheetName: string, data: any[]): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      if (data && data.length > 0) {
        // Generate columns based on the keys of the first object
        const columns = Object.keys(data[0]).map(key => ({
          header: key.toUpperCase(),
          key: key,
          width: 20
        }));
        worksheet.columns = columns;

        // Add rows
        worksheet.addRows(data);
        
        // Style header row
        worksheet.getRow(1).font = { bold: true };
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as unknown as Buffer;
    } catch (error) {
      logger.error('Error generating Excel:', error);
      throw error;
    }
  }

  /**
   * Generates a CSV file
   */
  async generateCSV(data: any[]): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      if (data && data.length > 0) {
        worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
        worksheet.addRows(data);
      }

      const buffer = await workbook.csv.writeBuffer();
      return buffer as unknown as Buffer;
    } catch (error) {
      logger.error('Error generating CSV:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
