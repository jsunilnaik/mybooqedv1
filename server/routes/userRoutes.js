// ─── User Routes ────────────────────────────────────────────────────────────
import { Router } from 'express';

const router = Router();

const userPages = [
  { path: '/dashboard', title: 'My Dashboard | Book My Salon', description: 'View your upcoming appointments and account summary.' },
  { path: '/bookings', title: 'My Bookings | Book My Salon', description: 'View and manage all your salon bookings.' },
  { path: '/settings', title: 'Account Settings | Book My Salon', description: 'Manage your Book My Salon account.' },
];

userPages.forEach(({ path, title, description }) => {
  router.get(path, (req, res) => {
    res.json({
      page: `user${path.replace('/', '-')}`,
      canonicalUrl: res.locals.canonicalUrl,
      meta: { title, description, robots: 'noindex, nofollow' },
    });
  });
});

export default router;
