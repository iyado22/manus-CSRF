import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, Globe } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import logo from '../../assets/images/1.png'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { t, language, toggleLanguage } = useLanguage()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isClient = user?.role === 'client'
  const isAdmin = user?.role === 'admin'
  const isStaff = user?.role === 'staff'

  const navItems = [
    { name: t('home'), path: '/' },
    { name: t('services'), path: '/services' },
    { name: t('about'), path: '/about' },

    ...(isAuthenticated && isClient
      ? [
          { name: 'حجوزاتي', path: '/client/appointments' },
          { name: 'احجز موعد', path: '/client/booking' },
          { name: 'حسابي', path: '/client/profile' },
          { name: 'لوحة التحكم', path: '/client/dashboard' }
        ]
      : []),

    ...(isAuthenticated && isAdmin
      ? [{ name: t('testimonials'), path: '/testimonials' }]
      : []),

    ...(isAuthenticated && isStaff
      ? [
          { name: 'لوحة التحكم', path: '/staff/dashboard' },
          { name: 'جدولي', path: '/staff/schedule' }
        ]
      : []),

    { name: t('contact'), path: '/contact' },
  ]

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <img src={logo} alt="قصر نور الشمس" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-gradient">قصر نور الشمس</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-primary-200 font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-600 hover:text-primary-200 transition-colors duration-200"
              title={language === 'ar' ? 'English' : 'العربية'}
            >
              <Globe className="w-5 h-5" />
            </button>

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 space-x-reverse text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-200" />
                  </div>
                  <span className="hidden md:block text-gray-700 font-medium">
                    {user?.full_name}
                  </span>
                </button>

                <AnimatePresence>
  {isUserMenuOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5"
    >
      {isAdmin ? (
        <>
          <Link
            to="/admin/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsUserMenuOpen(false)}
          >
            الملف الشخصي
          </Link>
          <Link
            to="/admin/users"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsUserMenuOpen(false)}
          >
            إدارة المستخدمين
          </Link>
          <Link
            to="/admin/services"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsUserMenuOpen(false)}
          >
            إدارة الخدمات
          </Link>
          <Link
            to="/admin/announcements"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsUserMenuOpen(false)}
          >
            إدارة الإعلانات
          </Link>
          <Link
            to="/admin/appointments"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsUserMenuOpen(false)}
          >
            إدارة المواعيد
          </Link>
          <Link
            to="/admin"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsUserMenuOpen(false)}
          >
            لوحة التحكم
          </Link>
          <button
            onClick={() => {
              setIsUserMenuOpen(false)
              handleLogout()
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            تسجيل الخروج
          </button>
        </>
      ) : (
        <>
          {(isClient || isStaff) && (
            <Link
              to={`/${user.role}/dashboard`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsUserMenuOpen(false)}
            >
              لوحة التحكم
            </Link>
          )}
          <Link
            to={`/${user.role}/profile`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsUserMenuOpen(false)}
          >
            الملف الشخصي
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            تسجيل الخروج
          </button>
        </>
      )}
    </motion.div>
  )}
</AnimatePresence>

              </div>
            ) : (
              <div className="hidden md:flex space-x-4 space-x-reverse">
                <Link to="/login" className="btn-outline">{t('login')}</Link>
                <Link to="/register" className="btn-primary">{t('register')}</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
                {/* Common links */}
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-200 hover:bg-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Admin-only mobile section */}
                {isAuthenticated && isAdmin && (
                  <>
                    <hr className="my-2 border-gray-200" />
                    <Link to="/admin/profile" className="block px-3 py-2 text-base text-gray-700 hover:bg-white hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>الملف الشخصي</Link>
                    <Link to="/admin/users" className="block px-3 py-2 text-base text-gray-700 hover:bg-white hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>إدارة المستخدمين</Link>
                    <Link to="/admin/services" className="block px-3 py-2 text-base text-gray-700 hover:bg-white hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>إدارة الخدمات</Link>
                    <Link to="/admin/announcements" className="block px-3 py-2 text-base text-gray-700 hover:bg-white hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>إدارة الإعلانات</Link>
                    <Link to="/admin/appointments" className="block px-3 py-2 text-base text-gray-700 hover:bg-white hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>إدارة المواعيد</Link>
                    <Link to="/admin" className="block px-3 py-2 text-base text-gray-700 hover:bg-white hover:text-primary-200" onClick={() => setIsMenuOpen(false)}>لوحة التحكم</Link>
                    <button onClick={() => { setIsMenuOpen(false); handleLogout() }} className="block w-full text-right px-3 py-2 text-base text-red-600 hover:bg-red-50">تسجيل الخروج</button>
                  </>
                )}

                {/* Guest options */}
                {!isAuthenticated && (
                  <div className="pt-4 space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center btn-outline"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('login')}
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center btn-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header
