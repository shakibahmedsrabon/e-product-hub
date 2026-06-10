import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import AboutSidebar from "../../components/about/AboutSidebar";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: number;
  question: string | null;
  answer: string | null;
}

const FaqPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "FAQ";
    (supabase as any)
      .from("FAQ")
      .select("*")
      .order("id", { ascending: true })
      .then(({ data, error }: any) => {
        if (!error && data) setFaqs(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>

        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
          <PageHeader
            title="FAQ"
            subtitle="Answers to the questions we hear most often"
          />

          <ContentSection title="Frequently Asked Questions">
            {loading ? (
              <p className="text-muted-foreground">Loading FAQs...</p>
            ) : faqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={`faq-${faq.id}`}
                    className="border border-border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground whitespace-pre-line">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground">No FAQs available.</p>
            )}
          </ContentSection>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default FaqPage;
