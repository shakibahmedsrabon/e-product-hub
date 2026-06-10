import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchIndexData {
  prefixes: Record<string, string[]>;
  words: Record<string, number[]>;
  productCount: number;
  wordCount: number;
}

/**
 * Loads the prebuilt prefix→keyword search index (regenerated every 15 days
 * by the `generate-search-index` edge function). Cached for 1 hour.
 */
export function useSearchIndex() {
  return useQuery({
    queryKey: ["search-index"],
    queryFn: async (): Promise<SearchIndexData | null> => {
      const { data, error } = await (supabase as any)
        .from("search")
        .select("search")
        .eq("id", 1)
        .maybeSingle();
      if (error || !data?.search) return null;
      return data.search as SearchIndexData;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
}

/** Returns up to `limit` keyword suggestions for the given query prefix. */
export function getSuggestions(
  index: SearchIndexData | null | undefined,
  query: string,
  limit = 6,
): string[] {
  if (!index || !query) return [];
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  // Exact prefix lookup (2-4 chars)
  const key = q.slice(0, Math.min(4, q.length));
  const candidates = index.prefixes[key] ?? [];
  // Filter to those actually starting with the full typed query
  const filtered = candidates.filter((w) => w.startsWith(q) && w !== q);
  return filtered.slice(0, limit);
}
