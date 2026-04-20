import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { searchService, salonService } from '../lib/dataService';

export interface SearchSuggestion {
  id: string;
  name: string;
  type: 'salon' | 'service';
  subtitle: string;
  distance?: number;
}

export interface SearchResult {
  salons: Array<{
    id: string;
    name: string;
    slug: string;
    rating: number;
    totalReviews: number;
    type: string;
    address: { area: string; city: string };
    images?: { cover?: string };
    distance?: number;
  }>;
  services: Array<{
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    duration: number;
    salonId: string;
    salonName?: string;
  }>;
}

interface SearchState {
  query: string;
  suggestions: SearchSuggestion[];
  results: SearchResult | null;
  recentSearches: string[];
  isSearching: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  getSuggestions: (query: string, coords?: { lat: number; lng: number } | null) => void;
  search: (query: string, coords?: { lat: number; lng: number } | null) => void;
  addToRecent: (query: string) => void;
  removeFromRecent: (query: string) => void;
  clearRecent: () => void;
  clearResults: () => void;
}

// Haversine distance calculation
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      suggestions: [],
      results: null,
      recentSearches: [],
      isSearching: false,

      setQuery: (query: string) => {
        set({ query });
      },

      getSuggestions: (query: string, coords?: { lat: number; lng: number } | null) => {
        if (!query || query.length < 2) {
          set({ suggestions: [] });
          return;
        }

        const rawSuggestions = searchService.getSuggestions(query) as SearchSuggestion[];
        
        // Add distance if coordinates available
        if (coords) {
          const allSalons = salonService.getAll({ limit: 100 }).data;
          const suggestionsWithDistance = rawSuggestions.map(s => {
            if (s.type === 'salon') {
              const salon = allSalons.find(sal => sal.id === s.id);
              if (salon?.coordinates) {
                const dist = getDistanceKm(
                  coords.lat, coords.lng,
                  salon.coordinates.lat, salon.coordinates.lng
                );
                return { ...s, distance: Math.round(dist * 10) / 10 };
              }
            }
            return s;
          });
          set({ suggestions: suggestionsWithDistance });
        } else {
          set({ suggestions: rawSuggestions });
        }
      },

      search: (query: string, coords?: { lat: number; lng: number } | null) => {
        if (!query.trim()) {
          set({ results: null });
          return;
        }

        set({ isSearching: true });

        const searchResults = searchService.search({ q: query });
        
        // Add distance to salons if coordinates available
        if (coords && searchResults.salons) {
          searchResults.salons = searchResults.salons.map(salon => {
            if (salon.coordinates) {
              const dist = getDistanceKm(
                coords.lat, coords.lng,
                salon.coordinates.lat, salon.coordinates.lng
              );
              return { ...salon, distance: Math.round(dist * 10) / 10 };
            }
            return salon;
          });
          // Sort by distance
          searchResults.salons.sort((a, b) => {
            const distA = (a as unknown as { distance?: number }).distance || 999;
            const distB = (b as unknown as { distance?: number }).distance || 999;
            return distA - distB;
          });
        }

        set({ 
          results: searchResults as unknown as SearchResult, 
          isSearching: false,
          query 
        });

        // Add to recent searches
        get().addToRecent(query);
      },

      addToRecent: (query: string) => {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed || trimmed.length < 2) return;
        
        set(state => {
          const filtered = state.recentSearches.filter(s => s.toLowerCase() !== trimmed);
          return { recentSearches: [query.trim(), ...filtered].slice(0, 8) };
        });
      },

      removeFromRecent: (query: string) => {
        set(state => ({
          recentSearches: state.recentSearches.filter(s => s !== query)
        }));
      },

      clearRecent: () => {
        set({ recentSearches: [] });
      },

      clearResults: () => {
        set({ results: null, suggestions: [], query: '' });
      },
    }),
    {
      name: 'bms-search-store',
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
);
