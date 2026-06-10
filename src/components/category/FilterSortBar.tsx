import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
export interface ActiveFilters {
  categories: string[];
  priceRange: string | null;
  inStockOnly: boolean;
  sortBy: string;
}

interface FilterSortBarProps {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  itemCount: number;
  filters: ActiveFilters;
  setFilters: (filters: ActiveFilters) => void;
}

const priceRanges = [
  { id: "under-500", label: "Under ৳500" },
  { id: "500-1000", label: "৳500 – ৳1,000" },
  { id: "1000-2000", label: "৳1,000 – ৳2,000" },
  { id: "over-5000", label: "Over ৳5,000" },
];

const FilterSortBar = ({
  filtersOpen,
  setFiltersOpen,
  itemCount,
  filters,
  setFilters,
}: FilterSortBarProps) => {
  const { categories: dbCategories } = useCategories();
  const { products: allProducts } = useProducts();
  const navigate = useNavigate();

  // Use DB categories if available, otherwise derive from products
  const categoryNames =
    dbCategories.length > 0
      ? dbCategories.map((c) => c.name)
      : [...new Set(allProducts.map((p) => p.category))].filter(Boolean);

  // Local draft state so user can pick multiple options before applying
  const [draftCategories, setDraftCategories] = useState<string[]>(filters.categories);
  const [draftPrice, setDraftPrice] = useState<string | null>(filters.priceRange);
  const [draftInStock, setDraftInStock] = useState<boolean>(filters.inStockOnly);

  const activeFilterCount =
    filters.categories.length + (filters.priceRange ? 1 : 0) + (filters.inStockOnly ? 1 : 0);

  const toggleDraftCategory = (name: string) => {
    setDraftCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const toggleDraftPrice = (id: string) => {
    setDraftPrice((prev) => (prev === id ? null : id));
  };

  const applyFilters = () => {
    setFilters({ ...filters, categories: draftCategories, priceRange: draftPrice, inStockOnly: draftInStock });
    setFiltersOpen(false);
  };

  const clearAll = () => {
    setDraftCategories([]);
    setDraftPrice(null);
    setDraftInStock(false);
    setFilters({ ...filters, categories: [], priceRange: null, inStockOnly: false });
    setFiltersOpen(false);
  };

  const handleSortChange = (value: string) => {
    setFilters({ ...filters, sortBy: value });
  };

  // Sync draft state when sheet opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftCategories(filters.categories);
      setDraftPrice(filters.priceRange);
      setDraftInStock(filters.inStockOnly);
    }
    setFiltersOpen(open);
  };

  return (
    <section className="w-full px-6 mb-8 border-b border-border pb-4">
      <div className="flex justify-between items-center">
        <p className="text-sm font-light text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>

        <div className="flex items-center gap-4">
          <Sheet open={filtersOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="font-light hover:bg-transparent gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 bg-background border-l border-border flex flex-col"
            >
              <SheetHeader className="mb-6 border-b border-border pb-4">
                <SheetTitle className="text-lg font-light">Filters</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto space-y-8 pr-1">
                {/* Category Filter */}
                {categoryNames.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-4 text-foreground tracking-wide uppercase">
                      Category
                    </h3>
                    <div className="space-y-3">
                      {/* Static "All" option — clears category filters and routes to /explore */}
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="cat-all"
                          checked={draftCategories.length === 0}
                          onCheckedChange={() => {
                            setDraftCategories([]);
                            setDraftPrice(null);
                            setFilters({ ...filters, categories: [], priceRange: null, inStockOnly: false });
                            setFiltersOpen(false);
                            navigate("/explore");
                          }}
                          className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                        />
                        <Label
                          htmlFor="cat-all"
                          className="text-sm font-light text-foreground cursor-pointer"
                        >
                          All
                        </Label>
                      </div>
                      {categoryNames.map((name) => (
                        <div key={name} className="flex items-center space-x-3">
                          <Checkbox
                            id={`cat-${name}`}
                            checked={draftCategories.includes(name)}
                            onCheckedChange={() => toggleDraftCategory(name)}
                            className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                          />
                          <Label
                            htmlFor={`cat-${name}`}
                            className="text-sm font-light text-foreground cursor-pointer"
                          >
                            {name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="border-border" />

                {/* Price Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-4 text-foreground tracking-wide uppercase">
                    Price Range
                  </h3>
                  <div className="space-y-3">
                    {priceRanges.map((range) => (
                      <div key={range.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`price-${range.id}`}
                          checked={draftPrice === range.id}
                          onCheckedChange={() => toggleDraftPrice(range.id)}
                          className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                        />
                        <Label
                          htmlFor={`price-${range.id}`}
                          className="text-sm font-light text-foreground cursor-pointer"
                        >
                          {range.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="border-border" />

                {/* Availability Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-4 text-foreground tracking-wide uppercase">
                    Availability
                  </h3>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="in-stock-only"
                      checked={draftInStock}
                      onCheckedChange={(v) => setDraftInStock(Boolean(v))}
                      className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                    />
                    <Label
                      htmlFor="in-stock-only"
                      className="text-sm font-light text-foreground cursor-pointer"
                    >
                      In stock only
                    </Label>
                  </div>
                </div>
              </div>

              {/* Action buttons pinned to bottom */}
              <div className="border-t border-border pt-4 mt-4 space-y-2">
                <Button
                  onClick={applyFilters}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 font-normal"
                >
                  Show Results ({itemCount})
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearAll}
                  className="w-full hover:bg-transparent hover:underline font-light text-muted-foreground"
                >
                  Clear All
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-auto border-none bg-transparent text-sm font-light shadow-none rounded-none pr-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="shadow-none border-none rounded-none bg-background">
              <SelectItem value="featured" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">
                Featured
              </SelectItem>
              <SelectItem value="price-low" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">
                Price: Low to High
              </SelectItem>
              <SelectItem value="price-high" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">
                Price: High to Low
              </SelectItem>
              <SelectItem value="newest" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">
                Newest
              </SelectItem>
              <SelectItem value="name" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">
                Name A-Z
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
};

export default FilterSortBar;
