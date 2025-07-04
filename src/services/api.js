import axios from 'axios'
import { toast } from 'react-toastify'
const API_BASE_URL = 'http://localhost/senior-nooralshams/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    

if (config.data instanceof FormData) {
  // Let Axios set correct multipart boundary
  delete config.headers['Content-Type']
} else {
  config.headers['Content-Type'] = 'application/json'
}


    // Add CSRF token for POST requests
    if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
      const csrfToken = localStorage.getItem('auth_token')
      if (csrfToken) {
        if (config.data instanceof FormData) {
          config.data.append('csrf_token', csrfToken)
        } else {
          config.data = {
            ...config.data,
            csrf_token: csrfToken,
          }
        }
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    let errorMessage = 'حدث خطأ غير متوقع'
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          errorMessage = 'غير مصرح لك بالوصول'
          // Redirect to login if unauthorized
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          window.location.href = '/login'
          break
        case 403:
          errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء'
          break
        case 404:
          errorMessage = 'الصفحة أو المورد غير موجود'
          break
        case 422:
          errorMessage = data.message || 'بيانات غير صحيحة'
          break
        case 500:
          errorMessage = 'خطأ في الخادم'
          break
        default:
          errorMessage = data.message || 'حدث خطأ غير متوقع'
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'خطأ في الاتصال بالخادم'
    }
    
    // Show error toast
    toast.error(errorMessage)
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    })
  }
)

export default api