import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, Clock, Star, Calendar, Zap, ArrowRight, MapPin, Shuffle, Search, Sparkles } from 'lucide-react';
import OSMMap from '../components/map/OSMMap';
import { salonService } from '../lib/dataService';
import { useBookingStore } from '../store/useBookingStore';
import { useToast } from '../components/ui/Toast';
import { cn, formatPrice, formatDuration } from '../lib/utils';
import { parseBusinessUrl, buildSalonUrl } from '../utils/seo';
import { CATEGORY_META, DEFAULT_CATEGORY_META } from '../constants/categoryMeta';
import type { Service, Staff, TimeSlot } from '../types';
import categoriesRaw from '../data/categories.json';

const categories = categoriesRaw as any[];

const STEPS = ['Services', 'Staff', 'Date & Time', 'Confirm'];

// Replaced by CATEGORY_META and categories data

const BookingPage: React.FC = () => {
  const { id, businessSlug } = useParams<{ id?: string; businessSlug?: string }>();
  const navigate = useNavigate();
  const { initBooking, toggleService, generateToken } = useBookingStore();
  const toast = useToast();

  const salon = useMemo(() => {
    // 1. Try to find by uniqueId from the new SEO URL /looks-salon-India-x7k2m/book
    if (businessSlug) {
      const { uniqueId } = parseBusinessUrl(businessSlug);
      if (uniqueId) {
        return salonService.getByUniqueId(uniqueId);
      }
    }

    // 2. Fallback to older URL patterns
    const lookupId = id || businessSlug;
    if (!lookupId) return null;
    return salonService.getById(lookupId) || salonService.getBySlug(lookupId);
  }, [id, businessSlug]);

  const [step, setStep] = useState(1);
  const [localServices, setLocalServices] = useState<Service[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Reset scroll to top when step changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [step]);

  const localTotal = useMemo(() => {
    const baseTotal = localServices.reduce((sum, s) => sum + (s.discountPrice || s.price), 0);
    if (selectedSlot?.discountPercentage) {
      // Apply slot-specific discount to the entire service total
      return baseTotal * (1 - selectedSlot.discountPercentage / 100);
    }
    return baseTotal;
  }, [localServices, selectedSlot]);
  
  const localDuration = localServices.reduce((sum, s) => sum + s.duration, 0);

  const toggleLocalService = (service: Service) => {
    setLocalServices((prev) =>
      prev.find((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  const dates = useMemo(() => {
    const result: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push(d);
    }
    return result;
  }, []);

  const slots: TimeSlot[] = useMemo(() => {
    if (!salon || !selectedDate) return [];
    // selectedDate is already in YYYY-MM-DD local format
    return salonService.getSlots(salon.id, selectedDate);
  }, [salon, selectedDate]);

  const groupedSlots = useMemo(() => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];
    slots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });
    return { morning, afternoon, evening };
  }, [slots]);

  const canProceed =
    (step === 1 && localServices.length > 0) ||
    step === 2 ||
    (step === 3 && selectedDate !== '' && selectedTime !== '');

  const handleConfirm = async () => {
    if (!salon) return;
    setIsConfirming(true);
    initBooking({ id: salon.id, name: salon.name, slug: salon.slug, image: salon.images.cover, area: salon.address.area });
    localServices.forEach(s => toggleService(s));
    await new Promise((res) => setTimeout(res, 1200));
    toast.success('Booking confirmed! See you soon.');
    const confirmToken = generateToken();
    navigate(`/${confirmToken}/bookings/confirmation`, {
      state: {
        booking: {
          salonId: salon.id,
          salonName: salon.name,
          services: localServices.map(s => ({
            name: s.name,
            duration: s.duration,
            price: s.discountPrice || s.price,
          })),
          staffName: selectedStaff?.name || 'Any Available',
          date: selectedDate,
          time: selectedTime,
          totalAmount: localTotal,
          totalDuration: localDuration,
        }
      }
    });
  };

  if (!salon) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#F7F9FA] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Search size={40} className="text-[#71717A]" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-black mb-4">Salon not found</h2>
          <button onClick={() => navigate('/salons')} className="px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors">
            Browse Salons
          </button>
        </div>
      </div>
    );
  }

  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {};
    (salon.services || []).forEach((svc) => {
      const catId = svc.categoryId || 'other';
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(svc);
    });
    return grouped;
  }, [salon]);

  return (
    <div className="min-h-screen bg-[#F7F9FA]">

      {/* ── Top Header Bar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate(buildSalonUrl(salon as any))}
            className="flex items-center gap-1.5 text-sm text-[#71717A] hover:text-black transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">{step > 1 ? 'Back' : salon.name}</span>
          </button>

          <div className="flex-1">
            <p className="text-xs text-[#71717A] text-center font-medium">
              {salon.name}
            </p>
          </div>

          {/* Step counter */}
          <span className="text-xs text-[#71717A] flex-shrink-0 font-medium">
            Step {step} of {STEPS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 w-full">
          <motion.div
            className="h-1 bg-black rounded-full"
            initial={{ width: '25%' }}
            animate={{ width: `${(step / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-2.5 sm:px-6 py-3 sm:py-6 pb-56 sm:pb-60 lg:pb-48">

        {/* ── Step Indicator ── */}
        <div className="flex items-center mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-gray-100 shadow-sm">
          {STEPS.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === step;
            const isDone = stepNum < step;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div className={cn(
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                    isDone
                      ? 'bg-black text-white'
                      : isActive
                        ? 'bg-black text-white ring-4 ring-black/10'
                        : 'bg-white text-[#71717A] border-2 border-gray-200'
                  )}>
                    {isDone ? <Check size={12} /> : stepNum}
                  </div>
                  <span className={cn(
                    'text-[9px] sm:text-[10px] font-semibold text-center leading-tight px-0.5',
                    isActive ? 'text-black' : isDone ? 'text-black' : 'text-[#71717A]'
                  )}>
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn(
                    'h-0.5 mb-4 transition-all duration-300 flex-shrink-0',
                    'w-4 sm:w-8',
                    isDone ? 'bg-black' : 'bg-gray-200'
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════
              STEP 1 — Choose Services
          ════════════════════════════════════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-1">Choose Services</h2>
                <p className="text-sm text-[#71717A]">Select one or more services to continue</p>
              </div>

              <div className="space-y-5">
                {Object.entries(servicesByCategory).map(([catId, svcs]) => (
                  <div key={catId} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    {/* Category header */}
                    <div className="px-5 py-3.5 bg-[#F7F9FA] border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(() => { 
                          const cat = categories.find(c => c.id === catId);
                          const meta = CATEGORY_META[cat?.slug || ''] || DEFAULT_CATEGORY_META;
                          const { Icon } = meta;
                          return (
                            <>
                              <Icon size={15} style={{ color: meta.color }} />
                              <span className="text-sm font-bold text-black">
                                {cat?.name || catId.replace(/-/g, ' ')}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      <span className="text-xs text-[#71717A]">{svcs.length} services</span>
                    </div>

                    {/* Service rows — each outlined */}
                    <div className="p-3 space-y-2">
                      {svcs.map((service) => {
                        const isSelected = localServices.some((s) => s.id === service.id);
                        return (
                          <div
                            key={service.id}
                            onClick={() => toggleLocalService(service)}
                            className={cn(
                              'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                              isSelected
                                ? 'border-black bg-black/[0.02] shadow-sm'
                                : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                            )}
                          >
                            {/* Checkbox */}
                            <div className={cn(
                              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                              isSelected ? 'bg-black border-black' : 'border-gray-300 bg-white'
                            )}>
                              {isSelected && (
                                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                  <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className={cn(
                                  'text-sm font-semibold leading-snug',
                                  isSelected ? 'text-black' : 'text-black'
                                )}>
                                  {service.name}
                                </span>
                                {service.isPopular && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                    <Zap size={9} className="fill-amber-600 text-amber-600" />
                                    Popular
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                                <Clock size={11} />
                                <span>{formatDuration(service.duration)}</span>
                                {service.gender !== 'unisex' && (
                                  <>
                                    <span className="text-gray-300">·</span>
                                    <span className="capitalize">{service.gender}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                              {service.discountPrice ? (
                                <div>
                                  <span className="text-[11px] text-[#71717A] line-through block">{formatPrice(service.price)}</span>
                                  <span className="text-sm font-bold text-black">{formatPrice(service.discountPrice)}</span>
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-black">{formatPrice(service.price)}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════
              STEP 2 — Choose Staff
          ════════════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-1">Choose a Stylist</h2>
                <p className="text-sm text-[#71717A]">Pick your preferred stylist or any available</p>
              </div>

              <div className="space-y-3">
                {/* Any Available */}
                <div
                  onClick={() => setSelectedStaff(null)}
                  className={cn(
                    'p-5 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all duration-200 bg-white',
                    selectedStaff === null
                      ? 'border-black shadow-sm'
                      : 'border-gray-100 hover:border-gray-300'
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-[#F7F9FA] flex items-center justify-center flex-shrink-0">
                    <Shuffle size={20} className="text-[#71717A]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-black text-sm">Any Available</div>
                    <div className="text-xs text-[#71717A] mt-0.5">We'll assign the best available stylist</div>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                    selectedStaff === null ? 'border-black bg-black' : 'border-gray-200'
                  )}>
                    {selectedStaff === null && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                {(salon.staff || []).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedStaff(member)}
                    className={cn(
                      'p-5 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all duration-200 bg-white',
                      selectedStaff?.id === member.id
                        ? 'border-black shadow-sm'
                        : 'border-gray-100 hover:border-gray-300'
                    )}
                  >
                    {/* Staff Photo */}
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border-2 border-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xl font-black text-white flex-shrink-0",
                      member.avatar ? "hidden" : ""
                    )}>
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-black text-sm">{member.name}</div>
                      <div className="text-xs text-[#71717A] mt-0.5">{member.role} · {member.experience} yrs exp</div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star size={11} className="text-[#FFB800] fill-[#FFB800]" />
                        <span className="text-xs font-semibold text-black">{member.rating}</span>
                        <span className="text-xs text-[#71717A]">rating</span>
                      </div>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      selectedStaff?.id === member.id ? 'border-black bg-black' : 'border-gray-200'
                    )}>
                      {selectedStaff?.id === member.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════
              STEP 3 — Date & Time
          ════════════════════════════════════════ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-1">Pick a Date & Time</h2>
                <p className="text-sm text-[#71717A]">Choose when you'd like to come in</p>
              </div>

              {/* Date strip */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                <p className="text-xs font-bold text-[#71717A] uppercase tracking-wider mb-3">Select Date</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {dates.map((date) => {
                    // Use local date to avoid UTC timezone shift
                    const y = date.getFullYear();
                    const mo = String(date.getMonth() + 1).padStart(2, '0');
                    const d2 = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${y}-${mo}-${d2}`;
                    const todayLocal = new Date();
                    const ty = todayLocal.getFullYear();
                    const tm = String(todayLocal.getMonth() + 1).padStart(2, '0');
                    const td = String(todayLocal.getDate()).padStart(2, '0');
                    const todayStr = `${ty}-${tm}-${td}`;
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === todayStr;
                    return (
                    <button
                        key={dateStr}
                        onClick={() => { 
                          setSelectedDate(dateStr); 
                          setSelectedTime(''); 
                          setSelectedSlot(null);
                        }}
                        className={cn(
                          'flex-shrink-0 flex flex-col items-center gap-1 w-16 py-3 rounded-xl border-2 transition-all duration-200',
                          isSelected
                            ? 'bg-black border-black text-white shadow-md'
                            : 'bg-white border-gray-100 text-[#71717A] hover:border-gray-300'
                        )}
                      >
                        <span className={cn('text-[10px] font-bold uppercase', isSelected ? 'text-white/70' : 'text-[#71717A]')}>
                          {isToday ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' })}
                        </span>
                        <span className={cn('text-2xl font-black leading-none', isSelected ? 'text-white' : 'text-black')}>
                          {date.getDate()}
                        </span>
                        <span className={cn('text-[10px]', isSelected ? 'text-white/70' : 'text-[#71717A]')}>
                          {date.toLocaleDateString('en', { month: 'short' })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-5">
                  <p className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Select Time</p>
                  {Object.entries(groupedSlots).map(([period, periodSlots]) => {
                    if (periodSlots.length === 0) return null;
                    const label = period === 'morning' ? 'Morning' : period === 'afternoon' ? 'Afternoon' : 'Evening';
                    return (
                      <div key={period}>
                        <div className="text-xs font-semibold text-[#71717A] mb-3">{label}</div>
                        <div className="flex flex-wrap gap-2">
                          {periodSlots.map((slot) => {
                            const isSelected = selectedTime === slot.startTime;
                            const hasSale = !!slot.discountPercentage;
                            return (
                              <button
                                key={slot.id}
                                onClick={() => {
                                  setSelectedTime(slot.startTime);
                                  setSelectedSlot(slot);
                                }}
                                disabled={slot.isBooked}
                                className={cn(
                                  'relative px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex flex-col items-center justify-center min-w-[76px]',
                                  slot.isBooked
                                    ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through'
                                    : isSelected
                                      ? 'bg-black border-black text-white shadow-md'
                                      : hasSale || slot.valueAdd 
                                        ? 'bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400'
                                        : 'bg-white border-gray-200 text-black hover:border-black'
                                )}
                              >
                                <span>{slot.startTime}</span>
                                {hasSale && !slot.isBooked && (
                                  <div className="absolute -top-2 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-bounce">
                                    -{slot.discountPercentage}%
                                  </div>
                                )}
                                {slot.valueAdd && !slot.isBooked && (
                                  <div className={cn(
                                    "mt-1 text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 whitespace-nowrap transition-colors",
                                    isSelected ? "bg-white text-black" : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
                                  )}>
                                    <Zap size={6} className={isSelected ? "fill-black" : "fill-white"} />
                                    {slot.valueAdd}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {slots.length === 0 && (
                    <div className="text-center py-12 text-[#71717A]">
                      <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No available slots on this date</p>
                      <p className="text-xs mt-1 text-[#71717A]">Try another date</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-[#71717A]">
                  <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Select a date above to see available times</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════
              STEP 4 — Confirm
          ════════════════════════════════════════ */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-1">Confirm Booking</h2>
                <p className="text-sm text-[#71717A]">Review your details before confirming</p>
              </div>

              {/* ── Salon Image Card ── */}
              <div className="relative rounded-2xl overflow-hidden mb-4 shadow-sm">
                <img
                  src={salon.images?.cover || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=300&fit=crop'}
                  alt={salon.name}
                  className="w-full h-44 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=300&fit=crop';
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg leading-tight">{salon.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-[#FFB800] text-[#FFB800]" />
                      <span className="text-white text-xs font-semibold">{salon.rating}</span>
                      <span className="text-white/70 text-xs">({salon.totalReviews} reviews)</span>
                    </div>
                    <span className="text-white/50 text-xs">·</span>
                    <span className="text-white/80 text-xs">{salon.address.area}, {salon.address.city}</span>
                  </div>
                </div>
              </div>

              {/* ── Booking Summary Card ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                {/* Services */}
                <div className="p-5 border-b border-gray-50">
                  <div className="text-xs text-[#71717A] uppercase tracking-wider mb-3 font-bold">Services</div>
                  <div className="space-y-2">
                    {localServices.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-[#F7F9FA]">
                        <div>
                          <span className="text-sm font-semibold text-black">{svc.name}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock size={10} className="text-[#71717A]" />
                            <span className="text-xs text-[#71717A]">{formatDuration(svc.duration)}</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-black">{formatPrice(svc.discountPrice || svc.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details grid */}
                <div className="p-5 border-b border-gray-50 grid grid-cols-2 gap-4">
                  <div className="bg-[#F7F9FA] rounded-xl p-3">
                    <div className="text-[10px] text-[#71717A] mb-1 font-bold uppercase tracking-wide">Stylist</div>
                    <div className="text-sm font-semibold text-black">{selectedStaff ? selectedStaff.name : 'Any Available'}</div>
                  </div>
                  <div className="bg-[#F7F9FA] rounded-xl p-3">
                    <div className="text-[10px] text-[#71717A] mb-1 font-bold uppercase tracking-wide">Date</div>
                    <div className="text-sm font-semibold text-black">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'short', day: 'numeric', month: 'short'
                      })}
                    </div>
                  </div>
                  <div className="bg-[#F7F9FA] rounded-xl p-3">
                    <div className="text-[10px] text-[#71717A] mb-1 font-bold uppercase tracking-wide">Time</div>
                    <div className="text-sm font-semibold text-black">{selectedTime}</div>
                  </div>
                  <div className="bg-[#F7F9FA] rounded-xl p-3">
                    <div className="text-[10px] text-[#71717A] mb-1 font-bold uppercase tracking-wide">Duration</div>
                    <div className="text-sm font-semibold text-black">{formatDuration(localDuration)}</div>
                  </div>
                </div>

                {/* Total */}
                <div className="px-5 py-4 bg-black flex items-center justify-between rounded-b-2xl">
                  <div>
                    <span className="text-sm font-bold text-white/80 block">Total Amount</span>
                    {selectedSlot?.discountPercentage && (
                      <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider block">
                        Incl. AI Discount (-{selectedSlot.discountPercentage}%)
                      </span>
                    )}
                    {selectedSlot?.valueAdd && (
                      <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        <Sparkles size={10} /> + {selectedSlot.valueAdd}
                      </span>
                    )}
                  </div>
                  <span className="text-2xl font-black text-white">{formatPrice(localTotal)}</span>
                </div>
              </div>

              {/* ── Map Location Card ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#71717A] uppercase tracking-wider font-bold mb-1">Location</div>
                    <p className="text-sm font-semibold text-black">{salon.address.line1}</p>
                    <p className="text-xs text-[#71717A]">{salon.address.area}, {salon.address.city} — {salon.address.pincode}</p>
                  </div>
                  <a
                    href={`https://maps.apple.com/?q=${encodeURIComponent(salon.name + ' ' + salon.address.area + ' ' + salon.address.city)}&ll=${salon.coordinates?.lat || 15.1394},${salon.coordinates?.lng || 76.9214}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
                  >
                    <MapPin size={12} />
                    Directions
                  </a>
                </div>
                {/* OSM Map with Leaflet */}
                <OSMMap
                  lat={salon.coordinates?.lat || 15.1394}
                  lng={salon.coordinates?.lng || 76.9214}
                  zoom={16}
                  height="160px"
                  name={salon.name}
                  address={salon.address.area}
                />
              </div>



              {/* Confirm button */}
              <div className="mt-2">
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="w-full py-4 bg-black text-white font-bold rounded-full text-base hover:bg-gray-900 active:scale-[0.98] transition-all duration-200 shadow-md"
                >
                  {isConfirming ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Confirming your booking...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Check size={18} />
                      Confirm Booking
                    </div>
                  )}
                </button>
                <p className="text-center text-xs text-[#71717A] mt-3">
                  By confirming, you agree to our <span className="underline cursor-pointer">Terms</span> &amp; <span className="underline cursor-pointer">Cancellation Policy</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════
          STICKY BOTTOM BAR — Steps 1, 2, 3
      ════════════════════════════════════════ */}
      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}>
          <div className="max-w-3xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4">
            <div className="flex items-center justify-between gap-4">

              {/* Left: summary info */}
              <div className="flex-1 min-w-0">
                {step === 1 && (
                  localServices.length > 0 ? (
                    <div>
                      <div className="text-xs text-[#71717A] mb-0.5">
                        {localServices.length} service{localServices.length > 1 ? 's' : ''} selected · {formatDuration(localDuration)}
                      </div>
                      <div className="text-xl font-black text-black">{formatPrice(localTotal)}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-semibold text-[#71717A]">No services selected</div>
                      <div className="text-xs text-gray-400">Select at least one service</div>
                    </div>
                  )
                )}
                {step === 2 && (
                  <div>
                    <div className="text-xs text-[#71717A] mb-0.5">Stylist</div>
                    <div className="text-sm font-semibold text-black">
                      {selectedStaff ? selectedStaff.name : 'Any Available'}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    {selectedDate && selectedTime ? (
                      <>
                        <div className="text-xs text-[#71717A] mb-0.5">Selected slot</div>
                        <div className="text-sm font-semibold text-black">
                          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })} · {selectedTime}
                        </div>
                        {selectedSlot?.valueAdd && (
                          <div className="text-[9px] text-purple-600 font-black uppercase tracking-wider flex items-center gap-1 mt-0.5">
                            <Sparkles size={8} className="fill-purple-600" /> BONUS: {selectedSlot.valueAdd}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-[#71717A]">
                          {!selectedDate ? 'Select a date' : 'Select a time slot'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {!selectedDate ? 'Choose from the next 7 days' : 'Pick an available time below'}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Next Step button */}
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed}
                className={cn(
                  'flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-200 flex-shrink-0',
                  canProceed
                    ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.97] shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                {step === 3 ? 'Review' : 'Next'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
