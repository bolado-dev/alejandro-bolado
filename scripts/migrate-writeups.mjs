// Migra writeups desde ../zelpro (Fuwari/Astro) a este repo (Next.js).
// - Copia index.md -> content/writeups/<slug>/index.md
// - Copia imágenes -> public/writeups/<slug>/*
// - Reescribe rutas de imágenes relativas (./x.png) a /writeups/<slug>/x.png
import { promises as fs } from "node:fs"
import path from "node:path"

const SRC = path.resolve("../zelpro/src/content/posts")
const CONTENT_OUT = path.resolve("content/writeups")
const PUBLIC_OUT = path.resolve("public/writeups")

const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"])

async function walk(dir) {
  const out = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else if (entry.name === "index.md") out.push(full)
  }
  return out
}

async function main() {
  await fs.rm(CONTENT_OUT, { recursive: true, force: true })
  await fs.rm(PUBLIC_OUT, { recursive: true, force: true })
  await fs.mkdir(CONTENT_OUT, { recursive: true })
  await fs.mkdir(PUBLIC_OUT, { recursive: true })

  const files = await walk(SRC)
  const slugs = new Map()

  for (const file of files) {
    const dir = path.dirname(file)
    const slug = path.basename(dir)
    if (slugs.has(slug)) throw new Error(`Slug duplicado: ${slug}`)
    slugs.set(slug, dir)

    const contentDir = path.join(CONTENT_OUT, slug)
    const publicDir = path.join(PUBLIC_OUT, slug)
    await fs.mkdir(contentDir, { recursive: true })

    // imágenes
    let imgCount = 0
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.isFile() && IMG_EXT.has(path.extname(entry.name).toLowerCase())) {
        await fs.mkdir(publicDir, { recursive: true })
        await fs.copyFile(path.join(dir, entry.name), path.join(publicDir, entry.name))
        imgCount++
      }
    }

    // markdown: reescribir rutas relativas ./img -> /writeups/<slug>/img
    let md = await fs.readFile(file, "utf8")
    md = md.replace(/\.\/([^\s)"']+\.(?:png|jpe?g|gif|webp|svg))/gi, `/writeups/${slug}/$1`)
    await fs.writeFile(path.join(contentDir, "index.md"), md, "utf8")

    console.log(`✓ ${slug} (${imgCount} img)`)
  }
  console.log(`\nTotal: ${files.length} writeups`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
