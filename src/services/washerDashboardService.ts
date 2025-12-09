import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

class WasherDashboardService {
  private getToken(): string {
    return localStorage.getItem('pms_access_token') || localStorage.getItem('access_token') || ''
  }

  private get authHeaders() {
    return {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    }
  }

  // Obtener servicios del lavador actual sin activar interceptores de 401
  async getWasherServices() {
    try {
      console.log('📋 Fetching washer services from:', `${API_URL}/washing/my-services`)
      console.log('🔐 Token:', this.getToken().substring(0, 20) + '...')
      
      const response = await axios.get(
        `${API_URL}/washing/my-services`, // Endpoint específico para lavadores
        {
          headers: this.authHeaders,
          validateStatus: (status) => status < 500 // No throw en 4xx
        }
      )
      
      console.log('📦 Response status:', response.status)
      console.log('📦 Response data:', response.data)
      
      if (response.status === 404) {
        console.warn('⚠️ No services found (404)')
        return []
      }
      
      if (response.status === 401 || response.status === 403) {
        console.warn('⚠️ Unauthorized/Forbidden', response.status)
        return []
      }

      return response.data || []
    } catch (error: any) {
      console.error('❌ Error fetching washer services:', error.message)
      console.error('Response:', error.response?.data)
      return []
    }
  }

  // Obtener turno activo del lavador
  async getWasherActiveShift() {
    try {
      const response = await axios.get(
        `${API_URL}/shifts/active`,
        {
          headers: this.authHeaders,
          validateStatus: (status) => status < 500 // No throw en 4xx
        }
      )
      
      if (response.status === 404) {
        console.warn('No active shift found (404)')
        return null
      }
      
      if (response.status === 401) {
        console.warn('Unauthorized (401) - token may be invalid')
        return null
      }

      return response.data || null
    } catch (error) {
      console.error('Error fetching washer active shift:', error)
      return null
    }
  }

  // Iniciar turno del lavador
  async startWasherShift(initialCash: number = 0) {
    try {
      const response = await axios.post(
        `${API_URL}/shifts/start`,
        { initial_cash: initialCash },
        {
          headers: this.authHeaders,
          validateStatus: (status) => status < 500 // No throw en 4xx
        }
      )
      
      if (response.status === 401) {
        throw new Error('No autorizado para iniciar turno')
      }
      
      if (response.status >= 400) {
        throw new Error(response.data?.detail || 'Error al iniciar turno')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Error starting shift:', error)
      throw error
    }
  }

  // Cerrar turno del lavador
  async closeWasherShift() {
    try {
      const response = await axios.post(
        `${API_URL}/shifts/close`,
        {},
        {
          headers: this.authHeaders,
          validateStatus: (status) => status < 500 // No throw en 4xx
        }
      )
      
      if (response.status === 401) {
        throw new Error('No autorizado para cerrar turno')
      }
      
      if (response.status >= 400) {
        throw new Error(response.data?.detail || 'Error al cerrar turno')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Error closing shift:', error)
      throw error
    }
  }
}

export const washerDashboardService = new WasherDashboardService()
