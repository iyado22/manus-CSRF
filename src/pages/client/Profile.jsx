import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, Calendar, Edit, Save, X } from 'lucide-react'
import { useMutation } from 'react-query'
import { toast } from 'react-toastify'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'


const ClientProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const formData = new FormData()
        formData.append('user_id', user?.id)
        formData.append('role', user?.role)
        formData.append('csrf_token', localStorage.getItem('auth_token'))

        const response = await fetch('http://localhost/senior-nooralshams/api/profile/viewClientProfile.php', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        const result = await response.json()

        if (result.status === 'success') {
          const profile = result.data
          setValue('full_name', profile.full_name)
          setValue('email', profile.email)
          setValue('phone', profile.phone)
          setValue('dob', profile.dob)
        } else {
          toast.error(result.message || 'فشل تحميل البيانات')
        }
      } catch (error) {
        toast.error('حدث خطأ أثناء تحميل البيانات')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, setValue])

  const updateProfileMutation = useMutation(
    async (profileData) => {
      const formData = new FormData()
      formData.append('user_id', user?.id)
      formData.append('role', user?.role)
      formData.append('csrf_token', localStorage.getItem('auth_token'))

      Object.entries(profileData).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const response = await fetch('http://localhost/senior-nooralshams/api/profile/updateClientProfile.php', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'x-csrf-token': localStorage.getItem('auth_token'),
        },
      })

      return response.json()
    },
    {
      onSuccess: (data) => {
        if (data.status === 'success') {
          toast.success('تم تحديث الملف الشخصي بنجاح!')
          setIsEditing(false)
        } else {
          toast.error(data.message || 'فشل في التحديث')
        }
      },
      onError: () => {
        toast.error('حدث خطأ أثناء التحديث')
      },
    }
  )

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الملف الشخصي</h1>
          <p className="text-gray-600">إدارة معلوماتك كعميل</p>
        </motion.div>

        {loading ? (
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
                <h2 className="text-xl font-bold text-gray-900 mb-2">{user?.full_name}</h2>
                <p className="text-gray-600 mb-4">{user?.email}</p>
              </div>
            </motion.div>

            {/* Profile Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
              <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">المعلومات الشخصية</h3>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn-outline flex items-center space-x-2 space-x-reverse">
                      <Edit className="w-4 h-4" />
                      <span>تعديل</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2 space-x-reverse">
                      <button onClick={handleCancel} className="btn-outline flex items-center space-x-2 space-x-reverse">
                        <X className="w-4 h-4" />
                        <span>إلغاء</span>
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...register('full_name', { required: 'الاسم الكامل مطلوب' })}
                        type="text"
                        disabled={!isEditing}
                        className={`input-field pr-12 ${!isEditing ? 'bg-gray-50' : ''} ${errors.full_name ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...register('email')}
                        type="email"
                        disabled
                        className="input-field pr-12 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...register('phone', { required: 'رقم الهاتف مطلوب' })}
                        type="tel"
                        disabled={!isEditing}
                        className={`input-field pr-12 ${!isEditing ? 'bg-gray-50' : ''} ${errors.phone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الميلاد</label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...register('dob')}
                        type="date"
                        disabled={!isEditing}
                        className={`input-field pr-12 ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isLoading}
                      className="btn-primary w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
                    >
                      {updateProfileMutation.isLoading ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>حفظ التغييرات</span>
                        </>
                      )}
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default ClientProfile
