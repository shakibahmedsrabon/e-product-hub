import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: number;
  name: string;
  images: string | null;
}

let cached: Category[] | null = null;
let fetchPromise: Promise<Category[]> | null = null;

const fetchCategories = (): Promise<Category[]> => {
  if (cached) return Promise.resolve(cached);
  if (fetchPromise) return fetchPromise;

  fetchPromise = (supabase as any)
    .from("Category")
    .select("*")
    .order("id", { ascending: true })
    .then(({ data, error }: any) => {
      if (error || !data) {
        cached = [];
        return [];
      }
      cached = data
        .filter((row: any) => row.name)
        .map((row: any) => ({
          id: row.id,
          name: row.name,
          images: row.images ?? null,
        }));
      return cached!;
    });

  return fetchPromise;
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(cached || []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    fetchCategories().then((result) => {
      setCategories(result);
      setLoading(false);
    });
  }, []);

  return { categories, loading };
};
