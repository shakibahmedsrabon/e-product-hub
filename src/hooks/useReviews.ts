import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: number;
  FullName: string | null;
  star: number | null;
  profile: string | null;
  description: string | null;
  product_id: number | null;
  created_at: string;
}

// Per-key cache (key = productId or "all"). Avoids duplicate fetches across mounts.
const reviewsCache = new Map<string, Review[]>();
const reviewsInFlight = new Map<string, Promise<Review[]>>();

const cacheKey = (productId?: number) =>
  productId !== undefined && productId !== null ? `p:${productId}` : "all";

export const useReviews = (productId?: number) => {
  const key = cacheKey(productId);
  const [reviews, setReviews] = useState<Review[]>(reviewsCache.get(key) ?? []);
  const [loading, setLoading] = useState(!reviewsCache.has(key));

  const fetchReviews = useCallback(async (force = false) => {
    if (!force) {
      if (reviewsCache.has(key)) {
        setReviews(reviewsCache.get(key)!);
        setLoading(false);
        return;
      }
      const inFlight = reviewsInFlight.get(key);
      if (inFlight) {
        const data = await inFlight;
        setReviews(data);
        setLoading(false);
        return;
      }
    }
    const promise = (async () => {
      let query = (supabase as any)
        .from("Reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (productId !== undefined && productId !== null) {
        query = query.eq("product_id", productId);
      }
      const { data, error } = await query;
      const result = !error && data ? (data as Review[]) : [];
      reviewsCache.set(key, result);
      return result;
    })();
    reviewsInFlight.set(key, promise);
    try {
      const data = await promise;
      setReviews(data);
    } finally {
      reviewsInFlight.delete(key);
      setLoading(false);
    }
  }, [key, productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.star || 0), 0) / reviews.length
      : 0;

  return { reviews, loading, average, refetch: () => fetchReviews(true) };
};
