import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { reviewService } from '../../lib/dataService';

const ReviewsStrip: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reviews = reviewService.getTopReviews(12);

  if (reviews.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-[#F7F9FA] overflow-x-hidden overflow-y-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            {/* Star row */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className="fill-[#FFB800] text-[#FFB800]" />
              ))}
              <span className="text-sm font-bold text-black ml-2">4.8 average</span>
              <span className="text-sm text-[#71717A] ml-1">across 10,000+ reviews</span>
            </div>
            <h2
              className="text-2xl md:text-3xl font-black text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              Loved by India
            </h2>
            <p className="text-sm text-[#71717A] mt-1">Real reviews from our customers</p>
          </div>

          {/* Scroll controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white hover:border-black hover:shadow-sm transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} className="text-black" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white hover:border-black hover:shadow-sm transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} className="text-black" />
            </button>
          </div>
        </div>

        {/* Horizontal scrolling reviews */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 -mx-1 px-1"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="flex-shrink-0 bg-white rounded-2xl p-5 flex flex-col gap-3 border border-[#F3F4F6] hover:border-[#E5E7EB] hover:shadow-md transition-all duration-200"
              style={{ width: 'min(300px, 78vw)', scrollSnapAlign: 'start' }}
            >
              {/* Quote icon + Stars */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      className={
                        star <= review.rating
                          ? 'fill-[#FFB800] text-[#FFB800]'
                          : 'text-gray-200 fill-gray-200'
                      }
                    />
                  ))}
                </div>
                <Quote size={18} className="text-[#E5E7EB]" />
              </div>

              {/* Comment */}
              <p className="text-sm text-black leading-relaxed line-clamp-4 flex-1">
                {review.comment}
              </p>

              {/* User + date */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-[#F3F4F6]">
                <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-black leading-none truncate">
                    {review.userName}
                  </p>
                  <p className="text-[10px] text-[#71717A] mt-1">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {/* Verified badge */}
                <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-700">Verified</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overall stats strip */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { value: '10,000+', label: 'Total Reviews' },
            { value: '98%', label: 'Would Recommend' },
            { value: '4.8/5', label: 'Average Rating' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 text-center border border-[#F3F4F6]">
              <div className="text-xl font-black text-black" style={{ letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div className="text-xs text-[#71717A] mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsStrip;
