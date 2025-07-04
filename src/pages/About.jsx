import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

const About = () => {
  const { t } = useLanguage();

  return (
    <div>
        <Header/>
      <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <img 
              src="uploads/cdn1.treatwell.webp" 
              alt="قصر نور الشمس" 
              className="rounded-2xl shadow-2xl w-full"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('about')}</h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              قصر نور الشمس هو مركز متكامل تجميل يختص بالعناية بالمرأة، تأسس عام 2021 على يد خبراء
              في مجال التجميل، نسعى دائماً لتقديم أفضل الخدمات باستخدام أحدث التقنيات والمنتجات العالمية.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[ 'فريق من الخبراء المتخصصين', 'منتجات عالمية ذات جودة عالية', 'أجواء مريحة وراقية', 'أسعار مناسبة وعروض دورية' ].map((feature, index) => (
                <motion.div key={index} className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section> 
    <Footer/>
    </div>
    
  );
};

export default About;