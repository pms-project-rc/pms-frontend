import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface AgreementVehicle {
    id: number;
    plate: string;
    vehicle_type?: string;
    owner_name?: string;
}

export interface Agreement {
    id: number;
    company_name: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    start_date: string;
    end_date?: string;
    discount_percentage: number;
    special_rate?: number;
    is_active: string; // Backend returns string 'active'/'inactive'
    notes?: string;
    vehicles?: AgreementVehicle[];
}

export interface CreateAgreementRequest {
    company_name: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    start_date: string;
    discount_percentage: number;
    notes?: string;
}

export interface UpdateAgreementRequest {
    company_name?: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    start_date?: string;
    end_date?: string;
    discount_percentage?: number;
    special_rate?: number;
    notes?: string;
    is_active?: string;
}

class AgreementService {
    async getAgreements(skip: number = 0, limit: number = 100): Promise<Agreement[]> {
        const response = await axios.get<Agreement[]>(`${API_URL}/agreements/`, {
            params: { skip, limit }
        });
        return response.data;
    }

    async createAgreement(agreement: CreateAgreementRequest): Promise<Agreement> {
        const response = await axios.post<Agreement>(`${API_URL}/agreements/`, agreement);
        return response.data;
    }

    async updateAgreement(id: number, agreement: UpdateAgreementRequest): Promise<Agreement> {
        const response = await axios.put<Agreement>(`${API_URL}/agreements/${id}`, agreement);
        return response.data;
    }

    async getAgreement(id: number): Promise<Agreement> {
        const response = await axios.get<Agreement>(`${API_URL}/agreements/${id}`);
        return response.data;
    }

    async addVehicle(agreementId: number, plate: string, vehicleType: string = "Automovil"): Promise<void> {
        await axios.post(`${API_URL}/agreements/${agreementId}/vehicles`, { plate, vehicle_type: vehicleType });
    }

    async removeVehicle(agreementId: number, plate: string): Promise<void> {
        await axios.delete(`${API_URL}/agreements/${agreementId}/vehicles/${plate}`);
    }
}

export const agreementService = new AgreementService();
