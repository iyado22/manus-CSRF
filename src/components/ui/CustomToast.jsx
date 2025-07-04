import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * CustomToast Component - Enhanced toast notifications with smooth animations
 * Features:
 * - Different types: success, error, warning, info
 * - Smooth slide-in animations
 * - RTL/LTR support
 * - Auto-dismiss functionality
 * - Manual close option
 */
const CustomToast = ({ 
  type = 'info', 
  title, 
  message, 
  isVisible, 
  onClose, 
  duration = 5000,
  position = 'top-right' 
}) => {
  const { language } = useLanguage();

  // Auto-dismiss functionality
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  // Get background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  // Get text color based on type
  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  // Animation variants for different positions
  const getAnimationVariants = () => {
    const isRTL = language === 'ar';
    
    switch (position) {
      case 'top-right':
        return {
          initial: { 
            opacity: 0, 
            x: isRTL ? -300 : 300, 
            y: -50,
            scale: 0.8 
          },
          animate: { 
            opacity: 1, 
            x: 0, 
            y: 0,
            scale: 1 
          },
          exit: { 
            opacity: 0, 
            x: isRTL ? -300 : 300, 
            y: -50,
            scale: 0.8 
          }
        };
      case 'top-left':
        return {
          initial: { 
            opacity: 0, 
            x: isRTL ? 300 : -300, 
            y: -50,
            scale: 0.8 
          },
          animate: { 
            opacity: 1, 
            x: 0, 
            y: 0,
            scale: 1 
          },
          exit: { 
            opacity: 0, 
            x: isRTL ? 300 : -300, 
            y: -50,
            scale: 0.8 
          }
        };
      case 'bottom-right':
        return {
          initial: { 
            opacity: 0, 
            x: isRTL ? -300 : 300, 
            y: 50,
            scale: 0.8 
          },
          animate: { 
            opacity: 1, 
            x: 0, 
            y: 0,
            scale: 1 
          },
          exit: { 
            opacity: 0, 
            x: isRTL ? -300 : 300, 
            y: 50,
            scale: 0.8 
          }
        };
      case 'bottom-left':
        return {
          initial: { 
            opacity: 0, 
            x: isRTL ? 300 : -300, 
            y: 50,
            scale: 0.8 
          },
          animate: { 
            opacity: 1, 
            x: 0, 
            y: 0,
            scale: 1 
          },
          exit: { 
            opacity: 0, 
            x: isRTL ? 300 : -300, 
            y: 50,
            scale: 0.8 
          }
        };
      default:
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 }
        };
    }
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.4
          }}
          className={`fixed ${getPositionClasses()} z-50 max-w-sm w-full pointer-events-auto`}
        >
          <div className={`${getBgColor()} ${getTextColor()} p-4 rounded-lg shadow-lg border backdrop-blur-sm bg-opacity-95`}>
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="text-sm font-semibold mb-1">
                    {title}
                  </h4>
                )}
                <p className="text-sm opacity-90">
                  {message}
                </p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Progress Bar */}
            {duration > 0 && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * ToastContainer Component - Manages multiple toast notifications
 */
export const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast) => (
        <CustomToast
          key={toast.id}
          {...toast}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
};

/**
 * useToast Hook - Provides toast functionality
 */
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      isVisible: true,
      duration: 5000,
      position: 'top-right',
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = React.useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      ...options
    });
  }, [addToast]);

  const error = React.useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      ...options
    });
  }, [addToast]);

  const warning = React.useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      ...options
    });
  }, [addToast]);

  const info = React.useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      ...options
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

export default CustomToast;

