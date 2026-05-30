import { promises as fs } from "node:fs"
import path from "node:path"
import { getWriteupSlugs } from "@/lib/writeups"

const CONTENT_DIR = path.join(process.cwd(), "content", "writeups")

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
}

/**
 * Sirve imágenes colocadas junto al index.md en content/writeups/<slug>/.
 * Permite escribir `![alt](./captura.png)` sin duplicar nada en /public.
 * Las imágenes que ya viven en /public/writeups/... las sigue sirviendo
 * Next directamente (tienen prioridad sobre esta ruta).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; file: string }> }
) {
  const { slug, file } = await params

  // Solo nombres de fichero simples (sin traversal) y extensión conocida.
  const ext = path.extname(file).toLowerCase()
  if (file.includes("/") || file.includes("..") || !MIME[ext]) {
    return new Response("Not found", { status: 404 })
  }

  const filePath = path.join(CONTENT_DIR, slug, file)
  // Defensa extra: el path resuelto debe quedar dentro de content/writeups.
  if (!filePath.startsWith(CONTENT_DIR + path.sep)) {
    return new Response("Not found", { status: 404 })
  }

  try {
    const buf = await fs.readFile(filePath)
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new Response("Not found", { status: 404 })
  }
}

/** Pre-genera las rutas en build para servir estático sin route dinámica. */
export async function generateStaticParams() {
  const slugs = await getWriteupSlugs()
  const all: { slug: string; file: string }[] = []
  for (const slug of slugs) {
    const dir = path.join(CONTENT_DIR, slug)
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      if (e.isFile() && MIME[path.extname(e.name).toLowerCase()]) {
        all.push({ slug, file: e.name })
      }
    }
  }
  return all
}

export const dynamicParams = true
