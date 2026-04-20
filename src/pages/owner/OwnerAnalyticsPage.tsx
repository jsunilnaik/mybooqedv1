import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Star, Users, Calendar, DollarSign } from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';

function formatPrice(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

export default function OwnerAnalyticsPage() {
  const { bookings, services, staff, getStats } = useOwnerStore();
  const stats = getStats();

  const last30 = useMemo(() => {
    const days: { date: string; revenue: number; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
      days.push({ date: dateStr, revenue: dayBookings.reduce((s, b) => s + b.totalAmount, 0), count: dayBookings.length });
    }
    return days;
  }, [bookings]);

  const last7 = last30.slice(-7);
  const maxRevenue = Math.max(...last30.map(d => d.revenue), 1);
  const maxCount = Math.max(...last7.map(d => d.count), 1);

  const topServices = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    bookings.forEach(b => {
      b.services.forEach(s => {
        if (!map[s.serviceName]) map[s.serviceName] = { name: s.serviceName, count: 0, revenue: 0 };
        map[s.serviceName].count++;
        const svc = services.find(sv => sv.name === s.serviceName);
        map[s.serviceName].revenue += svc?.price || 0;
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [bookings, services]);

  const topStaff = useMemo(() => {
    return staff.map(m => ({
      name: m.name,
      role: m.role,
      rating: m.rating || 0,
      bookings: bookings.filter(b => b.services.some(s => s.staffName === m.name)).length,
    })).sort((a, b) => b.bookings - a.bookings).slice(0, 4);
  }, [staff, bookings]);

  const KPIS = [
    { label: 'Total Revenue', value: formatPrice(bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.totalAmount, 0)), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: '+12%' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+8%' },
    { label: 'Avg Rating', value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : 'New', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+0.2' },
    { label: 'Team Size', value: staff.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', trend: `${staff.filter(s => s.isAvailable).length} active` },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Analytics</h1>
        <p className="text-[#71717A] text-sm mt-1">Performance overview for your salon</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-black text-black">{kpi.value}</p>
              <p className="text-xs text-[#71717A] mt-1">{kpi.label}</p>
              <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {kpi.trend}
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart (30 days) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-black text-sm">Revenue — Last 30 Days</h2>
          <span className="text-xs text-[#71717A]">Daily revenue in ₹</span>
        </div>
        <div className="flex items-end gap-1 h-32">
          {last30.map((day, i) => (
            <div key={i} className="flex-1 flex items-end group relative">
              <div
                className="w-full bg-black rounded-t-sm transition-all duration-300 group-hover:bg-gray-700 min-h-[2px]"
                style={{ height: `${Math.max(2, (day.revenue / maxRevenue) * 100)}%` }}
              />
              {day.revenue > 0 && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                  ₹{day.revenue}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-[#71717A]">{last30[0]?.date.slice(5).replace('-', '/')}</span>
          <span className="text-[10px] text-[#71717A]">Today</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings bar chart (7 days) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-black text-sm mb-6">Bookings — Last 7 Days</h2>
          <div className="space-y-3">
            {last7.map((day, i) => {
              const dayName = new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
              const pct = maxCount > 0 ? Math.round((day.count / maxCount) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-[#71717A] w-16 flex-shrink-0">{dayName}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div className="bg-black h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-black w-4 text-right">{day.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-black text-sm mb-4">Top Services</h2>
          {topServices.length === 0 ? (
            <p className="text-sm text-[#71717A] text-center py-8">No booking data yet</p>
          ) : (
            <div className="space-y-3">
              {topServices.map((svc, i) => (
                <div key={svc.name} className="flex items-center gap-3">
                  <span className="text-sm font-black text-[#71717A] w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{svc.name}</p>
                    <p className="text-xs text-[#71717A]">{svc.count} booking{svc.count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-semibold">{formatPrice(svc.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Staff */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-black text-sm mb-4">Staff Performance</h2>
          {topStaff.length === 0 ? (
            <p className="text-sm text-[#71717A] text-center py-8">No staff data yet</p>
          ) : (
            <div className="space-y-3">
              {topStaff.map(member => (
                <div key={member.name} className="flex items-center gap-3 p-3 bg-[#F7F9FA] rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{member.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black">{member.name}</p>
                    <p className="text-xs text-[#71717A]">{member.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-black">{member.bookings}</p>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-[#71717A]">{member.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-black text-sm mb-4">Booking Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Confirmed', count: stats.upcomingBookings, color: 'bg-green-500', pct: stats.totalBookings > 0 ? Math.round((stats.upcomingBookings / stats.totalBookings) * 100) : 0 },
              { label: 'Completed', count: stats.completedBookings, color: 'bg-gray-400', pct: stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0 },
              { label: 'Cancelled', count: stats.cancelledBookings, color: 'bg-red-400', pct: stats.totalBookings > 0 ? Math.round((stats.cancelledBookings / stats.totalBookings) * 100) : 0 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-black">{item.label}</span>
                  <span className="text-xs text-[#71717A]">{item.count} ({item.pct}%)</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Revenue vs cancellation insight */}
          <div className="mt-6 p-4 bg-[#F7F9FA] rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              {stats.cancelledBookings > stats.completedBookings
                ? <TrendingDown className="w-4 h-4 text-red-500" />
                : <TrendingUp className="w-4 h-4 text-green-500" />}
              <p className="text-xs font-semibold text-black">Insight</p>
            </div>
            <p className="text-xs text-[#71717A]">
              {stats.cancelledBookings > stats.completedBookings
                ? 'High cancellation rate detected. Consider sending reminders before appointments.'
                : `${Math.round(((stats.completedBookings) / Math.max(stats.totalBookings, 1)) * 100)}% completion rate — great job!`}
            </p>
          </div>
        </div>
      </div>

      {/* Peak hours heatmap */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-black text-sm mb-4">Peak Hours Heatmap</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="flex gap-1 mb-2">
              <div className="w-12" />
              {['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM'].map(h => (
                <div key={h} className="flex-1 text-center text-[9px] text-[#71717A] font-medium">{h}</div>
              ))}
            </div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="flex gap-1 mb-1">
                <div className="w-12 flex items-center">
                  <span className="text-[10px] text-[#71717A] font-medium">{day}</span>
                </div>
                {Array.from({ length: 12 }, (_, hi) => {
                  const intensity = Math.random();
                  const opacity = intensity < 0.2 ? 0.08 : intensity < 0.5 ? 0.3 : intensity < 0.75 ? 0.6 : 1;
                  return (
                    <div key={hi} className="flex-1 h-5 rounded-sm bg-black transition-all"
                      style={{ opacity }}
                      title={`${day} ${9 + hi}:00 — ${Math.round(intensity * 8)} bookings`}
                    />
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-[10px] text-[#71717A]">Less</span>
              {[0.08, 0.3, 0.6, 1].map(o => (
                <div key={o} className="w-4 h-4 rounded-sm bg-black" style={{ opacity: o }} />
              ))}
              <span className="text-[10px] text-[#71717A]">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
