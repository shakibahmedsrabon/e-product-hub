/**
 * Site-wide constants — brand info, contact, etc.
 * In Next.js, reference these in metadata exports and layout.
 */

export const siteConfig = {
  name: "E Product Hub BD",
  tagline: "Minimalist jewelry crafted for the modern individual",
  url: typeof window !== "undefined" ? window.location.origin : "https://lineajewelry.com",
  logo: "/LINEA-1.svg",
  logoFull: "/Linea_Jewelry_Inc-2.svg",
  contact: {
    phone: "+1 (212) 555-0123",
    email: "hello@lineajewelry.com",
    address: {
      street: "123 Madison Avenue",
      city: "New York",
      state: "NY",
      zip: "10016",
      country: "US",
    },
  },
  social: {
    instagram: "https://instagram.com",
    pinterest: "https://pinterest.com",
  },
};
