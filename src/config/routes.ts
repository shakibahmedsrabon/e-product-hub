/**
 * Route & SEO configuration — single source of truth.
 * When migrating to Next.js, use this to generate metadata exports per page.
 */

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  jsonLdType?: string;
}

export const routes: Record<string, RouteMeta> = {
  home: {
    path: "/",
    title: "Linea - Minimalist Jewelry Crafted for the Modern Individual",
    description:
      "Discover minimalist jewelry crafted with timeless elegance. Shop rings, earrings, bracelets, and necklaces from Linea.",
    jsonLdType: "JewelryStore",
  },
  category: {
    path: "/category/:category",
    title: "{category} - E Product Hub BD",
    description: "Shop our {category} collection. Minimalist jewelry crafted with timeless elegance.",
  },
  product: {
    path: "/product/:productId",
    title: "{productName} - E Product Hub BD",
    description: "Discover the {productName} from Linea. Minimalist jewelry crafted with timeless elegance.",
    jsonLdType: "Product",
  },
  privacyPolicy: {
    path: "/privacy-policy",
    title: "Privacy Policy - E Product Hub BD",
    description: "Read E Product Hub BD's privacy policy.",
  },
  termsOfService: {
    path: "/terms-of-service",
    title: "Terms of Service - E Product Hub BD",
    description: "Read E Product Hub BD's terms of service.",
  },
  refundExchangePolicy: {
    path: "/refund-exchange-policy",
    title: "Refund & Exchange Policy - E Product Hub BD",
    description: "Read E Product Hub BD's refund and exchange policy.",
  },
};

/** Helper to interpolate route meta with dynamic params */
export function getRouteMeta(
  key: string,
  params: Record<string, string> = {}
): RouteMeta {
  const route = routes[key];
  if (!route) return routes.home;

  let title = route.title;
  let description = route.description;

  Object.entries(params).forEach(([k, v]) => {
    const capitalized = v.charAt(0).toUpperCase() + v.slice(1);
    title = title.replace(`{${k}}`, capitalized);
    description = description.replace(`{${k}}`, capitalized.toLowerCase());
  });

  return { ...route, title, description };
}
