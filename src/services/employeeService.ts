import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface Employee {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    role: 'global_admin' | 'operational_admin' | 'washer';
    is_active: boolean;
    created_at: string;
    commission_percentage?: number;
}

export interface EmployeeCreateRequest {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'global_admin' | 'operational_admin' | 'washer';
    commission_percentage?: number;
}

export interface EmployeeUpdateRequest {
    full_name?: string;
    email?: string;
    phone?: string;
    is_active?: boolean;
    commission_percentage?: number;
    password?: string;
}

class EmployeeService {
    private baseUrl = `${API_URL}/users/employees`;

    /**
     * Obtiene todos los empleados del sistema
     */
    async getAllEmployees(): Promise<Employee[]> {
        const response = await axios.get<Employee[]>(this.baseUrl);
        return response.data;
    }

    /**
     * Crea un nuevo empleado
     */
    async createEmployee(data: EmployeeCreateRequest): Promise<Employee> {
        const response = await axios.post<Employee>(this.baseUrl, data);
        return response.data;
    }

    /**
     * Elimina un empleado
     */
    async deleteEmployee(employeeId: number, role: string): Promise<void> {
        await axios.delete(`${this.baseUrl}/${employeeId}`, {
            params: { role }
        });
    }

    /**
     * Actualiza un empleado (usando el endpoint específico de washers por ahora)
     */
    async updateEmployee(employeeId: number, role: string, data: EmployeeUpdateRequest): Promise<Employee> {
        const response = await axios.put<Employee>(`${this.baseUrl}/${employeeId}`, data, {
            params: { role }
        });
        return response.data;
    }
}

export const employeeService = new EmployeeService();
