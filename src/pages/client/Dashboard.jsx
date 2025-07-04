import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Star, TrendingUp, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import CountUp from 'react-countup'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { bookingService } from '../../services/bookingService'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import api from '../../services/api'


const ClientDashboard = () => {
  const { user } = useAuth()
  const { t } = useLanguage()

  const { data: dashboardStats, isLoading: statsLoading } = useQuery(
  ['client-dashboard-stats', user?.id],
  async () => {
    const formData = new FormData()
    formData.append('csrf_token', localStorage.getItem('csrf_token'))
    formData.append('user_id', user?.id)
    formData.append('role', user?.role)
    const res = await api.post('/ClientDashboard/getClientDashboardStats.php', formData)
    return res.data
  },
  { enabled: !!user?.id }
)

const { data: recentAppointmentsData, isLoading: recentLoading } = useQuery(
  ['client-recent-appointments', user?.id],
  async () => {
    const formData = new FormData()
    formData.append('csrf_token', localStorage.getItem('csrf_token'))
    formData.append('user_id', user?.id)
    formData.append('role', user?.role)
    const res = await api.post('/ClientDashboard/getRecentAppointments.php', formData)
    return res.data
  },
  { enabled: !!user?.id }
)

console.log('recentAppointmentsData:', recentAppointmentsData)

  const stats = [
  {
    title: 'المواعيد القادمة',
    value: dashboardStats?.upcomingAppointments ?? 0,
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    title: 'إجمالي الحجوزات',
    value: dashboardStats?.totalAppointments ?? 0,
    icon: Clock,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    title: 'الخدمات المكتملة',
    value: dashboardStats?.completedAppointments ?? 0,
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  }
]




  const quickActions = [
    {
      title: 'حجز موعد جديد',
      description: 'احجزي موعدك للخدمة المفضلة',
      icon: Plus,
      link: '/client/booking',
      color: 'bg-primary-200'
    },
    {
      title: 'مواعيدي',
      description: 'عرض وإدارة مواعيدك',
      icon: Calendar,
      link: '/client/appointments',
      color: 'bg-secondary-400'
    },
    {
      title: 'الخدمات',
      description: 'تصفح جميع خدماتنا',
      icon: Star,
      link: '/services',
      color: 'bg-green-500'
    }
  ]

  return (
    <div>
      <Header/>
      <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً، {user?.full_name}
          </h1>
          <p className="text-gray-600">
            إليك نظرة عامة على حسابك وحجوزاتك
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ">

          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      <CountUp end={stat.value} duration={2} />
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">إجراءات سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  to={action.link}
                  className="card p-6 hover:scale-105 transition-transform duration-200 group"
                >
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </motion.div>

      {/* Recent Appointments */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.7 }}
  className="card p-6"
>
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-gray-900">آخر الحجوزات</h2>
    <Link to="/client/appointments" className="text-primary-200 hover:text-primary-300 font-medium">
      عرض الكل
    </Link>
  </div>

  {recentLoading ? (
    <div className="text-center py-8">
      <div className="spinner mx-auto mb-4"></div>
      <p className="text-gray-600">جاري تحميل الحجوزات...</p>
    </div>
  ) : recentAppointmentsData?.length > 0 ? (
    <div className="space-y-4">
      {recentAppointmentsData.map((appointment) => (
        <div
          key={appointment.appointment_id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-primary-200" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{appointment.service_name}</h3>
              <p className="text-gray-600 text-sm">
                التاريخ: {appointment.date} - الوقت: {appointment.time}
              </p>
              <p className="text-gray-600 text-sm">
                الموظف: {appointment.staff_name || 'لم يتم التعيين'}
              </p>
              <p className="text-gray-600 text-sm">
                السعر: {appointment.price} شيكل
              </p>
            </div>
          </div>
          <div className="text-left">
            <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
              appointment.status === 'confirmed'
                ? 'bg-green-100 text-green-800'
                : appointment.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : appointment.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {appointment.status === 'confirmed' && 'مؤكد'}
              {appointment.status === 'pending' && 'في الانتظار'}
              {appointment.status === 'completed' && 'مكتمل'}
              {appointment.status === 'cancelled' && 'ملغي'}
            </span>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-8">
      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد حجوزات</h3>
      <p className="text-gray-600 mb-4">ابدئي رحلتك معنا بحجز أول موعد</p>
      <Link to="/client/booking" className="btn-primary">
        احجزي موعدك الأول
      </Link>
    </div>
  )}
</motion.div>


      </div>
    </div>
      <Footer/>
    </div>
    
  )
}

export default ClientDashboard
