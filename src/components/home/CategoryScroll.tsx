import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Scissors, Paintbrush, Sparkles, Smile, Wind, Eye, Hand, Heart, Leaf, Crown, Star, Flower2, User, Zap, ScanFace } from 'lucide-react';

const categories = [
  { slug: 'haircut-styling', label: 'Haircut & Styling', Icon: Scissors, color: '#A855F7', bg: 'rgba(168,85,247,0.08)', count: '1,240 services' },
  { slug: 'hair-color', label: 'Hair Color', Icon: Paintbrush, color: '#E11D48', bg: 'rgba(225,29,72,0.08)', count: '890 services' },
  { slug: 'hair-treatment', label: 'Hair Treatment', Icon: Sparkles, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', count: '620 services' },
  { slug: 'facial-cleanup', label: 'Facial & Cleanup', Icon: Smile, color: '#F97316', bg: 'rgba(249,115,22,0.08)', count: '980 services' },
  { slug: 'waxing', label: 'Waxing', Icon: Wind, color: '#10B981', bg: 'rgba(16,185,129,0.08)', count: '730 services' },
  { slug: 'threading', label: 'Threading', Icon: Eye, color: '#D946EF', bg: 'rgba(217,70,239,0.08)', count: '960 services' },
  { slug: 'manicure-pedicure', label: 'Manicure & Pedicure', Icon: Hand, color: '#6366F1', bg: 'rgba(99,102,241,0.08)', count: '670 services' },
  { slug: 'massage', label: 'Massage', Icon: Heart, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', count: '380 services' },
  { slug: 'spa-wellness', label: 'Spa & Wellness', Icon: Leaf, color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)', count: '450 services' },
  { slug: 'bridal-packages', label: 'Bridal Packages', Icon: Crown, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', count: '280 services' },
  { slug: 'makeup', label: 'Makeup', Icon: Star, color: '#A855F7', bg: 'rgba(168,85,247,0.08)', count: '520 services' },
  { slug: 'mehendi', label: 'Mehendi', Icon: Flower2, color: '#059669', bg: 'rgba(5,150,105,0.08)', count: '340 services' },
  { slug: 'beard-grooming', label: 'Beard & Grooming', Icon: User, color: '#2563EB', bg: 'rgba(37,99,235,0.08)', count: '560 services' },
  { slug: 'body-care', label: 'Body Care', Icon: Zap, color: '#EC4899', bg: 'rgba(236,72,153,0.08)', count: '420 services' },
  { slug: 'eyelash-brow', label: 'Eyelash & Brow', Icon: ScanFace, color: '#84CC16', bg: 'rgba(132,204,22,0.08)', count: '310 services' },
];

export const CategoryScroll: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#71717A] uppercase tracking-widest mb-1">
              What are you looking for?
            </p>
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-black text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              Browse by Category
            </h2>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-black hover:underline whitespace-nowrap group"
          >
            View all
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Desktop grid — 8 columns */}
        <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-8 gap-3">
          {categories.map((cat, i) => {
            const { Icon } = cat;
            return (
              <motion.button
                key={cat.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => navigate(`/categories/${cat.slug}`)}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-transparent hover:border-[#E5E7EB] hover:bg-[#F7F9FA] transition-all duration-200 cursor-pointer text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: cat.bg }}
                >
                  <Icon size={24} style={{ color: cat.color }} strokeWidth={1.8} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#374151] leading-tight group-hover:text-black transition-colors block">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] mt-1 block">{cat.count}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Mobile / Tablet — 2x4 grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:hidden">
          {categories.map((cat, i) => {
            const { Icon } = cat;
            return (
              <motion.button
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => navigate(`/categories/${cat.slug}`)}
                className="group flex flex-col items-start gap-1.5 sm:gap-2 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#F3F4F6] bg-white hover:border-[#E5E7EB] hover:shadow-sm transition-all duration-200 cursor-pointer text-left active:scale-[0.97]"
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: cat.bg }}
                >
                  <Icon size={18} style={{ color: cat.color }} strokeWidth={1.8} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                <div>
                  <span className="text-[11px] sm:text-sm font-bold text-black leading-snug block">
                    {cat.label}
                  </span>
                  <span className="text-[9px] sm:text-[11px] text-[#71717A] mt-0.5 block">{cat.count}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-6 lg:hidden">
          <button
            onClick={() => navigate('/categories')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-black border border-[#E5E7EB] px-5 py-2.5 rounded-full hover:bg-[#F7F9FA] transition-colors"
          >
            View all categories
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
