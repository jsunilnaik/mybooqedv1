import { useState } from 'react';
import { Plus, Pencil, Trash2, Star, ToggleLeft, ToggleRight, X, Phone, Calendar as CalendarIcon, Clock, Coffee, PlusCircle } from 'lucide-react';
import { useOwnerStore, DEFAULT_STAFF_SCHEDULE } from '../../store/useOwnerStore';
import type { Staff, StaffSchedule, StaffWorkDay, StaffBreak } from '../../types';
import { ImageUpload } from '../../components/ui/ImageUpload';

const ROLES = ['Senior Stylist', 'Stylist', 'Barber', 'Senior Barber', 'Beautician', 'Senior Beautician', 'Makeup Artist', 'Spa Therapist', 'Nail Technician'];
const SPECIALIZATIONS = ['Haircut', 'Hair Color', 'Beard Trim', 'Facial', 'Bridal Makeup', 'Spa & Massage', 'Nail Art', 'Hair Straightening', 'Keratin Treatment', 'Threading', 'Waxing', 'Kids Haircut'];
const AVATAR_STYLES = ['https://api.dicebear.com/7.x/avataaars/svg?seed=', 'https://api.dicebear.com/7.x/personas/svg?seed='];

interface StaffFormData { name: string; role: string; experience: number; phone: string; avatar: string; specializations: string[]; isAvailable: boolean; rating: number; schedule: StaffSchedule; bio: string; upiId: string; portfolioImages: string[]; }
const EMPTY_FORM: StaffFormData = { name: '', role: 'Stylist', experience: 1, phone: '', avatar: '', specializations: [], isAvailable: true, rating: 4.0, schedule: DEFAULT_STAFF_SCHEDULE, bio: '', upiId: '', portfolioImages: [] };
const generateId = () => `stf_${Math.random().toString(36).substr(2, 9)}`;

export default function OwnerStaffPage() {
  const { staff, salon, addStaff, updateStaff, deleteStaff } = useOwnerStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (s: Staff) => {
    setForm({ name: s.name, role: s.role, experience: s.experience, phone: '', avatar: s.avatar || '', specializations: s.specializations || [], isAvailable: s.isAvailable, rating: s.rating, schedule: s.schedule || DEFAULT_STAFF_SCHEDULE, bio: s.bio || '', upiId: s.upiId || '', portfolioImages: s.portfolioImages || [] });
    setEditingId(s.id); setShowForm(true); setModalTab('info');
  };

  const [modalTab, setModalTab] = useState<'info' | 'schedule' | 'portfolio'>('info');

  const updateDay = (day: keyof StaffSchedule, data: Partial<StaffWorkDay>) => {
    setForm(f => ({
      ...f,
      schedule: {
        ...f.schedule,
        [day]: { ...f.schedule[day], ...data }
      }
    }));
  };

  const addBreak = (day: keyof StaffSchedule) => {
    setForm(f => ({
      ...f,
      schedule: {
        ...f.schedule,
        [day]: {
          ...f.schedule[day],
          breaks: [...f.schedule[day].breaks, { start: '13:00', end: '14:00' }]
        }
      }
    }));
  };

  const removeBreak = (day: keyof StaffSchedule, index: number) => {
    setForm(f => ({
      ...f,
      schedule: {
        ...f.schedule,
        [day]: {
          ...f.schedule[day],
          breaks: f.schedule[day].breaks.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const updateBreak = (day: keyof StaffSchedule, index: number, data: Partial<StaffBreak>) => {
    setForm(f => ({
      ...f,
      schedule: {
        ...f.schedule,
        [day]: {
          ...f.schedule[day],
          breaks: f.schedule[day].breaks.map((b, i) => i === index ? { ...b, ...data } : b)
        }
      }
    }));
  };

  const toggleSpec = (spec: string) => {
    setForm((f) => ({ ...f, specializations: f.specializations.includes(spec) ? f.specializations.filter((s) => s !== spec) : [...f.specializations, spec] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.name.trim() === '') {
      alert('Strict Validation: Full Name is required to save.');
      return;
    }
    if (editingId) {
      updateStaff(editingId, { ...form });
    } else {
      const newStaff: Staff = { id: generateId(), salonId: salon?.id || '', name: form.name, role: form.role, experience: form.experience, avatar: form.avatar || `${AVATAR_STYLES[0]}${form.name}`, specializations: form.specializations, isAvailable: form.isAvailable, rating: form.rating, schedule: form.schedule, bio: form.bio, upiId: form.upiId, portfolioImages: form.portfolioImages };
      addStaff(newStaff);
    }
    setShowForm(false); setEditingId(null); setForm(EMPTY_FORM);
  };

  return (
    <div className="p-3 lg:p-6 space-y-4 lg:space-y-5 pb-24 lg:pb-6">
      <div className="flex items-center justify-between gap-2 lg:gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-black">Staff</h1>
          <p className="text-[10px] lg:text-sm text-gray-500">{staff.length} team members</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1 lg:gap-1.5 bg-black text-white text-[10px] lg:text-sm font-medium px-3 py-1.5 lg:px-4 lg:py-2 rounded-full hover:bg-gray-800 transition-colors">
          <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Add Staff
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {staff.map((member) => (
          <div key={member.id} className="bg-white rounded-xl lg:rounded-2xl p-3.5 lg:p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3 lg:mb-4">
                <div className="flex items-center gap-2.5 lg:gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg lg:text-xl font-bold text-gray-600">{member.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full border-2 border-white ${member.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-black text-xs lg:text-sm truncate">{member.name}</p>
                    <p className="text-[10px] lg:text-xs text-gray-500 truncate">{member.role}</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Star className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-[10px] lg:text-xs font-medium text-gray-700">{member.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 lg:gap-1 flex-shrink-0 -mr-1 lg:-mr-0">
                  <button onClick={() => updateStaff(member.id, { isAvailable: !member.isAvailable })} className="p-1 lg:p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    {member.isAvailable ? <ToggleRight className="w-[18px] h-[18px] text-green-500" /> : <ToggleLeft className="w-[18px] h-[18px] text-gray-400" />}
                  </button>
                  <button onClick={() => openEdit(member)} className="p-1 lg:p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black">
                    <Pencil className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(member.id)} className="p-1 lg:p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 lg:space-y-2 mb-3 lg:mb-0">
                <div className="flex items-center justify-between text-[10px] lg:text-xs">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-medium text-black">{member.experience} {member.experience === 1 ? 'year' : 'years'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] lg:text-xs">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${member.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>{member.isAvailable ? 'Available' : 'Unavailable'}</span>
                </div>
                {member.specializations && member.specializations.length > 0 && (
                  <div className="pt-1.5 lg:pt-2">
                    <p className="text-[9px] lg:text-xs text-gray-400 mb-1 lg:mb-1.5">Specializations</p>
                    <div className="flex flex-wrap gap-1">
                      {member.specializations.slice(0, 3).map((spec) => (
                        <span key={spec} className="text-[9px] lg:text-[10px] bg-gray-100 text-gray-600 px-1.5 lg:px-2 py-0.5 rounded-full">{spec}</span>
                      ))}
                      {member.specializations.length > 3 && <span className="text-[9px] lg:text-[10px] bg-gray-100 text-gray-500 px-1.5 lg:px-2 py-0.5 rounded-full">+{member.specializations.length - 3}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <button onClick={openAdd} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-white transition-all min-h-[200px]">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <Plus size={20} className="text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-500">Add Team Member</p>
        </button>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-black mb-2">Remove Staff Member?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { deleteStaff(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 bg-red-500 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-red-600 transition-colors">Remove</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex flex-col justify-end lg:justify-center lg:items-center z-50 p-0 lg:p-4">
          <div className="bg-white rounded-t-3xl lg:rounded-2xl w-full lg:max-w-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white px-4 lg:px-5 border-b border-gray-100 rounded-t-3xl lg:rounded-t-2xl z-10 flex-shrink-0">
              <div className="py-3 lg:py-4 flex items-center justify-between">
                <h2 className="font-bold text-sm lg:text-base text-black">{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-4 h-4 lg:w-[18px] lg:h-[18px]" /></button>
              </div>
              <div className="flex gap-4 pb-0 overflow-x-auto no-scrollbar">
                <button type="button" onClick={() => setModalTab('info')} className={`whitespace-nowrap pb-2 text-xs lg:text-sm font-semibold transition-colors border-b-2 ${modalTab === 'info' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>General Info</button>
                <button type="button" onClick={() => setModalTab('schedule')} className={`whitespace-nowrap pb-2 text-xs lg:text-sm font-semibold transition-colors border-b-2 ${modalTab === 'schedule' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>Work Schedule</button>
                <button type="button" onClick={() => setModalTab('portfolio')} className={`whitespace-nowrap pb-2 text-xs lg:text-sm font-semibold transition-colors border-b-2 ${modalTab === 'portfolio' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>Portfolio & Tipping</button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 lg:p-5">
              <div className="space-y-3 lg:space-y-4 pb-[80px] lg:pb-0">
                {modalTab === 'info' && (
                  <div className="space-y-3 lg:space-y-4">
                    <div>
                      <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Full Name *</label>
                      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Raju Kumar" className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black" />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
                      <div>
                        <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Role *</label>
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black bg-white">
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Experience (years)</label>
                        <input type="number" min="0" max="50" value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Phone <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91-9876543210" className="w-full pl-8 sm:pl-9 pr-4 border border-gray-200 rounded-xl py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black" />
                      </div>
                    </div>
                    <ImageUpload 
                      label="Staff Avatar"
                      value={form.avatar}
                      onChange={(url) => setForm({ ...form, avatar: url })}
                      className="max-w-[150px]"
                    />
                    <div>
                      <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5 lg:mb-2">Specializations</label>
                      <div className="flex flex-wrap gap-1.5 lg:gap-2">
                        {SPECIALIZATIONS.map((spec) => (
                          <button type="button" key={spec} onClick={() => toggleSpec(spec)} className={`text-[10px] lg:text-xs px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full border transition-colors ${form.specializations.includes(spec) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-1.5 lg:gap-2 cursor-pointer pt-1">
                      <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="rounded lg:w-4 lg:h-4 w-3.5 h-3.5" />
                      <span className="text-[10px] lg:text-sm text-gray-700">Currently Available</span>
                    </label>
                  </div>
                )}
                {modalTab === 'schedule' && (
                  <div className="space-y-5">
                    {(Object.keys(form.schedule) as Array<keyof StaffSchedule>).map((day) => (
                      <div key={day} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-bold text-black capitalize">{day}</span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-[10px] font-medium text-gray-500">{form.schedule[day].isClosed ? 'Off' : 'On'}</span>
                            <div onClick={() => updateDay(day, { isClosed: !form.schedule[day].isClosed })} className={`w-8 h-4 rounded-full transition-colors relative ${form.schedule[day].isClosed ? 'bg-gray-200' : 'bg-black'}`}>
                              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${form.schedule[day].isClosed ? 'left-0.5' : 'left-4.5'}`} />
                            </div>
                          </label>
                        </div>

                        {!form.schedule[day].isClosed && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Start Time</label>
                                <div className="relative">
                                  <Clock className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <input type="time" value={form.schedule[day].open} onChange={(e) => updateDay(day, { open: e.target.value })} className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">End Time</label>
                                <div className="relative">
                                  <Clock className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <input type="time" value={form.schedule[day].close} onChange={(e) => updateDay(day, { close: e.target.value })} className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black" />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-bold text-gray-400 uppercase">Breaks</label>
                                <button type="button" onClick={() => addBreak(day)} className="flex items-center gap-1 text-[9px] font-bold text-black bg-white border border-gray-200 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors">
                                  <PlusCircle className="w-2.5 h-2.5" /> Add Break
                                </button>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {form.schedule[day].breaks.map((brk, idx) => (
                                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100">
                                    <Coffee className="w-3 h-3 text-gray-400" />
                                    <input type="time" value={brk.start} onChange={(e) => updateBreak(day, idx, { start: e.target.value })} className="text-[10px] w-20 border-none focus:ring-0 p-0" />
                                    <span className="text-[10px] text-gray-400">—</span>
                                    <input type="time" value={brk.end} onChange={(e) => updateBreak(day, idx, { end: e.target.value })} className="text-[10px] w-20 border-none focus:ring-0 p-0" />
                                    <button type="button" onClick={() => removeBreak(day, idx)} className="ml-auto p-1 text-gray-400 hover:text-red-500">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                {form.schedule[day].breaks.length === 0 && (
                                  <p className="text-[10px] text-gray-400 italic py-1">No breaks scheduled</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {modalTab === 'portfolio' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Stylist Bio</label>
                      <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="E.g., Master in fades and coloring..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs min-h-[80px] focus:outline-none focus:border-black resize-none" />
                    </div>
                    <div>
                      <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">UPI ID for Direct Tipping</label>
                      <input value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} placeholder="E.g., rohan@okhdfcbank" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">Portfolio Images</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                        {form.portfolioImages.map((img, idx) => (
                           <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                             <img src={img} className="w-full h-full object-cover" />
                             <button type="button" onClick={() => setForm(f => ({ ...f, portfolioImages: f.portfolioImages.filter((_, i) => i !== idx) }))} className="absolute top-1.5 right-1.5 bg-white/90 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-red-500 shadow-sm border border-gray-100">
                               <Trash2 className="w-3.5 h-3.5" />
                             </button>
                           </div>
                        ))}
                      </div>
                      <div className="flex gap-2 items-center">
                        <label className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer flex-1 text-center">
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            className="hidden" 
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (!files.length) return;
                              
                              const validFiles = files.filter(f => {
                                if (f.size > 2 * 1024 * 1024) { alert(`File ${f.name} is too large (over 2MB).`); return false; }
                                return true;
                              });

                              const readPromises = validFiles.map(file => {
                                return new Promise<string>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => resolve(ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                });
                              });

                              Promise.all(readPromises).then(urls => {
                                setForm(f => ({ ...f, portfolioImages: [...f.portfolioImages, ...urls] }));
                              });
                              
                              e.target.value = '';
                            }} 
                           />
                           Upload from Device
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="fixed lg:relative bottom-0 left-0 right-0 p-3 lg:p-0 bg-white lg:bg-transparent border-t lg:border-t-0 border-gray-100 flex gap-2 lg:gap-3 pt-2 lg:pt-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:shadow-none">
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 border border-gray-200 text-xs lg:text-sm font-medium py-2 lg:py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={(e) => handleSubmit(e as unknown as React.FormEvent)} className="flex-1 bg-black text-white text-xs lg:text-sm font-semibold py-2 lg:py-3 rounded-xl hover:bg-gray-800 transition-colors">
                    {editingId ? 'Save' : 'Add Staff'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
