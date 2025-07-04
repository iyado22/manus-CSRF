import api from './api'

export const bookingService = {
  async getBookings(page = 1) {
    const userData = JSON.parse(localStorage.getItem('user_data'))
    const formData = new FormData()
    formData.append('user_id', userData.id)
    formData.append('role', userData.role)

    return await api.post(`/booking/viewClientAppointments.php?page=${page}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async createBooking(bookingData) {
    const userData = JSON.parse(localStorage.getItem('user_data'))
    const formData = new FormData()
    formData.append('user_id', userData.id)
    formData.append('role', userData.role)
    formData.append('staff_id', bookingData.staff_id)
    formData.append('service_id', bookingData.service_id)
    formData.append('date', bookingData.date)
    formData.append('time', bookingData.time)

    return await api.post('/booking/addBooking.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async cancelBooking(appointmentId) {
    const userData = JSON.parse(localStorage.getItem('user_data'))
    const formData = new FormData()
    formData.append('user_id', userData.id)
    formData.append('role', userData.role)
    formData.append('appointment_id', appointmentId)

    return await api.post('/booking/cancelBooking.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async updateBooking(updateData) {
    const userData = JSON.parse(localStorage.getItem('user_data'))
    const formData = new FormData()
    formData.append('user_id', userData.id)
    formData.append('role', userData.role)
    formData.append('appointment_id', updateData.appointment_id)
    if (updateData.service_id) formData.append('service_id', updateData.service_id)
    if (updateData.date) formData.append('date', updateData.date)
    if (updateData.time) formData.append('time', updateData.time)

    return await api.post('/booking/editBooking.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
