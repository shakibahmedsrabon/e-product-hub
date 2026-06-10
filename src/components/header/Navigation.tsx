import { ArrowRight, Search as SearchIcon } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppLink from "@/lib/navigation/AppLink";
import { navItems, popularSearches } from "@/data/navigation";
import ShoppingBag from "./ShoppingBag";
import ThemeSwitcher from "./ThemeSwitcher";
import { useCart } from "@/contexts/CartContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useCategories } from "@/hooks/useCategories";
import { useProducts, formatPrice, type Product } from "@/hooks/useProducts";
import { useSearchIndex, getSuggestions } from "@/hooks/useSearchIndex";
import { useTheme } from "@/hooks/useTheme";

const Navigation = () => {
  const { config: siteConfig } = useSiteConfig();
  const { resolvedScheme } = useTheme();
  const { categories: dbCategories } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShoppingBagOpen, setIsShoppingBagOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // Transparent overlay only on the homepage hero
  const isHome = location.pathname === "/";
  const isTransparent = isHome && !isScrolled && !isSearchOpen && !isMobileMenuOpen && !activeDropdown;

  // Track scroll to switch nav from transparent to solid near end of hero
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => {
      // Trigger threshold: ~70% of viewport height (near end of hero)
      const threshold = window.innerHeight * 0.7;
      setIsScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const { cartItems, updateQuantity, clearCart, totalItems } = useCart();
  const { products } = useProducts();
  const { data: searchIndex } = useSearchIndex();

  // Debounce input (90ms — instant feel, no render thrash)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebouncedQuery(searchValue.trim().toLowerCase());
    }, 90);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchValue]);

  // O(1) keyword suggestions from prebuilt index
  const suggestions = useMemo(
    () => getSuggestions(searchIndex, debouncedQuery, 6),
    [searchIndex, debouncedQuery],
  );

  // Ranked product matches: title-prefix > title-includes > category > description
  const productMatches = useMemo<Product[]>(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];
    const q = debouncedQuery;
    const scored: { p: Product; score: number }[] = [];
    for (const p of products) {
      const title = (p.title || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      let score = 0;
      if (title.startsWith(q)) score = 100;
      else if (title.includes(q)) score = 70;
      else if (cat.includes(q)) score = 40;
      else if (desc.includes(q)) score = 20;
      if (score > 0) scored.push({ p, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6).map((s) => s.p);
  }, [products, debouncedQuery]);

  // Combined keyboard-navigable list: suggestions first, then products
  type NavItem =
    | { kind: "suggestion"; value: string }
    | { kind: "product"; value: Product };
  const navItemsList = useMemo<NavItem[]>(() => {
    if (debouncedQuery.length < 2) return [];
    return [
      ...suggestions.map((s) => ({ kind: "suggestion" as const, value: s })),
      ...productMatches.map((p) => ({ kind: "product" as const, value: p })),
    ];
  }, [suggestions, productMatches, debouncedQuery]);

  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Reset highlight when results or overlay state change
  useEffect(() => {
    setHighlightIndex(-1);
  }, [debouncedQuery, isSearchOpen]);

  const goToProduct = (p: Product) => {
    const catSlug = (p.category || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    navigate(`/explore/${catSlug}/${p.slug}-${p.id}`);
    setIsSearchOpen(false);
    setSearchValue("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchValue("");
      return;
    }
    if (navItemsList.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % navItemsList.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i <= 0 ? navItemsList.length - 1 : i - 1));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      const item = navItemsList[highlightIndex];
      if (item.kind === "suggestion") {
        setSearchValue(item.value);
        setHighlightIndex(-1);
      } else {
        goToProduct(item.value);
      }
    }
  };

  // Merge DB categories into navItems for "Shop" (names + latest 2 images)
  const dynamicNavItems = useMemo(() => {
    if (dbCategories.length === 0) return navItems;
    return navItems.map((item) => {
      if (item.name === "Shop") {
        const withImages = dbCategories.filter(
          (c) => c.images && c.images.trim().length > 4
        );
        const latestTwo = withImages.slice(-2).map((c) => ({
          src: c.images as string,
          alt: c.name,
          label: c.name,
        }));
        return {
          ...item,
          submenuItems: dbCategories.map((c) => c.name),
          images: latestTwo.length > 0 ? latestTwo : item.images,
        };
      }
      return item;
    });
  }, [dbCategories]);


  return (
    <nav
      className="relative transition-colors duration-300"
      style={{
        backgroundColor: isTransparent ? 'transparent' : 'hsl(var(--nav-glass))',
        backdropFilter: isTransparent ? 'none' : 'blur(10px)',
        WebkitBackdropFilter: isTransparent ? 'none' : 'blur(10px)',
        color: isTransparent ? '#fff' : undefined,
      }}
    >
      <div className="grid grid-cols-3 items-center h-16 px-6">
        {/* Left: hamburger + search */}
        <div className="flex items-center justify-start gap-1 sm:gap-3">
          <button
            className="flex items-center gap-1.5 p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            style={isTransparent ? { color: '#fff' } : undefined}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d={isMobileMenuOpen ? "M6 6L18 18" : "M4 9L20 9"} />
              <path d={isMobileMenuOpen ? "M6 18L18 6" : "M4 15L14 15"} />
            </svg>
            <span className="hidden sm:inline text-sm font-light">Menu</span>
          </button>
          <button
            className="flex items-center gap-1.5 p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            style={isTransparent ? { color: '#fff' } : undefined}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span className="hidden sm:inline text-sm font-light">Search</span>
          </button>
        </div>

        {/* Center: logo */}
        <div className="flex justify-center">
          <AppLink href="/" className="block">
            {siteConfig?.logo && (
              <img
                src={siteConfig.logo}
                alt={siteConfig?.name || ""}
                className="h-6 w-auto"
                width="120"
                height="24"
                style={{ filter: isTransparent ? "none" : (resolvedScheme === "light" ? "invert(1)" : "none") }}
              />
            )}
          </AppLink>
        </div>

        {/* Right: bag + theme */}
        <div className="flex items-center justify-end space-x-1">
          <button
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative"
            aria-label="Shopping bag"
            onClick={() => setIsShoppingBagOpen(true)}
            style={isTransparent ? { color: '#fff' } : undefined}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-foreground text-background text-[0.6rem] font-medium rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
          <div style={isTransparent ? { color: '#fff' } : undefined}>
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Full width dropdown */}
      {activeDropdown && (
        <div 
          className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50"
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="px-6 py-8">
            <div className="flex justify-between w-full">
              <div className="flex-1">
                <ul className="space-y-2">
                   {dynamicNavItems
                     .find(item => item.name === activeDropdown)
                     ?.submenuItems.map((subItem, index) => (
                      <li key={index}>
                        <AppLink 
                          href={activeDropdown === "About" ? `/about/${subItem.toLowerCase().replace(/\s+/g, '-')}` : `/explore/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light block py-2"
                        >
                          {subItem}
                        </AppLink>
                      </li>
                   ))}
                </ul>
              </div>
              <div className="flex space-x-6">
                {dynamicNavItems
                  .find(item => item.name === activeDropdown)
                  ?.images.map((image, index) => {
                    let linkTo = "/";
                    const slug = image.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    if (activeDropdown === "Shop") {
                      linkTo = `/explore/${slug}`;
                    } else if (activeDropdown === "About") {
                      linkTo = "/about/faq";
                    }
                    
                    return (
                      <AppLink key={index} href={linkTo} className="w-[400px] h-[280px] cursor-pointer group relative overflow-hidden block">
                        <img 
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                        />
                        {(activeDropdown === "Shop" || activeDropdown === "About") && (
                          <div className="absolute bottom-2 left-2 text-white text-xs font-light flex items-center gap-1">
                            <span>{image.label}</span>
                            <ArrowRight size={12} />
                          </div>
                        )}
                      </AppLink>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50">
          <div className="px-6 py-8">
            <div className="max-w-2xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate(`/explore${searchValue.trim() ? `?q=${encodeURIComponent(searchValue.trim())}` : ""}`);
                  setIsSearchOpen(false);
                  setSearchValue("");
                }}
                className="relative mb-8"
              >
                <div className="flex items-center border-b border-border pb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-nav-foreground mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <label htmlFor="search-input" className="sr-only">Search products</label>
                  <input
                    id="search-input"
                    type="search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-nav-foreground placeholder:text-nav-foreground/60 outline-none text-lg"
                    autoFocus
                    role="combobox"
                    aria-expanded={navItemsList.length > 0}
                    aria-controls="search-results"
                    aria-autocomplete="list"
                    aria-activedescendant={
                      highlightIndex >= 0 ? `search-opt-${highlightIndex}` : undefined
                    }
                  />
                </div>
              </form>
              {/* Live results when typing */}
              {debouncedQuery.length >= 2 ? (
                <div className="space-y-6" id="search-results" role="listbox">
                  {suggestions.length > 0 && (
                    <div>
                      <h3 className="text-nav-foreground/60 text-xs uppercase tracking-wider font-light mb-3">Suggestions</h3>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => {
                          const idx = i;
                          const isActive = highlightIndex === idx;
                          return (
                            <button
                              key={s}
                              id={`search-opt-${idx}`}
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              onMouseEnter={() => setHighlightIndex(idx)}
                              onClick={() => {
                                setSearchValue(s);
                                setHighlightIndex(-1);
                              }}
                              className={`text-sm font-light py-1.5 px-3 border rounded-full transition-colors duration-200 ${
                                isActive
                                  ? "bg-nav-hover/10 border-nav-hover text-nav-hover"
                                  : "text-nav-foreground border-border hover:text-nav-hover hover:border-nav-hover"
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-nav-foreground/60 text-xs uppercase tracking-wider font-light mb-3">
                      Products {productMatches.length > 0 && `(${productMatches.length})`}
                    </h3>
                    {productMatches.length > 0 ? (
                      <ul className="divide-y divide-border">
                        {productMatches.map((p, i) => {
                          const idx = suggestions.length + i;
                          const isActive = highlightIndex === idx;
                          return (
                            <li key={p.id}>
                              <button
                                id={`search-opt-${idx}`}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                onMouseEnter={() => setHighlightIndex(idx)}
                                onClick={() => goToProduct(p)}
                                className={`w-full flex items-center gap-4 py-3 text-left transition-colors duration-150 -mx-2 px-2 rounded ${
                                  isActive ? "bg-nav-hover/10" : "hover:bg-nav-hover/5"
                                }`}
                              >
                                {p.image && (
                                  <img
                                    src={p.image}
                                    alt={p.title}
                                    loading="lazy"
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-nav-foreground text-sm font-light truncate">{p.title}</div>
                                  <div className="text-nav-foreground/60 text-xs truncate">{p.category}</div>
                                </div>
                                <div className="text-nav-foreground text-sm font-light shrink-0">
                                  {formatPrice(p.basePrice)}
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-nav-foreground/60 text-sm font-light">No products match "{debouncedQuery}".</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      navigate(`/explore?q=${encodeURIComponent(debouncedQuery)}`);
                      setIsSearchOpen(false);
                      setSearchValue("");
                    }}
                    className="text-nav-foreground hover:text-nav-hover text-sm font-light underline underline-offset-4 transition-colors duration-200"
                  >
                    See all results for "{debouncedQuery}" →
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-nav-foreground text-sm font-light mb-4">Browse Categories</h3>
                  <div className="flex flex-wrap gap-3">
                    {(dbCategories.length > 0 ? dbCategories.map(c => c.name) : popularSearches).map((item, index) => (
                      <button
                        key={index}
                        className="text-nav-foreground hover:text-nav-hover text-sm font-light py-2 px-4 border border-border rounded-full transition-colors duration-200 hover:border-nav-hover"
                        onClick={() => {
                          navigate(`/explore?cat=${encodeURIComponent(item)}`);
                          setIsSearchOpen(false);
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      navigate("/explore");
                      setIsSearchOpen(false);
                    }}
                    className="mt-6 text-nav-foreground hover:text-nav-hover text-sm font-light underline underline-offset-4 transition-colors duration-200"
                  >
                    View all products →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50">
          <div className="px-6 py-8">
            <div className="space-y-6">
              {dynamicNavItems.map((item) => (
                <div key={item.name}>
                  <AppLink
                    href={item.href}
                    className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-lg font-light block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </AppLink>
                   <div className="mt-3 pl-4 space-y-2">
                     {item.submenuItems.map((subItem, subIndex) => (
                       <AppLink
                         key={subIndex}
                         href={item.name === "About" ? `/about/${subItem.toLowerCase().replace(/\s+/g, '-')}` : `/explore/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                         className="text-nav-foreground/70 hover:text-nav-hover text-sm font-light block py-1"
                         onClick={() => setIsMobileMenuOpen(false)}
                       >
                         {subItem}
                       </AppLink>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Shopping Bag Component */}
      <ShoppingBag 
        isOpen={isShoppingBagOpen}
        onClose={() => setIsShoppingBagOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
      />
    </nav>
  );
};

export default Navigation;
