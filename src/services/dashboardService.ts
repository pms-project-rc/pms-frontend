import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Backend response structure
interface BackendDashboardResponse {
    start_date: string;
    end_date: string;
    general: {
        total_income: number;
        total_expenses: number;
        total_bonuses: number;
        net_performance: number;
        avg_daily_income: number;
        avg_daily_expenses: number;
        income_vs_expenses_ratio: number;
    };
    operational: {
        avg_occupancy_level: number;
        avg_washing_time_minutes: number;
        personnel_utilization_percentage: number;
    };
    trends: Array<{
        date: string;
        income: number;
        expenses: number;
        bonuses: number;
    }>;
}

// Frontend expected structure
export interface DashboardMetrics {
    total_revenue: number;
    total_expenses: number;
    net_income: number;
    occupancy_rate: number;
    total_services: number;
    active_agreements: number;
    revenue_growth: number;
    expenses_growth: number;
    top_washers: {
        id: number;
        name: string;
        services_count: number;
        revenue_generated: number;
    }[];
    revenue_by_day: {
        date: string;
        revenue: number;
        expenses: number;
    }[];
}

export interface DashboardStats {
    active_vehicles: number;
    total_washes: number;
    today_income: number;
    today_expenses: number;
}

class DashboardService {
    async getStats(): Promise<DashboardStats> {
        const response = await axios.get<DashboardStats>(`${API_URL}/dashboard/stats`);
        return response.data;
    }

    async getMetrics(startDate?: string, endDate?: string): Promise<DashboardMetrics> {
        const params: any = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const response = await axios.get<BackendDashboardResponse>(`${API_URL}/reports/dashboard`, { params });
        const data = response.data;

        // Map backend structure to frontend expected structure
        return {
            total_revenue: data.general.total_income,
            total_expenses: data.general.total_expenses,
            net_income: data.general.net_performance,
            occupancy_rate: data.operational.avg_occupancy_level,
            total_services: 0, // Not available in backend response yet
            active_agreements: 0, // Not available in backend response yet
            revenue_growth: 0, // Not available in backend response yet
            expenses_growth: 0, // Not available in backend response yet
            top_washers: [], // Not available in backend response yet
            revenue_by_day: data.trends.map(trend => ({
                date: trend.date,
                revenue: trend.income,
                expenses: trend.expenses
            }))
        };
    }
}

export const dashboardService = new DashboardService();
