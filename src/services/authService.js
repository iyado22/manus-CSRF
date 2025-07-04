import api from './api'

export const authService = {
  async login(credentials) {
    const formData = new FormData()
    formData.append('email', credentials.email)
    formData.append('password', credentials.password)
    
    return await api.post('/auth/login.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async register(userData) {
    const formData = new FormData()
    formData.append('full_name', userData.full_name)
    formData.append('email', userData.email)
    formData.append('pass', userData.password)
    formData.append('passConf', userData.confirmPassword)
    formData.append('phone', userData.phone)
    formData.append('dob', userData.dob)
    
    return await api.post('/auth/register.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async verify(verificationData) {
    const formData = new FormData()
    formData.append('email', verificationData.email)
    formData.append('entered_code', verificationData.code)
    
    return await api.post('/auth/verify.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    window.location.href = '/login'
  },
}