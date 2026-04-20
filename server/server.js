// ─── Book My Salon — Express.js SEO Server ──────────────────────────────────
// This server does THREE things:
// 1. Applies SEO middleware (lowercase + trailing slash redirects)
// 2. Serves SEO metadata as a JSON API under /api/seo-meta/*
// 3. Serves the React SPA (index.html) for ALL other routes

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; // Loads variables from .env file

// ── ESM __dirname equivalent ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Middleware ──
import { lowercaseEnforcer, trailingSlashRemover, canonicalInjector } from './middleware/seoMiddleware.js';

// ── SEO Meta API routes ──
import staticRoutes from './routes/staticRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import businessRoutes from './routes/businessRoutes.js';

const app = express();
const PORT = process.env.PORT || 5500;

// ─── Global SEO Middleware ──────────────────────────────────────────────────
// These run on EVERY request and handle URL normalization via 301 redirects.

app.use(lowercaseEnforcer);       // 1. Force lowercase URLs (301)
app.use(trailingSlashRemover);    // 2. Remove trailing slashes (301)
app.use(canonicalInjector);       // 3. Inject canonical URL into res.locals
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files (React build output) ─────────────────────────────────────
// Serve JS, CSS, images, fonts etc. from the /dist directory.
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath, { index: false }));

// ─── SEO Meta API ───────────────────────────────────────────────────────────
// Provides JSON metadata (title, description, canonical URL) for each page.
// The React frontend can fetch this to inject proper <meta> tags.
// These are under /api/seo-meta/* so they don't conflict with frontend routes.

app.use('/api/seo-meta', staticRoutes);
app.use('/api/seo-meta/categories', categoryRoutes);
app.use('/api/seo-meta/salons-in', locationRoutes);
app.use('/api/seo-meta/user', userRoutes);
app.use('/api/seo-meta/business', businessRoutes);

// ─── SPA Fallback — Serve index.html for ALL frontend routes ────────────────
// This is the key: React Router handles client-side navigation.
// Express just needs to serve index.html for every non-file, non-API request.

app.use((req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If dist/index.html doesn't exist yet (hasn't been built)
      res.status(200).json({
        message: 'Book My Salon SEO Server is running.',
        note: 'Run `npm run build` first to generate the frontend.',
        availableRoutes: {
          homepage: 'http://localhost:' + PORT + '/',
          search: 'http://localhost:' + PORT + '/search?q=haircut&location=ballari',
          categories: 'http://localhost:' + PORT + '/categories/hair-styling',
          location: 'http://localhost:' + PORT + '/salons-in/ballari',
          business: 'http://localhost:' + PORT + '/looks-salon-ballari-x7k2m',
          booking: 'http://localhost:' + PORT + '/looks-salon-ballari-x7k2m/book',
          user: 'http://localhost:' + PORT + '/user/dashboard',
          seoMetaApi: 'http://localhost:' + PORT + '/api/seo-meta/',
        },
      });
    }
  });
});

// ─── Error Handler ──────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message,
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const isProd = process.env.NODE_ENV === 'production';
  const modeColor = isProd ? '\x1b[32m' : '\x1b[33m'; // Green for prod, Yellow for dev
  const resetColor = '\x1b[0m';

  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║   📎 Book My Salon — SEO Server                      ║
  ║   🌐 http://localhost:${PORT}                        ║
  ║   ⚙️  Mode: ${modeColor}${process.env.NODE_ENV?.toUpperCase() || 'DEVELOPMENT'}${resetColor}                     ║
  ║                                                      ║
  ║   Frontend Routes (served via React SPA):            ║
  ║   ① /              → Homepage                        ║
  ║   ② /search        → Dynamic Search                  ║
  ║   ③ /categories/*  → Category SEO Pages              ║
  ║   ④ /salons-in/*   → Local SEO Pages                 ║
  ║   ⑤ /user/*        → User Dashboard                  ║
  ║   ⑥ /:slug         → Business Page (dynamic)         ║
  ║                                                      ║
  ║   SEO Meta API: /api/seo-meta/*                      ║
  ╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
