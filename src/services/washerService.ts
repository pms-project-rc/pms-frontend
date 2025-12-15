import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface Washer {
  id: number;
  name: string;
  full_name: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

interface WasherResponse {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

class WasherServiceAPI {
  private getToken(): string {
    return localStorage.getItem('pms_access_token') || localStorage.getItem('access_token') || '';
  }

  private get authHeaders() {
    return {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    };
  }

  async getWashers(): Promise<Washer[]> {
    const response = await axios.get<WasherResponse[]>(`${API_URL}/washers/`, {
      headers: this.authHeaders
    });
    
    return response.data.map(item => ({
      id: item.id,
      name: item.full_name,
      full_name: item.full_name,
      phone: item.phone,
      email: item.email,
      is_active: item.is_active
    }));
  }

  async getAllWashers(): Promise<Washer[]> {
    return this.getWashers();
  }
}

export const washerService = new WasherServiceAPI();
