import { useEffect, useRef, useState } from 'react';
import { Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Salon } from '../../types';

interface OSMSalonMapProps {
  salons: Salon[];
  selectedSalon?: Salon | null;
  onSalonSelect?: (salon: Salon | null) => void;
  hoveredSalonId?: string | null;
  onSalonHover?: (id: string | null) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapMove?: (center: { lat: number; lng: number }) => void;
  onBoundsChange?: (bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => void;
  className?: string;
}

// Helper to build marker HTML — extracted so it's reusable without closures
function buildMarkerHtml(rating: string, isSelected: boolean, isHovered: boolean, isLive: boolean = false) {
  const size = isHovered ? 48 : isSelected ? 44 : 38;
  const bg = isHovered ? '#3B82F6' : isLive ? '#22c55e' : '#000';
  const border = isHovered
    ? '2px solid #fff'
    : isSelected
    ? '3px solid #3B82F6'
    : isLive
    ? '2px solid #fff'
    : '2px solid #fff';
  const shadow = isHovered
    ? '0 5px 15px rgba(59,130,246,0.5)'
    : isLive
    ? '0 0 15px rgba(34,197,94,0.6)'
    : '0 3px 10px rgba(0,0,0,0.3)';
  const scale = isHovered ? 'scale(1.3)' : isSelected ? 'scale(1.15)' : 'scale(1)';
  const fw = isHovered ? '800' : '700';
  const pulseClass = isLive && !isHovered && !isSelected ? 'marker-pulse' : '';

  return `
    <div class="${pulseClass}" style="position:relative;cursor:pointer;transform:${scale};transition:transform 0.2s ease;">
      <div style="width:${size}px;height:${size}px;background:${bg};border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:${shadow};border:${border};">
        <div style="transform:rotate(45deg);color:#fff;font-size:11px;font-weight:${fw};font-family:Inter,sans-serif;">${rating}</div>
      </div>
      ${isLive ? `
        <div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;background:#22c55e;border:2px solid #fff;border-radius:50%;z-index:20;"></div>
      ` : ''}
    </div>
  `;
}

export default function OSMSalonMap({
  salons,
  selectedSalon,
  onSalonSelect,
  hoveredSalonId,
  onSalonHover,
  center = { lat: 15.1394, lng: 76.9214 },
  zoom = 13,
  onMapMove,
  onBoundsChange,
  className = ''
}: OSMSalonMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const hoveredMarkerRef = useRef<string | null>(null);
  const moveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInternalMove = useRef(false);
  const initializedRef = useRef(false);

  // Keep stable refs to callbacks so the map init effect never needs to re-run
  const onSalonSelectRef = useRef(onSalonSelect);
  const onSalonHoverRef = useRef(onSalonHover);
  const onMapMoveRef = useRef(onMapMove);
  const onBoundsChangeRef = useRef(onBoundsChange);
  useEffect(() => { onSalonSelectRef.current = onSalonSelect; }, [onSalonSelect]);
  useEffect(() => { onSalonHoverRef.current = onSalonHover; }, [onSalonHover]);
  useEffect(() => { onMapMoveRef.current = onMapMove; }, [onMapMove]);
  useEffect(() => { onBoundsChangeRef.current = onBoundsChange; }, [onBoundsChange]);

  const [showCard, setShowCard] = useState<Salon | null>(null);

  // ── EFFECT 1: Initialize the map ONCE ──────────────────────────────────────
  // Depends only on the container ref. Never re-runs.
  useEffect(() => {
    if (!mapRef.current || initializedRef.current) return;

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeaflet = (): Promise<void> =>
      new Promise((resolve) => {
        if ((window as any).L) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    const initMap = async () => {
      await loadLeaflet();
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!mapRef.current) return;

      const L = (window as any).L;
      if (!L) return;

      // FIXED: Prevention of "Map container is already initialized" error
      if ((mapRef.current as any)._leaflet_id) {
          console.warn("[OSMSalonMap] Leaflet map already initialized on this DOM element. Skipping second init.");
          initializedRef.current = true;
          return;
      }

      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        tap: true,
        keyboard: true,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      initializedRef.current = true;

      setTimeout(() => { map.invalidateSize(); }, 200);

      // moveend — debounced, fires onMapMove without triggering re-init
      map.on('moveend', () => {
        if (isInternalMove.current) { isInternalMove.current = false; return; }
        if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current);
        moveDebounceRef.current = setTimeout(() => {
          const c = map.getCenter();
          onMapMoveRef.current?.({ lat: c.lat, lng: c.lng });
          
          const b = map.getBounds();
          const ne = b.getNorthEast();
          const sw = b.getSouthWest();
          onBoundsChangeRef.current?.({
            ne: { lat: ne.lat, lng: ne.lng },
            sw: { lat: sw.lat, lng: sw.lng }
          });
        }, 500);
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        initializedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← empty: runs only once

  // ── EFFECT 2: Sync markers whenever `salons` or `selectedSalon` changes ───
  // Does NOT destroy/recreate the map — only removes/adds markers.
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing markers
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};
    hoveredMarkerRef.current = null;

    // Add fresh markers
    salons.forEach((salon) => {
      if (!salon.coordinates) return;
      const isSelected = selectedSalon?.id === salon.id;
      const rating = salon.rating?.toFixed(1) || '4.5';

      const icon = L.divIcon({
        className: 'custom-salon-marker',
        html: buildMarkerHtml(rating, isSelected, false, salon.hasImmediateSlots),
        iconSize: [48, 48],
        iconAnchor: [24, 48],
      });

      const marker = L.marker([salon.coordinates.lat, salon.coordinates.lng], { icon });

      marker.on('click', () => {
        setShowCard(salon);
        onSalonSelectRef.current?.(salon);
        isInternalMove.current = true;
        map.panTo([salon.coordinates.lat, salon.coordinates.lng], { animate: true });
      });
      marker.on('mouseover', () => { onSalonHoverRef.current?.(salon.id); });
      marker.on('mouseout', () => { onSalonHoverRef.current?.(null); });

      marker.addTo(map);
      markersRef.current[salon.id] = marker;
    });

    // Fit bounds on initial load only (when no user pan has happened)
    if (salons.length > 0 && !isInternalMove.current) {
      try {
        const bounds = L.latLngBounds(
          salons
            .filter(s => s.coordinates)
            .map(s => [s.coordinates.lat, s.coordinates.lng])
        );
        if (bounds.isValid()) {
          isInternalMove.current = true;
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      } catch {
        // ignore
      }
    }
  }, [salons, selectedSalon]); // ← NO zoom, center, or callbacks — map stays alive

  // ── EFFECT 3: Hover highlight — cheap icon swap, no map teardown ───────────
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;

    // Reset previous hover
    if (hoveredMarkerRef.current && markersRef.current[hoveredMarkerRef.current]) {
      const prevId = hoveredMarkerRef.current;
      const prevSalon = salons.find(s => s.id === prevId);
      if (prevSalon) {
        const isSelected = selectedSalon?.id === prevId;
        const icon = L.divIcon({
          className: 'custom-salon-marker',
          html: buildMarkerHtml(prevSalon.rating?.toFixed(1) || '4.5', isSelected, false, prevSalon.hasImmediateSlots),
          iconSize: [48, 48],
          iconAnchor: [24, 48],
        });
        markersRef.current[prevId].setIcon(icon);
        markersRef.current[prevId].setZIndexOffset(isSelected ? 1000 : 0);
      }
    }

    // Apply new hover
    if (hoveredSalonId && markersRef.current[hoveredSalonId]) {
      const salon = salons.find(s => s.id === hoveredSalonId);
      if (salon) {
        const icon = L.divIcon({
          className: 'custom-salon-marker-hovered',
          html: buildMarkerHtml(salon.rating?.toFixed(1) || '4.5', false, true, salon.hasImmediateSlots),
          iconSize: [48, 48],
          iconAnchor: [24, 48],
        });
        markersRef.current[hoveredSalonId].setIcon(icon);
        markersRef.current[hoveredSalonId].setZIndexOffset(2000);
      }
    }

    hoveredMarkerRef.current = hoveredSalonId || null;
  }, [hoveredSalonId, salons, selectedSalon]);

  return (
    <div className={`relative w-full h-full z-0 ${className}`}>
      <style>{`
        @keyframes marker-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .marker-pulse::before {
          content: '';
          position: absolute;
          inset: -6px;
          background: rgba(34, 197, 94, 0.4);
          border-radius: 50%;
          animation: marker-pulse 2s infinite ease-in-out;
          z-index: -1;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0 }} />

      {/* Salon info card */}
      {showCard && (
        <div
          className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-10 max-w-md mx-auto"
          style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))' }}
        >
          <div className="bg-white rounded-2xl overflow-hidden">
            <button
              onClick={() => { setShowCard(null); onSalonSelectRef.current?.(null); }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black transition-colors z-20"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="relative h-32 w-full">
              <img
                src={showCard.images?.cover || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=200&fit=crop'}
                alt={showCard.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {showCard.type}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-12">
                <h3 className="font-bold text-white text-lg leading-tight truncate">{showCard.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800]" />
                    <span className="text-sm font-bold text-white">{showCard.rating}</span>
                  </div>
                  <span className="text-white/70 text-xs">({showCard.totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-[#71717A]">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{showCard.address?.area}, {showCard.address?.city || 'India'}</span>
              </div>

              {showCard.startingPrice && (
                <p className="text-xs text-[#71717A] mt-2">
                  Services from <span className="font-semibold text-black">₹{showCard.startingPrice}</span>
                </p>
              )}

              <Link
                to={`/salons/${showCard.slug}`}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-black text-white font-semibold py-3 rounded-xl text-sm hover:bg-gray-900 transition-colors"
              >
                View Salon
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-1 left-1 text-[9px] text-gray-400 bg-white/80 px-1 rounded">
        © OpenStreetMap © CARTO
      </div>
    </div>
  );
}
