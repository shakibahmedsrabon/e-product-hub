import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
  keywords?: string;
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","for","of","to","in","on","at","by","with",
  "from","is","it","as","be","are","was","were","this","that","you","your",
  "our","we","they","them","his","her","its","all","any","can","will","has",
  "have","had","not","no","yes","if","so","do","does","get","got","use",
  "using","used","via","i","me","my","mine","their","there","here","what",
  "which","who","whom","when","where","why","how","than","then","also","too",
]);

const extractKeywords = (text: string, max = 20): string => {
  if (!text) return "";
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  const freq = new Map<string, number>();
  words.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w)
    .join(", ");
};

const SEOHead = ({
  title = "E Product Hub BD — Trusted Digital Subscriptions in Bangladesh",
  description = "E Product Hub BD — Bangladesh's trusted source for digital subscriptions, streaming & AI tools.",
  canonical,
  type = "website",
  image,
  noindex = false,
  jsonLd,
  keywords,
}: SEOHeadProps) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const url = canonical || window.location.origin + window.location.pathname;
    const kw = keywords || extractKeywords(`${title} ${description}`);

    setMeta("description", description);
    if (kw) setMeta("keywords", kw);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:url", url, true);
    setMeta("og:site_name", "E Product Hub BD", true);
    if (image) {
      setMeta("og:image", image, true);
      setMeta("og:image:alt", title, true);
    }
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (image) setMeta("twitter:image", image);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;

    // Lang attribute (helpful when content is bilingual)
    if (document.documentElement.lang !== "en") {
      document.documentElement.lang = "en";
    }

    // JSON-LD
    const existingScript = document.querySelector('script[data-seo-jsonld]');
    if (existingScript) existingScript.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.querySelector('script[data-seo-jsonld]');
      if (script) script.remove();
    };
  }, [title, description, canonical, type, image, noindex, jsonLd, keywords]);

  return null;
};

export default SEOHead;
