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

// // const initialState: AuthState = {
// //   user: {
// //     id: 1,
// //     username: "demo",
// //     role: "global_admin", // prueba también "operational_admin" o "washer"
// //     active: true,
// //   },
// //   token: "fake-token",
// //   refreshToken: null,
// //   isAuthenticated: true,
// //   isLoading: false,
// //   error: null,
// // }
// const initialState: AuthState = {
//   user: {
//     id: 3,
//     username: "demo_washer",
//     role: "washer",
//     active: true,
//   },
//   token: "fake-token",
//   refreshToken: null,
//   isAuthenticated: true,
//   isLoading: false,
//   error: null,
// }


const initialState: AuthState = {
  user: null,
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
