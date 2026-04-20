import React from 'react';
import { MapPin, Phone, Star, Wifi, Car, CreditCard, Wind, Clock, Share2, Navigation, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useWishlistStore } from '../../store/useWishlistStore';
import { salonService } from '../../lib/dataService';
import { Sparkles } from 'lucide-react';
import type { SalonDetail } from '../../types/salon';

interface SalonHeaderProps {
  salon: SalonDetail;
  onBookClick?: () => void;
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  unisex: { label: 'Unisex', bg: 'bg-purple-50', text: 'text-purple-700' },
  men:    { label: "Men's",  bg: 'bg-blue-50',   text: 'text-blue-700'   },
  women:  { label: "Women's",bg: 'bg-pink-50',   text: 'text-pink-700'   },
};

const AMENITY_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  'AC':           { icon: <Wind size={13} />,        label: 'AC' },
  'WiFi':         { icon: <Wifi size={13} />,        label: 'WiFi' },
  'Parking':      { icon: <Car size={13} />,         label: 'Parking' },
  'Card Payment': { icon: <CreditCard size={13} />,  label: 'Card Payment' },
};

function getOpenStatus(openingHours: SalonDetail['openingHours']): { open: boolean; text: string } {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const today = days[new Date().getDay()];
  const h = openingHours[today];
  if (!h || h.isClosed) return { open: false, text: 'Closed today' };
  const [closeH, closeM] = h.close.split(':').map(Number);
  const closePM = closeH >= 12 ? 'PM' : 'AM';
  const closeHr = closeH > 12 ? closeH - 12 : closeH;
  return { open: true, text: `Open · Closes ${closeHr}:${String(closeM).padStart(2,'0')} ${closePM}` };
}

export const SalonHeader: React.FC<SalonHeaderProps> = ({ salon }) => {
  const typeInfo = TYPE_CONFIG[salon.type] || TYPE_CONFIG.unisex;
  const { open, text: openText } = getOpenStatus(salon.openingHours);
  
  const { isSaved: checkIsSaved, toggleSalon } = useWishlistStore();
  const isSaved = checkIsSaved(salon.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: salon.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleSave = () => toggleSalon(salon.id);

  return (
    <div className="pb-2 sm:pb-6 mb-0">
      {/* ── Name + Rating row ──────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-black leading-tight tracking-tight mb-2"
            style={{ letterSpacing: '-0.03em' }}>
            {salon.name}
          </h1>

          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-xs font-semibold px-3 py-1 rounded-full', typeInfo.bg, typeInfo.text)}>
              {typeInfo.label}
            </span>
            {salon.featured && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700">
                ✦ Featured
              </span>
            )}
            
            {(salon as any).hasAIDiscounts && (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-purple-400/30">
                <Sparkles size={12} className="fill-white" />
                <span>AI PRICING ENABLED</span>
                {salonService.getAIDiscounts(salon.id).find(s => s.valueAdd)?.valueAdd && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase tracking-tight">
                    + {salonService.getAIDiscounts(salon.id).find(s => s.valueAdd)?.valueAdd}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rating block */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <Star size={18} className="text-[#FFB800] fill-[#FFB800]" />
            <span className="text-2xl font-black text-black leading-none">{salon.rating.toFixed(1)}</span>
          </div>
          <div className="text-xs text-[#71717A] font-medium">
            {salon.totalReviews} reviews
          </div>
        </div>
      </div>

      {/* ── Address + Open status ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-5">
        <div className="flex items-center gap-1.5 text-sm text-[#71717A]">
          <MapPin size={14} className="flex-shrink-0" />
          <span>{salon.address.line1}, {salon.address.area}, {salon.address.city}</span>
        </div>

        <div className="hidden sm:block w-px h-4 bg-[#E5E7EB]" />

        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            open ? 'bg-emerald-500' : 'bg-red-400'
          )} />
          <span className={cn(
            'text-sm font-medium',
            open ? 'text-emerald-700' : 'text-red-500'
          )}>
            {openText}
          </span>
        </div>
      </div>

      {/* ── Quick action buttons ────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap mb-3 sm:mb-5">
        <a
          href={`tel:${salon.phone}`}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-full text-sm font-medium text-black hover:bg-[#F7F9FA] hover:border-[#D1D5DB] transition-all duration-150"
        >
          <Phone size={14} />
          Call
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.name + ' ' + salon.address.area + ' ' + salon.address.city)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-full text-sm font-medium text-black hover:bg-[#F7F9FA] hover:border-[#D1D5DB] transition-all duration-150"
        >
          <Navigation size={14} />
          Directions
        </a>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-full text-sm font-medium text-black hover:bg-[#F7F9FA] hover:border-[#D1D5DB] transition-all duration-150"
        >
          <Share2 size={14} />
          Share
        </button>
        <button
          onClick={toggleSave}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 border rounded-full text-sm font-medium transition-all duration-150",
            isSaved 
              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" 
              : "border-[#E5E7EB] text-black hover:bg-[#F7F9FA] hover:border-[#D1D5DB]"
          )}
        >
          <Heart size={14} className={isSaved ? "fill-red-600" : ""} />
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>

      {/* ── Amenities ──────────────────────────────────────── */}
      {salon.amenities && salon.amenities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {salon.amenities.map((amenity) => {
            const cfg = AMENITY_CONFIG[amenity];
            return (
              <div
                key={amenity}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F9FA] rounded-full text-xs text-[#71717A] font-medium"
              >
                {cfg?.icon || <Clock size={13} />}
                {cfg?.label || amenity}
              </div>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <div className="mt-2 sm:mt-5 border-b border-[#F3F4F6]" />
    </div>
  );
};
