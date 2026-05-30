import { ListTree } from "lucide-react"
import type { Heading } from "@/lib/markdown"

export function TocMobile({
  headings,
  className = "",
}: {
  headings: Heading[]
  className?: string
}) {
  if (headings.length === 0) return null
  return (
    <details className={`group mb-8 rounded-xl border bg-card ${className}`}>
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-[13px] font-medium text-muted-foreground marker:content-none">
        <ListTree className="h-4 w-4" />
        Índice
        <span className="ml-auto text-muted-foreground transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <ul className="space-y-1 border-t px-4 py-3">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block text-[13px] text-muted-foreground hover:text-foreground ${
                h.depth === 3 ? "pl-4" : ""
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
