import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, MapPin, ChevronDown, ChevronRight, LogOut, Calendar, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/useAuthStore';
import { searchService, salonService } from '../../lib/dataService';
import { useLocationStore } from '../../store/useLocationStore';
import { buildSalonUrl } from '../../utils/seo';
import { LocationModal } from '../location/LocationModal';

interface Suggestion {
  id: string;
  name: string;
  type: 'salon' | 'service';
  subtitle: string;
}

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { city: locationCity } = useLocationStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean | 'confirmLogout'>(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Mobile search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        const results = searchService.getSuggestions(searchQuery);
        setSuggestions(results as Suggestion[]);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'salon') {
      const salonObj = salonService.getById(suggestion.id);
      navigate(salonObj?.uniqueId ? buildSalonUrl(salonObj as any) : `/salons/${suggestion.id}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
    }
    setSearchQuery('');
    setShowSuggestions(false);
    setSearchOpen(false);
  };

  const navLinks = [
    { href: '/salons', label: 'Salons' },
    { href: '/categories', label: 'Categories' },
    { href: '/search', label: 'Search' },
  ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-white',
          scrolled ? 'shadow-[0_1px_0_rgba(0,0,0,0.08)]' : 'border-b border-[#F3F4F6]'
        )}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center h-[52px] sm:h-[64px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                <img src="/logo.svg" alt="MyBOOQED" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <div className="text-[13px] sm:text-[15px] text-black leading-none tracking-tighter whitespace-nowrap uppercase">
                  <span className="tracking-widest text-[16px]"><span className="font-normal">My</span><span className="font-black">BOOQED</span></span>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLocationModalOpen(true);
                  }}
                  className="flex items-center gap-1 mt-0.5 -ml-0.5 group/loc hover:opacity-80 transition-opacity relative z-10"
                >
                  <MapPin size={10} className="text-[#71717A] group-hover/loc:text-[#FF385C]" />
                  <span className="text-[10px] sm:text-[11px] text-[#71717A] font-medium group-hover/loc:text-black transition-colors border-b border-dotted border-[#71717A] hover:border-black max-w-[100px] sm:max-w-none truncate leading-none">
                    {locationCity || 'Pick location'}
                  </span>
                </button>
              </div>
            </Link>

            {/* Spacer to push nav to right */}
            <div className="flex-1" />

            {/* Desktop Nav — lg+ (right aligned) */}
            <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap',
                    location.pathname.startsWith(link.href)
                      ? 'text-black bg-[#F7F9FA] font-semibold'
                      : 'text-[#71717A] hover:text-black hover:bg-[#F7F9FA]'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/owner/login"
                className="ml-2 px-4 py-2 rounded-full text-sm font-semibold border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-150 whitespace-nowrap"
              >
                List Your Salon
              </Link>
            </nav>

            {/* md only: compact links (right aligned) */}
            <div className="hidden md:flex lg:hidden items-center gap-2 flex-shrink-0">
              <Link
                to="/salons"
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                  location.pathname.startsWith('/salons')
                    ? 'text-black bg-[#F7F9FA] font-semibold'
                    : 'text-[#71717A] hover:text-black hover:bg-[#F7F9FA]'
                )}
              >
                Salons
              </Link>
              <Link
                to="/search"
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                  location.pathname.startsWith('/search')
                    ? 'text-black bg-[#F7F9FA] font-semibold'
                    : 'text-[#71717A] hover:text-black hover:bg-[#F7F9FA]'
                )}
              >
                Search
              </Link>
              <Link
                to="/owner/login"
                className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-black text-black hover:bg-black hover:text-white transition-all whitespace-nowrap"
              >
                List Salon
              </Link>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
              {/* Saved Salons Toggle */}
              <Link
                to="/saved"
                className="hidden lg:flex p-2 rounded-full text-[#71717A] hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Saved Salons"
              >
                <Heart size={20} />
              </Link>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-full text-[#71717A] hover:bg-[#F7F9FA] hover:text-black transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Auth — Always Circle Shape on All Devices */}
              {isAuthenticated && user ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="User menu"
                    className="flex items-center gap-1.5 transition-all focus:outline-none group"
                  >
                    {/* Avatar — Fixed 36x36 Circle */}
                    <div
                      className="overflow-hidden flex-shrink-0 ring-2 ring-[#E5E7EB] group-hover:ring-black/30 transition-all"
                      style={{ 
                        borderRadius: '50%', 
                        width: '25px', 
                        height: '25px', 
                        minWidth: '25px', 
                        minHeight: '25px' 
                      }}
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          style={{ borderRadius: '50%', display: 'block' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-[11px] font-bold text-white"
                          style={{ backgroundColor: '#1a1a1a', borderRadius: '50%' }}
                        >
                          {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Chevron — desktop only */}
                    <ChevronDown
                      size={12}
                      className={cn(
                        'text-[#71717A] transition-transform duration-200 hidden sm:block',
                        userMenuOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden z-50 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
                      >
                        <div className="px-4 py-3 border-b border-[#F3F4F6]">
                          <div className="text-sm font-semibold text-black truncate">{user.name}</div>
                          <div className="text-xs text-[#71717A] mt-0.5 truncate">{user.phone}</div>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/account/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F7F9FA] transition-colors"
                          >
                            <Calendar size={14} className="text-[#71717A]" />
                            My Bookings
                          </Link>
                          <Link
                            to="/account/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F7F9FA] transition-colors"
                          >
                            <User size={14} className="text-[#71717A]" />
                            My Profile
                          </Link>
                        </div>
                        <div className="border-t border-[#F3F4F6] py-1">
                          {userMenuOpen === 'confirmLogout' ? (
                            <div className="px-3 py-2">
                              <p className="text-[10px] font-bold text-center text-[#71717A] uppercase tracking-wider mb-2">Are you sure?</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                                  className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  Sign Out
                                </button>
                                <button
                                  onClick={() => setUserMenuOpen(true)}
                                  className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setUserMenuOpen('confirmLogout' as any)}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <LogOut size={14} />
                              Sign Out
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Logged Out — Circle Icon Button (same as logged in) */
                <Link
                  to="/account/login"
                  aria-label="Login"
                  className="flex items-center justify-center transition-all duration-200 active:scale-[0.98] ring-2 ring-[#E5E7EB] hover:ring-black/30"
                  style={{
                    width: '25px',
                    height: '25px',
                    minWidth: '25px',
                    minHeight: '25px',
                    borderRadius: '50%',
                    backgroundColor: '#F7F9FA'
                  }}
                >
                  <User size={16} className="text-[#71717A]" />
                </Link>
              )}

              {/* Mobile/tablet hamburger — hidden on lg+ */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-full text-[#71717A] hover:bg-[#F7F9FA] hover:text-black transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[#F3F4F6] overflow-hidden bg-white"
            >
              <div className="px-4 py-3" ref={searchRef}>
                <form onSubmit={handleSearch}>
                  <div className="flex items-center gap-2 bg-[#F7F9FA] border border-[#E5E7EB] rounded-full px-4 focus-within:border-black transition-colors">
                    <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search salons, services..."
                      autoFocus
                      className="flex-1 bg-transparent text-sm text-black placeholder-[#9CA3AF] outline-none py-3 min-w-0"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')}>
                        <X size={14} className="text-[#9CA3AF]" />
                      </button>
                    )}
                  </div>
                </form>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="mt-2 bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-lg">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSuggestionClick(s)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FA] transition-colors text-left"
                      >
                        <div className="text-sm font-medium text-black truncate flex-1">{s.name}</div>
                        <div className="text-xs text-[#71717A] ml-auto capitalize flex-shrink-0">{s.type}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile/Tablet Nav Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-[#F3F4F6] bg-white overflow-hidden"
            >
              <nav className="px-4 py-3 space-y-1">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setLocationModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F7F9FA] transition-colors"
                >
                  <MapPin size={18} className="text-[#9CA3AF]" />
                  <div className="text-left">
                    <div className="text-xs text-[#71717A]">Location</div>
                    <div className="text-black font-semibold">{locationCity || 'Select City'}</div>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-[#9CA3AF]" />
                </button>

                <div className="h-px bg-gray-50 my-1" />

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      location.pathname.startsWith(link.href)
                        ? 'text-black bg-[#F7F9FA] font-semibold'
                        : 'text-[#374151] hover:bg-[#F7F9FA] hover:text-black'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link to="/user/bookings" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F7F9FA]">
                      <Calendar size={18} className="mr-3 text-[#9CA3AF]" />
                      My Bookings
                    </Link>
                    <Link to="/user/dashboard" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F7F9FA]">
                      Profile
                    </Link>
                  </>
                ) : (
                  <Link to="/account/login" className="flex items-center justify-center px-4 py-3 rounded-full text-sm font-semibold text-white bg-black hover:bg-[#1a1a1a] text-center">
                    Login / Sign Up
                  </Link>
                )}

                <div className="h-px bg-gray-100 my-2" />

                <Link
                  to="/owner/login"
                  className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-sm font-bold border-2 border-black text-black hover:bg-black hover:text-white transition-all text-center bg-white shadow-sm"
                >
                  <img src="/logo.svg" alt="" className="w-6 h-6 object-contain" />
                  List Your Salon — Free
                </Link>
                <p className="text-center text-[10px] text-[#71717A] px-4 pb-2">
                  Join 20+ salons in India. Manage bookings from your dashboard.
                </p>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <LocationModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </>
  );
};
