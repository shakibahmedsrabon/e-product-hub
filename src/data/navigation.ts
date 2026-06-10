/**
 * Navigation data — separated for easy migration.
 * All product/category links route through /explore/...
 */

export interface NavImage {
  src: string;
  alt: string;
  label: string;
}

export interface NavItem {
  name: string;
  href: string;
  submenuItems: string[];
  images: NavImage[];
}

export const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
    submenuItems: [],
    images: [],
  },
  {
    name: "Shop",
    href: "/explore",
    submenuItems: [],
    images: [],
  },
  {
    name: "Explore",
    href: "/explore",
    submenuItems: [],
    images: [],
  },
  {
    name: "About",
    href: "/about/faq",
    submenuItems: ["FAQ"],
    images: [],
  },
];

export const popularSearches: string[] = [];
