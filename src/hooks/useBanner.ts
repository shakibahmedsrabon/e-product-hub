import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Banner {
  id: number;
  title: string | null;
  description: string | null;
  image: string | null;
  created_at: string;
}

let cached: Banner | null | undefined = undefined;
let fetchPromise: Promise<Banner | null> | null = null;

const fetchBanner = (): Promise<Banner | null> => {
  if (cached !== undefined) return Promise.resolve(cached);
  if (fetchPromise) return fetchPromise;

  fetchPromise = (supabase as any)
    .from("Banner")
    .select("id, title, description, image, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(({ data }: any) => {
      cached = (data as Banner) ?? null;
      return cached;
    });

  return fetchPromise;
};

export const useBanner = () => {
  const [banner, setBanner] = useState<Banner | null>(cached ?? null);
  const [loading, setLoading] = useState(cached === undefined);

  useEffect(() => {
    fetchBanner().then((result) => {
      setBanner(result);
      setLoading(false);
    });
  }, []);

  return { banner, loading };
};
