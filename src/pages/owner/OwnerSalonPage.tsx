import { useState } from 'react';
import {
  Store, MapPin, Phone, Mail, Clock, Image, CheckSquare,
  Save, Eye, ToggleLeft, ToggleRight, Plus, X, Globe
} from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';
import { useToast } from '../../components/ui/Toast';
import { TabTransition } from '../../components/layout/PageTransition';
import type { SalonType } from '../../types/salon';
import { ImageUpload } from '../../components/ui/ImageUpload';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};
const AMENITIES_LIST = ['AC', 'WiFi', 'Parking', 'Card Payment', 'UPI Payment', 'Waiting Area', 'TV', 'Kids Area', 'Wheelchair Access'];
const SALON_TYPES: { value: SalonType; label: string; desc: string }[] = [
  { value: 'unisex', label: 'Unisex', desc: 'Serves everyone' },
  { value: 'men', label: "Men's", desc: 'Men & boys only' },
  { value: 'women', label: "Women's", desc: 'Women & girls only' },
];

type DayHours = { open: string; close: string; isClosed: boolean };

interface FormState {
  name: string;
  description: string;
  type: SalonType;
  phone: string;
  email: string;
  line1: string;
  area: string;
  city: string;
  pincode: string;
  coverImage: string;
  galleryImages: string[];
  amenities: string[];
  openingHours: Record<string, DayHours>;
  isActive: boolean;
}

const DEFAULT_HOURS: Record<string, DayHours> = {
  monday: { open: '09:00', close: '21:00', isClosed: false },
  tuesday: { open: '09:00', close: '21:00', isClosed: false },
  wednesday: { open: '09:00', close: '21:00', isClosed: false },
  thursday: { open: '09:00', close: '21:00', isClosed: false },
  friday: { open: '09:00', close: '21:00', isClosed: false },
  saturday: { open: '09:00', close: '21:00', isClosed: false },
  sunday: { open: '10:00', close: '19:00', isClosed: false },
};

export default function OwnerSalonPage() {
  const { salon, updateSalon } = useOwnerStore();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'hours' | 'photos' | 'amenities'>('basic');
  const [previewMode, setPreviewMode] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const [form, setForm] = useState<FormState>({
    name: salon?.name || '',
    description: salon?.description || '',
    type: (salon?.type as SalonType) || 'unisex',
    phone: salon?.phone || '',
    email: salon?.email || '',
    line1: salon?.address?.line1 || '',
    area: salon?.address?.area || '',
    city: salon?.address?.city || '',
    pincode: salon?.address?.pincode || '',
    coverImage: salon?.images?.cover || '',
    galleryImages: salon?.images?.gallery || [],
    amenities: salon?.amenities || [],
    openingHours: (salon?.openingHours as unknown as Record<string, DayHours>) || DEFAULT_HOURS,
    isActive: salon?.isActive ?? true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    updateSalon({
      name: form.name,
      description: form.description,
      type: form.type,
      phone: form.phone,
      email: form.email,
      address: { line1: form.line1, area: form.area, city: form.city, state: 'India', pincode: form.pincode },
      images: { cover: form.coverImage, gallery: form.galleryImages },
      amenities: form.amenities,
      isActive: form.isActive,
    });
    setSaving(false);
    toast.success('Salon profile updated successfully!');
  };

  const toggleAmenity = (a: string) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
  };

  const addGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setForm(f => ({ ...f, galleryImages: [...f.galleryImages, newGalleryUrl.trim()] }));
      setNewGalleryUrl('');
    }
  };

  const removeGalleryImage = (idx: number) => {
    setForm(f => ({ ...f, galleryImages: f.galleryImages.filter((_, i) => i !== idx) }));
  };

  const updateHours = (day: string, field: keyof DayHours, value: string | boolean) => {
    setForm(f => ({
      ...f,
      openingHours: {
        ...f.openingHours,
        [day]: { ...(f.openingHours[day] || DEFAULT_HOURS[day]), [field]: value },
      },
    }));
  };

  const TABS = [
    { id: 'basic', label: 'Basic Info', icon: Store },
    { id: 'hours', label: 'Opening Hours', icon: Clock },
    { id: 'photos', label: 'Photos', icon: Image },
    { id: 'amenities', label: 'Amenities', icon: CheckSquare },
  ];

  return (
    <div className="p-3 lg:p-8 space-y-4 lg:space-y-6 max-w-4xl pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4">
        <div>
          <h1 className="text-lg lg:text-2xl font-bold text-black">Salon Profile</h1>
          <p className="text-[#71717A] text-[10px] lg:text-sm mt-0.5 lg:mt-1">Manage your salon details visible to customers</p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-1.5 lg:gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-full border-2 border-gray-200 text-xs lg:text-sm font-medium text-black hover:border-black transition-all"
          >
            <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 lg:gap-2 bg-black text-white px-4 py-2 lg:px-5 lg:py-2.5 rounded-full text-xs lg:text-sm font-medium hover:bg-gray-900 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Active toggle */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm p-3.5 lg:p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-black text-xs lg:text-sm">Salon Status</p>
          <p className="text-[10px] lg:text-xs text-[#71717A] mt-0.5 pr-2">
            {form.isActive ? 'Your salon is visible to customers' : 'Your salon is hidden from customers'}
          </p>
        </div>
        <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
          {form.isActive ? <ToggleRight className="w-8 h-8 lg:w-10 lg:h-10 text-green-500" /> : <ToggleLeft className="w-8 h-8 lg:w-10 lg:h-10 text-gray-300" />}
          <span className={`text-xs lg:text-sm font-semibold ${form.isActive ? 'text-green-600' : 'text-gray-400'}`}>
            {form.isActive ? 'Active' : 'Inactive'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar mobile-snap-scroll">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 lg:gap-2 px-4 py-3 lg:px-5 lg:py-4 text-xs lg:text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 snap-start ${
                  activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-[#71717A] hover:text-black'
                }`}
              >
                <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 lg:p-6">
          <TabTransition tabKey={activeTab}>
          {/* BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4 lg:space-y-5">
              <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] lg:text-xs font-semibold text-black mb-1.5 lg:mb-2 uppercase tracking-wide">Salon Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 lg:px-4 lg:py-3 border-2 border-gray-100 rounded-xl text-xs lg:text-sm text-black focus:outline-none focus:border-black transition-all"
                    placeholder="e.g. Your Premium Salon"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] lg:text-xs font-semibold text-black mb-1.5 lg:mb-2 uppercase tracking-wide">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2.5 lg:px-4 lg:py-3 border-2 border-gray-100 rounded-xl text-xs lg:text-sm text-black focus:outline-none focus:border-black transition-all resize-none"
                    placeholder="Tell customers what... "
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] lg:text-xs font-semibold text-black mb-2 lg:mb-3 uppercase tracking-wide">Salon Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:gap-3">
                    {SALON_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setForm(f => ({ ...f, type: type.value }))}
                        className={`p-3 lg:p-4 rounded-xl border-2 text-left transition-all ${
                          form.type === type.value ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-300 text-black'
                        }`}
                      >
                        <p className="font-semibold text-xs lg:text-sm">{type.label}</p>
                        <p className={`text-[10px] lg:text-xs mt-0.5 ${form.type === type.value ? 'text-white/70' : 'text-[#71717A]'}`}>{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-black mb-1.5 lg:mb-2 uppercase tracking-wide">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#71717A]" />
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full pl-9 lg:pl-10 pr-3 py-2.5 lg:py-3 border-2 border-gray-100 rounded-xl text-xs lg:text-sm text-black focus:outline-none focus:border-black transition-all"
                      placeholder="+91-9876543210" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-black mb-1.5 lg:mb-2 uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#71717A]" />
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full pl-9 lg:pl-10 pr-3 py-2.5 lg:py-3 border-2 border-gray-100 rounded-xl text-xs lg:text-sm text-black focus:outline-none focus:border-black transition-all"
                      placeholder="salon@email.com" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] lg:text-xs font-semibold text-black mb-1.5 lg:mb-2 uppercase tracking-wide">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#71717A]" />
                    <input value={form.line1} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))}
                      className="w-full pl-9 lg:pl-10 pr-3 py-2.5 lg:py-3 border-2 border-gray-100 rounded-xl text-xs lg:text-sm text-black focus:outline-none focus:border-black transition-all"
                      placeholder="Shop No, Building, Street" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] lg:text-xs font-semibold text-black mb-1.5 lg:mb-2 uppercase tracking-wide">Area</label>
                    <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border-2 border-gray-100 rounded-xl text-xs lg:text-sm text-black focus:outline-none focus:border-black transition-all"
                      placeholder="Gandhi Nagar" />
                  </div>
                  <div>
                    <label className="block text-[10px] lg:text-xs font-semibold text-black mb-1.5 lg:mb-2 uppercase tracking-wide">Pincode</label>
                    <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border-2 border-gray-100 rounded-xl text-xs lg:text-sm text-black focus:outline-none focus:border-black transition-all"
                      placeholder="583101" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OPENING HOURS */}
          {activeTab === 'hours' && (
            <div className="space-y-2.5 lg:space-y-3">
              <p className="text-[10px] lg:text-xs text-[#71717A] mb-3 lg:mb-4">Set your opening hours for each day of the week.</p>
              {DAYS.map(day => {
                const hours: DayHours = form.openingHours[day] || DEFAULT_HOURS[day];
                return (
                  <div key={day} className={`flex flex-wrap sm:flex-nowrap items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-xl border-2 transition-all ${hours.isClosed ? 'border-gray-100 bg-gray-50' : 'border-gray-100'}`}>
                    <div className="w-20 lg:w-24 flex-shrink-0">
                      <p className={`text-xs lg:text-sm font-semibold flex items-center h-full ${hours.isClosed ? 'text-gray-400' : 'text-black'}`}>{DAY_LABELS[day]}</p>
                    </div>
                    {hours.isClosed ? (
                      <p className="flex-1 text-xs lg:text-sm text-gray-400 italic flex items-center">Closed</p>
                    ) : (
                      <div className="flex items-center gap-1.5 lg:gap-3 flex-1">
                        <input type="time" value={hours.open}
                          onChange={e => updateHours(day, 'open', e.target.value)}
                          className="px-2 py-1.5 lg:px-3 lg:py-2 border-2 border-gray-100 rounded-lg text-xs lg:text-sm text-black focus:outline-none focus:border-black transition-all w-[90px] lg:w-auto text-center" />
                        <span className="text-[#71717A] text-[10px] lg:text-sm">to</span>
                        <input type="time" value={hours.close}
                          onChange={e => updateHours(day, 'close', e.target.value)}
                          className="px-2 py-1.5 lg:px-3 lg:py-2 border-2 border-gray-100 rounded-lg text-xs lg:text-sm text-black focus:outline-none focus:border-black transition-all w-[90px] lg:w-auto text-center" />
                      </div>
                    )}
                    <button
                      onClick={() => updateHours(day, 'isClosed', !hours.isClosed)}
                      className={`text-[10px] lg:text-xs font-semibold px-2.5 py-1.5 lg:px-3 lg:py-1.5 rounded-full border-2 transition-all flex-shrink-0 ml-auto sm:ml-0 ${hours.isClosed ? 'border-black text-black hover:bg-black hover:text-white' : 'border-red-200 text-red-500 hover:border-red-500'}`}
                    >
                      {hours.isClosed ? 'Open' : 'Close'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-5 lg:space-y-6">
              <div>
                <ImageUpload 
                  label="Cover Image"
                  value={form.coverImage}
                  onChange={(url) => setForm(f => ({ ...f, coverImage: url }))}
                  className="aspect-video"
                />
              </div>
              <div>
                <label className="block text-[10px] lg:text-xs font-semibold text-black mb-2 lg:mb-3 uppercase tracking-wide">Gallery Images</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3 mb-3 lg:mb-4">
                  {form.galleryImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <button onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 lg:w-6 lg:h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <ImageUpload 
                    onChange={(url) => {
                      if (url) {
                        setForm(f => ({ ...f, galleryImages: [...f.galleryImages, url] }));
                      }
                    }}
                    className="max-w-[150px]"
                  />
                  <div className="flex gap-2 lg:gap-3">
                    <input value={newGalleryUrl} onChange={e => setNewGalleryUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addGalleryImage()}
                      className="flex-1 px-3 py-2.5 lg:px-4 lg:py-3 border-2 border-gray-100 rounded-xl text-xs lg:text-sm text-black focus:outline-none focus:border-black transition-all"
                      placeholder="Or paste image URL..." />
                    <button onClick={addGalleryImage}
                      className="flex items-center gap-1.5 px-3 lg:px-4 py-2.5 lg:py-3 bg-black text-white rounded-xl text-xs lg:text-sm font-medium hover:bg-gray-900 transition-all flex-shrink-0">
                      <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Add URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AMENITIES */}
          {activeTab === 'amenities' && (
            <div>
              <p className="text-[10px] lg:text-xs text-[#71717A] mb-3 lg:mb-5">Select the amenities available at your salon.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 lg:gap-3">
                {AMENITIES_LIST.map(amenity => {
                  const selected = form.amenities.includes(amenity);
                  return (
                    <button key={amenity} onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-xl border-2 text-left transition-all ${selected ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-300 text-black'}`}>
                      <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-white' : 'border-gray-300'}`}>
                        {selected && <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-xs lg:text-sm font-medium">{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          </TabTransition>
        </div>
      </div>

      {/* Live Preview */}
      {previewMode && (
        <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-4 lg:mt-6">
          <div className="px-4 py-3 lg:px-5 lg:py-4 border-b border-gray-100 flex items-center gap-1.5 lg:gap-2">
            <Globe className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-black" />
            <p className="font-semibold text-xs lg:text-sm text-black">Customer Preview</p>
            <span className="ml-auto text-[10px] lg:text-xs text-[#71717A]">How customers see your salon</span>
          </div>
          <div className="p-4 lg:p-5">
            {form.coverImage && (
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3 lg:mb-4">
                <img src={form.coverImage} alt={form.name} className="w-full h-full object-cover" />
              </div>
            )}
            <h3 className="text-lg lg:text-xl font-bold text-black">{form.name || 'Your Salon Name'}</h3>
            <p className="text-[10px] lg:text-sm text-[#71717A] mt-0.5 lg:mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> {form.area || 'Area'}, {form.city}
            </p>
            <p className="text-xs lg:text-sm text-black mt-2 lg:mt-3 leading-relaxed">{form.description || 'Your salon description will appear here.'}</p>
            <div className="flex flex-wrap gap-1.5 lg:gap-2 mt-3 lg:mt-4">
              {form.amenities.map(a => (
                <span key={a} className="text-[10px] lg:text-xs px-2.5 py-1 lg:px-3 lg:py-1 bg-gray-100 text-black rounded-full font-medium">{a}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
