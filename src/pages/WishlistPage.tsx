import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { salonService } from '../lib/dataService';
import { useWishlistStore } from '../store/useWishlistStore';
import { SalonCard } from '../components/salon/SalonCard';
import type { Salon } from '../types';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { savedSalonIds } = useWishlistStore();
  const [salons, setSalons] = useState<Salon[]>([]);

  useEffect(() => {
    const saved = savedSalonIds
      .map((id) => salonService.getById(id))
      .filter(Boolean) as Salon[];
    setSalons(saved);
  }, [savedSalonIds]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white max-w-7xl mx-auto pb-24 lg:pb-12 pt-4 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden lg:block"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black flex items-center gap-2">
            <Heart size={24} className="fill-red-500 text-red-500" />
            Saved Salons
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {savedSalonIds.length} {savedSalonIds.length === 1 ? 'salon' : 'salons'} in your wishlist
          </p>
        </div>
      </div>

      {salons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Heart size={32} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-black mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Save your favorite salons here to easily find and book them later.
          </p>
          <button
            onClick={() => navigate('/salons')}
            className="px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
          >
            Explore Salons
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {salons.map((salon, index) => (
            <SalonCard
              key={salon.id}
              salon={salon}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
