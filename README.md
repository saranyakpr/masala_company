# 12 SPICES — Masala & Whole Spices

**Authentic Flavours. Extraordinary Taste.**

The 12 SPICES brand website is a multi-page React site built around one signature 3D jar. It includes a cinematic home film, interactive product presentations, a shop with cart and checkout, and a contact page.

**Stack:** React 19 · TypeScript · Vite · React Router · Three.js / React Three Fiber / Drei · GSAP + ScrollTrigger · Lenis · Tailwind CSS v4

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # serve the production build
npm run lint       # oxlint
```

On Windows PowerShell, if `npm` is blocked by the execution policy, use `npm.cmd run dev`.

## Pages

| Route | Page |
| --- | --- |
| `/` | **Home.** Hero powder-cloud transitions, then the brand intro (scroll-driven pour into spice dunes), featured spices, signature blends, dishes, and a shop CTA |
| `/about` | **About Us.** Brand story, our journey, quality & sourcing (3D whole spices), manufacturing process, our commitment |
| `/spices` | **Our Spices.** All 12 spices, each with a live 3D jar, details and a studio-shot gallery (`?item=cumin` links straight to one) |
| `/blends` | **Our Blend.** The 6 signature masalas, presented the same way, plus the dish each blend is made for |
| `/shop` | **Shop Now.** Catalogue with category and form filters, search and sorting |
| `/shop/:id` | **Product detail.** 3D view and three studio images, pack sizes, quantity, add to cart or buy now |
| `/cart`, `/checkout` | Cart (saved in the browser) and checkout |
| `/contact` | **Contact.** Form, address, email and phone, a map placeholder, social links |

## Before going live: replace the placeholders

1. **`src/data/company.ts`**: email (`hello@example.com`), phone, address, socials, shipping rules, and optionally `mapEmbedUrl` (paste a Google Maps "Embed a map" iframe `src` to show a live map).
2. **`src/data/products.ts`**: ⚠️ the **prices and pack sizes are samples**. Set your real ones in each product's `sizes`.
3. **`src/pages/AboutPage.tsx`**: the "Our journey" chapters are brand philosophy, not company history. Replace them with your real milestones.
4. **Payments:** `src/lib/checkout.ts` is the integration point. `placeOrder` currently opens the customer's email app with the full order addressed to `company.email`, so orders reach you without a backend. Replace it with a call to your server and payment gateway (Razorpay, Stripe, PayU…).

## How it works

```
src/
  App.tsx                       loader, routes, page transitions, mounts the 3D film on / and /about
  pages/                        Home, About, Spices, Blends, Shop, Product, Cart, Checkout, Contact, 404
  data/                         products (18), company, content, hero effects, ingredients
  lib/
    scene.ts                    scroll "director": per-section enter/progress/exit (no React renders)
    cart.ts / checkout.ts       cart store (localStorage) and order hand-off
  components/three/
    jarParts.ts, BottleMeshes   the single 12 SPICES jar: geometry, materials, label, fills
    labelTexture.ts             the jar label painted on canvas (colour + gold-foil metalness)
    CinematicScrollScene.tsx    fixed full-page canvas for the home film / about ingredients
    SpiceBottle3D.tsx           jar poses: hero → pour → featured (left) → blends (right) → finale
    heroDirector.ts             hero choreography: hold → open → pour → cloud → emerge
    HeroPowderCloud.tsx         GPU powder (grains, dust, fragments, cloud puffs), 5 flow patterns
    PowderBurst.tsx             scroll-scrubbed pour + spice dunes
    ProductViewer3D.tsx         interactive jar for product pages (drag, garnish, powder puff)
    studioCore.ts               offscreen "photo studio": renders product images from the 3D jar
    spiceGeometries.ts          procedural chilli, turmeric, coriander, pepper, cumin, mustard,
                                cardamom, cinnamon, cloves, fennel, fenugreek, dry ginger
```

- **One jar identity everywhere:** the scroll film, product viewers and catalogue images all use the same geometry, label and materials. Seeds and whole spices get a seed-textured fill instead of powder.
- **Product images are rendered, not downloaded.** The studio renders each product at three angles (front, three-quarter, back label) with its own spices, on demand, and caches them. If you get real product photography later, replace `ProductShot` with `<img>` tags.
- **No external 3D assets:** everything is procedural.

## Deploying

This is a single-page app with client-side routing, so the host must serve `index.html` for every route. Both config files are already included:

- Netlify: `public/_redirects`
- Vercel: `vercel.json`

## Performance & accessibility

- three.js, the 3D film, the product viewer and the photo studio are lazy-loaded. Rendering pauses whenever nothing 3D is on screen.
- Quality tiers (desktop / mobile / low-power) set particle counts and DPR, and Drei's `PerformanceMonitor` lowers DPR adaptively.
- `prefers-reduced-motion` turns off smooth scrolling, the custom cursor, auto-playing hero transitions and long animations.
- Without WebGL, every product falls back to an SVG jar illustration.
- Keyboard: skip link, visible focus, arrow-key tabs, Escape closes the menu and the cart. Forms have labelled fields and inline errors.
