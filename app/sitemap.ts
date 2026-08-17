import type { MetadataRoute } from "next";
import { products } from "./lib/products";

const SITE_URL = "https://shopdeeglobalgh.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/shop`, lastModified: new Date() },

    // Local SEO pages
    { url: `${SITE_URL}/kasoa`, lastModified: new Date() },
    { url: `${SITE_URL}/textbooks-in-kasoa`, lastModified: new Date() },
    { url: `${SITE_URL}/stationery-in-kasoa`, lastModified: new Date() },
    { url: `${SITE_URL}/exam-materials-in-kasoa`, lastModified: new Date() },
    { url: `${SITE_URL}/school-list-items-kasoa`, lastModified: new Date() },

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

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...productPages];
}
