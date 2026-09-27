import type { MetadataRoute } from "next"
import { getAllWriteups } from "@/lib/writeups"
import { getAllManualParams } from "@/lib/manual"

const SITE = "https://alejandrobolado.es"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [writeups, manual] = await Promise.all([
    getAllWriteups(),
    getAllManualParams(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, priority: 1 },
    { url: `${SITE}/visuals`, priority: 0.8 },
    { url: `${SITE}/visuals/fotografia`, priority: 0.7 },
    { url: `${SITE}/visuals/filmmaking`, priority: 0.7 },
    { url: `${SITE}/cybersec`, priority: 0.8 },
    { url: `${SITE}/cybersec/maquinas`, priority: 0.8 },
    { url: `${SITE}/cybersec/writeups`, priority: 0.8 },
    { url: `${SITE}/cybersec/manual`, priority: 0.6 },
  ]

  const writeupRoutes: MetadataRoute.Sitemap = writeups.map((w) => ({
    url: `${SITE}/cybersec/writeups/${w.slug}`,
    lastModified: new Date(w.published),
    priority: 0.6,
  }))

  const manualRoutes: MetadataRoute.Sitemap = manual.map((p) => ({
    url: `${SITE}/cybersec/manual/${p.slug.join("/")}`,
    priority: 0.5,
  }))

  return [...staticRoutes, ...writeupRoutes, ...manualRoutes]
}
