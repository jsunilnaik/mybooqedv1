import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TabTransition } from '../components/layout/PageTransition';
import {
  Calendar, Clock, X, ChevronRight, Scissors, Star, MapPin,
  AlertCircle, Lock, Phone, ArrowRight, CheckCircle2,
  XCircle, Receipt, User, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { bookingService, salonService } from '../lib/dataService';
import { useToast } from '../components/ui/Toast';
import { cn, formatPrice, formatDuration } from '../lib/utils';
import type { Booking } from '../types';
import { buildSalonUrl } from '../utils/seo';

/* ─── Status config ─────────────────────────────────────────── */
const STATUS_CONFIG = {
  confirmed: {
    label: 'Confirmed',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50/50 border-emerald-100',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    timelineDot: 'bg-emerald-500 ring-emerald-100',
  },
  completed: {
    label: 'Completed',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50/50 border-indigo-100',
    dot: 'bg-indigo-400',
    icon: CheckCircle2,
    iconColor: 'text-indigo-400',
    timelineDot: 'bg-indigo-400 ring-indigo-100',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-rose-600',
    bg: 'bg-rose-50/50 border-rose-100',
    dot: 'bg-rose-500',
    icon: XCircle,
    iconColor: 'text-rose-400',
    timelineDot: 'bg-rose-500 ring-rose-100',
  },
};

const TABS = ['Upcoming', 'Completed', 'Cancelled'] as const;
type TabType = typeof TABS[number];

/* ─── Cancel Modal ───────────────────────────────────────────── */
const CancelModal: React.FC<{
  open: boolean;
  booking: Booking | null;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ open, booking, onConfirm, onClose }) => (
  <AnimatePresence>
    {open && booking && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, type: 'spring', damping: 20 }}
          className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10"
        >
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={26} className="text-red-500" />
          </div>
          <h3 className="text-lg font-black text-black text-center mb-1">Cancel Booking?</h3>
          <p className="text-sm text-[#71717A] text-center mb-2 leading-relaxed">
            {booking.salonName}
          </p>
          <p className="text-xs text-[#71717A] text-center mb-6 leading-relaxed">
            {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long'
            })} at {booking.startTime}
          </p>
          <p className="text-xs text-red-500 text-center mb-5 font-medium">
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 text-black rounded-full font-bold text-sm hover:border-black transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold text-sm hover:bg-red-600 transition-colors"
            >
              Yes, Cancel
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

/* ─── Booking Detail Slide Panel ─────────────────────────────── */
const BookingDetailPanel: React.FC<{
  booking: Booking | null;
  onClose: () => void;
  onCancel: (b: Booking) => void;
  onNavigateSalon: (id: string) => void;
}> = ({ booking, onClose, onCancel, onNavigateSalon }) => {
  if (!booking) return null;
  const salon = salonService.getById(booking.salonId);
  const status = STATUS_CONFIG[booking.status];
  const StatusIcon = status.icon;

  return (
    <AnimatePresence>
      {booking && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-white z-[75] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-black text-black text-xl tracking-tight">Booking Details</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] sm:text-xs font-bold text-[#71717A] uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                    #BMS{booking.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 transition-all active:scale-90"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {/* Salon image */}
              {salon?.images?.cover && (
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={salon.images.cover}
                    alt={booking.salonName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white font-black text-xl leading-tight tracking-tight">{booking.salonName}</h3>
                    {salon && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-white">
                          <MapPin size={10} />
                          <span className="text-[10px] font-bold">{salon.address.area}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-white">
                          <Star size={10} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] font-bold">{salon.rating}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Status Card */}
                <div className={cn('relative overflow-hidden p-5 rounded-3xl border transition-all duration-300', status.bg)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', status.bg, 'border border-white/50 shadow-sm')}>
                        <StatusIcon size={20} className={status.iconColor} />
                      </div>
                      <div>
                        <p className={cn('font-black text-sm uppercase tracking-wider', status.color)}>{status.label}</p>
                        <p className="text-[11px] text-[#71717A] font-medium leading-none mt-1">Status Update</p>
                      </div>
                    </div>
                    <div className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', status.bg, status.color, 'border border-white/50')}>
                      Live
                    </div>
                  </div>
                  <p className="text-xs text-[#71717A] leading-relaxed font-medium">
                    {booking.status === 'confirmed'
                      ? 'Your stylist is waiting for you! Please arrive 5 minutes early.'
                      : booking.status === 'completed'
                      ? 'We hope you loved your service! Why not leave a review?'
                      : 'This appointment was removed from the schedule.'}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F7F9FA] rounded-3xl p-5 border border-gray-100 group hover:border-black transition-all">
                    <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center border border-gray-100 mb-3 group-hover:scale-110 transition-transform">
                      <Calendar size={16} className="text-black" />
                    </div>
                    <p className="text-[10px] font-black text-[#71717A] uppercase tracking-widest mb-1">Date</p>
                    <p className="text-xs font-bold text-black">
                      {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="bg-[#F7F9FA] rounded-3xl p-5 border border-gray-100 group hover:border-black transition-all">
                    <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center border border-gray-100 mb-3 group-hover:scale-110 transition-transform">
                      <Clock size={16} className="text-black" />
                    </div>
                    <p className="text-[10px] font-black text-[#71717A] uppercase tracking-widest mb-1">Time</p>
                    <p className="text-xs font-bold text-black">{booking.startTime}</p>
                    <p className="text-[10px] text-[#71717A] font-medium mt-1">{formatDuration(booking.totalDuration)}</p>
                  </div>
                </div>

                {/* Services Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-black uppercase tracking-widest">Services Selection</h4>
                    <span className="text-[10px] font-bold text-[#71717A] bg-gray-100 px-2 py-0.5 rounded-full">
                      {booking.services.length} items
                    </span>
                  </div>
                  <div className="space-y-3">
                    {booking.services.map((svc, idx) => (
                      <div key={idx} className="group relative list-none flex items-center justify-between p-4 bg-[#F7F9FA] rounded-2xl border border-transparent hover:border-black/5 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:bg-black group-hover:text-white transition-colors">
                            <Scissors size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black tracking-tight">{svc.serviceName}</p>
                            {svc.staffName && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                <p className="text-[11px] text-[#71717A] font-medium">with {svc.staffName}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-black text-black">{formatPrice(svc.price || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stylist Card */}
                {booking.services[0]?.staffName && (
                  <div className="bg-black rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-150 transition-transform duration-700">
                      <Sparkles size={60} className="text-white" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-base font-black flex-shrink-0 border border-white/20">
                      {booking.services[0].staffName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-white/50 font-black uppercase tracking-widest mb-0.5">Preferred Stylist</p>
                      <p className="text-sm font-bold text-white tracking-tight">{booking.services[0].staffName}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                      <User size={14} />
                    </div>
                  </div>
                )}

                {/* Bill Summary */}
                <div className="bg-[#F7F9FA] rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200/50">
                    <p className="text-xs font-bold text-[#71717A]">Subtotal</p>
                    <p className="text-sm font-bold text-black">{formatPrice(booking.totalAmount)}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <Receipt size={12} />
                      </div>
                      <span className="text-sm font-black text-black">Total to pay</span>
                    </div>
                    <span className="text-xl font-black text-black underline underline-offset-4 decoration-indigo-200">{formatPrice(booking.totalAmount)}</span>
                  </div>
                </div>

                {/* Salon contact */}
                {salon && (
                  <div className="bg-[#F7F9FA] rounded-3xl p-6 border border-gray-100">
                    <h4 className="text-[10px] font-black text-[#71717A] uppercase tracking-widest mb-4">Location & Contact</h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-7 h-7 bg-white rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <MapPin size={12} className="text-black" />
                        </div>
                        <span className="text-[11px] text-black font-medium leading-relaxed">{salon.address.line1}, {salon.address.area}, {salon.address.city}</span>
                      </div>
                      {salon.phone && (
                        <div className="flex gap-3">
                          <div className="w-7 h-7 bg-white rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0">
                            <Phone size={12} className="text-black" />
                          </div>
                          <a href={`tel:${salon.phone}`} className="text-[11px] text-black font-black hover:text-indigo-600 transition-colors uppercase tracking-tight">{salon.phone}</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="h-6" />
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t border-gray-100 space-y-3 bg-white">
              <button
                onClick={() => onNavigateSalon(booking.salonId)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-black rounded-2xl text-sm font-black text-black hover:bg-black hover:text-white transition-all active:scale-95 shadow-xl shadow-black/5"
              >
                Go to Salon <ArrowRight size={16} />
              </button>
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => onCancel(booking)}
                  className="w-full py-4 text-rose-500 text-sm font-black hover:text-rose-600 transition-all active:scale-95"
                >
                  Cancel appointment
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ─── Booking Card ───────────────────────────────────────────── */
const BookingCard: React.FC<{
  booking: Booking;
  index: number;
  onSelect: (b: Booking) => void;
  onCancel: (b: Booking) => void;
}> = ({ booking, index, onSelect, onCancel }) => {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[booking.status];
  const salon = salonService.getById(booking.salonId);

  const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-gray-100 active:scale-[0.99] flex flex-col"
    >
      {/* Visual Identity Strip */}
      <div className={cn('h-1.5 w-full', status.dot)} />

      <div className="p-1 sm:p-1.5">
        <div className="bg-white rounded-[1.25rem] sm:rounded-[1.4rem] overflow-hidden">
          {/* Salon banner part */}
          <div 
            className="relative h-36 sm:h-44 overflow-hidden cursor-pointer"
            onClick={() => onSelect(booking)}
          >
            {salon?.images?.cover ? (
              <img
                src={salon.images.cover}
                alt={booking.salonName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=300&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Scissors size={40} className="text-gray-200" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Top row badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md',
                status.bg, status.color, 'border-white/20'
              )}>
                <div className={cn('w-1.5 h-1.5 rounded-full shadow-sm', status.dot)} />
                {status.label}
              </div>
              <div className="px-2.5 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white text-[10px] font-black tracking-widest uppercase">
                #{booking.id.slice(-5).toUpperCase()}
              </div>
            </div>

            {/* Bottom info row */}
            <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-white font-black text-base sm:text-lg leading-tight tracking-tight drop-shadow-lg">{booking.salonName}</h3>
              <div className="flex items-center gap-3 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  <MapPin size={10} className="text-white" />
                  <span className="text-white text-[10px] font-bold">{salon?.address.area}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <div className="flex items-center gap-1">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-white text-[10px] font-bold">{salon?.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card body part */}
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50 group/item hover:bg-white hover:border-black transition-all">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover/item:scale-110 transition-transform">
                  <Calendar size={13} className="text-black" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#71717A] uppercase tracking-widest leading-none mb-1">Date</p>
                  <p className="text-xs font-black text-black leading-none">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50 group/item hover:bg-white hover:border-black transition-all">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover/item:scale-110 transition-transform">
                  <Clock size={13} className="text-black" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#71717A] uppercase tracking-widest leading-none mb-1">Start</p>
                  <p className="text-xs font-black text-black leading-none">{booking.startTime}</p>
                </div>
              </div>
            </div>

            {/* Service display */}
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Scissors size={14} className="text-indigo-500" />
                  <p className="text-xs font-black text-black uppercase tracking-widest">
                    {booking.services[0]?.serviceName}
                    {booking.services.length > 1 && (
                      <span className="text-indigo-500 ml-1.5">+{booking.services.length - 1} MORE</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50/50 rounded-2xl mb-4"
                  >
                    <div className="p-3 space-y-2">
                      {booking.services.map((svc, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1.5 px-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                          <div>
                            <p className="text-[11px] font-bold text-black">{svc.serviceName}</p>
                            {svc.staffName && <p className="text-[9px] text-[#71717A]">with {svc.staffName}</p>}
                          </div>
                          <span className="text-[11px] font-black text-black">{formatPrice(svc.price || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer with amount and actions */}
            <div className="flex items-center justify-between pt-5 border-t border-gray-100">
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-[#71717A] uppercase tracking-widest leading-none mb-1">Total Fee</p>
                <p className="text-xl font-black text-black tracking-tight">{formatPrice(booking.totalAmount)}</p>
              </div>

              <div className="flex items-center gap-2">
                {booking.status === 'confirmed' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onCancel(booking); }}
                    className="flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                    title="Cancel Booking"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  onClick={() => onSelect(booking)}
                  className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-95"
                >
                  Review <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Stats Row ──────────────────────────────────────────────── */
const StatsRow: React.FC<{ bookings: Booking[] }> = ({ bookings }) => {
  const upcoming = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {[
        { label: 'Upcoming', value: upcoming, icon: <Calendar size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Completed', value: completed, icon: <CheckCircle2 size={14} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Spent Total', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: <Star size={14} />, color: 'text-black', bg: 'bg-white' },
      ].map((stat) => (
        <div key={stat.label} className={cn('rounded-3xl p-4 text-center border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]', stat.bg)}>
          <div className={cn('flex justify-center mb-2', stat.color)}>{stat.icon}</div>
          <p className={cn('text-sm sm:text-base font-black truncate leading-none', stat.color)}>{stat.value}</p>
          <p className="text-[9px] text-[#71717A] mt-1.5 font-black uppercase tracking-widest">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────── */
const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('Upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-[#F7F9FA] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gray-100">
            <Lock size={32} className="text-black" />
          </div>
          <h2 className="text-2xl font-black text-black mb-2">Sign in to view bookings</h2>
          <p className="text-sm text-[#71717A] mb-6 leading-relaxed max-w-xs mx-auto">
            You need to be logged in to see your appointments and booking history.
          </p>
          <button
            onClick={() => navigate('/account/login')}
            className="px-8 py-3.5 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>
          <div className="mt-4">
            <button
              onClick={() => navigate('/account/signup')}
              className="text-sm text-[#71717A] hover:text-black transition-colors font-medium"
            >
              Don't have an account? <span className="text-black underline">Sign up</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusMap: Record<TabType, Booking['status']> = {
    Upcoming: 'confirmed',
    Completed: 'completed',
    Cancelled: 'cancelled',
  };

  const allBookings = [
    ...bookingService.getUserBookings(user.id, 'confirmed'),
    ...bookingService.getUserBookings(user.id, 'completed'),
    ...bookingService.getUserBookings(user.id, 'cancelled'),
  ];

  const tabBookings = bookingService.getUserBookings(user.id, statusMap[activeTab]);

  const handleCancel = () => {
    if (!cancelTarget) return;
    bookingService.cancel(cancelTarget.id);
    setCancelTarget(null);
    setSelectedBooking(null);
    toast.success('Booking cancelled successfully');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 backdrop-blur-md bg-white/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:flex"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                  My Bookings
                </h1>
                <p className="text-[11px] sm:text-xs text-[#71717A] mt-0.5 font-medium flex items-center gap-1.5">
                  <User size={10} /> Account · {user.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/salons')}
              className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
            >
              New Booking <Scissors size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28">
        {/* Stats */}
        <StatsRow bookings={allBookings} />

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100/50 p-1.5 mb-8 rounded-2xl border border-gray-200/50">
          {TABS.map((tab) => {
            const count = bookingService.getUserBookings(user.id, statusMap[tab]).length;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative',
                  active ? 'bg-white text-black shadow-[0_4px_12px_rgba(0,0,0,0.08)]' : 'text-[#71717A] hover:text-black hover:bg-white/50'
                )}
              >
                {tab}
                {count > 0 && (
                  <span className={cn(
                    'text-[10px] font-black px-1.5 py-0.5 rounded-lg min-w-[20px] transition-colors',
                    active ? 'bg-black text-white' : 'bg-gray-200 text-[#71717A]'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <TabTransition tabKey={activeTab}>
          {tabBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Calendar size={32} className="text-gray-300" />
              </div>
              <h3 className="text-base font-black text-black mb-2">
                No {activeTab.toLowerCase()} bookings
              </h3>
              <p className="text-sm text-[#71717A] mb-6 max-w-xs mx-auto leading-relaxed">
                {activeTab === 'Upcoming'
                  ? "You don't have any upcoming appointments. Discover great salons near you."
                  : activeTab === 'Completed'
                  ? "Your completed appointments will appear here."
                  : "Your cancelled appointments will appear here."}
              </p>
              {activeTab === 'Upcoming' && (
                <button
                  onClick={() => navigate('/salons')}
                  className="px-7 py-3.5 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                  Explore Salons
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {tabBookings.map((booking, i) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  index={i}
                  onSelect={(b) => setSelectedBooking(b)}
                  onCancel={(b) => setCancelTarget(b)}
                />
              ))}
            </div>
          )}
        </TabTransition>
      </div>

      {/* Booking Detail Slide Panel */}
      <BookingDetailPanel
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onCancel={(b) => { setSelectedBooking(null); setCancelTarget(b); }}
        onNavigateSalon={(id) => {
          const s = salonService.getById(id);
          setSelectedBooking(null);
          if (s) navigate(buildSalonUrl(s as any));
          else navigate(`/salons/${id}`);
        }}
      />

      {/* Cancel Modal */}
      <CancelModal
        open={!!cancelTarget}
        booking={cancelTarget}
        onConfirm={handleCancel}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default BookingsPage;
