import axios from 'axios'
import { API_BASE_URL } from './constants'

export const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use((config) => {
  // Read token lazily to avoid stale closures
  try {
    const stored = localStorage.getItem('auth-store')
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: { token?: string } }
      const token = parsed?.state?.token
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore parse errors
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-store')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
