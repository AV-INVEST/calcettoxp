import type { MetadataRoute } from 'next';
import { getAppBaseUrl } from '@/lib/app-url';

const APP_URL = getAppBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/signin',
          '/onboarding',
          '/dashboard',
          '/matches',
          '/stats',
          '/profile',
          '/achievements',
          '/settings',
          '/api/auth/*',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
