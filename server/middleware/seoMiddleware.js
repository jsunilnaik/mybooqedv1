// ─── SEO Middleware Suite ────────────────────────────────────────────────────

/**
 * Middleware: Force all URLs to lowercase (301 redirect).
 */
export function lowercaseEnforcer(req, res, next) {
  const path = req.path;

  if (path !== path.toLowerCase()) {
    const lowercasePath = path.toLowerCase();
    const queryString = req.originalUrl.includes('?')
      ? '?' + req.originalUrl.split('?')[1]
      : '';
    return res.redirect(301, lowercasePath + queryString);
  }

  next();
}

/**
 * Middleware: Remove trailing slashes (301 redirect, except root "/").
 */
export function trailingSlashRemover(req, res, next) {
  const path = req.path;

  if (path.length > 1 && path.endsWith('/')) {
    const cleanPath = path.slice(0, -1);
    const queryString = req.originalUrl.includes('?')
      ? '?' + req.originalUrl.split('?')[1]
      : '';
    return res.redirect(301, cleanPath + queryString);
  }

  next();
}

/**
 * Middleware: Inject canonical URL into res.locals.
 * Query parameters are excluded from canonical URLs.
 */
export function canonicalInjector(req, res, next) {
  const protocol = req.protocol;
  const host = req.get('host');
  const path = req.path.toLowerCase().replace(/\/+$/, '') || '/';

  res.locals.canonicalUrl = `${protocol}://${host}${path}`;

  next();
}
