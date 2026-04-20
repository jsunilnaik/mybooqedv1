import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, X, ChevronRight, Scissors, Sparkles, Store, Star, MessageSquare, Layers, Gift, Loader2, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { salonService, searchService } from '../../lib/dataService';
import { useLocationStore } from '../../store/useLocationStore';
import { cn } from '../../lib/utils';
import { buildSalonUrl } from '../../utils/seo';

const POPULAR = ['Haircut', 'Facial', 'Beard Trim', 'Hair Color', 'Bridal Makeup', 'Nail Art'];

const STATS = [
  { value: '20+', label: 'Salons', Icon: Store },
  { value: '500+', label: 'Reviews', Icon: MessageSquare },
  { value: '80+', label: 'Services', Icon: Layers },
  { value: '100%', label: 'Free Booking', Icon: Gift },
];

interface Suggestion {
  id: string;
  name: string;
  type: 'salon' | 'service';
  subtitle: string;
}

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSug, setShowSug] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Location store
  const { 
    coordinates, 
    area, 
    city,
    state,
    isDetecting, 
    error: locationError,
    unsupportedLocation,
    detectLocation 
  } = useLocationStore();

  const hasLocation = coordinates !== null;
  
  // Build display name: prefer area, then city, fallback to India
  // Build display name
  const displayArea = hasLocation 
    ? (area || city || 'Nearby') 
    : 'India';
  const displayCity = hasLocation 
    ? (city || 'India') 
    : 'India';
  const displayState = hasLocation
    ? (state || '')
    : '';
  const locationText = hasLocation ? displayArea : 'India';

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        const res = searchService.getSuggestions(query) as Suggestion[]; 
        setSuggestions(res);
        setShowSug(true);
      }, 200);
    } else {
      setSuggestions([]);
      setShowSug(false);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSug(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSug(false);
    }
  };

  const handlePopular = (term: string) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleUseMyLocation = async () => {
    await detectLocation();
  };

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(80% 60% at 20% -10%, rgb(66 118 255 / 60%) 0%, transparent 60%), 
            radial-gradient(60% 50% at 80% 0%, rgb(255 115 217 / 52%) 0%, transparent 55%), 
            radial-gradient(50% 70% at 50% 100%, rgba(255, 245, 200, 0.3) 0%, transparent 60%), 
            rgb(255, 255, 255)
          `,
        }}
      />

      {/* Decorative blobs — desktop only */}
      <div
        className="hidden lg:block absolute top-0 right-0 w-72 h-72 rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(200,190,255,0.6) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="hidden lg:block absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,180,200,0.7) 0%, transparent 70%)',
          transform: 'translate(-30%, 30%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-6 sm:pt-16 sm:pb-12 text-center">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-[#E5E7EB] rounded-full px-3 py-1 sm:px-4 sm:py-1.5 mb-4 sm:mb-5 shadow-sm"
        >
          <MapPin size={12} className="text-black sm:w-[13px] sm:h-[13px]" />
          <span className="text-[11px] sm:text-xs font-bold text-black">{hasLocation ? `${displayArea}${displayCity !== displayArea ? ', ' + displayCity : ''}` : 'India'}</span>
          <span className="text-[9px] sm:text-[10px] text-[#71717A] border-l border-[#E5E7EB] pl-1.5 sm:pl-2 hidden min-[360px]:inline">Pan-India coverage</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="font-black text-black leading-[1.08] tracking-tight mb-3 sm:mb-4"
          style={{
            fontSize: 'clamp(1.625rem, 6vw, 4.5rem)',
            letterSpacing: '-0.04em',
          }}
        >
          Book the best salons
          <br />
          <span className="text-[#71717A] font-black">in {locationText}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="text-[13px] sm:text-base text-[#71717A] mb-5 sm:mb-7 max-w-[280px] sm:max-w-md mx-auto leading-relaxed"
        >
          Discover and instantly book top-rated salons and spas near you.
          No calls, no waiting.
        </motion.p>

        {/* SEARCH BAR */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="relative w-full max-w-2xl mx-auto"
          ref={containerRef}
        >
          {/* Desktop pill search */}
          <form
            onSubmit={handleSubmit}
            className="hidden sm:flex items-center gap-0 bg-white rounded-full border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-hidden"
          >
            <div className="flex items-center gap-3 flex-1 pl-5 py-1">
              <Search size={17} className="text-[#9CA3AF] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSug(true)}
                placeholder="Search for a salon, treatment, or barber..."
                className="flex-1 bg-transparent text-sm text-black placeholder-[#9CA3AF] outline-none py-3.5 min-w-0"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setSuggestions([]); setShowSug(false); }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-[#F4F4F5] hover:bg-[#E5E7EB] flex-shrink-0 transition-colors"
                >
                  <X size={12} className="text-[#71717A]" />
                </button>
              )}
            </div>
            <div className="w-px h-8 bg-[#E5E7EB] flex-shrink-0 mx-2" />
            <div className="flex items-center gap-2 px-4 py-1 flex-shrink-0">
              <MapPin size={14} className={hasLocation ? "text-green-500" : "text-[#9CA3AF]"} />
              <span className="text-sm text-black font-medium whitespace-nowrap">{locationText}</span>
            </div>
            <div className="pr-1.5 py-1.5 flex-shrink-0">
              <button
                type="submit"
                className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#1a1a1a] active:scale-[0.97] transition-all duration-200"
              >
                Search
              </button>
            </div>
          </form>

          {/* Mobile stacked search */}
          <form
            onSubmit={handleSubmit}
            className="sm:hidden bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.10)] overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-1 border-b border-[#F3F4F6]">
              <Search size={16} className="text-[#9CA3AF] flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search salons, services..."
                className="flex-1 bg-transparent text-sm text-black placeholder-[#9CA3AF] outline-none py-3.5"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setSuggestions([]); setShowSug(false); }}>
                  <X size={14} className="text-[#9CA3AF]" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5">
              <MapPin size={14} className={hasLocation ? "text-green-500" : "text-[#9CA3AF]"} />
              <span className="text-sm text-[#71717A]">{hasLocation ? `${displayArea}${displayState ? ', ' + displayState : ''}` : 'India'}</span>
            </div>
            <div className="px-3 pb-3">
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-full font-bold text-sm hover:bg-[#1a1a1a] active:scale-[0.98] transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {showSug && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 right-0 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { // Changed from onMouseDown to onClick
                      setQuery(s.name); // Keep the query in the input field
                      if (s.type === 'salon') {
                        const salonObj = salonService.getById(s.id);
                        navigate(salonObj?.uniqueId ? buildSalonUrl(salonObj as any) : `/salons/${s.id}`);
                      } else {
                        navigate(`/search?q=${encodeURIComponent(s.name)}`);
                      }
                      setShowSug(false); // Changed from setShowSuggestions to setShowSug
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#F7F9FA] transition-colors text-left"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      s.type === 'salon' ? 'bg-[#F0F0FF]' : 'bg-[#FFF4ED]'
                    )}>
                      {s.type === 'salon'
                        ? <Scissors size={14} className="text-[#403AFA]" />
                        : <Sparkles size={14} className="text-[#FC5201]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-black">{s.name}</div>
                      <div className="text-xs text-[#71717A]">{s.subtitle}</div>
                    </div>
                    <ChevronRight size={14} className="text-[#D1D5DB] flex-shrink-0" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Use my location — simple small text link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mt-3"
        >
          {!hasLocation && window.isSecureContext && (
            <button
              onClick={handleUseMyLocation}
              disabled={isDetecting}
              className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-black transition-colors"
            >
              {isDetecting ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <Crosshair size={12} />
                  <span>Use my location</span>
                </>
              )}
            </button>
          )}
          
          {hasLocation && (
            <span className={cn(
              "inline-flex items-center gap-1.5 text-xs",
              unsupportedLocation ? "text-orange-600" : "text-green-600"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                unsupportedLocation ? "bg-orange-500" : "bg-green-500"
              )} />
              <span>
                {area ? `${area}, ${displayCity}` : displayCity}
                {unsupportedLocation && " (Not Served)"}
              </span>
            </span>
          )}
          
          {locationError && !hasLocation && window.isSecureContext && (
            <p className="text-[10px] text-red-500 mt-1">{locationError}</p>
          )}
        </motion.div>

        {/* Popular searches */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-5"
        >
          <span className="text-xs text-[#9CA3AF] font-medium">Popular:</span>
          {POPULAR.map((term) => (
            <button
              key={term}
              onClick={() => handlePopular(term)}
              className="text-xs font-medium text-[#374151] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-full hover:border-black hover:text-black transition-all duration-150 shadow-sm"
            >
              {term}
            </button>
          ))}
        </motion.div>

        {/* Trust stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="mt-7 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-2xl mx-auto"
        >
          {STATS.map((stat) => {
            const { Icon } = stat;
            return (
              <div
                key={stat.label}
                className="bg-white/80 backdrop-blur-sm border border-[#E5E7EB] rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-center shadow-sm flex flex-col items-center gap-0.5 sm:gap-1"
              >
                <Icon size={14} className="text-[#71717A] sm:w-4 sm:h-4" />
                <div className="text-base sm:text-lg font-black text-black" style={{ letterSpacing: '-0.02em' }}>
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs text-[#71717A]">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Social proof avatars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mt-5 sm:mt-6"
        >
          {/* Profile photos on LEFT */}
          <div className="flex -space-x-2.5">
            {[
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
            ].map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Customer ${i + 1}`}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover shadow-sm"
                style={{ zIndex: 5 - i }}
              />
            ))}
          </div>
          {/* Stars and text on RIGHT */}
          <div className="text-left">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-[#FFB800] text-[#FFB800]" />)}
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">Loved by 10,000+ customers across India</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
