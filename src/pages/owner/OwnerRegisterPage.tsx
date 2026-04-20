import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Check, User, Store,
  MapPin, Clock, Image, FileText, CreditCard, Building2, ChevronDown
} from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';
import { salonService } from '../../lib/dataService';
import type { SalonType } from '../../types/salon';
import LegalDocumentsStep, { type LegalDocData } from '../../components/owner/LegalDocumentsStep';
import PANCardStep, { type PANData } from '../../components/owner/PANCardStep';
import BankDetailsStep, { type BankData } from '../../components/owner/BankDetailsStep';

const TOTAL_STEPS = 8;

const STEP_INFO = [
  { icon: User, title: 'Your Details', desc: 'Tell us about yourself' },
  { icon: Store, title: 'Salon Info', desc: 'Basic salon information' },
  { icon: MapPin, title: 'Location', desc: 'Where is your salon?' },
  { icon: Clock, title: 'Opening Hours', desc: 'When are you open?' },
  { icon: Image, title: 'Photos & Amenities', desc: 'Make it shine' },
  { icon: FileText, title: 'Legal Documents', desc: 'Business verification' },
  { icon: CreditCard, title: 'PAN Card', desc: 'Tax compliance' },
  { icon: Building2, title: 'Bank Details', desc: 'Payment settlement' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

const AMENITIES_LIST = ['AC', 'WiFi', 'Parking', 'Card Payment', 'UPI Payment', 'Restroom', 'Waiting Area', 'Music', 'TV', 'Kids Area'];


const TIME_OPTIONS = [
  '06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30',
  '10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00',
];

const DEFAULT_HOURS = DAYS.reduce((acc, day) => ({
  ...acc,
  [day]: { open: '09:00', close: '21:00', isClosed: false },
}), {} as Record<string, { open: string; close: string; isClosed: boolean }>);

const DEFAULT_LEGAL: LegalDocData = {
  gstRegistered: false, gstin: '', gstCertificate: '',
  tradeLicenseNumber: '', tradeLicenseAuthority: '', tradeLicenseExpiry: '',
  tradeLicenseDoc: '', shopActNumber: '', shopActDoc: '', ptNumber: '',
};

const DEFAULT_PAN: PANData = {
  panType: 'individual', panNumber: '', nameOnPAN: '',
  dobDay: '', dobMonth: '', dobYear: '',
  panDocument: '', verified: false,
};

const DEFAULT_BANK: BankData = {
  accountHolderName: '', accountNumber: '', confirmAccountNumber: '',
  ifscCode: '', accountType: 'current', bankName: '', branchName: '',
  branchCity: '', cancelledCheque: '', settlementSchedule: '7', ifscVerified: false,
};

interface FormState {
  ownerName: string; email: string; phone: string; password: string;
  salonName: string; salonType: SalonType; description: string;
  line1: string; area: string; city: string; state: string; pincode: string;
  openingHours: Record<string, { open: string; close: string; isClosed: boolean }>;
  coverImage: string; amenities: string[];
  legalDocs: LegalDocData;
  panDetails: PANData;
  bankDetails: BankData;
}

export default function OwnerRegisterPage() {
  const navigate = useNavigate();
  const { completeRegistration, isLoading } = useOwnerStore();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const [availableCities] = useState(() => salonService.getCities());
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  const [form, setForm] = useState<FormState>({
    ownerName: '', email: '', phone: '', password: '',
    salonName: '', salonType: 'unisex', description: '',
    line1: '', area: '', city: availableCities[0] || '', state: 'India', pincode: '',
    openingHours: DEFAULT_HOURS,
    coverImage: '', amenities: [],
    legalDocs: DEFAULT_LEGAL,
    panDetails: DEFAULT_PAN,
    bankDetails: DEFAULT_BANK,
  });

  useEffect(() => {
    if (form.city) {
      setAvailableAreas(salonService.getAreasByCity(form.city));
    }
  }, [form.city]);

  const update = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.ownerName.trim()) e.ownerName = 'Full name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
      if (!form.phone.trim()) e.phone = 'Phone is required';
      else if (!/^[0-9]{10}$/.test(form.phone.replace(/[^0-9]/g, ''))) e.phone = 'Enter a valid 10-digit phone number';
      if (!form.password.trim()) e.password = 'Password is required';
      else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    }
    if (s === 2) {
      if (!form.salonName.trim()) e.salonName = 'Salon name is required';
      if (!form.description.trim()) e.description = 'Description is required';
      else if (form.description.length < 20) e.description = 'Description must be at least 20 characters';
    }
    if (s === 3) {
      if (!form.line1.trim()) e.line1 = 'Address is required';
      if (!form.area.trim()) e.area = 'Area is required';
      if (!form.pincode.trim()) e.pincode = 'Pincode is required';
      else if (!/^[0-9]{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    }
    if (s === 6) {
      if (!form.legalDocs.tradeLicenseNumber) e.tradeLicense = 'Trade license number is required';
      if (!form.legalDocs.tradeLicenseAuthority) e.tradeLicense = 'Issuing authority is required';
      if (!form.legalDocs.tradeLicenseDoc) e.tradeLicense = 'Trade license document is required';
    }
    if (s === 7) {
      if (!form.panDetails.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panDetails.panNumber)) {
        e.panNumber = 'Valid PAN number is required';
      }
      if (!form.panDetails.nameOnPAN) e.panName = 'Name on PAN is required';
      if (!form.panDetails.dobDay || !form.panDetails.dobMonth || !form.panDetails.dobYear) {
        e.dob = 'Date of birth is required';
      }
      if (!form.panDetails.panDocument) e.panDoc = 'PAN card document is required';
    }
    if (s === 8) {
      if (!form.bankDetails.accountHolderName) e.accountHolder = 'Account holder name is required';
      if (!form.bankDetails.accountNumber) e.accountNumber = 'Account number is required';
      if (form.bankDetails.accountNumber !== form.bankDetails.confirmAccountNumber) e.confirmAccount = 'Account numbers do not match';
      if (!form.bankDetails.ifscCode || !form.bankDetails.ifscVerified) e.ifsc = 'Please verify your IFSC code';
      if (!form.bankDetails.cancelledCheque) e.cheque = 'Cancelled cheque/passbook is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setSubmitError('');
    try {
      const slug = form.salonName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const owner = {
        id: `own_${Math.random().toString(36).substr(2, 9)}`,
        name: form.ownerName,
        email: form.email,
        phone: form.phone,
        createdAt: new Date().toISOString(),
      };
      const salon = {
        id: `sal_${Math.random().toString(36).substr(2, 9)}`,
        name: form.salonName,
        slug,
        description: form.description,
        type: form.salonType,
        phone: form.phone,
        rating: 0,
        totalReviews: 0,
        address: { line1: form.line1, area: form.area, city: form.city, state: form.state, pincode: form.pincode },
        coordinates: { lat: 15.1394, lng: 76.9214 },
        openingHours: form.openingHours,
        images: { cover: form.coverImage || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800', gallery: [] },
        amenities: form.amenities,
        featured: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      await completeRegistration({
        owner,
        salon,
        password: form.password,
        legalDocs: form.legalDocs,
        panDetails: form.panDetails,
        bankDetails: form.bankDetails,
      });
      navigate('/owner/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) setSubmitError(err.message);
      else setSubmitError('Registration failed. Please try again.');
    }
  };

  const toggleAmenity = (a: string) => {
    const current = form.amenities;
    update('amenities', current.includes(a) ? current.filter(x => x !== a) : [...current, a]);
  };

  const updateHours = (day: string, field: string, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      openingHours: { ...prev.openingHours, [day]: { ...prev.openingHours[day], [field]: value } },
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Full Name *</label>
              <input
                value={form.ownerName}
                onChange={e => update('ownerName', e.target.value)}
                placeholder="Ravi Kumar"
                className={`w-full px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all ${errors.ownerName ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="ravi@royalsalon.com"
                className={`w-full px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Phone Number *</label>
              <div className="flex gap-2">
                <div className="px-4 py-3.5 bg-[#F7F9FA] border border-gray-200 rounded-2xl text-sm text-[#71717A] flex-shrink-0">+91</div>
                <input
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  className={`flex-1 px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="Minimum 6 characters"
                className={`w-full px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Salon Name *</label>
              <input
                value={form.salonName}
                onChange={e => update('salonName', e.target.value)}
                placeholder="Royal Men's Salon"
                className={`w-full px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all ${errors.salonName ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.salonName && <p className="text-red-500 text-xs mt-1">{errors.salonName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Salon Type *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['men', 'women', 'unisex'] as SalonType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update('salonType', type)}
                    className={`py-3 rounded-2xl text-sm font-medium border-2 capitalize transition-all ${
                      form.salonType === type ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {type === 'men' ? 'Men' : type === 'women' ? 'Women' : 'Unisex'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Description *</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe your salon — services, ambiance, specialties... (min 20 characters)"
                rows={4}
                className={`w-full px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-red-500 text-xs">{errors.description}</p> : <span />}
                <p className="text-xs text-[#71717A]">{form.description.length} chars</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Street Address *</label>
              <input
                value={form.line1}
                onChange={e => update('line1', e.target.value)}
                placeholder="Shop No. 12, Opposite City Market"
                className={`w-full px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all ${errors.line1 ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.line1 && <p className="text-red-500 text-xs mt-1">{errors.line1}</p>}
            </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">City *</label>
                  <div className="relative">
                    <select
                      value={form.city}
                      onChange={e => update('city', e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#F7F9FA] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all appearance-none"
                    >
                      {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">Area / Locality *</label>
                  <div className="relative">
                    <select
                      value={form.area}
                      onChange={e => update('area', e.target.value)}
                      className={`w-full px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all appearance-none ${errors.area ? 'border-red-400' : 'border-gray-200'} ${!form.area ? 'text-[#71717A]' : 'text-black'}`}
                    >
                      <option value="">Select area</option>
                      {availableAreas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] pointer-events-none" />
                  </div>
                </div>
              </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Pincode *</label>
              <input
                value={form.pincode}
                onChange={e => update('pincode', e.target.value)}
                placeholder="583101"
                maxLength={6}
                className={`w-full px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all ${errors.pincode ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <p className="text-xs text-[#71717A] mb-4">Set your regular weekly opening hours. You can update these anytime from your dashboard.</p>
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-3 p-3 bg-[#F7F9FA] rounded-2xl">
                <div className="w-20 flex-shrink-0">
                  <p className="text-sm font-medium text-black">{DAY_LABELS[day].slice(0, 3)}</p>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={form.openingHours[day]?.open || '09:00'}
                    onChange={e => updateHours(day, 'open', e.target.value)}
                    disabled={form.openingHours[day]?.isClosed}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black appearance-none disabled:opacity-40"
                  >
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-[#71717A] text-xs flex-shrink-0">to</span>
                  <select
                    value={form.openingHours[day]?.close || '21:00'}
                    onChange={e => updateHours(day, 'close', e.target.value)}
                    disabled={form.openingHours[day]?.isClosed}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black appearance-none disabled:opacity-40"
                  >
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => updateHours(day, 'isClosed', !form.openingHours[day]?.isClosed)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    form.openingHours[day]?.isClosed
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white text-[#71717A] border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {form.openingHours[day]?.isClosed ? 'Closed' : 'Open'}
                </button>
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Cover Photo URL</label>
              <input
                value={form.coverImage}
                onChange={e => update('coverImage', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-3.5 bg-[#F7F9FA] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
              />
              {form.coverImage ? (
                <div className="mt-3 rounded-2xl overflow-hidden aspect-video bg-gray-100">
                  <img src={form.coverImage} alt="Cover preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border-2 border-dashed border-gray-200 aspect-video flex flex-col items-center justify-center gap-2 bg-[#F7F9FA]">
                  <Image className="w-8 h-8 text-gray-300" />
                  <p className="text-xs text-[#71717A]">Paste an image URL above to preview</p>
                  <button type="button" onClick={() => update('coverImage', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop')} className="text-xs text-blue-500 underline">
                    Use sample image
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-3">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES_LIST.map(a => {
                  const selected = form.amenities.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm border-2 font-medium transition-all ${
                        selected ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {selected && <Check className="w-4 h-4 flex-shrink-0" />}
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            {errors.tradeLicense && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-sm">{errors.tradeLicense}</p>
              </div>
            )}
            <LegalDocumentsStep
              data={form.legalDocs}
              onChange={(legalDocs) => update('legalDocs', legalDocs)}
            />
          </div>
        );

      case 7:
        return (
          <div>
            {(errors.panNumber || errors.panName || errors.dob || errors.panDoc) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-sm">{errors.panNumber || errors.panName || errors.dob || errors.panDoc}</p>
              </div>
            )}
            <PANCardStep
              data={form.panDetails}
              onChange={(panDetails) => update('panDetails', panDetails)}
            />
          </div>
        );

      case 8:
        return (
          <div>
            {(errors.accountHolder || errors.accountNumber || errors.confirmAccount || errors.ifsc || errors.cheque) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-sm">
                  {errors.accountHolder || errors.accountNumber || errors.confirmAccount || errors.ifsc || errors.cheque}
                </p>
              </div>
            )}
            <BankDetailsStep
              data={form.bankDetails}
              onChange={(bankDetails) => update('bankDetails', bankDetails)}
            />
            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}
            {/* Final Summary */}
            <div className="mt-6 bg-[#F7F9FA] rounded-2xl p-5 border border-gray-100">
              <p className="text-sm font-semibold text-black mb-3">Registration Summary</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Owner', value: form.ownerName || '—' },
                  { label: 'Salon', value: form.salonName || '—' },
                  { label: 'Type', value: form.salonType || '—' },
                  { label: 'Location', value: form.area ? `${form.area}, ${form.city}` : '—' },
                  { label: 'Amenities', value: `${form.amenities.length} selected` },
                  { label: 'Legal Docs', value: form.legalDocs.tradeLicenseNumber ? 'Submitted' : 'Pending' },
                  { label: 'PAN', value: form.panDetails.panNumber || '—' },
                  { label: 'Bank', value: form.bankDetails.ifscVerified ? `${form.bankDetails.bankName}` : 'Pending verification' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-[#71717A]">{item.label}</span>
                    <span className="font-medium text-black capitalize">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.svg" alt="MyBOOQED" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm">MyBOOQED</span>
          </Link>
          <Link to="/owner/login" className="text-sm text-[#71717A] hover:text-black transition-colors">
            Already have an account?{' '}
            <span className="font-medium text-black underline underline-offset-2">Sign in</span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">List Your Salon</h1>
           <p className="text-[#71717A] mt-2">Join India's fastest-growing salon network — completely free</p>
        </div>

        {/* Step Progress — Desktop */}
        <div className="hidden sm:flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {STEP_INFO.map((info, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            const Icon = info.icon;
            return (
              <React.Fragment key={stepNum}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500' : isActive ? 'bg-black' : 'bg-gray-100'}`}>
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <p className={`text-[10px] font-medium text-center max-w-[60px] leading-tight ${isActive || isCompleted ? 'text-black' : 'text-gray-400'}`}>
                    {info.title}
                  </p>
                </div>
                {idx < TOTAL_STEPS - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-all ${step > stepNum ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="flex sm:hidden items-center justify-between mb-6">
          <div className="text-sm font-medium text-black">
            Step {step} of {TOTAL_STEPS}: {STEP_INFO[step - 1].title}
          </div>
          <div className="text-xs text-[#71717A]">{Math.round((step / TOTAL_STEPS) * 100)}% complete</div>
        </div>
        <div className="sm:hidden w-full bg-gray-200 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="bg-black h-full rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              {React.createElement(STEP_INFO[step - 1].icon, { className: 'w-5 h-5 text-black' })}
              <h2 className="text-xl font-bold text-black">{STEP_INFO[step - 1].title}</h2>
            </div>
            <p className="text-[#71717A] text-sm ml-8">{STEP_INFO[step - 1].desc}</p>
          </div>

          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-gray-200 text-sm font-medium text-black hover:border-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Dot indicators */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all ${
                    i + 1 === step ? 'w-6 h-2 bg-black' :
                    i + 1 < step ? 'w-2 h-2 bg-green-500' :
                    'w-2 h-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition-all"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Complete Registration
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#71717A]">
            By registering, you agree to our{' '}
            <Link to="/terms" className="underline text-black hover:no-underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline text-black hover:no-underline">Privacy Policy</Link>.
            Your data is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
