import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildLocationUrl } from '../../utils/seo';

const CITIES = [
  { name: 'Ballari', count: 10, image: '/assets/cities/ballari.png?w=600&q=80' },
  { name: 'Mumbai', count: 24, image: '/assets/cities/mumbai.png?w=600&q=80' },
  { name: 'Jaipur', count: 16, image: '/assets/cities/jaipur.png?w=600&q=80' },
  { name: 'Delhi', count: 38, image: '/assets/cities/delhi.png?w=600&q=80' },
  { name: 'Bengaluru', count: 26, image: '/assets/cities/bengaluru.png?w=600&q=80' },
  { name: 'Hyderabad', count: 12, image: '/assets/cities/hyderabad.png?w=600&q=80' },
  { name: 'Surat', count: 14, image: '/assets/cities/surat.png?w=600&q=80' },
  { name: 'Chennai', count: 14, image: '/assets/cities/chennai.png?w=600&q=80' },
  { name: 'Pune', count: 16, image: '/assets/cities/pune.png?w=600&q=80' },
  { name: 'Ahmedabad', count: 12, image: '/assets/cities/ahmedabad.png?w=600&q=80' },
  { name: 'Kolkata', count: 18, image: '/assets/cities/kolkata.png?w=600&q=80' },
  { name: 'Lucknow', count: 21, image: '/assets/cities/lucknow.png?w=600&q=80?w=600&q=80' }
];

export const TopCities: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16 bg-white overflow-hidden">
      <div className="container-app">
        {/* Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-2 sm:mb-3"
          >
            <span className="text-xs sm:text-sm font-bold tracking-wider text-[#7C3AED] uppercase">EXPLORE BY LOCATION</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight mb-3 sm:mb-4"
          >
            Find Salons in Your City
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[#71717A]"
          >
            We're present across top Indian cities
          </motion.p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {CITIES.map((city, index) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(buildLocationUrl(city.name))}
              className={`group relative overflow-hidden rounded-[1.25rem] cursor-pointer aspect-square sm:aspect-[4/5]
                // Make the first 6 items span 1 col up to laptops, but we want a natural flex-like flow?
                // The grid is auto-placed. For 8 items in 6 columns, row 1 has 6, row 2 has 2.
                // In the screenshot, row 1 has 6, row 2 has 2 starting from the left.
              `}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${city.image})` }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

              {/* Text Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="flex flex-col gap-1 w-full text-left relative z-10">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">{city.name}</h3>
                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <MapPin size={12} className="text-white flex-shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-medium text-white truncate">{city.count} salons</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
