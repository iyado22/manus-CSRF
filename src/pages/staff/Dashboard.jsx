import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, Users, LogIn, LogOut, DollarSign } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import CountUp from 'react-countup'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { staffService } from '../../services/staffService'
import { useAuth } from '../../contexts/AuthContext'

const StaffDashboard = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [salaryPeriod, setSalaryPeriod] = useState('month')

  const today = new Date().toISOString().split('T')[0]

  
const { data: scheduleData, isLoading } = useQuery(
  ['staff-today-appointments', user?.id],
  () => staffService.getStaffSchedule(user?.id, today, today, 'today'),
  {
    refetchOnWindowFocus: false,
    enabled: !!user?.id,  // wait for user to be available
  }
)



  // Fetch salary information
  const { data: salaryData, isLoading: isSalaryLoading } = useQuery(
    ['staff-salary', salaryPeriod],
    () => staffService.getSalaryInfo(user?.id, salaryPeriod),
    {
      refetchOnWindowFocus: false,
      enabled: !!user?.id
    }
  )

  // Check-in mutation
  const checkInMutation = useMutation(
    () => staffService.checkIn(),
    {
      onSuccess: () => {
        toast.success('تم تسجيل الحضور بنجاح!')
        queryClient.invalidateQueries('staff-attendance')
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في تسجيل الحضور')
      }
    }
  )

  // Check-out mutation
  const checkOutMutation = useMutation(
    () => staffService.checkOut(),
    {
      onSuccess: () => {
        toast.success('تم تسجيل الانصراف بنجاح!')
        queryClient.invalidateQueries('staff-attendance')
        queryClient.invalidateQueries(['staff-salary'])
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في تسجيل الانصراف')
      }
    }
  )

 const todayAppointments = (scheduleData?.data || []).slice(0, 5)





  const handleCheckIn = () => {
    checkInMutation.mutate()
  }

  const handleCheckOut = () => {
    checkOutMutation.mutate()
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم الموظف</h1>
          <p className="text-gray-600">إدارة مواعيدك وتسجيل الحضور والانصراف</p>
        </motion.div>

        {/* Check-in/Check-out Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">تسجيل الحضور والانصراف</h2>
          <div className="flex space-x-4 space-x-reverse">
            <button
              onClick={handleCheckIn}
              disabled={checkInMutation.isLoading}
              className="btn-primary flex items-center space-x-2 space-x-reverse disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              <span>تسجيل حضور</span>
              {checkInMutation.isLoading && <LoadingSpinner size="sm" text="" />}
            </button>
            
            <button
              onClick={handleCheckOut}
              disabled={checkOutMutation.isLoading}
              className="btn-secondary flex items-center space-x-2 space-x-reverse disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل انصراف</span>
              {checkOutMutation.isLoading && <LoadingSpinner size="sm" text="" />}
            </button>
          </div>
        </motion.div>

        {/* Salary Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">معلومات الراتب</h2>
            <div className="flex space-x-2 space-x-reverse">
              <select
                value={salaryPeriod}
                onChange={(e) => setSalaryPeriod(e.target.value)}
                className="input-field text-sm py-1"
              >
                <option value="day">اليوم</option>
                <option value="week">الأسبوع</option>
                <option value="month">الشهر</option>
                <option value="all">الكل</option>
              </select>
            </div>
          </div>
          
          {isSalaryLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">ساعات العمل</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      <CountUp 
                        end={salaryData?.hours_worked || 0} 
                        duration={1.5} 
                        decimals={2}
                        decimal="."
                      />
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">الراتب بالساعة</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      <CountUp 
                        end={salaryData?.salary_per_hour || 0} 
                        duration={1.5} 
                        decimals={2}
                        decimal="."
                        suffix=" ₪"
                      />
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary-200" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">الراتب المستحق</h3>
                    <p className="text-2xl font-bold text-primary-200">
                      <CountUp 
                        end={salaryData?.calculated_salary || 0} 
                        duration={1.5} 
                        decimals={2}
                        decimal="."
                        suffix=" ₪"
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        

        {/* Today's Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">مواعيد اليوم</h2>
          
          {todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.appointment_id}
                  className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Client info section with horizontal layout */}
<div className="p-4 md:w-3/4 bg-primary-50">
  <div className="grid grid-cols-4 gap-4 text-center">
    <div>
      <p className="text-xs text-gray-500 mb-1">العميل</p>
      <div className="flex items-center justify-center space-x-2 space-x-reverse">
        <span className="font-bold text-gray-900">{appointment.client_name}</span>
        <Calendar className="w-4 h-4 text-primary-200" />
      </div>
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-1">الوقت</p>
      <p className="font-medium text-gray-800">{appointment.time}</p>
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-1">الخدمة</p>
      <p className="font-medium text-gray-800">{appointment.service_name}</p>
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-1">السعر</p>
      <p className="font-medium text-gray-800">{appointment.price} ₪</p>
    </div>
  </div>
</div>

                    
                    {/* Status section */}
                    <div className="p-4 md:w-1/4 flex items-center justify-center bg-gray-50">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status === 'completed' && 'مكتمل'}
                        {appointment.status === 'confirmed' && 'مؤكد'}
                        {appointment.status === 'in_progress' && 'جاري'}
                        {appointment.status === 'pending' && 'في الانتظار'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مواعيد اليوم</h3>
              <p className="text-gray-600">استمتع بيوم هادئ!</p>
            </div>
          )}
          <div className="text-center mt-6">
            <a
              href="/staff/schedule"
              className="inline-block text-primary-200 hover:text-primary-300 font-medium"
            >
              عرض الجدول الكامل →
            </a>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

export default StaffDashboard