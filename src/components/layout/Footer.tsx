import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Instagram, Twitter, Facebook, Heart } from 'lucide-react';

const footerLinks = {
  Explore: [
    { label: 'All Salons', href: '/salons' },
    { label: 'Categories', href: '/categories' },
    { label: 'Search', href: '/search' },
    { label: 'Top Rated', href: '/salons?sort=rating' },
    { label: 'Featured Salons', href: '/salons?featured=true' },
  ],
  Services: [
    { label: 'Haircut & Styling', href: '/categories/haircut-styling' },
    { label: 'Beard & Shave', href: '/categories/beard-shave' },
    { label: 'Skin & Facial', href: '/categories/skin-facial' },
    { label: 'Spa & Massage', href: '/categories/spa-massage' },
    { label: 'Bridal & Makeup', href: '/categories/bridal-makeup' },
  ],
  Areas: [
    { label: 'Jubilee Hills, Hyd', href: '/salons?area=Jubilee+Hills' },
    { label: 'Indiranagar, Blr', href: '/salons?area=Indiranagar' },
    { label: 'Bandra, Mumbai', href: '/salning?area=Bandra' },
    { label: 'Koramangala, Blr', href: '/salons?area=Koramangala' },
    { label: 'South Ext, Delhi', href: '/salons?area=South+Extension' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'List Your Salon', href: '/owner/register' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Help Center', href: '/help' },
  ],
};

const areas = [
  'Gandhi Nagar', 'Cowl Bazaar', 'Jubilee Hills', 'Bandra', 'Indiranagar',
  'Koramangala', 'South Extension', 'Anna Nagar',
  'Salt Lake', 'Kalyani Nagar', 'Whitefield',
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F7F9FA] border-t border-[#E5E7EB] pb-20 md:pb-0">

      {/* ── For Business CTA Banner ── */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <h3 className="text-lg font-black text-white" style={{ letterSpacing: '-0.02em' }}>
                Own a salon or spa?
              </h3>
              <p className="text-sm text-white/60 mt-0.5">
                List for free and reach thousands of customers instantly.
              </p>
            </div>
            <Link
              to="/owner/register"
              className="flex-shrink-0 bg-white text-black font-bold px-6 py-3 rounded-full text-sm hover:bg-gray-100 transition-colors active:scale-[0.98]"
            >
              List Your Salon Free →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main footer — hidden on mobile for app-like feel ── */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 flex items-center justify-center mt-0.5 flex-shrink-0">
                <img src="/logo.svg" alt="MyBOOQED" className="w-full h-full object-contain" />
              </div>
            <div>
              <div className="text-base text-black leading-tight uppercase" style={{ letterSpacing: '-0.04em' }}>
                <span className="tracking-widest text-[16px]"><span className="font-normal">My</span><span className="font-black">BOOQED</span></span>
              </div>
              <div className="flex flex-col gap-0.5 mt-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
                  <MapPin size={10} className="text-[#71717A]" />
                  Corporate HQ: Ballari
                </div>
                <div className="text-[10px] text-[#9CA3AF] ml-4 font-medium">
                 Ballari · Mumbai · Delhi · Bengaluru · Hyderabad · Ahmedabad · Jaipur · Surat · Lucknow
                </div>
              </div>
            </div>
          </Link>

          <p className="text-sm text-[#71717A] leading-relaxed mb-5 max-w-[200px]">
            Discover and book the best salons across India. Instant confirmation, no calls needed.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-2.5">
            {[
              { Icon: Instagram, label: 'Instagram', href: '#' },
              { Icon: Twitter, label: 'Twitter', href: '#' },
              { Icon: Facebook, label: 'Facebook', href: '#' },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center text-[#71717A] hover:text-black hover:border-[#D1D5DB] hover:shadow-sm transition-all"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>

          {/* App download badges */}
          <div className="mt-5 flex flex-col gap-2">
            <a
              href="#"
              className="flex items-center gap-2.5 bg-black text-white px-3.5 py-2 rounded-xl hover:bg-gray-900 transition-colors w-fit"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <div>
                <div className="text-[8px] text-white/60 leading-none">Download on the</div>
                <div className="text-[11px] font-bold leading-none mt-0.5">App Store</div>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-2.5 bg-black text-white px-3.5 py-2 rounded-xl hover:bg-gray-900 transition-colors w-fit"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0"><path d="M3.18 23.76c.3.17.64.24.99.19l12.6-7.27-2.75-2.75-10.84 9.83zM.44 2.09C.17 2.4 0 2.88 0 3.5v17c0 .62.17 1.1.44 1.41l.07.07 9.53-9.53v-.22L.51 2.02l-.07.07zM20.49 10.46l-2.71-1.56-3.01 3.01 3.01 3.01 2.72-1.57c.78-.45.78-1.44-.01-1.89zM4.17.24L16.77 7.5l-2.75 2.75L3.18.22c.35-.06.7.01.99.02z"/></svg>
              <div>
                <div className="text-[8px] text-white/60 leading-none">Get it on</div>
                <div className="text-[11px] font-bold leading-none mt-0.5">Google Play</div>
              </div>
            </a>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h3 className="text-[11px] font-black text-black uppercase tracking-widest mb-4">
              {title}
            </h3>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#71717A] hover:text-black transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Areas section — hidden on mobile ── */}
      <div className="hidden md:block mt-10 pt-8 border-t border-[#E5E7EB]">
        <div className="text-[11px] font-black text-black uppercase tracking-widest mb-4">
          Popular Areas in India
        </div>
        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <Link
              key={area}
              to={`/salons?area=${encodeURIComponent(area)}`}
              className="text-xs text-[#374151] bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-full hover:border-black hover:text-black transition-all duration-150"
            >
              {area}
            </Link>
          ))}
          {/* India pill */}
          <span className="text-xs text-white bg-black px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
            <MapPin size={10} className="text-white" /> India
          </span>
        </div>
      </div>
    </div>

    {/* ——— Bottom bar ——— */}
    {/* pb-20 md:pb-0 to account for MobileNav height on mobile devices */}
    <div className="hidden md:block border-t border-[#E5E7EB] bg-white pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[#9CA3AF] flex items-center gap-1 text-center sm:text-left">
          © 2025 <span className="uppercase"><span className="font-normal">My</span><span className="font-black">BOOQED</span></span> · Made with
          <Heart size={11} className="fill-red-400 text-red-400" />
          in India
        </p>
          {/* Legal links - wrap on mobile */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link to="/privacy"  className="text-xs text-[#9CA3AF] hover:text-black transition-colors">Privacy</Link>
            <Link to="/terms"    className="text-xs text-[#9CA3AF] hover:text-black transition-colors">Terms</Link>
            <Link to="/cookies"  className="text-xs text-[#9CA3AF] hover:text-black transition-colors">Cookies</Link>
            <Link to="/sitemap"  className="text-xs text-[#9CA3AF] hover:text-black transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
