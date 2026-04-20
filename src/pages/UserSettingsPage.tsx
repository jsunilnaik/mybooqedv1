import React, { useState } from 'react';
import { PageTransition } from '../components/layout/PageTransition';
import { Settings, Bell, Lock, CreditCard, Mail, Phone, MessageCircle, Save, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'general' | 'notifications' | 'security' | 'payments';

export default function UserSettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });

  const [notifs, setNotifs] = useState({
    email: user?.notifications?.email ?? true,
    sms: user?.notifications?.sms ?? true,
    whatsapp: user?.notifications?.whatsapp ?? true,
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profileData);
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ notifications: notifs });
      showToast('Notification preferences saved', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save preferences', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-black' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  const TABS = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard }
  ];

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC]">
        <div className="container-app py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-2">Account Settings</h1>
            <p className="text-gray-500 font-medium">Manage your profile, notifications, and security</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Sidebar navigation */}
            <div className="lg:col-span-3 space-y-2">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === item.id 
                      ? 'bg-black text-white shadow-lg shadow-black/10 translate-x-1' 
                      : 'text-gray-500 hover:bg-white hover:text-black hover:shadow-sm'
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-gray-400'} />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="lg:col-span-9">
              <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === 'general' && (
                    <motion.div 
                      key="general"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-6 sm:p-8 space-y-8"
                    >
                      <div>
                        <h2 className="text-xl font-black text-black mb-1">General Profile</h2>
                        <p className="text-sm text-gray-500 font-medium">Update your basic information</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                          <div className="flex items-center bg-[#F9FAFB] border-2 border-gray-100 rounded-2xl p-4 focus-within:border-black transition-colors">
                            <UserIcon size={18} className="text-gray-400 mr-3" />
                            <input 
                              type="text" 
                              value={profileData.name}
                              onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                              className="bg-transparent w-full text-sm font-bold outline-none"
                              placeholder="Your name"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                          <div className="flex items-center bg-[#F9FAFB] border-2 border-gray-100 rounded-2xl p-4 focus-within:border-black transition-colors">
                            <Mail size={18} className="text-gray-400 mr-3" />
                            <input 
                              type="email" 
                              value={profileData.email}
                              onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))}
                              className="bg-transparent w-full text-sm font-bold outline-none"
                              placeholder="Your email"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                          <div className="flex items-center bg-[#F9FAFB] border-2 border-gray-100 rounded-2xl p-4 focus-within:border-black transition-colors">
                            <Phone size={18} className="text-gray-400 mr-3" />
                            <input 
                              type="tel" 
                              value={profileData.phone}
                              onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                              className="bg-transparent w-full text-sm font-bold outline-none"
                              placeholder="Your phone"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">City</label>
                          <div className="flex items-center bg-[#F9FAFB] border-2 border-gray-100 rounded-2xl p-4 focus-within:border-black transition-colors">
                            <Settings size={18} className="text-gray-400 mr-3" />
                            <input 
                              type="text" 
                              value={profileData.city}
                              onChange={e => setProfileData(p => ({ ...p, city: e.target.value }))}
                              className="bg-transparent w-full text-sm font-bold outline-none"
                              placeholder="Your city"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button 
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="px-8 py-3 bg-black text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                          {isSaving ? <span className="animate-spin text-sm">W</span> : <Save size={18} />}
                          Save Profile
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'notifications' && (
                    <motion.div 
                      key="notifications"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-6 sm:p-8 space-y-8"
                    >
                      <div>
                        <h2 className="text-xl font-black text-black mb-1">Notification Preferences</h2>
                        <p className="text-sm text-gray-500 font-medium">Choose how you want to receive updates</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 bg-[#F9FAFB] border-2 border-gray-100 rounded-3xl group hover:border-black transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                              <MessageCircle size={24} />
                            </div>
                            <div>
                              <p className="font-black text-black uppercase tracking-wider text-xs">WhatsApp Notifications</p>
                              <p className="text-sm text-gray-500 font-medium mt-1">Status, reminders, and confirmations via WhatsApp</p>
                            </div>
                          </div>
                          <Toggle 
                            checked={notifs.whatsapp} 
                            onChange={v => setNotifs(p => ({ ...p, whatsapp: v }))} 
                          />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-[#F9FAFB] border-2 border-gray-100 rounded-3xl group hover:border-black transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                              <Phone size={24} />
                            </div>
                            <div>
                              <p className="font-black text-black uppercase tracking-wider text-xs">SMS Notifications</p>
                              <p className="text-sm text-gray-500 font-medium mt-1">Receive booking alerts via direct message</p>
                            </div>
                          </div>
                          <Toggle 
                            checked={notifs.sms} 
                            onChange={v => setNotifs(p => ({ ...p, sms: v }))} 
                          />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-[#F9FAFB] border-2 border-gray-100 rounded-3xl group hover:border-black transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                              <Mail size={24} />
                            </div>
                            <div>
                              <p className="font-black text-black uppercase tracking-wider text-xs">Email Updates</p>
                              <p className="text-sm text-gray-500 font-medium mt-1">Get invoices and detailed summaries via email</p>
                            </div>
                          </div>
                          <Toggle 
                            checked={notifs.email} 
                            onChange={v => setNotifs(p => ({ ...p, email: v }))} 
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <button 
                          onClick={handleSaveNotifications}
                          disabled={isSaving}
                          className="px-8 py-3 bg-black text-white rounded-2xl font-black text-sm shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                          {isSaving ? <span className="animate-spin text-sm">W</span> : <Save size={18} />}
                          Save Preferences
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {(activeTab === 'security' || activeTab === 'payments') && (
                    <motion.div 
                      key="coming-soon"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-12 text-center space-y-4"
                    >
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                        <Lock size={32} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-black capitalize">{activeTab} coming soon</h2>
                        <p className="text-gray-500">We are working hard to bring this feature to you.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
