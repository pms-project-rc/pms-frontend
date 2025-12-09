import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface WashingService {
    id: number;
    vehicle_plate: string;
    service_type: string;
    washer_id?: number;
    washer_name?: string;
    status: 'pending' | 'in_progress' | 'completed';
    price: number;
    start_time?: string;
    end_time?: string;
    created_at: string;
    vehicle_type?: string;
}

export interface CreateWashingRequest {
    vehicle_plate: string;
    service_type: string;
    price: number;
    washer_id?: number;
    vehicle_type: string;
    owner_name?: string;
    owner_phone?: string;
    notes?: string;
}

// Backend response shape
interface WashingServiceResponse {
    id: number;
    vehicle_id: number;
    plate: string;
    service_type: string;
    price: number;
    status: string; // payment_status
    washer_id?: number;
    service_date: string;
}

class WashingServiceAPI {
    private getToken(): string {
        return localStorage.getItem('pms_access_token') || localStorage.getItem('access_token') || '';
    }

    private get authHeaders() {
        return {
            'Authorization': `Bearer ${this.getToken()}`,
            'Content-Type': 'application/json'
        };
    }

    async getActiveServices(): Promise<WashingService[]> {
        const response = await axios.get<WashingServiceResponse[]>(`${API_URL}/washing/active`, {
            headers: this.authHeaders
        });
        return response.data.map(item => {
            // Infer status based on available data
            // If status is 'PAID' or 'COMPLETED', it's completed.
            // If washer_id is set, it's in_progress (assuming).
            // Otherwise pending.
            let status: 'pending' | 'in_progress' | 'completed' = 'pending';
            const backendStatus = item.status?.toLowerCase();

            if (backendStatus === 'paid' || backendStatus === 'completed') {
                status = 'completed';
            } else if (item.washer_id) {
                status = 'in_progress';
            }

            return {
                id: item.id,
                vehicle_plate: item.plate,
                service_type: item.service_type,
                washer_id: item.washer_id,
                status: status,
                price: item.price,
                created_at: item.service_date,
                // Placeholders for missing data
                vehicle_type: 'Unknown',
                washer_name: item.washer_id ? `Washer #${item.washer_id}` : undefined
            };
        });
    }

    // Obtener todos los servicios (incluyendo completados) - para reportes
    async getAllServices(): Promise<WashingService[]> {
        try {
            // Por ahora, el backend solo tiene endpoint /active
            // TODO: Backend debe implementar endpoint /services que retorne todos
            const response = await axios.get(`${API_URL}/washing/active`, {
                headers: this.authHeaders
            });
            const services = response.data.data || response.data || [];
            
            return services.map((item: WashingServiceResponse) => {
                let status: 'pending' | 'in_progress' | 'completed' = 'pending';
                if (item.status === 'completed' || item.status === 'paid') {
                    status = 'completed';
                } else if (item.washer_id) {
                    status = 'in_progress';
                }

                return {
                    id: item.id,
                    vehicle_plate: item.plate,
                    service_type: item.service_type,
                    washer_id: item.washer_id,
                    status,
                    price: item.price,
                    created_at: item.service_date,
                    vehicle_type: 'Unknown',
                    washer_name: item.washer_id ? `Washer #${item.washer_id}` : undefined
                };
            });
        } catch (error) {
            console.error('Error getting all washing services:', error);
            // Si el endpoint no existe, retornar array vacío
            return [];
        }
    }

    async createService(service: CreateWashingRequest): Promise<WashingService> {
        // Map request to backend expected format
        const payload = {
            plate: service.vehicle_plate,
            vehicle_type: service.vehicle_type,
            service_type: service.service_type,
            price: service.price,
            washer_id: service.washer_id,
            owner_name: service.owner_name,
            owner_phone: service.owner_phone,
            notes: service.notes
        };
        const response = await axios.post<WashingServiceResponse>(`${API_URL}/washing/`, payload, {
            headers: this.authHeaders
        });

        // Map response back to WashingService
        return {
            id: response.data.id,
            vehicle_plate: response.data.plate,
            service_type: response.data.service_type,
            washer_id: response.data.washer_id,
            status: 'pending', // Newly created
            price: response.data.price,
            created_at: response.data.service_date,
            vehicle_type: service.vehicle_type
        };
    }

    async assignWasher(serviceId: number, washerId: number): Promise<WashingService> {
        const response = await axios.put<WashingServiceResponse>(
            `${API_URL}/washing/${serviceId}/assign/${washerId}`,
            {},
            { headers: this.authHeaders }
        );
        return {
            id: response.data.id,
            vehicle_plate: response.data.plate,
            service_type: response.data.service_type,
            washer_id: response.data.washer_id,
            status: 'in_progress',
            price: response.data.price,
            created_at: response.data.service_date
        };
    }

    async completeService(serviceId: number): Promise<WashingService> {
        const response = await axios.put<WashingServiceResponse>(
            `${API_URL}/washing/${serviceId}/complete`,
            {},
            { headers: this.authHeaders }
        );
        return {
            id: response.data.id,
            vehicle_plate: response.data.plate,
            service_type: response.data.service_type,
            washer_id: response.data.washer_id,
            status: 'completed',
            price: response.data.price,
            created_at: response.data.service_date
        };
    }
}

export const washingService = new WashingServiceAPI();
