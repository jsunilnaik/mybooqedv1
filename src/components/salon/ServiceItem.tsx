import React from 'react';
import { Clock, Star } from 'lucide-react';
import { salonService } from '../../lib/dataService';
import { buildBookingUrl } from '../../utils/seo';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatDuration } from '../../lib/utils';
import type { Service } from '../../types';

interface ServiceItemProps {
  service: Service;
  salonId: string;
  onBook?: (service: Service) => void;
  selected?: boolean;
  onToggle?: (service: Service) => void;
  selectable?: boolean;
}

const genderLabel = {
  male: '♂ Men',
  female: '♀ Women',
  unisex: '⚥ Unisex',
};

export const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  salonId,
  onBook,
  selected,
  onToggle,
  selectable = false,
}) => {
  const navigate = useNavigate();

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBook) {
      onBook(service);
    } else {
      const salonObj = salonService.getById(salonId);
      if (salonObj) {
        navigate(buildBookingUrl(salonObj as any));
      } else {
        navigate(`/salons/${salonId}/book`);
      }
    }
  };

  return (
    <div
      className={`flex items-start gap-4 py-4 px-1 transition-colors duration-150 ${
        selectable ? 'cursor-pointer hover:bg-gray-50 rounded-xl px-3' : ''
      } ${selected ? 'bg-[#7C3AED]/5 rounded-xl px-3' : ''}`}
      onClick={selectable ? () => onToggle?.(service) : undefined}
    >
      {/* Checkbox for selectable mode */}
      {selectable && (
        <div
          className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 ${
            selected
              ? 'bg-[#7C3AED] border-[#7C3AED]'
              : 'border-gray-300 bg-white'
          }`}
        >
          {selected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-medium text-[#1A1A1A] leading-snug">
                {service.name}
              </span>
              {service.isPopular && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                  <Star size={8} className="fill-amber-500" />
                  Popular
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={11} />
                <span>{formatDuration(service.duration)}</span>
              </div>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{genderLabel[service.gender]}</span>
            </div>

            {service.description && (
              <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                {service.description}
              </p>
            )}
          </div>

          {/* Price + Book */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-right">
              {service.discountPrice ? (
                <>
                  <div className="text-[15px] font-bold text-[#1A1A1A]">
                    {formatPrice(service.discountPrice)}
                  </div>
                  <div className="text-xs text-gray-400 line-through">
                    {formatPrice(service.price)}
                  </div>
                </>
              ) : (
                <div className="text-[15px] font-bold text-[#1A1A1A]">
                  {formatPrice(service.price)}
                </div>
              )}
            </div>

            {!selectable && (
              <button
                onClick={handleBook}
                className="text-xs font-semibold text-[#7C3AED] border border-[#7C3AED] px-3 py-1.5 rounded-lg hover:bg-[#7C3AED] hover:text-white transition-all duration-200 active:scale-95 whitespace-nowrap"
              >
                Book
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
