import { create } from 'zustand';

interface FilterStore {
  type: string;
  area: string;
  rating: string;
  sort: string;
  priceMin: string;
  priceMax: string;
  gender: string;

  setType: (type: string) => void;
  setArea: (area: string) => void;
  setRating: (rating: string) => void;
  setSort: (sort: string) => void;
  setPriceMin: (min: string) => void;
  setPriceMax: (max: string) => void;
  setGender: (gender: string) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  type: 'all',
  area: '',
  rating: '',
  sort: 'rating',
  priceMin: '',
  priceMax: '',
  gender: 'all',
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaultFilters,
  setType: (type) => set({ type }),
  setArea: (area) => set({ area }),
  setRating: (rating) => set({ rating }),
  setSort: (sort) => set({ sort }),
  setPriceMin: (priceMin) => set({ priceMin }),
  setPriceMax: (priceMax) => set({ priceMax }),
  setGender: (gender) => set({ gender }),
  resetFilters: () => set(defaultFilters),
}));
