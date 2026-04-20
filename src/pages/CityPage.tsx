import { useState, useEffect, useMemo } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { MapPin, Scissors, ChevronRight, ArrowRight } from 'lucide-react'
import { salonService, categoryService } from '../lib/dataService'
import { Salon } from '../types'
import { SalonCard } from '../components/salon/SalonCard'
import { PageTransition } from '../components/layout/PageTransition'
import { buildNeighborhoodUrl } from '../utils/seo'
import { CITY_NEIGHBORHOODS } from '../data/cityNeighborhoods'

/**
 * Hyper-Local SEO Page
 * Handles city-level, neighborhood-level, and neighborhood+service-level routes.
 * e.g. /salons-in/ballari
 *      /salons-in/ballari/gandhinagar
 *      /salons-in/ballari/gandhinagar/hair-color
 */
export default function CityPage() {
  const { stateSlug, citySlug, areaSlug, businessSlug, serviceSlug } = useParams<{ 
    stateSlug?: string;
    citySlug?: string; 
    areaSlug?: string;
    businessSlug?: string;
    serviceSlug?: string;
  }>()
  
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [nearbyAreas, setNearbyAreas] = useState<string[]>([])

  // Format slugs back to readable names
  const formatSlug = (slug?: string) => 
    slug ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''

  const cityName = formatSlug(citySlug)
  const neighborhoodName = formatSlug(areaSlug || businessSlug)
  const serviceName = formatSlug(serviceSlug)

  useEffect(() => {
    setLoading(true)
    // Fetch all active salons
    const allSalons = salonService.getAll() as unknown as Salon[]
    
    let filtered = allSalons

    // 1. Filter by City
    if (citySlug) {
      const cityFormatted = citySlug.replace(/-/g, ' ').toLowerCase()
      filtered = filtered.filter(s => s.address.city.toLowerCase() === cityFormatted)
      
      // Get all unique areas in this city from data
      const dataAreas = Array.from(new Set(filtered.map(s => s.address.area)))
      
      // Merge with canonical areas if they exist for this city
      let finalAreas = dataAreas
      const metadata = CITY_NEIGHBORHOODS[cityFormatted]
      if (metadata) {
        finalAreas = Array.from(new Set([...dataAreas, ...metadata.neighborhoods])).sort()
      } else {
        finalAreas = dataAreas.sort()
      }
      
      setNearbyAreas(finalAreas)
    }

    // 2. Filter by Neighborhood (Area)
    const activeNeighborhood = areaSlug || businessSlug
    if (activeNeighborhood) {
      const neighborhoodFormatted = activeNeighborhood.replace(/-/g, ' ').toLowerCase()
      filtered = filtered.filter(s => s.address.area.toLowerCase() === neighborhoodFormatted)
    }

    // 3. Filter by Service/Category
    if (serviceSlug) {
      const category = categoryService.getBySlug(serviceSlug)
      if (category) {
        // Find salons that offer services in this category
        filtered = filtered.filter(salon => {
          const salonFull = salonService.getById(salon.id)
          return salonFull?.services.some(s => s.categoryId === category.id)
        })
      }
    }

    setSalons(filtered)
    setLoading(false)
  }, [stateSlug, citySlug, areaSlug, serviceSlug])

  // Redirect legacy 1-segment city URLs (e.g. /salons-in/ballari -> /salons-in/ka/ballari)
  if (stateSlug && !citySlug) {
    const possibleCity = stateSlug.toLowerCase();
    const legacyMetadata = CITY_NEIGHBORHOODS[possibleCity];
    if (legacyMetadata) {
      return <Navigate to={`/salons-in/${legacyMetadata.stateCode}/${possibleCity}`} replace />;
    }
  }

  if (!citySlug) return <Navigate to="/" replace />

  // Dynamic SEO Text
  const getHeaderTitle = () => {
    if (serviceName && neighborhoodName) return `Best ${serviceName} in ${neighborhoodName}, ${cityName}`
    if (neighborhoodName) return `Top Rated Salons in ${neighborhoodName}, ${cityName}`
    return `Best Salons & Spas in ${cityName}`
  }

  const getHeaderDesc = () => {
    if (serviceName && neighborhoodName) {
      return `Looking for ${serviceName.toLowerCase()} specialists in ${neighborhoodName}? We've found the best professionals in your neighborhood for instant booking.`
    }
    if (neighborhoodName) {
      return `Discover the most loved salons and wellness spas right here in ${neighborhoodName}. No more long commutes for your next makeover.`
    }
    return `Discover the top-rated beauty salons, hair stylists, and wellness spas across ${cityName}. Book your appointments instantly with verified professionals.`
  }

  // Helper for conditional class names
  const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ')

  // Derive metadata for enhanced breadcrumbs
  const cityMetadata = useMemo(() => {
    if (!citySlug) return null;
    const formatted = citySlug.replace(/-/g, ' ').toLowerCase();
    return CITY_NEIGHBORHOODS[formatted] || null;
  }, [citySlug]);

  const cityNameDisplay = cityMetadata?.fullName || (citySlug ? formatSlug(citySlug) : '');
  const stateNameDisplay = cityMetadata?.state || '';

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* SEO Header Hero */}
        <div className="bg-white border-b border-gray-100 py-12 sm:py-16">
          <div className="container-app">
            <div className="max-w-4xl">
              {/* Breadcrumbs for SEO interlinking */}
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <Link to="/" className="hover:text-black transition-colors shrink-0">India</Link>
                
                {stateNameDisplay && (
                  <>
                    <ChevronRight size={10} className="shrink-0" />
                    <span className="shrink-0">{stateNameDisplay}</span>
                  </>
                )}

                <ChevronRight size={10} className="shrink-0" />
                <Link to={citySlug ? `/salons-in/${stateSlug}/${citySlug}` : '#'} className="hover:text-black transition-colors shrink-0">
                  {cityNameDisplay}
                </Link>

                {neighborhoodName && (
                  <>
                    <ChevronRight size={10} className="shrink-0" />
                    <Link to={buildNeighborhoodUrl(cityName, neighborhoodName, stateNameDisplay)} className="hover:text-black transition-colors shrink-0">
                      {neighborhoodName}
                    </Link>
                  </>
                )}

                {serviceName && (
                  <>
                    <ChevronRight size={10} className="shrink-0" />
                    <span className="text-[#7C3AED] shrink-0 font-bold">{serviceName}</span>
                  </>
                )}
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-[#7C3AED] rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                <MapPin size={14} />
                <span>Hyper-Local Search</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
                {getHeaderTitle()}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
                {getHeaderDesc()}
              </p>
            </div>
          </div>
        </div>

        {/* Salon Grid */}
        <div className="container-app py-8 sm:py-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-[20px] h-[340px] animate-pulse shadow-sm border border-gray-100" />
              ))}
            </div>
          ) : salons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {salons.map(salon => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 sm:p-20 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scissors className="text-gray-300" size={40} />
              </div>
              <h2 className="text-2xl font-black text-black mb-3">No Results Found</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                We couldn't find any {serviceName ? serviceName.toLowerCase() : 'salons'} in {neighborhoodName || cityName} matching your selection. 
                Try exploring other areas!
              </p>
              <button 
                onClick={() => window.history.back()}
                className="px-8 py-4 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all"
              >
                Go Back
              </button>
            </div>
          )}
        </div>

        {/* Hyper-Local Navigation Area Selector (SEO multipliers) */}
        {!loading && citySlug && nearbyAreas.length > 0 && (
          <div className="bg-[#1a1a1a] text-white py-16 sm:py-24 overflow-hidden relative">
            <div className="container-app">
              <div className="max-w-2xl mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                  <MapPin size={12} />
                  <span>Choose Your Neighborhood</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                  Explore {cityName} Locations
                </h2>
                <p className="text-gray-400 text-lg">
                  Find the community's favorite salons right near you. Select a neighborhood for ultra-local recommendations and verified professional services.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {nearbyAreas.map(area => (
                  <Link
                    key={area}
                    to={buildNeighborhoodUrl(cityName, area)}
                    className={cn(
                      "group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-[#7C3AED]/50 transition-all duration-300",
                      neighborhoodName === area && "bg-[#7C3AED]/20 border-[#7C3AED]/40"
                    )}
                  >
                    <span className="text-sm font-bold truncate">{area}</span>
                    <ArrowRight size={14} className="text-[#7C3AED] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
