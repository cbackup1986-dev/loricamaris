"use client"

import Script from 'next/script'
import { siteConfig } from '@/config/site'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const GA_MEASUREMENT_ID = siteConfig.analytics.googleId

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname + searchParams.toString(),
      })
    }
  }, [pathname, searchParams])

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {/* Example for Baidu Tongji or other trackers */}
      <Script
        id="baidu-tongji"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            // var _hmt = _hmt || [];
            // (function() {
            //   var hm = document.createElement("script");
            //   hm.src = "https://hm.baidu.com/hm.js?YOUR_BAIDU_ID";
            //   var s = document.getElementsByTagName("script")[0]; 
            //   s.parentNode.insertBefore(hm, s);
            // })();
          `,
        }}
      />
    </>
  )
}

declare global {
  interface Window {
    gtag: (command: string, id: string, config?: any) => void
  }
}
