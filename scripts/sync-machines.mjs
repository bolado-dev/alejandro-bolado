// Genera content/machines.json a partir del Google Sheet de máquinas.
//
//   node scripts/sync-machines.mjs
//
// El sheet es público (export CSV). Si cambias la lista en el sheet, vuelve a
// ejecutar este script y commitea el JSON resultante. El estado "hecha/pendiente"
// NO se guarda aquí: se deriva en runtime cruzando con content/writeups (ver
// lib/machines.ts), así el writeup es la única fuente de verdad.

import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SHEET_ID = "1dzvaGlT_0xnT-PGO27Z_4prHgA8PHIpErmoWdlUrSoA"
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, "..", "content", "machines.json")

function parseCSV(text) {
  const rows = []
  let row = [], field = "", inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ",") { row.push(field); field = "" }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = "" }
      else if (c === "\r") { /* ignore */ }
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

// Mismo slug que usan las carpetas de content/writeups.
function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function splitLines(cell) {
  return String(cell || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
}

const DIFF_RANK = { Fácil: 0, Media: 1, Difícil: 2, Insane: 3 }

async function main() {
  console.log("→ Descargando sheet…")
  const res = await fetch(CSV_URL)
  if (!res.ok) throw new Error(`Sheet no accesible: HTTP ${res.status}`)
  const csv = await res.text()

  const rows = parseCSV(csv)
  const headerIdx = rows.findIndex((r) => r[0] === "Máquina")
  if (headerIdx === -1) throw new Error("No se encontró la fila de cabecera 'Máquina'")

  const dataRows = rows.slice(headerIdx + 1).filter((r) => r[0] && r[0].trim())

  const seen = new Set()
  const machines = []
  for (const r of dataRows) {
    const name = r[0].trim()
    let slug = slugify(name)
    // Evita colisiones de slug por nombres repetidos.
    if (seen.has(slug)) slug = `${slug}-${seen.size}`
    seen.add(slug)

    const difficulty = (r[3] || "").trim()
    machines.push({
      slug,
      name,
      ip: (r[1] || "").trim(),
      os: (r[2] || "").trim(),
      difficulty,
      difficultyRank: difficulty in DIFF_RANK ? DIFF_RANK[difficulty] : 99,
      techniques: splitLines(r[4]),
      certs: splitLines(r[5]),
      video: (r[6] || "").trim() || null,
    })
  }

  machines.sort((a, b) => a.name.localeCompare(b.name, "es"))

  const payload = {
    source: `https://docs.google.com/spreadsheets/d/${SHEET_ID}`,
    total: machines.length,
    machines,
  }

  await fs.writeFile(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8")
  console.log(`✓ ${machines.length} máquinas → ${path.relative(process.cwd(), OUT)}`)
}

main().catch((err) => {
  console.error("✗", err.message)
  process.exit(1)
})
