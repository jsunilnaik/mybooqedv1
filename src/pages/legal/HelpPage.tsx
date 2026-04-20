import { useState } from 'react';
import { HelpCircle, Search, BookOpen, Calendar, CreditCard, User, Scissors, Star, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../../components/layout/PageTransition';

const categories = [
  { icon: Calendar, label: 'Bookings', color: 'bg-blue-50 text-blue-600', count: 6 },
  { icon: CreditCard, label: 'Payments', color: 'bg-green-50 text-green-600', count: 4 },
  { icon: User, label: 'My Account', color: 'bg-purple-50 text-purple-600', count: 5 },
  { icon: Scissors, label: 'For Salons', color: 'bg-amber-50 text-amber-600', count: 7 },
  { icon: Star, label: 'Reviews', color: 'bg-pink-50 text-pink-600', count: 3 },
  { icon: BookOpen, label: 'Getting Started', color: 'bg-gray-50 text-gray-600', count: 4 },
];

const faqs = [
  {
    category: 'Bookings',
    questions: [
      { q: 'How do I make a booking?', a: 'Browse salons, select a salon you like, choose your services, pick a staff member (or any available), select a date and time slot, and confirm your booking. You will receive a confirmation immediately.' },
      { q: 'Can I book for someone else?', a: 'Yes! When making a booking, you can add a note mentioning that the appointment is for another person. Make sure to provide accurate contact details.' },
      { q: 'How do I cancel a booking?', a: 'Go to My Bookings in the app, find the booking you want to cancel, and tap "Cancel Booking". We recommend cancelling at least 2 hours before your appointment time.' },
      { q: 'What happens if the salon cancels my booking?', a: 'In the rare event a salon cancels your booking, you will be notified immediately via the app. You can then rebook at the same salon or choose a different one.' },
      { q: 'Can I book multiple services in one appointment?', a: 'Absolutely! During Step 1 of the booking flow, you can select multiple services. The app will calculate the total duration and show you available time slots accordingly.' },
      { q: 'How far in advance can I book?', a: 'You can currently book up to 14 days in advance. We are working on extending this to 30 days in a future update.' },
    ],
  },
  {
    category: 'Payments',
    questions: [
      { q: 'How do I pay for my appointment?', a: 'Currently, all payments are made directly at the salon after your service is completed. MyBOOQED does not process any payments in Phase 1.' },
      { q: 'Is there a booking fee?', a: 'No! Booking through MyBOOQED is completely free. You only pay the salon\'s service charge directly to them.' },
      { q: 'What payment methods do salons accept?', a: 'Each salon has different accepted payment methods listed on their profile page. Common options include cash, UPI (Google Pay, PhonePe, Paytm), and card payments.' },
      { q: 'Will online payment be available?', a: 'Yes! Online payment via Razorpay (UPI, cards, net banking) is planned for Phase 2. This will allow you to pre-pay for appointments.' },
    ],
  },
  {
    category: 'My Account',
    questions: [
      { q: 'How do I create an account?', a: 'Tap Login in the top right corner, enter your phone number, and you will be logged in instantly. No password needed — we use phone-based authentication.' },
      { q: 'How do I update my profile?', a: 'Go to Account → Profile. You can update your name, email, phone, and profile photo from there.' },
      { q: 'How do I view my booking history?', a: 'Tap "Bookings" in the bottom navigation bar or go to My Bookings from your profile. You can filter by Upcoming, Completed, and Cancelled bookings.' },
      { q: 'Can I delete my account?', a: 'Yes. Go to Account → Profile → Settings → Delete Account. This will permanently remove your account and all associated data. This action cannot be undone.' },
      { q: 'I forgot my login — what do I do?', a: 'Since we use phone-number based login, simply enter your registered phone number to log in again. No password recovery needed.' },
    ],
  },
  {
    category: 'For Salons',
    questions: [
      { q: 'How do I list my salon on MyBOOQED?', a: 'Click "List Your Salon" in the app header or footer. Complete the 5-step registration wizard with your salon details, services, staff, and opening hours. Your salon will be live immediately.' },
      { q: 'Is listing my salon free?', a: 'Yes! Listing your salon on MyBOOQED is completely free during Phase 1. We plan to introduce optional premium features in Phase 2.' },
      { q: 'How do I manage my bookings as a salon owner?', a: 'Log in to your owner dashboard at /owner/dashboard. From there, you can view all bookings, manage your schedule, update services, and respond to reviews.' },
      { q: 'Can I block time slots to prevent bookings?', a: 'Yes! Go to your owner dashboard → Slots. You can block individual time slots, entire days, or set your recurring availability for each staff member.' },
      { q: 'How do I update my services and prices?', a: 'From your owner dashboard, go to Services. You can add new services, edit existing ones (name, price, duration, category), or mark services as inactive.' },
      { q: 'How do I respond to customer reviews?', a: 'In your owner dashboard, go to Reviews. Each review has a "Reply" option where you can post a public response visible to all customers.' },
      { q: 'What happens if I want to remove my listing?', a: 'You can deactivate your salon from Owner Dashboard → Settings → Danger Zone → Deactivate Salon. This hides your salon from customers but preserves your data.' },
    ],
  },
  {
    category: 'Reviews',
    questions: [
      { q: 'How do I leave a review?', a: 'After your appointment, go to My Bookings, find the completed booking, and tap "Leave a Review". You can rate the salon from 1-5 stars and write a comment.' },
      { q: 'Can I edit or delete my review?', a: 'Currently, reviews cannot be edited after submission. Contact us at hello@MyBOOQED.in if you need to remove a review you posted.' },
      { q: 'What should I do if I see a fake review?', a: 'Report fake or suspicious reviews by emailing reviews@MyBOOQED.in with the salon name and review details. We take review integrity very seriously.' },
    ],
  },
  {
    category: 'Getting Started',
    questions: [
      { q: 'What is MyBOOQED?', a: 'MyBOOQED is a premium salon discovery and booking platform. Browse 20+ salons, compare services and prices, and book appointments instantly — without making a single phone call.' },
      { q: 'Which areas are covered?', a: 'We cover major areas in all operating cities, including residential hubs, commercial centers, and popular high streets. Use the location selector to see salons near you.' },
      { q: 'Is MyBOOQED available as a mobile app?', a: 'Currently, MyBOOQED is a mobile-responsive web app that works great on all devices. Native iOS and Android apps are planned for Phase 2.' },
      { q: 'How do I find the best salon near me?', a: 'Use the search bar on the home page to search by service or location. You can also filter by area, rating, and salon type (Men/Women/Unisex) on the Salons page.' },
    ],
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Bookings');
  const [openQ, setOpenQ] = useState<string | null>(null);

  const activeFaqs = faqs.find(f => f.category === activeCategory)?.questions ?? [];
  const filteredFaqs = search.trim()
    ? faqs.flatMap(f => f.questions).filter(q =>
        q.q.toLowerCase().includes(search.toLowerCase()) ||
        q.a.toLowerCase().includes(search.toLowerCase())
      )
    : activeFaqs;

  return (
    <PageTransition>
      <div className="bg-white min-h-screen">

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#E3E8FF] via-[#F5E6FF] to-[#FCE1F4] py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-5">
              <HelpCircle size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-black mb-3" style={{ letterSpacing: '-0.03em' }}>
              How can we help?
            </h1>
            <p className="text-[#71717A] mb-8">Search our help center or browse by category below.</p>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for answers..."
                className="w-full bg-white border border-white/60 rounded-full py-4 pl-12 pr-6 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">

          {!search && (
            <>
              {/* Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
                {categories.map(({ icon: Icon, label, color, count }) => (
                  <button
                    key={label}
                    onClick={() => setActiveCategory(label)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      activeCategory === label
                        ? 'border-black bg-black text-white'
                        : 'border-[#F3F4F6] bg-white hover:border-[#E5E7EB] text-black'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeCategory === label ? 'bg-white/20' : color}`}>
                      <Icon size={18} className={activeCategory === label ? 'text-white' : ''} />
                    </div>
                    <span className="text-xs font-bold">{label}</span>
                    <span className={`text-[10px] ${activeCategory === label ? 'text-white/60' : 'text-[#71717A]'}`}>{count} articles</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* FAQ List */}
          <div>
            {search && (
              <p className="text-sm text-[#71717A] mb-5">
                {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for &quot;{search}&quot;
              </p>
            )}
            {!search && (
              <h2 className="text-xl font-black text-black mb-5" style={{ letterSpacing: '-0.02em' }}>{activeCategory}</h2>
            )}
            <div className="space-y-2">
              {filteredFaqs.map(({ q, a }) => (
                <div key={q} className="border border-[#F3F4F6] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenQ(openQ === q ? null : q)}
                    className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-[#F7F9FA] transition-colors"
                  >
                    <span className="font-semibold text-black text-sm">{q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-[#71717A] flex-shrink-0 transition-transform duration-200 ${openQ === q ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openQ === q && (
                    <div className="px-5 pb-5 border-t border-[#F3F4F6] pt-4">
                      <p className="text-sm text-[#4B5563] leading-relaxed">{a}</p>
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <div className="text-center py-16">
                  <HelpCircle size={32} className="text-[#D1D5DB] mx-auto mb-3" />
                  <p className="text-[#71717A] font-medium">No results found</p>
                  <p className="text-sm text-[#9CA3AF] mt-1">Try different keywords or browse by category</p>
                </div>
              )}
            </div>
          </div>

          {/* Still need help */}
          <div className="mt-12 bg-black rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-black text-white mb-2" style={{ letterSpacing: '-0.02em' }}>Still need help?</h2>
            <p className="text-white/60 text-sm mb-6">Our support team is available Monday–Saturday, 9 AM–6 PM IST.</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-3.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              Contact Support <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
