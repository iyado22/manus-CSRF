import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { 
  Search, Plus, Edit, Eye, RefreshCw, ChevronDown, ChevronUp, 
  User, Phone, Mail, Calendar, DollarSign, Save, X, Briefcase
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { manageStaff } from '../../services/manageStaff'
import { useAuth } from '../../contexts/AuthContext'

const AdminStaff = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedStaffSchedule, setSelectedStaffSchedule] = useState(null)
  const queryClient = useQueryClient()
  const itemsPerPage = 10

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: errorsAdd },
    reset: resetAdd
  } = useForm()

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    setValue
  } = useForm()

  // Fetch staff list
  const { 
    data: staffData, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery(
    ['staff-list', currentPage],
    () => manageStaff.getStaffList(currentPage, itemsPerPage),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      onError: (error) => {
        console.error('Error fetching staff:', error)
        toast.error('فشل في تحميل بيانات الموظفين')
      }
    }
  )

  // Fetch staff schedule when needed
  const { 
    data: scheduleData, 
    isLoading: isLoadingSchedule,
    refetch: refetchSchedule
  } = useQuery(
    ['staff-schedule', selectedStaffSchedule?.staff_id],
    () => manageStaff.getStaffSchedule(selectedStaffSchedule?.staff_id),
    {
      enabled: !!selectedStaffSchedule?.staff_id,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Error fetching schedule:', error)
        toast.error('فشل في تحميل جدول الموظف')
      }
    }
  )

  // Create staff mutation
  const createStaffMutation = useMutation(
    (staffData) => manageStaff.createStaff(staffData),
    {
      onSuccess: () => {
        toast.success('تم إضافة الموظف بنجاح')
        setShowAddModal(false)
        resetAdd()
        queryClient.invalidateQueries('staff-list')
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في إضافة الموظف')
      }
    }
  )

  // Update staff mutation
  const updateStaffMutation = useMutation(
    (staffData) => manageStaff.updateStaffDetails(staffData),
    {
      onSuccess: () => {
        toast.success('تم تحديث بيانات الموظف بنجاح')
        setShowEditModal(false)
        setSelectedStaff(null)
        queryClient.invalidateQueries('staff-list')
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في تحديث بيانات الموظف')
      }
    }
  )

  // Filter and sort staff
  const filteredStaff = useMemo(() => {
    if (!staffData?.data) return []
    
    let filtered = [...staffData.data]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        staff => 
          staff.full_name.toLowerCase().includes(term) ||
          staff.email.toLowerCase().includes(term) ||
          staff.phone.includes(term)
      )
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    
    return filtered
  }, [staffData, searchTerm, sortConfig])

  // Request sort
  const requestSort = useCallback((key) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }, [])

  // Get sort direction indicator
  const getSortDirectionIndicator = useCallback((key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }, [sortConfig])

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return ''
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('ar-SA', options)
  }, [])

  // Handle add staff form submission
  const onSubmitAdd = (data) => {
    createStaffMutation.mutate({
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm,
      phone: data.phone,
      dob: data.dob,
      salary_per_hour: parseFloat(data.salary_per_hour),
      notes: data.notes || ''
    })
  }

  // Handle edit staff form submission
  const onSubmitEdit = (data) => {
    updateStaffMutation.mutate({
      staff_id: selectedStaff.staff_id,
      full_name: data.full_name,
      phone: data.phone,
      dob: data.dob,
      salary_per_hour: parseFloat(data.salary_per_hour),
      notes: data.notes || ''
    })
  }

  // Handle edit button click
  const handleEditClick = (staff) => {
    setSelectedStaff(staff)
    resetEdit()
    
    // Set form values
    setValue('full_name', staff.full_name)
    setValue('email', staff.email)
    setValue('phone', staff.phone)
    setValue('dob', staff.dob)
    setValue('salary_per_hour', staff.salary_per_hour)
    setValue('notes', staff.notes)
    
    setShowEditModal(true)
  }

  // Handle view schedule button click
  const handleViewSchedule = (staff) => {
    setSelectedStaffSchedule(staff)
    refetchSchedule()
    setShowScheduleModal(true)
  }

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!staffData?.total) return 1
    return Math.ceil(staffData.total / itemsPerPage)
  }, [staffData])

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الموظفين</h1>
          <p className="text-gray-600">عرض وإدارة جميع موظفي الصالون</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-auto md:flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث بالاسم أو البريد الإلكتروني أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pr-12 w-full"
              />
            </div>
            
            <div className="flex space-x-2 space-x-reverse w-full md:w-auto">
              <button
                onClick={() => setSearchTerm('')}
                className="btn-outline flex items-center space-x-2 space-x-reverse"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تعيين</span>
              </button>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2 space-x-reverse"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة موظف</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Staff Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
              <p className="text-gray-600 mb-4">لم نتمكن من تحميل بيانات الموظفين</p>
              <button
                onClick={() => refetch()}
                className="btn-primary flex items-center space-x-2 space-x-reverse"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <User className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد موظفين</h3>
              <p className="text-gray-600 mb-4">لم يتم العثور على موظفين يطابقون معايير البحث</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2 space-x-reverse"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة موظف</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('full_name')}
                    >
                      <div className="flex items-center justify-end">
                        <span>الاسم</span>
                        {getSortDirectionIndicator('full_name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('email')}
                    >
                      <div className="flex items-center justify-end">
                        <span>البريد الإلكتروني</span>
                        {getSortDirectionIndicator('email')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('phone')}
                    >
                      <div className="flex items-center justify-end">
                        <span>الهاتف</span>
                        {getSortDirectionIndicator('phone')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('salary_per_hour')}
                    >
                      <div className="flex items-center justify-end">
                        <span>الراتب/ساعة</span>
                        {getSortDirectionIndicator('salary_per_hour')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('created_at')}
                    >
                      <div className="flex items-center justify-end">
                        <span>تاريخ التعيين</span>
                        {getSortDirectionIndicator('created_at')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.staff_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-200" />
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {staff.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {staff.notes}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.salary_per_hour} ₪</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(staff.date_registered)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEditClick(staff)}
                            className="text-blue-600 hover:text-blue-900"
                            title="تعديل"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleViewSchedule(staff)}
                            className="text-green-600 hover:text-green-900"
                            title="عرض الجدول"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && filteredStaff.length > 0 && (
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-outline disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    عرض <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> إلى{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, staffData?.total || 0)}
                    </span>{' '}
                    من <span className="font-medium">{staffData?.total || 0}</span> نتيجة
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
        </motion.div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">إضافة موظف جديد</h2>
            
            <form onSubmit={handleSubmitAdd(onSubmitAdd)} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerAdd('full_name', { required: 'الاسم الكامل مطلوب' })}
                    type="text"
                    className={`input-field pr-12 ${errorsAdd.full_name ? 'border-red-500' : ''}`}
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                {errorsAdd.full_name && <p className="mt-1 text-sm text-red-600">{errorsAdd.full_name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerAdd('email', { 
                      required: 'البريد الإلكتروني مطلوب',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'البريد الإلكتروني غير صحيح'
                      }
                    })}
                    type="email"
                    className={`input-field pr-12 ${errorsAdd.email ? 'border-red-500' : ''}`}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                {errorsAdd.email && <p className="mt-1 text-sm text-red-600">{errorsAdd.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                <input
                  {...registerAdd('password', { 
                    required: 'كلمة المرور مطلوبة',
                    minLength: {
                      value: 6,
                      message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
                    }
                  })}
                  type="password"
                  className={`input-field ${errorsAdd.password ? 'border-red-500' : ''}`}
                  placeholder="أدخل كلمة المرور"
                />
                {errorsAdd.password && <p className="mt-1 text-sm text-red-600">{errorsAdd.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
                <input
                  {...registerAdd('password_confirm', { 
                    required: 'تأكيد كلمة المرور مطلوب',
                    validate: (value, formValues) => value === formValues.password || 'كلمات المرور غير متطابقة'
                  })}
                  type="password"
                  className={`input-field ${errorsAdd.password_confirm ? 'border-red-500' : ''}`}
                  placeholder="أعد إدخال كلمة المرور"
                />
                {errorsAdd.password_confirm && <p className="mt-1 text-sm text-red-600">{errorsAdd.password_confirm.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerAdd('phone', { 
                      required: 'رقم الهاتف مطلوب',
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'رقم الهاتف غير صحيح'
                      }
                    })}
                    type="tel"
                    className={`input-field pr-12 ${errorsAdd.phone ? 'border-red-500' : ''}`}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                {errorsAdd.phone && <p className="mt-1 text-sm text-red-600">{errorsAdd.phone.message}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الميلاد</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerAdd('dob', { required: 'تاريخ الميلاد مطلوب' })}
                    type="date"
                    className={`input-field pr-12 ${errorsAdd.dob ? 'border-red-500' : ''}`}
                  />
                </div>
                {errorsAdd.dob && <p className="mt-1 text-sm text-red-600">{errorsAdd.dob.message}</p>}
              </div>

              {/* Salary Per Hour */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الراتب بالساعة (₪)</label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerAdd('salary_per_hour', { 
                      required: 'الراتب بالساعة مطلوب',
                      min: {
                        value: 0,
                        message: 'يجب أن يكون الراتب بالساعة أكبر من 0'
                      }
                    })}
                    type="number"
                    step="0.01"
                    className={`input-field pr-12 ${errorsAdd.salary_per_hour ? 'border-red-500' : ''}`}
                    placeholder="أدخل الراتب بالساعة"
                  />
                </div>
                {errorsAdd.salary_per_hour && <p className="mt-1 text-sm text-red-600">{errorsAdd.salary_per_hour.message}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  {...registerAdd('notes')}
                  rows="3"
                  className="input-field w-full"
                  placeholder="أدخل ملاحظات إضافية (اختياري)"
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createStaffMutation.isLoading}
                  className="btn-primary"
                >
                  {createStaffMutation.isLoading ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="sm" text="" />
                      <span className="mr-2">جاري الإضافة...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl relative">
            <button
              onClick={() => {
                setShowEditModal(false)
                setSelectedStaff(null)
              }}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">تعديل بيانات الموظف</h2>
            
            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerEdit('full_name', { required: 'الاسم الكامل مطلوب' })}
                    type="text"
                    className={`input-field pr-12 ${errorsEdit.full_name ? 'border-red-500' : ''}`}
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                {errorsEdit.full_name && <p className="mt-1 text-sm text-red-600">{errorsEdit.full_name.message}</p>}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerEdit('email')}
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
                    {...registerEdit('phone', { 
                      required: 'رقم الهاتف مطلوب',
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'رقم الهاتف غير صحيح'
                      }
                    })}
                    type="tel"
                    className={`input-field pr-12 ${errorsEdit.phone ? 'border-red-500' : ''}`}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                {errorsEdit.phone && <p className="mt-1 text-sm text-red-600">{errorsEdit.phone.message}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الميلاد</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerEdit('dob', { required: 'تاريخ الميلاد مطلوب' })}
                    type="date"
                    className={`input-field pr-12 ${errorsEdit.dob ? 'border-red-500' : ''}`}
                  />
                </div>
                {errorsEdit.dob && <p className="mt-1 text-sm text-red-600">{errorsEdit.dob.message}</p>}
              </div>

              {/* Salary Per Hour */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الراتب بالساعة (₪)</label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...registerEdit('salary_per_hour', { 
                      required: 'الراتب بالساعة مطلوب',
                      min: {
                        value: 0,
                        message: 'يجب أن يكون الراتب بالساعة أكبر من 0'
                      }
                    })}
                    type="number"
                    step="0.01"
                    className={`input-field pr-12 ${errorsEdit.salary_per_hour ? 'border-red-500' : ''}`}
                    placeholder="أدخل الراتب بالساعة"
                  />
                </div>
                {errorsEdit.salary_per_hour && <p className="mt-1 text-sm text-red-600">{errorsEdit.salary_per_hour.message}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  {...registerEdit('notes')}
                  rows="3"
                  className="input-field w-full"
                  placeholder="أدخل ملاحظات إضافية (اختياري)"
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedStaff(null)
                  }}
                  className="btn-outline"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={updateStaffMutation.isLoading}
                  className="btn-primary"
                >
                  {updateStaffMutation.isLoading ? (
                    <span className="flex items-center">
                      <LoadingSpinner size="sm" text="" />
                      <span className="mr-2">جاري الحفظ...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Schedule Modal */}
      {showScheduleModal && selectedStaffSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setShowScheduleModal(false)
                setSelectedStaffSchedule(null)
              }}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              جدول {selectedStaffSchedule.full_name}
            </h2>
            
            {isLoadingSchedule ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Weekly Schedule */}
                <div className="card p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">المواعيد القادمة</h3>
                  
                  {scheduleData?.data && Object.keys(scheduleData.data).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(scheduleData.data)
                        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                        .map(([date, appointments]) => (
                          <div key={date} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <h4 className="font-bold text-gray-900 mb-3">
                              {formatDate(date)}
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {appointments.map((appointment) => (
                                <div
                                  key={appointment.appointment_id}
                                  className="p-3 bg-gray-50 rounded-lg border-r-4 border-primary-200"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {appointment.time}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      appointment.status === 'completed' 
                                        ? 'bg-green-100 text-green-800'
                                        : appointment.status === 'confirmed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : appointment.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {appointment.status === 'completed' && 'مكتمل'}
                                      {appointment.status === 'confirmed' && 'مؤكد'}
                                      {appointment.status === 'pending' && 'في الانتظار'}
                                      {appointment.status === 'cancelled' && 'ملغي'}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                      <User className="w-3 h-3 text-primary-200" />
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">
                                      {appointment.client_name}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {appointment.service_name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مواعيد</h3>
                      <p className="text-gray-600">لا توجد مواعيد مجدولة لهذا الموظف</p>
                    </div>
                  )}
                </div>
                
                {/* Work Statistics */}
                <div className="card p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">إحصائيات العمل</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm text-gray-500 mb-1">المواعيد المكتملة</h4>
                      <p className="text-2xl font-bold text-primary-200">
                        {scheduleData?.stats?.completed_appointments || 0}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm text-gray-500 mb-1">ساعات العمل (الشهر)</h4>
                      <p className="text-2xl font-bold text-primary-200">
                        {scheduleData?.stats?.monthly_hours || 0}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm text-gray-500 mb-1">متوسط التقييم</h4>
                      <p className="text-2xl font-bold text-primary-200">
                        {scheduleData?.stats?.average_rating || 'غير متوفر'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default AdminStaff