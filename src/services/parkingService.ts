import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// DATA TYPES
export interface ParkingEntryRequest {
    plate: string;
    vehicle_type: string;
    owner_name: string;
    owner_phone?: string;
    brand?: string;
    model?: string;
    color?: string;
    notes?: string;
    helmet_count?: number;
}

export interface ParkingExitRequest {
    plate: string;
    notes?: string;
}

export interface ParkingRecord {
    id: number;
    plate: string;
    vehicle_type: string;
    entry_time: string;
    exit_time?: string;
    total_cost?: number;
    status: "active" | "completed";
    owner_name?: string;
    brand?: string;
    model?: string;
    helmet_count?: number;
    color?: string;
    notes?: string;
}

class ParkingService {
    private getToken() {
        return localStorage.getItem('pms_access_token') || localStorage.getItem('access_token');
    }

    private authHeaders() {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    //  Registrar ingreso
    async registerEntry(data: ParkingEntryRequest): Promise<string> {
        const response = await axios.post(`${API_URL}/parking/entry`, data, {
            headers: this.authHeaders(),
        });
        return response.data;
    }

    //  Registrar salida
    async registerExit(data: ParkingExitRequest): Promise<string> {
        const response = await axios.post(`${API_URL}/parking/exit`, data, {
            headers: this.authHeaders(),
        });
        return response.data;
    }

    //  Vehículos activos
    async getActiveVehicles(): Promise<ParkingRecord[]> {
        const response = await axios.get(`${API_URL}/parking/active`, {
            headers: this.authHeaders(),
        });
        // Extract records from response wrapper (API returns { message, count, records })
        return response.data.records || response.data;
    }

    //  Todos los registros (activos y completados) - para reportes
    async getAllRecords(): Promise<ParkingRecord[]> {
        try {
            const response = await axios.get(`${API_URL}/parking/records?status_filter=all&limit=100`, {
                headers: this.authHeaders(),
            });
            // Extract records from response wrapper
            const records = response.data.records || response.data || [];
            
            // Mapear explícitamente para asegurar compatibilidad
            return records.map((r: any) => ({
                id: r.id,
                plate: r.plate,
                vehicle_type: r.vehicle_type,
                entry_time: r.entry_time,
                exit_time: r.exit_time,
                total_cost: r.total_cost,
                status: r.exit_time ? 'completed' : 'active',
                owner_name: r.owner_name,
                brand: r.brand,
                model: r.model,
                helmet_count: r.helmet_count,
                color: r.color,
                notes: r.notes
            }));
        } catch (error) {
            console.error('Error getting all parking records:', error);
            // Si el endpoint no existe, retornar array vacío
            return [];
        }
    }

    //  Historial por placa
    async getHistory(plate: string, limit: number = 10): Promise<ParkingRecord[]> {
        const response = await axios.get(`${API_URL}/parking/history/${plate}`, {
            params: { limit },
            headers: this.authHeaders(),
        });
        return response.data;
    }

    //  Buscar vehículo por placa
    async getVehicle(plate: string): Promise<ParkingRecord> {
        const response = await axios.get(`${API_URL}/parking/vehicle/${plate}`, {
            headers: this.authHeaders(),
        });
        return response.data;
    }

    //  Listar tarifas
    async getRates() {
        const response = await axios.get(`${API_URL}/parking/rates`, {
            headers: this.authHeaders(),
        });
        return response.data;
    }

    //  Estadísticas de hoy
    async getTodayStats() {
        const response = await axios.get(`${API_URL}/parking/stats/today`, {
            headers: this.authHeaders(),
        });
        return response.data;
    }
}

// Exportar instancia
export const parkingService = new ParkingService();
