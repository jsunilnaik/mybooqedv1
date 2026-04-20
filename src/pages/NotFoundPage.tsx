import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Home, ArrowRight, Scissors, Grid, Star, HelpCircle, Info } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Browse Salons',  href: '/salons',            icon: Scissors  },
  { label: 'Search Services',href: '/search',            icon: Search    },
  { label: 'All Categories', href: '/categories',        icon: Grid      },
  { label: 'Top Rated',      href: '/salons?sort=rating',icon: Star      },
  { label: 'Help Center',    href: '/help',              icon: HelpCircle},
  { label: 'About Us',       href: '/about',             icon: Info      },
];

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg mx-auto"
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-[#F7F9FA] rounded-3xl flex items-center justify-center border border-[#E5E7EB]">
            <Scissors size={36} className="text-black" />
          </div>
        </div>

        {/* 404 */}
        <div
          className="text-[120px] sm:text-[160px] font-black text-black leading-none mb-2 select-none"
          style={{ letterSpacing: '-0.06em' }}
        >
          404
        </div>

        <div className="w-16 h-1 bg-black rounded-full mx-auto mb-6" />

        <h1
          className="text-2xl sm:text-3xl font-black text-black mb-3"
          style={{ letterSpacing: '-0.03em' }}
        >
          Page not found
        </h1>
        <p className="text-sm text-[#71717A] leading-relaxed mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try searching for a salon or browse our categories.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-full font-bold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all"
          >
            <Home size={16} />
            Go Home
          </button>
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 bg-white text-black px-6 py-3.5 rounded-full font-bold text-sm border border-[#E5E7EB] hover:border-black hover:bg-[#F7F9FA] active:scale-[0.98] transition-all"
          >
            <Search size={16} />
            Search Salons
          </button>
        </div>

        {/* Quick links grid */}
        <div className="bg-[#F7F9FA] rounded-2xl p-5 border border-[#F3F4F6]">
          <p className="text-xs font-bold text-[#71717A] uppercase tracking-widest mb-4 text-center">
            Quick Links
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-[#F3F4F6] hover:border-[#E5E7EB] hover:shadow-sm transition-all group"
              >
                <div className="w-7 h-7 bg-[#F7F9FA] rounded-lg flex items-center justify-center flex-shrink-0">
                  <link.icon size={13} className="text-black" />
                </div>
                <span className="text-sm font-semibold text-black flex-1 text-left leading-tight">{link.label}</span>
                <ArrowRight size={13} className="text-[#D1D5DB] group-hover:text-black transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
