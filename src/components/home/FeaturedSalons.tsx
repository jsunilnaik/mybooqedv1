import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { salonService } from '../../lib/dataService';
import { SalonCard } from '../salon/SalonCard';
import type { Service } from '../../types';
import servicesRaw from '../../data/services.json';

const allServices: Service[] = servicesRaw as unknown as Service[];

import { useLocationStore } from '../../store/useLocationStore';

const FeaturedSalons: React.FC = () => {
  const navigate = useNavigate();
  const { coordinates, city } = useLocationStore();
  
  let result = salonService.getAll({ 
    lat: coordinates?.lat, 
    lng: coordinates?.lng,
    city: city || undefined,
    limit: 8
  });
  
  let featured = Array.isArray(result) ? result : result.data;

  // Fallback: If filtering by city returns no featured salons, show featured salons from all cities
  if (featured.length === 0 && city && city !== 'All Cities') {
    const fallbackResult = salonService.getAll({ 
      lat: coordinates?.lat, 
      lng: coordinates?.lng,
      limit: 8
    });
    featured = Array.isArray(fallbackResult) ? fallbackResult : fallbackResult.data;
  }

  const isNearby = !!coordinates;

  const getServicesForSalon = (salonId: string): Service[] =>
    allServices.filter((s) => s.salonId === salonId && s.isActive).slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="py-8 sm:py-14 bg-white overflow-x-hidden overflow-y-visible">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#71717A] uppercase tracking-widest mb-1">
              {isNearby ? 'Precision proximity' : 'Hand-picked for you'}
            </p>
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-black text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              {isNearby ? 'Salons Near You' : 'Featured Salons'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/salons?featured=true')}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-black group whitespace-nowrap"
          >
            See all
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Desktop: 4-col grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featured.map((salon, i) => (
            <SalonCard
              key={salon.id}
              salon={salon}
              services={getServicesForSalon(salon.id)}
              index={i}
            />
          ))}
        </div>

        {/* Mobile: horizontal scroll with snap */}
        <div
          className="flex sm:hidden gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 -mx-1 px-1"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {featured.map((salon, i) => (
            <motion.div
              key={salon.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex-shrink-0"
              style={{ width: 'min(260px, 72vw)', scrollSnapAlign: 'start' }}
            >
              <SalonCard
                salon={salon}
                services={getServicesForSalon(salon.id)}
                index={i}
              />
            </motion.div>
          ))}
        </div>

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center sm:hidden"
        >
          <button
            onClick={() => navigate('/salons')}
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#E5E7EB] rounded-full text-sm font-semibold text-black hover:bg-[#F7F9FA] transition-colors"
          >
            View all salons
            <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedSalons;
