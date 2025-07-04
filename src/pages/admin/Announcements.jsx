import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { 
  Plus, Edit, Trash2, Eye, EyeOff, RefreshCw, 
  MessageSquare, CheckCircle, XCircle, Calendar
} from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { announcementService } from '../../services/announcementService'

const AdminAnnouncements = () => {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  // Fetch announcements
  const { 
    data: announcementsData, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery(
    'admin-announcements',
    announcementService.getAnnouncements,
    {
      refetchOnWindowFocus: false,
    }
  )

  // Create announcement mutation
  const createAnnouncementMutation = useMutation(
    (message) => announcementService.createAnnouncement(message),
    {
      onSuccess: () => {
        toast.success('تم إضافة الإعلان بنجاح')
        setMessage('')
        setIsSubmitting(false)
        queryClient.invalidateQueries('admin-announcements')
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في إضافة الإعلان')
        setIsSubmitting(false)
      }
    }
  )

  // Toggle announcement status mutation
  const toggleAnnouncementMutation = useMutation(
    (id) => announcementService.toggleAnnouncementStatus(id),
    {
      onSuccess: () => {
        toast.success('تم تغيير حالة الإعلان بنجاح')
        queryClient.invalidateQueries('admin-announcements')
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في تغيير حالة الإعلان')
      }
    }
  )

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation(
    (id) => announcementService.deleteAnnouncement(id),
    {
      onSuccess: () => {
        toast.success('تم حذف الإعلان بنجاح')
        queryClient.invalidateQueries('admin-announcements')
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في حذف الإعلان')
      }
    }
  )

  const announcements = Array.isArray(announcementsData?.data)
  ? announcementsData.data
  : Array.isArray(announcementsData)
    ? announcementsData
    : []

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!message.trim()) {
      toast.error('الرجاء إدخال نص الإعلان')
      return
    }
    
    setIsSubmitting(true)
    createAnnouncementMutation.mutate(message)
  }

  // Handle toggle announcement status
  const handleToggleStatus = (id) => {
    toggleAnnouncementMutation.mutate(id)
  }

  // Handle delete announcement
  const handleDeleteAnnouncement = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      deleteAnnouncementMutation.mutate(id)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('ar-SA', options)
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الإعلانات</h1>
          <p className="text-gray-600">إضافة وإدارة إعلانات الصالون</p>
        </motion.div>

        {/* Create Announcement Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">إضافة إعلان جديد</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                نص الإعلان
              </label>
              <textarea
                id="message"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field w-full"
                placeholder="أدخل نص الإعلان هنا..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2 space-x-reverse"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" text="" />
                  <span>جاري الإضافة...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>إضافة إعلان</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Announcements List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">قائمة الإعلانات</h2>
            <button
              onClick={() => refetch()}
              className="btn-outline flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تحديث</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-40">
              <XCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
              <p className="text-gray-600 mb-4">لم نتمكن من تحميل الإعلانات</p>
              <button
                onClick={() => refetch()}
                className="btn-primary flex items-center space-x-2 space-x-reverse"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد إعلانات</h3>
              <p className="text-gray-600">قم بإضافة إعلان جديد باستخدام النموذج أعلاه</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 border-r-4 rounded-lg ${
                    announcement.is_active 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{announcement.message}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 ml-1" />
                        <span>{formatDate(announcement.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleToggleStatus(announcement.id)}
                        className={`p-2 rounded-full ${
                          announcement.is_active 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-gray-400 hover:bg-gray-200'
                        }`}
                        title={announcement.is_active ? 'إلغاء تنشيط' : 'تنشيط'}
                      >
                        {announcement.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      announcement.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {announcement.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

export default AdminAnnouncements