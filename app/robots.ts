import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/settings/',
          '/dashboard/',
          '/business-actor/',
          '/super-admin/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}