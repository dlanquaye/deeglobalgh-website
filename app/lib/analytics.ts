type AnalyticsValue =
  | string
  | number
  | boolean
  | undefined
  | AnalyticsItem[];

type AnalyticsItem = {
  item_id: string;
  item_name: string;
  price?: number;
  item_brand?: string;
  item_list_id?: string;
  item_list_name?: string;
};

type GtagWindow = Window & {
  gtag?: (
    command: string,
    eventName: string,
    params?: Record<string, AnalyticsValue>
  ) => void;
};

function getGtag() {
  if (typeof window === "undefined") return null;

  return (window as GtagWindow).gtag ?? null;
}

export function trackWhatsAppClick(
  linkLocation: string,
  destination: string,
  productName?: string
) {
  const gtag = getGtag();
  if (!gtag) return;

  gtag("event", "whatsapp_click", {
    link_location: linkLocation,
    page_path: window.location.pathname,
    destination,
    ...(productName ? { product_name: productName } : {}),
  });
}

export function trackDirectionsClick(
  linkLocation: string,
  destination: string
) {
  const gtag = getGtag();
  if (!gtag) return;

  gtag("event", "directions_click", {
    link_location: linkLocation,
    page_path: window.location.pathname,
    destination,
  });
}

export function trackNavigationClick(
  linkLocation: string,
  destination: string,
  contentType?: string,
  contentName?: string
) {
  const gtag = getGtag();
  if (!gtag) return;

  gtag("event", "navigation_click", {
    link_location: linkLocation,
    page_path: window.location.pathname,
    destination,
    ...(contentType ? { content_type: contentType } : {}),
    ...(contentName ? { content_name: contentName } : {}),
  });
}

export function trackSelectItem({
  itemId,
  itemName,
  price,
  itemBrand,
  itemListId,
  itemListName,
}: {
  itemId: string;
  itemName: string;
  price: number;
  itemBrand?: string;
  itemListId: string;
  itemListName: string;
}) {
  const gtag = getGtag();
  if (!gtag) return;

  gtag("event", "select_item", {
    item_list_id: itemListId,
    item_list_name: itemListName,
    items: [
      {
        item_id: itemId,
        item_name: itemName,
        price,
        ...(itemBrand ? { item_brand: itemBrand } : {}),
        item_list_id: itemListId,
        item_list_name: itemListName,
      },
    ],
  });
}
