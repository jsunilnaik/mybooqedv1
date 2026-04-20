import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Grid3X3 } from 'lucide-react';
import { categoryService } from '../lib/dataService';
import { CATEGORY_META, DEFAULT_CATEGORY_META } from '../constants/categoryMeta';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const categories = categoryService.getAll();

  return (
    <div className="min-h-screen bg-white">

      {/* Page Header */}
      <div className="bg-[#F7F9FA] border-b border-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Grid3X3 size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#71717A] uppercase tracking-widest">Browse</p>
              <h1
                className="text-2xl sm:text-3xl font-black text-black"
                style={{ letterSpacing: '-0.03em' }}
              >
                All Categories
              </h1>
            </div>
          </div>
          <p className="text-sm text-[#71717A] max-w-md">
            Explore every service category available across the best salons in your city.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const meta = CATEGORY_META[cat.slug] || DEFAULT_CATEGORY_META;
            const { Icon } = meta;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                onClick={() => navigate(`/categories/${cat.slug}`)}
                className="group bg-white rounded-2xl border border-[#F3F4F6] hover:border-[#E5E7EB] hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Color top band */}
                <div className="h-1.5 w-full" style={{ backgroundColor: meta.color }} />

                <div className="p-6">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: meta.bg }}
                  >
                    <Icon size={26} style={{ color: meta.color }} strokeWidth={1.8} />
                  </div>

                  {/* Name + desc */}
                  <h2 className="text-base font-black text-black mb-1" style={{ letterSpacing: '-0.02em' }}>
                    {cat.name}
                  </h2>
                  <p className="text-sm text-[#71717A] leading-relaxed line-clamp-2 mb-4">
                    {cat.description}
                  </p>

                  {/* Service count + CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#71717A] bg-[#F7F9FA] px-3 py-1.5 rounded-full">
                      {cat.serviceCount} services
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-black group-hover:gap-2 transition-all">
                      Explore
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center py-10 bg-[#F7F9FA] rounded-2xl border border-[#F3F4F6]">
          <p className="text-xs font-semibold text-[#71717A] uppercase tracking-widest mb-3">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <h3
            className="text-xl font-black text-black mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Browse all salons
          </h3>
          <button
            onClick={() => navigate('/salons')}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-all active:scale-[0.98]"
          >
            View all salons
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="h-20 lg:h-6" />
      </div>
    </div>
  );
};

export default CategoriesPage;
