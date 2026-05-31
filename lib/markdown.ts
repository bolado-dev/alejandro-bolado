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
import { VFile } from "vfile"
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
 * Reescribe las rutas de imagen relativas (`./captura.png` o `captura.png`)
 * colocadas junto al index.md a la ruta servida `/writeups/<slug>/captura.png`.
 * Solo actúa si el VFile lleva `data.writeupSlug`. Las rutas absolutas
 * (`/writeups/...`) y remotas (`http...`) se dejan intactas.
 */
function rehypeRelativeImages() {
  return (tree: Parameters<typeof visit>[0], file: VFile) => {
    const slug = file.data?.writeupSlug as string | undefined
    if (!slug) return
    visit(tree, "element", (node: unknown) => {
      const el = node as { tagName: string; properties?: Record<string, unknown> }
      if (el.tagName !== "img" || !el.properties) return
      const src = String(el.properties.src ?? "")
      if (!src || /^([a-z]+:|\/)/i.test(src)) return // remota o ya absoluta
      el.properties.src = `/writeups/${slug}/${src.replace(/^\.\//, "")}`
    })
  }
}

/**
 * Añade width/height reales (evita CLS) + lazy loading a las imágenes locales,
 * y una clase para el lightbox. Lee dimensiones desde /public o, si la imagen
 * está colocada junto al markdown, desde content/ (ambos bajo /writeups/<slug>/).
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
        // 1º en /public; si no, colocada en content/ (mismo path /writeups/<slug>/file).
        const candidates = [
          path.join(process.cwd(), "public", src),
          path.join(process.cwd(), "content", src),
        ]
        for (const file of candidates) {
          try {
            const buf = await fs.readFile(file)
            const { width, height } = imageSize(buf)
            if (width && height) {
              properties.width = width
              properties.height = height
            }
            return
          } catch {
            // probar siguiente candidato
          }
        }
      })
    )
  }
}

/**
 * Convierte el enlace final "[Pwned!](…/achievement/machine/…)" en una
 * tarjeta estética (bandera HTB + enlace al logro). Detecta por la URL del
 * logro, así que funciona sea cual sea el texto del enlace.
 */
function rehypePwnedBadge() {
  const RE = /labs\.hackthebox\.com\/achievement\/machine\//i
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
  const card = (href: string) =>
    `<a class="pwned-card" href="${esc(href)}" target="_blank" rel="noopener noreferrer">` +
    `<span class="pwned-flag" aria-hidden="true">` +
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22V15"/></svg>` +
    `</span>` +
    `<span class="pwned-body">` +
    `<span class="pwned-title">Máquina comprometida</span>` +
    `<span class="pwned-sub">Pwned! · ver logro en Hack The Box</span>` +
    `</span>` +
    `<svg class="pwned-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>` +
    `</a>`

  return (tree: Parameters<typeof visit>[0]) => {
    visit(tree, "element", (node: unknown, index, parent: unknown) => {
      const el = node as { tagName: string; properties?: Record<string, unknown> }
      if (el.tagName !== "a") return
      const href = String(el.properties?.href ?? "")
      if (!RE.test(href)) return

      const raw = { type: "raw", value: card(href) }
      const p = parent as {
        tagName?: string
        children: unknown[]
        properties?: Record<string, unknown>
      } | null

      // Si el enlace es lo único del párrafo, reemplaza el párrafo entero.
      if (p && p.tagName === "p") {
        const meaningful = p.children.filter((c) => {
          const n = c as { type: string; value?: string }
          return !(n.type === "text" && !(n.value ?? "").trim())
        })
        if (meaningful.length === 1) {
          p.children = [raw as never]
          p.properties = { ...(p.properties ?? {}), className: ["pwned-wrap"] }
          return
        }
      }
      if (p && typeof index === "number") {
        ;(p.children as unknown[])[index] = raw
      }
    })
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
    .use(rehypeRelativeImages)
    .use(rehypeImageDims)
    .use(rehypePwnedBadge)
    .use(rehypeStringify, { allowDangerousHtml: true })
}

export async function renderMarkdown(
  content: string,
  opts: { slug?: string } = {}
): Promise<string> {
  processor = processor ?? buildProcessor()
  const file = new VFile({ value: normalizeFences(content) })
  if (opts.slug) file.data.writeupSlug = opts.slug
  return String(await processor.process(file))
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
