import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { 
  Search, Filter, RefreshCw, ChevronDown, ChevronUp, 
  User, UserCheck, UserX, Eye, Calendar, Mail, Phone,
  X, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { userServices } from '../../services/userService'

const UserManagement = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const queryClient = useQueryClient()
  const itemsPerPage = 10

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    
    return () => {
      clearTimeout(timerId)
    }
  }, [searchTerm])

  // Fetch users with search and filters
  const { 
    data: usersData, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery(
    ['admin-users', currentPage, debouncedSearchTerm, statusFilter, roleFilter, dateFilter],
    () => userServices.searchUsers({
      userId: user?.id,
      role: user?.role,
      page: currentPage,
      searchTerm: debouncedSearchTerm,
      statusFilter,
      roleFilter,
      dateFilter
    }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: 2,
      onError: (error) => {
        console.error('Error fetching users:', error)
        toast.error('فشل في تحميل بيانات المستخدمين')
      }
    }
  )

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation(
    (params) => userServices.toggleUserStatus({
      adminId: user?.id,
      adminRole: user?.role,
      userId: params.userId,
      newStatus: params.newStatus,
      csrfToken: user?.csrf_token
    }),
    {
      onSuccess: () => {
        toast.success('تم تحديث حالة المستخدم بنجاح')
        queryClient.invalidateQueries(['admin-users'])
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في تحديث حالة المستخدم')
      }
    }
  )

  // Get user activity logs
  const { 
    data: userActivityData, 
    isLoading: isLoadingActivity,
    refetch: refetchActivity
  } = useQuery(
    ['user-activity', selectedUser?.user_id],
    () => userServices.getUserActivity({
      adminId: user?.id,
      adminRole: user?.role,
      targetUserId: selectedUser?.user_id
    }),
    {
      enabled: !!selectedUser?.user_id,
      refetchOnWindowFocus: false,
      retry: 1
    }
  )

  const users = usersData?.data || []
  const pagination = usersData?.pagination || {
    total_results: 0,
    total_pages: 0,
    current_page: 1,
    items_per_page: itemsPerPage
  }
  
  const userActivity = userActivityData?.data || []

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Get sort direction indicator
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  // Sort users
  const sortedUsers = React.useMemo(() => {
    if (!users.length) return []
    
    const sortableUsers = [...users]
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableUsers
  }, [users, sortConfig])

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setRoleFilter('')
    setDateFilter('')
    setCurrentPage(1)
  }

  // Handle user detail view
  const handleViewUserDetail = (userData) => {
    setSelectedUser(userData)
    setShowUserDetail(true)
    if (userData?.user_id) {
      refetchActivity()
    }
  }

  // Handle toggle user status
  const handleToggleUserStatus = (userId, currentStatus) => {
    if (window.confirm(currentStatus 
      ? 'هل أنت متأكد من تعطيل هذا المستخدم؟' 
      : 'هل أنت متأكد من تفعيل هذا المستخدم؟')) {
      toggleUserStatusMutation.mutate({
        userId,
        newStatus: !currentStatus
      })
    }
  }

  // Get role badge
  const getRoleBadge = (role) => {
    const badgeData = userServices.getRoleBadgeData(role)
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${badgeData.className}`}>
        {badgeData.label}
      </span>
    )
  }

  // Get status badge
  const getStatusBadge = (isActive) => {
    const badgeData = userServices.getStatusBadgeData(isActive)
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${badgeData.className}`}>
        {badgeData.label}
      </span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-600">عرض وإدارة جميع المستخدمين في النظام</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pr-12"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-field"
              >
                <option value="">جميع الأدوار</option>
                <option value="admin">مدير</option>
                <option value="staff">موظف</option>
                <option value="client">عميل</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">معطل</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end mt-4 space-x-2 space-x-reverse">
            <button
              onClick={resetFilters}
              className="btn-outline flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تعيين</span>
            </button>
            
            <button
              onClick={() => refetch()}
              className="btn-primary flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تحديث</span>
            </button>
          </div>
        </motion.div>

        {/* Users Table */}
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
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
              <p className="text-gray-600 mb-4">لم نتمكن من تحميل بيانات المستخدمين</p>
              <button
                onClick={() => refetch()}
                className="btn-primary flex items-center space-x-2 space-x-reverse"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : sortedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <User className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد مستخدمين</h3>
              <p className="text-gray-600">لم يتم العثور على مستخدمين يطابقون معايير البحث</p>
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
                        <span>المستخدم</span>
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
                      onClick={() => requestSort('role')}
                    >
                      <div className="flex items-center justify-end">
                        <span>الدور</span>
                        {getSortDirectionIndicator('role')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('is_active')}
                    >
                      <div className="flex items-center justify-end">
                        <span>الحالة</span>
                        {getSortDirectionIndicator('is_active')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('created_at')}
                    >
                      <div className="flex items-center justify-end">
                        <span>تاريخ التسجيل</span>
                        {getSortDirectionIndicator('created_at')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-200" />
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.is_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userServices.formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleViewUserDetail(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.user_id, user.is_active)}
                            className={`${
                              user.is_active 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={user.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                            disabled={toggleUserStatusMutation.isLoading}
                          >
                            {user.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
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
          {!isLoading && !isError && sortedUsers.length > 0 && (
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
                  onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                  disabled={currentPage === pagination.total_pages}
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
                      {Math.min(currentPage * itemsPerPage, pagination.total_results)}
                    </span>{' '}
                    من <span className="font-medium">{pagination.total_results}</span> نتيجة
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
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

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">تفاصيل المستخدم</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-primary-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedUser.full_name}</h3>
                  <p className="text-gray-600 mb-2">{selectedUser.email}</p>
                  <div className="flex space-x-2 space-x-reverse mb-4">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.is_active)}
                  </div>
                  <button
                    onClick={() => handleToggleUserStatus(selectedUser.user_id, selectedUser.is_active)}
                    className={`btn-outline w-full ${
                      selectedUser.is_active ? 'text-red-600 border-red-600 hover:bg-red-50' : 'text-green-600 border-green-600 hover:bg-green-50'
                    }`}
                    disabled={toggleUserStatusMutation.isLoading}
                  >
                    {toggleUserStatusMutation.isLoading ? (
                      <LoadingSpinner size="sm" text="" />
                    ) : (
                      <>
                        {selectedUser.is_active ? (
                          <>
                            <UserX className="w-4 h-4 ml-2" />
                            <span>تعطيل الحساب</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 ml-2" />
                            <span>تفعيل الحساب</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات المستخدم</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">الاسم الكامل</p>
                        <p className="font-medium">{selectedUser.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">رقم الهاتف</p>
                        <p className="font-medium">{selectedUser.phone || 'غير متوفر'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">تاريخ الميلاد</p>
                        <p className="font-medium">{selectedUser.dob ? userServices.formatDate(selectedUser.dob) : 'غير متوفر'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">تاريخ التسجيل</p>
                        <p className="font-medium">{userServices.formatDate(selectedUser.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">حالة التحقق</p>
                        <p className="font-medium">{selectedUser.is_verified ? 'تم التحقق' : 'لم يتم التحقق'}</p>
                      </div>
                    </div>
                  </div>
                </div>

               
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default UserManagement