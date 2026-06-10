import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AppLink from "@/lib/navigation/AppLink";

interface FAQ {
  id: number;
  question: string | null;
  answer: string | null;
}

const FaqSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from("FAQ")
      .select("id, question, answer")
      .order("id", { ascending: true })
      .limit(5)
      .then(({ data, error }: any) => {
        if (!error && data) setFaqs(data);
        setLoading(false);
      });
  }, []);

  if (loading || faqs.length === 0) return null;

  return (
    <section className="w-full px-6 mb-20 md:mb-24" aria-label="Frequently asked questions">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
              Help Center
            </p>
            <h2 className="text-xl md:text-2xl font-medium text-foreground">
              Frequently Asked
            </h2>
          </div>
          <AppLink
            href="/about/faq"
            className="text-sm font-medium text-foreground border-b border-foreground/20 hover:border-foreground transition-colors pb-0.5"
          >
            View all
          </AppLink>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={`faq-${faq.id}`}
              className="border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline text-sm font-light">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm font-light text-muted-foreground whitespace-pre-line">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
