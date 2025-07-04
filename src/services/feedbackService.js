import api from './api'

export const feedbackService = {
  /**
   * Get all feedback entries with pagination
   * @param {number} page - Current page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Feedback data with pagination
   */
 async getFeedback(page = 1, limit = 10) {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')

  const formData = new FormData()
  formData.append('user_id', userData.id || '')
  formData.append('role', userData.role || '')

  // send page number as GET param, everything else as POST form data
  const response = await api.post(`/Feedback/viewFeedback.php?page=${page}`, formData)

  return response
},


  /**
   * Delete a feedback entry
   * @param {number} feedbackId - ID of the feedback to delete
   * @returns {Promise<Object>} - Response data
   */
  async deleteFeedback(feedbackId) {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')

    const formData = new FormData()
    formData.append('feedback_id', feedbackId)
    formData.append('user_id', userData.id || '')
    formData.append('role', userData.role || '')

    const response = await api.post('/Feedback/deleteFeedback.php', formData)
    return response
  },

  /**
   * Format date to localized string
   * @param {string} dateString - Date string to format
   * @returns {string} - Formatted date
   */
  formatDate(dateString) {
    if (!dateString) return ''
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('ar-SA', options)
  },

  /**
   * Get star rating component
   * @param {number} rating - Rating value (1-5)
   * @returns {Array} - Array of star components
   */
  getStarRating(rating) {
    return Array.from({ length: 5 }, (_, i) => ({
      filled: i < rating,
    }))
  }
}
