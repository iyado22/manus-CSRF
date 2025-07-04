import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './contexts/AuthContext'
import { useLanguage } from './contexts/LanguageContext'
import Banner from './components/ui/Banner'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ErrorBoundary from './components/ui/ErrorBoundary'
import WhatsAppButton from './components/ui/WhatsAppButton'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// Lazy load pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const Login = React.lazy(() => import('./pages/auth/Login'))
const Register = React.lazy(() => import('./pages/auth/Register'))
const Services = React.lazy(() => import('./pages/Services'))
const About = React.lazy(() => import('./pages/About'))
const Contact = React.lazy(() => import('./pages/Contact'))
const MessagesPage = React.lazy(() => import('./pages/MessagesPage'))
const ClientDashboard = React.lazy(() => import('./pages/client/Dashboard'))
const ClientAppointments = React.lazy(() => import('./pages/client/Appointments'))
const ClientBooking = React.lazy(() => import('./pages/client/Booking'))
const ClientFeedback = React.lazy(() => import('./pages/client/Feedback'))
const ClientProfile = React.lazy(() => import('./pages/client/Profile'))
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers = React.lazy(() => import('./pages/admin/Users'))
const AdminServices = React.lazy(() => import('./pages/admin/Services'))
const AdminAppointments = React.lazy(() => import('./pages/admin/Appointments'))
const AdminProfile = React.lazy(() => import('./pages/admin/Profile'))
const AdminAnnouncements = React.lazy(()=> import('./pages/admin/Announcements'))
const AdminStaff = React.lazy(()=> import('./pages/admin/Staff'))
const AdminFeedback = React.lazy(()=> import('./pages/admin/Feedback'))
const StaffDashboard = React.lazy(() => import('./pages/staff/Dashboard'))
const StaffSchedule = React.lazy(() => import('./pages/staff/Schedule'))
const StaffProfile = React.lazy(() => import('./pages/staff/Profile'))



const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
}

function App() {
  const { language } = useLanguage()

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const renderMotionPage = (Component) => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Component />
    </motion.div>
  )

  return (
    <ErrorBoundary>
      <div className="min-h-screen gradient-bg">
        <Banner />

        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={renderMotionPage(LandingPage)} />
              <Route path="/login" element={renderMotionPage(Login)} />
              <Route path="/register" element={renderMotionPage(Register)} />
              <Route path="/services" element={renderMotionPage(Services)} />
              <Route path="/about" element={renderMotionPage(About)} />
              <Route path="/contact" element={renderMotionPage(Contact)} />

              {/* Messages Route - Available to all authenticated users */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute allowedRoles={['client', 'staff', 'admin']}>
                    {renderMotionPage(MessagesPage)}
                  </ProtectedRoute>
                }
              />

              {/* Updated Client Routes */}
              <Route
                path="/client/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    {renderMotionPage(ClientDashboard)}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/appointments"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    {renderMotionPage(ClientAppointments)}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/booking"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    {renderMotionPage(ClientBooking)}
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/client/profile"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    {renderMotionPage(ClientProfile)}
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/feedback"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    {renderMotionPage(ClientFeedback)}
                  </ProtectedRoute>
                }
              />

              

              {/* Admin Routes */}
            <Route
              path="/admin/dashbaord"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  {renderMotionPage(AdminDashboard)}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  {renderMotionPage(AdminUsers)}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  {renderMotionPage(AdminServices)}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  {renderMotionPage(AdminAppointments)}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  {renderMotionPage(AdminProfile)}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  {renderMotionPage(AdminAnnouncements)}
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  {renderMotionPage(AdminStaff)}
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  {renderMotionPage(AdminFeedback)}
                </ProtectedRoute>
              }
            />

            

                          {/* Staff Routes */}
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  {renderMotionPage(StaffDashboard)}
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/schedule"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  {renderMotionPage(StaffSchedule)}
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/profile"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  {renderMotionPage(StaffProfile)}
                </ProtectedRoute>
              }
            />


              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AnimatePresence>

        <WhatsAppButton />
      </div>
    </ErrorBoundary>
  )
}

export default App
