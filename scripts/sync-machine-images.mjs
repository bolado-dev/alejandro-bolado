// Descarga los avatares oficiales de HTB para cada máquina de
// content/machines.json y los guarda en public/machines/<slug>.png, de donde
// los sirven las tarjetas de /cybersec/maquinas.
//
//   node scripts/sync-machine-images.mjs            # solo las que faltan
//   node scripts/sync-machine-images.mjs --force    # re-descarga todas
//
// Usa la función `htbimg` de tu zsh (necesita el token HTB en
// ~/.config/htb/token o $HTB_TOKEN). Se invoca con `zsh -ic` para que cargue
// tu configuración y la función esté disponible. Idempotente: salta las que ya
// existen salvo --force.

import { promises as fs } from "node:fs"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const DATA = path.join(ROOT, "content", "machines.json")
const OUT_DIR = path.join(ROOT, "public", "machines")

const FORCE = process.argv.includes("--force")
const SLEEP_MS = 250 // pausa entre llamadas para no martillear la API
const TIMEOUT_MS = 25_000 // tope por máquina

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// PNG: 89 50 4E 47 0D 0A 1A 0A
function isPng(buf) {
  return (
    buf.length > 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
}

function fetchAvatar(name, outPath) {
  // zsh -ic carga tu .zshrc (donde vive htbimg). Los args van como $1/$2 para
  // evitar problemas de comillas con el nombre de la máquina.
  const res = spawnSync(
    "zsh",
    ["-ic", 'htbimg "$1" "$2"', "sync-machine-images", name, outPath],
    { stdio: ["ignore", "pipe", "pipe"], timeout: TIMEOUT_MS, encoding: "utf8" }
  )
  if (res.error) return { ok: false, reason: res.error.message }
  if (res.status !== 0) {
    const msg = (res.stderr || res.stdout || "").trim().split("\n").pop()
    return { ok: false, reason: msg || `exit ${res.status}` }
  }
  return { ok: true }
}

async function main() {
  const data = JSON.parse(await fs.readFile(DATA, "utf8"))
  await fs.mkdir(OUT_DIR, { recursive: true })

  const todo = data.machines.filter(
    (m) => FORCE || !existsSync(path.join(OUT_DIR, `${m.slug}.png`))
  )

  console.log(
    `${data.machines.length} máquinas · ${todo.length} a descargar` +
      (FORCE ? " (--force)" : " (faltantes)")
  )

  let ok = 0
  const failed = []

  for (let i = 0; i < todo.length; i++) {
    const m = todo[i]
    const out = path.join(OUT_DIR, `${m.slug}.png`)
    const prefix = `[${i + 1}/${todo.length}] ${m.name}`

    const r = fetchAvatar(m.name, out)
    if (!r.ok) {
      failed.push({ name: m.name, reason: r.reason })
      console.log(`✗ ${prefix} — ${r.reason}`)
    } else {
      // Validamos que sea PNG de verdad; si no, lo descartamos.
      let valid = false
      try {
        const buf = await fs.readFile(out)
        valid = isPng(buf) && buf.length > 100
      } catch {
        /* no se escribió */
      }
      if (valid) {
        ok++
        console.log(`✓ ${prefix}`)
      } else {
        await fs.rm(out, { force: true })
        failed.push({ name: m.name, reason: "no es PNG válido" })
        console.log(`✗ ${prefix} — no es PNG válido`)
      }
    }
    if (i < todo.length - 1) await sleep(SLEEP_MS)
  }

  console.log(`\n✓ ${ok} descargadas · ✗ ${failed.length} fallidas`)
  if (failed.length) {
    console.log("\nFallidas (reintenta con el token fresco):")
    for (const f of failed) console.log(`  - ${f.name}: ${f.reason}`)
  }
}

main().catch((err) => {
  console.error("✗", err.message)
  process.exit(1)
})
