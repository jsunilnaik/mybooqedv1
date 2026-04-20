import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X, Clock, Tag, ChevronRight, ArrowUpRight, Scissors, Wind, Palette, Sparkles, Waves, Gem, Heart, Baby } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { salonService, searchService } from '../lib/dataService';
import { SalonCard } from '../components/salon/SalonCard';
import { POPULAR_SEARCHES } from '../lib/constants';
import { formatPrice, formatDuration, getDistance } from '../lib/utils';
import { useLocationStore } from '../store/useLocationStore';
import type { Salon, Service } from '../types';
import servicesRaw from '../data/services.json';
import salonsRaw from '../data/salons.json';
import { buildSalonUrl, buildBookingUrl } from '../utils/seo';

const allServices: Service[] = servicesRaw as unknown as Service[];
const allSalons: Salon[] = salonsRaw as unknown as Salon[];

// ─── Autocomplete Suggestions ─────────────────────────────────────────────────
interface Suggestion {
  id: string;
  name: string;
  type: 'salon' | 'service';
  subtitle: string;
}

const SuggestionDropdown: React.FC<{
  suggestions: Suggestion[];
  onSelect: (name: string) => void;
  visible: boolean;
}> = ({ suggestions, onSelect, visible }) => (
  <AnimatePresence>
    {visible && suggestions.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden z-50"
      >
        {suggestions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.name)}
            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F7F9FA] transition-colors text-left group"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              s.type === 'salon' ? 'bg-[#F0F0F0]' : 'bg-[#FFF7ED]'
            }`}>
              {s.type === 'salon' ? (
                <Tag size={14} className="text-[#71717A]" />
              ) : (
                <Clock size={14} className="text-[#FC5201]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-black leading-tight">{s.name}</div>
              <div className="text-xs text-[#71717A]">{s.subtitle}</div>
            </div>
            <ArrowUpRight size={14} className="text-[#D1D5DB] group-hover:text-black transition-colors flex-shrink-0" />
          </button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Service result row ───────────────────────────────────────────────────────
const ServiceResultRow: React.FC<{ service: Service & { salonName: string }; index: number }> = ({ service, index }) => {
  const navigate = useNavigate();
  const salonObj = salonService.getById(service.salonId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => salonObj ? navigate(buildSalonUrl(salonObj as any)) : null}
      className="flex items-center justify-between py-3.5 cursor-pointer group hover:bg-[#FAFAFA] -mx-4 px-4 rounded-xl transition-colors"
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-black group-hover:underline">{service.name}</span>
          {service.isPopular && (
            <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded-md">Popular</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[#71717A]">{formatDuration(service.duration)}</span>
          <span className="text-[#D1D5DB]">·</span>
          <span className="text-xs text-[#0066FF] font-medium">{service.salonName || 'Salon'}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {service.discountPrice ? (
          <div className="text-right">
            <div className="text-xs text-[#71717A] line-through">{formatPrice(service.price)}</div>
            <div className="text-sm font-bold text-black">{formatPrice(service.discountPrice)}</div>
          </div>
        ) : (
          <span className="text-sm font-bold text-black">{formatPrice(service.price)}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const salonObj = salonService.getById(service.salonId);
            if (salonObj) navigate(buildBookingUrl(salonObj as any));
            else navigate(`/salons/${service.salonId}/book`);
          }}
          className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-full hover:bg-[#1a1a1a] transition-colors"
        >
          Book
        </button>
        <ChevronRight size={14} className="text-[#D1D5DB] group-hover:text-black transition-colors" />
      </div>
    </motion.div>
  );
};

// ─── MAIN SEARCH PAGE ─────────────────────────────────────────────────────────
const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<{
    salons: (Salon & { distance?: number })[];
    services: (Service & { salonName: string })[];
  }>({ salons: [], services: [] });
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { coordinates } = useLocationStore();

  // Run search from URL param on mount / change
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      runSearch(q);
    } else {
      setHasSearched(false);
      setResults({ salons: [], services: [] });
    }
  }, [searchParams.toString()]);

  // Debounced suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        const raw = searchService.getSuggestions(query);
        setSuggestions(raw as Suggestion[]);
        setShowSuggestions(true);
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const runSearch = (q: string) => {
    const r = searchService.search({ q });
    const enrichedServices = (r.services || []).map((svc) => ({
      ...svc,
      salonName: allSalons.find((s) => s.id === svc.salonId)?.name || '',
    }));
    
    // Add distance to salons if user location is available
    let salonsWithDistance = r.salons || [];
    if (coordinates) {
      salonsWithDistance = salonsWithDistance.map((salon) => {
        if (salon.coordinates) {
          const dist = getDistance(
            coordinates.lat, coordinates.lng,
            salon.coordinates.lat, salon.coordinates.lng
          );
          return { ...salon, distance: Math.round(dist * 10) / 10 };
        }
        return salon;
      });
      // Sort by distance (nearest first)
      salonsWithDistance.sort((a, b) => {
        const distA = (a as Salon & { distance?: number }).distance ?? 999;
        const distB = (b as Salon & { distance?: number }).distance ?? 999;
        return distA - distB;
      });
    }
    
    setResults({ salons: salonsWithDistance, services: enrichedServices });
    setHasSearched(true);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  const handleSuggestionSelect = (name: string) => {
    setQuery(name);
    setSearchParams({ q: name });
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
    setHasSearched(false);
    setResults({ salons: [], services: [] });
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Get services for salon cards
  const getServicesForSalon = (salonId: string): Service[] =>
    allServices.filter((s) => s.salonId === salonId && s.isActive).slice(0, 3);

  const totalResults = results.salons.length + results.services.length;

  return (
    <div className="bg-white min-h-screen">
      {/* ── Search bar — sticky ──────────────────────────── */}
      <div className="sticky top-[52px] sm:top-[64px] z-30 bg-white border-b border-[#F3F4F6]">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <div className="search-pill flex items-center gap-2 pr-2 overflow-hidden bg-[#F7F9FA] rounded-full w-full">
                <Search size={18} className="text-[#9CA3AF] ml-4 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search salons, services, or stylists..."
                  autoFocus
                  className="flex-1 min-w-0 w-full bg-transparent text-base text-black placeholder-[#9CA3AF] outline-none py-3 px-1"
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-[#F4F4F5] hover:bg-[#E5E7EB] transition-colors flex-shrink-0"
                  >
                    <X size={14} className="text-[#71717A]" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-[#1a1a1a] transition-colors flex-shrink-0"
                >
                  Search
                </button>
              </div>

              {/* Suggestions dropdown */}
              <SuggestionDropdown
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                visible={showSuggestions}
              />
            </div>
          </form>
        </div>
      </div>

      {/* ── Page content ────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

        {!hasSearched ? (
          /* ── Empty state — popular searches ── */
          <div>
            <h2 className="text-base sm:text-lg font-black text-black mb-3 sm:mb-4" style={{ letterSpacing: '-0.02em' }}>
              Popular searches
            </h2>
            <div className="flex flex-wrap gap-2 mb-12">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); setSearchParams({ q: term }); }}
                  className="chip hover:chip-active"
                >
                  <Search size={12} />
                  {term}
                </button>
              ))}
            </div>

            {/* Trending categories */}
            <h2 className="text-base sm:text-lg font-black text-black mb-3 sm:mb-4" style={{ letterSpacing: '-0.02em' }}>
              Browse by service
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {([
                { label: 'Haircut & Styling', Icon: Scissors, color: '#E8F4FF', iconColor: '#403AFA' },
                { label: 'Beard & Shave',     Icon: Wind,     color: '#F0F8FF', iconColor: '#FC5201' },
                { label: 'Hair Coloring',     Icon: Palette,  color: '#FFF0F5', iconColor: '#CC44CC' },
                { label: 'Facial & Skin',     Icon: Sparkles, color: '#F0FFF4', iconColor: '#10B981' },
                { label: 'Spa & Massage',     Icon: Waves,    color: '#FFF8E1', iconColor: '#F59E0B' },
                { label: 'Nail Art',          Icon: Gem,      color: '#FCF0FF', iconColor: '#7B69FF' },
                { label: 'Bridal Makeup',     Icon: Heart,    color: '#FFF0EC', iconColor: '#FA3951' },
                { label: 'Kids Haircut',      Icon: Baby,     color: '#F0FFFC', iconColor: '#06B6D4' },
              ] as { label: string; Icon: React.ElementType; color: string; iconColor: string }[]).map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => { setQuery(cat.label); setSearchParams({ q: cat.label }); }}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left hover:shadow-md transition-all active:scale-[0.97]"
                  style={{ backgroundColor: cat.color }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.iconColor}18` }}>
                    <cat.Icon size={18} style={{ color: cat.iconColor }} strokeWidth={1.8} />
                  </div>
                  <span className="text-sm font-semibold text-black leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

        ) : (
          /* ── Search results ── */
          <div>
            {/* Result summary */}
            <div className="mb-7">
              <p className="text-sm text-[#71717A]">
                <span className="font-bold text-black">{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
                {' '}for{' '}
                <span className="font-semibold text-black">"{searchParams.get('q')}"</span>
              </p>
            </div>

            {totalResults === 0 ? (
              /* No results */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-[#F4F4F5] rounded-full flex items-center justify-center mb-5">
                  <Search size={28} className="text-[#D1D5DB]" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">No results found</h3>
                <p className="text-[#71717A] text-sm mb-6 max-w-xs">
                  We couldn't find anything for "{searchParams.get('q')}". Try a different search.
                </p>
                <button onClick={clearSearch} className="btn-primary">Try again</button>
              </div>
            ) : (
              <div className="space-y-12">

                {/* ── Salon results ── */}
                {results.salons.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-black text-black" style={{ letterSpacing: '-0.02em' }}>
                        Salons
                        <span className="text-sm font-normal text-[#71717A] ml-2">
                          ({results.salons.length})
                        </span>
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {results.salons.map((salon, i) => (
                        <SalonCard
                          key={salon.id}
                          salon={salon}
                          services={getServicesForSalon(salon.id)}
                          index={i}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Service results ── */}
                {results.services.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-black text-black" style={{ letterSpacing: '-0.02em' }}>
                        Services
                        <span className="text-sm font-normal text-[#71717A] ml-2">
                          ({results.services.length})
                        </span>
                      </h2>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[#F4F4F5]" />

                    {/* Service rows */}
                    <div>
                      {results.services.slice(0, 15).map((svc, i) => (
                        <div key={svc.id}>
                          <ServiceResultRow service={svc} index={i} />
                          {i < results.services.slice(0, 15).length - 1 && (
                            <div className="border-t border-[#F4F4F5]" />
                          )}
                        </div>
                      ))}
                    </div>

                    {results.services.length > 15 && (
                      <p className="text-xs text-[#71717A] mt-3 text-center">
                        Showing 15 of {results.services.length} services
                      </p>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-20 lg:h-4" />
      </div>
    </div>
  );
};

export default SearchPage;
