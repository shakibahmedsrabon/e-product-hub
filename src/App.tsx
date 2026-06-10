import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ScrollToTop from "./components/ScrollToTop";
import SkipToContent from "./components/SkipToContent";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./hooks/useTheme";
import Index from "./pages/Index";

// Lazy-load non-critical routes — keeps the initial bundle small for fast first paint.
const Explore = lazy(() => import("./pages/Explore"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Faq = lazy(() => import("./pages/about/Faq"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundExchangePolicy = lazy(() => import("./pages/RefundExchangePolicy"));
const Trademark = lazy(() => import("./pages/Trademark"));
const Policy = lazy(() => import("./pages/Policy"));
const About = lazy(() => import("./pages/About"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5min — avoid refetch storms
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SkipToContent />
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/explore/:category" element={<Explore />} />
              <Route path="/explore/:category/:productId" element={<Explore />} />
              
              <Route path="/about/faq" element={<Faq />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/refund-exchange-policy" element={<RefundExchangePolicy />} />
              <Route path="/trademark" element={<Trademark />} />
              <Route path="/policy/:slug" element={<Policy />} />
              <Route path="/about/:slug" element={<About />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
