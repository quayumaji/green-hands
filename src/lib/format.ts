const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function money(cents: number): string {
  return usd.format(cents / 100);
}

export function whatsappUrl(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const international = digits.length === 10 ? `1${digits}` : digits;
  return `https://wa.me/${international}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telHref(phoneE164: string): string {
  return `tel:${phoneE164}`;
}

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** "2026-11-14" -> "Fri, Nov 14" without time-zone drift. */
export function dateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function dietaryLabelText(label: string): string {
  return label.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
