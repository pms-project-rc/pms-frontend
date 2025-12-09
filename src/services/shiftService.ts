import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface Shift {
    id: number;
    admin_id: number;
    start_time: string;
    end_time?: string;
    initial_cash: number;
    final_cash?: number;
    status: 'active' | 'closed';
    shift_date?: string;
    total_income?: number;
    total_expenses?: number;
}

export interface StartShiftRequest {
    initial_cash: number;
}

class ShiftService {
    private getToken() {
        return localStorage.getItem('pms_access_token') || localStorage.getItem('access_token');
    }

    private authHeaders() {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async startShift(data: StartShiftRequest): Promise<Shift> {
        const response = await axios.post<Shift>(`${API_URL}/shifts/start`, data, {
            headers: this.authHeaders(),
        });
        return response.data;
    }

    async closeShift(): Promise<Shift> {
        const response = await axios.post<Shift>(`${API_URL}/shifts/close`, {}, {
            headers: this.authHeaders(),
        });
        return response.data;
    }

    async getActiveShift(): Promise<Shift | null> {
        try {
            const response = await axios.get<Shift>(`${API_URL}/shifts/active`, {
                headers: this.authHeaders(),
            });
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
}

export const shiftService = new ShiftService();
