import { useEffect, useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { supabase } from "@/integrations/supabase/client";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const PrivacyPolicy = () => {
  const [privacyContent, setPrivacyContent] = useState<string>("");
  const [policyContent, setPolicyContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Privacy Policy - E Product Hub BD";

    const fetchData = async () => {
      const { data, error } = await (supabase as any)
        .from('Privacy and Policy')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching privacy data:', error);
      } else {
        setPrivacyContent(data?.privacy || "");
        setPolicyContent(data?.policy || "");
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
            <h1 className="text-4xl font-light text-foreground mb-4">Privacy Policy</h1>
          </header>
          {loading ? (
            <p className="text-muted-foreground text-center">Loading...</p>
          ) : !privacyContent && !policyContent ? (
            <p className="text-muted-foreground text-center">No content available.</p>
          ) : (
            <div className="space-y-12">
              {privacyContent && (
                <section>
                  <h2 className="text-2xl font-light text-foreground mb-4">Privacy</h2>
                  <MarkdownRenderer content={privacyContent} />
                </section>
              )}
              {policyContent && (
                <section>
                  <h2 className="text-2xl font-light text-foreground mb-4">Policy</h2>
                  <MarkdownRenderer content={policyContent} />
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
