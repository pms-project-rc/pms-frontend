import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  username: string
  role: 'global_admin' | 'operational_admin' | 'washer'
  active: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Helper to decode user from localStorage token on app init
const getInitialUserFromToken = (): User | null => {
  try {
    const token = localStorage.getItem('pms_access_token')
    if (!token) {
      console.log('[AUTH] No token in localStorage')
      return null
    }
    
    // Decode JWT payload
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('[AUTH] Invalid token format - expected 3 parts, got', parts.length)
      return null
    }
    
    const decoded = JSON.parse(atob(parts[1]))
    console.log('[AUTH] Decoded JWT payload:', decoded)
    
    const userId = decoded.user_id || decoded.sub
    const username = decoded.username || 'user'
    const role = decoded.role
    
    console.log('[AUTH] Extracted - userId:', userId, 'username:', username, 'role:', role)
    
    if (!userId) {
      console.warn('[AUTH] No user_id or sub in token payload')
      return null
    }
    
    if (!role) {
      console.warn('[AUTH] No role in token payload')
      return null
    }
    
    if (!['global_admin', 'operational_admin', 'washer'].includes(role)) {
      console.warn('[AUTH] Invalid role:', role)
      return null
    }
    
    const user = {
      id: userId,
      username,
      role: role as 'global_admin' | 'operational_admin' | 'washer',
      active: true,
    }
    console.log('[AUTH] Successfully decoded user:', user)
    return user
  } catch (error) {
    console.error('[AUTH] Error decoding token:', error)
    return null
  }
}

const initialState: AuthState = {
  user: getInitialUserFromToken(),
  token: localStorage.getItem('pms_access_token'),
  refreshToken: null,
  isAuthenticated: !!localStorage.getItem('pms_access_token'),
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User
        token: string
      }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('pms_access_token', action.payload.token)
    },
    logout: state => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem('pms_access_token')
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setCredentials, logout, setLoading, setError } =
  authSlice.actions
export default authSlice.reducer
