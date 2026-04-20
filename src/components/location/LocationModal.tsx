import React, { useState, useMemo } from 'react';
import { Search, MapPin, Target, ChevronRight, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useLocationStore } from '../../store/useLocationStore';
import { POPULAR_CITIES } from '../../data/cities';
import { cn } from '../../lib/utils';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}



export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { city: currentCity, setCity, detectLocation, isDetecting, error, unsupportedLocation, suggestedCities } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = useMemo(() => {
    if (!searchQuery) return [];
    return POPULAR_CITIES
      .filter(city => city.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(city => city.name);
  }, [searchQuery]);

  const handleCitySelect = (cityName: string) => {
    setCity(cityName);
    onClose();
    setSearchQuery('');
  };

  const handleDetectLocation = async () => {
    await detectLocation();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="sm:max-w-2xl"
    >
      <div className="flex flex-col h-[75vh] sm:h-auto max-h-[75vh] sm:max-h-[75vh]">
        {/* Search Header */}
        <div className="p-3.5 sm:p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search for your city"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-black focus:bg-white transition-all text-sm sm:text-base"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
          </div>

          {window.isSecureContext && (
            <button
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="mt-3 flex items-center gap-3 text-[#FF385C] hover:text-[#D70466] font-semibold transition-colors group px-1"
            >
              <div className="p-1.5 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors">
                {isDetecting ? (
                  <div className="w-4 h-4 border-2 border-[#FF385C] border-t-transparent animate-spin rounded-full" />
                ) : (
                  <Target size={18} />
                )}
              </div>
              <span className="text-xs sm:text-base">Detect my location</span>
            </button>
          )}
          
          {error && <p className="mt-1.5 text-[10px] text-red-500 px-1">{error}</p>}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 custom-scrollbar">
          {searchQuery ? (
            /* Search Results */
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Search Results</h3>
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-gray-400 group-hover:text-black" />
                      <span className="font-medium">{city}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                ))
              ) : (
                <p className="text-center py-8 text-gray-500 italic">No cities found matching "{searchQuery}"</p>
              )}
            </div>
          ) : (
            <>
              {/* Location Unavailable Warning */}
              {unsupportedLocation && suggestedCities.length > 0 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-3">
                    <Target className="text-orange-500 mt-0.5 shrink-0" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-orange-900 mb-1">Area Not Served</h4>
                      <p className="text-xs text-orange-800 mb-3">
                        We don't currently have salons in your direct vicinity. Here are the nearest cities we operate in:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedCities.map(city => (
                          <button
                            key={city}
                            onClick={() => handleCitySelect(city)}
                            className="px-4 py-2 bg-white text-orange-900 text-xs font-semibold rounded-full shadow-sm hover:shadow hover:bg-orange-100 transition-all border border-orange-200"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Popular Cities */}
              <div className="pb-4">
                <h3 className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Popular Cities</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-6 sm:gap-y-8 gap-x-3 sm:gap-x-4">
                  {POPULAR_CITIES.map((city) => {
                    const isActive = currentCity === city.name;
                    return (
                      <button
                        key={city.name}
                        onClick={() => handleCitySelect(city.name)}
                        className="flex flex-col items-center gap-3 group outline-none"
                      >
                        <div className={cn(
                          "w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden transition-all duration-400 relative",
                          isActive 
                            ? "ring-2 ring-black scale-105 shadow-lg shadow-black/10" 
                            : "ring-1 ring-gray-100 group-hover:ring-black/20 group-hover:scale-105 shadow-sm hover:shadow-md"
                        )}>
                          <img 
                            src={city.image} 
                            alt={city.name}
                            className={cn(
                              "w-full h-full object-cover transition-transform duration-700",
                              isActive ? "scale-110" : "group-hover:scale-110"
                            )}
                          />
                          <div className={cn(
                            "absolute inset-0 transition-opacity duration-300",
                            isActive ? "bg-black/10" : "bg-black/0 group-hover:bg-black/5"
                          )} />
                          {isActive && (
                            <div className="absolute top-2 right-2">
                              <div className="bg-black text-white rounded-full p-1 shadow-lg scale-90">
                                <MapPin size={10} fill="white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <span className={cn(
                          "text-xs sm:text-[13px] font-bold transition-colors tracking-tight",
                          isActive ? "text-black" : "text-gray-500 group-hover:text-black"
                        )}>
                          {city.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
