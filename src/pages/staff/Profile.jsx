import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, Briefcase, DollarSign } from 'lucide-react'
import { useQuery } from 'react-query'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'

const StaffProfile = () => {
  const { user: contextUser } = useAuth()
const user = contextUser || JSON.parse(localStorage.getItem('user_data'))
const [loading, setLoading] = useState(true)


  const fetchStaffProfile = async () => {
    const user_id = JSON.parse(localStorage.getItem('user_id'))
    const role = JSON.parse(localStorage.getItem('role'))

    const formData = new FormData()
    formData.append('user_id', user?.id)
    formData.append('role', user?.role)

    const response = await fetch('http://localhost/senior-nooralshams/api/Profile/viewStaffProfile.php', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    const data = await response.json()
    if (data.status !== 'success') throw new Error(data.message)
    return data
  }

  const { data: staffData, isLoading } = useQuery('staff-profile', fetchStaffProfile, {
    enabled: !!user,
    onSuccess: () => setLoading(false),
    onError: () => setLoading(false),
  })

  const profile = staffData?.data || {}

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الملف الشخصي</h1>
          <p className="text-gray-600">عرض معلوماتك كموظف</p>
        </motion.div>

        {loading || isLoading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
              <div className="card p-6 text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-primary-200" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{profile.full_name}</h2>
                <p className="text-gray-600 mb-4">{profile.email}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <Briefcase className="w-4 h-4" />
                    <span>
                      موظف منذ {profile.date_registered ? new Date(profile.date_registered).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' }) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <DollarSign className="w-4 h-4" />
                    <span>الراتب بالساعة: {profile.salary_per_hour} ₪</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>نشط</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Info (read-only) */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
              <div className="card p-6 space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={profile.full_name || ''}
                      disabled
                      className="input-field pr-12 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={profile.email || ''}
                      disabled
                      className="input-field pr-12 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={profile.phone || ''}
                      disabled
                      className="input-field pr-12 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الميلاد</label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={profile.dob || ''}
                      disabled
                      className="input-field pr-12 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                  <textarea
                    value={profile.notes || ''}
                    rows="3"
                    disabled
                    className="input-field w-full bg-gray-50"
                    placeholder="لا توجد ملاحظات"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default StaffProfile
