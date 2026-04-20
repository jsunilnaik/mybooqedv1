import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TabTransition } from '../components/layout/PageTransition';
import { MapPin, Phone, Clock, Star, Gift, CreditCard, Scissors, Sparkles } from 'lucide-react';
import { salonService, categoryService } from '../lib/dataService';
import { dynamicPricingService } from '../lib/dynamicPricingService';
import { AIAnalysisOverlay } from '../components/ui/AIAnalysisOverlay';
import { SalonGallery } from '../components/salon/SalonGallery';
import { SalonHeader } from '../components/salon/SalonHeader';
import { ServiceList } from '../components/salon/ServiceList';
import { StaffList } from '../components/salon/StaffList';
import { ReviewList } from '../components/salon/ReviewList';
import { SalonInfo } from '../components/salon/SalonInfo';
import { GalleryGrid } from '../components/salon/GalleryGrid';
import { NearbySalons } from '../components/salon/NearbySalons';
import { cn } from '../lib/utils';
import { parseBusinessUrl, buildBookingUrl, buildSalonUrl, getCanonicalUrl, generateSlug } from '../utils/seo';
import { SEO } from '../components/SEO';
import { generateSalonSchema } from '../utils/schema';

const TABS = ['Services', 'Our Gallery', 'Staff', 'Reviews', 'About'] as const;
type Tab = typeof TABS[number];

function isOpenNow(openingHours: Record<string, { open: string; close: string; isClosed?: boolean }>): { open: boolean; hours: string } {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  const todayHours = openingHours[today];
  if (!todayHours || todayHours.isClosed) return { open: false, hours: 'Closed today' };
  return { open: true, hours: `Open until ${todayHours.close}` };
}

const SalonDetailPage: React.FC = () => {
  const { id, stateSlug, citySlug, areaSlug, businessSlug, tab } = useParams<{ 
    id?: string; 
    stateSlug?: string;
    citySlug?: string;
    areaSlug?: string;
    businessSlug?: string; 
    tab?: string 
  }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Services');
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Map URL tabs to Display Tabs
  const tabMap: Record<string, Tab> = {
    'services': 'Services',
    'gallery': 'Our Gallery',
    'staff': 'Staff',
    'reviews': 'Reviews',
    'about': 'About'
  };

  const reverseTabMap: Record<Tab, string> = {
    'Services': 'services',
    'Our Gallery': 'gallery',
    'Staff': 'staff',
    'Reviews': 'reviews',
    'About': 'about'
  };

  // Sync activeTab with URL tab param
  useEffect(() => {
    if (tab && tabMap[tab]) {
      setActiveTab(tabMap[tab]);
    } else if (!tab) {
      setActiveTab('Services');
    }
  }, [tab]);

  const salon = useMemo(() => {
    // Priority 1: businessSlug from /:businessSlug route (new SEO URLs)
    if (businessSlug) {
      const { uniqueId } = parseBusinessUrl(businessSlug);
      if (uniqueId) {
        return salonService.getByUniqueId(uniqueId);
      }
      // Fallback: try slug match (getBySlug already returns enriched SalonDetail)
      return salonService.getBySlug(businessSlug) || null;
    }
    // Priority 2: id from /salons/:id route (backward compatibility)
    if (id) {
      return salonService.getById(id) || salonService.getBySlug(id) || null;
    }
    return null;
  }, [id, businessSlug]);

  const bookingUrl = useMemo(() => {
    if (!salon) return '/salons';
    return buildBookingUrl(salon as any);
  }, [salon]);

  // Robust base path for tab navigation
  const basePath = useMemo(() => {
    if (!salon) return '';
    if (businessSlug && stateSlug && citySlug && areaSlug) {
      return `/salons-in/${stateSlug}/${citySlug}/${areaSlug}/${businessSlug}`;
    }
    return buildSalonUrl(salon as any);
  }, [salon, businessSlug, stateSlug, citySlug, areaSlug]);

  // Robust slugs for breadcrumbs
  const bSlugs = useMemo(() => {
    if (!salon) return { state: '', city: '', area: '' };
    return {
      state: stateSlug || 'india', // Simplification, buildSalonUrl has better logic but for breadcrumbs this is usually enough or we could use the state from salon address
      city: citySlug || generateSlug(salon.address.city),
      area: areaSlug || generateSlug(salon.address.area)
    };
  }, [salon, stateSlug, citySlug, areaSlug]);

  const nearbySalons = useMemo(() => {
    if (!salon) return [];
    return salonService.getNearby(salon.id, 4);
  }, [salon]);

  const categories = useMemo(() => categoryService.getAll(), []);

  const handleRunOptimizer = async () => {
    if (!salon) return;
    setIsAnalysisModalOpen(true);
    setIsOptimizing(true);
    setAnalysisResult(null);

    const result = await dynamicPricingService.runOptimizationCycle(salon.id);
    
    // Artificial delay for futuristic feeling
    setTimeout(() => {
      setIsOptimizing(false);
      setAnalysisResult(result);
    }, 4500);
  };

  if (!salon) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-[#F7F9FA] rounded-full flex items-center justify-center mx-auto mb-5">
            <Scissors size={32} className="text-black" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-black mb-2">Salon not found</h2>
          <p className="text-sm text-[#71717A] mb-6">This salon may have moved or the link is incorrect.</p>
          <button
            onClick={() => navigate('/salons')}
            className="px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Browse Salons
          </button>
        </div>
      </div>
    );
  }

  const { open, hours } = isOpenNow(salon.openingHours);
  const topServices = salon.services?.slice(0, 3) || [];

  const canonicalUrl = getCanonicalUrl(buildSalonUrl(salon as any));
  const pageTitle = `${salon.name} - Book Appointments Online | MyBOOQED`;
  const pageDescription = `Book an appointment at ${salon.name} in ${salon.address.area}, ${salon.address.city}. ${salon.description.substring(0, 120)}...`;
  const ogImage = salon.images?.cover || (salon.gallery && salon.gallery.length > 0 ? salon.gallery[0].imageUrl : undefined);

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        jsonLd={generateSalonSchema(salon as any, categories as any)}
        ogImage={ogImage}
      />
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <nav className="flex items-center text-[13px] sm:text-sm font-medium text-[#71717A] overflow-x-auto scrollbar-hide">
          <Link to="/" className="hover:text-black transition-colors whitespace-nowrap">Home</Link>
          <span className="mx-2 text-[#D1D5DB] flex-shrink-0">·</span>
          {bSlugs.state && (
            <>
              <span className="hover:text-black transition-colors whitespace-nowrap uppercase">{bSlugs.state}</span>
              <span className="mx-2 text-[#D1D5DB] flex-shrink-0">·</span>
            </>
          )}
          <Link to={`/salons-in/${bSlugs.state}/${bSlugs.city}`} className="hover:text-black transition-colors whitespace-nowrap">{salon.address.city}</Link>
          <span className="mx-2 text-[#D1D5DB] flex-shrink-0">·</span>
          <Link to={`/salons-in/${bSlugs.state}/${bSlugs.city}/${bSlugs.area}`} className="hover:text-black transition-colors whitespace-nowrap">{salon.address.area}</Link>
          <span className="mx-2 text-[#D1D5DB] flex-shrink-0">·</span>
          <span className="text-black font-bold whitespace-nowrap truncate max-w-[150px] sm:max-w-xs">{salon.name}</span>
        </nav>
      </div>

      {/* Gallery — 3-image mosaic */}
      <SalonGallery images={salon.images} salonName={salon.name} />

      {/* ── Main content — 65/35 split ───────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-1 sm:mt-4 pb-44 lg:pb-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── LEFT COLUMN (65%) ── */}
          <div className="flex-1 min-w-0">

            {/* Salon Header */}
            <SalonHeader salon={salon} onBookClick={() => navigate(bookingUrl)} />

            {/* Mobile AI Optimizer Banner */}
            <div className="lg:hidden mt-2 mb-4">
              <button
                onClick={handleRunOptimizer}
                disabled={isOptimizing}
                className={cn(
                  "w-full bg-[#FAF5FF] border-2 border-[#E9D5FF] text-[#7E22CE] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm",
                  isOptimizing ? "opacity-70" : "hover:bg-purple-50 active:scale-[0.98]"
                )}
              >
                <Sparkles size={18} className={cn(isOptimizing ? "animate-spin" : "animate-bounce")} />
                <div className="text-left flex flex-col justify-center">
                   <span className="text-[15px] font-bold leading-tight">{isOptimizing ? 'AI Analyzing...' : 'Magic AI Optimizer'}</span>
                   <span className="text-[11px] font-medium text-[#A855F7] leading-tight">AI-driven Happy Hour discounts</span>
                </div>
              </button>
            </div>

            {/* Sticky Tab Navigation */}
            <div className="sticky top-[52px] sm:top-[64px] z-20 bg-white -mx-4 sm:-mx-6 lg:-mx-0 px-4 sm:px-6 lg:px-0">
              <div className="flex items-center overflow-x-auto scroll-hide border-b border-[#F3F4F6]">
                {TABS.map((tabItem) => (
                  <button
                    key={tabItem}
                    onClick={() => {
                      const tabSlug = reverseTabMap[tabItem];
                      navigate(tabItem === 'Services' ? basePath : `${basePath}/${tabSlug}`, { state: { preventScrollReset: true } });
                    }}
                    className={cn(
                      'relative flex-shrink-0 px-5 py-2.5 sm:py-4 text-sm font-semibold transition-colors duration-200 whitespace-nowrap',
                      activeTab === tabItem ? 'text-black' : 'text-[#71717A] hover:text-black'
                    )}
                  >
                    {tabItem}
                    {activeTab === tabItem && (
                      <motion.div
                        layoutId="salon-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="mt-2 sm:mt-8">
              <TabTransition tabKey={activeTab}>
                {activeTab === 'Services' && (
                  <ServiceList
                    services={salon.services}
                    categories={categories}
                    salonId={salon.id}
                    bookingUrl={bookingUrl}
                  />
                )}
                {activeTab === 'Our Gallery' && (
                  <GalleryGrid items={salon.gallery} />
                )}
                {activeTab === 'Staff' && (
                  <div>
                    <h3 className="text-base font-bold text-black mb-5">Meet the Team</h3>
                    <StaffList staff={salon.staff} />
                  </div>
                )}
                {activeTab === 'Reviews' && (
                  <ReviewList
                    salonId={salon.id}
                    reviews={salon.reviews}
                    overallRating={salon.rating}
                    totalReviews={salon.totalReviews}
                  />
                )}
                {activeTab === 'About' && (
                  <SalonInfo salon={salon} />
                )}
              </TabTransition>
            </div>
          </div>

          {/* ── RIGHT COLUMN (35%) — sticky sidebar ── */}
          <div className="hidden lg:block w-[320px] xl:w-[360px] flex-shrink-0">
            <div className="sticky top-24 space-y-4">

              {/* Main Booking Card */}
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#F3F4F6] p-6">
                {/* Salon mini-info */}
                <div className="flex items-start justify-between gap-2 mb-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black text-[15px] leading-snug mb-1 line-clamp-2">{salon.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-[#FFB800] fill-[#FFB800]" />
                      <span className="text-sm font-bold text-black">{salon.rating}</span>
                      <span className="text-xs text-[#71717A]">({salon.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Big Book Now button */}
                <button
                  onClick={() => navigate(bookingUrl)}
                  className="w-full bg-black text-white font-bold py-4 rounded-full text-base hover:bg-gray-900 active:scale-[0.98] transition-all duration-200 mb-5 shadow-sm"
                >
                  Book now
                </button>

                {/* Divider */}
                <div className="border-t border-[#F3F4F6] mb-4" />

                {/* Open status */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', open ? 'bg-emerald-500' : 'bg-red-400')} />
                  <span className={cn('text-sm font-medium', open ? 'text-emerald-700' : 'text-red-500')}>
                    {open ? 'Open' : 'Closed'}
                  </span>
                  <span className="text-sm text-[#71717A]">· {hours}</span>
                </div>

                {/* Address */}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${salon.address.line1}, ${salon.address.area}, ${salon.address.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-[#71717A] hover:text-black transition-colors mb-3 group"
                >
                  <MapPin size={14} className="flex-shrink-0 mt-0.5 group-hover:text-black" />
                  <span className="group-hover:underline">{salon.address.line1}, {salon.address.area}, {salon.address.city}</span>
                </a>

                {/* Phone */}
                <a
                  href={`tel:${salon.phone}`}
                  className="flex items-center gap-2 text-sm text-[#71717A] hover:text-black transition-colors"
                >
                  <Phone size={14} />
                  {salon.phone}
                </a>

                {/* AI Optimizer Trigger — Sidebar Desktop */}
                <div className="mt-6 pt-6 border-t border-[#F3F4F6]">
                  <button
                    onClick={handleRunOptimizer}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-4 rounded-full flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 hover:scale-[1.02] transition-all active:scale-95 group"
                  >
                    <Sparkles size={18} className="animate-pulse" />
                    <span className="text-sm tracking-tight">Run Revenue Optimizer</span>
                  </button>
                  <p className="text-[10px] text-center text-purple-600 font-bold mt-2 opacity-60 uppercase tracking-widest">Powered by Aura Architecture</p>
                </div>
              </div>

              {/* Hours today */}
              <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-5">
                <h4 className="font-bold text-black text-sm mb-3 flex items-center gap-2">
                  <Clock size={14} />
                  Hours Today
                </h4>
                {(() => {
                  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
                  const today = days[new Date().getDay()];
                  const h = salon.openingHours[today];
                  return (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#71717A] capitalize">{today}</span>
                      <span className="text-sm font-semibold text-black">
                        {h?.isClosed ? 'Closed' : h?.open ? `${h.open} – ${h.close}` : 'Closed'}
                      </span>
                    </div>
                  );
                })()}
                <button
                  onClick={() => setActiveTab('About')}
                  className="text-xs text-black font-semibold mt-3 hover:underline"
                >
                  See all hours →
                </button>
              </div>

              {/* Popular services quick-pick */}
              {topServices.length > 0 && (
                <div className="bg-[#F7F9FA] rounded-2xl p-5">
                  <h4 className="font-bold text-black text-sm mb-4">Popular Services</h4>
                  <div className="space-y-3">
                    {topServices.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between">
                        <span className="text-sm text-black leading-snug flex-1 pr-2 line-clamp-1">{svc.name}</span>
                        <span className="text-sm font-bold text-black flex-shrink-0">
                          ₹{svc.discountPrice || svc.price}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(bookingUrl)}
                    className="w-full mt-4 py-2.5 border border-[#E5E7EB] bg-white rounded-full text-sm font-semibold text-black hover:bg-gray-50 transition-colors"
                  >
                    Book a service
                  </button>
                </div>
              )}

              {/* Gift card upsell */}
              <div className="bg-[#F7F9FA] rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Gift size={16} className="text-black" />
                  <h4 className="font-bold text-black text-sm">Gift Cards</h4>
                </div>
                <p className="text-xs text-[#71717A] mb-3 leading-relaxed">
                  Give the gift of great hair. Buy a voucher for your loved ones.
                </p>
                <button className="flex items-center gap-2 text-xs font-semibold text-black hover:underline">
                  <CreditCard size={12} />
                  Buy a gift card →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {nearbySalons.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <NearbySalons salons={nearbySalons as any} currentCity={salon.address.city} />
        </div>
      )}

      {/* Mobile sticky Book Now bar */}
      <div
        className="fixed left-0 right-0 lg:hidden z-30 bg-white border-t border-[#F3F4F6] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{
          bottom: 0,
          paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-black truncate">{salon.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star size={12} className="text-[#FFB800] fill-[#FFB800]" />
              <span className="text-xs text-[#71717A]">{salon.rating} · {salon.totalReviews} reviews</span>
            </div>
          </div>
          
          <button
            onClick={handleRunOptimizer}
            disabled={isOptimizing}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all shadow-sm flex-shrink-0",
              "bg-[#FAF5FF] border-[#E9D5FF] text-[#7E22CE] hover:border-purple-400",
              isOptimizing && "animate-pulse"
            )}
            title="Run AI Revenue Optimizer"
          >
            <Sparkles className={cn("w-5 h-5", isOptimizing ? "animate-spin" : "animate-bounce")} />
          </button>

          <button
            onClick={() => navigate(bookingUrl)}
            className="px-6 sm:px-8 py-3 bg-black text-white font-bold rounded-full text-sm hover:bg-gray-900 active:scale-[0.98] transition-all flex-shrink-0 shadow-sm"
          >
            Book now
          </button>
        </div>
      </div>
      {/* Multi-Strategy AI Overlay — Portaled to root */}
      {createPortal(
        <AnimatePresence>
          {isAnalysisModalOpen && (
            <AIAnalysisOverlay
              isOpen={isAnalysisModalOpen}
              onClose={() => setIsAnalysisModalOpen(false)}
              salonName={salon.name}
              isProcessing={isOptimizing}
              result={analysisResult}
              onConfirm={() => setIsAnalysisModalOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default SalonDetailPage;
