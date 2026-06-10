import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { supabase } from "@/integrations/supabase/client";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import SEOHead from "@/components/SEOHead";

export const policySlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const Policy = () => {
  const { slug } = useParams<{ slug: string }>();
  const [name, setName] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await (supabase as any)
        .from("All-Policy")
        .select("PolicyName, PolicyMD");

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const match = data.find(
        (p: { PolicyName: string | null }) =>
          p.PolicyName && policySlug(p.PolicyName) === slug,
      );

      if (!match) {
        setNotFound(true);
      } else {
        setName(match.PolicyName || "");
        setContent(match.PolicyMD || "");
      }
      setLoading(false);
    };

    fetchPolicy();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={name ? `${name} - E Product Hub BD` : "Policy"} />
      <Header />
      <main className="pt-6">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-light text-foreground mb-4">
              {loading ? "Loading…" : notFound ? "Policy Not Found" : name}
            </h1>
          </header>
          {loading ? (
            <p className="text-muted-foreground text-center">Loading...</p>
          ) : notFound ? (
            <p className="text-muted-foreground text-center">
              The requested policy could not be found.
            </p>
          ) : content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-muted-foreground text-center">No content available.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Policy;
