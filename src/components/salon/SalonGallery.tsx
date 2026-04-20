import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SalonGalleryProps {
  images: { cover: string; gallery: string[] };
  salonName: string;
}

const FALLBACKS = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop&auto=format',
];

export const SalonGallery: React.FC<SalonGalleryProps> = ({ images, salonName }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const rawImages = [images.cover, ...images.gallery].filter(Boolean);
  const allImages = rawImages.length >= 3 ? rawImages : [...rawImages, ...FALLBACKS].slice(0, 3);

  const img1 = allImages[0];
  const img2 = allImages[1];
  const img3 = allImages[2];

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImage = () => setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length);
  const nextImage = () => setLightboxIndex((i) => (i + 1) % allImages.length);

  return (
    <>
      {/* ── 3-Image Mosaic ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        {/* Mobile: single full-width image with swipe dots */}
        <div className="sm:hidden relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F4F4F5]">
          <img
            src={img1}
            alt={salonName}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACKS[0]; }}
          />
          {/* See all button */}
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-black text-xs font-semibold px-3 py-2 rounded-full shadow-md"
          >
            <Images size={12} />
            See all {allImages.length} photos
          </button>
        </div>

        {/* Tablet & Desktop: 3-image mosaic */}
        <div className="hidden sm:flex gap-3 h-[300px] md:h-[380px] lg:h-[420px] rounded-2xl overflow-hidden">
          {/* Left — large primary image (60% width) */}
          <div
            className="relative flex-[0_0_60%] cursor-pointer group overflow-hidden rounded-xl"
            onClick={() => openLightbox(0)}
          >
            <img
              src={img1}
              alt={salonName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACKS[0]; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>

          {/* Right — two stacked images (40% width) */}
          <div className="flex flex-col gap-3 flex-[0_0_40%]">
            {/* Top right */}
            <div
              className="relative flex-1 cursor-pointer group overflow-hidden rounded-xl"
              onClick={() => openLightbox(1)}
            >
              <img
                src={img2}
                alt={`${salonName} 2`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACKS[1]; }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Bottom right */}
            <div
              className="relative flex-1 cursor-pointer group overflow-hidden rounded-xl"
              onClick={() => openLightbox(2)}
            >
              <img
                src={img3}
                alt={`${salonName} 3`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACKS[2]; }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

              {/* "See all images" pill — always shown on bottom-right image */}
              <div className="absolute bottom-3 right-3">
                <button
                  onClick={(e) => { e.stopPropagation(); openLightbox(0); }}
                  className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-black text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <Images size={13} />
                  See all photos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ───────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X size={18} />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/70 font-medium bg-black/50 px-3 py-1.5 rounded-full z-10">
              {lightboxIndex + 1} / {allImages.length}
            </div>

            {/* Prev */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              src={allImages[lightboxIndex]}
              alt={`${salonName} ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[82vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Dots */}
            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                    className={cn(
                      'rounded-full transition-all duration-200',
                      i === lightboxIndex
                        ? 'w-5 h-1.5 bg-white'
                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                    )}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
