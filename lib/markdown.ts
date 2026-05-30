import "server-only"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkDirective from "remark-directive"
import remarkMath from "remark-math"
import remarkRehype from "remark-rehype"
import remarkAdmonitions from "remark-github-admonitions-to-directives"
import rehypeRaw from "rehype-raw"
import rehypeSlug from "rehype-slug"
import rehypeKatex from "rehype-katex"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeStringify from "rehype-stringify"
import { visit } from "unist-util-visit"
import { toString as mdastToString } from "mdast-util-to-string"
import GithubSlugger from "github-slugger"
import { promises as fs } from "node:fs"
import path from "node:path"
import { imageSize } from "image-size"

export interface Heading {
  depth: number
  text: string
  id: string
}

/**
 * Expressive Code (Fuwari) usa metadatos en las fences como `wrap=false`
 * que rehype-pretty-code no entiende. Los limpiamos pero conservamos `title="..."`.
 */
export function normalizeFences(md: string): string {
  return md.replace(/^(```+)([^\n]*)$/gm, (full, ticks, info) => {
    if (!info.trim()) return full
    const cleaned = info
      .replace(/\bwrap=false\b/g, "")
      .replace(/\s{2,}/g, " ")
      .trimEnd()
    return `${ticks}${cleaned}`
  })
}

/** Convierte directivas :::note/tip/important/warning/caution en bloques estilizables. */
function remarkAdmonitionStyles() {
  const TYPES: Record<string, string> = {
    note: "note",
    tip: "tip",
    important: "important",
    warning: "warning",
    caution: "caution",
  }
  return (tree: Parameters<typeof visit>[0]) => {
    visit(tree, (node) => {
      if (node.type !== "containerDirective") return
      const directive = node as unknown as {
        name: string
        data?: Record<string, unknown>
      }
      const type = TYPES[directive.name]
      if (!type) return
      directive.data = directive.data ?? {}
      directive.data.hName = "div"
      directive.data.hProperties = {
        className: ["admonition", `admonition-${type}`],
        "data-admonition": type,
      }
    })
  }
}

/**
 * Añade width/height reales (evita CLS) + lazy loading a las imágenes locales,
 * y una clase para el lightbox. Lee dimensiones del fichero en /public.
 */
function rehypeImageDims() {
  return async (tree: Parameters<typeof visit>[0]) => {
    const imgs: { properties: Record<string, unknown> }[] = []
    visit(tree, "element", (node: unknown) => {
      const el = node as { tagName: string; properties?: Record<string, unknown> }
      if (el.tagName === "img" && el.properties) {
        imgs.push({ properties: el.properties })
      }
    })

    await Promise.all(
      imgs.map(async ({ properties }) => {
        const src = String(properties.src ?? "")
        properties.loading = "lazy"
        properties.decoding = "async"
        const cls = Array.isArray(properties.className) ? properties.className : []
        properties.className = [...cls, "prose-img"]
        if (!src.startsWith("/")) return
        try {
          const file = path.join(process.cwd(), "public", src)
          const buf = await fs.readFile(file)
          const { width, height } = imageSize(buf)
          if (width && height) {
            properties.width = width
            properties.height = height
          }
        } catch {
          // imagen remota o no encontrada: se omite el dimensionado
        }
      })
    )
  }
}

let processor: ReturnType<typeof buildProcessor> | null = null
function buildProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkAdmonitions)
    .use(remarkDirective)
    .use(remarkAdmonitionStyles)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    // pretty-code antes que rehype-raw: rehype-raw reparsea el árbol y
    // descartaría el `data.meta` de las fences (títulos, etc.)
    .use(rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark" },
      keepBackground: false,
      defaultLang: "plaintext",
    })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeKatex)
    .use(rehypeImageDims)
    .use(rehypeStringify, { allowDangerousHtml: true })
}

export async function renderMarkdown(content: string): Promise<string> {
  processor = processor ?? buildProcessor()
  return String(await processor.process(normalizeFences(content)))
}

/** Extrae los encabezados h2/h3 con el mismo id que genera rehype-slug. */
export function extractHeadings(content: string, maxDepth = 3): Heading[] {
  const slugger = new GithubSlugger()
  const tree = unified().use(remarkParse).parse(content)
  const headings: Heading[] = []
  visit(tree, "heading", (node: unknown) => {
    const n = node as { depth: number; children: unknown[] }
    if (n.depth < 2 || n.depth > maxDepth) {
      // aún hay que avanzar el slugger para emparejar ids de rehype-slug
      if (n.depth === 1) slugger.slug(mdastToString(node))
      return
    }
    const text = mdastToString(node)
    headings.push({ depth: n.depth, text, id: slugger.slug(text) })
  })
  return headings
}

export function readingTime(raw: string): number {
  const words = raw.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
