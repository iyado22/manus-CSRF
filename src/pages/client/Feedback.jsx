import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { Star, Calendar, User, CheckCircle, X, Search } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

const ClientFeedback = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  })

  const { data: appointmentsData, isLoading, isError, refetch } = useQuery(
  ['completed-appointments', searchTerm, currentPage],
  async () => {
    const formData = new FormData()
    formData.append('user_id', user?.id)
    formData.append('role', user?.role)
    formData.append('page', currentPage)

    const response = await fetch('http://localhost/senior-nooralshams/api/Booking/viewCompletedAppointments.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    const resultText = await response.text()
    const result = JSON.parse(resultText)

    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to load appointments')
    }

    return result
  },
  {
    refetchOnWindowFocus: false,
    enabled: !!user,
    onError: (error) => {
      toast.error(error.message || 'Failed to load completed appointments')
    }
  }
)


  const submitFeedbackMutation = useMutation(
    async (data) => {
      try {
        const formData = new FormData()
        formData.append('user_id', user?.id)
        formData.append('role', user?.role)
        formData.append('booking_id', selectedAppointment.appointment_id)
        formData.append('rating', data.rating)
        formData.append('comment', data.comment)
        formData.append('csrf_token', user?.csrf_token)

        const response = await fetch('http://localhost/senior-nooralshams/api/Feedback/submitFeedback.php', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })

        const result = await response.json()
        if (result.status !== 'success!' && result.status !== 'success') {
          throw new Error(result.message || 'Failed to submit feedback')
        }

        return result
      } catch (error) {
        console.error('Error submitting feedback:', error)
        throw new Error('Failed to submit feedback')
      }
    },
    {
      onSuccess: () => {
        toast.success('تم إرسال التقييم بنجاح')
        setShowFeedbackModal(false)
        setFeedbackData({ rating: 5, comment: '' })
        queryClient.invalidateQueries(['completed-appointments'])
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit feedback')
      }
    }
  )

 const completedAppointments = appointmentsData?.data?.appointments || []
const totalAppointments = appointmentsData?.data?.total || 0


 const filteredAppointments = completedAppointments.filter((appointment) => {
  const serviceName = appointment.service_name?.toLowerCase() || ''
  const staffName = appointment.staff_name?.toLowerCase() || ''
  return serviceName.includes(searchTerm.toLowerCase()) || staffName.includes(searchTerm.toLowerCase())
})


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()

    if (feedbackData.rating < 1 || feedbackData.rating > 5) {
      toast.error('يرجى اختيار تقييم بين 1 و 5 نجوم')
      return
    }

    if (!feedbackData.comment.trim()) {
      toast.error('يرجى إدخال تعليق')
      return
    }

    if (feedbackData.comment.length > 500) {
      toast.error('يجب ألا يتجاوز التعليق 500 حرف')
      return
    }

    submitFeedbackMutation.mutate(feedbackData)
  }

  const renderStarRating = (rating, setRating) => (
    <div className="flex space-x-2 space-x-reverse">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen gradient-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تقييم الخدمات</h1>
          <p className="text-gray-600">شاركينا رأيك في الخدمات التي تلقيتها</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 mb-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث بالخدمة أو اسم الموظف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pr-12 w-full"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">الخدمات المكتملة</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-40">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
              <p className="text-gray-600 mb-4">لم نتمكن من تحميل الخدمات المكتملة</p>
              <button onClick={() => refetch()} className="btn-primary">إعادة المحاولة</button>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <CheckCircle className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد خدمات مكتملة</h3>
              <p className="text-gray-600">لم يتم العثور على خدمات مكتملة تطابق معايير البحث</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخدمة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ والوقت</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التقييم</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{appointment.service_name}</td>
                      <td className="px-6 py-4">
                        {formatDate(appointment.date)} <br />
                        <span className="text-gray-500">{appointment.time.substring(0, 5)}</span>
                      </td>
                      <td className="px-6 py-4">{appointment.staff_name}</td>
                      <td className="px-6 py-4">{appointment.price} ₪</td>
                      <td className="px-6 py-4">
                        {appointment.has_feedback ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-1" />
                            تم التقييم
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowFeedbackModal(true)
                            }}
                            className="btn-primary text-sm"
                          >
                            ترك تقييم
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
{!isLoading && !isError && filteredAppointments.length > 0 && (
  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
    <div className="flex-1 flex justify-between sm:hidden">
      <button
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="btn-outline disabled:opacity-50"
      >
        السابق
      </button>
      <button
        onClick={() => setCurrentPage(Math.min(Math.ceil(totalAppointments / 10), currentPage + 1))}
        disabled={currentPage === Math.ceil(totalAppointments / 10)}
        className="btn-outline disabled:opacity-50"
      >
        التالي
      </button>
    </div>
    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-gray-700">
          عرض{' '}
          <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> إلى{' '}
          <span className="font-medium">
            {Math.min(currentPage * 10, totalAppointments)}
          </span>{' '}
          من <span className="font-medium">{totalAppointments}</span> نتيجة
        </p>
      </div>
      <div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          {Array.from({ length: Math.ceil(totalAppointments / 10) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                page === currentPage
                  ? 'z-10 bg-primary-200 border-primary-200 text-white'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </nav>
      </div>
    </div>
  </div>
)}


            </div>
          )}
        </motion.div>
      </div>

      {showFeedbackModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">تقييم الخدمة</h2>
              <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التقييم</label>
                <div className="flex justify-center">
                  {renderStarRating(feedbackData.rating, (rating) => setFeedbackData(prev => ({ ...prev, rating })))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التعليق</label>
                <textarea
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, comment: e.target.value }))}
                  className="input-field w-full"
                  rows="4"
                  placeholder="شاركينا رأيك في الخدمة..."
                  maxLength="500"
                  required
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  {feedbackData.comment.length}/500 حرف
                </p>
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <button type="button" onClick={() => setShowFeedbackModal(false)} className="btn-outline">إلغاء</button>
                <button type="submit" disabled={submitFeedbackMutation.isLoading} className="btn-primary">
                  {submitFeedbackMutation.isLoading ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="sm" text="" />
                      <span className="mr-2">جاري الإرسال...</span>
                    </span>
                  ) : (
                    'إرسال التقييم'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default ClientFeedback
