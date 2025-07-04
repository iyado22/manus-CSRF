import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X, User, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Messages Component - Handles messaging functionality between users
 * Features:
 * - View conversation list
 * - Send and receive messages
 * - Real-time message updates
 * - Responsive design for mobile and desktop
 */
const Messages = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/Messaging/getConversationsList.php', {
        withCredentials: true
      });
      
      if (response.data.status === 'success') {
        setConversations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error(t('error_loading_conversations'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`/api/Messaging/getConversation.php?conversation_id=${conversationId}`, {
        withCredentials: true
      });
      
      if (response.data.status === 'success') {
        setMessages(response.data.data || []);
        // Mark messages as read
        markMessagesAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error(t('error_loading_messages'));
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId) => {
    try {
      await axios.post('/api/Messaging/markMessageAsRead.php', {
        conversation_id: conversationId
      }, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await axios.post('/api/Messaging/sendMessage.php', {
        receiver_id: selectedConversation.other_user_id,
        message: newMessage.trim()
      }, {
        withCredentials: true
      });

      if (response.data.status === 'success') {
        setNewMessage('');
        // Add message to current conversation
        setMessages(prev => [...prev, {
          id: Date.now(), // Temporary ID
          sender_id: user.id,
          receiver_id: selectedConversation.other_user_id,
          message: newMessage.trim(),
          created_at: new Date().toISOString(),
          sender_name: user.full_name
        }]);
        toast.success(t('message_sent'));
      } else {
        toast.error(response.data.message || t('error_sending_message'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('error_sending_message'));
    } finally {
      setSendingMessage(false);
    }
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
    }
  };

  // Load conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Select conversation
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-200"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            {t('messages')}
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>{t('no_conversations')}</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ backgroundColor: '#f9fafb' }}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-primary-50' : ''
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.other_user_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.last_message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-xs text-gray-400">
                      {formatMessageTime(conversation.last_message_time)}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-200" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {selectedConversation.other_user_name}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${
                      message.sender_id === user.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user.id
                          ? 'bg-primary-200 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          message.sender_id === user.id ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {message.sender_name}
                        </p>
                        <p className={`text-xs ${
                          message.sender_id === user.id ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('type_message')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-4 py-2 bg-primary-200 text-white rounded-lg hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">{t('select_conversation')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

