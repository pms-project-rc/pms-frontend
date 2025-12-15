import axios from 'axios';

import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ReportService {
    async exportParkingHistory(startDate: string, endDate: string, format: 'csv' | 'excel' | 'pdf'): Promise<void> {
        const token = authService.getToken();

        if (!token) {
            throw new Error('No authentication token found');
        }

        // Create a dedicated instance to avoid global interceptors
        const client = axios.create({
            baseURL: API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        try {
            const response = await client.get('/reports/export/parking-history', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    format: format
                },
                responseType: 'blob'
            });

            // Create a download link and trigger it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const extension = format === 'excel' ? 'xlsx' : format;
            link.setAttribute('download', `parking_history_${startDate}_${endDate}.${extension}`);

            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('ReportService: Export failed', error.response?.status, error.response?.data);
            throw error;
        }
    }

    async exportRevenue(startDate: string, endDate: string, format: 'csv' | 'excel' | 'pdf'): Promise<void> {
        const token = authService.getToken();

        if (!token) {
            throw new Error('No authentication token found');
        }

        const client = axios.create({
            baseURL: API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        try {
            const response = await client.get('/reports/export/revenue', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    format: format
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const extension = format === 'excel' ? 'xlsx' : format;
            link.setAttribute('download', `revenue_report_${startDate}_${endDate}.${extension}`);

            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('ReportService: Revenue export failed', error.response?.status, error.response?.data);
            throw error;
        }
    }

    async getPreviewData(
        reportType: 'parking' | 'income_expenses' | 'washing' | 'payroll',
        startDate: string,
        endDate: string,
        payrollOptions?: { viewType: 'summary' | 'detail', washerId?: number }
    ): Promise<any[]> {
        const token = authService.getToken();
        if (!token) throw new Error('No authentication token found');

        const client = axios.create({
            baseURL: API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let endpoint = '';
        const params: any = {
            start_date: startDate,
            end_date: endDate,
            format: 'json'
        };

        if (reportType === 'parking') {
            endpoint = '/reports/export/parking-history';
        } else if (reportType === 'income_expenses') {
            endpoint = '/reports/export/revenue';
        } else if (reportType === 'washing') {
            endpoint = '/reports/export/washing-history';
        } else if (reportType === 'payroll') {
            if (payrollOptions?.viewType === 'summary') {
                endpoint = '/reports/export/payroll/summary';
            } else if (payrollOptions?.washerId) {
                endpoint = `/reports/export/payroll/detail/${payrollOptions.washerId}`;
            } else {
                throw new Error('Washer ID required for payroll detail');
            }
        }

        try {
            const response = await client.get(endpoint, { params });
            return response.data;
        } catch (error: any) {
            console.error('ReportService: Preview fetch failed', error);
            throw error;
        }
    }

    async exportWashingHistory(startDate: string, endDate: string, format: 'csv' | 'excel' | 'pdf'): Promise<void> {
        const token = authService.getToken();

        if (!token) {
            throw new Error('No authentication token found');
        }

        const client = axios.create({
            baseURL: API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        try {
            const response = await client.get('/reports/export/washing-history', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    format: format
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const extension = format === 'excel' ? 'xlsx' : format;
            link.setAttribute('download', `washing_history_${startDate}_${endDate}.${extension}`);

            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('ReportService: Washing history export failed', error.response?.status, error.response?.data);
            throw error;
        }
    }

    async exportPayrollSummary(startDate: string, endDate: string, format: 'csv' | 'excel' | 'pdf'): Promise<void> {
        const token = authService.getToken();

        if (!token) {
            throw new Error('No authentication token found');
        }

        const client = axios.create({
            baseURL: API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        try {
            const response = await client.get('/reports/export/payroll/summary', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    format: format
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const extension = format === 'excel' ? 'xlsx' : format;
            link.setAttribute('download', `payroll_summary_${startDate}_${endDate}.${extension}`);

            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('ReportService: Payroll summary export failed', error.response?.status, error.response?.data);
            throw error;
        }
    }

    async exportPayrollDetail(washerId: number, startDate: string, endDate: string, format: 'csv' | 'excel' | 'pdf'): Promise<void> {
        const token = authService.getToken();

        if (!token) {
            throw new Error('No authentication token found');
        }

        const client = axios.create({
            baseURL: API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        try {
            const response = await client.get(`/reports/export/payroll/detail/${washerId}`, {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    format: format
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const extension = format === 'excel' ? 'xlsx' : format;
            link.setAttribute('download', `payroll_detail_${washerId}_${startDate}_${endDate}.${extension}`);

            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('ReportService: Payroll detail export failed', error.response?.status, error.response?.data);
            throw error;
        }
    }
}

export const reportService = new ReportService();
