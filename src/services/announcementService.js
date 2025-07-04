import api from './api'

export const announcementService = {
  async getAnnouncements() {
  const user = JSON.parse(localStorage.getItem('user_data')) 
  const formData = new FormData()
  formData.append('user_id', user?.id)
  formData.append('role', user?.role)

  const response = await api.post(
    '/Announcements/viewAnnouncements.php',
    formData,
    {
      withCredentials: true 
    }
  )

  return response.data
},

  
  async getActiveAnnouncements() {
    const response = await api.get('/Announcements/getActiveAnnouncements.php')
    return response.data
  },
  

  async createAnnouncement(message) {
    const user = JSON.parse(localStorage.getItem('user_data')) 
    const formData = new FormData()
    formData.append('user_id', user?.id)
    formData.append('role', user?.role)
    formData.append('message', message)
    const response = await api.post('/Announcements/createAnnouncement.php', formData,
        {
      withCredentials: true 
    }
    )
    return response.data
  },
  
  async toggleAnnouncementStatus(id) {
    const user = JSON.parse(localStorage.getItem('user_data')) 
    const formData = new FormData();
    formData.append('user_id', user?.id)
    formData.append('role', user?.role)
    formData.append('announcement_id', id)

    const response = await api.post('/Announcements/toggleAnnouncementStatus.php', formData,
        {
      withCredentials: true 
    }
    )
        return response.data
  },


  async deleteAnnouncement(id) {
    const user = JSON.parse(localStorage.getItem('user_data')) 
    const formData = new FormData();
    formData.append('user_id', user?.id)
    formData.append('role', user?.role)
    formData.append('announcement_id', id)

    const response = await api.post('/Announcements/deleteAnnouncement.php', formData,
        {
      withCredentials: true 
    }
    )
        return response.data
  },

  

};