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
    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="m22.5106 6.4566.0008-.0123a.888.888 0 0 0-.2717-.6384c-.0084-.0084-.018-.0155-.0267-.0235-.0186-.0166-.0371-.0333-.0572-.0484-.0193-.0147-.04-.0276-.0607-.0406-.0096-.006-.0182-.0131-.0281-.0188L12.4576.1266a.891.891 0 0 0-.9223.0043L1.933 5.6744c-.0107.0062-.0203.014-.0307.0205-.0073.0047-.015.008-.0223.0128-.007.0047-.013.0106-.02.0155a.8769.8769 0 0 0-.147.1333l-.0026.003a.8872.8872 0 0 0-.2218.5847l.0009.014c-.0002.0088-.0015.0176-.0015.0264v11.0708c0 .3277.1802.6288.469.7836l9.5986 5.5417c.0076.0044.0158.0075.0236.0117a.8754.8754 0 0 0 .166.0687c.0134.004.0266.0083.0401.0117a.8793.8793 0 0 0 .072.0142c.0117.0019.0232.0045.0349.006a.835.835 0 0 0 .2157 0c.0117-.0015.0232-.0041.0348-.006a.9.9 0 0 0 .072-.0142c.0135-.0034.0267-.0077.04-.0117a.895.895 0 0 0 .0646-.0217.9134.9134 0 0 0 .1015-.047c.0078-.0042.016-.0072.0236-.0117l9.5986-5.5417a.8888.8888 0 0 0 .469-.7836V6.4779c0-.0071-.0012-.0142-.0014-.0213zM5.2543 6.0822l6.5367-3.774a.4182.4182 0 0 1 .4182 0l6.5366 3.774a.4182.4182 0 0 1 0 .7243l-6.5367 3.774a.4182.4182 0 0 1-.4182 0l-6.5366-3.774a.4182.4182 0 0 1 0-.7243zm5.6134 14.3449a.4172.4172 0 0 1-.626.3613L3.718 17.0218a.4173.4173 0 0 1-.2086-.3613V9.1279a.4172.4172 0 0 1 .6258-.3613l6.524 3.7666a.4172.4172 0 0 1 .2086.3614v7.5325zm9.623-3.7666a.4173.4173 0 0 1-.2086.3613l-6.5239 3.7666a.4172.4172 0 0 1-.6259-.3613v-7.5325c0-.149.0796-.2868.2087-.3614l6.5239-3.7666a.4172.4172 0 0 1 .6258.3613v7.5326z"/></svg>` +
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

/**
 * Convierte la sección inicial "Información Básica" (con sus sub-listas
 * "Técnicas vistas" y "Preparación") en una tarjeta a dos columnas, en vez de
 * un par de listas sueltas. Conserva los id de los encabezados (puestos antes
 * por rehype-slug) para que el índice (TOC) siga funcionando.
 */
function rehypeInfoBox() {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")

  type N = {
    type: string
    tagName?: string
    value?: string
    properties?: Record<string, unknown>
    children?: N[]
  }
  const text = (n: N): string =>
    n.type === "text" ? n.value ?? "" : (n.children ?? []).map(text).join("")
  const isWS = (n: N) => n.type === "text" && !(n.value ?? "").trim()

  const TERMINAL =
    '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>'
  const AWARD =
    '<circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>'
  const CHECK = '<polyline points="20 6 9 17 4 12"></polyline>'
  const svg = (inner: string, cls?: string) =>
    `<svg ${cls ? `class="${cls}" ` : ""}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`

  interface Section {
    title: string
    id?: string
    items: string[]
  }

  const column = (s: Section) => {
    const isCert = /prepar|cert/i.test(s.title)
    const head = `<h3${s.id ? ` id="${esc(s.id)}"` : ""} class="infobox-head">${svg(
      isCert ? AWARD : TERMINAL
    )}${esc(s.title)}</h3>`
    const body = isCert
      ? `<div class="infobox-certs">${s.items
          .map((it) => `<span class="infobox-cert">${esc(it)}</span>`)
          .join("")}</div>`
      : `<ul class="infobox-tech">${s.items
          .map(
            (it) =>
              `<li><span class="infobox-bullet">${svg(CHECK)}</span><span>${esc(
                it
              )}</span></li>`
          )
          .join("")}</ul>`
    return `<div class="infobox-col">${head}${body}</div>`
  }

  const box = (title: string, id: string | undefined, sections: Section[]) =>
    `<div class="infobox"><span${id ? ` id="${esc(id)}"` : ""} class="infobox-title">${esc(
      title
    )}</span><div class="infobox-grid">${sections.map(column).join("")}</div></div>`

  return (tree: Parameters<typeof visit>[0]) => {
    const root = tree as unknown as { children: N[] }
    const kids = root.children
    const i = kids.findIndex(
      (n) =>
        n.type === "element" &&
        n.tagName === "h2" &&
        text(n).trim().toLowerCase() === "información básica"
    )
    if (i === -1) return

    const h2 = kids[i]
    const sections: Section[] = []
    let cur: Section | null = null
    let j = i + 1
    for (; j < kids.length; j++) {
      const n = kids[j]
      if (isWS(n) || n.type !== "element") continue
      if (n.tagName === "h2" || n.tagName === "hr") break
      if (n.tagName === "h3") {
        cur = { title: text(n).trim(), id: n.properties?.id as string | undefined, items: [] }
        sections.push(cur)
      } else if ((n.tagName === "ul" || n.tagName === "ol") && cur) {
        for (const li of n.children ?? []) {
          if (li.type === "element" && li.tagName === "li") {
            cur.items.push(text(li).trim())
          }
        }
      }
    }
    if (!sections.length) return

    // Incluye en el reemplazo el separador (***) que sigue a la sección.
    let end = j
    let k = j
    while (k < kids.length && isWS(kids[k])) k++
    if (kids[k]?.type === "element" && kids[k].tagName === "hr") end = k + 1

    const raw = {
      type: "raw",
      value: box(text(h2).trim(), h2.properties?.id as string | undefined, sections),
    }
    kids.splice(i, end - i, raw as unknown as N)
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
    .use(rehypeInfoBox)
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
