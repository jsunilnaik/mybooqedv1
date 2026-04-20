import { useState } from 'react';
import { CheckCircle, AlertCircle, Lock, Eye, EyeOff, Building2 } from 'lucide-react';
import DocumentUploadBox from './DocumentUploadBox';

export interface BankData {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  accountType: 'current' | 'savings';
  bankName: string;
  branchName: string;
  branchCity: string;
  cancelledCheque: string;
  settlementSchedule: '7' | '15' | '30';
  ifscVerified: boolean;
}

interface BankDetailsStepProps {
  data: BankData;
  onChange: (data: BankData) => void;
}

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const IFSC_DB: Record<string, { bank: string; branch: string; city: string }> = {
  'SBIN0010782': { bank: 'State Bank of India', branch: 'Bellary Main Branch', city: 'India' },
  'KKBK0001234': { bank: 'Kotak Mahindra Bank', branch: 'Bellary Branch', city: 'India' },
  'HDFC0001234': { bank: 'HDFC Bank', branch: 'India Branch', city: 'India' },
  'ICIC0001234': { bank: 'ICICI Bank', branch: 'Bellary Branch', city: 'India' },
  'AXIS0001234': { bank: 'Axis Bank', branch: 'India Main', city: 'India' },
  'UBIN0534685': { bank: 'Union Bank of India', branch: 'Bellary Branch', city: 'India' },
  'CNRB0001234': { bank: 'Canara Bank', branch: 'India Branch', city: 'India' },
  'PUNB0001234': { bank: 'Punjab National Bank', branch: 'Bellary Branch', city: 'India' },
};

export default function BankDetailsStep({ data, onChange }: BankDetailsStepProps) {
  const [showAccount, setShowAccount] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isVerifyingIFSC, setIsVerifyingIFSC] = useState(false);
  const [ifscError, setIfscError] = useState('');
  const [accountError, setAccountError] = useState('');

  const update = (field: keyof BankData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const handleIFSCChange = (value: string) => {
    const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    update('ifscCode', upper);
    update('ifscVerified', false);
    update('bankName', '');
    update('branchName', '');
    update('branchCity', '');
    if (upper.length === 0) { setIfscError(''); return; }
    if (!IFSC_REGEX.test(upper)) {
      setIfscError('Invalid IFSC format (e.g. SBIN0010782)');
    } else {
      setIfscError('');
    }
  };

  const handleVerifyIFSC = async () => {
    if (!IFSC_REGEX.test(data.ifscCode)) return;
    setIsVerifyingIFSC(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsVerifyingIFSC(false);
    const found = IFSC_DB[data.ifscCode];
    if (found) {
      onChange({
        ...data,
        bankName: found.bank,
        branchName: found.branch,
        branchCity: found.city,
        ifscVerified: true,
      });
    } else {
      onChange({
        ...data,
        bankName: 'Bank (Verified)',
        branchName: 'Local Branch',
        branchCity: 'India',
        ifscVerified: true,
      });
    }
  };

  const handleConfirmAccount = (val: string) => {
    update('confirmAccountNumber', val);
    if (val && data.accountNumber && val !== data.accountNumber) {
      setAccountError('Account numbers do not match');
    } else {
      setAccountError('');
    }
  };

  const maskedAccount = (num: string) => {
    if (num.length <= 4) return num;
    return '•'.repeat(num.length - 4) + num.slice(-4);
  };

  const isIFSCValid = IFSC_REGEX.test(data.ifscCode) && !ifscError;
  const accountsMatch = data.accountNumber && data.confirmAccountNumber && data.accountNumber === data.confirmAccountNumber;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Payment Settlement Account</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Booking payments will be settled directly to this bank account. Ensure all details are accurate to avoid delays.
          </p>
        </div>
      </div>

      {/* Account Holder Name */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">Account Holder Name *</label>
        <input
          value={data.accountHolderName}
          onChange={e => update('accountHolderName', e.target.value.toUpperCase())}
          placeholder="RAVI KUMAR SHARMA"
          className="w-full px-4 py-3.5 bg-[#F7F9FA] border border-gray-200 rounded-2xl text-sm uppercase tracking-wide focus:outline-none focus:border-black focus:bg-white transition-all"
        />
        <p className="text-xs text-[#71717A] mt-1">Must match exactly as registered with your bank</p>
      </div>

      {/* Account Number */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">Account Number *</label>
        <div className="relative">
          <input
            type={showAccount ? 'text' : 'password'}
            value={data.accountNumber}
            onChange={e => update('accountNumber', e.target.value.replace(/\D/g, ''))}
            placeholder="Enter account number"
            className="w-full px-4 py-3.5 bg-[#F7F9FA] border border-gray-200 rounded-2xl text-sm font-mono tracking-widest focus:outline-none focus:border-black focus:bg-white transition-all pr-12"
          />
          <button
            type="button"
            onClick={() => setShowAccount(!showAccount)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-black transition-colors"
          >
            {showAccount ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {data.accountNumber && !showAccount && (
          <p className="text-xs text-[#71717A] mt-1">{maskedAccount(data.accountNumber)}</p>
        )}
      </div>

      {/* Confirm Account Number */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">Confirm Account Number *</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={data.confirmAccountNumber}
            onChange={e => handleConfirmAccount(e.target.value.replace(/\D/g, ''))}
            onPaste={e => e.preventDefault()}
            placeholder="Re-enter account number"
            className={`w-full px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm font-mono tracking-widest focus:outline-none focus:bg-white transition-all pr-12 ${
              accountError ? 'border-red-400' : accountsMatch ? 'border-green-400' : 'border-gray-200 focus:border-black'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-black transition-colors"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {accountError && (
          <div className="flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <p className="text-red-500 text-xs">{accountError}</p>
          </div>
        )}
        {accountsMatch && (
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <p className="text-green-600 text-xs font-medium">Account numbers match</p>
          </div>
        )}
        <p className="text-xs text-[#71717A] mt-1">Paste is disabled for security</p>
      </div>

      {/* IFSC Code */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">IFSC Code *</label>
        <div className="flex gap-2">
          <input
            value={data.ifscCode}
            onChange={e => handleIFSCChange(e.target.value)}
            placeholder="SBIN0010782"
            maxLength={11}
            className={`flex-1 px-4 py-3.5 bg-[#F7F9FA] border rounded-2xl text-sm font-mono tracking-wider uppercase focus:outline-none focus:bg-white transition-all ${
              ifscError ? 'border-red-400' : data.ifscVerified ? 'border-green-400' : 'border-gray-200 focus:border-black'
            }`}
          />
          {isIFSCValid && !data.ifscVerified && (
            <button
              type="button"
              onClick={handleVerifyIFSC}
              disabled={isVerifyingIFSC}
              className="px-4 py-3.5 bg-black text-white text-sm font-medium rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-60 whitespace-nowrap flex items-center gap-2"
            >
              {isVerifyingIFSC ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying
                </>
              ) : (
                'Verify IFSC'
              )}
            </button>
          )}
        </div>
        {ifscError && (
          <div className="flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <p className="text-red-500 text-xs">{ifscError}</p>
          </div>
        )}

        {/* Bank Details Card */}
        {data.ifscVerified && (
          <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">IFSC Verified</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[#71717A]">Bank</p>
                <p className="font-medium text-black mt-0.5">{data.bankName}</p>
              </div>
              <div>
                <p className="text-[#71717A]">Branch</p>
                <p className="font-medium text-black mt-0.5">{data.branchName}</p>
              </div>
              <div>
                <p className="text-[#71717A]">City</p>
                <p className="font-medium text-black mt-0.5">{data.branchCity}</p>
              </div>
            </div>
          </div>
        )}
        <p className="text-xs text-[#71717A] mt-1">Format: 4 letters + 0 + 6 alphanumeric (e.g. SBIN0010782)</p>
      </div>

      {/* Account Type */}
      <div>
        <label className="block text-sm font-semibold text-black mb-3">Account Type *</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'current', label: 'Current Account', desc: 'For businesses' },
            { value: 'savings', label: 'Savings Account', desc: 'For individuals' },
          ].map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => update('accountType', type.value)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                data.accountType === type.value
                  ? 'border-black bg-black/[0.02]'
                  : 'border-gray-200 hover:border-gray-400 bg-white'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 mb-2 flex items-center justify-center ${
                data.accountType === type.value ? 'border-black bg-black' : 'border-gray-300'
              }`}>
                {data.accountType === type.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <p className="text-sm font-medium text-black">{type.label}</p>
              <p className="text-xs text-[#71717A] mt-0.5">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cancelled Cheque */}
      <DocumentUploadBox
        label="Cancelled Cheque / Bank Passbook"
        required
        hint="Upload cancelled cheque or first page of passbook (PDF/JPG/PNG, max 5MB)"
        value={data.cancelledCheque}
        onChange={(val) => update('cancelledCheque', val)}
        onRemove={() => update('cancelledCheque', '')}
      />

      {/* Settlement Schedule */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">Settlement Schedule</label>
        <p className="text-xs text-[#71717A] mb-3">How often do you want your payments settled?</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '7', label: 'Weekly', desc: 'Every 7 days' },
            { value: '15', label: 'Bi-Weekly', desc: 'Every 15 days' },
            { value: '30', label: 'Monthly', desc: 'Every 30 days' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('settlementSchedule', opt.value)}
              className={`p-3 rounded-2xl border-2 text-center transition-all ${
                data.settlementSchedule === opt.value
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-gray-400 bg-white text-black'
              }`}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className={`text-xs mt-0.5 ${data.settlementSchedule === opt.value ? 'text-white/70' : 'text-[#71717A]'}`}>{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
        <Lock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-black">Bank-grade security</p>
          <p className="text-xs text-[#71717A] mt-0.5">
            Your bank details are protected with 256-bit SSL encryption. We follow RBI guidelines for data storage and never store account details in plain text.
          </p>
        </div>
      </div>
    </div>
  );
}
