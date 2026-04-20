import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  savedSalonIds: string[];
  toggleSalon: (id: string) => void;
  isSaved: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      savedSalonIds: [],
      toggleSalon: (id) => set((state) => ({
        savedSalonIds: state.savedSalonIds.includes(id)
          ? state.savedSalonIds.filter((sId) => sId !== id)
          : [...state.savedSalonIds, id]
      })),
      isSaved: (id) => get().savedSalonIds.includes(id),
      clearWishlist: () => set({ savedSalonIds: [] }),
    }),
    {
      name: 'bms-wishlist-storage',
    }
  )
);
