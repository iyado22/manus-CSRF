import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { serviceService } from '../../services/serviceService'


const AdminServices = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const { data: servicesData, isLoading } = useQuery('admin-services', serviceService.getServices)

  const createServiceMutation = useMutation(
  async (data) => await serviceService.createService(data),
  {
    onSuccess: () => {
      toast.success('تم إضافة الخدمة بنجاح')
      queryClient.invalidateQueries('admin-services')
      setShowAddModal(false)
      reset()
    },
    onError: () => toast.error('فشل في إضافة الخدمة')
  }
)



  const updateServiceMutation = useMutation(
  async (data) => await serviceService.updateService(data),
  {
    onSuccess: () => {
      toast.success('تم تعديل الخدمة بنجاح')
      queryClient.invalidateQueries('admin-services')
      setSelectedService(null)
    },
    onError: () => toast.error('فشل في تعديل الخدمة')
  }
)


  const toggleServiceMutation = useMutation(serviceService.toggleServiceStatus, {
    onSuccess: () => {
      toast.success('تم تحديث حالة الخدمة بنجاح!')
      queryClient.invalidateQueries('admin-services')
    },
    onError: () => toast.error('فشل في تحديث حالة الخدمة'),
  })

  const deleteServiceMutation = useMutation(serviceService.deleteService, {
    onSuccess: () => {
      toast.success('تم حذف الخدمة بنجاح!')
      queryClient.invalidateQueries('admin-services')
    },
    onError: () => toast.error('فشل في حذف الخدمة'),
  })

  const services = servicesData?.data || []

  const handleEditClick = (service) => {
  setSelectedService(service)

  reset({
    name: service.name || '',
    description: service.description || '',
    price: service.price || '',
    duration: service.duration || ''
  })
}


  const onSubmitAdd = (data) => {
  createServiceMutation.mutate(data)
}

 const onSubmitEdit = (data) => {
  const fullData = {
    ...data,
    serviceId: selectedService.id
  }
  updateServiceMutation.mutate(fullData)
}



  const handleToggleService = (id) => toggleServiceMutation.mutate(id)
  const handleDeleteService = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) deleteServiceMutation.mutate(id)
  }

  const handleAddModalClose = () => {
    setShowAddModal(false)
    reset()
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">إدارة الخدمات</h1>
            <p className="text-gray-600">عرض وإدارة جميع خدمات الصالون</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center">
            <Plus className="w-5 h-5 ml-2" /> إضافة خدمة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card overflow-hidden"
            >
              <div className="relative h-48 bg-gray-200">
                {service.image_path ? (
                 <img src={`/${service.image_path}`} alt={service.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">{service.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {service.is_active ? 'نشط' : 'معطل'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{service.name}</h3>
                  <span className="text-primary-600 font-bold">{service.price} ر.س</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                <div className="text-sm text-gray-500 mb-4 flex justify-between">
                  <span>المدة: {service.duration} دقيقة</span>
                  <span>تاريخ: {new Date(service.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(service)} className="btn-outline flex-1">
                    <Edit className="w-4 h-4 ml-1" /> تعديل
                  </button>
                  <button onClick={() => handleToggleService(service.id)} className="btn-outline">
                    {service.is_active ? <EyeOff /> : <Eye />}
                  </button>
                  <button onClick={() => handleDeleteService(service.id)} className="btn-outline text-red-600">
                    <Trash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl relative">
            <button onClick={handleAddModalClose} className="absolute top-2 left-2">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">إضافة خدمة جديدة</h2>
            <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخدمة</label>
                <input 
                  {...register('name', { required: 'اسم الخدمة مطلوب' })} 
                  className="input-field w-full" 
                  placeholder="اسم الخدمة" 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea 
                  {...register('description', { required: 'وصف الخدمة مطلوب' })} 
                  className="input-field w-full" 
                  placeholder="وصف الخدمة"
                  rows={3}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    {...register('price', { 
                      required: 'السعر مطلوب', 
                      min: { value: 0, message: 'يجب أن يكون السعر أكبر من 0' } 
                    })} 
                    className="input-field w-full" 
                    placeholder="السعر" 
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدة (بالدقائق)</label>
                  <input 
                    type="number" 
                    {...register('duration', { 
                      required: 'المدة مطلوبة', 
                      min: { value: 1, message: 'يجب أن تكون المدة أكبر من 0' } 
                    })} 
                    className="input-field w-full" 
                    placeholder="المدة بالدقائق" 
                  />
                  {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصورة</label>
                <input 
                  type="file" 
                  {...register('image')} 
                  className="input-field w-full" 
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-1">اختيارية: يمكنك إضافة صورة للخدمة</p>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary w-full py-2"
                disabled={createServiceMutation.isLoading}
              >
                {createServiceMutation.isLoading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" text="" />
                    <span className="mr-2">جاري الإضافة...</span>
                  </span>
                ) : 'إضافة الخدمة'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl relative">
            <button onClick={() => setSelectedService(null)} className="absolute top-2 left-2">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">تعديل الخدمة</h2>
            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخدمة</label>
                <input 
                  {...register('name', { required: true })} 
                  className="input-field w-full" 
                  placeholder="اسم الخدمة" 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea 
                  {...register('description', { required: true })} 
                  className="input-field w-full" 
                  placeholder="وصف الخدمة"
                  rows={3}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    {...register('price', { required: true, min: 0 })} 
                    className="input-field w-full" 
                    placeholder="السعر" 
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">أدخل سعراً صحيحاً</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدة (بالدقائق)</label>
                  <input 
                    type="number" 
                    {...register('duration', { required: true, min: 1 })} 
                    className="input-field w-full" 
                    placeholder="المدة بالدقائق" 
                  />
                  {errors.duration && <p className="text-red-500 text-xs mt-1">أدخل مدة صحيحة</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصورة</label>
                <input 
                  type="file" 
                  {...register('image')} 
                  className="input-field w-full" 
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-1">اترك هذا الحقل فارغاً للاحتفاظ بالصورة الحالية</p>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary w-full py-2"
                disabled={updateServiceMutation.isLoading}
              >
                {updateServiceMutation.isLoading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" text="" />
                    <span className="mr-2">جاري الحفظ...</span>
                  </span>
                ) : 'حفظ التعديلات'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default AdminServices