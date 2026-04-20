import React from 'react';
import { Phone, Clock, Wifi, Car, CreditCard, Wind, MapPin } from 'lucide-react';
import OSMMap from '../map/OSMMap';
import { cn } from '../../lib/utils';
import type { Salon } from '../../types';

interface SalonInfoProps {
  salon: Salon;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'WiFi': <Wifi size={16} />,
  'Parking': <Car size={16} />,
  'Card Payment': <CreditCard size={16} />,
  'AC': <Wind size={16} />,
};

function formatHour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getTodayName(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

export const SalonInfo: React.FC<SalonInfoProps> = ({ salon }) => {
  const today = getTodayName();
  const lat = salon.coordinates?.lat || 15.1394;
  const lng = salon.coordinates?.lng || 76.9214;

  return (
    <div className="space-y-8">

      {/* About */}
      <div>
        <h3 className="text-base font-bold text-black mb-3">About</h3>
        <p className="text-sm text-[#71717A] leading-relaxed">{salon.description}</p>
      </div>

      {/* Opening Hours */}
      <div>
        <h3 className="text-base font-bold text-black mb-4 flex items-center gap-2">
          <Clock size={16} className="text-black" />
          Opening Hours
        </h3>
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          {DAYS.map((day, idx) => {
            const hours = salon.openingHours[day];
            const isToday = day === today;
            return (
              <div
                key={day}
                className={cn(
                  'flex items-center justify-between px-5 py-3 text-sm',
                  idx < DAYS.length - 1 && 'border-b border-gray-50',
                  isToday && 'bg-[#F7F9FA]'
                )}
              >
                <span className={cn('font-medium', isToday ? 'text-black' : 'text-[#71717A]')}>
                  {DAY_LABELS[day]}
                  {isToday && (
                    <span className="ml-2 text-xs text-[#71717A] font-normal">(Today)</span>
                  )}
                </span>
                {hours?.isClosed ? (
                  <span className="text-[#71717A]">Closed</span>
                ) : (
                  <span className={cn(isToday ? 'text-black font-semibold' : 'text-[#71717A]')}>
                    {hours?.open
                      ? `${formatHour(hours.open)} – ${formatHour(hours.close)}`
                      : 'Closed'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Amenities */}
      {salon.amenities && salon.amenities.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-black mb-4">Amenities</h3>
          <div className="grid grid-cols-2 gap-3">
            {salon.amenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-3 p-3 bg-[#F7F9FA] rounded-xl"
              >
                <div className="text-black">
                  {AMENITY_ICONS[amenity] || <span className="w-4 h-4 block" />}
                </div>
                <span className="text-sm text-black font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      <div>
        <h3 className="text-base font-bold text-black mb-4">Contact</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F7F9FA] rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-black" />
            </div>
            <a
              href={`tel:${salon.phone}`}
              className="text-sm text-black hover:text-[#71717A] transition-colors"
            >
              {salon.phone}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F7F9FA] rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-black" />
            </div>
            <span className="text-sm text-[#71717A]">
              {salon.address.line1}, {salon.address.area}, {salon.address.city} — {salon.address.pincode}
            </span>
          </div>
        </div>
      </div>

      {/* Location Map */}
      <div>
        <h3 className="text-base font-bold text-black mb-4">Location</h3>

        {/* Address card */}
        <div className="flex items-start gap-3 p-4 bg-[#F7F9FA] rounded-2xl mb-3">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-black leading-snug">
              {salon.address.line1}
            </p>
            <p className="text-xs text-[#71717A] mt-0.5">
              {salon.address.area}, {salon.address.city} — {salon.address.pincode}
            </p>
          </div>
        </div>

        {/* OpenStreetMap with Leaflet */}
        <OSMMap
          lat={lat}
          lng={lng}
          zoom={17}
          height="240px"
          name={salon.name}
          address={`${salon.address.line1}, ${salon.address.area}`}
        />
      </div>

    </div>
  );
};
