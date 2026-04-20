// ─── Location Routes ────────────────────────────────────────────────────────
import { Router } from 'express';

const router = Router();

router.get('/:citySlug', (req, res) => {
  const { citySlug } = req.params;
  const cityName = citySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  res.json({
    page: 'location',
    citySlug,
    cityName,
    canonicalUrl: res.locals.canonicalUrl,
    meta: {
      title: `Best Salons in ${cityName} — Book Online | Book My Salon`,
      description: `Discover top-rated salons and spas in ${cityName}. Browse reviews, compare prices, and book online.`,
    },
  });
});

export default router;
