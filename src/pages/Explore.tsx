import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import SEOHead from "../components/SEOHead";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import SliderPagination from "../components/category/SliderPagination";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductCarousel from "../components/content/ProductCarousel";
import AppLink from "@/lib/navigation/AppLink";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useProducts, useProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSearchIndex, getSuggestions } from "@/hooks/useSearchIndex";
import { Search } from "lucide-react";
import type { ActiveFilters } from "@/components/category/FilterSortBar";

const ITEMS_PER_PAGE_MOBILE = 8;
const ITEMS_PER_PAGE_DESKTOP = 12;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ---------- Inline product detail view ---------- */
const InlineProductDetail = ({ productId }: { productId: string }) => {
  
  const { product, loading } = useProduct(productId);

  if (loading) {
    return (
      <div className="w-full px-6 py-12 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full px-6 py-12 text-center text-muted-foreground">
        Product not found.
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${product.title} - E Product Hub BD`}
        description={`Discover the ${product.title} from Linea.`}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          category: product.category,
          offers: {
            "@type": "Offer",
            priceCurrency: "BDT",
            price: String(product.basePrice),
            availability: product.stock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }}
      />

      <section className="w-full px-6 mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <AppLink href="/">Home</AppLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <AppLink href="/explore">Explore</AppLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <AppLink href={`/explore/${slugify(product.category)}`}>
                  {product.category}
                </AppLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

      </section>

      <section className="w-full px-6" aria-label="Product details">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <ProductImageGallery product={product} />
          <div className="lg:pl-12 mt-8 lg:mt-0 lg:sticky lg:top-6 lg:h-fit">
            <ProductInfo product={product} />
            <ProductDescription product={product} />
          </div>
        </div>
      </section>

      <section className="w-full mt-16 lg:mt-24" aria-label="Recommended products">
        <ProductCarousel
          excludeProductId={product.id}
          relatedCategory={product.category}
          limit={6}
        />
      </section>
    </>
  );
};

/* ---------- Main Explore page ---------- */
const Explore = () => {
  const { category: routeCategory, productId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ActiveFilters>({
    categories: [],
    priceRange: null,
    inStockOnly: false,
    sortBy: "featured",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE_DESKTOP);

  // Responsive page size
  useEffect(() => {
    const updateSize = () => {
      setPageSize(window.innerWidth < 768 ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const { products, loading } = useProducts();
  const { categories: dbCategories } = useCategories();
  const { data: searchIndex } = useSearchIndex();
  const suggestions = useMemo(
    () => getSuggestions(searchIndex, searchQuery, 6),
    [searchIndex, searchQuery],
  );

  const categoryNames = useMemo(() => {
    if (dbCategories.length > 0) return dbCategories.map((c) => c.name);
    return [...new Set(products.map((p) => p.category))].filter(Boolean);
  }, [dbCategories, products]);

  // Sync route category to filters (normalize via slugify so URLs like
  // /explore/ai-&-tools, /explore/AI%20Tools, /explore/ai-tools all map to the
  // same DB category).
  useEffect(() => {
    if (routeCategory) {
      const routeSlug = slugify(decodeURIComponent(routeCategory));
      const matched = categoryNames.find((c) => slugify(c) === routeSlug);
      setFilters((f) => ({
        ...f,
        categories: matched ? [matched] : routeSlug ? [routeSlug] : [],
      }));
    } else {
      setFilters((f) => ({ ...f, categories: [] }));
    }
  }, [routeCategory, categoryNames]);

  // Reset to page 1 on filter / search change (must be before any early return)
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, pageSize]);

  // If product detail route, render inline detail view
  if (productId) {
    return (
      <MainLayout>
        <InlineProductDetail productId={productId} />
      </MainLayout>
    );
  }

  // Filter + sort products
  const filteredProducts = (() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (filters.categories.length > 0) {
      const wantedSlugs = filters.categories.map(slugify);
      result = result.filter((p) => wantedSlugs.includes(slugify(p.category)));
    }

    if (filters.inStockOnly) {
      result = result.filter((p) => p.stock);
    }

    if (filters.priceRange) {
      result = result.filter((p) => {
        const price = p.basePrice;
        switch (filters.priceRange) {
          case "under-500": return price > 0 && price < 500;
          case "500-1000": return price >= 500 && price <= 1000;
          case "1000-2000": return price >= 1000 && price <= 2000;
          case "over-5000": return price > 5000;
          default: return true;
        }
      });
    }

    switch (filters.sortBy) {
      case "price-low": result.sort((a, b) => a.basePrice - b.basePrice); break;
      case "price-high": result.sort((a, b) => b.basePrice - a.basePrice); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "name": result.sort((a, b) => a.title.localeCompare(b.title)); break;
    }

    // Always surface in-stock products first, regardless of chosen sort
    result.sort((a, b) => Number(b.stock) - Number(a.stock));

    return result;
  })();

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    setSearchParams(params, { replace: true });
  };

  const headingCategory = filters.categories[0];
  const headingLabel = headingCategory
    ? headingCategory.charAt(0).toUpperCase() + headingCategory.slice(1)
    : "Explore";

  return (
    <MainLayout>
      <SEOHead
        title={`${headingLabel} - E Product Hub BD`}
        description="Browse all digital subscriptions, streaming services, and AI tools."
      />

      <CategoryHeader category={headingLabel} />

      {/* Search bar */}
      <div className="w-full px-6 mb-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center border-b border-border pb-3">
            <Search className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none text-base font-light"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="text-muted-foreground hover:text-foreground text-sm font-light ml-2"
              >
                Clear
              </button>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5" aria-label="Search suggestions">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSearchChange(s)}
                  className="text-xs font-light py-1 px-2.5 rounded-full bg-muted/40 text-muted-foreground hover:bg-foreground hover:text-background border border-transparent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category pills — navigate to /explore or /explore/:category */}
      {categoryNames.length > 0 && (
        <div className="w-full px-6 mb-4">
          <div className="flex flex-wrap gap-2">
            <AppLink
              href="/explore"
              className={`text-sm font-light py-1.5 px-4 rounded-full border transition-all duration-200 ${
                !routeCategory
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-foreground border-border hover:border-foreground"
              }`}
            >
              All
            </AppLink>
            {categoryNames.map((cat) => {
              const active = routeCategory && slugify(decodeURIComponent(routeCategory)) === slugify(cat);
              return (
                <AppLink
                  key={cat}
                  href={`/explore/${slugify(cat)}`}
                  className={`text-sm font-light py-1.5 px-4 rounded-full border transition-all duration-200 ${
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-foreground border-border hover:border-foreground"
                  }`}
                >
                  {cat}
                </AppLink>
              );
            })}
          </div>
        </div>
      )}

      <FilterSortBar
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        itemCount={filteredProducts.length}
        filters={filters}
        setFilters={setFilters}
      />

      <ProductGrid products={visibleProducts} loading={loading} />

      {!loading && filteredProducts.length > 0 && (
        <SliderPagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </MainLayout>
  );
};

export default Explore;
