"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

const META_PIXEL_ID = "1427377745567821";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const firstPageViewHandled = useRef(false);

  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminPage) {
      return;
    }

    if (!firstPageViewHandled.current) {
      firstPageViewHandled.current = true;
      return;
    }

    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, search, isAdminPage]);

  return null;
}

export default function MetaPixel() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.fbq) {
            window.fbq("track", "PageView");
          }
        }}
      >
        {`
          !function(f,b,e,v,n,t,s)
          {
            if(f.fbq)return;
            n=f.fbq=function(){
              n.callMethod ?
                n.callMethod.apply(n,arguments) :
                n.queue.push(arguments)
            };
            if(!f._fbq)f._fbq=n;
            n.push=n;
            n.loaded=!0;
            n.version='2.0';
            n.queue=[];
            t=b.createElement(e);
            t.async=!0;
            t.src=v;
            s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)
          }(
            window,
            document,
            'script',
            'https://connect.facebook.net/en_US/fbevents.js'
          );

          fbq('init', '${META_PIXEL_ID}');
        `}
      </Script>

      <Suspense fallback={null}>
        <MetaPixelPageView />
      </Suspense>
    </>
  );
}