import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://calcettoxp.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${APP_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${APP_URL}/privacy`,
      lastModified: new Date('2026-09-09'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${APP_URL}/termini`,
      lastModified: new Date('2026-09-09'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${APP_URL}/cookie-policy`,
      lastModified: new Date('2026-09-09'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${APP_URL}/disclaimer`,
      lastModified: new Date('2026-09-09'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let publicProfiles: MetadataRoute.Sitemap = [];
  try {
    const profiles = await prisma.playerProfile.findMany({
      where: { isPublic: true },
      select: { username: true, updatedAt: true },
      take: 10_000,
    });
    publicProfiles = profiles
      .filter((p) => p.username && p.username.length >= 3)
      .map((p) => ({
        url: `${APP_URL}/p/${encodeURIComponent(p.username)}`,
        lastModified: p.updatedAt || now,
        changeFrequency: 'daily',
        priority: 0.6,
      }));
  } catch {
    publicProfiles = [];
  }

  return [...staticRoutes, ...publicProfiles];
}
