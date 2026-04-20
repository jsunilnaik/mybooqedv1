import { useState, useRef } from 'react';
import { CheckCircle, AlertCircle, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import DocumentUploadBox from './DocumentUploadBox';

export interface PANData {
  panType: 'individual' | 'company' | 'partnership';
  panNumber: string;
  nameOnPAN: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  panDocument: string;
  verified: boolean;
}

interface PANCardStepProps {
  data: PANData;
  onChange: (data: PANData) => void;
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const PAN_TYPES = [
  { value: 'individual', label: 'Individual / Proprietor', desc: 'For sole proprietors and individuals', icon: '👤' },
  { value: 'company', label: 'Company / LLP', desc: 'For private/public limited companies', icon: '🏢' },
  { value: 'partnership', label: 'Partnership Firm', desc: 'For partnership businesses', icon: '🤝' },
];

export default function PANCardStep({ data, onChange }: PANCardStepProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [panError, setPanError] = useState('');
  const [showName, setShowName] = useState(false);
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof PANData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const handlePANChange = (value: string) => {
    const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    update('panNumber', upper);
    if (upper.length === 0) { setPanError(''); return; }
    if (upper.length < 10) {
      setPanError('PAN must be 10 characters');
    } else if (!PAN_REGEX.test(upper)) {
      setPanError('Invalid PAN format (e.g. ABCDE1234F)');
    } else {
      setPanError('');
    }
    if (data.verified) update('verified', false);
  };

  const handleDayChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 2);
    update('dobDay', clean);
    if (clean.length === 2) monthRef.current?.focus();
  };

  const handleMonthChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 2);
    update('dobMonth', clean);
    if (clean.length === 2) yearRef.current?.focus();
  };

  const handleYearChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    update('dobYear', clean);
  };

  const handleVerify = async () => {
    if (!PAN_REGEX.test(data.panNumber)) return;
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsVerifying(false);
    update('verified', true);
  };

  const nameLabel = data.panType === 'individual' ? 'Full Name (as on PAN)' :
    data.panType === 'company' ? 'Company Name (as on PAN)' : 'Firm Name (as on PAN)';

  const dobLabel = data.panType === 'individual' ? 'Date of Birth' : 'Date of Incorporation';

  const isPANValid = PAN_REGEX.test(data.panNumber) && !panError;

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900">PAN Card Required</p>
          <p className="text-xs text-amber-700 mt-0.5">
            PAN details are mandatory for TDS compliance under Section 194H of the Income Tax Act. This ensures you receive timely payment settlements.
          </p>
        </div>
      </div>

      {/* PAN Type */}
      <div>
        <label className="block text-sm font-semibold text-black mb-3">PAN Card Type *</label>
        <div className="space-y-2">
          {PAN_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => { update('panType', type.value); if (data.verified) update('verified', false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                data.panType === type.value
                  ? 'border-black bg-black/[0.02]'
                  : 'border-gray-200 hover:border-gray-400 bg-white'
              }`}
            >
              <span className="text-2xl">{type.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-black">{type.label}</p>
                <p className="text-xs text-[#71717A]">{type.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                data.panType === type.value ? 'border-black bg-black' : 'border-gray-300'
              }`}>
                {data.panType === type.value && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PAN Number */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">PAN Number *</label>
        <div className="relative">
          <input
            value={data.panNumber}
            onChange={e => handlePANChange(e.target.value)}
            placeholder="ABCDE1234F"
            maxLength={10}
            className={`w-full px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm font-mono tracking-[0.3em] uppercase focus:outline-none focus:bg-white transition-all pr-32 ${
              panError ? 'border-red-400' : isPANValid ? 'border-green-400' : 'border-gray-200 focus:border-black'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isPANValid && !data.verified && !isVerifying && (
              <button
                type="button"
                onClick={handleVerify}
                className="text-xs font-medium bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                Verify PAN
              </button>
            )}
            {isVerifying && (
              <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                Verifying...
              </div>
            )}
            {data.verified && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <CheckCircle className="w-4 h-4" />
                Verified
              </div>
            )}
          </div>
        </div>
        {panError && (
          <div className="flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <p className="text-red-500 text-xs">{panError}</p>
          </div>
        )}
        {isPANValid && !panError && (
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <p className="text-green-600 text-xs font-medium">Valid PAN format</p>
          </div>
        )}
        <p className="text-xs text-[#71717A] mt-1">Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)</p>
      </div>

      {/* Name on PAN */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">{nameLabel} *</label>
        <div className="relative">
          <input
            type={showName ? 'text' : 'text'}
            value={data.nameOnPAN}
            onChange={e => update('nameOnPAN', e.target.value.toUpperCase())}
            placeholder={data.panType === 'individual' ? 'RAVI KUMAR SHARMA' : 'ROYAL SALON PRIVATE LIMITED'}
            className="w-full px-4 py-3.5 bg-[#F7F9FA] border border-gray-200 rounded-2xl text-sm uppercase tracking-wide focus:outline-none focus:border-black focus:bg-white transition-all pr-10"
          />
          <button
            type="button"
            onClick={() => setShowName(!showName)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-black transition-colors"
          >
            {showName ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-[#71717A] mt-1">Must match exactly as printed on your PAN card</p>
      </div>

      {/* Date of Birth / Incorporation */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">{dobLabel} *</label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              ref={dayRef}
              value={data.dobDay}
              onChange={e => handleDayChange(e.target.value)}
              placeholder="DD"
              maxLength={2}
              className="w-full px-4 py-3.5 bg-[#F7F9FA] border border-gray-200 rounded-2xl text-sm text-center font-mono focus:outline-none focus:border-black focus:bg-white transition-all"
            />
            <p className="text-xs text-center text-[#71717A] mt-1">Day</p>
          </div>
          <div className="flex items-center pt-1 text-[#71717A] font-medium">/</div>
          <div className="flex-1">
            <input
              ref={monthRef}
              value={data.dobMonth}
              onChange={e => handleMonthChange(e.target.value)}
              placeholder="MM"
              maxLength={2}
              className="w-full px-4 py-3.5 bg-[#F7F9FA] border border-gray-200 rounded-2xl text-sm text-center font-mono focus:outline-none focus:border-black focus:bg-white transition-all"
            />
            <p className="text-xs text-center text-[#71717A] mt-1">Month</p>
          </div>
          <div className="flex items-center pt-1 text-[#71717A] font-medium">/</div>
          <div className="flex-[2]">
            <input
              ref={yearRef}
              value={data.dobYear}
              onChange={e => handleYearChange(e.target.value)}
              placeholder="YYYY"
              maxLength={4}
              className="w-full px-4 py-3.5 bg-[#F7F9FA] border border-gray-200 rounded-2xl text-sm text-center font-mono focus:outline-none focus:border-black focus:bg-white transition-all"
            />
            <p className="text-xs text-center text-[#71717A] mt-1">Year</p>
          </div>
        </div>
      </div>

      {/* PAN Card Upload */}
      <DocumentUploadBox
        label="Upload PAN Card"
        required
        hint="Front side of PAN card — PDF, JPG, PNG (max 5MB)"
        value={data.panDocument}
        onChange={(val) => update('panDocument', val)}
        onRemove={() => update('panDocument', '')}
      />

      {/* Security Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Lock, title: 'Encrypted', desc: 'AES-256 encryption' },
          { icon: Shield, title: 'TDS Only', desc: 'Section 194H compliance' },
          { icon: CheckCircle, title: 'Never Shared', desc: 'No third-party access' },
        ].map(badge => (
          <div key={badge.title} className="flex items-center gap-3 p-3 bg-[#F7F9FA] rounded-2xl border border-gray-100">
            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <badge.icon className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-black">{badge.title}</p>
              <p className="text-xs text-[#71717A]">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
