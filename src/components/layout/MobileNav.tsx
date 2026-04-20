import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, User, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/', label: 'Home', Icon: Home, exact: true },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/saved', label: 'Saved', Icon: Heart },
  { href: '/bookings', label: 'Bookings', Icon: Calendar },
  { href: '/account/profile', label: 'Account', Icon: User },
];

const HIDDEN_PREFIXES = [
  '/owner',
  '/account/login',
  '/account/signup',
  '/account/forgot',
  '/bookings/confirmation',
];

const HIDDEN_FRAGMENTS = ['/book'];

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const shouldHide =
    HIDDEN_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    path.endsWith('/book') ||
    path.includes('/book/') ||
    path.includes('/bookings/confirmation');

  if (shouldHide) return null;

  const isActive = (href: string, exact = false) => {
    if (exact) return path === href;
    return path.startsWith(href);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E5E7EB]/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch min-w-0">
        {navItems.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0 transition-all duration-200',
                'min-h-[56px] py-1.5',
                'active:scale-[0.92] active:opacity-70',
                active ? 'text-black' : 'text-[#9CA3AF]'
              )}
              aria-label={label}
            >
              {/* Icon container with active indicator */}
              <div className={cn(
                'flex items-center justify-center transition-all duration-250 ease-out',
                active
                  ? 'w-10 h-7 rounded-full bg-black scale-100'
                  : 'w-7 h-7 rounded-full bg-transparent scale-100'
              )}>
                <Icon
                  size={active ? 17 : 18}
                  className={cn(
                    'transition-all duration-200',
                    active ? 'text-white' : 'text-[#9CA3AF]'
                  )}
                  strokeWidth={active ? 2.5 : 1.75}
                />
              </div>
              <span className={cn(
                'text-[10px] leading-none transition-all duration-200',
                active ? 'text-black font-bold' : 'text-[#9CA3AF] font-medium'
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
