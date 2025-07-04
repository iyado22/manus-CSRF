import React from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Flame } from 'lucide-react'
import { useQuery } from 'react-query'
import CountUp from 'react-countup'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import api from '../../services/api'

const Dashboard = () => {
  const { data: statsData, isLoading } = useQuery(
  'admin-dashboard-stats',
  async () => {
    const formData = new FormData()
    const user_id = localStorage.getItem('user_id')
    const role = localStorage.getItem('role')

    if (user_id) formData.append('user_id', user_id)
    if (role) formData.append('role', role)

    const response = await api.post('/AdminDashboard/dashboardStats.php', formData, {
      withCredentials: true
    })
    return response.data
  },
  { refetchOnWindowFocus: false }
)

  const stats = statsData || {}

  const topServices = (stats.top_services || []).map((item, index) => {
  const colors = ['#ff85a2', '#ffa5b9', '#ff8e71', '#ffe0e6', '#cdb4db']
  return {
    name: item.name,
    value: parseInt(item.bookings),
    color: colors[index % colors.length]
  }
})



  const dashboardCards = [
    {
      title: 'إجمالي العملاء',
      value: stats?.total_clients || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'المواعيد اليوم',
      value: stats?.today_appointments || 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'الإيرادات الشهرية',
      value: stats?.month_revenue || 0,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      prefix: 'ر.س '
    },
    {
      title: 'إجمالي الموظفين',
      value: stats?.total_staff || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+2%'
    }
  ]

  const appointmentData = [
    { name: 'السبت', appointments: 12 },
    { name: 'الأحد', appointments: 19 },
    { name: 'الاثنين', appointments: 15 },
    { name: 'الثلاثاء', appointments: 22 },
    { name: 'الأربعاء', appointments: 18 },
    { name: 'الخميس', appointments: 25 },
    { name: 'الجمعة', appointments: 8 },
  ]


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

      <div className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-gray-600">نظرة عامة على أداء الصالون</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <span className="text-sm text-green-600 font-medium">{card.change}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {card.prefix}
                    <CountUp end={card.value} duration={2} />
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Appointment Status Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {[
    {
      label: 'مواعيد مكتملة',
      value: stats.completed_appointments || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      label: 'مواعيد قيد الانتظار',
      value: stats.pending_appointments || 0,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: <Clock className="w-6 h-6" />
    },
    {
      label: 'مواعيد ملغاة',
      value: stats.cancelled_appointments || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: <XCircle className="w-6 h-6" />
    }
  ].map((card, i) => (
    <motion.div
      key={card.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      className="card p-6 flex items-center justify-between"
    >
      <div className={`w-12 h-12 rounded-full ${card.bgColor} flex items-center justify-center`}>
        <div className={`${card.color}`}>
          {card.icon}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600 mb-1">{card.label}</p>
        <p className="text-2xl font-bold text-gray-900">
          <CountUp end={parseInt(card.value)} duration={1.5} />
        </p>
      </div>
    </motion.div>
  ))}
</div>


        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.5 }}
  className="card p-6"
>
  <h3 className="text-xl font-bold text-gray-900 mb-6">إحصائيات المواعيد</h3>
  <div className="space-y-4">
    {[
      {
        label: 'مواعيد اليوم',
        value: stats.today_appointments || 0,
        icon: <Calendar className="w-6 h-6 text-green-500" />
      },
      {
        label: 'مواعيد هذا الأسبوع',
        value: stats.week_appointments || 0,
        icon: <Calendar className="w-6 h-6 text-yellow-500" />
      },
      {
        label: 'إجمالي المواعيد',
        value: stats.total_appointments || 0,
        icon: <Calendar className="w-6 h-6 text-purple-500" />
      }
    ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <CountUp end={parseInt(item.value)} duration={1.5} />
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

          <motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.6 }}
  className="card p-6"
>
  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
    <span>الحجوزات التريند</span>
    <span className="text-red-500">
      <Flame className="w-5 h-5" />
    </span>
  </h3>

  <div className="space-y-4">
    {(stats.top_services || []).map((service, i) => (
      <div
        key={i}
        className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="text-gray-700 font-medium">{service.name}</div>
        <div className="text-sm text-gray-500">
          <span className="text-pink-600 font-semibold">{service.bookings}</span> حجز
        </div>
      </div>
    ))}
    {stats.top_services?.length === 0 && (
      <div className="text-center text-gray-500 py-4">لا توجد بيانات متاحة</div>
    )}
  </div>
</motion.div>

        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Dashboard
