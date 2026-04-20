import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { AppInstallBanner } from './components/layout/AppInstallBanner';
import { ToastProvider } from './components/ui/Toast';
import OwnerLayout from './components/owner/OwnerLayout';
import { useOwnerStore } from './store/useOwnerStore';
import { useAuthStore } from './store/useAuthStore';
import { validateBookingToken } from './utils/bookingToken';

// ── Customer pages ────────────────────────────────────────────
const HomePage                = lazy(() => import('./pages/HomePage'));
const SalonsPage              = lazy(() => import('./pages/SalonsPage'));
const SalonDetailPage         = lazy(() => import('./pages/SalonDetailPage'));
const BookingPage             = lazy(() => import('./pages/BookingPage'));
const SearchPage              = lazy(() => import('./pages/SearchPage'));
const CategoriesPage          = lazy(() => import('./pages/CategoriesPage'));
const CategoryDetailPage      = lazy(() => import('./pages/CategoryDetailPage'));
const BookingConfirmationPage = lazy(() => import('./pages/BookingConfirmationPage'));
const LoginPage               = lazy(() => import('./pages/LoginPage'));
const SignupPage              = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage      = lazy(() => import('./pages/ForgotPasswordPage'));
const ProfilePage             = lazy(() => import('./pages/ProfilePage'));
const UserSettingsPage        = lazy(() => import('./pages/UserSettingsPage'));
const WishlistPage            = lazy(() => import('./pages/WishlistPage'));
const CityPage                = lazy(() => import('./pages/CityPage'));
const StylistPage             = lazy(() => import('./pages/StylistPage'));
const NotFoundPage            = lazy(() => import('./pages/NotFoundPage'));

// ── Legal / Info pages ────────────────────────────────────────
const AboutPage    = lazy(() => import('./pages/legal/AboutPage'));
const ContactPage  = lazy(() => import('./pages/legal/ContactPage'));
const PrivacyPage  = lazy(() => import('./pages/legal/PrivacyPage'));
const TermsPage    = lazy(() => import('./pages/legal/TermsPage'));
const CookiesPage  = lazy(() => import('./pages/legal/CookiesPage'));
const HelpPage     = lazy(() => import('./pages/legal/HelpPage'));
const SitemapPage  = lazy(() => import('./pages/legal/SitemapPage'));
const CareersPage  = lazy(() => import('./pages/legal/CareersPage'));

// ── Owner pages ───────────────────────────────────────────────
const OwnerLoginPage      = lazy(() => import('./pages/owner/OwnerLoginPage'));
const OwnerRegisterPage   = lazy(() => import('./pages/owner/OwnerRegisterPage'));
const OwnerDashboardPage  = lazy(() => import('./pages/owner/OwnerDashboardPage'));
const OwnerSalonPage      = lazy(() => import('./pages/owner/OwnerSalonPage'));
const OwnerGalleryPage    = lazy(() => import('./pages/owner/OwnerGalleryPage'));
const OwnerServicesPage   = lazy(() => import('./pages/owner/OwnerServicesPage'));
const OwnerStaffPage      = lazy(() => import('./pages/owner/OwnerStaffPage'));
const OwnerBookingsPage   = lazy(() => import('./pages/owner/OwnerBookingsPage'));
const OwnerSlotsPage      = lazy(() => import('./pages/owner/OwnerSlotsPage'));
const OwnerReviewsPage    = lazy(() => import('./pages/owner/OwnerReviewsPage'));
const OwnerAnalyticsPage  = lazy(() => import('./pages/owner/OwnerAnalyticsPage'));
const OwnerSettingsPage   = lazy(() => import('./pages/owner/OwnerSettingsPage'));

// ── Spinner shown while lazy chunk loads ─────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-2 border-gray-100 rounded-full" />
        <div className="absolute inset-0 border-2 border-t-black border-l-transparent border-r-transparent border-b-transparent rounded-full animate-spin" />
      </div>
      <span className="text-sm text-[#71717A] font-medium">Loading…</span>
    </div>
  </div>
);

// ── Scroll-to-top on every navigation ────────────────────────
const ScrollToTop = () => {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if (state && (state as Record<string, any>).preventScrollReset) {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, state]);
  return null;
};

// ── Owner route guard ─────────────────────────────────────────
const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useOwnerStore();
  if (!isAuthenticated) return <Navigate to="/owner/login" replace />;
  return <OwnerLayout>{children}</OwnerLayout>;
};

// ── Customer route guard ──────────────────────────────────────
const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/account/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

// ── Booking confirmation route guard (token-protected) ────────
const BookingConfirmationRoute = () => {
  const { token } = useParams<{ token: string }>();
  if (!token || !validateBookingToken(token)) {
    return <Navigate to="/" replace />;
  }
  return <BookingConfirmationPage />;
};

// ── Detect fullscreen routes (no header/footer) ───────────────
const FULLSCREEN_STARTS  = ['/owner', '/account/login', '/account/signup', '/account/forgot'];
const FULLSCREEN_CONTAINS = ['/book', '/bookings/confirmation'];

const useIsFullscreen = () => {
  const { pathname } = useLocation();
  return (
    FULLSCREEN_STARTS.some((p) => pathname.startsWith(p)) ||
    pathname.endsWith('/book') ||
    pathname.includes('/bookings/confirmation')
  );
};

// ── App shell ─────────────────────────────────────────────────
const AppShell = () => {
  const isFullscreen = useIsFullscreen();
  const { logout } = useAuthStore();

  // One-time logout on first mount to ensure "keep user logout" (Reset for testing)
  useEffect(() => {
    const hasBeenForced = sessionStorage.getItem('bms-force-logout');
    if (!hasBeenForced) {
      logout();
      sessionStorage.setItem('bms-force-logout', 'true');
    }
  }, [logout]);

  return (
    <div className="min-h-screen bg-white text-black">
      <ScrollToTop />
      
      {!isFullscreen && <AppInstallBanner />}
      {!isFullscreen && <Header />}

      <main className={isFullscreen ? '' : 'min-h-[calc(100vh-64px)]'}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Static routes (registered FIRST to avoid dynamic catch) ── */}
            <Route path="/"                       element={<HomePage />} />
            <Route path="/salons"                 element={<SalonsPage />} />
            <Route path="/search"                 element={<SearchPage />} />
            <Route path="/categories"             element={<CategoriesPage />} />
            <Route path="/categories/:slug"       element={<CategoryDetailPage />} />
            {/* ── 4-Tier Deep SEO URLs ── */}
            <Route path="/salons-in/:stateSlug" element={<CityPage />} />
            <Route path="/salons-in/:stateSlug/:citySlug" element={<CityPage />} />
            <Route path="/salons-in/:stateSlug/:citySlug/:areaSlug" element={<CityPage />} />
            <Route path="/salons-in/:stateSlug/:citySlug/:areaSlug/:businessSlug" element={<SalonDetailPage />} />
            <Route path="/salons-in/:stateSlug/:citySlug/:areaSlug/:businessSlug/:tab" element={<SalonDetailPage />} />
            <Route path="/salons-in/:stateSlug/:citySlug/:areaSlug/:businessSlug/book" element={<CustomerRoute><BookingPage /></CustomerRoute>} />
            
            {/* ── User account routes ── */}
            <Route path="/user/dashboard"         element={<ProfilePage />} />
            <Route path="/user/bookings"          element={<ProfilePage />} />
            <Route path="/user/settings"          element={<UserSettingsPage />} />

            {/* ── Root-level aliases for user routes (Fixing 404s) ── */}
            <Route path="/bookings"               element={<CustomerRoute><ProfilePage /></CustomerRoute>} />
            <Route path="/account/profile"        element={<CustomerRoute><ProfilePage /></CustomerRoute>} />
            
            {/* ── Auth routes ── */}
            <Route path="/account/login"          element={<LoginPage />} />
            <Route path="/account/signup"         element={<SignupPage />} />
            <Route path="/account/forgot"         element={<ForgotPasswordPage />} />
            <Route path="/saved"                  element={<WishlistPage />} />

            {/* ── Stylist Profile & Tipping ── */}
            <Route path="/stylist/:slug"          element={<StylistPage />} />

            {/* ── Backward compatibility for old /salons/:id URLs ── */}
            <Route path="/salons/:id"             element={<SalonDetailPage />} />
            <Route path="/salons/:id/book"        element={<CustomerRoute><BookingPage /></CustomerRoute>} />

            {/* ── Owner auth — no sidebar ── */}
            <Route path="/owner/login"    element={<OwnerLoginPage />} />
            <Route path="/owner/register" element={<OwnerRegisterPage />} />

            {/* ── Owner protected — with sidebar ── */}
            <Route path="/owner/dashboard"  element={<OwnerRoute><OwnerDashboardPage /></OwnerRoute>} />
            <Route path="/owner/salon"      element={<OwnerRoute><OwnerSalonPage /></OwnerRoute>} />
            <Route path="/owner/gallery"    element={<OwnerRoute><OwnerGalleryPage /></OwnerRoute>} />
            <Route path="/owner/services"   element={<OwnerRoute><OwnerServicesPage /></OwnerRoute>} />
            <Route path="/owner/staff"      element={<OwnerRoute><OwnerStaffPage /></OwnerRoute>} />
            <Route path="/owner/bookings"   element={<OwnerRoute><OwnerBookingsPage /></OwnerRoute>} />
            <Route path="/owner/slots"      element={<OwnerRoute><OwnerSlotsPage /></OwnerRoute>} />
            <Route path="/owner/reviews"    element={<OwnerRoute><OwnerReviewsPage /></OwnerRoute>} />
            <Route path="/owner/analytics"  element={<OwnerRoute><OwnerAnalyticsPage /></OwnerRoute>} />
            <Route path="/owner/settings"   element={<OwnerRoute><OwnerSettingsPage /></OwnerRoute>} />

            {/* ── Legal / Info routes ── */}
            <Route path="/about"    element={<AboutPage />} />
            <Route path="/contact"  element={<ContactPage />} />
            <Route path="/privacy"  element={<PrivacyPage />} />
            <Route path="/terms"    element={<TermsPage />} />
            <Route path="/cookies"  element={<CookiesPage />} />
            <Route path="/help"     element={<HelpPage />} />
            <Route path="/sitemap"  element={<SitemapPage />} />
            <Route path="/careers"  element={<CareersPage />} />

            {/* ── Token-protected booking confirmation (BEFORE /:businessSlug catch) ── */}
            <Route path="/:token/bookings/confirmation"              element={<BookingConfirmationRoute />} />
            {/* Bare /bookings/confirmation — always redirect to home (no token) */}
            <Route path="/bookings/confirmation"                     element={<Navigate to="/" replace />} />

            {/* ── Dynamic business routes (LAST — root-level catch) ── */}
            <Route path="/salons-in/:citySlug/:businessSlug/book"    element={<CustomerRoute><BookingPage /></CustomerRoute>} />
            <Route path="/salons-in/:citySlug/:businessSlug"         element={<SalonDetailPage />} />
            
            <Route path="/:businessSlug/book"                        element={<CustomerRoute><BookingPage /></CustomerRoute>} />
            {/* Fallback for old /:businessSlug without city */}
            <Route path="/:businessSlug"                             element={<SalonDetailPage />} />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {!isFullscreen && <Footer />}
      <MobileNav />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </BrowserRouter>
  );
}
