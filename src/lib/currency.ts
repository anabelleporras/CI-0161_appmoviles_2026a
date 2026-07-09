/**
 * Formats an integer minor-unit amount as a localized currency string.
 *
 * Money is kept as an integer in the currency's smallest unit end-to-end (see
 * CONTRACT.md) — e.g. USD cents, `1000` → "$10.00". We only scale down to the major
 * unit at the very last step, for display. Currency-agnostic: the server decides the
 * currency and `Intl.NumberFormat` derives the right number of decimals from it, so a
 * future currency swap needs no change here.
 */
export const formatMoney = (amountMinor: number, currency: string): string => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  });

  // How many decimals this currency uses (USD → 2, JPY → 0). Falls back to 2 if the
  // runtime can't resolve it, which matches the USD default the contract guarantees.
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;

  return formatter.format(amountMinor / 10 ** fractionDigits);
};
