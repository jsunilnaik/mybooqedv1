import { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, MapPin, ChevronDown, X, Map, List, Star, Check, Sparkles, TrendingUp, ArrowUpDown } from 'lucide-react'
import { salonService } from '../lib/dataService'
import { Salon } from '../types'
import { SalonCard } from '../components/salon/SalonCard'
import { FilterDropdown } from '../components/ui/FilterDropdown'
import { PageTransition } from '../components/layout/PageTransition'
import OSMSalonMap from '../components/map/OSMSalonMap'
import { cn } from '../lib/utils'
import { useLocationStore } from '../store/useLocationStore'
import { dynamicPricingService } from '../lib/dynamicPricingService'
import { useToast } from '../components/ui/Toast'
import { AIAnalysisOverlay } from '../components/ui/AIAnalysisOverlay'
import { AnimatePresence } from 'framer-motion'

const RATINGS = ['Any', '4.5+', '4.0+', '3.5+']
const SORTS = [
  { value: 'Top Rated', label: 'Top Rated', icon: Star },
  { value: 'Distance', label: 'Nearest to Me', icon: MapPin },
  { value: 'Most Reviewed', label: 'Most Reviewed', icon: TrendingUp },
  { value: 'Name A-Z', label: 'Name A-Z', icon: ArrowUpDown },
  { value: 'Price Low-High', label: 'Price: Low to High', icon: Sparkles },
]
const TYPES = [
  { value: 'All', label: 'All' },
  { value: 'Men', label: 'Men' },
  { value: 'Women', label: 'Women' },
  { value: 'Unisex', label: 'Unisex' },
]

export default function SalonsPage() {
  const navigate = useNavigate()
  const [salons, setSalons] = useState<Salon[]>([])
  const [filtered, setFiltered] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('All')
  const [selectedArea, setSelectedArea] = useState('All Areas')
  const { coordinates, city: globalCity, isDetecting, detectLocation } = useLocationStore()
  const [selectedCity, setSelectedCity] = useState(globalCity || 'All Cities')
  const [selectedRating, setSelectedRating] = useState('Any')
  const [selectedSort, setSelectedSort] = useState('Top Rated')
  const [userMapPosition, setUserMapPosition] = useState<{ lat: number, lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null)
  const [hoveredSalonId, setHoveredSalonId] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mapBounds, setMapBounds] = useState<{ ne: { lat: number, lng: number }, sw: { lat: number, lng: number } } | null>(null)
  const [showSearchButton, setShowSearchButton] = useState(false)
  const [isSearchingInBounds, setIsSearchingInBounds] = useState(false)
  const [onlyAvailableNow, setOnlyAvailableNow] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const toast = useToast()

  // Mobile filter sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetAnimated, setSheetAnimated] = useState(false)

  // Get unique cities from all salons
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(salons.map(s => s.address.city))).sort()
    return ['All Cities', ...uniqueCities]
  }, [salons])

  // Get unique areas based on selected city
  const areas = useMemo(() => {
    let citySalons = salons
    if (selectedCity !== 'All Cities') {
      citySalons = salons.filter(s => s.address.city === selectedCity)
    }
    const uniqueAreas = Array.from(new Set(citySalons.map(s => s.address.area))).sort()
    return ['All Areas', ...uniqueAreas]
  }, [salons, selectedCity])

  // Get current city name for display
  const locationName = useMemo(() => {
    if (selectedArea !== 'All Areas') return `${selectedArea}, ${selectedCity}`
    if (selectedCity !== 'All Cities') return selectedCity
    return 'India'
  }, [selectedCity, selectedArea])

  // Map center logic
  const mapCenter = useMemo(() => {
    if (selectedSalon?.coordinates) return selectedSalon.coordinates
    if (filtered.length > 0 && filtered[0].coordinates) return filtered[0].coordinates
    return { lat: 20.5937, lng: 78.9629 } // Geographic center of India
  }, [filtered, selectedSalon])

  // Location auto-detection disabled as per user request

  useEffect(() => {
    // Only fetch if not currently filtering by bounds (or if bounds search is specifically triggered)
    if (isSearchingInBounds) return;

    // Fetch salons with coordinates (either user location or map center)
    const activeCoords = userMapPosition || coordinates;
    const result = salonService.getAll({
      lat: activeCoords?.lat,
      lng: activeCoords?.lng
    }) as Salon[];
    setSalons(result);
    setLoading(false);
  }, [coordinates, userMapPosition, isSearchingInBounds, refreshKey]);

  const handleSearchThisArea = useCallback(() => {
    if (!mapBounds) return;
    
    setLoading(true);
    setIsSearchingInBounds(true);
    setShowSearchButton(false);
    
    // Slight delay to simulate network/processing
    setTimeout(() => {
      const result = salonService.getAll({
        bounds: mapBounds
      }) as Salon[];
      setSalons(result);
      setLoading(false);
    }, 300);
  }, [mapBounds]);

  const handleBoundsChange = useCallback((bounds: { ne: { lat: number, lng: number }, sw: { lat: number, lng: number } }) => {
    setMapBounds(bounds);
    // Show search button only if we are NOT in the initial load/fitBounds phase
    // For simplicity, we'll show it after the first interaction
    setShowSearchButton(true);
  }, []);

  // Sync global city to local filter when it changes
  useEffect(() => {
    if (globalCity && salons.length > 0) {
      const cityInData = salons.find(s => s.address.city.toLowerCase() === globalCity.toLowerCase())
      if (cityInData) {
        setSelectedCity(cityInData.address.city)
      } else if (globalCity) {
        // If city is set but not in data, we still show the city name if we want, 
        // but normally we should probably just show "All Cities" or a "No salons" state.
        // For now, let's just set it to what the user picked.
        setSelectedCity(globalCity)
      }
    }
  }, [globalCity, salons])

  useEffect(() => {
    let result = [...salons]
    if (selectedType !== 'All') result = result.filter(s => s.type === selectedType.toLowerCase())
    if (selectedCity !== 'All Cities') result = result.filter(s => s.address.city === selectedCity)
    if (selectedArea !== 'All Areas') result = result.filter(s => s.address.area === selectedArea)
    if (selectedRating !== 'Any') {
      const min = parseFloat(selectedRating.replace('+', ''))
      result = result.filter(s => s.rating >= min)
    }
    if (onlyAvailableNow) {
      result = result.filter(s => s.hasImmediateSlots)
    }
    if (searchQuery) result = result.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.area.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (selectedSort === 'Top Rated') result.sort((a, b) => b.rating - a.rating)
    else if (selectedSort === 'Distance' && (result[0] as any).distance !== undefined) {
      result.sort((a, b) => (a as any).distance - (b as any).distance)
    }
    else if (selectedSort === 'Most Reviewed') result.sort((a, b) => b.totalReviews - a.totalReviews)
    else if (selectedSort === 'Name A-Z') result.sort((a, b) => a.name.localeCompare(b.name))
    setFiltered(result)
  }, [salons, selectedType, selectedCity, selectedArea, selectedRating, selectedSort, searchQuery, onlyAvailableNow, refreshKey])

  const activeCount = [
    selectedArea !== 'All Areas',
    selectedRating !== 'Any',
    selectedSort !== 'Top Rated',
    onlyAvailableNow,
  ].filter(Boolean).length

  const clearAll = useCallback(() => {
    setSelectedType('All')
    setSelectedCity('All Cities')
    setSelectedArea('All Areas')
    setSelectedRating('Any')
    setSelectedSort('Top Rated')
    setOnlyAvailableNow(false)
    setSearchQuery('')
    setOpenDropdown(null)
  }, [])

  const handleRunOptimizer = async () => {
    if (filtered.length === 0) return;
    
    // For demo, we run it for the first salon in the list
    const targetSalon = filtered[0];
    
    setIsAnalysisModalOpen(true);
    setIsOptimizing(true);
    setAnalysisResult(null);
    
    const result = await dynamicPricingService.runOptimizationCycle(targetSalon.id);
    
    // Give minimum time for initial scan animation to show before results
    setTimeout(() => {
      setIsOptimizing(false);
      if (result.success) {
        setAnalysisResult(result);
        setSalons(salonService.getAll() as Salon[]);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error("Analysis failed. Model check recommended.");
        setIsAnalysisModalOpen(false);
      }
    }, 4000); // Wait for scanning experience
  };

  const openSheet = useCallback(() => {
    setSheetOpen(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSheetAnimated(true)
      })
    })
  }, [])

  const closeSheet = useCallback(() => {
    setSheetAnimated(false)
    setTimeout(() => setSheetOpen(false), 350)
  }, [])

  // Mobile filter sheet rendered via Portal to escape all parent containers
  const mobileSheet = sheetOpen ? createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={closeSheet}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999990,
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: sheetAnimated ? 1 : 0,
          transition: 'opacity 0.3s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
      />

      {/* Sheet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
          transform: sheetAnimated ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px', flexShrink: 0 }}>
          <div style={{ width: '36px', height: '4px', backgroundColor: '#D1D5DB', borderRadius: '9999px' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#000', margin: 0 }}>Filters</h3>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '2px 0 0' }}>{filtered.length} salons found</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                style={{ fontSize: '14px', color: '#EF4444', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}
              >
                Reset
              </button>
            )}
            <button
              onClick={closeSheet}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F3F4F6',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              <X size={18} color="#374151" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#F3F4F6' }} />

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' as const }}>

          {/* Slot Spotter - Live Urgent Feature */}
          <div style={{ padding: '20px 20px 8px' }}>
            <button
              onClick={() => setOnlyAvailableNow(!onlyAvailableNow)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: onlyAvailableNow ? '#F0FDF4' : '#F9FAFB',
                border: onlyAvailableNow ? '2px solid #22C55E' : '2px solid #F3F4F6',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: onlyAvailableNow ? '#22C55E' : '#E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}>
                  <TrendingUp size={20} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>Slot Spotter</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Find immediate availability</p>
                </div>
              </div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                opacity: onlyAvailableNow ? 1 : 0.3,
                boxShadow: onlyAvailableNow ? '0 0 10px rgba(34, 197, 94, 0.6)' : 'none',
              }} className={onlyAvailableNow ? 'animate-pulse' : ''} />
            </button>
          </div>

          {/* AI Revenue Optimizer - Mobile */}
          <div style={{ padding: '8px 20px 8px' }}>
            <button
              onClick={handleRunOptimizer}
              disabled={isOptimizing}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: '#FAF5FF',
                border: '2px solid #E9D5FF',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                opacity: isOptimizing ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#9333EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}>
                  <Sparkles size={20} className={isOptimizing ? 'animate-spin' : 'animate-bounce'} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#7E22CE' }}>
                    {isOptimizing ? 'AI Analyzing...' : 'Magic AI Optimizer'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#A855F7' }}>AI-driven Happy Hour discounts</p>
                </div>
              </div>
              <ChevronDown size={18} color="#7E22CE" style={{ transform: 'rotate(-90deg)' }} />
            </button>
          </div>
          <div style={{ padding: '20px 20px 16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Salon Type</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: selectedType === t.value ? '2px solid #000' : '2px solid #E5E7EB',
                    backgroundColor: selectedType === t.value ? '#000' : '#fff',
                    color: selectedType === t.value ? '#fff' : '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div style={{ padding: '20px 20px 16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>City</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {cities.map(c => (
                <button
                  key={c}
                  onClick={() => { setSelectedCity(c); setSelectedArea('All Areas') }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '20px',
                    border: selectedCity === c ? '2px solid #000' : '1.5px solid #E5E7EB',
                    backgroundColor: selectedCity === c ? '#000' : '#fff',
                    color: selectedCity === c ? '#fff' : '#374151',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c === 'All Cities' ? 'All Cities' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Area */}
          <div style={{ padding: '4px 20px 16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Area</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {areas.map(a => (
                <button
                  key={a}
                  onClick={() => setSelectedArea(a)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '20px',
                    border: selectedArea === a ? '2px solid #000' : '1.5px solid #E5E7EB',
                    backgroundColor: selectedArea === a ? '#000' : '#fff',
                    color: selectedArea === a ? '#fff' : '#374151',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {a === 'All Areas' ? 'All' : a}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div style={{ padding: '4px 20px 16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Minimum Rating</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {RATINGS.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRating(r)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '20px',
                    border: selectedRating === r ? '2px solid #000' : '1.5px solid #E5E7EB',
                    backgroundColor: selectedRating === r ? '#000' : '#fff',
                    color: selectedRating === r ? '#fff' : '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {r !== 'Any' && <Star size={14} fill="#FBBF24" color="#FBBF24" />}
                  {r === 'Any' ? 'Any' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div style={{ padding: '4px 20px 20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Sort By</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {SORTS.map(s => {
                const SIcon = s.icon;
                const active = selectedSort === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setSelectedSort(s.value)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '12px',
                      border: active ? '2px solid #000' : '2px solid #E5E7EB',
                      backgroundColor: active ? '#000' : '#fff',
                      color: active ? '#fff' : '#374151',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      touchAction: 'manipulation',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <SIcon size={16} />
                    <span style={{ flex: 1 }}>{s.label}</span>
                    {active && (
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={10} color="#000" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            borderTop: '1px solid #F3F4F6',
            backgroundColor: '#fff',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              style={{
                padding: '14px 24px',
                borderRadius: '14px',
                border: '1.5px solid #E5E7EB',
                backgroundColor: '#fff',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                touchAction: 'manipulation',
                whiteSpace: 'nowrap',
              }}
            >
              Clear all
            </button>
          )}
          <button
            onClick={closeSheet}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: '#000',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            Show {filtered.length} {filtered.length === 1 ? 'salon' : 'salons'}
          </button>
        </div>
      </div>
    </>,
    document.body
  ) : null

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F7F9FA]">

        {/* STICKY FILTER BAR */}
        <div className="sticky top-[52px] sm:top-[64px] z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

            <div className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3">

              {/* Search */}
              <div className="flex-1 lg:flex-initial lg:w-64 xl:w-80 min-w-0 flex items-center gap-2 bg-gray-50 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 focus-within:border-black focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search salons..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-sm outline-none text-black placeholder:text-gray-400"
                />
                <button 
                  onClick={() => detectLocation()} 
                  disabled={isDetecting}
                  className={cn(
                    "p-1.5 rounded-full hover:bg-gray-200 transition-colors hidden sm:flex",
                    isDetecting && "animate-pulse"
                  )}
                  title="Use current location"
                >
                  <MapPin className={cn("w-4 h-4", coordinates ? "text-black" : "text-gray-400")} />
                </button>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="flex-shrink-0 p-0.5">
                    <X className="w-4 h-4 text-gray-400 hover:text-black" />
                  </button>
                )}
              </div>

              {/* MOBILE: AI Optimizer Button */}
              <button
                onClick={handleRunOptimizer}
                disabled={isOptimizing}
                className={cn(
                  "flex lg:hidden items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-full border-2 transition-all shadow-md flex-shrink-0",
                  "bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400",
                  isOptimizing && "animate-pulse"
                )}
              >
                <Sparkles className={cn("w-5 h-5", isOptimizing ? "animate-spin" : "animate-bounce")} />
              </button>

              {/* MOBILE: Filter Button */}
              <button
                type="button"
                onClick={openSheet}
                className="flex lg:hidden items-center justify-center gap-1.5 sm:gap-2 w-10 h-10 sm:w-auto sm:h-11 sm:px-5 rounded-full bg-black text-white text-[13px] sm:text-sm font-semibold shadow-md flex-shrink-0 relative"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeCount > 0 && (
                  <span className="absolute sm:static -top-1 -right-1 sm:top-auto sm:right-auto bg-white text-black text-xs rounded-full min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 flex items-center justify-center px-1 font-bold shadow-sm sm:shadow-none border border-black sm:border-none">
                    {activeCount}
                  </span>
                )}
              </button>

              {/* DESKTOP: Filter Row */}
              <div className="hidden lg:flex items-center gap-3 flex-1 min-w-0">
                {/* Scrollable Filters Row — Portals allow dropdowns to break out */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 flex-1">


                <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                  {TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        selectedType === type.value
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-black hover:bg-white'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Slot Spotter Desktop */}
                <button
                    onClick={() => setOnlyAvailableNow(!onlyAvailableNow)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all h-10 whitespace-nowrap flex-shrink-0",
                      onlyAvailableNow 
                        ? "bg-green-50 border-green-500 text-green-700 shadow-sm font-bold" 
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                    )}
                  >
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      onlyAvailableNow ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-300"
                    )} />
                    <span className="text-sm">Slot Spotter</span>
                  </button>

                  <button
                    onClick={handleRunOptimizer}
                    disabled={isOptimizing}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all h-10 whitespace-nowrap flex-shrink-0",
                      "bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400 font-bold",
                      isOptimizing && "animate-pulse opacity-70"
                    )}
                  >
                    <Sparkles className={cn("w-4 h-4", isOptimizing ? "animate-spin" : "animate-bounce")} />
                    <span className="text-sm">{isOptimizing ? 'Optimizing...' : 'AI Optimizer'}</span>
                  </button>

                  {/* Desktop Dropdowns merged into the scrollable row */}
                  {/* City dropdown */}
                  <FilterDropdown
                    label={selectedCity === 'All Cities' ? 'City' : selectedCity}
                    icon={<MapPin className="w-4 h-4" />}
                    isActive={selectedCity !== 'All Cities'}
                    isOpen={openDropdown === 'city'}
                    onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
                    onClose={() => setOpenDropdown(null)}
                    menuClassName="min-w-[200px]"
                  >
                    {cities.map(city => (
                      <button
                        key={city}
                        onClick={() => { setSelectedCity(city); setSelectedArea('All Areas'); setOpenDropdown(null) }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                          selectedCity === city ? 'font-semibold text-black bg-gray-50' : 'text-gray-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedCity === city ? 'border-black bg-black' : 'border-gray-300'
                        }`}>
                          {selectedCity === city && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {city}
                      </button>
                    ))}
                  </FilterDropdown>

                  {/* Area dropdown */}
                  <FilterDropdown
                    label={selectedArea === 'All Areas' ? 'Area' : selectedArea}
                    icon={<MapPin className="w-4 h-4" />}
                    isActive={selectedArea !== 'All Areas'}
                    isOpen={openDropdown === 'area'}
                    onClick={() => setOpenDropdown(openDropdown === 'area' ? null : 'area')}
                    onClose={() => setOpenDropdown(null)}
                    menuClassName="min-w-[240px] max-h-[320px] overflow-y-auto"
                  >
                    {areas.map(area => (
                      <button
                        key={area}
                        onClick={() => { setSelectedArea(area); setOpenDropdown(null) }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                          selectedArea === area ? 'font-semibold text-black bg-gray-50' : 'text-gray-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedArea === area ? 'border-black bg-black' : 'border-gray-300'
                        }`}>
                          {selectedArea === area && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {area}
                      </button>
                    ))}
                  </FilterDropdown>

                  {/* Rating dropdown */}
                  <FilterDropdown
                    label={selectedRating === 'Any' ? 'Rating' : selectedRating}
                    icon={<Star className="w-4 h-4" />}
                    isActive={selectedRating !== 'Any'}
                    isOpen={openDropdown === 'rating'}
                    onClick={() => setOpenDropdown(openDropdown === 'rating' ? null : 'rating')}
                    onClose={() => setOpenDropdown(null)}
                    menuClassName="min-w-[180px]"
                  >
                    {RATINGS.map(r => (
                      <button
                        key={r}
                        onClick={() => { setSelectedRating(r); setOpenDropdown(null) }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                          selectedRating === r ? 'font-semibold text-black bg-gray-50' : 'text-gray-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedRating === r ? 'border-black bg-black' : 'border-gray-300'
                        }`}>
                          {selectedRating === r && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="flex items-center gap-1">
                          {r !== 'Any' && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                          {r === 'Any' ? 'Any Rating' : r}
                        </span>
                      </button>
                    ))}
                  </FilterDropdown>

                  {/* Sort dropdown */}
                  <FilterDropdown
                    label={selectedSort}
                    isActive={selectedSort !== 'Top Rated'}
                    isOpen={openDropdown === 'sort'}
                    onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                    onClose={() => setOpenDropdown(null)}
                    menuClassName="min-w-[200px]"
                    align="right"
                  >
                    {SORTS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => { setSelectedSort(s.value); setOpenDropdown(null) }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                          selectedSort === s.value ? 'font-semibold text-black bg-gray-50' : 'text-gray-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedSort === s.value ? 'border-black bg-black' : 'border-gray-300'
                        }`}>
                          {selectedSort === s.value && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {s.label}
                      </button>
                    ))}
                  </FilterDropdown>

                  {activeCount > 0 && (
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-red-600 border-2 border-red-200 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

            {/* Map / List toggle — always labeled on desktop */}
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 w-10 h-10 sm:w-auto sm:h-11 sm:px-4 rounded-full border-2 border-gray-900 text-[13px] sm:text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-colors flex-shrink-0 bg-white"
              >
                {showMap ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />}
                <span className="hidden sm:inline">{showMap ? 'List' : 'Map'}</span>
              </button>
            </div>

            {/* Results count + active tags */}
            <div className="flex items-center gap-2 sm:gap-3 pb-2.5 sm:pb-3">
            <p className="text-sm text-gray-600 flex-shrink-0">
              <span className="font-bold text-black">{filtered.length}</span> {filtered.length === 1 ? 'salon' : 'salons'} 
              {searchQuery ? ` matching "${searchQuery}"` : ` in ${locationName}`}
            </p>
              {activeCount > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {selectedType !== 'All' && (
                    <span className="flex items-center gap-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                      {selectedType}
                      <button onClick={() => setSelectedType('All')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {selectedCity !== 'All Cities' && (
                    <span className="flex items-center gap-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                      {selectedCity}
                      <button onClick={() => { setSelectedCity('All Cities'); setSelectedArea('All Areas') }}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {selectedArea !== 'All Areas' && (
                    <span className="flex items-center gap-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                      {selectedArea}
                      <button onClick={() => setSelectedArea('All Areas')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {selectedRating !== 'Any' && (
                    <span className="flex items-center gap-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                      {selectedRating}
                      <button onClick={() => setSelectedRating('Any')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumbs */}
          <div className="px-4 sm:px-6 py-3 flex items-center text-[11px] sm:text-xs font-medium text-[#71717A] overflow-x-auto scrollbar-hide">
            <button onClick={() => navigate('/')} className="hover:text-black transition-colors flex-shrink-0">Home</button>
            <span className="mx-2 text-[#D1D5DB] flex-shrink-0">·</span>
            <span className={cn("flex-shrink-0", selectedCity === 'All Cities' ? "text-black font-bold" : "text-gray-500")}>Salons</span>
            {selectedCity !== 'All Cities' && (
              <>
                <span className="mx-2 text-[#D1D5DB] flex-shrink-0">·</span>
                <span className="text-black font-bold flex-shrink-0">{selectedCity}</span>
              </>
            )}
          </div>
          <div className={`flex flex-col lg:flex-row ${showMap ? 'h-[calc(100dvh-140px-56px)] lg:h-auto' : ''}`}>
            {/* List View */}
            <div className={cn(
              "flex-1 min-w-0 transition-all duration-300",
              showMap ? "hidden lg:block lg:w-[58%] lg:max-w-[58%]" : "w-full"
            )}>
              <div className="p-3 sm:p-6 pb-24 sm:pb-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                        <div className="aspect-video bg-gray-200" />
                        <div className="p-4 space-y-3">
                          <div className="h-5 bg-gray-200 rounded-full w-3/4" />
                          <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                          <div className="h-4 bg-gray-100 rounded-full w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                      <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2">No salons found</h3>
                    <p className="text-gray-500 mb-6 max-w-xs">Try adjusting your filters or search for something else</p>
                    <button onClick={clearAll} className="px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6",
                    !showMap && "lg:grid-cols-3 xl:grid-cols-4"
                  )}>
                    {filtered.map(salon => (
                      <div 
                        key={salon.id} 
                        onClick={() => setSelectedSalon(salon)} 
                        onMouseEnter={() => setHoveredSalonId(salon.id)}
                        onMouseLeave={() => setHoveredSalonId(null)}
                        className="cursor-pointer"
                      >
                        <SalonCard 
                          salon={salon} 
                          isHovered={hoveredSalonId === salon.id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Map View — sticky on desktop: stays in view while list scrolls */}
            {showMap && (
              <div className="
                w-full lg:w-[42%] lg:max-w-[42%] flex-shrink-0
                h-full lg:h-auto
                relative
                lg:sticky lg:top-[128px] lg:self-start
              ">
                <div className="
                  h-[calc(100dvh-280px)] sm:h-[calc(100dvh-240px)]
                  lg:h-[calc(100vh-210px)]
                  rounded-2xl overflow-hidden
                  m-4 lg:ml-0 lg:mr-6 lg:mt-0
                  border border-gray-200 shadow-sm
                  transition-all duration-300
                " style={{ zIndex: 1 }}>
                  <OSMSalonMap
                    salons={filtered}
                    selectedSalon={selectedSalon}
                    onSalonSelect={setSelectedSalon}
                    hoveredSalonId={hoveredSalonId}
                    onSalonHover={setHoveredSalonId}
                    center={mapCenter}
                    onMapMove={setUserMapPosition}
                    zoom={14}
                    onBoundsChange={handleBoundsChange}
                    className="rounded-none sm:rounded-2xl"
                  />
                  
                  {/* Floating Search This Area Button */}
                  {showSearchButton && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                      <button
                        onClick={handleSearchThisArea}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-xl hover:bg-gray-800 transition-all active:scale-95 animate-fadeIn"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold whitespace-nowrap">Search this area</span>
                      </button>
                    </div>
                  )}

                  {/* Clear Bounds Search Button */}
                  {isSearchingInBounds && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                      <button
                        onClick={() => {
                          setIsSearchingInBounds(false);
                          setShowSearchButton(false);
                          setOnlyAvailableNow(false);
                        }}
                        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-black border border-gray-200 px-3 py-1.5 rounded-full shadow-lg hover:bg-white transition-all text-[10px] font-bold"
                      >
                        <X className="w-3 h-3" />
                        Reset map search
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render mobile filter sheet via Portal */}
      {mobileSheet}

      {createPortal(
        <AnimatePresence>
          {isAnalysisModalOpen && (
            <AIAnalysisOverlay
              isOpen={isAnalysisModalOpen}
              onClose={() => setIsAnalysisModalOpen(false)}
              salonName={filtered[0]?.name || "Target Salon"}
              isProcessing={isOptimizing}
              result={analysisResult}
              onConfirm={() => setIsAnalysisModalOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </PageTransition>
  )
}
