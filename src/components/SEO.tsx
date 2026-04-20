import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  jsonLd?: string;
  ogImage?: string;
  ogType?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  canonicalUrl, 
  jsonLd, 
  ogImage,
  ogType = 'website'
}) => {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper to update or create meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMeta('description', description);

    // 3. Open Graph
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    if (ogImage) setMeta('og:image', ogImage, true);
    if (canonicalUrl) setMeta('og:url', canonicalUrl, true);

    // 4. Canonical URL
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }

    // 5. JSON-LD Structured Data
    let scriptParams = document.querySelector('#seo-json-ld');
    if (jsonLd) {
      if (!scriptParams) {
        scriptParams = document.createElement('script');
        scriptParams.setAttribute('type', 'application/ld+json');
        scriptParams.setAttribute('id', 'seo-json-ld');
        document.head.appendChild(scriptParams);
      }
      scriptParams.textContent = jsonLd;
    } else if (scriptParams) {
      scriptParams.remove();
    }

    // Cleanup isn't strictly necessary for an SPA since the next page will override them,
    // but useful if navigating to a page without SEO tags.
  }, [title, description, canonicalUrl, jsonLd, ogImage, ogType]);

  return null;
};
