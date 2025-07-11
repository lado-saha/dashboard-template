import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  // List your public-facing pages here
  const publicRoutes = [
    '/',
    '/pricing',
    '/login',
    '/signup',
    '/forgot-password',
    '/help',
  ];

  const routes = publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: route === '/' ? 1 : 0.8,
  }));

  return routes;
}