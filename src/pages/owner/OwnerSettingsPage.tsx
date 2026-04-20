import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Lock, Bell, CreditCard, Shield, FileText,
  Trash2, Eye, EyeOff, CheckCircle, AlertCircle,
  Building2, Phone, Mail, Save, ChevronRight, XCircle
} from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';
import { useToast } from '../../components/ui/Toast';
import { TabTransition } from '../../components/layout/PageTransition';

type Tab = 'profile' | 'security' | 'notifications' | 'payments' | 'legal' | 'danger';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'security', label: 'Security', icon: <Lock size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
  { id: 'legal', label: 'Legal & Financial', icon: <FileText size={16} /> },
  { id: 'danger', label: 'Danger Zone', icon: <Trash2 size={16} /> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-black' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function StatusBadge({ status }: { status: 'verified' | 'pending' | 'missing' }) {
  const config = {
    verified: { color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle size={12} />, label: 'Verified' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertCircle size={12} />, label: 'Under Review' },
    missing: { color: 'bg-red-50 text-red-600 border-red-200', icon: <XCircle size={12} />, label: 'Not Submitted' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${c.color}`}>
      {c.icon} {c.label}
    </span>
  );
}

export default function OwnerSettingsPage() {
  const { owner, salon, updateSalon, logout } = useOwnerStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const ownerData = owner as any;
  const hasLegalDocs = !!ownerData?.legalDocs?.tradeLicense?.number;
  const hasPAN = !!(ownerData?.panDetails?.panNumber && ownerData?.panDetails?.verified);
  const hasBank = !!(ownerData?.bankDetails?.accountNumber && ownerData?.bankDetails?.ifscVerified);

  // Profile form state
  const [profile, setProfile] = useState({
    name: owner?.name || '',
    email: owner?.email || '',
    phone: owner?.phone || '',
  });

  // Security form state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences
  const [notifs, setNotifs] = useState({
    emailNewBooking: true,
    smsNewBooking: true,
    whatsappNewBooking: true,
    emailCancellation: true,
    smsCancellation: false,
    whatsappCancellation: true,
    emailReview: true,
    smsReview: false,
    whatsappReview: true,
    emailReminder: true,
    smsReminder: true,
    whatsappReminder: true,
  });

  // Payment settings
  const [payments, setPayments] = useState({
    payAtSalon: salon?.payAtSalon ?? true,
    acceptedMethods: salon?.acceptedPayments ?? ['Cash', 'Card', 'UPI'],
  });

  const paymentMethods = ['Cash', 'Card', 'UPI', 'Paytm', 'Google Pay', 'PhonePe'];

  const togglePaymentMethod = (method: string) => {
    setPayments(prev => ({
      ...prev,
      acceptedMethods: prev.acceptedMethods.includes(method)
        ? prev.acceptedMethods.filter(m => m !== method)
        : [...prev.acceptedMethods, method],
    }));
  };

  const handleSaveProfile = () => {
    showToast('Profile updated successfully', 'success');
  };

  const handleSavePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (security.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Password updated successfully', 'success');
  };

  const handleSavePayments = () => {
    updateSalon({ payAtSalon: payments.payAtSalon, acceptedPayments: payments.acceptedMethods });
    showToast('Payment settings saved', 'success');
  };

  const handleSaveNotifications = () => {
    showToast('Notification preferences saved', 'success');
  };

  const handleDeactivate = () => {
    updateSalon({ isActive: false });
    showToast('Salon deactivated. Customers can no longer book.', 'success');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm === 'DELETE') {
      logout();
      showToast('Account deleted successfully', 'success');
    }
  };

  const maskAccountNumber = (num: string) => {
    if (!num) return '—';
    return '••••••' + num.slice(-4);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-8 bg-[#F7F9FA] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-black mb-1 sm:mb-2">Settings</h1>
        <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-8">Manage your account and salon preferences</p>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar tabs */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left mb-0.5 ${activeTab === tab.id
                    ? tab.id === 'danger' ? 'bg-red-50 text-red-600' : 'bg-black text-white'
                    : tab.id === 'danger' ? 'text-red-500 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && tab.id !== 'danger' && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 w-full mb-4 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] sm:text-xs font-medium border transition-all ${activeTab === tab.id
                  ? tab.id === 'danger' ? 'bg-red-500 text-white border-red-500' : 'bg-black text-white border-black'
                  : tab.id === 'danger' ? 'border-red-200 text-red-500 bg-white' : 'border-gray-200 text-gray-600 bg-white'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pb-20 sm:pb-0">
            <TabTransition tabKey={activeTab}>

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <h2 className="text-base sm:text-lg font-bold text-black">Personal Information</h2>

                  <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
                      {owner?.name?.charAt(0).toUpperCase() || 'O'}
                    </div>
                    <div>
                      <p className="font-semibold text-black text-sm sm:text-base">{owner?.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Salon Owner</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={profile.name}
                          onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    className="flex w-full sm:w-auto justify-center items-center gap-2 bg-black text-white px-6 py-2.5 sm:py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <h2 className="text-base sm:text-lg font-bold text-black">Change Password</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={security.currentPassword}
                          onChange={e => setSecurity(p => ({ ...p, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                          className="w-full pl-4 pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                        />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={security.newPassword}
                          onChange={e => setSecurity(p => ({ ...p, newPassword: e.target.value }))}
                          placeholder="Minimum 6 characters"
                          className="w-full pl-4 pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                        />
                        <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={security.confirmPassword}
                        onChange={e => setSecurity(p => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="Repeat new password"
                        className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSavePassword}
                    className="flex w-full sm:w-auto justify-center items-center gap-2 bg-black text-white px-6 py-2.5 sm:py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Lock size={16} /> Update Password
                  </button>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <h2 className="text-base sm:text-lg font-bold text-black">Notification Preferences</h2>

                  {[
                    { label: 'New Booking', desc: 'Get notified when a customer makes a booking', emailKey: 'emailNewBooking', smsKey: 'smsNewBooking', whatsappKey: 'whatsappNewBooking' },
                    { label: 'Cancellation', desc: 'Get notified when a customer cancels', emailKey: 'emailCancellation', smsKey: 'smsCancellation', whatsappKey: 'whatsappCancellation' },
                    { label: 'New Review', desc: 'Get notified when a customer leaves a review', emailKey: 'emailReview', smsKey: 'smsReview', whatsappKey: 'whatsappReview' },
                    { label: 'Reminders', desc: '1-hour reminders before appointments', emailKey: 'emailReminder', smsKey: 'smsReminder', whatsappKey: 'whatsappReminder' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center sm:items-start justify-between py-3.5 sm:py-4 border-b border-gray-50 last:border-0">
                      <div className="pr-2">
                        <p className="text-sm font-semibold text-black">{item.label}</p>
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-tight">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Email</p>
                          <Toggle
                            checked={notifs[item.emailKey as keyof typeof notifs]}
                            onChange={v => setNotifs(p => ({ ...p, [item.emailKey]: v }))}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] sm:text-xs text-gray-400 mb-1">SMS</p>
                          <Toggle
                            checked={notifs[item.smsKey as keyof typeof notifs]}
                            onChange={v => setNotifs(p => ({ ...p, [item.smsKey]: v }))}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] sm:text-xs text-gray-400 mb-1">WhatsApp</p>
                          <Toggle
                            checked={notifs[item.whatsappKey as keyof typeof notifs]}
                            onChange={v => setNotifs(p => ({ ...p, [item.whatsappKey]: v }))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleSaveNotifications}
                    className="flex w-full sm:w-auto justify-center items-center gap-2 bg-black text-white px-6 py-2.5 sm:py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Save size={16} /> Save Preferences
                  </button>
                </div>
              )}

              {/* PAYMENTS TAB */}
              {activeTab === 'payments' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <h2 className="text-base sm:text-lg font-bold text-black">Payment Settings</h2>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="pr-3">
                      <p className="text-sm font-semibold text-black">Pay at Salon</p>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-tight">Customers pay when they arrive</p>
                    </div>
                    <Toggle checked={payments.payAtSalon} onChange={v => setPayments(p => ({ ...p, payAtSalon: v }))} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-black mb-2 sm:mb-3">Accepted Payment Methods</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {paymentMethods.map(method => (
                         <button
                           key={method}
                           onClick={() => togglePaymentMethod(method)}
                           className={`p-2.5 sm:p-3 rounded-xl border-2 text-[13px] sm:text-sm font-medium transition-all ${payments.acceptedMethods.includes(method)
                             ? 'border-black bg-black text-white'
                             : 'border-gray-200 text-gray-600 hover:border-gray-400'
                             }`}
                         >
                           {payments.acceptedMethods.includes(method) && <CheckCircle size={14} className="inline mr-1.5" />}
                           {method}
                         </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-blue-50 rounded-xl">
                    <p className="text-[11px] sm:text-xs text-blue-700 font-medium">
                      Online payment gateway integration (Razorpay) will be available in Phase 2.
                    </p>
                  </div>

                  <button
                    onClick={handleSavePayments}
                    className="flex w-full sm:w-auto justify-center items-center gap-2 bg-black text-white px-6 py-2.5 sm:py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Save size={16} /> Save Payment Settings
                  </button>
                </div>
              )}

              {/* LEGAL & FINANCIAL TAB */}
              {activeTab === 'legal' && (
                <div className="space-y-4">
                  {/* Legal Documents */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <FileText size={18} className="text-black" />
                      <h2 className="text-base sm:text-lg font-bold text-black">Legal Documents</h2>
                    </div>

                    <div className="space-y-2.5 sm:space-y-3">
                      {[
                        { label: 'GST Registration', key: 'gst', value: ownerData?.legalDocs?.gst?.gstin },
                        { label: 'Trade License', key: 'trade', value: ownerData?.legalDocs?.tradeLicense?.number },
                        { label: 'Shop & Establishment', key: 'shop', value: ownerData?.legalDocs?.shopAct?.number },
                        { label: 'Professional Tax', key: 'pt', value: ownerData?.legalDocs?.professionalTax?.number },
                      ].map(doc => (
                        <div key={doc.key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl gap-2 sm:gap-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                              <FileText size={14} className="text-gray-600" />
                            </div>
                            <div>
                              <p className="text-[13px] sm:text-sm font-medium text-black">{doc.label}</p>
                              <p className="text-[11px] sm:text-xs text-gray-400 font-mono mt-0.5">{doc.value || 'Not submitted'}</p>
                            </div>
                          </div>
                          <div className="pl-11 sm:pl-0">
                            <StatusBadge status={doc.value ? 'pending' : 'missing'} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {!hasLegalDocs && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-[11px] sm:text-xs text-amber-700">Legal documents are required to activate your salon listing.</p>
                      </div>
                    )}
                  </div>

                  {/* PAN Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Shield size={18} className="text-black" />
                      <h2 className="text-base sm:text-lg font-bold text-black">PAN Card Details</h2>
                    </div>

                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl gap-2 sm:gap-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Shield size={14} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="text-[13px] sm:text-sm font-medium text-black">PAN Number</p>
                            <p className="text-[11px] sm:text-xs text-gray-400 font-mono mt-0.5">
                              {ownerData?.panDetails?.panNumber
                                ? ownerData.panDetails.panNumber.slice(0, 5) + '••••' + ownerData.panDetails.panNumber.slice(-1)
                                : 'Not submitted'}
                            </p>
                          </div>
                        </div>
                        <div className="pl-11 sm:pl-0">
                          <StatusBadge status={hasPAN ? 'verified' : 'missing'} />
                        </div>
                      </div>

                      {ownerData?.panDetails?.nameOnPAN && (
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                          <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Name on PAN</p>
                          <p className="text-[13px] sm:text-sm font-medium text-black">{ownerData.panDetails.nameOnPAN}</p>
                        </div>
                      )}

                      {ownerData?.panDetails?.panType && (
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                          <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">PAN Type</p>
                          <p className="text-[13px] sm:text-sm font-medium text-black capitalize">{ownerData.panDetails.panType}</p>
                        </div>
                      )}
                    </div>

                    {hasPAN && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start sm:items-center gap-2">
                        <CheckCircle size={14} className="text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <p className="text-[11px] sm:text-xs text-green-700">PAN card verified. Used only for TDS compliance.</p>
                      </div>
                    )}
                  </div>

                  {/* Bank Account */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Building2 size={18} className="text-black" />
                      <h2 className="text-base sm:text-lg font-bold text-black">Bank Account Details</h2>
                    </div>

                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl gap-2 sm:gap-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building2 size={14} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="text-[13px] sm:text-sm font-medium text-black">Account Number</p>
                            <p className="text-[11px] sm:text-xs text-gray-400 font-mono mt-0.5">
                              {maskAccountNumber(ownerData?.bankDetails?.accountNumber || '')}
                            </p>
                          </div>
                        </div>
                        <div className="pl-11 sm:pl-0">
                          <StatusBadge status={hasBank ? 'verified' : 'missing'} />
                        </div>
                      </div>

                      {ownerData?.bankDetails?.bankName && (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                            <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Bank</p>
                            <p className="text-[13px] sm:text-sm font-medium text-black break-words">{ownerData.bankDetails.bankName}</p>
                          </div>
                          <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                            <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">IFSC Code</p>
                            <p className="text-[13px] sm:text-sm font-medium text-black font-mono break-all">{ownerData.bankDetails.ifscCode}</p>
                          </div>
                          <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                            <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Branch</p>
                            <p className="text-[13px] sm:text-sm font-medium text-black truncate">{ownerData.bankDetails.branchName || '—'}</p>
                          </div>
                          <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                            <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Account Type</p>
                            <p className="text-[13px] sm:text-sm font-medium text-black capitalize">{ownerData.bankDetails.accountType || 'Current'}</p>
                          </div>
                        </div>
                      )}

                      {ownerData?.bankDetails?.settlementSchedule && (
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                          <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Settlement Schedule</p>
                          <p className="text-[13px] sm:text-sm font-medium text-black">Every {ownerData.bankDetails.settlementSchedule} days</p>
                        </div>
                      )}
                    </div>

                    {hasBank && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start sm:items-center gap-2">
                        <CheckCircle size={14} className="text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <p className="text-[11px] sm:text-xs text-green-700">Bank account verified. Payments will be settled as per schedule.</p>
                      </div>
                    )}

                    {!hasBank && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-[11px] sm:text-xs text-amber-700">Add bank details to receive payment settlements.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DANGER ZONE TAB */}
              {activeTab === 'danger' && (
                <div className="space-y-4">
                  {/* Deactivate Salon */}
                  <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-bold text-black mb-1">Deactivate Salon</h2>
                    <p className="text-[13px] sm:text-sm text-gray-500 mb-4 sm:mb-4">
                      Temporarily hide your salon from customers.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-200 gap-3 sm:gap-0">
                      <div className="text-center sm:text-left w-full sm:w-auto">
                        <p className="text-[13px] sm:text-sm font-medium text-amber-800">Salon Status</p>
                        <p className="text-[11px] sm:text-xs text-amber-600 mt-0.5">{salon?.isActive ? 'Currently Active & Visible' : 'Currently Deactivated'}</p>
                      </div>
                      <button
                        onClick={handleDeactivate}
                        className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
                      >
                        {salon?.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-bold text-red-600 mb-1">Delete Account</h2>
                    <p className="text-[13px] sm:text-sm text-gray-500 mb-4 sm:mb-4">
                      Permanently delete your account and all salon data.
                    </p>

                    {!showDeleteModal ? (
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} /> Delete My Account
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-[13px] sm:text-sm text-red-700 font-medium">This will permanently delete:</p>
                          <ul className="text-[11px] sm:text-xs text-red-600 mt-1 sm:mt-2 space-y-1 list-disc list-inside">
                            <li>Your salon profile and all services</li>
                            <li>All booking history</li>
                            <li>All reviews and ratings</li>
                            <li>Your account credentials</li>
                          </ul>
                        </div>
                        <div>
                          <label className="block text-[13px] sm:text-sm font-medium text-black mb-1.5">
                            Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
                          </label>
                          <input
                            type="text"
                            value={deleteConfirm}
                            onChange={e => setDeleteConfirm(e.target.value)}
                            placeholder="Type DELETE"
                            className="w-full px-4 py-2.5 sm:py-3 border-2 border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-500 font-mono"
                          />
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                          <button
                            onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                            className="flex-1 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirm !== 'DELETE'}
                            className="flex-1 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Permanently Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

            </TabTransition>
          </div>
        </div>
      </div>
    </div>
  );
}
