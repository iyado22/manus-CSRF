import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Banner = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost/senior-nooralshams/api/Announcements/getActiveAnnouncements.php')
      .then(response => {
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          const latest = response.data.data[0]; // get the first (latest) one
          if (latest?.message) {
            setMessage(latest.message);
          }
        }
      })
      .catch(error => {
        console.error('Failed to load banner announcement:', error);
      });
  }, []);

  if (!message) return null;

  return (
    <div className="sticky top-0 w-full z-50 bg-pink-600 text-white text-center text-lg py-4 px-6 font-bold shadow-md">
        {message}
    </div>


  );
};

export default Banner;
