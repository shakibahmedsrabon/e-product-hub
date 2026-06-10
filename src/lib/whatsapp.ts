/**
 * WhatsApp checkout message builder.
 *
 * Generates a professional receipt-style message with:
 * - Product name, type, duration (months), unit price, qty, line total
 * - Grand total at the bottom
 */

const WHATSAPP_NUMBER = "8801570210107";
const SITE_URL = "https://lvx11.lovable.app";

interface WhatsAppItem {
  name: string;
  price: string;
  quantity?: number;
  slug?: string;
  /** Selected duration in months */
  duration?: number;
  /** Selected variant type (e.g. "personal") */
  variantType?: string;
  /** Numeric unit price for total calculation */
  unitPrice?: number;
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export const buildWhatsAppUrl = (items: WhatsAppItem[]) => {
  let message = "Hi! I'd like to order the following from LINEA Jewelry:\n\n";

  let grandTotal = 0;

  items.forEach((item, idx) => {
    const qty = item.quantity || 1;
    const dur = item.duration ?? 1;
    const isLifetime = dur === 0 || (item.variantType || "").toLowerCase() === "lifetime";
    const durLabel = isLifetime ? "Lifetime" : (dur === 1 ? "1 month" : `${dur} months`);
    const typeLabel = item.variantType ? cap(item.variantType) : "";
    const lineTotal = (item.unitPrice || 0) * qty;
    grandTotal += lineTotal;

    const productUrl = item.slug ? `${SITE_URL}/explore/product/${item.slug}` : "";
    message += `${idx + 1}. ${item.name}\n`;
    const meta = [typeLabel, durLabel].filter(Boolean).join(" · ");
    message += `   ${meta} · ${item.price}/ea\n`;
    if (qty > 1) message += `   Qty: ${qty}\n`;
    message += `   Subtotal: ৳${lineTotal.toLocaleString()}\n`;
    if (productUrl) message += `   ${productUrl}\n`;
    message += "\n";
  });

  if (grandTotal > 0) {
    message += `──────────────\n`;
    message += `Total: ৳${grandTotal.toLocaleString()}\n\n`;
  }

  message += `Sent from: ${SITE_URL}${typeof window !== "undefined" ? window.location.pathname : ""}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
