/**
 * useProducts hook — fetches products from the "Products" table in the database.
 *
 * Pricing model (NEW):
 * - `price` in DB = JSON array of variants:
 *   [{ "type": "personal", "amount": 3000, "duration": 6 }, ...]
 * - Each variant has its own type + amount + duration (months)
 * - Default selected variant = index 0
 * - User picks a type, then a duration available for that type
 *
 * Legacy formats supported (back-compat):
 * - Object map { "1": 400, "3": 800 } → converted to variants with type="standard"
 * - Single number → single variant, type="standard", duration=1
 *
 * `formatPrice` formats numbers as ৳ (Taka) currency.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PriceVariant {
  type: string;
  amount: number;
  /** Duration in months */
  duration: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  category: string;
  /** Ordered list of price variants (preserves DB order; index 0 = default) */
  variants: PriceVariant[];
  /** Unique types in order of first appearance */
  availableTypes: string[];
  /** Convenience: amount of the first variant (used on cards/grids) */
  basePrice: number;
  currency: string;
  image: string;
  description?: string;
  description_bn?: string;
  stock: boolean;
  /** True if product was created within the last 7 days */
  isNew: boolean;
  createdAt: string;
}

/**
 * Parse the DB price field into a list of PriceVariant.
 * Accepts:
 *   - new array format: [{type, amount, duration}, ...]
 *   - legacy object map: { "1": 400, "3": 800 }  → type "standard"
 *   - legacy single number                       → type "standard", duration 1
 */
export function parseVariants(raw: any): PriceVariant[] {
  // New format: array of variants
  if (Array.isArray(raw)) {
    // Determine a fallback type: the first explicit type in the list, else "standard".
    // This handles partially-typed data where some variants omit `type` but logically
    // belong to the same plan as the first one (e.g. multi-duration "personal" plans).
    const firstExplicitType = raw.find(
      (v: any) => typeof v?.type === "string" && v.type.trim() !== ""
    )?.type;
    const fallbackType = (firstExplicitType && String(firstExplicitType)) || "standard";

    return raw
      .map((v: any) => {
        const rawType = typeof v?.type === "string" ? v.type.trim() : "";
        const type = rawType || fallbackType;
        const isLifetime = type.toLowerCase() === "lifetime";
        // Lifetime variants don't need a duration. Otherwise default to 1 month
        // when duration is missing/invalid.
        let duration: number;
        if (typeof v?.duration === "number") {
          duration = v.duration;
        } else if (v?.duration != null && v?.duration !== "") {
          const parsed = parseInt(String(v.duration), 10);
          duration = isNaN(parsed) ? (isLifetime ? 0 : 1) : parsed;
        } else {
          duration = isLifetime ? 0 : 1;
        }
        return {
          type,
          amount: typeof v?.amount === "number" ? v.amount : parseFloat(v?.amount ?? "0") || 0,
          duration,
        };
      })
      .filter((v) => v.amount > 0);
  }
  // Legacy object map
  if (raw && typeof raw === "object") {
    const out: PriceVariant[] = [];
    for (const [k, val] of Object.entries(raw)) {
      const duration = parseInt(k, 10);
      const amount = typeof val === "number" ? val : parseFloat(val as string);
      if (!isNaN(duration) && !isNaN(amount)) {
        out.push({ type: "standard", amount, duration });
      }
    }
    out.sort((a, b) => a.duration - b.duration);
    return out;
  }
  // Legacy single number
  if (typeof raw === "number") return [{ type: "standard", amount: raw, duration: 1 }];
  return [];
}

/** Get the unique types from a variant list, in order of first appearance. */
export function getUniqueTypes(variants: PriceVariant[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    if (!seen.has(v.type)) {
      seen.add(v.type);
      out.push(v.type);
    }
  }
  return out;
}

/** Format a numeric price as ৳X,XXX (Bangladeshi Taka) */
export function formatPrice(price: number | null): string {
  if (price == null || price === 0) return "৳0";
  return `৳${price.toLocaleString()}`;
}

/** Format a type label for UI display (capitalized) */
export function formatTypeLabel(type: string): string {
  if (!type) return "";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/** Generate a URL-friendly slug from a title string */
function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ---------- Cache layer (avoids re-fetching on every mount) ----------
let cached: Product[] | null = null;
let fetchPromise: Promise<Product[]> | null = null;

const fetchProducts = (): Promise<Product[]> => {
  if (cached) return Promise.resolve(cached);
  if (fetchPromise) return fetchPromise;

  fetchPromise = (supabase as any)
    .from("Products")
    .select("id, title, category, description, price, image, stock, created_at")
    .order("stock", { ascending: false })
    .order("id", { ascending: true })
    .range(0, 9999)
    .then(({ data, error }: any) => {
      if (error || !data) {
        cached = [];
        return [];
      }
      cached = data.map((row: any) => {
        const variants = parseVariants(row.price);
        const availableTypes = getUniqueTypes(variants);
        const createdAt = row.created_at || "";
        const isNew = createdAt
          ? (Date.now() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
          : false;
        return {
          id: row.id,
          title: row.title || "",
          slug: toSlug(row.title || `product-${row.id}`),
          category: row.category || "",
          variants,
          availableTypes,
          basePrice: variants[0]?.amount || 0,
          currency: "BDT",
          image: row.image || "",
          description: row.description || undefined,
          description_bn: undefined,
          stock: row.stock ?? true,
          isNew,
          createdAt,
        };
      });
      return cached!;
    });

  return fetchPromise;
};

// ---------- Hooks ----------

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(cached || []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    fetchProducts().then((result) => {
      setProducts(result);
      setLoading(false);
    });
  }, []);

  return { products, loading };
};

export const useProduct = (idOrSlug: string | undefined) => {
  const { products, loading } = useProducts();
  const trailingIdMatch = idOrSlug?.match(/-(\d+)$/);
  const trailingId = trailingIdMatch ? Number(trailingIdMatch[1]) : NaN;
  const product = products.find(
    (p) =>
      p.slug === idOrSlug ||
      p.id === Number(idOrSlug) ||
      p.id === trailingId
  );
  return { product, loading };
};

export const useProductsByCategory = (category: string) => {
  const { products, loading } = useProducts();
  const filtered = category && category !== "all"
    ? products.filter((p) => p.category.toLowerCase() === category.toLowerCase())
    : products;
  return { products: filtered, loading };
};
