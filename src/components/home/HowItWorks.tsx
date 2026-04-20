import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CalendarCheck, Scissors, ArrowRight, Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    Icon: Search,
    title: 'Search',
    desc: 'Browse hundreds of salons across India. Filter by service, area, or rating.',
  },
  {
    number: '02',
    Icon: CalendarCheck,
    title: 'Book',
    desc: 'Pick a date and time that suits you. Instant confirmation — no calls.',
  },
  {
    number: '03',
    Icon: Scissors,
    title: 'Enjoy',
    desc: 'Walk in at your booked time and enjoy a premium experience.',
  },
];

const BUSINESS_POINTS = [
  'Free listing — no setup fees',
  'Real-time booking management',
  'Customer reviews and ratings',
  'Reach 50,000+ users across India',
];

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* HOW IT WORKS */}
      <section className="py-10 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <p className="text-[10px] sm:text-xs font-bold text-[#71717A] uppercase tracking-widest mb-2 sm:mb-3">
                Simple and fast
              </p>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-black text-black mb-4 sm:mb-5 leading-tight"
                style={{ letterSpacing: '-0.03em' }}
              >
                Book your next appointment
                <br />
                <span className="text-[#71717A]">in under 60 seconds</span>
              </h2>
              <p className="text-sm sm:text-base text-[#71717A] leading-relaxed mb-6 sm:mb-8 max-w-md">
                No phone calls, no waiting. Just search, pick a time, and show up.
              </p>

              {/* Steps */}
              <div className="space-y-6 mb-8">
                {steps.map((step, i) => {
                  const { Icon } = step;
                  return (
                    <motion.div
                      key={step.number}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <Icon size={18} className="text-white sm:w-5 sm:h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-black text-[#D1D5DB] tracking-widest">
                            {step.number}
                          </span>
                          <h3 className="text-base font-bold text-black">{step.title}</h3>
                        </div>
                        <p className="text-sm text-[#71717A] leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <button
                onClick={() => navigate('/salons')}
                className="inline-flex items-center gap-2 bg-black text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]"
              >
                Find a salon near you
                <ArrowRight size={16} />
              </button>
            </motion.div>

            {/* Right: Visual card stack */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="hidden lg:block relative"
            >
              {/* Background card */}
              <div className="absolute top-6 left-6 right-0 bottom-0 bg-[#F7F9FA] rounded-3xl border border-[#E5E7EB]" />

              {/* Main card */}
              <div className="relative bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] border border-[#F3F4F6] p-6 overflow-hidden">
                {/* Salon image */}
                <div className="rounded-2xl overflow-hidden mb-5 aspect-[16/9]">
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=340&fit=crop&auto=format"
                    alt="Salon interior"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Salon info */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-black text-black text-lg">Premium Salon & Spa</h3>
                    <div className="flex items-center gap-1">
                      <Star size={13} className="fill-[#FFB800] text-[#FFB800]" />
                      <span className="font-bold text-black text-sm">4.8</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#71717A]">Jubilee Hills, Hyderabad</p>
                </div>

                {/* Service rows */}
                <div className="space-y-2 mb-5">
                  {[
                    { name: "Men's Haircut", duration: '30 min', price: '₹200' },
                    { name: 'Beard Trim', duration: '15 min', price: '₹80' },
                  ].map((svc) => (
                    <div
                      key={svc.name}
                      className="flex items-center justify-between py-2.5 border-t border-[#F4F4F5]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-black">{svc.name}</p>
                        <p className="text-xs text-[#71717A]">{svc.duration}</p>
                      </div>
                      <span className="text-sm font-bold text-black">{svc.price}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button className="w-full py-3 bg-black text-white rounded-full font-bold text-sm">
                  Book now
                </button>

                {/* Floating confirmation badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="absolute -bottom-3 -right-3 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-black leading-none">Booking confirmed!</p>
                    <p className="text-[10px] text-[#71717A] mt-0.5">Today at 10:00 AM</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOR BUSINESS SPLIT SECTION */}
      <section className="py-10 sm:py-20 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #FDFBCC 0%, #E2F4D8 100%)',
      }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Visual grid */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="order-2 lg:order-1 grid grid-cols-2 gap-4"
            >
              {[
                {
                  img: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&h=300&fit=crop',
                  label: 'Naturals Salon',
                  rating: '4.9',
                },
                {
                  img: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=300&fit=crop',
                  label: 'Green Trends',
                  rating: '4.7',
                },
                {
                  img: 'https://images.unsplash.com/photo-1470259078422-826894b933aa?w=300&h=300&fit=crop',
                  label: 'Glamour Studio',
                  rating: '4.8',
                },
                {
                  img: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=300&h=300&fit=crop',
                  label: 'Star Cuts',
                  rating: '4.6',
                },
              ].map((salon, i) => (
                <motion.div
                  key={salon.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white"
                >
                  <img
                    src={salon.img}
                    alt={salon.label}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=300&fit=crop';
                    }}
                  />
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-black leading-tight">{salon.label}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      <Star size={10} className="fill-[#FFB800] text-[#FFB800]" />
                      <span className="text-xs font-semibold text-black">{salon.rating}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Right: Text */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="order-1 lg:order-2"
            >
              <p className="text-xs font-bold text-[#3A9E28] uppercase tracking-widest mb-3">
                For salon owners
              </p>
              <h2
                className="text-3xl md:text-4xl font-black text-black mb-5 leading-tight"
                style={{ letterSpacing: '-0.03em' }}
              >
                Grow your salon
                <br />
                with MyBOOQED
              </h2>
              <p className="text-[#374151] text-base leading-relaxed mb-6 max-w-md">
                List your salon for free and reach thousands of customers across India.
                Manage bookings, showcase services, and grow your business.
              </p>

              <ul className="space-y-3 mb-8">
                {BUSINESS_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm text-[#374151] font-medium">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                    {point}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/salons')}
                className="inline-flex items-center gap-2 bg-black text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]"
              >
                List your salon
                <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};
