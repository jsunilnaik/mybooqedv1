import React from 'react';
import { SalonCard } from './SalonCard';
import type { Salon } from '../../types';

interface NearbySalonsProps {
  salons: Salon[];
  currentCity: string;
}

export const NearbySalons: React.FC<NearbySalonsProps> = ({ salons, currentCity }) => {
  if (!salons.length) return null;

  return (
    <section className="py-12 border-t border-[#F3F4F6] mt-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-black rounded-full" />
          <span className="text-xs font-bold tracking-wider text-[#71717A] uppercase">Recommendations</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-black text-black tracking-tight">
            Near By Salons
          </h2>
          <span className="text-sm text-[#71717A] font-medium"> in {currentCity}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {salons.map((salon, index) => (
          <SalonCard 
            key={salon.id} 
            salon={salon} 
            index={index}
            className="h-full"
          />
        ))}
      </div>
    </section>
  );
};
