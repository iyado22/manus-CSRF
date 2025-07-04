import React, { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const AuthContext = createContext()

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')

    if (token && userData) {
      dispatch({ type: 'AUTH_SUCCESS', payload: JSON.parse(userData) })
    } else {
      dispatch({ type: 'AUTH_FAILURE', payload: null })
    }
  }, [])

  const login = async ({ email, password }) => {
    try {
      dispatch({ type: 'AUTH_START' })

      const response = await axios.post(
        'http://localhost/senior-nooralshams/api/auth/login.php',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )

      const res = response.data

      if (res.status === 'success') {
        const userData = {
          id: res.user.id,
          full_name: res.user.full_name,
          role: res.user.role,
          email: res.user.email,
          csrf_token: res.csrf_token,
        }

        localStorage.setItem('auth_token', res.csrf_token)
        localStorage.setItem('user_data', JSON.stringify(userData))

        dispatch({ type: 'AUTH_SUCCESS', payload: userData })
        toast.success('تم تسجيل الدخول بنجاح!')
        return { success: true, user: userData } // ✅ RETURN FULL USER OBJECT
      } else {
        const errorMsg = res.message || 'فشل تسجيل الدخول'
        dispatch({ type: 'AUTH_FAILURE', payload: errorMsg })
        toast.error(errorMsg)
        return { success: false, error: errorMsg }
      }

    } catch (error) {
      console.error('Login Error:', error)
      const fallbackMessage = 'حدث خطأ في الاتصال بالخادم'
      dispatch({ type: 'AUTH_FAILURE', payload: fallbackMessage })
      toast.error(fallbackMessage)
      return { success: false, error: fallbackMessage }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await axios.post(
        'http://localhost/senior-nooralshams/api/auth/register.php',
        userData
      )

      if (response.data.success) {
        toast.success('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني')
        dispatch({ type: 'AUTH_FAILURE', payload: null })
        return { success: true }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.data.message })
        toast.error(response.data.message || 'فشل التسجيل')
        return { success: false }
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'خطأ في الاتصال بالخادم' })
      toast.error('حدث خطأ في إنشاء الحساب')
      return { success: false }
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    dispatch({ type: 'LOGOUT' })
    toast.info('تم تسجيل الخروج بنجاح')
  }

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' })

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
