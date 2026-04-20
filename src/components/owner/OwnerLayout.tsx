import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Store, Scissors, Users, Calendar,
  Clock, Star, BarChart2, Settings, LogOut, Bell,
  ChevronRight, X, Menu, Sparkles, Bookmark, CheckCircle, Image
} from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';

const NAV_ITEMS = [
  { path: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/owner/salon', icon: Store, label: 'Salon Profile' },
  { path: '/owner/gallery', icon: Image, label: 'Gallery' },
  { path: '/owner/services', icon: Scissors, label: 'Services' },
  { path: '/owner/staff', icon: Users, label: 'Staff' },
  { path: '/owner/bookings', icon: Calendar, label: 'Bookings' },
  { path: '/owner/slots', icon: Clock, label: 'Availability' },
  { path: '/owner/reviews', icon: Star, label: 'Reviews' },
  { path: '/owner/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/owner/settings', icon: Settings, label: 'Settings' },
];

interface OwnerLayoutProps { children: React.ReactNode; }

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const { owner, salon, notifications, logout, markNotificationRead, markAllNotificationsRead } = useOwnerStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/owner/login');
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'booking': return <CheckCircle size={14} className="text-green-600" />;
      case 'review': return <Star size={14} className="text-yellow-500" />;
      case 'cancellation': return <X size={14} className="text-red-500" />;
      default: return <Sparkles size={14} className="text-blue-500" />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
            <img src="/logo.svg" alt="MyBOOQED" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <div>
            <p className="text-white font-bold text-sm lg:text-base leading-none">MyBOOQED</p>
            <p className="text-white/50 text-[10px] lg:text-xs mt-0.5">Owner Portal</p>
          </div>
        </div>
      </div>

      {/* Salon info */}
      {salon && (
        <div className="p-4 mx-3 mt-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img src={salon.images?.cover || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100'} alt={salon.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{salon.name}</p>
              <p className="text-white/50 text-xs truncate">{salon.address?.area}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Owner profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {owner?.name?.charAt(0) || 'O'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">{owner?.name}</p>
            <p className="text-white/50 text-xs truncate">{owner?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-white/60 hover:text-white text-xs transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/10">
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F7F9FA] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-black flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-black shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-3 lg:px-6 h-[52px] lg:h-16 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden xs:block sm:block">
              <p className="text-[10px] lg:text-xs text-gray-400 font-medium leading-none">Welcome back</p>
              <p className="text-sm lg:text-base font-semibold text-black leading-tight mt-0.5">{owner?.name || 'Salon Owner'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell size={18} className="text-gray-600 lg:w-5 lg:h-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unread > 0 && (
                      <button onClick={() => { markAllNotificationsRead(); }} className="text-xs text-gray-500 hover:text-black transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.slice(0, 8).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { markNotificationRead(n.id); }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {getNotifIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${!n.read ? 'text-black' : 'text-gray-600'}`}>{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-1.5" />}
                        </div>
                      </button>
                    ))}
                    {notifications.length === 0 && (
                      <div className="py-8 text-center text-sm text-gray-400">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* View salon link */}
            <NavLink to={`/salons/${salon?.slug || 'sal_001'}`} className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-black transition-colors px-2 lg:px-3 py-1.5 lg:py-2 rounded-xl hover:bg-gray-100">
              <Bookmark size={14} />
              <span className="hidden md:inline">View Salon</span>
              <ChevronRight size={12} />
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
