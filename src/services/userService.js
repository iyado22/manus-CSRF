import api from './api'


export const userServices = {
  /**
   * Search users with filters
   * @param {Object} params - Search parameters
   * @param {string} params.userId - Admin user ID
   * @param {string} params.role - Admin role
   * @param {number} params.page - Current page number
   * @param {string} params.searchTerm - Search term for user name or email
   * @param {string} params.statusFilter - Filter by user status
   * @param {string} params.roleFilter - Filter by user role
   * @param {string} params.dateFilter - Filter by registration date
   * @returns {Promise<Object>} - Users data with pagination
   */
  async searchUsers({ userId, role, page = 1, searchTerm = '', statusFilter = '', roleFilter = '', dateFilter = '' }) {
    try {
      const formData = new FormData()
      formData.append('user_id', userId)
      formData.append('role', role)
      
      if (searchTerm) formData.append('user_name', searchTerm)
      if (statusFilter) formData.append('status', statusFilter)
      if (roleFilter) formData.append('user_role', roleFilter)
      if (dateFilter) formData.append('date', dateFilter)
      formData.append('page', page)
      
      const response = await fetch(`/UserManagement/searchUsers.php?page=${page}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Error fetching users')
    }
  },

  /**
   * Toggle user active status
   * @param {Object} params - Toggle parameters
   * @param {string} params.adminId - Admin user ID
   * @param {string} params.adminRole - Admin role
   * @param {string} params.userId - Target user ID
   * @param {boolean} params.newStatus - New status value
   * @param {string} params.csrfToken - CSRF token
   * @returns {Promise<Object>} - Response data
   */
  async toggleUserStatus({ adminId, adminRole, userId, newStatus, csrfToken }) {
    try {
      const formData = new FormData()
      formData.append('user_id', adminId)
      formData.append('role', adminRole)
      formData.append('target_user_id', userId)
      formData.append('new_status', newStatus ? 1 : 0)
      formData.append('csrf_token', csrfToken)
      
      const response = await fetch('/UserManagement/deactivateUser.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Error toggling user status')
    }
  },

  /**
   * Get user activity logs
   * @param {Object} params - Activity parameters
   * @param {string} params.adminId - Admin user ID
   * @param {string} params.adminRole - Admin role
   * @param {string} params.targetUserId - Target user ID
   * @returns {Promise<Object>} - User activity data
   */
  async getUserActivity({ adminId, adminRole, targetUserId }) {
    try {
      const formData = new FormData()
      formData.append('user_id', adminId)
      formData.append('role', adminRole)
      formData.append('target_user_id', targetUserId)
      
      const response = await fetch('/UserManagement/getUserActivity.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message || 'Error fetching user activity')
    }
  },

  /**
   * Format date to localized string
   * @param {string} dateString - Date string to format
   * @returns {string} - Formatted date
   */
  formatDate(dateString) {
    if (!dateString) return ''
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('ar-SA', options)
  },

  /**
   * Format time to localized string
   * @param {string} dateString - Date string to format
   * @returns {string} - Formatted time
   */
  formatTime(dateString) {
    if (!dateString) return ''
    const options = { hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleTimeString('ar-SA', options)
  },

  /**
   * Get role badge component
   * @param {string} role - User role
   * @returns {Object} - Role badge data
   */
  getRoleBadgeData(role) {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      staff: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800',
    }
    
    const labels = {
      admin: 'مدير',
      staff: 'موظف',
      client: 'عميل',
    }

    return {
      className: badges[role] || 'bg-gray-100 text-gray-800',
      label: labels[role] || role
    }
  },

  /**
   * Get status badge data
   * @param {boolean} isActive - User active status
   * @returns {Object} - Status badge data
   */
  getStatusBadgeData(isActive) {
    return {
      className: isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
      label: isActive ? 'نشط' : 'معطل'
    }
  }
}