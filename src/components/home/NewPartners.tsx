import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { salonService } from '../../lib/dataService';
import { useLocationStore } from '../../store/useLocationStore';
import { buildSalonUrl } from '../../utils/seo';
import type { Salon } from '../../types';

const NewPartnerCard: React.FC<{ salon: Salon }> = ({ salon }) => {
  const navigate = useNavigate();
  const displayImage = salon.images?.cover || (salon.gallery?.[0]?.imageUrl) || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop&auto=format';
  
  return (
    <div 
      onClick={() => navigate(buildSalonUrl(salon as any))}
      className="group cursor-pointer bg-white rounded-2xl p-3 sm:p-4 border border-[#F3F4F6] shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 w-full h-full"
    >
      {/* Squircle Image */}
      <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden flex-shrink-0 bg-[#F4F4F5] border border-[#F3F4F6]">
        <img 
          src={displayImage} 
          alt={salon.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-bold text-black text-[15px] leading-tight truncate mb-1.5 group-hover:underline">
          {salon.name}
        </h3>
        
        <div className="flex items-center gap-1.5 mb-1.5 text-[13px] text-[#71717A]">
           <div className="flex items-center gap-0.5">
             <Star size={12} className="text-[#FFB800] fill-[#FFB800]" />
             <span className="font-bold text-black">{salon.rating.toFixed(1)}</span>
           </div>
           <span className="text-[#D1D5DB]">·</span>
           <span className="truncate">{salon.address.area}</span>
        </div>
        
        {salon.startingPrice && (
           <div className="text-[12px] text-[#71717A] font-medium">
             From <span className="font-bold text-black">₹{salon.startingPrice}</span>
           </div>
        )}
      </div>
    </div>
  );
};

export const NewPartners: React.FC = () => {
  const navigate = useNavigate();
  const { coordinates, city } = useLocationStore();
  
  let result = salonService.getAll({ 
    lat: coordinates?.lat, 
    lng: coordinates?.lng,
    city: city || undefined,
    limit: 20
  });
  
  let salonsList = Array.isArray(result) ? result : result.data;

  // Fallback: If filtering by city returns none, fallback to all
  if (salonsList.length === 0 && city && city !== 'All Cities') {
    const fallbackResult = salonService.getAll({ 
      lat: coordinates?.lat, 
      lng: coordinates?.lng,
      limit: 20
    });
    salonsList = Array.isArray(fallbackResult) ? fallbackResult : fallbackResult.data;
  }

  // To make "New Partners" different from "Featured"
  let newPartners = salonsList.filter(s => !s.featured).slice(0, 8);
  if (newPartners.length < 4) {
    newPartners = salonsList.slice(-8).reverse();
  }

  if (newPartners.length === 0) return null;

  return (
    <section className="py-8 sm:py-14 bg-[#F7F9FA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#71717A] uppercase tracking-widest mb-1">
              Fresh on MyBOOQED
            </p>
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-black text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              New Partners
            </h2>
          </div>
          <button
            onClick={() => navigate('/salons')}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-black group whitespace-nowrap"
          >
            See all
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Auto-scrolling Row */}
        <div className="overflow-hidden w-full relative mt-6 sm:mt-8 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8">
          {/* Gradient Edges */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-[#F7F9FA] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-[#F7F9FA] to-transparent z-10 pointer-events-none" />
          
          <motion.div
            className="flex gap-4 sm:gap-5 w-max py-2 pl-4 sm:pl-0" 
            animate={{ x: ["0%", "-33.333333%"] }}
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity,
            }}
          >
            {/* Tripling the list to ensure infinite scroll on wide screens */}
            {[...newPartners, ...newPartners, ...newPartners].map((salon, i) => (
              <div
                key={`${salon.id}-${i}`}
                className="w-[280px] sm:w-[300px] lg:w-[320px] flex-shrink-0"
              >
                <NewPartnerCard salon={salon as Salon} />
              </div>
            ))}
          </motion.div>
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
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#E5E7EB] rounded-full bg-white text-sm font-semibold text-black hover:bg-gray-50 transition-colors"
          >
            View all partners
            <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
