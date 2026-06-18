// Copia las imágenes co-localizadas junto a cada writeup
// (content/writeups/<slug>/*.{png,jpg,...}) a public/writeups/<slug>/, de donde
// Next las sirve como estáticos en CUALQUIER host (sin depender del route
// handler dinámico). Así puedes mantener las fotos junto al index.md y que se
// vean también en producción.
//
//   node scripts/sync-writeup-images.mjs           # copia las que faltan / cambiaron
//   node scripts/sync-writeup-images.mjs --force    # recopia todas
//
// Es ADITIVO: nunca borra imágenes de public/ (hay writeups antiguas cuyas
// imágenes viven solo en public/). Idempotente. Se ejecuta también en `build`.

import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const SRC_DIR = path.join(ROOT, "content", "writeups")
const OUT_DIR = path.join(ROOT, "public", "writeups")

const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg"])
const FORCE = process.argv.includes("--force")

/** ¿Hay que copiar? Si no existe el destino, o difiere en tamaño/mtime, o --force. */
async function needsCopy(src, dst) {
  if (FORCE) return true
  try {
    const [s, d] = await Promise.all([fs.stat(src), fs.stat(dst)])
    return s.size !== d.size || s.mtimeMs > d.mtimeMs
  } catch {
    return true // el destino no existe
  }
}

async function main() {
  let slugs = []
  try {
    const entries = await fs.readdir(SRC_DIR, { withFileTypes: true })
    slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    console.log("(no hay content/writeups, nada que sincronizar)")
    return
  }

  let copied = 0
  let skipped = 0

  for (const slug of slugs) {
    const srcSlugDir = path.join(SRC_DIR, slug)
    const files = await fs.readdir(srcSlugDir, { withFileTypes: true })
    const imgs = files.filter(
      (f) => f.isFile() && IMG_EXT.has(path.extname(f.name).toLowerCase())
    )
    if (!imgs.length) continue

    const outSlugDir = path.join(OUT_DIR, slug)
    await fs.mkdir(outSlugDir, { recursive: true })

    for (const img of imgs) {
      const src = path.join(srcSlugDir, img.name)
      const dst = path.join(outSlugDir, img.name)
      if (await needsCopy(src, dst)) {
        await fs.copyFile(src, dst)
        copied++
        console.log(`✓ ${slug}/${img.name}`)
      } else {
        skipped++
      }
    }
  }

  console.log(`\n✓ ${copied} copiadas · ${skipped} ya al día`)
}

main().catch((err) => {
  console.error("✗", err.message)
  process.exit(1)
})
