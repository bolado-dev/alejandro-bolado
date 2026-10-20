import { Fragment } from "react"

/**
 * Párrafo con fragmentos resaltados. Las frases de `strong` se buscan
 * literalmente en el texto y se pintan en blanco, igual que las métricas de la
 * referencia. Si una frase no aparece, se ignora sin romper nada.
 */
export function Highlighted({
  text,
  strong = [],
}: {
  text: string
  strong?: string[]
}) {
  const hits = strong
    .map((s) => ({ s, i: text.indexOf(s) }))
    .filter((h) => h.i >= 0)
    .sort((a, b) => a.i - b.i)

  const parts: React.ReactNode[] = []
  let cursor = 0
  for (const { s, i } of hits) {
    if (i < cursor) continue // solapado: nos quedamos con el primero
    if (i > cursor) parts.push(text.slice(cursor, i))
    parts.push(
      <strong
        key={`${s}-${i}`}
        className="font-medium text-[var(--ink-fg-strong)]"
      >
        {s}
      </strong>,
    )
    cursor = i + s.length
  }
  if (cursor < text.length) parts.push(text.slice(cursor))

  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  )
}
