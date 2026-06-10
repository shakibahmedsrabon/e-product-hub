import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteConfigData {
  title: string;
  name: string;
  slong: string;
  description: string;
  logo: string;
  logoFull: string;
  showReview: boolean;
  ogImage: string;
}

let cached: SiteConfigData | null = null;
let fetchPromise: Promise<SiteConfigData | null> | null = null;

const fetchConfig = (): Promise<SiteConfigData | null> => {
  if (cached) return Promise.resolve(cached);
  if (fetchPromise) return fetchPromise;

  fetchPromise = (supabase as any)
    .from("Site config")
    .select('title, name, slong, description, logo, show_review, "og-image"')
    .limit(1)
    .single()
    .then(({ data, error }: any) => {
      if (error || !data) {
        cached = null;
        return null;
      }
      cached = {
        title: data.title || "",
        name: data.name || "",
        slong: data.slong || "",
        description: data.description || "",
        logo: data.logo || "",
        logoFull: data.logo || "",
        showReview: data.show_review !== false,
        ogImage: data["og-image"] || "",
      };
      return cached;
    });

  return fetchPromise;
};

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfigData | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    fetchConfig().then((result) => {
      setConfig(result);
      setLoading(false);
    });
  }, []);

  return { config, loading };
};
