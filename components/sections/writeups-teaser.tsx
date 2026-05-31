import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, Server } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getAllWriteups } from "@/lib/writeups"
import { getMachines, getMachineStats } from "@/lib/machines"

const DIFF_ORDER = ["Easy", "Medium", "Hard", "Insane"]

function diffColor(d: string | null) {
  switch (d) {
    case "Easy":
      return "text-emerald-600 dark:text-emerald-400"
    case "Medium":
      return "text-amber-600 dark:text-amber-400"
    case "Hard":
      return "text-red-600 dark:text-red-400"
    case "Insane":
      return "text-fuchsia-600 dark:text-fuchsia-400"
    default:
      return "text-muted-foreground"
  }
}

export async function WriteupsTeaser() {
  const [all, machines] = await Promise.all([getAllWriteups(), getMachines()])
  const latest = all.slice(0, 4)
  if (latest.length === 0) return null

  const stats = getMachineStats(machines)
  const pct = Math.round((stats.done / stats.total) * 100)

  return (
    <section id="writeups" className="border-b px-4 py-20">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-12 flex items-end justify-between">
          <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
            Ciberseguridad
          </p>
          <Link
            href="/cybersec"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Entrar al lab
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Una sección aparte con {all.length} writeups de Hack The Box y un manual
          técnico estilo HackTricks. Hacking ético, explotación y escalada de
          privilegios.
        </p>

        <Link
          href="/cybersec/maquinas"
          className="group mb-10 flex items-center gap-5 rounded-xl border bg-card p-5 transition-colors hover:bg-secondary"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border bg-background">
            <Server className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                Roadmap de máquinas
              </span>
              <span className="text-[13px] tabular-nums text-muted-foreground">
                <span className="font-medium text-foreground">{stats.done}</span>
                /{stats.total} · {pct}%
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>

        <div className="flex flex-col">
          {latest.map((w, i) => (
            <Link
              key={w.slug}
              href={`/cybersec/writeups/${w.slug}`}
              className={cn(
                "group grid grid-cols-[48px_1fr_auto] items-center gap-5 py-5",
                i < latest.length - 1 && "border-b"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {w.image ? (
                  <Image
                    src={w.image}
                    alt={w.title}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">
                    {w.title.charAt(0)}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 text-[10px] tracking-widest text-muted-foreground uppercase">
                  <span>{w.category}</span>
                  {w.difficulty && (
                    <span className={cn("font-medium", diffColor(w.difficulty))}>
                      · {w.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="truncate text-[15px] font-medium">{w.title}</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {w.tags
                    .filter((t) => !DIFF_ORDER.includes(t))
                    .slice(0, 2)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-full text-[10px] font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>

              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
