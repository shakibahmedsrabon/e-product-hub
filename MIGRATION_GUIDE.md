# Next.js Migration Guide

This project is structured for easy migration to Next.js App Router.

## Architecture Overview

```
src/
├── config/          → app/ metadata exports
│   ├── routes.ts    → Per-page generateMetadata()
│   └── site.ts     → Global site constants
├── data/            → Server-side data fetching / CMS
│   ├── products.ts  → getStaticProps / server components
│   └── navigation.ts
├── layouts/         → app/layout.tsx
│   └── MainLayout.tsx
├── lib/navigation/  → Replace with next/link & next/navigation
│   ├── AppLink.tsx  → next/link (swap import)
│   ├── hooks.ts     → next/navigation hooks
│   └── index.ts
├── components/      → Keep as-is (already framework-agnostic)
└── pages/           → app/(routes)/page.tsx
```

## Migration Steps

### 1. Initialize Next.js
```bash
npx create-next-app@latest --typescript --tailwind --app
```

### 2. Copy shared code (no changes needed)
- `src/components/` → `components/`
- `src/data/` → `lib/data/`
- `src/config/` → `lib/config/`
- `src/index.css` → `app/globals.css`
- `tailwind.config.ts` → `tailwind.config.ts`

### 3. Replace navigation layer
```tsx
// src/lib/navigation/AppLink.tsx
import Link from "next/link";
export default Link;

// src/lib/navigation/hooks.ts
export { useParams, useSearchParams, usePathname, useRouter } from "next/navigation";
```

### 4. Convert pages to App Router
Each page in `src/pages/` becomes `app/[route]/page.tsx`:

```
src/pages/Index.tsx        → app/page.tsx
src/pages/Category.tsx     → app/category/[category]/page.tsx
src/pages/ProductDetail.tsx → app/product/[productId]/page.tsx
src/pages/Checkout.tsx     → app/checkout/page.tsx
src/pages/about/*.tsx      → app/about/[slug]/page.tsx
```

### 5. Convert SEOHead to generateMetadata
```tsx
// Replace SEOHead component with:
import { getRouteMeta } from "@/lib/config/routes";

export async function generateMetadata({ params }) {
  const meta = getRouteMeta("product", { productName: params.productId });
  return { title: meta.title, description: meta.description };
}
```

### 6. Convert MainLayout to app/layout.tsx
```tsx
// app/layout.tsx
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SkipToContent from "@/components/SkipToContent";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SkipToContent />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### 7. Move product data to server
```tsx
// Convert src/data/products.ts to server-side:
// Option A: Keep as static data (automatic SSG)
// Option B: Fetch from CMS/API in server components
// Option C: Connect to Supabase for dynamic data
```

## Key Benefits After Migration
- ✅ Full SSR/SSG with automatic static optimization
- ✅ SEO metadata via generateMetadata (no client-side <head> manipulation)
- ✅ Image optimization with next/image
- ✅ Automatic code splitting per route
- ✅ ISR (Incremental Static Regeneration) for product pages
