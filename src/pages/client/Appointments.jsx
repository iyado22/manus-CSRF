import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { Calendar, ChevronLeft, ChevronRight, Filter, Search, Star, Edit, Trash2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

const ClientAppointments = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [sortOrder, setSortOrder] = useState('newest')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    service_id: '',
    date: '',
    time: ''
  })
  const [availableServices, setAvailableServices] = useState([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost/senior-nooralshams/api/services/viewServices.php', {
          method: 'POST',
          credentials: 'include'
        })
        const data = await response.json()
        if (data.status === 'success') {
          setAvailableServices(data.data)
        } else {
          toast.error('فشل في تحميل الخدمات')
        }
      } catch (error) {
        console.error('Error fetching services:', error)
        toast.error('حدث خطأ أثناء تحميل الخدمات')
      }
    }
    fetchServices()
  }, [])

  const { data: appointmentsData, isLoading, isError, refetch } = useQuery(
    ['client-appointments', currentPage],
    async () => {
      const formData = new FormData()
      formData.append('user_id', user?.id)
      formData.append('role', user?.role)
      formData.append('status', statusFilter)
      formData.append('date_from', dateRange.from)
      formData.append('date_to', dateRange.to)
      formData.append('sort', sortOrder)
      formData.append('page', currentPage)

      const response = await fetch('http://localhost/senior-nooralshams/api/booking/viewClientAppointments.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Network response was not ok')
      return await response.json()
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!user,
      onError: (error) => toast.error(error.message || 'Failed to load appointments')
    }
  )

  const appointments = appointmentsData?.data?.appointments || []

  const cancelAppointmentMutation = useMutation(
    async (appointmentId) => {
      const formData = new FormData()
      formData.append('user_id', user?.id)
      formData.append('role', user?.role)
      formData.append('appointment_id', appointmentId)
      formData.append('csrf_token', user?.csrf_token)

      const response = await fetch('http://localhost/senior-nooralshams/api/booking/cancelBooking.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Network response was not ok')
      return await response.json()
    },
    {
      onSuccess: () => {
        toast.success('تم إلغاء الموعد بنجاح')
        queryClient.invalidateQueries(['client-appointments'])
      },
      onError: (error) => toast.error(error.message || 'Failed to cancel appointment')
    }
  )

  const editAppointmentMutation = useMutation(
    async (data) => {
      const formData = new FormData()
      formData.append('user_id', user?.id)
      formData.append('role', user?.role)
      formData.append('appointment_id', selectedAppointment.appointment_id)
      formData.append('service_id', data.service_id)
      formData.append('date', data.date)
      formData.append('time', data.time)
      formData.append('csrf_token', user?.csrf_token)

      const response = await fetch('http://localhost/senior-nooralshams/api/booking/editBooking.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Network response was not ok')
      return await response.json()
    },
    {
      onSuccess: () => {
        toast.success('تم تعديل الموعد بنجاح')
        setShowEditModal(false)
        queryClient.invalidateQueries(['client-appointments'])
      },
      onError: (error) => toast.error(error.message || 'Failed to update appointment')
    }
  )

  const getDaysInMonth = (year, month) => {
    const days = []
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayIndex = firstDay.getDay()
    const prevMonthLastDay = new Date(year, month, 0).getDate()

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false })
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    const lastDayIndex = lastDay.getDay()
    const nextDays = 7 - lastDayIndex - 1
    for (let i = 1; i <= nextDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    return days
  }

  const calendarDays = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())
  const prevMonth = () =>
  setCurrentMonth(prev => {
    const newDate = new Date(prev)
    newDate.setMonth(newDate.getMonth() - 1)
    return newDate
  })

const nextMonth = () =>
  setCurrentMonth(prev => {
    const newDate = new Date(prev)
    newDate.setMonth(newDate.getMonth() + 1)
    return newDate
  })


  const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getAppointmentsForDay = (day) => {
  const targetDate = formatDate(day.date)
  return appointments.filter(app => formatDate(app.date) === targetDate)
}



  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'في الانتظار'
      case 'confirmed': return 'مؤكد'
      case 'completed': return 'مكتمل'
      case 'cancelled': return 'ملغي'
      default: return status
    }
  }

  const handleCancelAppointment = (id) => {
    if (window.confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) {
      cancelAppointmentMutation.mutate(id)
    }
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    editAppointmentMutation.mutate(editFormData)
  }

  const resetFilters = () => {
    setStatusFilter('')
    setDateRange({ from: '', to: '' })
    setSortOrder('newest')
  }

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment)
    setEditFormData({
      service_id: appointment.service_id || '',
      date: appointment.date || '',
      time: appointment.time || ''
    })
    setShowEditModal(true)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مواعيدي</h1>
          <p className="text-gray-600">عرض وإدارة جميع مواعيدك</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حالة الموعد</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">جميع الحالات</option>
                <option value="pending">في الانتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب حسب</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="input-field"
              >
                <option value="newest">الأحدث أولاً</option>
                <option value="oldest">الأقدم أولاً</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="btn-outline mr-2"
            >
              إعادة تعيين
            </button>
            <button
              onClick={() => refetch()}
              className="btn-primary"
            >
              تطبيق
            </button>
          </div>
        </motion.div>

        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900">
              {currentMonth.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
            </h2>

            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
<div className="grid grid-cols-7 gap-2">
  {/* Weekday Headers */}
  {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, index) => (
    <div key={index} className="text-center font-medium text-gray-700 py-2">
      {day}
    </div>
  ))}

  {/* Calendar Days */}
  {calendarDays.map((day, index) => {
    const dayAppointments = getAppointmentsForDay(day)
    const isToday = day.date.toDateString() === new Date().toDateString()

    return (
      <div
        key={day.date.toISOString()}
        className={`min-h-24 border rounded-lg p-2 flex flex-col justify-between ${
          day.isCurrentMonth
            ? isToday
              ? 'ring-2 ring-primary-200 bg-white'
              : 'bg-white'
            : 'bg-gray-50 text-gray-400'
        }`}
      >
        {/* Date Number */}
        <div className="text-right mb-1">
          <span className={`text-sm ${isToday ? 'font-bold text-primary-200' : ''}`}>
            {day.date.getDate()}
          </span>
        </div>

        {/* Appointments */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {dayAppointments.map((appointment) => (
            <div
              key={appointment.appointment_id}
              className="bg-primary-50 border-r-4 border-primary-200 p-2 rounded-md text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold truncate">{appointment.service_name}</span>
                <span className="text-gray-600">{appointment.time?.substring(0, 5)}</span>
              </div>

              {/* Optional: status label if desired */}
              {getStatusLabel && (
                <div className="mb-1 text-[10px]">
                  <span className={`px-2 py-0.5 rounded-full ${getStatusColor(appointment.status)}`}>
                    {getStatusLabel(appointment.status)}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-1 mt-1">
                <button
                  onClick={() => handleAppointmentClick(appointment)}
                  className="btn-icon text-gray-600 hover:text-blue-600"
                  title="تفاصيل"
                >
                  <Calendar className="w-4 h-4" />
                </button>

                {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                  <>
                    <button
                      onClick={() => handleEditClick(appointment)}
                      className="btn-icon text-blue-600 hover:text-blue-800"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(appointment.appointment_id)}
                      className="btn-icon text-red-600 hover:text-red-800"
                      title="إلغاء"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  })}
</div>

        </motion.div>


      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">تفاصيل الموعد</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">الخدمة</h3>
                <p className="text-base font-medium text-gray-900">{selectedAppointment.service_name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">التاريخ والوقت</h3>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(selectedAppointment.date)} - {selectedAppointment.time.substring(0, 5)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">الموظف</h3>
                <p className="text-base font-medium text-gray-900">
                  {selectedAppointment.staff_name || 'لم يتم التعيين بعد'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">الحالة</h3>
                <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusLabel(selectedAppointment.status)}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">السعر</h3>
                <p className="text-base font-medium text-gray-900">{selectedAppointment.price} ₪</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-outline"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">تعديل الموعد</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الخدمة</label>
                <select
                  value={editFormData.service_id}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, service_id: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">اختر الخدمة</option>
                  {availableServices.map((service) => (
                    <option key={service.id} value={service.id}>

                      {service.name} - {service.price} ₪
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                <input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="input-field"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوقت</label>
                <input
                  type="time"
                  value={editFormData.time}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-outline"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={editAppointmentMutation.isLoading}
                  className="btn-primary"
                >
                  {editAppointmentMutation.isLoading ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="sm" text="" />
                      <span className="mr-2">جاري الحفظ...</span>
                    </span>
                  ) : (
                    'حفظ التغييرات'
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

export default ClientAppointments