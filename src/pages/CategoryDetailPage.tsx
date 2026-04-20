import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight, Search } from 'lucide-react';
import { categoryService } from '../lib/dataService';
import { CATEGORY_META, DEFAULT_CATEGORY_META } from '../constants/categoryMeta';
import { SalonCard } from '../components/salon/SalonCard';
import { useLocationStore } from '../store/useLocationStore';
import type { Service } from '../types';
import servicesRaw from '../data/services.json';

const allServices: Service[] = servicesRaw as unknown as Service[];

const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const category = useMemo(
    () => categoryService.getAll().find((c) => c.slug === slug),
    [slug]
  );

  const { city } = useLocationStore();

  const salons = useMemo(() => {
    if (!slug) return [];
    const categorySalons = categoryService.getSalonsByCategory(slug);
    if (!city || city === 'All Cities') return categorySalons;
    return categorySalons.filter(s => s.address.city.toLowerCase() === city.toLowerCase());
  }, [slug, city]);

  const getServicesForSalon = (salonId: string): Service[] =>
    allServices.filter((s) => s.salonId === salonId && s.isActive).slice(0, 3);

  const meta = CATEGORY_META[slug || ''] || DEFAULT_CATEGORY_META;
  const { Icon } = meta;

  if (!category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-[#F7F9FA] rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
            <Search size={40} className="text-[#71717A]" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-black mb-3">Category not found</h2>
          <button
            onClick={() => navigate('/categories')}
            className="px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Browse Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header banner ── */}
      <div
        className="border-b border-[#F3F4F6]"
        style={{ background: `linear-gradient(135deg, ${meta.bg}, rgba(255,255,255,0.5))` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-1.5 text-sm text-[#71717A] hover:text-black transition-colors mb-5"
          >
            <ChevronLeft size={16} />
            All Categories
          </button>

          <div className="flex items-center gap-4">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: meta.bg }}
            >
              <Icon size={32} style={{ color: meta.color }} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#71717A] uppercase tracking-widest mb-1">
                Category
              </p>
              <h1
                className="text-2xl sm:text-3xl font-black text-black"
                style={{ letterSpacing: '-0.03em' }}
              >
                {category.name}
              </h1>
              <p className="text-sm text-[#71717A] mt-1">{category.description}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-6 pt-5 border-t border-[#E5E7EB]/50">
            <div>
              <div className="text-xl font-black text-black" style={{ letterSpacing: '-0.02em' }}>
                {salons.length}
              </div>
              <div className="text-xs text-[#71717A]">Salons available</div>
            </div>
            <div className="w-px h-8 bg-[#E5E7EB]" />
            <div>
              <div className="text-xl font-black text-black" style={{ letterSpacing: '-0.02em' }}>
                {category.serviceCount}
              </div>
              <div className="text-xs text-[#71717A]">Services</div>
            </div>
            <div className="w-px h-8 bg-[#E5E7EB]" />
            <div>
              <div className="text-xl font-black text-black" style={{ letterSpacing: '-0.02em' }}>
                ₹80+
              </div>
              <div className="text-xs text-[#71717A]">Starting from</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Salon grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Section heading */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-black text-black"
            style={{ letterSpacing: '-0.02em' }}
          >
            {salons.length} salon{salons.length !== 1 ? 's' : ''} offering {category.name}
          </h2>
          <button
            onClick={() => navigate('/salons')}
            className="text-sm font-semibold text-black hover:underline flex items-center gap-1 group"
          >
            View all
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {salons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{ backgroundColor: meta.bg }}
            >
              <Icon size={40} style={{ color: meta.color }} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">No salons found</h3>
            <p className="text-sm text-[#71717A] mb-6">
              No salons currently offer {category.name} services in this city.
            </p>
            <button
              onClick={() => navigate('/salons')}
              className="px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Browse All Salons
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {salons.map((salon, i) => (
              <SalonCard
                key={salon.id}
                salon={salon}
                services={getServicesForSalon(salon.id)}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-20 lg:h-8" />
      </div>
    </div>
  );
};

export default CategoryDetailPage;
