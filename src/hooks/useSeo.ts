import { useEffect } from 'react';
import { site } from '@/data/site';

interface SeoOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Page-specific title, description, canonical and Open Graph / Twitter tags. */
export function useSeo({ title, description, path, image = '/og-image.jpg', type = 'website' }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title === site.name ? title : `${title} — ${site.name}`;
    const url = new URL(path, site.url).toString();
    const imageUrl = new URL(image, site.url).toString();

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', imageUrl);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);
    setCanonical(url);
  }, [title, description, path, image, type]);
}
