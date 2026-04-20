import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TabTransition } from '../components/layout/PageTransition';
import {
  Calendar, Clock, X, Scissors, MapPin,
  AlertCircle, ArrowRight, CheckCircle2,
  XCircle, Receipt, Sparkles,
  Edit2, Mail, LogOut, Settings, Heart
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
          className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl z-10"
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
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-100 text-black rounded-2xl font-bold text-sm hover:border-black transition-colors"
            >
              Keep
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
            >
              Cancel
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
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 transition-all active:scale-90">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {/* Salon image box */}
              {salon && (
                <div className="relative h-44 rounded-3xl overflow-hidden mb-6 shadow-xl shadow-black/5">
                  <img src={salon.images.cover} alt={booking.salonName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                    <h3 className="text-white font-black text-lg leading-tight">{booking.salonName}</h3>
                    <p className="text-white/60 text-xs font-medium mt-1">{salon.address.area}</p>
                  </div>
                </div>
              )}

              {/* Status information */}
              <div className={cn('p-5 rounded-3xl border flex items-center gap-4 transition-all', status.bg)}>
                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm', status.bg, 'border border-white/50')}>
                  <StatusIcon size={20} className={status.iconColor} />
                </div>
                <div>
                  <p className={cn('font-black text-sm uppercase tracking-wider', status.color)}>{status.label}</p>
                  <p className="text-[11px] text-[#71717A] font-medium leading-none mt-1">Order Status</p>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F7F9FA] rounded-3xl p-5 border border-gray-100">
                  <Calendar size={16} className="text-black mb-3" />
                  <p className="text-[10px] font-black text-[#71717A] uppercase tracking-widest mb-1">Date</p>
                  <p className="text-xs font-bold text-black">{new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="bg-[#F7F9FA] rounded-3xl p-5 border border-gray-100">
                  <Clock size={16} className="text-black mb-3" />
                  <p className="text-[10px] font-black text-[#71717A] uppercase tracking-widest mb-1">Time</p>
                  <p className="text-xs font-bold text-black">{booking.startTime}</p>
                  <p className="text-[10px] text-[#71717A] font-medium mt-1">{formatDuration(booking.totalDuration)}</p>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Services Selection</h4>
                {booking.services.map((svc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-[#F7F9FA] rounded-2xl border border-gray-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                        <Scissors size={14} />
                      </div>
                      <p className="text-sm font-bold text-black">{svc.serviceName}</p>
                    </div>
                    <span className="text-sm font-black text-black">{formatPrice(svc.price || 0)}</span>
                  </div>
                ))}
              </div>

              {/* Billing Info */}
              <div className="bg-black rounded-3xl p-6 text-white shadow-xl shadow-black/10">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10 opacity-60">
                  <p className="text-xs font-bold">Total Services</p>
                  <p className="text-sm font-bold">{booking.services.length}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt size={16} className="text-indigo-400" />
                    <span className="text-sm font-black uppercase tracking-wider">Total Amount</span>
                  </div>
                  <span className="text-2xl font-black">{formatPrice(booking.totalAmount)}</span>
                </div>
              </div>

               {/* Stylist info */}
               {booking.services[0]?.staffName && (
                  <div className="bg-[#F7F9FA] rounded-3xl p-5 border border-gray-100 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-indigo-600 border border-gray-100 shadow-sm">
                        {booking.services[0].staffName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] text-[#71717A] font-black uppercase tracking-widest">Your Stylist</p>
                        <p className="text-sm font-bold text-black">{booking.services[0].staffName}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                      <Sparkles size={14} />
                    </div>
                  </div>
                )}
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t border-gray-100 space-y-3 bg-white">
              <button
                onClick={() => onNavigateSalon(booking.salonId)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl text-sm font-black shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all"
              >
                Go to Salon <ArrowRight size={16} />
              </button>
              {booking.status === 'confirmed' && (
                <button onClick={() => onCancel(booking)} className="w-full py-2 text-rose-500 text-xs font-bold uppercase tracking-widest hover:text-rose-600">
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
  const status = STATUS_CONFIG[booking.status];
  const salon = salonService.getById(booking.salonId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => onSelect(booking)}
      className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-black transition-all shadow-sm hover:shadow-xl hover:shadow-black/5 cursor-pointer relative overflow-hidden"
    >
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', status.dot)} />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[14px] overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
            <img 
              src={salon?.images.cover || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop'} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              alt="" 
            />
          </div>
          <div>
            <h3 className="text-sm font-black text-black leading-tight truncate max-w-[150px]">{booking.salonName}</h3>
            <p className="text-[10px] text-[#71717A] font-medium mt-0.5">{booking.startTime} · {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
        <div className={cn('px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest', status.bg, status.color, 'border border-white/50')}>
          {status.label}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <Scissors size={12} className="text-[#9CA3AF]" />
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest">{booking.services[0].serviceName}</span>
          {booking.services.length > 1 && <span className="text-[9px] font-black text-indigo-500">+{booking.services.length-1}</span>}
        </div>
        <span className="text-sm font-black text-black">{formatPrice(booking.totalAmount)}</span>
      </div>
    </motion.div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────── */
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('Upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  if (!isAuthenticated || !user) {
    navigate('/account/login');
    return null;
  }

  const allBookings = [
    ...bookingService.getUserBookings(user.id, 'confirmed'),
    ...bookingService.getUserBookings(user.id, 'completed'),
    ...bookingService.getUserBookings(user.id, 'cancelled'),
  ];

  const upcomingBookings = bookingService.getUserBookings(user.id, 'confirmed');
  const completedBookings = bookingService.getUserBookings(user.id, 'completed');
  const cancelledBookings = bookingService.getUserBookings(user.id, 'cancelled');

  const tabBookings = activeTab === 'Upcoming' ? upcomingBookings : activeTab === 'Completed' ? completedBookings : cancelledBookings;

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    try {
      await updateProfile({ name: name.trim() });
      setEditing(false);
      toast.success('Name updated');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCancelBooking = () => {
    if (!cancelTarget) return;
    bookingService.cancel(cancelTarget.id);
    setCancelTarget(null);
    setSelectedBooking(null);
    toast.success('Booking cancelled');
  };

  const stats = [
    { label: 'Upcoming', value: upcomingBookings.length, icon: Calendar, color: 'text-emerald-500' },
    { label: 'Completed', value: completedBookings.length, icon: CheckCircle2, color: 'text-indigo-500' },
    { label: 'Saved', value: 8, icon: Heart, color: 'text-rose-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-6">
          <div className="flex flex-col items-center">
            
            {/* Avatar Group */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-[32px] bg-black shadow-2xl shadow-black/10 flex items-center justify-center text-3xl font-black text-white p-1 border-4 border-white overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover rounded-[28px]" alt="" />
                ) : user.name.charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={() => navigate('/user/settings')}
                className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all"
              >
                <Settings size={16} />
              </button>
            </div>

            {/* Name & Location */}
            {editing ? (
              <div className="flex flex-col items-center gap-3">
                <input 
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="bg-[#F7F9FA] border-2 border-black rounded-2xl px-4 py-2 text-center text-lg font-black outline-none w-64"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateName} className="px-5 py-2 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-black/10">Save</button>
                  <button onClick={() => { setEditing(false); setName(user.name); }} className="px-5 py-2 bg-gray-100 text-black rounded-full text-xs font-black uppercase tracking-widest">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="text-center group">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-2xl font-black text-black tracking-tight">{user.name}</h1>
                  <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-lg transition-all">
                    <Edit2 size={14} className="text-[#9CA3AF]" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-2 mt-2">
                  <p className="text-xs text-[#71717A] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                    <MapPin size={12} className="text-rose-500 flex-shrink-0" /> {user.city}
                  </p>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
                  <p className="text-xs text-[#71717A] font-bold uppercase tracking-widest flex items-center gap-1.5 max-w-[280px] sm:max-w-none">
                    <Mail size={12} className="text-indigo-500 flex-shrink-0" /> <span className="truncate">{user.email}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-10">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#F7F9FA] rounded-[24px] p-4 text-center border border-gray-100">
                <div className="flex justify-center mb-2">
                  <s.icon size={16} className={s.color} />
                </div>
                <p className="text-lg font-black text-black leading-none">{s.value}</p>
                <p className="text-[9px] font-black text-[#71717A] uppercase tracking-widest mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOOKINGS CONTENT ── */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        
        {/* Tab Selection */}
        <div className="flex gap-1.5 bg-white p-1.5 mb-8 rounded-[24px] border border-gray-100 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-300 relative',
                activeTab === tab ? 'bg-black text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] scale-[1.02]' : 'text-[#71717A] hover:text-black hover:bg-gray-50'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List Content */}
        <TabTransition tabKey={activeTab}>
          {tabBookings.length === 0 ? (
            <div className="text-center py-20 px-10">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                <Calendar size={32} className="text-gray-200" />
              </div>
              <h3 className="text-lg font-black text-black mb-2">No {activeTab.toLowerCase()} bookings</h3>
              <p className="text-sm text-[#71717A] font-medium leading-relaxed mb-8">
                {activeTab === 'Upcoming' ? "Time for a glow up? Discover top-rated salons near you." : "Your history will appear here once you've completed some appointments."}
              </p>
              {activeTab === 'Upcoming' && (
                <button onClick={() => navigate('/salons')} className="px-8 py-4 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all">Explore Salons</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tabBookings.map((b, i) => (
                <BookingCard key={b.id} booking={b} index={i} onSelect={setSelectedBooking} onCancel={setCancelTarget} />
              ))}
            </div>
          )}
        </TabTransition>

        {/* Action Logout */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col items-center gap-4">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-red-50 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
          >
            <LogOut size={16} /> Sign out from BMS
          </button>
          <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-[0.2em]">Luxury at your fingertips · v1.2</p>
        </div>
      </div>

      {/* Modals & Panels */}
      <BookingDetailPanel 
        booking={selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
        onCancel={setCancelTarget}
        onNavigateSalon={(id) => {
          setSelectedBooking(null);
          const s = salonService.getById(id);
          if (s) navigate(buildSalonUrl(s as any));
          else navigate(`/salons/${id}`);
        }}
      />

      <CancelModal 
        open={!!cancelTarget} 
        booking={cancelTarget} 
        onConfirm={handleCancelBooking} 
        onClose={() => setCancelTarget(null)} 
      />
    </div>
  );
};

export default ProfilePage;
