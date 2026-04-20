// ─── Business Routes (Dynamic — MUST be last) ──────────────────────────────
import { Router } from 'express';
import { parseBusinessUrl } from '../utils/slugify.js';

const router = Router();

/**
 * GET /:businessSlug — Salon/Business detail page.
 * URL format: /business-name-slug-uniqueId
 */
router.get('/:businessSlug', (req, res) => {
  const { businessSlug } = req.params;
  const { slug, uniqueId } = parseBusinessUrl(businessSlug);

  if (!uniqueId) {
    return res.status(404).json({
      error: 'Business not found',
      message: `No business matching "${businessSlug}". Please check the URL.`,
    });
  }

  const readableName = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  res.json({
    page: 'business-detail',
    slug,
    uniqueId,
    canonicalUrl: res.locals.canonicalUrl,
    meta: {
      title: `${readableName} — Book Appointment Online | Book My Salon`,
      description: `Book your appointment at ${readableName}. View services, prices, reviews, and book instantly online.`,
    },
  });
});

/**
 * GET /:businessSlug/book — Booking flow for a specific salon.
 */
router.get('/:businessSlug/book', (req, res) => {
  const { businessSlug } = req.params;
  const { slug, uniqueId } = parseBusinessUrl(businessSlug);

  if (!uniqueId) {
    return res.status(404).json({
      error: 'Business not found',
      message: `Cannot book — no business matching "${businessSlug}".`,
    });
  }

  const readableName = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  res.json({
    page: 'booking',
    slug,
    uniqueId,
    canonicalUrl: res.locals.canonicalUrl,
    meta: {
      title: `Book at ${readableName} | Book My Salon`,
      description: `Select your services, choose a time, and book at ${readableName}.`,
      robots: 'noindex, follow',
    },
  });
});

export default router;
