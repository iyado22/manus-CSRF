import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { 
  Star, 
  Search, 
  Trash2, 
  RefreshCw, 
  User, 
  Calendar, 
  MessageSquare,
  AlertTriangle,
  Filter
} from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { feedbackService } from '../../services/feedbackService'
import { useAuth } from '../../contexts/AuthContext'

const AdminFeedback = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
 const [currentPage, setCurrenttPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterRating, setFilterRating] = useState('')
  const queryClient = useQueryClient()
  const itemsPerPage = 10

  // Fetch feedback with pagination
  const { 
    data: feedbackData, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery(
    ['admin-feedback', currentPage],
    () => feedbackService.getFeedback(currentPage, itemsPerPage),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      onError: (error) => {
        console.error('Error fetching feedback:', error)
        toast.error('فشل في تحميل التقييمات')
      }
    }
  )

  // Delete feedback mutation
  const deleteFeedbackMutation = useMutation(
    (feedbackId) => feedbackService.deleteFeedback(feedbackId),
    {
      onSuccess: () => {
        toast.success('تم حذف التقييم بنجاح')
        queryClient.invalidateQueries(['admin-feedback'])
      },
      onError: (error) => {
        toast.error(error.message || 'فشل في حذف التقييم')
      }
    }
  )

  // Process feedback data
  const feedback = feedbackData?.data || []
  const totalPages = Math.ceil((feedbackData?.total_results || 0) / itemsPerPage)

  // Filter and sort feedback
  const filteredFeedback = React.useMemo(() => {
    if (!feedback.length) return []
    
    let filtered = [...feedback]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        item => 
          item.client_name?.toLowerCase().includes(term) ||
          item.service_name?.toLowerCase().includes(term) ||
          item.comment?.toLowerCase().includes(term)
      )
    }
    
    // Apply rating filter
    if (filterRating) {
      filtered = filtered.filter(item => item.rating === parseInt(filterRating))
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return sortOrder === 'asc' 
          ? a.rating - b.rating 
          : b.rating - a.rating
      } else if (sortBy === 'created_at') {
        return sortOrder === 'asc'
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at)
      }
      return 0
    })
    
    return filtered
  }, [feedback, searchTerm, filterRating, sortBy, sortOrder])

  // Handle delete feedback
  const handleDeleteFeedback = (feedbackId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      deleteFeedbackMutation.mutate(feedbackId)
    }
  }

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setFilterRating('')
    setSortBy('created_at')
    setSortOrder('desc')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تقييمات العملاء</h1>
          <p className="text-gray-600">عرض وإدارة تقييمات العملاء للخدمات</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث بالاسم أو الخدمة أو التعليق..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pr-12 w-full"
              />
            </div>

            {/* Rating Filter */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">جميع التقييمات</option>
                <option value="5">5 نجوم</option>
                <option value="4">4 نجوم</option>
                <option value="3">3 نجوم</option>
                <option value="2">2 نجوم</option>
                <option value="1">1 نجمة</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-gray-500 text-sm">ترتيب حسب:</span>
              <button
                onClick={() => handleSortChange('created_at')}
                className={`px-3 py-1 rounded-md text-sm ${
                  sortBy === 'created_at' 
                    ? 'bg-primary-100 text-primary-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                التاريخ {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('rating')}
                className={`px-3 py-1 rounded-md text-sm ${
                  sortBy === 'rating' 
                    ? 'bg-primary-100 text-primary-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                التقييم {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="btn-outline flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تعيين</span>
            </button>
          </div>
        </motion.div>

        {/* Feedback List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
              <p className="text-gray-600 mb-4">لم نتمكن من تحميل التقييمات</p>
              <button
                onClick={() => refetch()}
                className="btn-primary flex items-center space-x-2 space-x-reverse"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد تقييمات</h3>
              <p className="text-gray-600">لم يتم العثور على تقييمات تطابق معايير البحث</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFeedback.map((item) => (
                <motion.div
                  key={item.feedback_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4 space-x-reverse">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-200" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{item.client_name}</h3>
                        <p className="text-gray-600 text-sm">{item.service_name}</p>
                        <div className="flex items-center mt-1">
                          {feedbackService.getStarRating(item.rating).map((star, index) => (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${star.filled ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 mr-2">{item.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleDeleteFeedback(item.feedback_id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="حذف التقييم"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border-r-4 border-primary-200">
                      {item.comment}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 ml-1" />
                    <span>{feedbackService.formatDate(item.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && filteredFeedback.length > 0 && (
            <div className="mt-8 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">السابق</span>
                  <svg className="h-5 w-5 transform rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
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
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">التالي</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

export default AdminFeedback