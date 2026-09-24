import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.APP_URL || "https://cleristr.com";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/checkout", "/sepet", "/favoriler", "/hesabim", "/newsletter", "/odeme"] }],
    sitemap: `${origin}/sitemap.xml`,
  };
}
