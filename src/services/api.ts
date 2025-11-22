/// <reference types="vite/client" />
/**
 * Axios HTTP Client Configuration
 */
import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor (para agregar tokens en el futuro)
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // TODO: Añadir JWT token cuando implementemos auth
        // const token = localStorage.getItem('token')
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`
        // }
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

// Response interceptor (manejo global de errores)
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response) {
            // El servidor respondió con un código de error
            console.error('API Error:', error.response.data)
        } else if (error.request) {
            // La petición se hizo pero no hubo respuesta
            console.error('Network Error:', error.request)
        } else {
            // Algo pasó al configurar la petición
            console.error('Error:', error.message)
        }
        return Promise.reject(error)
    }
)

export default api
