import React from 'react';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GalleryItem } from '../../types';

interface GalleryGridProps {
  items?: GalleryItem[];
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#71717A]">No gallery images yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-black mb-1">Our Featured Work</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative overflow-hidden rounded-xl border border-gray-100 bg-[#F7F9FA] shadow-sm cursor-pointer"
          >
            {/* Image container */}
            <div className="aspect-[4/5] overflow-hidden relative">
              <img
                src={item.imageUrl}
                alt={item.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-white text-sm font-semibold line-clamp-2 leading-snug mb-2">
                {item.caption}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
                <Calendar size={12} />
                <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
