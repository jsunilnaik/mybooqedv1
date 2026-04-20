// ─── Static Routes ──────────────────────────────────────────────────────────
import { Router } from 'express';

const router = Router();

// ── Homepage ──
router.get('/', (req, res) => {
  res.json({
    page: 'homepage',
    canonicalUrl: res.locals.canonicalUrl,
    meta: {
      title: 'Book My Salon — Discover & Book Top Salons Near You',
      description: 'Find and instantly book appointments at the best salons and spas near you.',
    },
  });
});

// ── Search ──
router.get('/search', (req, res) => {
  const { q, location, sort, type, rating } = req.query;

  res.json({
    page: 'search',
    canonicalUrl: res.locals.canonicalUrl,
    query: { q, location, sort, type, rating },
    meta: {
      title: q ? `${q} — Search Results | Book My Salon` : 'Search Salons & Services | Book My Salon',
      description: `Search for ${q || 'salons and beauty services'}${location ? ` in ${location}` : ''}.`,
    },
  });
});

// ── Static / Legal / Info Pages ──
const staticPages = [
  { path: '/about', title: 'About Us | Book My Salon', description: 'Learn about Book My Salon — our mission, team, and how we connect you with the best salons.' },
  { path: '/contact', title: 'Contact Us | Book My Salon', description: "Get in touch with Book My Salon." },
  { path: '/terms-of-service', title: 'Terms of Service | Book My Salon', description: 'Read the Terms of Service for using the Book My Salon platform.' },
  { path: '/privacy-policy', title: 'Privacy Policy | Book My Salon', description: 'Understand how Book My Salon collects, uses, and protects your personal data.' },
  { path: '/cookies', title: 'Cookie Policy | Book My Salon', description: 'Learn about the cookies used on Book My Salon.' },
  { path: '/help', title: 'Help Center | Book My Salon', description: 'Find answers to common questions about booking salons.' },
  { path: '/sitemap', title: 'Sitemap | Book My Salon', description: 'Full sitemap for Book My Salon.' },
  { path: '/careers', title: 'Careers | Book My Salon', description: 'Join the Book My Salon team.' },
];

staticPages.forEach(({ path, title, description }) => {
  router.get(path, (req, res) => {
    res.json({
      page: path.replace('/', ''),
      canonicalUrl: res.locals.canonicalUrl,
      meta: { title, description },
    });
  });
});

export default router;
