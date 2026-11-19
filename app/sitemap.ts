import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";

const SITE_URL = "https://thomasbrandonhays.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map((study) => ({
      url: `${SITE_URL}/work/${study.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
