import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Star, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { buildSalonUrl, buildBookingUrl } from '../../utils/seo';
import { salonService } from '../../lib/dataService';
import type { Service } from '../../types';
import { formatPrice, formatDuration } from '../../lib/utils';
import servicesRaw from '../../data/services.json';

const allServices: Service[] = servicesRaw as unknown as Service[];

export const TopRatedSection: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const topRated = salonService.getTopRated(8);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  const getServicesForSalon = (salonId: string): Service[] =>
    allServices.filter((s) => s.salonId === salonId && s.isActive).slice(0, 2);

  if (topRated.length === 0) return null;

  return (
    <section className="py-8 sm:py-14 bg-[#F7F9FA] overflow-x-hidden overflow-y-visible">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <Star size={12} className="fill-[#FFB800] text-[#FFB800] sm:w-[13px] sm:h-[13px]" />
              <p className="text-[10px] sm:text-xs font-semibold text-[#71717A] uppercase tracking-widest">
                Highest rated
              </p>
            </div>
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-black text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              Top Rated Salons
            </h2>
          </div>

          {/* Scroll controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white hover:border-black hover:shadow-sm transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} className="text-black" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white hover:border-black hover:shadow-sm transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} className="text-black" />
            </button>
            <button
              onClick={() => navigate('/salons?sort=rating')}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-black group whitespace-nowrap ml-2"
            >
              View all
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll carousel */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 -mx-1 px-1"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {topRated.map((salon, i) => {
            const salonServices = getServicesForSalon(salon.id);

            return (
              <motion.div
                key={salon.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                onClick={() => navigate(buildSalonUrl(salon as any))}
                className="group flex-shrink-0 bg-white rounded-2xl border border-[#F3F4F6] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                style={{ width: 'min(280px, 75vw)', scrollSnapAlign: 'start' }}
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={salon.images?.cover || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=338&fit=crop'}
                    alt={salon.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=338&fit=crop';
                    }}
                  />
                  {/* Rating badge on image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-sm">
                    <Star size={11} className="fill-[#FFB800] text-[#FFB800]" />
                    <span className="text-xs font-black text-black">{salon.rating}</span>
                    <span className="text-[10px] text-[#71717A]">({salon.totalReviews})</span>
                  </div>
                  {/* Type badge */}
                  <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full capitalize backdrop-blur-sm">
                    {salon.type}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  {/* Name */}
                  <h3 className="font-bold text-black text-[15px] leading-snug mb-1 group-hover:underline line-clamp-1">
                    {salon.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-[#71717A] mb-3">
                    <MapPin size={11} className="flex-shrink-0" />
                    <span className="text-xs">{salon.address?.area}, {salon.address?.city}</span>
                  </div>

                  {/* Services */}
                  {salonServices.length > 0 && (
                    <div className="space-y-0">
                      {salonServices.map((svc, idx) => (
                        <div key={svc.id}>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex-1 min-w-0 pr-3">
                              <p className="text-sm text-black font-medium leading-snug truncate">
                                {svc.name}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock size={10} className="text-[#9CA3AF]" />
                                <span className="text-xs text-[#71717A]">
                                  {formatDuration(svc.duration)}
                                </span>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-black flex-shrink-0">
                              {formatPrice(svc.discountPrice || svc.price)}
                            </span>
                          </div>
                          {idx < salonServices.length - 1 && (
                            <div className="border-t border-[#F4F4F5]" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Book CTA */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(buildBookingUrl(salon as any));
                    }}
                    className="mt-4 w-full py-2.5 border-2 border-gray-200 rounded-full text-sm font-bold text-black hover:border-black hover:bg-black hover:text-white transition-all duration-200"
                  >
                    Book now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-7 text-center sm:hidden">
          <button
            onClick={() => navigate('/salons?sort=rating')}
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#E5E7EB] rounded-full text-sm font-semibold text-black bg-white hover:bg-gray-50 transition-colors"
          >
            See all top rated
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
};
