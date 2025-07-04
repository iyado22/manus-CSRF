import api from './api'

export const serviceService = {
 async getServices() {
    // No pagination param, fetches all active services
    return await api.get(`/services/viewServices.php`)
  },

  async getService(id) {
    return await api.get(`/services/viewServices.php?id=${id}`)
  },

  async createService(data) {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('description', data.description)
  formData.append('price', data.price)
  formData.append('duration', data.duration)
  if (data.image?.[0]) formData.append('image', data.image[0])

  formData.append('role', 'admin')
  formData.append('user_id', localStorage.getItem('user_id'))
  formData.append('csrf_token', localStorage.getItem('auth_token'))

  return await api.post('/services/addService.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
},

  async updateService(data) {
  const formData = new FormData()
  formData.append('service_id', data.serviceId)
  formData.append('name', data.name)
  formData.append('description', data.description)
  formData.append('price', data.price)
  formData.append('duration', data.duration)
  if (data.image?.[0]) formData.append('image', data.image[0])

  formData.append('role', 'admin')
  formData.append('user_id', localStorage.getItem('user_id'))
  formData.append('csrf_token', localStorage.getItem('auth_token'))


  return await api.post('/services/editService.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
},

  async deleteService(serviceId) {
    const formData = new FormData()
    formData.append('service_id', serviceId)
    
    return await api.post('/services/deleteService.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async toggleServiceStatus(serviceId) {
    const formData = new FormData()
    formData.append('service_id', serviceId)
    
    return await api.post('/services/toggleServiceStatus.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}