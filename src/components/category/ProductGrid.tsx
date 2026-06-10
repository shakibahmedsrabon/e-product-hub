import { Card, CardContent } from "@/components/ui/card";
import AppLink from "@/lib/navigation/AppLink";
import Pagination from "./Pagination";
import { formatPrice, type Product } from "@/hooks/useProducts";
import { exploreProductUrl } from "@/lib/exploreUrls";
import { PackageSearch } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

const ProductGrid = ({ products, loading }: ProductGridProps) => {
  if (loading) {
    return (
      <section className="w-full px-6 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted/20 mb-3" />
              <div className="h-4 bg-muted/20 w-1/2 mb-2" />
              <div className="h-4 bg-muted/20 w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="w-full px-6 mb-16">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageSearch className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-light text-foreground mb-2">
            No products found
          </h3>
          <p className="text-sm font-light text-muted-foreground max-w-sm">
            Try adjusting your filters or browse all products to find what you're looking for.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-6 mb-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <AppLink key={product.id} href={exploreProductUrl(product.category, product.id)}>
            <Card className="border-none shadow-none bg-transparent group cursor-pointer">
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
                      alt={product.title}
                      className="w-full h-full object-cover"
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
        ))}
      </div>
      {products.length > 24 && <Pagination />}
    </section>
  );
};

export default ProductGrid;
