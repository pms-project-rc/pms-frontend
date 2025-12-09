import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

interface ParkingStats {
  total_entries: number
  active_vehicles: number
  income: number
  income_formatted: string
}

interface WashingStats {
  total_services: number
  active_services: number
  income: number
  income_formatted: string
}

interface SubscriptionStats {
  active_count: number
}

interface ShiftStats {
  open_count: number
}

interface TotalStats {
  total_income: number
  total_income_formatted: string
}

export interface OperationalSummary {
  date: string
  parking: ParkingStats
  washing: WashingStats
  subscriptions: SubscriptionStats
  shifts: ShiftStats
  totals: TotalStats
}

export interface Washer {
  id: number
  username: string
  full_name: string
  email: string
  role: string
  is_active: boolean
}

class OperationalDashboardService {
  private getToken(): string {
    return localStorage.getItem('pms_access_token') || localStorage.getItem('access_token') || ''
  }

  private get authHeaders() {
    return {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    }
  }

  async getSummaryStats(): Promise<OperationalSummary | null> {
    try {
      const response = await axios.get<OperationalSummary>(
        `${API_URL}/stats/summary`,
        {
          headers: this.authHeaders,
          validateStatus: (status) => status < 500
        }
      )
      
      if (response.status === 404 || response.status === 401 || response.status === 403) {
        console.warn('⚠️ Unauthorized or not found:', response.status)
        return null
      }

      return response.data
    } catch (error: any) {
      console.error('❌ Error fetching operational summary:', error.message)
      return null
    }
  }

  // Get total washers count (all washers, active or inactive)
  async getTotalWashersCount(): Promise<number> {
    try {
      console.log('🔍 Fetching total washers count from:', `${API_URL}/users/employees/`)
      
      const response = await axios.get(
        `${API_URL}/users/employees/`,
        {
          headers: this.authHeaders,
          validateStatus: (status) => status < 500
        }
      )
      
      console.log('📦 Employees response status:', response.status)
      console.log('📦 Employees data:', response.data)
      
      if (response.status === 200 && response.data) {
        // Count all washers (both active and inactive)
        const washers = response.data.filter((emp: any) => emp.role === 'washer')
        console.log('👥 Total washers found:', washers.length)
        console.log('👥 Washers:', washers)
        return washers.length
      }
      
      return 0
    } catch (error: any) {
      console.error('❌ Error fetching washers:', error.message)
      console.error('❌ Error response:', error.response?.data)
      return 0
    }
  }

  // Get all washers details
  async getAllWashers(): Promise<Washer[]> {
    try {
      const response = await axios.get(
        `${API_URL}/users/employees/`,
        {
          headers: this.authHeaders,
          validateStatus: (status) => status < 500
        }
      )
      
      if (response.status === 200 && response.data) {
        // Filter and return all washers
        const washers = response.data.filter((emp: any) => emp.role === 'washer')
        return washers
      }
      
      return []
    } catch (error: any) {
      console.error('❌ Error fetching washers details:', error.message)
      return []
    }
  }
}

export const operationalDashboardService = new OperationalDashboardService()
