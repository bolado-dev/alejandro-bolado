import { getAllWriteups } from "@/lib/writeups"

const SITE = "https://alejandrobolado.es"

export const dynamic = "force-static"

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function GET() {
  const writeups = await getAllWriteups()
  const items = writeups
    .map((w) => {
      const url = `${SITE}/cybersec/writeups/${w.slug}`
      const desc = w.description || `Writeup de ${w.title} — ${w.category}.`
      return `    <item>
      <title>${escape(w.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(w.published).toUTCString()}</pubDate>
      <category>${escape(w.category)}</category>
      <description>${escape(desc)}</description>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Writeups · Alejandro Bolado</title>
    <link>${SITE}/cybersec/writeups</link>
    <description>Writeups de Hack The Box y ciberseguridad.</description>
    <language>es</language>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
