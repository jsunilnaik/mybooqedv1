import { useState, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Phone, Clock, Calendar, CheckCircle, XCircle, AlertCircle, User, Mail, Scissors, Activity, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useOwnerStore, type OwnerBooking } from '../../store/useOwnerStore';
import { formatPrice, cn } from '../../lib/utils';
import { TabTransition } from '../../components/layout/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['all', 'today', 'upcoming', 'completed', 'cancelled'] as const;
type Tab = typeof TABS[number];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; icon: any; color: string }> = {
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Confirmed', icon: Clock, color: '#3b82f6' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Completed', icon: CheckCircle, color: '#10b981' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-600', label: 'Cancelled', icon: XCircle, color: '#f43f5e' },
  'no-show': { bg: 'bg-stone-50', text: 'text-stone-600', label: 'No-show', icon: AlertCircle, color: '#78716c' },
};

const CATEGORY_MAP: Record<string, any> = {
  'hair': Scissors,
  'nail': Sparkles,
  'skin': Activity,
  'threading': Sparkles,
  'makeup': Sparkles,
  'default': Scissors
};

function getServiceIcon(name: string) {
  const n = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_MAP)) {
    if (n.includes(key)) return icon;
  }
  return CATEGORY_MAP.default;
}

function getTimeRelativeLabel(date: string, startTime: string) {
  const now = new Date();
  const [hours, minutes] = startTime.split(':').map(Number);
  const bookingDate = new Date(date);
  bookingDate.setHours(hours, minutes, 0, 0);
  
  const diffMs = bookingDate.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (Math.abs(diffMins) < 5) return "Now";
  if (diffMins > 0 && diffMins < 60) return `In ${diffMins}m`;
  if (diffMins < 0 && Math.abs(diffMins) < 60) return `${Math.abs(diffMins)}m ago`;
  return null;
}

export default function OwnerBookingsPage() {
  const { bookings, updateBookingStatus, addNote } = useOwnerStore();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<OwnerBooking | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (activeTab === 'today') list = list.filter((b) => b.date === todayStr);
    else if (activeTab === 'upcoming') list = list.filter((b) => b.date >= todayStr && b.status === 'confirmed');
    else if (activeTab === 'completed') list = list.filter((b) => b.status === 'completed');
    else if (activeTab === 'cancelled') list = list.filter((b) => b.status === 'cancelled');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.customerName.toLowerCase().includes(q) || b.customerPhone.includes(q) || b.services.some((s) => s.serviceName.toLowerCase().includes(q)));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, activeTab, search, todayStr]);

  const tabCounts = useMemo(() => ({
    all: bookings.length,
    today: bookings.filter((b) => b.date === todayStr).length,
    upcoming: bookings.filter((b) => b.date > todayStr && b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }), [bookings, todayStr]);

  const stats = useMemo(() => {
    const todayBookings = bookings.filter(b => b.date === todayStr);
    return {
      totalToday: todayBookings.length,
      revenueToday: todayBookings.filter(b => b.status === 'completed').reduce((acc, b) => acc + b.totalAmount, 0),
      confirmedToday: todayBookings.filter(b => b.status === 'confirmed').length,
    };
  }, [bookings, todayStr]);

  const groupedBookings = useMemo(() => {
    const groups: Record<string, OwnerBooking[]> = {};
    filtered.forEach(b => {
      let groupName = 'Upcoming';
      if (b.date === todayStr) groupName = 'Today';
      else if (new Date(b.date).getTime() < new Date(todayStr).getTime()) groupName = 'Past';
      
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(b);
    });
    return groups;
  }, [filtered, todayStr]);

  const handleStatusUpdate = (id: string, status: OwnerBooking['status']) => {
    updateBookingStatus(id, status);
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  const handleSaveNote = () => {
    if (selected && noteText.trim()) {
      addNote(selected.id, noteText.trim());
      setSelected((prev) => prev ? { ...prev, note: noteText.trim() } : null);
    }
  };

  return (
    <div className="flex h-full">
      {/* Main list */}
      <div className={`flex-1 flex flex-col min-w-0 ${selected ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-3 lg:p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h1 className="text-lg lg:text-xl font-bold text-black">Bookings</h1>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-sm border border-gray-200 rounded-full px-2.5 py-1 lg:px-3 lg:py-1.5 hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5" /> Filters <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3 lg:mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone..." className="w-full pl-9 pr-4 py-2 lg:py-2.5 text-xs lg:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar mobile-snap-scroll">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>{tabCounts[tab]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 bg-[#fafafa]">
          {/* Dashboard Pulse */}
          {(activeTab === 'all' || activeTab === 'today') && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="relative group overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                      <TrendingUp size={18} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Expected Income</p>
                  </div>
                  <p className="text-3xl font-black text-black tracking-tight">{formatPrice(stats.revenueToday)}</p>
                  <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                    <CheckCircle size={10} /> {stats.totalToday - stats.confirmedToday} payments verified
                  </p>
                </div>
              </div>

              <div className="relative group overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-100">
                      <Calendar size={18} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Load</p>
                  </div>
                  <p className="text-3xl font-black text-black tracking-tight">{stats.totalToday}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Appointments today</p>
                </div>
              </div>

              <div className="relative group overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-black rounded-2xl text-white shadow-xl shadow-gray-200">
                      <Phone size={18} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Next Check-in</p>
                  </div>
                  <p className="text-xl font-black text-black tracking-tight truncate">
                    {bookings.find(b => b.date === todayStr && b.status === 'confirmed')?.customerName || "No pending"}
                  </p>
                  <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
                    <Clock size={10} /> Call for reminder
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <TabTransition tabKey={activeTab}>
            <div className="space-y-12">
              {filtered.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Calendar size={40} strokeWidth={1.5} />
                  </div>
                  <p className="text-gray-900 font-black text-xl tracking-tight">Your agenda is clear</p>
                  <p className="text-gray-400 text-sm mt-2 max-w-[200px] mx-auto leading-relaxed font-medium">No bookings match your current filter settings.</p>
                </motion.div>
              ) : (
                Object.entries(groupedBookings).map(([groupName, groupList]) => (
                  <div key={groupName} className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                      <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em] whitespace-nowrap">{groupName}</h3>
                      <div className="h-[1px] w-full bg-gradient-to-r from-gray-200 to-transparent" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                      <AnimatePresence mode="popLayout">
                        {groupList.map((booking) => {
                          const s = STATUS_STYLES[booking.status];
                          const StatusIcon = s.icon;
                          const relativeTime = getTimeRelativeLabel(booking.date, booking.startTime);
                          
                          return (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              key={booking.id} 
                              onClick={() => { setSelected(booking); setNoteText(booking.note || ''); }} 
                              className={cn(
                                "group relative bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border-2 cursor-pointer transition-all duration-300 overflow-hidden",
                                selected?.id === booking.id ? 'border-black shadow-xl ring-8 ring-black/5' : 'border-white hover:border-gray-200 hover:shadow-lg'
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center text-lg font-black text-gray-800 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                      {booking.customerName.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg shadow-sm">
                                      <StatusIcon size={12} className={s.text} />
                                    </div>
                                  </div>
                                  
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-[15px] font-black text-black leading-tight truncate">{booking.customerName}</p>
                                      {relativeTime && (
                                        <span className={cn(
                                          "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full",
                                          relativeTime === "Now" ? "bg-red-500 text-white animate-pulse" : "bg-black text-white"
                                        )}>
                                          {relativeTime}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold">
                                      <Phone size={10} strokeWidth={3} />
                                      {booking.customerPhone}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-[15px] font-black text-black tabular-nums">{formatPrice(booking.totalAmount)}</p>
                                  <p className="text-[9px] font-black text-gray-400 mt-1 uppercase tracking-[0.15em]">{booking.totalDuration} min</p>
                                </div>
                              </div>

                              <div className="mt-5 grid grid-cols-2 gap-3">
                                {booking.services.map((svc, idx) => {
                                  const ServiceIcon = getServiceIcon(svc.serviceName);
                                  return (
                                    <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-gray-50/50 rounded-xl border border-gray-100 group-hover:bg-white transition-colors duration-300">
                                      <div className={cn("p-1.5 rounded-lg", selected?.id === booking.id ? "bg-black text-white" : "bg-white text-gray-400 shadow-sm")}>
                                        <ServiceIcon size={10} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-black text-black leading-tight truncate">{svc.serviceName}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate">{svc.staffName}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2 text-[11px] font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-[10px]">
                                    <Clock size={12} strokeWidth={2.5} className="text-gray-400" />
                                    {booking.startTime}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                    <Calendar size={12} strokeWidth={2} />
                                    {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                  <span className="text-[10px] font-black text-black uppercase tracking-widest hidden sm:inline">Details</span>
                                  <ArrowRight size={14} strokeWidth={3} className="text-black" />
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabTransition>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:relative lg:z-auto flex flex-col"
          >
            {/* Mobile Blur Overlay */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-md lg:hidden" 
              onClick={() => setSelected(null)} 
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative ml-auto w-full max-w-sm sm:max-w-md lg:max-w-sm bg-white h-full shadow-[0_-20px_80px_rgba(0,0,0,0.1)] lg:shadow-none border-l border-gray-100 flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 p-6 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-xl">
                <div>
                  <h2 className="font-black text-black text-xl uppercase tracking-tighter">Review Booking</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Live Session View</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelected(null)} 
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-10 pb-32 no-scrollbar">
                {/* Customer Profile Section */}
                <section>
                  <div className="relative p-8 rounded-[2.5rem] bg-black overflow-hidden shadow-2xl">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-[2rem] bg-white text-black flex items-center justify-center text-3xl font-black mb-4 shadow-xl shadow-white/10">
                        {selected.customerName.charAt(0)}
                      </div>
                      <h3 className="text-white font-black text-xl tracking-tight">{selected.customerName}</h3>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mt-1">{selected.customerPhone}</p>
                      
                      <div className="w-full grid grid-cols-2 gap-3 mt-8">
                        <a href={`tel:${selected.customerPhone}`} className="flex items-center justify-center gap-2 py-3 bg-white text-black rounded-2xl text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all">
                          <Phone size={14} fill="currentColor" /> Call
                        </a>
                        <button className="flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-2xl text-xs font-black hover:bg-white/20 transition-all">
                          <Mail size={14} /> Message
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Appointment Schedule */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">Schedule</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-black">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Appointment Date</p>
                        <p className="text-sm font-black text-black mt-0.5">
                          {new Date(selected.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-black">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Slot</p>
                        <p className="text-sm font-black text-black mt-0.5">
                          {selected.startTime} <span className="text-gray-400 mx-2">→</span> {selected.endTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Services Breakdown */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Services</h4>
                    <span className="text-[10px] font-black text-black bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-widest">
                      {selected.services.length} Items
                    </span>
                  </div>
                  <div className="space-y-3">
                    {selected.services.map((svc, i) => {
                      const Icon = getServiceIcon(svc.serviceName);
                      return (
                        <div key={i} className="group relative p-5 bg-white border-2 border-gray-50 rounded-[2.5rem] hover:border-black transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-gray-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-colors">
                                <Icon size={16} />
                              </div>
                              <p className="font-black text-black tracking-tight">{svc.serviceName}</p>
                            </div>
                            <p className="font-black text-black tabular-nums">{formatPrice(svc.price)}</p>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-[10px] uppercase tracking-widest font-black">
                            <div className="flex items-center gap-2 text-gray-400">
                              <User size={12} />
                              BY {svc.staffName}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Clock size={12} />
                              {svc.duration}MIN
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="p-6 bg-gray-900 rounded-[2.5rem] flex items-center justify-between shadow-xl shadow-gray-200">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Final Total</p>
                      <p className="text-2xl font-black text-white">{formatPrice(selected.totalAmount)}</p>
                    </div>
                  </div>
                </section>

                {/* Status Switcher */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">Action Center</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(STATUS_STYLES).map(([key, s]) => {
                      const Icon = s.icon;
                      const isActive = selected.status === key;
                      return (
                        <button 
                          key={key} 
                          onClick={() => handleStatusUpdate(selected.id, key as any)} 
                          className={cn(
                            "relative flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden group/btn",
                            isActive 
                              ? "bg-black border-black text-white shadow-2xl scale-[1.02]" 
                              : "bg-white border-gray-50 text-gray-300 hover:border-gray-200 hover:text-gray-900"
                          )}
                        >
                          {isActive && (
                            <motion.div 
                              layoutId="active-bg" 
                              className="absolute inset-0 bg-black" 
                              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <div className="relative z-10 flex flex-col items-center">
                            <Icon size={20} className={cn("mb-2 group-hover/btn:scale-110 transition-transform", isActive ? "text-white" : "text-gray-300")} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Professional Notes */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">Internal Notes</h4>
                  <div className="relative group">
                    <textarea 
                      value={noteText} 
                      onChange={(e) => setNoteText(e.target.value)} 
                      placeholder="Type private notes here..." 
                      className="w-full text-sm font-bold border-2 border-gray-50 rounded-[2rem] p-6 lg:p-8 resize-none focus:outline-none focus:border-black focus:shadow-2xl h-40 transition-all duration-300 no-scrollbar" 
                    />
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveNote} 
                      className="absolute bottom-4 right-4 bg-black text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-xl hover:bg-gray-800 transition-all"
                    >
                      Update Note
                    </motion.button>
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
