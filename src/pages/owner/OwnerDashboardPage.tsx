import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, TrendingUp, Star, Users, Clock,
  CheckCircle, AlertCircle, XCircle, ChevronRight,
  Scissors, Plus, Settings, BarChart2, ArrowUpRight,
  Shield, FileText, CreditCard, Building2
} from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';
import { TabTransition } from '../../components/layout/PageTransition';
import { buildSalonUrl } from '../../utils/seo';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

function StatCard({ label, value, icon, trend, trendUp, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] sm:text-xs font-medium flex items-center gap-0.5 sm:gap-1 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
            <ArrowUpRight size={12} className={trendUp ? '' : 'rotate-180'} />
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-bold text-black mb-0.5 sm:mb-1">{value}</div>
        <div className="text-[10px] sm:text-sm text-gray-500 leading-tight">{label}</div>
      </div>
    </motion.div>
  );
}

interface VerificationItemProps {
  label: string;
  status: 'verified' | 'pending' | 'missing';
  icon: React.ReactNode;
  link: string;
}

function VerificationItem({ label, status, icon, link }: VerificationItemProps) {
  const statusConfig = {
    verified: { color: 'text-green-600 bg-green-50', icon: <CheckCircle size={14} />, label: 'Verified' },
    pending: { color: 'text-amber-600 bg-amber-50', icon: <AlertCircle size={14} />, label: 'Under Review' },
    missing: { color: 'text-red-500 bg-red-50', icon: <XCircle size={14} />, label: 'Required' },
  };
  const config = statusConfig[status];
  return (
    <Link to={link} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
          {icon}
        </div>
        <span className="text-sm font-medium text-black">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${config.color}`}>
          {config.icon}
          {config.label}
        </span>
        <ChevronRight size={14} className="text-gray-400 group-hover:text-black transition-colors" />
      </div>
    </Link>
  );
}

export default function OwnerDashboardPage() {
  const { owner, salon, bookings, notifications } = useOwnerStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'today'>('overview');

  const stats = {
    totalBookings: bookings.length,
    todayBookings: bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length,
    monthlyRevenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.totalAmount, 0),
    avgRating: Number((salon?.rating || 4.5).toFixed(1)),
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
  };

  // Verification status
  const owner_data = owner as any;
  const hasLegalDocs = owner_data?.legalDocs?.tradeLicense?.number;
  const hasPAN = owner_data?.panDetails?.panNumber && owner_data?.panDetails?.verified;
  const hasBank = owner_data?.bankDetails?.accountNumber && owner_data?.bankDetails?.ifscVerified;

  const verificationSteps = [
    { done: !!salon, label: 'Salon profile created' },
    { done: !!hasLegalDocs, label: 'Legal documents submitted' },
    { done: !!hasPAN, label: 'PAN card verified' },
    { done: !!hasBank, label: 'Bank account verified' },
  ];
  const completedSteps = verificationSteps.filter(s => s.done).length;
  const completionPercent = Math.round((completedSteps / verificationSteps.length) * 100);

  const overallStatus = completionPercent === 100 ? 'verified' : completionPercent >= 50 ? 'pending' : 'incomplete';

  // Today's bookings timeline
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Recent bookings
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // 7-day revenue chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayBookings = bookings.filter(b => b.date === dateStr && b.status === 'completed');
    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      revenue: dayBookings.reduce((sum, b) => sum + b.totalAmount, 0),
      count: dayBookings.length,
    };
  });

  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6 bg-[#F7F9FA] min-h-screen pb-24 lg:pb-8">

      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black leading-tight">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {owner?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-[10px] sm:text-sm mt-0.5 lg:mt-1">{salon?.name || 'Your Salon'} · {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="bg-black text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
          <Link to="/owner/settings" className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            <Settings size={16} className="sm:w-[18px] sm:h-[18px] text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Verification Status Banner */}
      {overallStatus !== 'verified' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border ${overallStatus === 'pending'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-blue-50 border-blue-200'
            }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className={`font-semibold text-sm ${overallStatus === 'pending' ? 'text-amber-800' : 'text-blue-800'}`}>
                {overallStatus === 'pending' ? '⏳ Under Review' : '📋 Complete Profile'}
              </h3>
              <p className={`text-[10px] sm:text-xs mt-0.5 leading-tight ${overallStatus === 'pending' ? 'text-amber-600' : 'text-blue-600'}`}>
                {overallStatus === 'pending'
                  ? 'Your docs are in review (1-2 biz days).'
                  : `${completedSteps} of ${verificationSteps.length} steps done`}
              </p>
            </div>
            <span className={`text-sm sm:text-base font-bold ${overallStatus === 'pending' ? 'text-amber-700' : 'text-blue-700'}`}>
              {completionPercent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white rounded-full h-2 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-2 rounded-full ${overallStatus === 'pending' ? 'bg-amber-500' : 'bg-blue-500'}`}
            />
          </div>

          {/* Steps checklist */}
          <div className="grid grid-cols-2 gap-2">
            {verificationSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                {step.done
                  ? <CheckCircle size={12} className="text-green-500 flex-shrink-0 sm:w-[14px] sm:h-[14px]" />
                  : <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                }
                <span className={`text-[10px] sm:text-xs leading-tight ${step.done ? 'text-gray-700 line-through' : 'text-gray-500'}`}>{step.label}</span>
              </div>
            ))}
          </div>

          {overallStatus === 'incomplete' && (
            <Link to="/owner/register" className="mt-4 sm:mt-3 inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-blue-700 hover:underline">
              Complete Registration <ChevronRight size={10} className="sm:w-3 sm:h-3" />
            </Link>
          )}
        </motion.div>
      )}

      {overallStatus === 'verified' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 bg-green-50 border border-green-200 flex items-center gap-3"
        >
          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Your salon is verified and live!</p>
            <p className="text-xs text-green-600">Customers can discover and book your salon.</p>
          </div>
          <Link to={salon ? buildSalonUrl(salon as any) : '#'} className="ml-auto text-xs font-semibold text-green-700 hover:underline flex items-center gap-1">
            View Listing <ArrowUpRight size={12} />
          </Link>
        </motion.div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Bookings" value={stats.totalBookings} icon={<Calendar size={18} className="lg:w-5 lg:h-5 text-blue-600" />} color="bg-blue-50" trend="+12%" trendUp={true} />
        <StatCard label="Today" value={stats.todayBookings} icon={<Clock size={18} className="lg:w-5 lg:h-5 text-purple-600" />} color="bg-purple-50" />
        <StatCard label="Monthly Rev" value={`₹${stats.monthlyRevenue.toLocaleString('en-IN')}`} icon={<TrendingUp size={18} className="lg:w-5 lg:h-5 text-green-600" />} color="bg-green-50" trend="+8%" trendUp={true} />
        <StatCard label="Avg Rating" value={stats.avgRating.toFixed(1)} icon={<Star size={18} className="lg:w-5 lg:h-5 text-amber-500" />} color="bg-amber-50" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-fit overflow-x-auto mobile-snap-scroll no-scrollbar">
        {(['overview', 'today'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
          >
            {tab === 'today' ? "Today's Schedule" : 'Overview'}
          </button>
        ))}
      </div>

      <TabTransition tabKey={activeTab}>
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-black">Revenue (Last 7 Days)</h2>
                <Link to="/owner/analytics" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  Full Analytics <ArrowUpRight size={12} />
                </Link>
              </div>
              <div className="flex items-end gap-2 h-32">
                {last7Days.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative flex items-end justify-center" style={{ height: '100px' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className={`w-full rounded-t-lg ${i === 6 ? 'bg-black' : 'bg-gray-200'}`}
                        style={{ minHeight: day.revenue > 0 ? '4px' : '2px' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{day.day}</span>
                    {day.revenue > 0 && (
                      <span className="text-xs font-medium text-black">₹{day.revenue}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm sm:text-base font-bold text-black mb-3 sm:mb-4">Verification Status</h2>
              <div className="space-y-1">
                <VerificationItem
                  label="Legal Documents"
                  status={hasLegalDocs ? 'pending' : 'missing'}
                  icon={<FileText size={16} />}
                  link="/owner/settings"
                />
                <VerificationItem
                  label="PAN Card"
                  status={hasPAN ? 'verified' : 'missing'}
                  icon={<Shield size={16} />}
                  link="/owner/settings"
                />
                <VerificationItem
                  label="Bank Account"
                  status={hasBank ? 'verified' : 'missing'}
                  icon={<CreditCard size={16} />}
                  link="/owner/settings"
                />
                <VerificationItem
                  label="Salon Profile"
                  status={salon ? 'verified' : 'missing'}
                  icon={<Building2 size={16} />}
                  link="/owner/salon"
                />
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-sm sm:text-base font-bold text-black">Recent Bookings</h2>
                <Link to="/owner/bookings" className="text-[10px] sm:text-xs text-blue-600 hover:underline font-medium">View all</Link>
              </div>
              {recentBookings.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-400">
                  <Calendar size={28} className="mx-auto mb-2 opacity-30 sm:w-8 sm:h-8" />
                  <p className="text-xs sm:text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">
                          {booking.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">{booking.customerName}</p>
                          <p className="text-xs text-gray-500">{booking.date} · {booking.startTime}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-black">₹{booking.totalAmount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700'
                          : booking.status === 'completed' ? 'bg-gray-100 text-gray-600'
                            : 'bg-red-100 text-red-600'
                          }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm sm:text-base font-bold text-black mb-3 sm:mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <Plus size={16} />, label: 'Add Service', to: '/owner/services', color: 'bg-blue-50 text-blue-600' },
                  { icon: <Users size={16} />, label: 'Add Staff Member', to: '/owner/staff', color: 'bg-purple-50 text-purple-600' },
                  { icon: <Calendar size={16} />, label: 'Manage Slots', to: '/owner/slots', color: 'bg-green-50 text-green-600' },
                  { icon: <BarChart2 size={16} />, label: 'View Analytics', to: '/owner/analytics', color: 'bg-amber-50 text-amber-600' },
                  { icon: <Star size={16} />, label: 'Check Reviews', to: '/owner/reviews', color: 'bg-red-50 text-red-600' },
                  { icon: <Scissors size={16} />, label: 'Edit Salon Profile', to: '/owner/salon', color: 'bg-gray-50 text-gray-600' },
                ].map((action, i) => (
                  <Link
                    key={i}
                    to={action.to}
                    className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-center sm:justify-start gap-1.5 sm:gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group border sm:border-transparent border-gray-100"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color} flex-shrink-0`}>
                      {action.icon}
                    </div>
                    <span className="text-[10px] sm:text-xs lg:text-sm text-center sm:text-left font-medium text-black group-hover:translate-x-0.5 transition-transform leading-tight">{action.label}</span>
                    <ChevronRight size={12} className="hidden sm:block text-gray-300 ml-auto group-hover:text-black transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Today's Schedule */
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-black">
                Today&apos;s Schedule
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                </span>
              </h2>
              <span className="text-sm font-medium text-black bg-gray-100 px-3 py-1 rounded-full">
                {todayBookings.length} appointments
              </span>
            </div>

            {todayBookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 font-medium">No appointments today</p>
                <p className="text-sm text-gray-400 mt-1">Enjoy your day or add availability slots</p>
                <Link to="/owner/slots" className="mt-4 inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                  <Plus size={16} /> Manage Slots
                </Link>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-16 top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-4">
                  {todayBookings.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="w-14 text-right flex-shrink-0">
                        <span className="text-xs font-bold text-black">{booking.startTime}</span>
                        <p className="text-xs text-gray-400">{booking.endTime}</p>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-black border-2 border-white shadow mt-1 flex-shrink-0 relative z-10" />
                      <div className="flex-1 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-black">{booking.customerName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {booking.services?.map((s: any) => s.serviceName).join(', ') || 'Service'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-black">₹{booking.totalAmount}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </TabTransition>
    </div>
  );
}
