import { useState, useMemo } from 'react';
import { Plus, X, Clock, Calendar as CalendarIcon, User, Trash2, AlertCircle, Coffee, PlusCircle } from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';
import { useToast } from '../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { Staff, StaffWorkDay, StaffBreak } from '../../types';
import type { OwnerSlot } from '../../store/useOwnerStore';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 9 AM to 9 PM

export default function OwnerSlotsPage() {
  const { staff, slots, addSlot, removeSlot, salon } = useOwnerStore();
  const toast = useToast();

  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('10:00');
  const [newSlotDuration, setNewSlotDuration] = useState(30);

  const selectedStaff: Staff | undefined = staff.find(s => s.id === selectedStaffId);
  const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySchedule = selectedStaff?.schedule ? (selectedStaff.schedule as any)[dayName] as StaffWorkDay : undefined;

  const filteredSlots = useMemo(() => {
    return slots.filter(s => s.staffId === selectedStaffId && s.date === selectedDate);
  }, [slots, selectedStaffId, selectedDate]);

  const handleAddSlot = () => {
    if (!selectedStaffId) return;
    
    // Calculate end time
    const [h, m] = newSlotTime.split(':').map(Number);
    const endMinutes = h * 60 + m + newSlotDuration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const newSlot: OwnerSlot = {
      id: `slot_${Math.random().toString(36).substr(2, 9)}`,
      salonId: salon?.id || '',
      staffId: selectedStaffId,
      date: selectedDate,
      startTime: newSlotTime,
      endTime,
      status: 'available'
    };

    addSlot(newSlot);
    setIsAddingSlot(false);
    toast.success('Slot added successfully');
  };

  const getSlotPosition = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const minutesFromStart = (h - 9) * 60 + m;
    return (minutesFromStart / (12 * 60)) * 100;
  };

  const getSlotHeight = (start: string, end: string) => {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const duration = (eH * 60 + eM) - (sH * 60 + sM);
    return (duration / (12 * 60)) * 100;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-black">Slot Allotment</h1>
          <p className="text-gray-500 text-sm">Manage individual staff availability and manual slots</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select 
              value={selectedStaffId} 
              onChange={e => setSelectedStaffId(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-gray-50 border-none rounded-2xl text-sm font-semibold text-black focus:ring-2 focus:ring-black transition-all appearance-none cursor-pointer"
            >
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="relative">
            <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl text-sm font-semibold text-black focus:ring-2 focus:ring-black transition-all cursor-pointer"
            />
          </div>

          <button 
            onClick={() => setIsAddingSlot(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
          >
            <Plus className="w-4 h-4" /> Allot Slot
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Day Status Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-black mb-4">Day Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                <span className={cn("text-xs font-bold px-2 py-1 rounded-lg uppercase", daySchedule?.isClosed ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500")}>
                  {daySchedule?.isClosed ? 'OFF DAY' : 'WORKING'}
                </span>
              </div>
              {!daySchedule?.isClosed && (
                <>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Hours</span>
                    <span className="text-xs font-bold text-black">{daySchedule?.open} - {daySchedule?.close}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Active Slots</span>
                    <span className="text-xs font-bold text-black">{filteredSlots.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {daySchedule?.breaks && daySchedule.breaks.length > 0 && (
            <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
              <h3 className="flex items-center gap-2 font-bold text-orange-900 mb-4">
                <Coffee className="w-4 h-4" /> Scheduled Breaks
              </h3>
              <div className="space-y-2">
              {daySchedule.breaks.map((b: StaffBreak, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold text-orange-800 bg-white/50 p-2 rounded-xl">
                  <span>Break {i + 1}</span>
                  <span>{b.start} - {b.end}</span>
                </div>
              ))}
              </div>
            </div>
          )}

          {daySchedule?.isClosed && (
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <h3 className="font-bold text-red-900 text-sm">Staff is Off</h3>
                <p className="text-xs text-red-700 mt-1">This staff member is not scheduled to work on this day. You can still manually allot slots if needed.</p>
              </div>
            </div>
          )}
        </div>

        {/* Timeline View */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-black">Daily Timeline</h2>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Manual Slot</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-200" /> Working Hours</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-200" /> Breaks</div>
            </div>
          </div>

          <div className="flex-1 relative p-6 pb-12 overflow-y-auto">
            {/* Hour Markers */}
            <div className="absolute inset-x-6 top-6 bottom-12 border-l border-gray-100 ml-16">
              {HOURS.map(h => (
                <div key={h} className="absolute w-full border-t border-gray-100" style={{ top: `${((h - 9) / 12) * 100}%` }}>
                  <span className="absolute -left-16 -top-2.5 w-12 text-right text-[10px] font-bold text-gray-400">
                    {h % 12 || 12} {h >= 12 ? 'PM' : 'AM'}
                  </span>
                </div>
              ))}
            </div>

            {/* Availability Shading */}
            {daySchedule && !daySchedule.isClosed && (
              <div 
                className="absolute left-22 right-6 bg-gray-50/50 rounded-lg pointer-events-none transition-all duration-300"
                style={{ 
                  left: '88px',
                  top: `calc(1.5rem + ${getSlotPosition(daySchedule.open)}%)`, 
                  height: `${getSlotHeight(daySchedule.open, daySchedule.close)}%` 
                }}
              />
            )}

            {/* Breaks Shading */}
            {daySchedule?.breaks.map((b, i) => (
              <div 
                key={i}
                className="absolute left-22 right-6 bg-orange-100/40 rounded-lg pointer-events-none z-10"
                style={{ 
                  left: '88px',
                  top: `calc(1.5rem + ${getSlotPosition(b.start)}%)`, 
                  height: `${getSlotHeight(b.start, b.end)}%` 
                }}
              />
            ))}

            {/* Slots Area */}
            <div className="absolute left-[88px] right-6 top-6 bottom-12 z-20">
              <AnimatePresence>
                {filteredSlots.map((slot: OwnerSlot) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-x-0 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl p-3 shadow-sm group cursor-pointer"
                    style={{ 
                      top: `${getSlotPosition(slot.startTime)}%`, 
                      height: `${getSlotHeight(slot.startTime, slot.endTime)}%` 
                    }}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-blue-900 truncate">{slot.startTime} - {slot.endTime}</p>
                        <p className="text-[8px] font-bold text-blue-600 uppercase tracking-wider">{slot.status}</p>
                      </div>
                      <button 
                        onClick={() => removeSlot(slot.id)}
                        className="p-1 px-1.5 hover:bg-red-500 hover:text-white text-blue-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
      <AnimatePresence>
        {isAddingSlot && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-black flex items-center gap-2">
                  <PlusCircle className="w-5 h-5" /> Allot New Slot
                </h2>
                <button onClick={() => setIsAddingSlot(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Time Slot</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="time" 
                      value={newSlotTime} 
                      onChange={e => setNewSlotTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-black focus:ring-2 focus:ring-black outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Duration (minutes)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map(d => (
                      <button 
                        key={d}
                        onClick={() => setNewSlotDuration(d)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold transition-all border-2",
                          newSlotDuration === d 
                            ? "bg-black border-black text-white" 
                            : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                        )}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium text-blue-700 leading-relaxed">
                    This will create a specific slot for <strong>{selectedStaff?.name}</strong> on <strong>{selectedDate}</strong>.
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <button 
                  onClick={() => setIsAddingSlot(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddSlot}
                  className="flex-1 py-3 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-2xl transition-all shadow-lg shadow-black/10"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
