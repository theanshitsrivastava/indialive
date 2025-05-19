import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const ImageSlider = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('slider_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching slides:', error);
      } else {
        setSlides(data);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 10000); // Change slide every 10 seconds

    return () => clearInterval(interval);
  }, [slides]);

  if (slides.length === 0) return null;

  return (
    <div className="slider">
      <img src={slides[current].image_url} alt={slides[current].title} />
      <h2>{slides[current].title}</h2>
    </div>
  );
};

export default ImageSlider;
