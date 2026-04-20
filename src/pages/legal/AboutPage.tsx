
import { Link } from 'react-router-dom';
import { Scissors, Users, Star, TrendingUp, Shield, Heart, ArrowRight } from 'lucide-react';
import { PageTransition } from '../../components/layout/PageTransition';

const stats = [
  { value: '20+', label: 'Partner Salons', icon: Scissors },
  { value: '500+', label: 'Happy Customers', icon: Users },
  { value: '4.8', label: 'Average Rating', icon: Star },
  { value: '1,200+', label: 'Bookings Made', icon: TrendingUp },
];

const values = [
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'We show real reviews, real prices, and real availability. No hidden fees, no surprises — just honest information so you can book with confidence.',
  },
  {
    icon: Heart,
    title: 'Community First',
    description: 'MyBOOQED was built for local salon communities. We support local salon owners and help them grow their business while giving customers the best local experience.',
  },
  {
    icon: Star,
    title: 'Quality Assured',
    description: 'Every salon on our platform is verified. We curate only the best salons so you always get a great experience, every single time.',
  },
  {
    icon: TrendingUp,
    title: 'Always Improving',
    description: 'We constantly listen to our customers and salon partners to improve the platform. Your feedback directly shapes how we build MyBOOQED.',
  },
];

const team = [
  { 
    name: 'J Sunil Naik', 
    role: 'Founder & CEO', 
    initials: 'JS', 
    color: 'bg-blue-100 text-blue-700',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
  },
  { 
    name: 'D Siddraj', 
    role: 'Head of Operations', 
    initials: 'DS', 
    color: 'bg-purple-100 text-purple-700',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
  },
  { 
    name: 'R Deepak Naik', 
    role: 'Lead Developer', 
    initials: 'RD', 
    color: 'bg-green-100 text-green-700',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face'
  },
  { 
    name: 'R Lokesh Naik', 
    role: 'Customer Success', 
    initials: 'RL', 
    color: 'bg-amber-100 text-amber-700',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face'
  },
];

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="bg-white min-h-screen">

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#E3E8FF] via-[#F5E6FF] to-[#FCE1F4] py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/60 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span className="text-sm font-medium text-black">Proudly based in India</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black mb-6" style={{ letterSpacing: '-0.03em' }}>
              Grooming made <span className="text-[#71717A]">simple.</span>
            </h1>
            <p className="text-lg text-[#71717A] max-w-2xl mx-auto leading-relaxed">
              MyBOOQED was born from a simple frustration — calling multiple salons just to find an available slot. We built the solution everyone deserved.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="border-b border-[#F3F4F6]">
          <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-[#F7F9FA] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-black" />
                </div>
                <div className="text-3xl font-black text-black mb-1" style={{ letterSpacing: '-0.03em' }}>{value}</div>
                <div className="text-sm text-[#71717A]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-black text-black uppercase tracking-widest mb-3">Our Story</div>
              <h2 className="text-3xl font-black text-black mb-5" style={{ letterSpacing: '-0.02em' }}>
                Built locally, scaling rapidly
              </h2>
              <div className="space-y-4 text-[#71717A] leading-relaxed">
                <p>
                  In 2024, our founder spent 45 minutes calling salons just to get a haircut. Every salon was either fully booked or didn't answer. That evening, he decided to build a better way.
                </p>
                <p>
                  MyBOOQED launched in January 2025 with just 5 partner salons. Within 3 months, we grew to 20+ salons and processed over 1,200 bookings — all without a single phone call.
                </p>
                <p>
                  Today, we're the go-to platform for salon discovery and booking. Our mission is to make professional grooming accessible, affordable, and hassle-free for everyone.
                </p>
              </div>
            </div>
            <div className="bg-[#F7F9FA] rounded-3xl p-8 space-y-4">
              {[
                { year: '2024', event: 'Founded after a frustrating salon experience' },
                { year: 'Jan 2025', event: 'Launched with our first 5 partner salons' },
                { year: 'Mar 2025', event: 'Reached 20+ salons across multiple areas' },
                { year: 'Jun 2025', event: '1,200+ bookings made, 4.8★ customer rating' },
                { year: 'Now', event: 'Expanding to more cities across the region' },
              ].map(({ year, event }) => (
                <div key={year} className="flex gap-4">
                  <div className="w-20 flex-shrink-0 text-xs font-black text-black pt-0.5">{year}</div>
                  <div className="flex-1 text-sm text-[#71717A] border-l border-[#E5E7EB] pl-4">{event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-[#F7F9FA] py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="text-xs font-black text-black uppercase tracking-widest mb-3">Our Values</div>
              <h2 className="text-3xl font-black text-black" style={{ letterSpacing: '-0.02em' }}>What we stand for</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map(({ icon: Icon, title, description }) => (
                <div key={title} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mb-4">
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-black mb-2">{title}</h3>
                  <p className="text-sm text-[#71717A] leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="text-xs font-black text-black uppercase tracking-widest mb-3">The Team</div>
            <h2 className="text-3xl font-black text-black" style={{ letterSpacing: '-0.02em' }}>Meet the people behind MyBOOQED</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map(({ name, role, initials, color, photo }) => (
              <div key={name} className="text-center">
                {photo ? (
                  <img 
                    src={photo} 
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-white shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallback = (e.target as HTMLImageElement).nextElementSibling;
                      if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center mx-auto mb-3 text-xl font-black ${photo ? 'hidden' : ''}`}>
                  {initials}
                </div>
                <div className="font-bold text-black text-sm">{name}</div>
                <div className="text-xs text-[#71717A] mt-0.5">{role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-black py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
              Ready to book your next appointment?
            </h2>
            <p className="text-white/60 mb-8">Join thousands of happy customers today.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/salons"
                className="bg-white text-black font-bold px-8 py-3.5 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Browse Salons <ArrowRight size={16} />
              </Link>
              <Link
                to="/owner/register"
                className="bg-white/10 text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/20 transition-colors border border-white/20"
              >
                List Your Salon
              </Link>
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
