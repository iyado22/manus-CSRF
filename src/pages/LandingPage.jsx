import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import { Star, ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react'
import CountUp from 'react-countup'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'


import { useLanguage } from '../contexts/LanguageContext'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const LandingPage = () => {
  const { t } = useLanguage()

  const heroSlides = [
    {
      image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'مرحباً بك في قصر نور الشمس',
      subtitle: 'للجمال والعناية المتميزة'
    },
   /* {
      image: 'https://via.placeholder.com/1200x600?text=Coming+Soon',
      title: 'خدمات العناية بالبشرة',
      subtitle: 'بأحدث التقنيات العالمية'
    }*/,
    {
      image: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'العناية بالشعر',
      subtitle: 'بأيدي خبراء متخصصين'
    }
  ]

  const [services, setServices] = useState([])

useEffect(() => {
  axios.get('http://localhost/senior-nooralshams/api/services/viewServices.php')
    .then(response => {
      setServices(response.data.services || [])
    })
    .catch(error => {
      console.error('Error fetching services:', error)
    })
}, [])


  const testimonials = [
    {
      id: 1,
      name: 'سارة أحمد',
      role: 'عميلة دائمة',
      text: 'تجربتي مع قصر نور الشمس كانت رائعة، الخدمة ممتازة والنتائج مبهرة.',
      rating: 5,
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 2,
      name: 'نورا محمد',
      role: 'عميلة جديدة',
      text: 'الاهتمام بالتفاصيل والخدمة الشخصية جعلتني أشعر بالتميز.',
      rating: 5,
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 3,
      name: 'ليلى خالد',
      role: 'عروس سعيدة',
      text: 'مكياج حفل زفافي كان أكثر من رائع، الجميع أشاد به.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ]

  const stats = [
    { number: 1000, label: 'عميلة سعيدة', suffix: '+' },
    { number: 15, label: 'خبيرة تجميل', suffix: '' },
    { number: 50, label: 'خدمة متميزة', suffix: '+' },
    { number: 5, label: 'سنوات خبرة', suffix: '+' }
  ]

  return (
    <div className="min-h-screen">
     <Header/>
      
      {/* Hero Section with Slider */}
      <section className="relative h-screen overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
          }}
          loop={true}
          className="h-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white max-w-4xl px-4">
                    <motion.h1
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl md:text-6xl font-bold mb-4"
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl md:text-2xl mb-8"
                    >
                      {slide.subtitle}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="space-x-4 space-x-reverse"
                    >
                      <Link to="/register" className="btn-primary text-lg px-8 py-4">
                        {t('bookNow')}
                      </Link>
                      <a href="#services" className="btn-outline text-lg px-8 py-4 bg-white bg-opacity-20 backdrop-blur-sm">
                        {t('exploreServices')}
                      </a>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Custom pagination styles */}
        <style jsx>{`
          .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.5);
            opacity: 1;
          }
          .swiper-pagination-bullet-active {
            background: #ff85a2;
          }
        `}</style>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary-200 mb-2">
                  <CountUp end={stat.number} duration={2.5} />
                  {stat.suffix}
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
{/* Services Section */}
<section id="services" className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('services')}</h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        نقدم مجموعة متنوعة من خدمات الجمال والعناية لتلبية احتياجاتك
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {services.slice(0, 3).map((service, index) => (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="card overflow-hidden group hover:scale-105"
    >
      <div className="relative overflow-hidden">
        <img 
          src={service.image_path ? `http://localhost/seniorII/${service.image_path}` : 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={service.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-primary-200 text-white px-3 py-1 rounded-full text-sm font-medium">
          {service.price} ₪
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
        <p className="text-gray-600 mb-4">{service.description}</p>
        <Link 
          to="/register" 
          className="inline-flex items-center text-primary-200 hover:text-primary-300 font-medium group"
        >
          احجزي الآن
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  ))}
</div>
<div className="text-center mt-10">
  <Link
    to="/services"
    className="inline-block bg-primary-200 text-white px-6 py-3 rounded-full shadow hover:bg-primary-300 transition"
  >
    مشاهدة كل الخدمات
  </Link>
</div>
  </div>
</section>


      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img 
               src="uploads/cdn1.treatwell.webp" 
                alt="قصر نور الشمس" 
                className="rounded-2xl shadow-2xl w-full"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('about')}</h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                قصر نور الشمس هو مركز متكامل للجمال والعناية بالمرأة، تأسس عام 2010 على يد خبراء 
                في مجال التجميل نسعى دائماً لتقديم أفضل الخدمات باستخدام أحدث التقنيات والمنتجات العالمية.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  'فريق من الخبراء المتخصصين',
                  'منتجات عالمية ذات جودة عالية',
                  'أجواء مريحة وراقية',
                  'أسعار مناسبة وعروض دورية'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3 space-x-reverse"
                  >
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('testimonials')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نفتخر بثقة عملائنا وسعادتهم بخدماتنا
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card p-6 relative"
              >
                <div className="absolute top-4 right-4 text-6xl text-primary-100 opacity-50">"</div>
                
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic relative z-10">
                  {testimonial.text}
                </p>
                
                <div className="flex items-center space-x-3 space-x-reverse">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('contact')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نحن هنا للإجابة على استفساراتك وحجز موعدك
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">العنوان</h3>
                  <p className="text-gray-600">جنين - شارع حيفا - عمارة الفيصل</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">الهاتف</h3>
                  <p className="text-gray-600">+966 12 345 6789</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">البريد الإلكتروني</h3>
                  <p className="text-gray-600">info@nooralshamssalon.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">ساعات العمل</h3>
                  <p className="text-gray-600">السبت - الخميس: 10:00 ص - 10:00 م</p>
                  <p className="text-gray-600">الجمعة: 2:00 م - 10:00 م</p>
                </div>
              </div>

              {/* Google Map */}
              <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3387.123456789!2d35.123456!3d32.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDA3JzI0LjQiTiAzNcKwMDcnMjQuNCJF!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="card p-8"
            >
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <input type="text" className="input-field" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input type="email" className="input-field" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input type="tel" className="input-field" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرسالة
                  </label>
                  <textarea rows={4} className="input-field resize-none"></textarea>
                </div>
                
                <button type="submit" className="btn-primary w-full">
                  إرسال الرسالة
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

   <Footer/>
    </div>
  )
}

export default LandingPage