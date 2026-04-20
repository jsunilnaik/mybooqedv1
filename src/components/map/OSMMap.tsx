import { useEffect, useRef } from 'react';

interface OSMMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  height?: string;
  name?: string;
  address?: string;
  className?: string;
}

export default function OSMMap({
  lat,
  lng,
  zoom = 16,
  height = '250px',
  name = 'Location',
  address = '',
  className = ''
}: OSMMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = (): Promise<void> => {
      return new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).L) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      await loadLeaflet();

      // Wait for DOM
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mapRef.current) return;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L) return;

      // Cleanup previous map
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }

      // Create map
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: true,
        attributionControl: true
      });

      // Use CartoDB Positron (light/silver theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      // Custom black marker icon
      const blackIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: #000;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 14px;
              height: 14px;
              background: #fff;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      // Add marker
      const marker = L.marker([lat, lng], { icon: blackIcon }).addTo(map);

      // Popup content
      if (name || address) {
        const popupContent = `
          <div style="font-family: Inter, sans-serif; min-width: 150px;">
            <div style="font-weight: 600; font-size: 13px; color: #000; margin-bottom: 4px;">${name}</div>
            ${address ? `<div style="font-size: 11px; color: #71717A;">${address}</div>` : ''}
          </div>
        `;
        marker.bindPopup(popupContent, {
          closeButton: false,
          offset: [0, -5]
        });
      }

      mapInstanceRef.current = map;

      // Fix map sizing issues
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom, name, address]);

  return (
    <div className={`relative z-0 ${className}`} style={{ height, minHeight: height }}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ height: '100%', minHeight: height, zIndex: 0 }}
      />
      
      {/* Get Directions button */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-2 text-xs font-semibold text-black shadow-md hover:bg-gray-50 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11l19-9-9 19-2-8-8-2z"/>
        </svg>
        Directions
      </a>
    </div>
  );
}
