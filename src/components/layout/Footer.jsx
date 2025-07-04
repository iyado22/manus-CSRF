import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

const Footer = () => {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <img  
                src="/uploads/326990118_1174552563255369_3350075490533963167_n-removebg-preview1.png" 
                alt="قصر نور الشمس" 
                className="h-20 w-20 object-contain"
              />
              <span className="text-xl font-bold">قصر نور الشمس</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              مركز متكامل للجمال والعناية بالمرأة، نقدم خدمات متميزة بأيدي خبراء متخصصين 
              باستخدام أحدث التقنيات والمنتجات العالمية.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-300 hover:text-primary-200 transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-200 transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-200 transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-200 transition-colors duration-200">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/#services" className="text-gray-300 hover:text-primary-200 transition-colors duration-200">
                  {t('services')}
                </Link>
              </li>
              <li>
                <Link to="/#about" className="text-gray-300 hover:text-primary-200 transition-colors duration-200">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/#contact" className="text-gray-300 hover:text-primary-200 transition-colors duration-200">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">معلومات التواصل</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 space-x-reverse">
                <MapPin className="w-4 h-4 text-primary-200" />
                <span className="text-gray-300 text-sm">جنين - شارع حيفا - عمارة الفيصل</span>
              </li>
              <li className="flex items-center space-x-2 space-x-reverse">
                <Phone className="w-4 h-4 text-primary-200" />
                <span className="text-gray-300 text-sm">+972598267948</span>
              </li>
              <li className="flex items-center space-x-2 space-x-reverse">
                <Mail className="w-4 h-4 text-primary-200" />
                <span className="text-gray-300 text-sm">muhammadsh.icloud@gmail.com</span>
              </li>
            </ul>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">ساعات العمل</h4>
              <p className="text-gray-300 text-sm">السبت - الخميس: 10:00 ص - 10:00 م</p>
              <p className="text-gray-300 text-sm">الجمعة: 2:00 م - 10:00 م</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            جميع الحقوق محفوظة &copy; 2025 قصر نور الشمس للجمال
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer