import api from './api'

export const staffService = {
  async getStaffList(page = 1, limit = 10) {
    const formData = new FormData()
    formData.append('page', page)
    formData.append('limit', limit)
    
    const response = await api.post('/Staff/getStaffDetails.php', formData)
    return response
  },

  async createStaff(staffData) {
    const formData = new FormData()
    
    // Add all staff data to form
    Object.keys(staffData).forEach(key => {
      formData.append(key, staffData[key])
    })
    
    const response = await api.post('/Staff/createStaff.php', formData)
    return response
  },

  async updateStaffDetails(staffData) {
    const formData = new FormData()
    
    // Add all staff data to form
    Object.keys(staffData).forEach(key => {
      formData.append(key, staffData[key])
    })
    
    const response = await api.post('/Staff/updateStaffDetails.php', formData)
    return response
  },

  async getStaffSchedule(staffId = null, dateFrom = null, dateTo = null, mode = null) {
  const formData = new FormData()
  if (staffId) formData.append('staff_id', staffId)
  if (dateFrom) formData.append('date_from', dateFrom)
  if (dateTo) formData.append('date_to', dateTo)
  if (mode) formData.append('mode', mode)

  const response = await api.post('/Staff/viewStaffSchedule.php', formData,
    {withCredentials: true}
  )
  return response
},

async getFullStaffSchedule(staffId) {
  const formData = new FormData()
  formData.append('staff_id', staffId)

  return await api.post('/staff/viewStaffSchedule.php', formData,
    {
      withCredentials: true
    }
  )
}
,


  async checkIn() {
    const formData = new FormData()
    const response = await api.post('/Staff/check_in.php', formData)
    return response
  },

  async checkOut() {
    const formData = new FormData()
    const response = await api.post('/Staff/check_out.php', formData)
    return response
  },

  async updateBookingStatus(bookingId, status, notes = '') {
    const formData = new FormData()
    formData.append('appointment_id', bookingId)
    formData.append('status', status)
    if (notes) formData.append('notes', notes)
    
    const response = await api.post('/Staff/staffUpdateBookingStatus.php', formData)
    return response
  },

  async getSalaryInfo(staffId, period = 'month') {
    const formData = new FormData()
    formData.append('staff_id', staffId)
    formData.append('period', period)
    
    const response = await api.post('/Staff/get_salary.php', formData)
    return response
  }
}