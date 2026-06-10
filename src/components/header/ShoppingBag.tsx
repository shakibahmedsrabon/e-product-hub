/**
 * ShoppingBag — off-canvas cart panel with professional receipt-style summary.
 *
 * Each line item shows: product name, duration (months), unit price, qty, and line total.
 * The footer shows subtotal with a clear breakdown.
 * WhatsApp checkout message includes duration and pricing details.
 */

import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLink from "@/lib/navigation/AppLink";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/hooks/useProducts";

interface CartItem {
  id: number;
  name: string;
  price: string;
  unitPrice: number;
  variantType: string;
  duration: number;
  image: string;
  quantity: number;
  category: string;
}

interface ShoppingBagProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (id: number, variantType: string, duration: number, newQuantity: number) => void;
  clearCart: () => void;
}

const capType = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const ShoppingBag = ({ isOpen, onClose, cartItems, updateQuantity, clearCart }: ShoppingBagProps) => {
  if (!isOpen) return null;

  /** Subtotal = sum of (unitPrice × quantity) for every line item */
  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 h-screen">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 h-screen"
        onClick={onClose}
      />
      
      {/* Off-canvas panel */}
      <div className="absolute right-0 top-0 h-screen w-96 bg-background border-l border-border animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-light text-foreground">Shopping Bag</h2>
            {totalItems > 0 && (
              <span className="text-xs text-muted-foreground">({totalItems})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-foreground hover:text-muted-foreground transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col p-6">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center">
                Your shopping bag is empty.<br />
                Continue shopping to add items to your bag.
              </p>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto space-y-6 mb-6">
                {cartItems.map((item) => {
                  const lineTotal = item.unitPrice * item.quantity;
                  const lineKey = `${item.id}-${item.variantType}-${item.duration}`;
                  return (
                    <div key={lineKey} className="flex gap-4">
                      <div className="w-20 h-20 bg-muted/10 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="min-w-0">
                            <p className="text-xs font-light text-muted-foreground">{item.category}</p>
                            <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                          </div>
                          <p className="text-sm font-medium text-foreground ml-2 flex-shrink-0">
                            {formatPrice(lineTotal)}
                          </p>
                        </div>
                        {/* Type + Duration + unit price */}
                        <p className="text-xs text-muted-foreground">
                          {capType(item.variantType)} · {item.duration === 0 || item.variantType.toLowerCase() === "lifetime" ? "Lifetime" : `${item.duration} ${item.duration === 1 ? "month" : "months"}`} · {formatPrice(item.unitPrice)}
                        </p>
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-border">
                            <button 
                              onClick={() => updateQuantity(item.id, item.variantType, item.duration, item.quantity - 1)}
                              className="p-1.5 hover:bg-muted/50 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2.5 py-1 text-xs font-light min-w-[28px] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.variantType, item.duration, item.quantity + 1)}
                              className="p-1.5 hover:bg-muted/50 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Receipt summary */}
              <div className="border-t border-border pt-4 space-y-3">
                {/* Line item breakdown */}
                <div className="space-y-1.5">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.variantType}-${item.duration}-summary`} className="flex justify-between text-xs text-muted-foreground">
                      <span className="truncate mr-2">
                        {item.name} × {item.quantity} ({capType(item.variantType)}, {item.duration === 0 || item.variantType.toLowerCase() === "lifetime" ? "Lifetime" : `${item.duration}mo`})
                      </span>
                      <span className="flex-shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light text-foreground">Subtotal</span>
                    <span className="text-sm font-medium text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout
                </p>
                
                <Button 
                  className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 tracking-wide" 
                  size="lg"
                  onClick={() => {
                    const url = buildWhatsAppUrl(
                      cartItems.map(item => ({
                        name: item.name,
                        price: formatPrice(item.unitPrice),
                        quantity: item.quantity,
                        variantType: item.variantType,
                        duration: item.duration,
                        unitPrice: item.unitPrice,
                      }))
                    );
                    window.open(url, "_blank");
                    onClose();
                  }}
                >
                  Proceed to Checkout
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full rounded-none" 
                  size="lg"
                  onClick={onClose}
                  asChild
                >
                  <AppLink href="/explore">
                    Continue Shopping
                  </AppLink>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingBag;
