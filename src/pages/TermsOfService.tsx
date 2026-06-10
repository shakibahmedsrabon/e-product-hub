import { useEffect, useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { supabase } from "@/integrations/supabase/client";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const TermsOfService = () => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Terms of Service - E Product Hub BD";

    const fetchData = async () => {
      const { data, error } = await (supabase as any)
        .from('Terms of Service')
        .select('content')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching ToS:', error);
      } else {
        setContent(data?.content || "");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-6">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-light text-foreground mb-4">Terms of Service</h1>
          </header>
          {loading ? (
            <p className="text-muted-foreground text-center">Loading...</p>
          ) : !content ? (
            <p className="text-muted-foreground text-center">No content available.</p>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
