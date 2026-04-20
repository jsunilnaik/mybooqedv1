import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Heart, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatPrice, formatDuration } from '../../lib/utils';
import { buildSalonUrl } from '../../utils/seo';
import { useWishlistStore } from '../../store/useWishlistStore';
import { salonService } from '../../lib/dataService';
import type { Salon, Service } from '../../types';

interface SalonCardProps {
  salon: Salon;
  services?: Service[];
  index?: number;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
  className?: string;
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop&auto=format';

export const SalonCard: React.FC<SalonCardProps> = ({
  salon,
  services = [],
  index = 0,
  isHovered = false,
  onHover,
  className,
}) => {
  const navigate = useNavigate();
  const { isSaved, toggleSalon } = useWishlistStore();
  const liked = isSaved(salon.id);
  const [imgIndex, setImgIndex] = useState(0);

  const images = [
    salon.images?.cover,
    ...(salon.images?.gallery || []),
  ].filter(Boolean) as string[];

  const displayImages = images.length > 0 ? images : [FALLBACK_IMG];
  const previewServices = services.slice(0, 3);
  const totalServices = services.length;

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i === 0 ? displayImages.length - 1 : i - 1));
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i === displayImages.length - 1 ? 0 : i + 1));
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSalon(salon.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => navigate(buildSalonUrl(salon as any))}
      className={cn(
        'group cursor-pointer bg-white transition-all duration-300',
        'rounded-2xl border-2 border-transparent',
        isHovered ? 'shadow-[0_20px_40px_rgba(0,0,0,0.12)] translate-y-[-4px] z-10' : 'shadow-sm',
        className
      )}
      onMouseEnter={() => onHover?.(salon.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* ── IMAGE ───────────────────────────────────── */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#F4F4F5] mb-3">
        <img
          src={displayImages[imgIndex]}
          alt={salon.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
        />

        {/* Subtle bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

        {/* Badges — top left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
          {(salon as any).hasImmediateSlots && (
            <div className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-lg flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              LIVE
            </div>
          )}
          {(salon as any).hasAIDiscounts && (
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-sm shadow-xl flex flex-col gap-0.5 border border-purple-400/30">
              <div className="flex items-center gap-1">
                <Sparkles size={10} className="fill-white" />
                <span>AI PRICING ENABLED</span>
              </div>
              {salonService.getAIDiscounts(salon.id).find(s => s.valueAdd)?.valueAdd && (
                <div className="text-[8px] opacity-90 font-bold uppercase tracking-tighter text-purple-100 flex items-center gap-1">
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                  + {salonService.getAIDiscounts(salon.id).find(s => s.valueAdd)?.valueAdd}
                </div>
              )}
            </div>
          )}
          {!(salon as any).hasImmediateSlots && !(salon as any).hasAIDiscounts && salon.featured && (
            <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-sm tracking-wide shadow-sm">
              Deals
            </span>
          )}
        </div>

        {/* Heart — top right */}
        <button
          onClick={handleLike}
          className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform"
          aria-label="Save to favourites"
        >
          <Heart
            size={14}
            className={cn('transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-[#71717A]')}
          />
        </button>

        {/* Carousel arrows — visible on hover */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={14} className="text-black" />
            </button>
            <button
              onClick={handleNextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={14} className="text-black" />
            </button>
          </>
        )}

        {/* Dots — bottom center */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
            {displayImages.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all',
                  i === imgIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── CARD BODY ────────────────────────────────── */}
      <div className="px-4 pb-4">
        {/* Name + Rating */}
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h3 className="font-bold text-black text-[15px] leading-snug line-clamp-1 group-hover:underline flex-1">
            {salon.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={13} className="text-[#FFB800] fill-[#FFB800]" />
            <span className="text-sm font-bold text-black">{salon.rating.toFixed(1)}</span>
            <span className="text-xs text-[#71717A]">({salon.totalReviews})</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between gap-1 mb-3">
          <div className="flex items-center gap-1 text-[#71717A] min-w-0">
            <MapPin size={11} className="flex-shrink-0" />
            <span className="text-xs truncate">{salon.address?.area}, {salon.address?.city}</span>
          </div>
          {(salon as any).distance !== undefined && (
            <span className="flex-shrink-0 bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2">
              {(salon as any).distance} km
            </span>
          )}
        </div>

        {/* Services mini-menu */}
        {previewServices.length > 0 && (
          <div className="mb-2.5">
            {previewServices.map((svc, i) => (
              <div key={svc.id}>
                <div className="flex items-start justify-between py-2">
                  {/* Name + duration */}
                  <div className="flex-1 pr-3 min-w-0">
                    <div className="text-sm text-black leading-snug truncate">{svc.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="text-[#9CA3AF]" />
                      <span className="text-xs text-[#71717A]">{formatDuration(svc.duration)}</span>
                    </div>
                  </div>
                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    {svc.discountPrice && svc.discountPrice < svc.price ? (
                      <div>
                        <span className="text-sm font-bold text-black">{formatPrice(svc.discountPrice)}</span>
                        <span className="text-xs text-[#9CA3AF] line-through ml-1">{formatPrice(svc.price)}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-black">{formatPrice(svc.price)}</span>
                    )}
                  </div>
                </div>
                {/* Ultra-subtle divider between services */}
                {i < previewServices.length - 1 && (
                  <div className="border-t border-[#F4F4F5]" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* "See all X services" — bright blue link */}
        {totalServices > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(buildSalonUrl(salon as any)); }}
            className="text-[#0066FF] text-sm font-medium hover:underline text-left leading-none"
          >
            See all {totalServices} service{totalServices !== 1 ? 's' : ''}
          </button>
        )}

        {/* Fallback: if no services, show starting price */}
        {totalServices === 0 && salon.startingPrice && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-[#71717A]">
              from <span className="font-semibold text-black">{formatPrice(salon.startingPrice)}</span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
