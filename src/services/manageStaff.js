import api from './api'

export const manageStaff = {
  async getStaffList(page = 1, limit = 10) {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const formData = new FormData()
    formData.append('page', page)
    formData.append('limit', limit)
    formData.append('user_id', userData.id || '')
    formData.append('role', userData.role || '')

    return await api.post('/Staff/getStaffDetails.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async createStaff(staffData) {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  const formData = new FormData()

  // Required fields
  formData.append('full_name', staffData.full_name)
  formData.append('email', staffData.email)
  formData.append('password', staffData.password)
  formData.append('password_confirm', staffData.password_confirm)
  formData.append('phone', staffData.phone)
  formData.append('dob', staffData.dob)

  // Optional fields
  formData.append('salary_per_hour', staffData.salary_per_hour || 0)
  formData.append('notes', staffData.notes || '')

  // Auth
  formData.append('user_id', userData.id || '')
  formData.append('role', userData.role || '')

  return await api.post('/Staff/createStaff.php', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
},


  async updateStaffDetails(staffData) {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const formData = new FormData()

    Object.entries(staffData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    formData.append('user_id', userData.id || '')
    formData.append('role', userData.role || '')

    console.log('[DEBUG] Sending FormData:', [...formData.entries()])


    return await api.post('/Staff/updateStaffDetails.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async getStaffSchedule(staffId = null, dateFrom = null, dateTo = null) {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const formData = new FormData()

    if (staffId) formData.append('staff_id', staffId)
    if (dateFrom) formData.append('date_from', dateFrom)
    if (dateTo) formData.append('date_to', dateTo)

    formData.append('user_id', userData.id || '')
    formData.append('role', userData.role || '')

    return await api.post('/Staff/viewStaffSchedule.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async checkIn() {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const formData = new FormData()
    formData.append('user_id', userData.id || '')
    formData.append('role', userData.role || '')

    return await api.post('/Staff/check_in.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async checkOut() {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const formData = new FormData()
    formData.append('user_id', userData.id || '')
    formData.append('role', userData.role || '')

    return await api.post('/Staff/check_out.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async updateBookingStatus(bookingId, status, notes = '') {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const formData = new FormData()
    formData.append('appointment_id', bookingId)
    formData.append('status', status)
    if (notes) formData.append('notes', notes)

    formData.append('user_id', userData.id || '')
    formData.append('role', userData.role || '')

    return await api.post('/Staff/staffUpdateBookingStatus.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async getSalaryInfo(staffId, period = 'month') {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const formData = new FormData()
    formData.append('staff_id', staffId)
    formData.append('period', period)
    formData.append('user_id', userData.id || '')
    formData.append('role', userData.role || '')

    return await api.post('/Staff/get_salary.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
