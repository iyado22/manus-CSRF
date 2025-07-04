// /src/pages/admin/Appointments.jsx

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { Search, Filter, Calendar, UserCheck, Edit2, Eye } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import api from '../../services/api'

const Appointments = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const queryClient = useQueryClient()
const [page, setPage] = useState(1)
const itemsPerPage = 10
const [pagination, setPagination] = useState({ total_pages: 1, total_results: 0 })
  const [filter, setFilter] = useState('all')
  const [clientName, setClientName] = useState('')
  const [staffName, setStaffName] = useState('')
  const [specificDate, setSpecificDate] = useState('')

  const fetchAppointments = async () => {
  const formData = new FormData()
  
  formData.append('user_id', user.user_id)
  formData.append('role', user.role)
  formData.append('csrf_token', localStorage.getItem('csrf_token') || '')
  formData.append('filter', filter)
  formData.append('page', page)  


  if (filter === 'by_client_name') formData.append('client_name', clientName)
  if (filter === 'by_staff_name') formData.append('staff_name', staffName)
  if (filter === 'by_specific_date') formData.append('date', specificDate)

 const response = await api.post('/booking/viewAllAppointments.php', formData, { withCredentials: true })
  return response.data
}


  const { data: result, isLoading } = useQuery(
  ['appointments', page, filter, clientName, staffName, specificDate],
  fetchAppointments,
  {
    enabled: !!user,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  }
)
console.log('Query Result:', result)


  const appointments = result?.data || []

useEffect(() => {
  if (result?.total_pages) {
    setPagination({
      total_pages: result.total_pages,
      total_results: result.total_results,
    })
  }
}, [result])



  console.log('Appointments:', appointments)


  const assignStaff = useMutation(async ({ appointmentId, staffId }) => {
    const formData = new FormData()
    formData.append('user_id', user.user_id)
    formData.append('role', user.role)
    formData.append('appointment_id', appointmentId)
    formData.append('staff_id', staffId)
    formData.append('csrf_token', localStorage.getItem('csrf_token') || '')
    const response = await api.post('/staff/assignStaff.php', formData, { withCredentials: true })
    return response.data
  }, {
    onSuccess: () => {
      toast.success('تم تعيين الموظف بنجاح')
      queryClient.invalidateQueries('appointments')
    },
    onError: () => toast.error('فشل تعيين الموظف')
  })

  const updateStatus = useMutation(async ({ appointmentId, newStatus }) => {
    const formData = new FormData()
    formData.append('user_id', user.user_id)
    formData.append('role', user.role)
    formData.append('appointment_id', appointmentId)
    formData.append('status', newStatus)
    formData.append('csrf_token', localStorage.getItem('csrf_token') || '')
    const response = await api.post('/staff/staffUpdateBookingStatus.php', formData, { withCredentials: true })
    return response.data
  }, {
    onSuccess: () => {
      toast.success('تم تحديث حالة الحجز')
      queryClient.invalidateQueries('appointments')
    },
    onError: () => toast.error('فشل تحديث الحالة')
  })

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
        <motion.div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">جميع المواعيد</h1>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <select onChange={e => setFilter(e.target.value)} value={filter} className="p-2 rounded">
              <option value="all">الكل</option>
              <option value="pending">قيد الانتظار</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغاة</option>
              <option value="by_client_name">حسب اسم العميل</option>
              <option value="by_staff_name">حسب اسم الموظف</option>
              <option value="by_specific_date">بتاريخ محدد</option>
            </select>
            {filter === 'by_client_name' && <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="اسم العميل" className="p-2 rounded" />}
            {filter === 'by_staff_name' && <input value={staffName} onChange={e => setStaffName(e.target.value)} placeholder="اسم الموظف" className="p-2 rounded" />}
            {filter === 'by_specific_date' && <input type="date" value={specificDate} onChange={e => setSpecificDate(e.target.value)} className="p-2 rounded" />}
          </div>

          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3">العميل</th>
                  <th className="p-3">الموظف</th>
                  <th className="p-3">الخدمة</th>
                  <th className="p-3">السعر</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">الوقت</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {(appointments || []).map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{a.client_name}</td>
                    <td className="p-3">{a.staff_name || 'غير معين'}</td>
                    <td className="p-3">{a.service_name}</td>
                    <td className="p-3">{a.price}</td>
                    <td className="p-3">{a.date}</td>
                    <td className="p-3">{a.time}</td>
                    <td className="p-3">{a.status}</td>
                    <td className="p-3 space-x-2 space-x-reverse">
                      <button onClick={() => toast.info('عرض التفاصيل')} className="text-blue-600"><Eye className="inline w-4 h-4" /></button>
                      {a.status === 'pending' && (
                        <button onClick={() => assignStaff.mutate({ appointmentId: a.appointment_id, staffId: 2 })} className="text-green-600"><UserCheck className="inline w-4 h-4" /></button>
                      )}
                      <button onClick={() => updateStatus.mutate({ appointmentId: a.appointment_id, newStatus: 'completed' })} className="text-yellow-600"><Edit2 className="inline w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && appointments?.length > 0 && (
  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
    <div className="flex-1 flex justify-between sm:hidden">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="btn-outline disabled:opacity-50"
      >
        السابق
      </button>
      <button
        onClick={() => setPage(Math.min(pagination.total_pages, page + 1))}
        disabled={page === pagination.total_pages}
        className="btn-outline disabled:opacity-50"
      >
        التالي
      </button>
    </div>
    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-gray-700">
          عرض <span className="font-medium">{((page - 1) * itemsPerPage) + 1}</span> إلى{' '}
          <span className="font-medium">
            {Math.min(page * itemsPerPage, pagination.total_results)}
          </span>{' '}
          من <span className="font-medium">{pagination.total_results}</span> نتيجة
        </p>
      </div>
      <div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                p === page
                  ? 'z-10 bg-primary-200 border-primary-200 text-white'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </nav>
      </div>
    </div>
  </div>
)}


          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

export default Appointments
