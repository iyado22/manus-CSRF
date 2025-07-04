import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarCheck, Settings, Users, X
} from 'lucide-react'

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const links = [
    { name: 'لوحة التحكم', path: '/admin/dashboard', icon: <LayoutDashboard /> },
    { name: 'الحجوزات', path: '/admin/appointments', icon: <CalendarCheck /> },
    { name: 'الخدمات', path: '/admin/services', icon: <Settings /> },
    { name: 'المستخدمون', path: '/admin/users', icon: <Users /> }
  ]

  return (
    <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold text-primary-200">لوحة المشرف</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X />
        </button>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors ${
              location.pathname === link.path
                ? 'bg-primary-100 text-primary-200'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={onClose}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default AdminSidebar


