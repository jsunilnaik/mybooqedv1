// ─── Category Routes ────────────────────────────────────────────────────────
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    page: 'categories',
    canonicalUrl: res.locals.canonicalUrl,
    meta: {
      title: 'Browse All Salon Categories | Book My Salon',
      description: 'Explore salon categories — haircuts, facials, bridal makeup, nail art, spa, and more.',
    },
  });
});

router.get('/:categorySlug', (req, res) => {
  const { categorySlug } = req.params;
  const readableName = categorySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  res.json({
    page: 'category-detail',
    categorySlug,
    canonicalUrl: res.locals.canonicalUrl,
    meta: {
      title: `${readableName} — Best ${readableName} Salons Near You | Book My Salon`,
      description: `Find and book the best ${readableName.toLowerCase()} salons and services near you.`,
    },
  });
});

export default router;
