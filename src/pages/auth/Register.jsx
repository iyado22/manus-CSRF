import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import logo from '../../assets/images/1.png'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser, loading } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    const result = await registerUser({
      full_name: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phone: data.phone,
      dob: data.dob,
    })
    
    if (result.success) {
      navigate('/login')
    }
  }

  const passwordRequirements = [
    { text: 'على الأقل 8 أحرف', met: password?.length >= 8 },
    { text: 'يحتوي على حرف كبير', met: /[A-Z]/.test(password) },
    { text: 'يحتوي على حرف صغير', met: /[a-z]/.test(password) },
    { text: 'يحتوي على رقم', met: /\d/.test(password) },
  ]

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-6 right-6 flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-primary-200 transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5 transform rotate-180" />
        <span>العودة للرئيسية</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo and Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6"
          >
            <img 
              src={logo}
              alt="قصر نور الشمس" 
              className="w-24 h-24 rounded-full object-cover mx-auto"
            />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            إنشاء حساب جديد
          </h2>
          <p className="text-gray-600">
            انضمي إلينا واستمتعي بخدماتنا المميزة
          </p>
        </div>

        {/* Register Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل
              </label>
              <input
                {...register('fullName', {
                  required: 'الاسم الكامل مطلوب',
                  minLength: {
                    value: 2,
                    message: 'الاسم يجب أن يكون حرفين على الأقل'
                  }
                })}
                type="text"
                className={`input-field ${errors.fullName ? 'border-red-500' : ''}`}
                placeholder="أدخلي اسمك الكامل"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                {...register('email', {
                  required: 'البريد الإلكتروني مطلوب',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'البريد الإلكتروني غير صحيح'
                  }
                })}
                type="email"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="أدخلي بريدك الإلكتروني"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                {...register('phone', {
                  required: 'رقم الهاتف مطلوب',
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: 'رقم الهاتف غير صحيح'
                  }
                })}
                type="tel"
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="أدخلي رقم هاتفك"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الميلاد
              </label>
              <input
                {...register('dob', {
                  required: 'تاريخ الميلاد مطلوب'
                })}
                type="date"
                className={`input-field ${errors.dob ? 'border-red-500' : ''}`}
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'كلمة المرور مطلوبة',
                    minLength: {
                      value: 8,
                      message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-12 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="أدخلي كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse text-xs">
                      <Check className={`w-3 h-3 ${req.met ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'تأكيد كلمة المرور مطلوب',
                    validate: value => value === password || 'كلمات المرور غير متطابقة'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input-field pr-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="أعيدي إدخال كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3 space-x-reverse">
              <input
                {...register('terms', {
                  required: 'يجب الموافقة على الشروط والأحكام'
                })}
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary-200 focus:ring-primary-200 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                أوافق على{' '}
                <Link to="/terms" className="text-primary-200 hover:text-primary-300">
                  الشروط والأحكام
                </Link>
                {' '}و{' '}
                <Link to="/privacy" className="text-primary-200 hover:text-primary-300">
                  سياسة الخصوصية
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" text="" /> : 'إنشاء حساب'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link
                to="/login"
                className="text-primary-200 hover:text-primary-300 font-medium"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Register