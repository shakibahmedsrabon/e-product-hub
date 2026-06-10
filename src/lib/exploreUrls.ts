/**
 * URL helpers for the explore-based routing scheme.
 * All product/category navigation flows through /explore/...
 */

export const categorySlug = (cat: string) =>
  cat.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const exploreCategoryUrl = (cat: string) =>
  `/explore/${encodeURIComponent(categorySlug(cat))}`;

export const exploreProductUrl = (cat: string, productId: number | string) =>
  `${exploreCategoryUrl(cat)}/${productId}`;
