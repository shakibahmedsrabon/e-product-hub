import MainLayout from "../layouts/MainLayout";
import HeroSlider from "../components/content/HeroSlider";
import ProductCarousel from "../components/content/ProductCarousel";
import TopProductsCarousel from "../components/content/TopProductsCarousel";
import FaqSection from "../components/content/FaqSection";
import PromoBanner from "../components/content/PromoBanner";
import SEOHead from "../components/SEOHead";
import { routes } from "@/config/routes";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { siteConfig as defaults } from "@/config/site";

const Index = () => {
  const { config: siteConfig } = useSiteConfig();

  const jsonLd = siteConfig ? {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: siteConfig.name,
    description: siteConfig.slong,
    url: defaults.url,
    address: {
      "@type": "PostalAddress",
      streetAddress: defaults.contact.address.street,
      addressLocality: defaults.contact.address.city,
      addressRegion: defaults.contact.address.state,
      postalCode: defaults.contact.address.zip,
      addressCountry: defaults.contact.address.country,
    },
    telephone: defaults.contact.phone,
    email: defaults.contact.email,
  } : undefined;

  return (
    <MainLayout>
      {siteConfig && (
        <SEOHead
          title={siteConfig.title}
          description={siteConfig.description}
          image={siteConfig.ogImage || undefined}
          jsonLd={jsonLd}
        />
      )}
      {siteConfig && (
        <h1 className="sr-only">{siteConfig.name} - {siteConfig.slong}</h1>
      )}
      <HeroSlider />
      <TopProductsCarousel />
      <PromoBanner />
      <ProductCarousel />
      <FaqSection />
    </MainLayout>
  );
};

export default Index;
