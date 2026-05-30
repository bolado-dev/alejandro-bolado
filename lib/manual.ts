import "server-only"
import { promises as fs } from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { renderMarkdown, extractHeadings, readingTime, type Heading } from "@/lib/markdown"

const MANUAL_DIR = path.join(process.cwd(), "content", "manual")

export interface ManualPageMeta {
  slug: string[] // [sectionSlug, pageSlug]
  href: string // /cybersec/manual/<section>/<page>
  title: string
  description: string
  order: number
  sectionSlug: string
  readingMinutes: number
}

export interface ManualSection {
  slug: string
  title: string
  order: number
  pages: ManualPageMeta[]
}

export interface ManualPage extends ManualPageMeta {
  sectionTitle: string
  html: string
  headings: Heading[]
  prev: ManualPageMeta | null
  next: ManualPageMeta | null
}

function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

async function readSectionMeta(dir: string): Promise<{ title?: string; order?: number }> {
  try {
    const raw = await fs.readFile(path.join(dir, "_meta.json"), "utf8")
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export async function getManualNav(): Promise<ManualSection[]> {
  let entries: import("node:fs").Dirent[]
  try {
    entries = await fs.readdir(MANUAL_DIR, { withFileTypes: true })
  } catch {
    return []
  }

  const sections: ManualSection[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const sectionSlug = entry.name
    const sectionDir = path.join(MANUAL_DIR, sectionSlug)
    const meta = await readSectionMeta(sectionDir)

    const files = (await fs.readdir(sectionDir)).filter((f) => f.endsWith(".md"))
    const pages: ManualPageMeta[] = []
    for (const file of files) {
      const raw = await fs.readFile(path.join(sectionDir, file), "utf8")
      const { data, content } = matter(raw)
      const fm = data as Record<string, unknown>
      const pageSlug = file.replace(/\.md$/, "")
      pages.push({
        slug: [sectionSlug, pageSlug],
        href: `/cybersec/manual/${sectionSlug}/${pageSlug}`,
        title: String(fm.title ?? humanize(pageSlug)),
        description: String(fm.description ?? ""),
        order: Number(fm.order ?? 999),
        sectionSlug,
        readingMinutes: readingTime(content),
      })
    }
    pages.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

    sections.push({
      slug: sectionSlug,
      title: String(meta.title ?? humanize(sectionSlug)),
      order: Number(meta.order ?? 999),
      pages,
    })
  }

  sections.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
  return sections
}

async function flatten(): Promise<{ nav: ManualSection[]; pages: ManualPageMeta[] }> {
  const nav = await getManualNav()
  const pages = nav.flatMap((s) => s.pages)
  return { nav, pages }
}

export async function getFirstManualPage(): Promise<ManualPageMeta | null> {
  const { pages } = await flatten()
  return pages[0] ?? null
}

export async function getAllManualParams(): Promise<{ slug: string[] }[]> {
  const { pages } = await flatten()
  return pages.map((p) => ({ slug: p.slug }))
}

export async function getManualPage(slug: string[]): Promise<ManualPage | null> {
  const [sectionSlug, pageSlug] = slug
  if (!sectionSlug || !pageSlug) return null
  const file = path.join(MANUAL_DIR, sectionSlug, `${pageSlug}.md`)
  let raw: string
  try {
    raw = await fs.readFile(file, "utf8")
  } catch {
    return null
  }

  const { nav, pages } = await flatten()
  const section = nav.find((s) => s.slug === sectionSlug)
  const idx = pages.findIndex(
    (p) => p.slug[0] === sectionSlug && p.slug[1] === pageSlug
  )
  const self = pages[idx]
  if (!self || !section) return null

  const { content } = matter(raw)
  const html = await renderMarkdown(content)
  const headings = extractHeadings(content)

  return {
    ...self,
    sectionTitle: section.title,
    html,
    headings,
    prev: idx > 0 ? pages[idx - 1] : null,
    next: idx < pages.length - 1 ? pages[idx + 1] : null,
  }
}
