import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, Zap, X } from 'lucide-react';
import { TabTransition } from '../../components/layout/PageTransition';
import { useOwnerStore } from '../../store/useOwnerStore';
import { formatPrice } from '../../lib/utils';
import categoriesData from '../../data/categories.json';
import type { Service } from '../../types';

const DURATIONS = [15, 20, 30, 45, 60, 90, 120];
const GENDERS = ['male', 'female', 'unisex'] as const;

interface ServiceFormData {
  name: string; categoryId: string; description: string; duration: number;
  price: number; discountPrice: number | null; gender: 'male' | 'female' | 'unisex';
  isPopular: boolean; isActive: boolean;
}

const EMPTY_FORM: ServiceFormData = { name: '', categoryId: '', description: '', duration: 30, price: 0, discountPrice: null, gender: 'unisex', isPopular: false, isActive: true };

export default function OwnerServicesPage() {
  const { services, salon, addService, updateService, deleteService } = useOwnerStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const generateId = () => `svc_${Math.random().toString(36).substr(2, 9)}`;

  const filtered = useMemo(() => {
    if (!search) return services;
    const q = search.toLowerCase();
    return services.filter((s) => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
  }, [services, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, Service[]> = {};
    filtered.forEach((s) => {
      const cat = categoriesData.find((c) => c.id === s.categoryId);
      const key = cat?.name || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [filtered]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (s: Service) => {
    setForm({ name: s.name, categoryId: s.categoryId, description: s.description || '', duration: s.duration, price: s.price, discountPrice: s.discountPrice ?? null, gender: s.gender, isPopular: s.isPopular || false, isActive: s.isActive });
    setEditingId(s.id); setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateService(editingId, form);
    } else {
      const newService: Service = { id: generateId(), salonId: salon?.id || '', name: form.name, categoryId: form.categoryId, description: form.description, duration: form.duration, price: form.price, discountPrice: form.discountPrice, gender: form.gender, isPopular: form.isPopular, isActive: form.isActive };
      addService(newService);
    }
    setShowForm(false); setEditingId(null); setForm(EMPTY_FORM);
  };

  const handleDelete = (id: string) => { deleteService(id); setDeleteConfirm(null); };

  return (
    <div className="p-3 lg:p-6 space-y-4 lg:space-y-5 pb-24 lg:pb-6">
      <div className="flex items-center justify-between gap-2 lg:gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-black">Services</h1>
          <p className="text-[10px] lg:text-sm text-gray-500">{services.length} services listed</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1 lg:gap-1.5 bg-black text-white text-[10px] lg:text-sm font-medium px-3 py-1.5 lg:px-4 lg:py-2 rounded-full hover:bg-gray-800 transition-colors">
          <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Add Service
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="w-full pl-9 pr-4 py-2 lg:py-2.5 text-xs lg:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black" />
      </div>

      {/* Service Groups */}
      <TabTransition tabKey={search || 'all'}>
      <div className="space-y-5">
      {Object.entries(grouped).map(([catName, svcs]) => (
        <div key={catName} className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-3 lg:px-5 py-2.5 lg:py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-xs lg:text-sm font-semibold text-black">{catName}</h2>
            <span className="text-[10px] lg:text-xs text-gray-400">{svcs.length} services</span>
          </div>
          <div className="divide-y divide-gray-50">
            {svcs.map((svc) => (
              <div key={svc.id} className="flex items-center gap-2 lg:gap-4 p-3 lg:p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 lg:gap-2 flex-wrap mb-0.5 lg:mb-0">
                    <p className="text-xs lg:text-sm font-semibold text-black truncate">{svc.name}</p>
                    {svc.isPopular && <span className="flex items-center gap-0.5 text-[9px] lg:text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 lg:px-2 py-0.5 rounded-full"><Zap className="w-2.5 h-2.5" /> Popular</span>}
                    {!svc.isActive && <span className="text-[9px] lg:text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 lg:px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">{svc.duration} min · {svc.gender}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {svc.discountPrice ? (
                    <div>
                      <span className="text-[10px] lg:text-xs text-gray-400 line-through mr-1">{formatPrice(svc.price)}</span>
                      <span className="text-xs lg:text-sm font-bold text-black">{formatPrice(svc.discountPrice)}</span>
                    </div>
                  ) : (
                    <span className="text-xs lg:text-sm font-bold text-black">{formatPrice(svc.price)}</span>
                  )}
                </div>
                <div className="flex items-center flex-shrink-0">
                  <button onClick={() => updateService(svc.id, { isActive: !svc.isActive })} className="p-1 lg:p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black">
                    {svc.isActive ? <ToggleRight className="text-green-500 w-4 h-4 lg:w-[18px] lg:h-[18px]" /> : <ToggleLeft className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />}
                  </button>
                  <button onClick={() => openEdit(svc)} className="p-1 lg:p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black">
                    <Pencil className="w-3.5 h-3.5 lg:w-[15px] lg:h-[15px]" />
                  </button>
                  <button onClick={() => setDeleteConfirm(svc.id)} className="p-1 lg:p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5 lg:w-[15px] lg:h-[15px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">No services found. Add your first service!</p>
          <button onClick={openAdd} className="mt-3 bg-black text-white text-sm px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">Add Service</button>
        </div>
      )}
      </div>
      </TabTransition>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-black mb-2">Delete Service?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-red-600 transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex flex-col justify-end lg:justify-center lg:items-center z-50 p-0 lg:p-4">
          <div className="bg-white rounded-t-3xl lg:rounded-2xl w-full lg:max-w-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl lg:rounded-t-2xl z-10 flex-shrink-0">
              <h2 className="font-bold text-sm lg:text-base text-black">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-4 h-4 lg:w-[18px] lg:h-[18px]" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 lg:p-5">
              <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4 pb-[80px] lg:pb-0">
                <div>
                  <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Service Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Men's Haircut" className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Category *</label>
                  <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black bg-white">
                    <option value="">Select category</option>
                    {categoriesData.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the service..." className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black resize-none h-16 lg:h-20" />
                </div>
                <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
                  <div>
                    <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Duration *</label>
                    <select value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black bg-white">
                      {DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Gender *</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as typeof form.gender })} className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black bg-white">
                      {GENDERS.map((g) => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
                  <div>
                    <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Price (₹) *</label>
                    <input required type="number" min="0" value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="e.g. 200" className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1 lg:mb-1.5">Discount Price (₹)</label>
                    <input type="number" min="0" value={form.discountPrice || ''} onChange={(e) => setForm({ ...form, discountPrice: e.target.value ? Number(e.target.value) : null })} placeholder="Optional" className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:outline-none focus:border-black" />
                  </div>
                </div>
                <div className="flex items-center gap-4 lg:gap-6 pt-1">
                  <label className="flex items-center gap-1.5 lg:gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} className="rounded lg:w-4 lg:h-4 w-3.5 h-3.5" />
                    <span className="text-[10px] lg:text-sm text-gray-700">Mark as Popular</span>
                  </label>
                  <label className="flex items-center gap-1.5 lg:gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded lg:w-4 lg:h-4 w-3.5 h-3.5" />
                    <span className="text-[10px] lg:text-sm text-gray-700">Active</span>
                  </label>
                </div>
                <div className="fixed lg:relative bottom-0 left-0 right-0 p-3 lg:p-0 bg-white lg:bg-transparent border-t lg:border-t-0 border-gray-100 flex gap-2 lg:gap-3 pt-2 lg:pt-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:shadow-none">
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 border border-gray-200 text-xs lg:text-sm font-medium py-2 lg:py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-black text-white text-xs lg:text-sm font-semibold py-2 lg:py-3 rounded-xl hover:bg-gray-800 transition-colors">
                    {editingId ? 'Save' : 'Add Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
