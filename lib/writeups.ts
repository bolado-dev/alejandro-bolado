import "server-only"
import { promises as fs, existsSync } from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { renderMarkdown, extractHeadings, readingTime, type Heading } from "@/lib/markdown"

const CONTENT_DIR = path.join(process.cwd(), "content", "writeups")
const MACHINE_IMG_DIR = path.join(process.cwd(), "public", "machines")

/**
 * El logo de cada writeup es el avatar oficial de HTB de la máquina con el
 * mismo slug (descargado en public/machines/ con `pnpm sync:machine-images`).
 * Así no hay que mantener un logo.png por writeup.
 */
function avatarFor(slug: string): string | null {
  return existsSync(path.join(MACHINE_IMG_DIR, `${slug}.png`))
    ? `/machines/${slug}.png`
    : null
}

export interface WriteupMeta {
  slug: string
  title: string
  published: string // ISO
  category: string
  difficulty: string | null
  tags: string[]
  image: string | null
  description: string
  readingMinutes: number
}

export interface Writeup extends WriteupMeta {
  html: string
  headings: Heading[]
}

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Insane"]

function deriveDifficulty(tags: string[]): string | null {
  return tags.find((t) => DIFFICULTIES.includes(t)) ?? null
}

async function parseFile(slug: string): Promise<{
  content: string
  meta: WriteupMeta
}> {
  const file = path.join(CONTENT_DIR, slug, "index.md")
  const raw = await fs.readFile(file, "utf8")
  const data = matter(raw)
  const fm = data.data as Record<string, unknown>
  const tags = Array.isArray(fm.tags) ? (fm.tags as string[]) : []
  const published =
    fm.published instanceof Date
      ? fm.published.toISOString()
      : new Date(String(fm.published ?? "1970-01-01")).toISOString()

  const meta: WriteupMeta = {
    slug,
    title: String(fm.title ?? slug),
    published,
    category: String(fm.category ?? "General"),
    difficulty: deriveDifficulty(tags),
    tags,
    image: avatarFor(slug) ?? (fm.image ? String(fm.image) : null),
    description: String(fm.description ?? ""),
    readingMinutes: readingTime(data.content),
  }
  return { content: data.content, meta }
}

export async function getWriteupSlugs(): Promise<string[]> {
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true })
  return entries.filter((e) => e.isDirectory()).map((e) => e.name)
}

export async function getAllWriteups(): Promise<WriteupMeta[]> {
  const slugs = await getWriteupSlugs()
  const metas = await Promise.all(slugs.map((s) => parseFile(s).then((r) => r.meta)))
  return metas.sort((a, b) => +new Date(b.published) - +new Date(a.published))
}

export async function getWriteup(slug: string): Promise<Writeup | null> {
  try {
    const { content, meta } = await parseFile(slug)
    const html = await renderMarkdown(content, { slug })
    const headings = extractHeadings(content)
    return { ...meta, html, headings }
  } catch {
    return null
  }
}
