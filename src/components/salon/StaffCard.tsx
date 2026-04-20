import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Staff } from '../../types';

interface StaffCardProps {
  staff: Staff;
  selected?: boolean;
  onSelect?: (staff: Staff) => void;
  selectable?: boolean;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  selected,
  onSelect,
  selectable = false,
}) => {
  const cardClassName = cn(
    'flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-200',
    selectable ? 'cursor-pointer' : 'cursor-pointer hover:-translate-y-1 hover:shadow-md',
    selected
      ? 'bg-gray-50 ring-2 ring-black'
      : 'bg-white hover:bg-gray-50 shadow-sm border border-gray-50'
  );

  const innerContent = (
    <>
      {/* Circular avatar with rating badge */}
      <div className="relative mb-3">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
          {staff.avatar ? (
            <img
              src={staff.avatar}
              alt={staff.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg">${getInitials(staff.name)}</div>`;
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg">
              {getInitials(staff.name)}
            </div>
          )}
        </div>

        {/* Rating badge — white pill at bottom of circle */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white shadow-md px-2 py-0.5 rounded-full border border-gray-100 whitespace-nowrap">
          <Star size={9} className="text-[#FFB800] fill-[#FFB800]" />
          <span className="text-[10px] font-bold text-black">{staff.rating}</span>
        </div>
      </div>

      {/* Name */}
      <h3 className="font-semibold text-black text-sm leading-tight mb-0.5 mt-1">
        {staff.name}
      </h3>

      {/* Role */}
      <p className="text-xs text-[#71717A] mb-2">{staff.role}</p>

      {/* Experience */}
      <p className="text-xs text-[#71717A] mb-2">{staff.experience} yrs exp</p>

      {/* Specializations */}
      {staff.specializations && staff.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {staff.specializations.slice(0, 2).map((spec) => (
            <span
              key={spec}
              className="text-[10px] bg-[#F7F9FA] text-[#71717A] px-2 py-0.5 rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Availability dot */}
      <div className={cn(
        'mt-2 flex items-center gap-1 text-[10px] font-medium',
        staff.isAvailable ? 'text-emerald-600' : 'text-gray-400'
      )}>
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          staff.isAvailable ? 'bg-emerald-500' : 'bg-gray-300'
        )} />
        {staff.isAvailable ? 'Available' : 'Busy'}
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="mt-2 w-5 h-5 bg-black rounded-full flex items-center justify-center mx-auto">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </>
  );

  if (selectable) {
    return (
      <div onClick={() => onSelect?.(staff)} className={cardClassName}>
        {innerContent}
      </div>
    );
  }

  return (
    <Link to={`/stylist/${staff.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${staff.id}`} className={cardClassName}>
      {innerContent}
    </Link>
  );
};
