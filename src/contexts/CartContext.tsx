/**
 * CartContext — manages shopping bag state with type+duration based pricing.
 *
 * Each CartItem tracks:
 * - `variantType`: selected variant type (e.g. "personal", "family")
 * - `duration`: selected month count
 * - `unitPrice`: numeric price for that variant
 * - `price`: formatted display price string
 *
 * Items are keyed by `id + variantType + duration` — different variants of the
 * same product are separate line items.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  /** Formatted display price for the selected variant (e.g. "৳3,000") */
  price: string;
  /** Raw numeric price for the selected variant */
  unitPrice: number;
  /** Selected variant type (e.g. "personal") */
  variantType: string;
  /** Selected rental duration in months */
  duration: number;
  image: string;
  quantity: number;
  category: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: number, variantType: string, duration: number, newQuantity: number) => void;
  removeFromCart: (id: number, variantType: string, duration: number) => void;
  clearCart: () => void;
  getItemQuantity: (id: number) => number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "linea-cart";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    // Backward compat: older items may not have `variantType`
    if (Array.isArray(parsed)) {
      return parsed.map((i: any) => ({
        variantType: i.variantType ?? "standard",
        ...i,
      })) as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

const sameLine = (a: { id: number; variantType: string; duration: number }, b: { id: number; variantType: string; duration: number }) =>
  a.id === b.id && a.variantType === b.variantType && a.duration === b.duration;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>(CART_KEY, [])
  );

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item) ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, variantType: string, duration: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev) =>
        prev.filter((item) => !sameLine(item, { id, variantType, duration }))
      );
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          sameLine(item, { id, variantType, duration })
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (id: number, variantType: string, duration: number) => {
    setCartItems((prev) =>
      prev.filter((item) => !sameLine(item, { id, variantType, duration }))
    );
  };

  /** Total quantity across all variants for a given product id */
  const getItemQuantity = (id: number) => {
    return cartItems
      .filter((i) => i.id === id)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
