import { apiFetch } from "@/services/api-client";

/**
 * Shared payment/ticket types — the integration seam with the backend (CONTRACT.md).
 * The server owns prices; the client never sends a trusted amount. These shapes must
 * stay in sync with the contract.
 */
export type TicketProduct = {
  id: string;
  label: string;
  amountMinor: number;
  currency: string;
};

export type Ticket = {
  id: string;
  placeId: string;
  placeName: string;
  productId: string;
  productLabel: string;
  amountMinor: number;
  currency: string;
  status: "valid";
  qrToken: string;
  purchasedAt: string; // ISO 8601
  paymentIntentId: string;
};

export type PaymentIntentResult = {
  clientSecret: string;
  amountMinor: number;
  currency: string;
  productLabel: string;
};

/** Purchasable products for the given Google place types. Empty when none match. */
export async function getCatalog(types: string[]): Promise<TicketProduct[]> {
  const res = await apiFetch(`/catalog?types=${types.join(",")}`);
  if (!res.ok) throw new Error(`Could not load passes (${res.status}).`);
  const data = await res.json();
  const products: TicketProduct[] = data.products ?? [];
  // Collapse products by id so e.g. "Day Pass" doesn't show twice if a place has multiple types.
  return [...new Map(products.map((p) => [p.id, p])).values()];
}

/** Asks the server to create a Stripe PaymentIntent for the chosen product. */
export async function createPaymentIntent(
  placeId: string,
  placeName: string,
  productId: string,
): Promise<PaymentIntentResult> {
  const res = await apiFetch("/payments/intent", {
    method: "POST",
    body: JSON.stringify({ placeId, placeName, productId }),
  });
  if (!res.ok) throw new Error(`Could not start payment (${res.status}).`);
  return res.json();
}

/**
 * Mints the ticket after the Payment Sheet reports success. Idempotent on the
 * PaymentIntent server-side, so a retry returns the same ticket rather than a duplicate.
 */
export async function confirmTicket(paymentIntentId: string): Promise<Ticket> {
  const res = await apiFetch("/tickets/confirm", {
    method: "POST",
    body: JSON.stringify({ paymentIntentId }),
  });
  if (!res.ok) throw new Error(`Could not confirm your ticket (${res.status}).`);
  const data = await res.json();
  return data.ticket;
}
