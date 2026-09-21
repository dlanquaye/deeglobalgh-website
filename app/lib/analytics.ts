type GtagWindow = Window & {
  gtag?: (
    command: string,
    eventName: string,
    params?: Record<string, string | number>
  ) => void;
};

export function trackWhatsAppClick(
  linkLocation: string,
  destination: string,
  productName?: string
) {
  if (typeof window === "undefined") return;

  const gtag = (window as GtagWindow).gtag;
  if (!gtag) return;

  gtag("event", "whatsapp_click", {
    link_location: linkLocation,
    page_path: window.location.pathname,
    destination,
    ...(productName ? { product_name: productName } : {}),
  });
}
