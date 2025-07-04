import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, ChevronLeft, ChevronRight, RefreshCw, Eye, Edit2 } from 'lucide-react'
import { useQuery } from 'react-query'
import { toast } from 'react-toastify'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { staffService } from '../../services/staffService'

const StaffSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // 'week' or 'month'
  const { user } = useAuth()
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)


  // Calculate date range based on view mode - memoized to prevent recalculation
  const dateRange = useMemo(() => {
    const base = new Date(currentDate)
    let start, end

    if (viewMode === 'week') {
      const day = base.getDay()
      start = new Date(base)
      start.setDate(base.getDate() - ((day + 1) % 7))
      end = new Date(start)
      end.setDate(start.getDate() + 6)
    } else {
      // Month view: get first and last day of current month
      start = new Date(base.getFullYear(), base.getMonth(), 1)
      end = new Date(base.getFullYear(), base.getMonth() + 1, 0)
    }

    return {
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0]
    }
  }, [currentDate, viewMode])


  // Fetch staff schedule with proper query keys for caching
  const {
    data: scheduleData,
    isLoading,
    isError,
    refetch
  } = useQuery(
    ['staff-schedule', dateRange.from, dateRange.to, viewMode, user?.id],
    () => staffService.getStaffSchedule(user?.id, dateRange.from, dateRange.to),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      onError: (error) => {
        console.error('Error fetching schedule:', error)
      }
    }
  )

  // Process schedule data into a date-keyed object
  const schedule = useMemo(() => {
    const grouped = {}

    // Handle both possible data structures
    const appointments = scheduleData?.data || []

    if (Array.isArray(appointments)) {
      // If data is an array of appointments
      appointments.forEach(appt => {
        const date = appt.date || appt.appointment_date
        if (date) {
          if (!grouped[date]) grouped[date] = []
          grouped[date].push(appt)
        }
      })
    } else if (typeof appointments === 'object') {
      // If data is already grouped by date
      return appointments
    }

    return grouped
  }, [scheduleData])

  // Memoized navigation function to prevent unnecessary re-renders
  const navigateDate = useCallback((direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
      } else {
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
      }
      return newDate
    })
  }, [viewMode])

  // Memoized week days calculation
  const weekDays = useMemo(() => {
    const days = []
    const start = new Date(dateRange.from)

    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }

    return days
  }, [dateRange.from])

  // Pure functions for formatting and display
  const formatDate = (date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'في الانتظار',
      confirmed: 'مؤكد',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    }
    return labels[status] || status
  }

 useEffect(() => {
  if (showDetailsModal || showStatusModal) {
    const scrollPosition = viewMode === 'month' ? 1000 : 300
    window.scrollTo({ top: scrollPosition, behavior: 'smooth' })
  }
}, [showDetailsModal, showStatusModal, viewMode])

  // Error state handling
  if (isError) {
    return (
      <div className="min-h-screen gradient-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ أثناء تحميل الجدول</h2>
            <p className="text-gray-600 mb-6">لم نتمكن من تحميل جدولك. يرجى المحاولة مرة أخرى.</p>
            <button
              onClick={() => refetch()}
              className="btn-primary flex items-center mx-auto"
            >
              <RefreshCw className="w-5 h-5 ml-2" />
              إعادة المحاولة
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Header />
        <LoadingSpinner />
        <Footer />
      </div>
    )
  }

  const handleStatusUpdate = async (status) => {
    try {
      await staffService.updateBookingStatus(selectedAppointment.appointment_id, status)
      toast.success('تم تحديث الحالة بنجاح')
      setShowStatusModal(false)
      refetch()
    } catch (error) {
      toast.error('فشل في تحديث الحالة')
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">جدولي الأسبوعي</h1>
          <p className="text-gray-600">عرض وإدارة مواعيدك المجدولة</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-8"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => navigateDate('prev')}
                className="btn-outline p-2"
                aria-label="السابق"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-gray-900">
                {viewMode === 'week'
                  ? `الأسبوع من ${new Date(dateRange.from).toLocaleDateString('ar-EG')} إلى ${new Date(dateRange.to).toLocaleDateString('ar-EG')}`
                  : currentDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })

                }
              </h2>

              <button
                onClick={() => navigateDate('next')}
                className="btn-outline p-2"
                aria-label="التالي"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => setViewMode('week')}
                className={`btn-outline ${viewMode === 'week' ? 'bg-primary-200 text-white' : ''}`}
              >
                أسبوعي
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`btn-outline ${viewMode === 'month' ? 'bg-primary-200 text-white' : ''}`}
              >
                شهري
              </button>
            </div>
          </div>
        </motion.div>

        {/* Schedule View */}
        {viewMode === 'week' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-7 gap-4"
          >
            {weekDays.map((day) => {
              const dayKey = day.toISOString().split('T')[0]
              const dayAppointments = schedule[dayKey] || []
              const isToday = dayKey === new Date().toISOString().split('T')[0]

              return (
                <div
                  key={dayKey}
                  className={`card p-4 ${isToday ? 'ring-2 ring-primary-200' : ''}`}
                >
                  <div className="text-center mb-4">
                    <h3 className={`font-bold ${isToday ? 'text-primary-200' : 'text-gray-900'}`}>
                      {day.toLocaleDateString('ar-SA', { weekday: 'long' })}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {day.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {dayAppointments.length > 0 ? (
                      dayAppointments.map((appointment) => (
                        <div
                          key={appointment.appointment_id}
                          className="p-3 bg-gray-50 rounded-lg border-r-4 border-primary-200"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {appointment.time || appointment.appointment_time}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                              {getStatusLabel(appointment.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 font-medium">
                            {appointment.client_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {appointment.service_name}
                          </p>
                          <p className="text-xs text-gray-500">
                          السعر: ₪{appointment.price}
                        </p>

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setShowDetailsModal(true)
                              }}
                              className="btn-icon text-primary-500"
                              title="تفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setShowStatusModal(true)
                              }}
                              className="btn-icon text-green-500"
                              title="تحديث الحالة"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">لا توجد مواعيد</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </motion.div>
        ) : (
          // Month view - optimized list with virtualization for large datasets
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            {Object.keys(schedule).length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مواعيد</h3>
                <p className="text-gray-600">لا توجد مواعيد مجدولة في هذه الفترة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(schedule)
                  .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                  .map(([date, appointments]) => (
                    <div key={date} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h3 className="font-bold text-gray-900 mb-3">
                        {new Date(date).toLocaleDateString('ar-SA', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {appointments.map((appointment) => (
                          <div
                            key={appointment.appointment_id}
                            className="p-3 bg-gray-50 rounded-lg border-r-4 border-primary-200 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {appointment.time || appointment.appointment_time}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                                  {getStatusLabel(appointment.status)}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2 space-x-reverse mb-1">
                                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-primary-200" />
                                </div>
                                <p className="text-sm text-gray-700 font-medium">
                                  {appointment.client_name}
                                </p>
                              </div>

                              <p className="text-xs text-gray-600 mb-2">
                                {appointment.service_name}
                              </p>
                              <p className="text-xs text-gray-500">
                            السعر: ₪{Number(appointment.price).toFixed(2)}
                          </p>

                            </div>

                            <div className="flex gap-2 mt-1 self-end">
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment)
                                  setShowDetailsModal(true)
                                }}
                                className="btn-icon text-primary-500"
                                title="تفاصيل"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment)
                                  setShowStatusModal(true)
                                }}
                                className="btn-icon text-green-500"
                                title="تحديث الحالة"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
      {showDetailsModal && (
        
          
        
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">تفاصيل الموعد</h3>
            <p><strong>العميل:</strong> {selectedAppointment?.client_name}</p>
            <p><strong>الخدمة:</strong> {selectedAppointment?.service_name}</p>
            <p><strong>الوقت:</strong> {selectedAppointment?.time}</p>
            <p><strong>الحالة:</strong> {getStatusLabel(selectedAppointment?.status)}</p>
            <p><strong>السعر:</strong> ₪{Number(selectedAppointment?.price).toFixed(2)}</p>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowDetailsModal(false)} className="btn-outline">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">تحديث حالة الموعد</h3>
            <div className="grid grid-cols-2 gap-2">
              {["pending", "confirmed",  "completed", "cancelled",].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={`px-3 py-2 rounded ${getStatusColor(status)} text-sm font-medium`}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowStatusModal(false)} className="btn-outline">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default StaffSchedule