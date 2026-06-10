// Generates a prefix-based keyword search index from all products.
// Runs every 15 days via pg_cron on the external Supabase project.

const EXTERNAL_SUPABASE_URL = "https://jqxesguuoxgithnqdtgl.supabase.co";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "for", "of", "to", "in", "on", "at",
  "by", "with", "from", "is", "it", "as", "be", "are", "was", "were", "this",
  "that", "you", "your", "our", "we", "they", "them", "his", "her", "its",
  "all", "any", "can", "will", "has", "have", "had", "not", "no", "yes",
  "if", "so", "do", "does", "get", "got", "use", "using", "used", "via",
]);

interface Product {
  id: number;
  title: string | null;
  description: string | null;
  category: string | null;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

function buildIndex(products: Product[]) {
  // word -> { count, productIds: Set<number> }
  const wordStats = new Map<
    string,
    { count: number; productIds: Set<number> }
  >();

  for (const p of products) {
    const text = [p.title ?? "", p.description ?? "", p.category ?? ""]
      .join(" ");
    const words = new Set(tokenize(text));
    for (const w of words) {
      let entry = wordStats.get(w);
      if (!entry) {
        entry = { count: 0, productIds: new Set() };
        wordStats.set(w, entry);
      }
      entry.count += 1;
      entry.productIds.add(p.id);
    }
  }

  // prefix (2-4 chars) -> ranked unique words
  const prefixMap: Record<string, string[]> = {};
  // word -> productIds (for direct lookup after a suggestion is clicked)
  const wordToProducts: Record<string, number[]> = {};

  const sortedWords = [...wordStats.entries()].sort(
    (a, b) => b[1].count - a[1].count,
  );

  for (const [word, stats] of sortedWords) {
    wordToProducts[word] = [...stats.productIds];
    const maxLen = Math.min(4, word.length);
    for (let len = 2; len <= maxLen; len++) {
      const prefix = word.slice(0, len);
      const list = prefixMap[prefix] ?? (prefixMap[prefix] = []);
      if (list.length < 8 && !list.includes(word)) list.push(word);
    }
  }

  return {
    prefixes: prefixMap,
    words: wordToProducts,
    productCount: products.length,
    wordCount: wordStats.size,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require a shared secret to prevent unauthenticated abuse / DoS.
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (cronSecret) {
      const provided =
        req.headers.get("x-cron-secret") ??
        req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      if (provided !== cronSecret) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const serviceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) {
      return new Response(
        JSON.stringify({ error: "Missing EXTERNAL_SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch all products
    const productsRes = await fetch(
      `${EXTERNAL_SUPABASE_URL}/rest/v1/Products?select=id,title,description,category`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      },
    );

    if (!productsRes.ok) {
      const txt = await productsRes.text();
      return new Response(
        JSON.stringify({ error: "Failed to fetch products", detail: txt }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const products: Product[] = await productsRes.json();
    const index = buildIndex(products);

    // Upsert single row (id=1) into public.search
    const upsertRes = await fetch(
      `${EXTERNAL_SUPABASE_URL}/rest/v1/search?on_conflict=id`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify([
          {
            id: 1,
            search: index,
          },
        ]),
      },
    );

    if (!upsertRes.ok) {
      const txt = await upsertRes.text();
      return new Response(
        JSON.stringify({ error: "Failed to upsert search", detail: txt }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        productCount: index.productCount,
        wordCount: index.wordCount,
        prefixCount: Object.keys(index.prefixes).length,
        updated_at: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
