import Link from "next/link"

import { InkSection, MoreLink } from "@/components/ink"
import { getAllWriteups } from "@/lib/writeups"

const DATE = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

/** Últimos writeups, con la fecha alineada a la derecha y dos líneas de extracto. */
export async function Writing() {
  const writeups = (await getAllWriteups()).slice(0, 4)
  if (writeups.length === 0) return null

  return (
    <InkSection title="Escritos">
      <ul className="divide-y divide-[var(--ink-line)]">
        {writeups.map((w) => (
          <li key={w.slug}>
            <Link
              href={`/cybersec/writeups/${w.slug}`}
              className="group block py-4 first:pt-0"
            >
              <div className="flex items-baseline justify-between gap-6">
                <h3 className="text-[15px] font-medium text-[var(--ink-fg-strong)]">
                  {w.title}
                </h3>
                <span className="shrink-0 text-[13px] text-[var(--ink-fg-dim)]">
                  {DATE.format(new Date(w.published))}
                </span>
              </div>
              {/* Los writeups no traen `description` en el frontmatter, así
                  que las etiquetas hacen de extracto. */}
              <p className="mt-1.5 line-clamp-2 max-w-[62ch] text-[14px] leading-[1.6] text-[var(--ink-fg-dim)]">
                {w.description || w.tags.slice(0, 6).join(" · ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <MoreLink href="/cybersec/writeups">Todos los escritos</MoreLink>
    </InkSection>
  )
}
