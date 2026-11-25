# The Masala Company — website

A premium, 3D-enhanced marketing site for a masala & spice manufacturer.

**Stack:** React 18 · Vite 6 · TypeScript (strict) · Tailwind CSS 4 · Three.js / React Three Fiber / drei · Framer Motion · Lenis · Lucide icons · React Router 6.

```bash
npm install
npm run dev        # local dev server
npm run typecheck  # TypeScript only
npm run build      # typecheck + production build → dist/
npm run preview    # serve the production build
```

## Pages

| Route | Page |
| --- | --- |
| `/` | Home — cinematic 3D hero, intro, featured products, categories, ingredients, process, quality, story, CTA |
| `/about` | Company intro, brand story, vision & mission, values, manufacturing expertise, timeline |
| `/products` | Catalogue with category filter + search (both synced to the URL, e.g. `/products?category=whole-spices&q=pepper`) |
| `/products/:slug` | Product detail with interactive 3D pack (drag to rotate, pack-size aware label), ingredients, specs, related products |
| `/ingredients` | 3D ingredient explorer + editorial spice index |
| `/process` | Scroll-driven 3D storytelling — particles morph through the six manufacturing stages |
| `/quality` | QC process, testing framework, certificate slots, batch traceability |
| `/contact` | Validated contact form, contact details, map slot. `/contact?product=<slug>` pre-fills an enquiry |
| `*` | 404 |

## Project structure

```
src/
  animations/   Reveal, SplitText, MaskReveal, ScrollRevealText, PageTransition, variants
  components/
    ui/         Button, SectionHeading, FormField (Input/TextArea/Select), Marquee, HeatMeter, PendingBadge
    layout/     Navbar, Footer
    product/    ProductCard, ProductGrid, ProductFilters, PackVisual (SVG pack render)
    contact/    ContactForm
    common/     Logo, Loaders, SmoothScroll (Lenis), SocialLinks, SpiceMound (SVG)
    sections/   PageHero, CTASection, home/*
  data/         site.ts (brand/contact config), products, categories, ingredients, content
  hooks/        useSeo, useDeviceTier, useMediaQuery, useWebGL
  layouts/      RootLayout (navbar, animated route outlet, footer)
  pages/        One file per route (lazy-loaded)
  services/     contact.ts (form delivery)
  three/        SceneCanvas wrapper, HeroScene, ProductViewer, ProcessScene, IngredientScene, parts/, utils/
  types/        Shared TypeScript types
  utils/        cn, color, validation
```

## 3D & performance

- All 3D geometry is **procedural** (no model downloads); lighting uses drei `Lightformer`s, so no HDR files are fetched.
- `three` + R3F load **only** on pages that use them (lazy chunks). The initial load is React + app shell + CSS.
- `SceneCanvas` mounts a canvas only when it nears the viewport, pauses rendering off-screen, and falls back to an SVG visual if WebGL is unavailable or a scene errors.
- `useDeviceTier` scales pixel ratio, particle counts, contact shadows and pointer effects for low/mid/high devices. `prefers-reduced-motion` disables smooth scrolling and drops to the low tier.
- Product drag-to-rotate uses `touch-action: pan-y`, so mobile users can still scroll past the viewer.

## Contact form

The form validates on blur and on submit, and has a honeypot field for bots. **It does not send email until a backend is configured.**

1. Copy `.env.example` to `.env`.
2. Set `VITE_CONTACT_ENDPOINT` to a URL that accepts a JSON `POST` of `{ name, email, phone, subject, message }` (for example Formspree, a serverless function, or your own API).

Without an endpoint, a valid submission shows "Online delivery isn't connected yet", says clearly that the message was **not** sent, and offers a pre-filled `mailto:` link.

## ⚠️ Placeholders to replace before launch

Nothing below was supplied by the client. Each item is visibly marked on the site with a `PendingBadge` (search the code for `PendingBadge` or `PLACEHOLDER`).

| What | Where |
| --- | --- |
| Brand name (currently derived from the project name), email, phone, address, hours | `src/data/site.ts` |
| Social profile URLs (icons stay disabled until they're set) | `src/data/site.ts → social` |
| Google Maps embed URL | `src/data/site.ts → contact.mapEmbedUrl` |
| Confirmed SKU list and pack sizes | `src/data/products.ts` (`retailPacks`, `wholePacks`) |
| Mesh size, moisture, shelf life, grade (lab/spec-sheet values) | `src/data/products.ts` (`pending: true` specs) |
| Blend recipes and proportions | `src/data/products.ts → ingredients` |
| Certifications and licences (none are claimed) | `src/data/content.ts → certifications`, then add the certificate images |
| Testing scope (in-house vs external lab), limits, methods | `src/pages/Quality.tsx` |
| Batch-code format (the one shown is an example) | `src/pages/Quality.tsx → batchParts` |
| Founding story, timeline years and milestones | `src/data/content.ts → timeline`, `src/pages/About.tsx` |
| Facility, machinery and capacity details | `src/pages/About.tsx`, `src/pages/Process.tsx` |
| Actual sourcing regions (traditional growing regions are shown instead) | `src/data/ingredients.ts` |
| Product photography / final packaging artwork (current visuals are illustrative SVG and 3D renders, and are labelled as such) | `PackVisual`, `three/parts/Pouch.tsx` |
| Production domain for canonical / OG URLs and `robots.txt` | `.env → VITE_SITE_URL`, `public/robots.txt` |

## Deployment

This is a single-page app, so every route must fall back to `index.html`. `public/_redirects` handles this on Netlify. On other hosts, configure an equivalent rewrite.
