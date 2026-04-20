import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Zap, Scissors, Palette, Sparkles, Heart, Gem, Crown, Baby, Star } from 'lucide-react';
import type { Service, Category } from '../../types';
import { cn } from '../../lib/utils';

interface ServiceListProps {
  services: Service[];
  categories: Category[];
  salonId: string;
  bookingUrl?: string;
  selectable?: boolean;
  selectedServices?: Service[];
  onToggle?: (service: Service) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'haircut-styling': Scissors,
  'beard-shave': Scissors,
  'hair-coloring': Palette,
  'skin-facial': Sparkles,
  'spa-massage': Heart,
  'nail-art': Gem,
  'bridal-makeup': Crown,
  'kids-haircut': Baby,
};

export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  categories,
  salonId,
  bookingUrl,
  selectable = false,
  selectedServices = [],
  onToggle,
}) => {
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  // Build category groups
  const grouped = categories.reduce((acc, cat) => {
    const catServices = services.filter(s => s.categoryId === cat.id);
    if (catServices.length > 0) acc.push({ category: cat, services: catServices });
    return acc;
  }, [] as { category: Category; services: Service[] }[]);

  // Filter by selected category tab
  const displayGroups = activeCategoryId === 'all'
    ? grouped
    : grouped.filter(g => g.category.id === activeCategoryId);

  // Filter by gender
  const finalGroups = displayGroups.map(g => ({
    ...g,
    services: g.services.filter(s => {
      if (genderFilter === 'all') return true;
      return s.gender === genderFilter || s.gender === 'unisex';
    }),
  })).filter(g => g.services.length > 0);

  return (
    <div>
      {/* ── Category Tabs — horizontal pill scroll ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 sm:pb-3 sm:mb-3 scrollbar-hide">
        <button
          onClick={() => setActiveCategoryId('all')}
          className={cn(
            'flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200',
            activeCategoryId === 'all'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-gray-200 hover:border-gray-400'
          )}
        >
          All
        </button>
            {grouped.map(({ category }) => {
          const TabIcon = CATEGORY_ICONS[category.slug] || Star;
          return (
          <button
            key={category.id}
            onClick={() => setActiveCategoryId(category.id)}
            className={cn(
              'flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1.5',
              activeCategoryId === category.id
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-gray-400'
            )}
          >
            <TabIcon size={14} className={activeCategoryId === category.id ? 'text-white' : 'text-[#71717A]'} />
            {category.name}
          </button>
          );
        })}
      </div>

      {/* ── Gender sub-filter ── */}
      <div className="flex items-center gap-2 mb-3 sm:mb-6">
        {(['all', 'male', 'female'] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGenderFilter(g)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200',
              genderFilter === g
                ? 'bg-black text-white border-black'
                : 'text-[#71717A] border-gray-200 hover:border-gray-400 bg-white'
            )}
          >
            {g === 'all' ? 'All' : g === 'male' ? '♂ Men' : '♀ Women'}
          </button>
        ))}
      </div>

      {/* ── Service groups ── */}
      <div className="space-y-4 sm:space-y-8">
        {finalGroups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#71717A]">No services match this filter.</p>
          </div>
        )}

        {finalGroups.map(({ category, services: catServices }) => (
          <div key={category.id}>
            {/* Category heading */}
            <h3 className="text-base font-bold text-black mb-2 sm:mb-4 flex items-center gap-2.5">
              {(() => {
                const Icon = CATEGORY_ICONS[category.slug] || Star;
                return (
                  <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-gray-600" />
                  </span>
                );
              })()}
              <span className="flex-1">{category.name}</span>
              <span className="text-xs font-medium text-[#71717A] bg-gray-100 px-2 py-0.5 rounded-full">
                {catServices.length}
              </span>
            </h3>

            {/* ── Service cards with outline border ── */}
            <div className="space-y-3">
              {catServices.map((service) => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                const hasDiscount = service.discountPrice && service.discountPrice < service.price;

                return (
                  <div
                    key={service.id}
                    onClick={selectable ? () => onToggle?.(service) : undefined}
                    className={cn(
                      // Base card style — outlined
                      'flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200',
                      selectable && 'cursor-pointer',
                      // Selectable states
                      selectable && isSelected
                        ? 'border-black bg-gray-50 shadow-sm'
                        : selectable
                          ? 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
                          : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                    )}
                  >
                    {/* ── Left: info ── */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-black leading-snug">
                          {service.name}
                        </span>
                        {service.isPopular && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                            <Zap size={9} className="fill-amber-600 text-amber-600" />
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                        <Clock size={11} />
                        <span>
                          {service.duration < 60
                            ? `${service.duration} mins`
                            : `${Math.floor(service.duration / 60)} hr${service.duration > 90 ? ` ${service.duration % 60} mins` : ''}`
                          }
                        </span>
                        {service.gender !== 'unisex' && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="capitalize">{service.gender}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ── Right: price + action ── */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Price */}
                      <div className="text-right">
                        {hasDiscount ? (
                          <>
                            <div className="text-sm font-bold text-black">
                              ₹{service.discountPrice}
                            </div>
                            <div className="text-xs text-[#71717A] line-through">
                              ₹{service.price}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm font-bold text-black">₹{service.price}</div>
                        )}
                      </div>

                      {/* Book button (non-selectable mode) */}
                      {!selectable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(bookingUrl || `/salons/${salonId}/book`);
                          }}
                          className="flex-shrink-0 px-4 py-1.5 text-xs font-semibold text-black bg-white border-2 border-gray-200 rounded-full hover:border-black hover:bg-gray-50 transition-all duration-200 whitespace-nowrap"
                        >
                          Book
                        </button>
                      )}

                      {/* Selectable checkbox/radio */}
                      {selectable && (
                        <div className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                          isSelected
                            ? 'bg-black border-black'
                            : 'border-gray-300 bg-white'
                        )}>
                          {isSelected && (
                            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                              <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
