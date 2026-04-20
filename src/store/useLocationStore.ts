import { create } from 'zustand'
import { POPULAR_CITIES, ALL_CITIES } from '../data/cities'

interface LocationState {
  coordinates: { lat: number; lng: number } | null
  address: string
  area: string
  city: string
  state: string
  pincode: string
  isDetecting: boolean
  error: string | null
  unsupportedLocation: boolean
  suggestedCities: string[]
  
  detectLocation: () => Promise<void>
  setCity: (city: string) => void
  clearLocation: () => void
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

const getInitialLocation = () => {
  if (typeof window === 'undefined') return { city: '', area: '', coordinates: null, address: '', state: '', pincode: '' };
  try {
    const saved = localStorage.getItem('userLocation');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        city: parsed.city || '',
        area: parsed.area || '',
        coordinates: parsed.lat && parsed.lng ? { lat: parsed.lat, lng: parsed.lng } : null,
        address: parsed.address || '',
        state: parsed.state || '',
        pincode: parsed.pincode || ''
      };
    }
  } catch (e) {
    console.error('Failed to parse userLocation from localStorage', e);
  }
  return { city: '', area: '', coordinates: null, address: '', state: '', pincode: '' };
};

const initialLocation = getInitialLocation();

export const useLocationStore = create<LocationState>((set, get) => ({
  ...initialLocation,
  isDetecting: false,
  error: null,
  unsupportedLocation: false,
  suggestedCities: [],

  detectLocation: async () => {
    if (get().isDetecting) return
    
    set({ isDetecting: true, error: null })

    if (!navigator.geolocation) {
      set({ isDetecting: false, error: 'Geolocation not supported by your browser' })
      return
    }

    if (window.isSecureContext === false) {
      // Insecure context (like testing on local network HTTP).
      // Browsers block geolocation APIs without HTTPS or localhost.
      set({ isDetecting: false, error: 'Location requires a secure connection (HTTPS)' })
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        })
      })

      const { latitude: lat, longitude: lng } = position.coords
      
      // Reverse geocode using Nominatim (free, no API key)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
          { 
            headers: { 
              'Accept-Language': 'en',
              'User-Agent': 'MyBOOQED/1.0'
            } 
          }
        )
        
        if (!response.ok) throw new Error('Geocoding failed')
        
        const data = await response.json()
        const addr = data.address || {}
        
        // Extract the most specific area name available
        const area = addr.suburb ||
                     addr.neighbourhood ||
                     addr.hamlet ||
                     addr.village ||
                     addr.town ||
                     addr.city_district ||
                     addr.county ||
                     addr.residential ||
                     addr.road ||
                     ''
        
        // Check if ANY of the location fields match our ALL_CITIES
        const possibleCities = [
          addr.city,
          addr.town,
          addr.district,
          addr.county,
          addr.state_district,
          addr.suburb
        ].filter(Boolean);

        let detectedCity = '';
        let isSupported = false;
        
        for (const pCity of possibleCities) {
          const match = ALL_CITIES.find(c => c.toLowerCase() === pCity.toLowerCase());
          if (match) {
            detectedCity = match;
            isSupported = true;
            break;
          }
        }
        
        let unsupportedLocation = false;
        let suggestedCities: string[] = [];
        
        if (!isSupported) {
          detectedCity = addr.city || addr.town || addr.district || addr.county || '';
          unsupportedLocation = true;
          
          // Calculate closest popular cities using Haversine
          const distances = POPULAR_CITIES.map(cityObj => ({
            name: cityObj.name,
            dist: getDistance(lat, lng, cityObj.lat, cityObj.lng)
          })).sort((a, b) => a.dist - b.dist);
          
          suggestedCities = distances.slice(0, 3).map(d => d.name);
        }
        
        const city = detectedCity;
        
        const state = addr.state || ''
        const pincode = addr.postcode || ''
        
        // Build a readable full address
        const fullAddress = data.display_name || `${area}, ${city}, ${state}`

        set({
          coordinates: { lat, lng },
          address: fullAddress,
          area,
          city,
          state,
          pincode,
          isDetecting: false,
          error: null,
          unsupportedLocation,
          suggestedCities
        })

        // Save to localStorage for persistence
        localStorage.setItem('userLocation', JSON.stringify({ 
          lat, lng, area, city, state, pincode, address: fullAddress 
        }))

      } catch {
        // Geocoding failed but we still have coordinates
        set({
          coordinates: { lat, lng },
          area: '',
          city: '',
          state: '',
          pincode: '',
          isDetecting: false,
          error: null,
          unsupportedLocation: false,
          suggestedCities: []
        })
        localStorage.setItem('userLocation', JSON.stringify({ 
          lat, lng, area: '', city: '', state: '', pincode: '' 
        }))
      }
    } catch (err) {
      const error = err as GeolocationPositionError
      let message = 'Unable to get your location'
      if (error.code === 1) message = 'Location access denied. Please allow location access in your browser settings.'
      if (error.code === 2) message = 'Location unavailable. Please check your GPS settings.'
      if (error.code === 3) message = 'Location request timed out. Please try again.'
      
      set({ isDetecting: false, error: message })
    }
  },

  setCity: (city: string) => {
    set({
      city,
      area: '',
      coordinates: null,
      address: city,
      error: null,
      unsupportedLocation: false,
      suggestedCities: []
    })
    localStorage.setItem('userLocation', JSON.stringify({ 
      lat: null, lng: null, area: '', city, state: '', pincode: '', address: city 
    }))
  },
  
  clearLocation: () => {
    localStorage.removeItem('userLocation')
    set({
      coordinates: null,
      address: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      error: null,
      unsupportedLocation: false,
      suggestedCities: []
    })
  }
}))
