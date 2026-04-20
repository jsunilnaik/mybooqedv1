import { Link } from 'react-router-dom';
import { Map, Home, Scissors, User, BookOpen, FileText, Briefcase } from 'lucide-react';
import { PageTransition } from '../../components/layout/PageTransition';

const sitemapSections = [
  {
    title: 'Main Pages',
    icon: Home,
    color: 'bg-blue-50 text-blue-600',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Browse Salons', href: '/salons' },
      { label: 'Search', href: '/search' },
      { label: 'Categories', href: '/categories' },
    ],
  },
  {
    title: 'Categories',
    icon: Scissors,
    color: 'bg-amber-50 text-amber-600',
    links: [
      { label: 'Haircut & Styling', href: '/categories/haircut-styling' },
      { label: 'Beard & Shave', href: '/categories/beard-shave' },
      { label: 'Hair Coloring', href: '/categories/hair-coloring' },
      { label: 'Skin & Facial', href: '/categories/skin-facial' },
      { label: 'Spa & Massage', href: '/categories/spa-massage' },
      { label: 'Nail Art', href: '/categories/nail-art' },
      { label: 'Bridal & Makeup', href: '/categories/bridal-makeup' },
      { label: 'Kids Haircut', href: '/categories/kids-haircut' },
    ],
  },
  {
    title: 'Popular Locations',
    icon: Map,
    color: 'bg-green-50 text-green-600',
    links: [
      { label: 'Indiranagar, Blr', href: '/salons?area=Indiranagar' },
      { label: 'Bandra, Mumbai', href: '/salons?area=Bandra' },
      { label: 'Jubilee Hills, Hyd', href: '/salons?area=Jubilee+Hills' },
      { label: 'South Ext, Delhi', href: '/salons?area=South+Extension' },
      { label: 'Koramangala, Blr', href: '/salons?area=Koramangala' },
      { label: 'Anna Nagar, Chennai', href: '/salons?area=Anna+Nagar' },
      { label: 'Salt Lake, Kolkata', href: '/salons?area=Salt+Lake' },
      { label: 'Kalyani Nagar, Pune', href: '/salons?area=Kalyani+Nagar' },
    ],
  },
  {
    title: 'My Account',
    icon: User,
    color: 'bg-purple-50 text-purple-600',
    links: [
      { label: 'Login', href: '/account/login' },
      { label: 'My Profile', href: '/account/profile' },
      { label: 'My Bookings', href: '/bookings' },
    ],
  },
  {
    title: 'Salon Owner',
    icon: Briefcase,
    color: 'bg-orange-50 text-orange-600',
    links: [
      { label: 'Owner Login', href: '/owner/login' },
      { label: 'List Your Salon', href: '/owner/register' },
      { label: 'Owner Dashboard', href: '/owner/dashboard' },
      { label: 'Manage Services', href: '/owner/services' },
      { label: 'Manage Staff', href: '/owner/staff' },
      { label: 'Manage Bookings', href: '/owner/bookings' },
      { label: 'Manage Slots', href: '/owner/slots' },
      { label: 'Reviews', href: '/owner/reviews' },
      { label: 'Analytics', href: '/owner/analytics' },
      { label: 'Settings', href: '/owner/settings' },
    ],
  },
  {
    title: 'Company',
    icon: BookOpen,
    color: 'bg-gray-50 text-gray-600',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Help Center', href: '/help' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Legal',
    icon: FileText,
    color: 'bg-red-50 text-red-600',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Sitemap', href: '/sitemap' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <PageTransition>
      <div className="bg-white min-h-screen">

        {/* Header */}
        <div className="bg-[#F7F9FA] border-b border-[#F3F4F6] py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Map size={18} className="text-white" />
              </div>
              <div className="text-xs font-black text-black uppercase tracking-widest">Navigation</div>
            </div>
            <h1 className="text-4xl font-black text-black mb-3" style={{ letterSpacing: '-0.03em' }}>Sitemap</h1>
            <p className="text-[#71717A]">A complete directory of all pages on MyBOOQED.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sitemapSections.map(({ title, icon: Icon, color, links }) => (
              <div key={title} className="border border-[#F3F4F6] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-[#F3F4F6] bg-[#F7F9FA]">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={15} />
                  </div>
                  <h2 className="font-black text-black text-sm uppercase tracking-widest">{title}</h2>
                </div>
                <ul className="p-4 space-y-1">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        to={href}
                        className="flex items-center justify-between group py-1.5 px-2 rounded-lg hover:bg-[#F7F9FA] transition-colors"
                      >
                        <span className="text-sm text-[#374151] group-hover:text-black transition-colors">{label}</span>
                        <span className="text-[#D1D5DB] group-hover:text-black text-xs transition-colors">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
