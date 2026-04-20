import { useEffect, useRef, useState } from 'react'
import { Salon } from '../../types'
import { Star, X, Navigation, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

interface SalonMapProps {
  salons: Salon[]
  selectedSalon?: Salon | null
  onSalonSelect?: (salon: Salon | null) => void
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
}

// Define minimal Leaflet types we need
interface LeafletMap {
  remove(): void
  panTo(latlng: [number, number], options?: { animate?: boolean; duration?: number }): void
}

interface LeafletMarker {
  remove(): void
  on(event: string, handler: () => void): LeafletMarker
  addTo(map: LeafletMap): LeafletMarker
}

interface LeafletGlobal {
  map(element: HTMLElement, options?: object): LeafletMap
  tileLayer(url: string, options?: object): { addTo(map: LeafletMap): void }
  marker(latlng: [number, number], options?: object): LeafletMarker
  divIcon(options: object): object
  control: {
    zoom(options?: object): { addTo(map: LeafletMap): void }
    attribution(options?: object): { addAttribution(text: string): { addTo(map: LeafletMap): void } }
  }
}

// Custom marker SVG for teardrop pin with rating
const createMarkerSVG = (rating?: number, isSelected?: boolean) => {
  const bgColor = isSelected ? '#000000' : '#1a1a1a'
  const hasRating = rating && rating > 0
  
  return `
    <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Teardrop shape -->
      <path d="M20 0C8.954 0 0 8.954 0 20c0 11.046 20 32 20 32s20-20.954 20-32C40 8.954 31.046 0 20 0z" fill="${bgColor}" stroke="white" stroke-width="2"/>
      <!-- Inner circle or rating -->
      ${hasRating ? `
        <circle cx="20" cy="18" r="12" fill="white"/>
        <text x="20" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="#1a1a1a" font-family="Inter, system-ui, sans-serif">${rating.toFixed(1)}</text>
      ` : `
        <circle cx="20" cy="18" r="6" fill="white"/>
      `}
    </svg>
  `
}

// Silver/Light map style using free tile providers
const MAP_STYLES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
}

export default function SalonMap({
  salons,
  selectedSalon,
  onSalonSelect,
  center = { lat: 15.1394, lng: 76.9214 }, // India center
  zoom = 14,
  className = ''
}: SalonMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [hoveredSalon, setHoveredSalon] = useState<Salon | null>(null)

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return
      
      // Check if Leaflet is already loaded
      if ((window as unknown as { L?: unknown }).L) {
        setIsMapLoaded(true)
        return
      }

      // Load Leaflet CSS
      const linkEl = document.createElement('link')
      linkEl.rel = 'stylesheet'
      linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(linkEl)

      // Load Leaflet JS
      const scriptEl = document.createElement('script')
      scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      scriptEl.onload = () => setIsMapLoaded(true)
      document.head.appendChild(scriptEl)
    }

    loadLeaflet()
  }, [])

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return

    const L = (window as unknown as { L: LeafletGlobal }).L
    
    // Create map instance
    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
    })

    // Add light/silver style tiles
    L.tileLayer(MAP_STYLES.light, {
      maxZoom: 19,
      attribution: '© OpenStreetMap © CartoDB'
    }).addTo(map)

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Add attribution to bottom-left
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>')
      .addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [isMapLoaded, center.lat, center.lng, zoom])

  // Add markers when salons change
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return

    const L = (window as unknown as { L: LeafletGlobal }).L
    const map = mapInstanceRef.current

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add markers for each salon
    salons.forEach(salon => {
      if (!salon.coordinates?.lat || !salon.coordinates?.lng) return

      const isSelected = selectedSalon?.id === salon.id
      
      // Create custom icon
      const icon = L.divIcon({
        html: createMarkerSVG(salon.rating, isSelected),
        iconSize: [40, 52],
        iconAnchor: [20, 52],
        popupAnchor: [0, -52],
        className: `salon-marker ${isSelected ? 'selected' : ''}`
      })

      const marker = L.marker([salon.coordinates.lat, salon.coordinates.lng], { icon })
        .addTo(map)

      // Click handler
      marker.on('click', () => {
        onSalonSelect?.(salon)
      })

      // Hover handlers
      marker.on('mouseover', () => {
        setHoveredSalon(salon)
      })

      marker.on('mouseout', () => {
        setHoveredSalon(null)
      })

      markersRef.current.push(marker)
    })
  }, [isMapLoaded, salons, selectedSalon, onSalonSelect])

  // Pan to selected salon
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSalon?.coordinates) return
    
    mapInstanceRef.current.panTo(
      [selectedSalon.coordinates.lat, selectedSalon.coordinates.lng],
      { animate: true, duration: 0.5 }
    )
  }, [selectedSalon])

  return (
    <div className={`relative bg-gray-100 ${className}`}>
      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Loading state */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-gray-300 border-t-black rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Loading map...</span>
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredSalon && !selectedSalon && (
        <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none">
          <div className="bg-white rounded-xl shadow-lg p-3 max-w-xs">
            <p className="font-semibold text-black truncate">{hoveredSalon.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{hoveredSalon.rating}</span>
              <span className="text-sm text-gray-400">• {hoveredSalon.address.area}</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected salon card */}
      {selectedSalon && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex">
              {/* Image */}
              <div className="w-28 h-28 flex-shrink-0">
                <img
                  src={selectedSalon.images?.cover || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200'}
                  alt={selectedSalon.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-black truncate">{selectedSalon.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">{selectedSalon.address.area}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSalonSelect?.(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold">{selectedSalon.rating}</span>
                    <span className="text-xs text-gray-400">({selectedSalon.totalReviews})</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full capitalize">{selectedSalon.type}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/salons/${selectedSalon.id}`}
                    className="flex-1 py-2 bg-black text-white text-xs rounded-full font-semibold text-center hover:bg-gray-800 transition-colors"
                  >
                    View Salon
                  </Link>
                  <a
                    href={`tel:${selectedSalon.phone}`}
                    className="w-9 h-9 flex items-center justify-center border-2 border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-gray-600" />
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSalon.coordinates?.lat},${selectedSalon.coordinates?.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center border-2 border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <Navigation className="w-4 h-4 text-gray-600" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open in Maps button */}
      <a
        href={`https://www.google.com/maps/search/salons/@${center.lat},${center.lng},${zoom}z`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white border-2 border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-black shadow-sm hover:border-black transition-colors"
      >
        <Navigation className="w-4 h-4" />
        <span className="hidden sm:inline">Open in Maps</span>
      </a>

      {/* Custom CSS for markers */}
      <style>{`
        .salon-marker {
          background: transparent !important;
          border: none !important;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .salon-marker:hover {
          transform: scale(1.15);
          z-index: 1000 !important;
        }
        .salon-marker.selected {
          z-index: 1001 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #1a1a1a !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f3f4f6 !important;
        }
        .leaflet-control-zoom-in {
          border-radius: 8px 8px 0 0 !important;
        }
        .leaflet-control-zoom-out {
          border-radius: 0 0 8px 8px !important;
        }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.8) !important;
          padding: 2px 6px !important;
          font-size: 10px !important;
          border-radius: 4px !important;
        }
        .leaflet-control-attribution a {
          color: #666 !important;
        }
      `}</style>
    </div>
  )
}
