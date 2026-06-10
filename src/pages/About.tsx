import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { supabase } from "@/integrations/supabase/client";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import SEOHead from "@/components/SEOHead";

export const aboutSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const About = () => {
  const { slug } = useParams<{ slug: string }>();
  const [name, setName] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchAbout = async () => {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await (supabase as any)
        .from("All-About")
        .select("AboutName, AboutMD");

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const match = data.find(
        (a: { AboutName: string | null }) =>
          a.AboutName && aboutSlug(a.AboutName) === slug,
      );

      if (!match) {
        setNotFound(true);
      } else {
        setName(match.AboutName || "");
        setContent(match.AboutMD || "");
      }
      setLoading(false);
    };

    fetchAbout();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={name ? `${name} - E Product Hub BD` : "About"} />
      <Header />
      <main className="pt-6">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-light text-foreground mb-4">
              {loading ? "Loading…" : notFound ? "Page Not Found" : name}
            </h1>
          </header>
          {loading ? (
            <p className="text-muted-foreground text-center">Loading...</p>
          ) : notFound ? (
            <p className="text-muted-foreground text-center">
              The requested page could not be found.
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

export default About;
