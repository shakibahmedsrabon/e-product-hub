import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import AppLink from "@/lib/navigation/AppLink";
import { useProducts, formatPrice, type Product } from "@/hooks/useProducts";
import { ArrowRight } from "lucide-react";

interface ProductCarouselProps {
  /** Hide a specific product (e.g. the one currently being viewed) */
  excludeProductId?: string | number;
  /** Prioritise items from this category, then fill with others */
  relatedCategory?: string;
  /** Max number of items shown (default 12, related-mode default 6) */
  limit?: number;
  /** Override the section heading */
  title?: string;
  /** Override the small uppercase label */
  eyebrow?: string;
}

const ProductCarousel = ({
  excludeProductId,
  relatedCategory,
  limit,
  title,
  eyebrow,
}: ProductCarouselProps = {}) => {
  const { products, loading } = useProducts();

  if (loading || products.length === 0) return null;

  const isRelatedMode = Boolean(relatedCategory);
  const max = limit ?? (isRelatedMode ? 6 : 12);

  const pool = excludeProductId
    ? products.filter((p) => String(p.id) !== String(excludeProductId))
    : products;

  let displayProducts: Product[];
  if (isRelatedMode) {
    const sameCat = pool.filter(
      (p) => p.category?.toLowerCase() === relatedCategory!.toLowerCase()
    );
    const others = pool.filter(
      (p) => p.category?.toLowerCase() !== relatedCategory!.toLowerCase()
    );
    displayProducts = [...sameCat, ...others].slice(0, max);
  } else {
    // Default: oldest first (Archive view)
    displayProducts = [...pool]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .slice(0, max);
  }

  if (displayProducts.length === 0) return null;

  const headingEyebrow = eyebrow ?? (isRelatedMode ? "You might also like" : "Archive");
  const headingTitle = title ?? (isRelatedMode ? "Related Picks" : "Explore the Collection");

  return (
    <section className="w-full mb-20 md:mb-24 px-6" aria-label="Explore products">
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
            {headingEyebrow}
          </p>
          <h2 className="text-xl md:text-2xl font-medium text-foreground">
            {headingTitle}
          </h2>
        </div>
        <AppLink
          href="/explore"
          className="group hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-foreground border-b border-foreground/20 hover:border-foreground transition-colors pb-0.5"
        >
          See all products
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </AppLink>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent>
          {displayProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 md:basis-1/3 lg:basis-1/4 pr-2 md:pr-4"
            >
              <AppLink href={`/explore/${product.category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}/${product.id}`}>
                <Card className="border-none shadow-none bg-transparent group">
                  <CardContent className="p-0">
                    <div className="aspect-square mb-3 overflow-hidden bg-muted/10 relative">
                      {product.isNew && (
                        <span className="absolute top-2 left-2 z-10 bg-foreground text-background text-[10px] font-medium tracking-wider uppercase px-2 py-0.5">
                          New
                        </span>
                      )}
                      {product.image && (
                        <img
                          src={product.image}
                          alt={`${product.title} ${product.category}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy" decoding="async" fetchPriority="low"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/[0.03]"></div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-light text-foreground">
                        {product.category}
                      </p>
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-foreground">
                          {product.title}
                        </h3>
                        <p className="text-sm font-light text-foreground">
                          {formatPrice(product.basePrice)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AppLink>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Mobile see-all */}
      <div className="mt-8 flex md:hidden justify-center">
        <AppLink
          href="/explore"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground border-b border-foreground/20 hover:border-foreground transition-colors pb-0.5"
        >
          See all products
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </AppLink>
      </div>
    </section>
  );
};

export default ProductCarousel;
