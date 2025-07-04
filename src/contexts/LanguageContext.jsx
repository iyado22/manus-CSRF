import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    services: 'خدماتنا',
    about: 'من نحن',
    testimonials: 'آراء العملاء',
    contact: 'اتصل بنا',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    dashboard: 'لوحة التحكم',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    
    // Hero Section
    heroTitle: 'مرحباً بك في قصر نور الشمس للجمال',
    heroSubtitle: 'نقدم لك أفضل خدمات العناية بالبشرة والشعر والمكياج بأيدي خبراء متخصصين',
    bookNow: 'احجزي موعدك الآن',
    exploreServices: 'استكشفي خدماتنا',
    
    // Services
    hairCare: 'العناية بالشعر',
    skinCare: 'العناية بالبشرة',
    makeup: 'المكياج',
    nailCare: 'العناية بالأظافر',
    
    // Common
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    confirm: 'تأكيد',
    close: 'إغلاق',
    
    // Forms
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    submit: 'إرسال',
    
    // Messages
    success: 'تم بنجاح',
    error: 'حدث خطأ',
    warning: 'تحذير',
    info: 'معلومات',
  },
  en: {
    // Navigation
    home: 'Home',
    services: 'Services',
    about: 'About',
    testimonials: 'Testimonials',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    profile: 'Profile',
    logout: 'Logout',
    
    // Hero Section
    heroTitle: 'Welcome to Noor Al-Shams Beauty Palace',
    heroSubtitle: 'We provide the best skin, hair, and makeup care services by professional experts',
    bookNow: 'Book Now',
    exploreServices: 'Explore Services',
    
    // Services
    hairCare: 'Hair Care',
    skinCare: 'Skin Care',
    makeup: 'Makeup',
    nailCare: 'Nail Care',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    close: 'Close',
    
    // Forms
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    submit: 'Submit',
    
    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ar'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const t = (key) => {
    return translations[language][key] || key
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar')
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isRTL: language === 'ar'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}