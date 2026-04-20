import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Clock, Scissors, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildSalonUrl } from '../../utils/seo';
import { useSearchStore } from '../../store/useSearchStore';
import { useLocationStore } from '../../store/useLocationStore';
import { searchService, salonService } from '../../lib/dataService';
import { cn } from '../../lib/utils';

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  variant?: 'hero' | 'header' | 'page';
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  className,
  placeholder = 'Search for a salon, treatment, or barber...',
  autoFocus = false,
  onSearch,
  variant = 'hero',
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [localQuery, setLocalQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const { 
    suggestions, 
    recentSearches, 
    getSuggestions, 
    addToRecent, 
    removeFromRecent,
    clearRecent 
  } = useSearchStore();
  
  const { coordinates } = useLocationStore();
  
  const popularSearches = searchService.getPopular().slice(0, 6);
  
  // Debounced suggestions fetch
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      getSuggestions(q, coordinates);
    }, 300);
  }, [getSuggestions, coordinates]);
  
  useEffect(() => {
    if (localQuery.length >= 2) {
      fetchSuggestions(localQuery);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localQuery, fetchSuggestions]);
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + recentSearches.length + (localQuery.length < 2 ? popularSearches.length : 0);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        // Select the highlighted item
        if (selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (selectedIndex < suggestions.length + recentSearches.length) {
          handleSearch(recentSearches[selectedIndex - suggestions.length]);
        } else {
          handleSearch(popularSearches[selectedIndex - suggestions.length - recentSearches.length]);
        }
      } else if (localQuery.trim()) {
        handleSearch(localQuery);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };
  
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    addToRecent(query);
    setIsOpen(false);
    setLocalQuery('');
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
  
  const handleSelectSuggestion = (suggestion: typeof suggestions[0]) => {
    addToRecent(suggestion.name);
    setIsOpen(false);
    setLocalQuery('');
    if (suggestion.type === 'salon') {
      const salonObj = salonService.getById(suggestion.id);
      navigate(salonObj?.uniqueId ? buildSalonUrl(salonObj as any) : `/salons/${suggestion.id}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
    }
  };
  
  const handleFocus = () => {
    setIsOpen(true);
    setSelectedIndex(-1);
  };
  
  const handleClear = () => {
    setLocalQuery('');
    inputRef.current?.focus();
  };
  
  const formatDistance = (km?: number) => {
    if (!km) return null;
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };
  
  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="font-bold text-black">{text.slice(index, index + query.length)}</span>
        {text.slice(index + query.length)}
      </>
    );
  };
  
  const showDropdown = isOpen && (
    suggestions.length > 0 || 
    recentSearches.length > 0 || 
    (localQuery.length < 2 && popularSearches.length > 0)
  );
  
  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className={cn(
        'flex items-center gap-3 bg-white rounded-full border transition-all',
        variant === 'hero' 
          ? 'border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.10)] px-5 py-1' 
          : 'border-gray-200 px-4 py-2',
        isOpen && 'ring-2 ring-black/5'
      )}>
        <Search size={variant === 'hero' ? 18 : 16} className="text-[#9CA3AF] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'flex-1 bg-transparent text-black placeholder-[#9CA3AF] outline-none min-w-0',
            variant === 'hero' ? 'text-sm py-3.5' : 'text-sm py-2'
          )}
        />
        {localQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-[#F4F4F5] hover:bg-[#E5E7EB] flex-shrink-0 transition-colors"
          >
            <X size={12} className="text-[#71717A]" />
          </button>
        )}
      </div>
      
      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-[70vh] overflow-y-auto"
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left',
                      selectedIndex === index ? 'bg-[#F7F9FA]' : 'hover:bg-[#F7F9FA]'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      suggestion.type === 'salon' ? 'bg-[#F0F0FF]' : 'bg-[#FFF4ED]'
                    )}>
                      {suggestion.type === 'salon' 
                        ? <Scissors size={16} className="text-[#403AFA]" />
                        : <Sparkles size={16} className="text-[#FC5201]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-black truncate">
                        {highlightMatch(suggestion.name, localQuery)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#71717A]">
                        <span className="truncate">{suggestion.subtitle}</span>
                        {suggestion.distance && (
                          <span className="flex items-center gap-0.5 text-[#10B981] flex-shrink-0">
                            <MapPin size={10} />
                            {formatDistance(suggestion.distance)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#D1D5DB] flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Recent Searches */}
            {recentSearches.length > 0 && localQuery.length < 2 && (
              <div className="p-2 border-t border-[#F3F4F6]">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">
                    Recent Searches
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); clearRecent(); }}
                    className="text-xs text-[#71717A] hover:text-black transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <div
                    key={search}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                      selectedIndex === suggestions.length + index ? 'bg-[#F7F9FA]' : 'hover:bg-[#F7F9FA]'
                    )}
                  >
                    <Clock size={14} className="text-[#9CA3AF] flex-shrink-0" />
                    <button
                      onClick={() => handleSearch(search)}
                      className="flex-1 text-left text-sm text-[#374151] truncate"
                    >
                      {search}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromRecent(search); }}
                      className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#E5E7EB] flex-shrink-0 transition-colors"
                    >
                      <X size={10} className="text-[#9CA3AF]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Popular Searches */}
            {localQuery.length < 2 && popularSearches.length > 0 && (
              <div className="p-2 border-t border-[#F3F4F6]">
                <div className="flex items-center gap-2 px-3 py-2">
                  <TrendingUp size={12} className="text-[#9CA3AF]" />
                  <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">
                    Popular Searches
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 px-3 pb-2">
                  {popularSearches.map((term, index) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className={cn(
                        'text-xs font-medium px-3 py-1.5 rounded-full border border-[#E5E7EB] transition-all',
                        selectedIndex === suggestions.length + recentSearches.length + index
                          ? 'bg-black text-white border-black'
                          : 'text-[#374151] hover:border-black hover:text-black'
                      )}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* No results hint */}
            {localQuery.length >= 2 && suggestions.length === 0 && (
              <div className="p-6 text-center">
                <Search size={24} className="text-[#D1D5DB] mx-auto mb-2" />
                <p className="text-sm text-[#71717A]">No results found for "{localQuery}"</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Try a different search term</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchAutocomplete;
