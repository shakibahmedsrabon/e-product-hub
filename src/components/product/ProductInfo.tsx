/**
 * ProductInfo — displays product details with type + duration variant pricing.
 *
 * Pricing logic:
 * - Each product has `variants: PriceVariant[]` where each variant is
 *   { type: string, amount: number, duration: number (months) }
 * - Available types come from the variants list
 * - For the currently-selected type, only its durations are shown
 * - Default = first variant (index 0)
 * - Displayed price = selected variant's amount
 */

import { useMemo, useState } from "react";
import AppLink from "@/lib/navigation/AppLink";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Product, formatPrice, formatTypeLabel } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  /** Selected type (defaults to the first variant's type) */
  const [selectedType, setSelectedType] = useState<string>(
    product.variants[0]?.type ?? "standard"
  );
  /** Selected duration (defaults to the first variant's duration) */
  const [selectedDuration, setSelectedDuration] = useState<number>(
    product.variants[0]?.duration ?? 1
  );

  const { addToCart, getItemQuantity } = useCart();
  const { toast } = useToast();

  /** All durations available for the currently selected type */
  const durationsForType = useMemo(
    () =>
      product.variants
        .filter((v) => v.type === selectedType)
        .map((v) => v.duration)
        .sort((a, b) => a - b),
    [product.variants, selectedType]
  );

  /** Active variant lookup; falls back to first matching type or first variant */
  const activeVariant =
    product.variants.find(
      (v) => v.type === selectedType && v.duration === selectedDuration
    ) ||
    product.variants.find((v) => v.type === selectedType) ||
    product.variants[0];

  const currentPrice = activeVariant?.amount ?? 0;
  const displayPrice = formatPrice(currentPrice);

  /** When user picks a new type, snap duration to the first available for that type */
  const handleSelectType = (type: string) => {
    vibrate(30);
    setSelectedType(type);
    const firstDur = product.variants.find((v) => v.type === type)?.duration;
    if (firstDur != null) setSelectedDuration(firstDur);
  };

  const cartProduct = {
    id: product.id,
    name: product.title,
    price: displayPrice,
    unitPrice: currentPrice,
    variantType: activeVariant?.type ?? selectedType,
    duration: activeVariant?.duration ?? selectedDuration,
    image: product.image,
    category: product.category,
  };

  const vibrate = (pattern: number | number[]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const incrementQuantity = () => { vibrate(50); setQuantity((prev) => prev + 1); };
  const decrementQuantity = () => { vibrate(50); setQuantity((prev) => Math.max(1, prev - 1)); };

  const handleAddToCart = () => {
    vibrate([40, 20, 40]);
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct);
    }
    const durLabel = cartProduct.duration === 0 || cartProduct.variantType.toLowerCase() === "lifetime"
      ? "Lifetime"
      : `${cartProduct.duration} mo`;
    toast({
      title: "Added to bag",
      description: `${product.title} (${formatTypeLabel(cartProduct.variantType)} · ${durLabel} × ${quantity}) added.`,
    });
    setQuantity(1);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb — desktop only */}
      <div className="hidden lg:block">
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
                <AppLink href={`/explore/${product.category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}>{product.category}</AppLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Product title + price */}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-light text-muted-foreground mb-1">{product.category}</p>
            <h1 className="text-2xl md:text-3xl font-light text-foreground">{product.title}</h1>
          </div>
          <p className="text-xl font-light text-foreground">{displayPrice}</p>
        </div>
      </div>


      {/* Type selector — only render when at least one type variant exists. */}
      {product.availableTypes.length > 0 && product.variants.length > 0 && (
        <div className="py-4 border-b border-border">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm font-light text-foreground">Plan type</span>
            {product.availableTypes.length > 1 && (
              <span className="text-[11px] font-light text-muted-foreground tracking-wide uppercase">
                {product.availableTypes.length} options
              </span>
            )}
          </div>
          <div
            role="radiogroup"
            aria-label="Plan type"
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            {product.availableTypes.map((type) => {
              const typeVariants = product.variants.filter((v) => v.type === type);
              if (typeVariants.length === 0) return null;
              const fromAmount = Math.min(...typeVariants.map((v) => v.amount));
              const isActive = type === selectedType;
              return (
                <button
                  key={type}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => handleSelectType(type)}
                  className={cn(
                    "group relative flex flex-col items-start text-left px-3.5 py-3 border transition-all min-h-[64px]",
                    isActive
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border text-foreground hover:border-foreground/60 hover:bg-muted/30"
                  )}
                >
                  <span className="text-sm font-medium leading-tight truncate w-full">
                    {formatTypeLabel(type)}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-light mt-1",
                      isActive ? "text-background/75" : "text-muted-foreground"
                    )}
                  >
                    From {formatPrice(fromAmount)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Duration selector — only render when the selected type has durations. */}
      {durationsForType.length > 0 && (
        <div className="py-4 border-b border-border">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm font-light text-foreground">Duration</span>
            {durationsForType.length > 1 && (
              <span className="text-[11px] font-light text-muted-foreground tracking-wide uppercase">
                {durationsForType.length} options
              </span>
            )}
          </div>
          <div
            role="radiogroup"
            aria-label="Duration"
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            {durationsForType.map((dur, idx) => {
              const variant = product.variants.find(
                (v) => v.type === selectedType && v.duration === dur
              );
              if (!variant) return null;
              const amount = variant.amount;
              const isActive = dur === selectedDuration;
              const isBestValue =
                durationsForType.length > 1 && idx === durationsForType.length - 1;
              return (
                <button
                  key={dur}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => { vibrate(30); setSelectedDuration(dur); }}
                  className={cn(
                    "group relative flex flex-col items-start text-left px-3.5 py-3 border transition-all min-h-[64px]",
                    isActive
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border text-foreground hover:border-foreground/60 hover:bg-muted/30"
                  )}
                >
                  {isBestValue && (
                    <span
                      className={cn(
                        "absolute -top-2 right-2 text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.5 border",
                        isActive
                          ? "bg-background text-foreground border-background"
                          : "bg-foreground text-background border-foreground"
                      )}
                    >
                      Best
                    </span>
                  )}
                  <span className="text-sm font-medium leading-tight">
                    {dur === 0 || selectedType.toLowerCase() === "lifetime"
                      ? "Lifetime"
                      : `${dur} ${dur === 1 ? "month" : "months"}`}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-light mt-1",
                      isActive ? "text-background/75" : "text-muted-foreground"
                    )}
                  >
                    {formatPrice(amount)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Out of stock notice */}
      {!product.stock && (
        <div className="py-2">
          <p className="text-sm font-medium text-destructive">Out of Stock</p>
        </div>
      )}

      {/* Quantity selector + Add to cart */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-light text-foreground">Quantity</span>
          <div className="flex items-center border border-border">
            <Button
              variant="ghost" size="sm" onClick={decrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">
              {quantity}
            </span>
            <Button
              variant="ghost" size="sm" onClick={incrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <button
            onClick={handleAddToCart}
            className="p-2 text-foreground hover:text-muted-foreground transition-colors relative"
            aria-label="Add to bag"
            disabled={!product.stock}
          >
            <div className="relative w-5 h-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <Plus className="absolute -bottom-0.5 -right-1 w-2.5 h-2.5 text-foreground" strokeWidth={3} />
            </div>
            {getItemQuantity(product.id) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-foreground text-background text-[0.6rem] font-medium rounded-full flex items-center justify-center">
                {getItemQuantity(product.id) > 9 ? '9+' : getItemQuantity(product.id)}
              </span>
            )}
          </button>
        </div>

        {/* Buy Now — sends selected type+duration via WhatsApp */}
        <Button
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none tracking-wide"
          disabled={!product.stock}
          onClick={() => {
            const url = buildWhatsAppUrl([{
              name: product.title,
              price: displayPrice,
              quantity,
              slug: product.slug,
              variantType: cartProduct.variantType,
              duration: cartProduct.duration,
              unitPrice: currentPrice,
            }]);
            window.open(url, "_blank");
          }}
        >
          {product.stock ? "Buy Now" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
