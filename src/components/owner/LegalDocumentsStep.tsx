import { useState } from 'react';
import { FileText, Shield, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import DocumentUploadBox from './DocumentUploadBox';

export interface LegalDocData {
  gstRegistered: boolean;
  gstin: string;
  gstCertificate: string;
  tradeLicenseNumber: string;
  tradeLicenseAuthority: string;
  tradeLicenseExpiry: string;
  tradeLicenseDoc: string;
  shopActNumber: string;
  shopActDoc: string;
  ptNumber: string;
}

interface LegalDocumentsStepProps {
  data: LegalDocData;
  onChange: (data: LegalDocData) => void;
}

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function LegalDocumentsStep({ data, onChange }: LegalDocumentsStepProps) {
  const [gstOpen, setGstOpen] = useState(true);
  const [tradeOpen, setTradeOpen] = useState(true);
  const [shopOpen, setShopOpen] = useState(false);
  const [ptOpen, setPtOpen] = useState(false);
  const [gstinError, setGstinError] = useState('');

  const update = (field: keyof LegalDocData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const validateGSTIN = (value: string) => {
    const upper = value.toUpperCase();
    update('gstin', upper);
    if (upper.length === 0) { setGstinError(''); return; }
    if (!GSTIN_REGEX.test(upper)) {
      setGstinError('Invalid GSTIN format (e.g. 29ABCDE1234F1Z5)');
    } else {
      setGstinError('');
    }
  };

  const gstValid = !data.gstRegistered || (GSTIN_REGEX.test(data.gstin) && !!data.gstCertificate);
  const tradeValid = !!data.tradeLicenseNumber && !!data.tradeLicenseAuthority && !!data.tradeLicenseExpiry && !!data.tradeLicenseDoc;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Why do we need these documents?</p>
          <p className="text-xs text-blue-700 mt-0.5">Legal documents help us verify your business and build trust with customers. All documents are encrypted and stored securely.</p>
        </div>
      </div>

      {/* GST Section */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setGstOpen(!gstOpen)}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#F7F9FA] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${gstValid && data.gstRegistered ? 'bg-green-100' : 'bg-gray-100'}`}>
              <FileText className={`w-4 h-4 ${gstValid && data.gstRegistered ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-black">GST Registration</p>
              <p className="text-xs text-[#71717A]">Optional — for GST-registered businesses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {gstValid && data.gstRegistered && <CheckCircle className="w-4 h-4 text-green-500" />}
            {gstOpen ? <ChevronUp className="w-4 h-4 text-[#71717A]" /> : <ChevronDown className="w-4 h-4 text-[#71717A]" />}
          </div>
        </button>

        {gstOpen && (
          <div className="p-4 border-t border-gray-100 space-y-4 bg-white">
            <div className="flex gap-3">
              {[
                { label: 'Registered under GST', value: true },
                { label: 'Not Registered', value: false },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => update('gstRegistered', opt.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                    data.gstRegistered === opt.value
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {data.gstRegistered && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1.5">GSTIN Number *</label>
                  <input
                    value={data.gstin}
                    onChange={e => validateGSTIN(e.target.value)}
                    placeholder="29ABCDE1234F1Z5"
                    maxLength={15}
                    className={`w-full px-4 py-3 bg-[#F7F9FA] border rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:border-black focus:bg-white transition-all uppercase ${gstinError ? 'border-red-400' : data.gstin && !gstinError ? 'border-green-400' : 'border-gray-200'}`}
                  />
                  {gstinError && <p className="text-red-500 text-xs mt-1">{gstinError}</p>}
                  {data.gstin && !gstinError && GSTIN_REGEX.test(data.gstin) && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <p className="text-green-600 text-xs font-medium">Valid GSTIN format</p>
                    </div>
                  )}
                </div>
                <DocumentUploadBox
                  label="GST Certificate"
                  required
                  hint="Upload your GST registration certificate (PDF/JPG/PNG, max 5MB)"
                  value={data.gstCertificate}
                  onChange={(val) => update('gstCertificate', val)}
                  onRemove={() => update('gstCertificate', '')}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trade License Section */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setTradeOpen(!tradeOpen)}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#F7F9FA] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tradeValid ? 'bg-green-100' : 'bg-amber-100'}`}>
              <FileText className={`w-4 h-4 ${tradeValid ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-black">
                Trade License <span className="text-red-500">*</span>
              </p>
              <p className="text-xs text-[#71717A]">Required — issued by local municipal authority</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tradeValid && <CheckCircle className="w-4 h-4 text-green-500" />}
            {!tradeValid && <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">Required</span>}
            {tradeOpen ? <ChevronUp className="w-4 h-4 text-[#71717A]" /> : <ChevronDown className="w-4 h-4 text-[#71717A]" />}
          </div>
        </button>

        {tradeOpen && (
          <div className="p-4 border-t border-gray-100 space-y-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">License Number *</label>
                <input
                  value={data.tradeLicenseNumber}
                  onChange={e => update('tradeLicenseNumber', e.target.value)}
                  placeholder="TL/2024/BLR/12345"
                  className="w-full px-4 py-3 bg-[#F7F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Issuing Authority *</label>
                <input
                  value={data.tradeLicenseAuthority}
                  onChange={e => update('tradeLicenseAuthority', e.target.value)}
                  placeholder="India City Corporation"
                  className="w-full px-4 py-3 bg-[#F7F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Expiry Date *</label>
              <input
                type="date"
                value={data.tradeLicenseExpiry}
                onChange={e => update('tradeLicenseExpiry', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#F7F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>
            <DocumentUploadBox
              label="Trade License Document"
              required
              hint="Upload your trade license (PDF/JPG/PNG, max 5MB)"
              value={data.tradeLicenseDoc}
              onChange={(val) => update('tradeLicenseDoc', val)}
              onRemove={() => update('tradeLicenseDoc', '')}
            />
          </div>
        )}
      </div>

      {/* Shop & Establishment Act */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShopOpen(!shopOpen)}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#F7F9FA] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${data.shopActNumber && data.shopActDoc ? 'bg-green-100' : 'bg-gray-100'}`}>
              <FileText className={`w-4 h-4 ${data.shopActNumber && data.shopActDoc ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-black">Shop & Establishment Act</p>
              <p className="text-xs text-[#71717A]">Optional — Labour Department registration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.shopActNumber && data.shopActDoc && <CheckCircle className="w-4 h-4 text-green-500" />}
            {shopOpen ? <ChevronUp className="w-4 h-4 text-[#71717A]" /> : <ChevronDown className="w-4 h-4 text-[#71717A]" />}
          </div>
        </button>

        {shopOpen && (
          <div className="p-4 border-t border-gray-100 space-y-4 bg-white">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Registration Number</label>
              <input
                value={data.shopActNumber}
                onChange={e => update('shopActNumber', e.target.value)}
                placeholder="SE/KA/BLR/2024/12345"
                className="w-full px-4 py-3 bg-[#F7F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>
            <DocumentUploadBox
              label="Shop & Establishment Certificate"
              hint="Upload your S&E registration certificate (PDF/JPG/PNG, max 5MB)"
              value={data.shopActDoc}
              onChange={(val) => update('shopActDoc', val)}
              onRemove={() => update('shopActDoc', '')}
            />
          </div>
        )}
      </div>

      {/* Professional Tax */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setPtOpen(!ptOpen)}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#F7F9FA] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${data.ptNumber ? 'bg-green-100' : 'bg-gray-100'}`}>
              <FileText className={`w-4 h-4 ${data.ptNumber ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-black">Professional Tax Registration</p>
              <p className="text-xs text-[#71717A]">Optional — India PT registration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.ptNumber && <CheckCircle className="w-4 h-4 text-green-500" />}
            {ptOpen ? <ChevronUp className="w-4 h-4 text-[#71717A]" /> : <ChevronDown className="w-4 h-4 text-[#71717A]" />}
          </div>
        </button>

        {ptOpen && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">PT Registration Number</label>
              <input
                value={data.ptNumber}
                onChange={e => update('ptNumber', e.target.value)}
                placeholder="PT/KA/2024/98765"
                className="w-full px-4 py-3 bg-[#F7F9FA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
        <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="text-xs text-green-800">
          <span className="font-semibold">Your documents are protected.</span> All uploads are encrypted with 256-bit SSL. Documents are used only for verification and are never shared with third parties.
        </p>
      </div>
    </div>
  );
}
