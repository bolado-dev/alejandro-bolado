import type { MetadataRoute } from "next"

const SITE = "https://alejandrobolado.es"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
