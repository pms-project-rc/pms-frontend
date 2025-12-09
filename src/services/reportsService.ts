import axios from 'axios';
import { ParkingRecord } from './parkingService';
import { WashingService } from './washingService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface DailyReport {
  date: string;
  totalParkings: number;
  totalWashing: number;
  totalRevenue: number;
  parkingRevenue: number;
  washingRevenue: number;
  averageTicket: number;
  occupancyPercentage: number;
  parkingRecords: ParkingRecord[];
  washingRecords: WashingService[];
  hourlyBreakdown: HourlyData[];
}

export interface HourlyData {
  hora: string;
  servicios: number;
  parqueos: number;
  ingresos: number;
  ticket: number;
}

class ReportsService {
  private getToken(): string {
    return localStorage.getItem('pms_access_token') || localStorage.getItem('access_token') || '';
  }

  private get authHeaders() {
    return {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    };
  }

  async getDailyReport(date: string): Promise<DailyReport> {
    try {
      const response = await axios.get(
        `${API_URL}/reports/daily?date=${date}`,
        { headers: this.authHeaders }
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching daily report:', error);
      throw error;
    }
  }

  async getDateRangeReport(startDate: string, endDate: string): Promise<DailyReport> {
    try {
      const response = await axios.get(
        `${API_URL}/reports/range?start_date=${startDate}&end_date=${endDate}`,
        { headers: this.authHeaders }
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching range report:', error);
      throw error;
    }
  }

  async getAllParkingRecords(): Promise<ParkingRecord[]> {
    try {
      const response = await axios.get(
        `${API_URL}/parking/records`,
        { headers: this.authHeaders }
      );
      return response.data.records || response.data || [];
    } catch (error) {
      console.error('Error fetching parking records:', error);
      return [];
    }
  }

  async getAllWashingRecords(): Promise<WashingService[]> {
    try {
      const response = await axios.get(
        `${API_URL}/washing/services`,
        { headers: this.authHeaders }
      );
      const services = response.data.data || response.data || [];
      
      // Mapear la respuesta al formato correcto
      return services.map((item: any) => ({
        id: item.id,
        vehicle_plate: item.plate,
        service_type: item.service_type,
        washer_id: item.washer_id,
        status: item.status === 'completed' || item.status === 'paid' ? 'completed' : (item.washer_id ? 'in_progress' : 'pending'),
        price: item.price,
        created_at: item.service_date,
        vehicle_type: item.vehicle_type || 'Unknown'
      }));
    } catch (error) {
      console.error('Error fetching washing records:', error);
      return [];
    }
  }

  generatePDF(report: DailyReport, startDate: string, endDate: string): void {
    // Crear HTML imprimible
    const html = this.generateReportHTML(report, startDate, endDate);
    
    // Crear iframe temporal para imprimir
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      
      // Esperar a que se cargue y luego imprimir
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  }

  private generateReportHTML(report: DailyReport, startDate: string, endDate: string): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('es-CO');
    };

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte PMS - ${startDate} a ${endDate}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            background: white;
            padding: 20px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 28px;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .date-range {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 30px;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 40px;
          }
          .metric-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #0284c7;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          .metric-card.green {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-color: #16a34a;
          }
          .metric-card.amber {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-color: #d97706;
          }
          .metric-card.purple {
            background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
            border-color: #a855f7;
          }
          .metric-label {
            font-size: 12px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
          }
          .metric-card.green .metric-value {
            color: #16a34a;
          }
          .metric-card.amber .metric-value {
            color: #d97706;
          }
          .metric-card.purple .metric-value {
            color: #a855f7;
          }
          .section {
            margin-bottom: 40px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            border-left: 4px solid #1e40af;
            padding-left: 15px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #1e40af;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 13px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          tr:hover {
            background: #f0f9ff;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .currency {
            font-weight: bold;
            color: #16a34a;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 PMS - Parking Management System</h1>
            <p>Reporte Completo de Operaciones</p>
          </div>

          <div class="date-range">
            Período: ${formatDate(startDate)} - ${formatDate(endDate)}
          </div>

          <div class="metrics-grid">
            <div class="metric-card amber">
              <div class="metric-label">Total Parqueos</div>
              <div class="metric-value">${report.totalParkings}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Lavados</div>
              <div class="metric-value">${report.totalWashing}</div>
            </div>
            <div class="metric-card green">
              <div class="metric-label">Ingresos Totales</div>
              <div class="metric-value">${formatCurrency(report.totalRevenue)}</div>
            </div>
            <div class="metric-card purple">
              <div class="metric-label">Ticket Promedio</div>
              <div class="metric-value">${formatCurrency(report.averageTicket)}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📊 Resumen por Servicio</div>
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th class="text-center">Cantidad</th>
                  <th class="text-right">Ingresos</th>
                  <th class="text-right">Promedio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Parqueadero</td>
                  <td class="text-center">${report.totalParkings}</td>
                  <td class="text-right currency">${formatCurrency(report.parkingRevenue)}</td>
                  <td class="text-right">${formatCurrency(report.totalParkings > 0 ? report.parkingRevenue / report.totalParkings : 0)}</td>
                </tr>
                <tr>
                  <td>Servicios de Lavado</td>
                  <td class="text-center">${report.totalWashing}</td>
                  <td class="text-right currency">${formatCurrency(report.washingRevenue)}</td>
                  <td class="text-right">${formatCurrency(report.totalWashing > 0 ? report.washingRevenue / report.totalWashing : 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">🕐 Análisis por Hora</div>
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th class="text-center">Servicios</th>
                  <th class="text-center">Parqueos</th>
                  <th class="text-right">Ingresos</th>
                  <th class="text-right">Ticket Promedio</th>
                </tr>
              </thead>
              <tbody>
                ${report.hourlyBreakdown.map(row => `
                  <tr>
                    <td>${row.hora}</td>
                    <td class="text-center">${row.servicios}</td>
                    <td class="text-center">${row.parqueos}</td>
                    <td class="text-right currency">${formatCurrency(row.ingresos)}</td>
                    <td class="text-right">${formatCurrency(row.ticket)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Reporte generado el ${new Date().toLocaleString('es-CO')}</p>
            <p>PMS © 2025 - Sistema de Gestión de Parqueadero</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  downloadExcel(report: DailyReport, startDate: string, endDate: string): void {
    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO');

    let csv = 'REPORTE PMS - PARKING MANAGEMENT SYSTEM\n';
    csv += `Período: ${startDate} - ${endDate}\n\n`;

    csv += 'MÉTRICAS PRINCIPALES\n';
    csv += 'Métrica,Valor\n';
    csv += `Total Parqueos,${report.totalParkings}\n`;
    csv += `Total Lavados,${report.totalWashing}\n`;
    csv += `Ingresos Totales,${formatCurrency(report.totalRevenue)}\n`;
    csv += `Ingresos Parqueadero,${formatCurrency(report.parkingRevenue)}\n`;
    csv += `Ingresos Lavados,${formatCurrency(report.washingRevenue)}\n`;
    csv += `Ticket Promedio,${formatCurrency(report.averageTicket)}\n`;
    csv += `Ocupación,${report.occupancyPercentage}%\n\n`;

    csv += 'ANÁLISIS POR HORA\n';
    csv += 'Hora,Servicios,Parqueos,Ingresos,Ticket Promedio\n';
    report.hourlyBreakdown.forEach(row => {
      csv += `${row.hora},${row.servicios},${row.parqueos},${formatCurrency(row.ingresos)},${formatCurrency(row.ticket)}\n`;
    });

    // Descargar CSV
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `reporte-pms-${startDate}-${endDate}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

export default new ReportsService();
