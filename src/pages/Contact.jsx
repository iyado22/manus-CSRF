import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'


const Contact = () => {
  const { t } = useLanguage()

  return (
    <div>
      <Header/>
      <div className="max-w-4xl mx-auto px-4 py-20">
      
      <h1 className="text-4xl font-bold text-center mb-8">{t('contact')}</h1>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
          <input type="text" className="input-field w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
          <input type="email" className="input-field w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة</label>
          <textarea rows="5" className="input-field w-full resize-none"></textarea>
        </div>

        <button type="submit" className="btn-primary w-full">إرسال</button>
      </form>
    </div>
    <Footer/>
    </div>
    
  )
}

export default Contact;
