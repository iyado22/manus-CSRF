import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import Messages from '../../components/messaging/Messages';

/**
 * Messages Page - Main page for messaging functionality
 * Displays the Messages component with proper layout and styling
 */
const MessagesPage = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary-200 rounded-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('messages')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('manage_your_conversations')}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Component */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Messages />
        </div>
      </div>
    </motion.div>
  );
};

export default MessagesPage;

