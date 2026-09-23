import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.shopdeeglobalgh.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/shop`, lastModified: new Date() },

    // Local SEO pages
    { url: `${SITE_URL}/kasoa`, lastModified: new Date() },
    { url: `${SITE_URL}/textbooks-in-kasoa`, lastModified: new Date() },
    { url: `${SITE_URL}/stationery-in-kasoa`, lastModified: new Date() },
    { url: `${SITE_URL}/exam-materials-in-kasoa`, lastModified: new Date() },
    { url: `${SITE_URL}/school-list-items-kasoa`, lastModified: new Date() },
    {
      url: `${SITE_URL}/boarding-school-essentials-kasoa`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/shs-prospectus-shopping-kasoa`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/ges-harmonised-shs-prospectus-2026-2027`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/shs-commonly-forgotten-items-checklist`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/school-reopening-essentials-kasoa`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/boarding-school-trunks-chop-boxes-suitcases-kasoa`,
      lastModified: new Date(),
    },

    // Exercise Books & A4 commercial SEO
    {
      url: `${SITE_URL}/exercise-books-a4-paper-kasoa`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/guides/where-to-buy-exercise-books-a4-paper-kasoa`,
      lastModified: new Date(),
    },
  ];

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      websiteVisible: true,
    },
    select: {
      slug: true,
    },
    orderBy: {
      slug: "asc",
    },
  });

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...productPages];
}