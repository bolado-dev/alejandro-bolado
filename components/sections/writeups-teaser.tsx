import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowUpRight } from "@/components/icons/solar"
import { Badge } from "@/components/ui/badge"
import { Counter } from "@/components/animated/counter"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { SplitText } from "@/components/animated/split-text"
import { SectionLabel } from "@/components/section-label"
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
    <section id="writeups" className="border-b px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Ciberseguridad</SectionLabel>
          <SplitText
            as="h2"
            stagger={0.05}
            duration={0.9}
            className="mb-4 text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[0.98] tracking-tight"
          >
            Del reconocimiento a root
          </SplitText>
          <Reveal delay={0.2}>
            <p className="mb-16 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
              Una sección aparte con {all.length} writeups de Hack The Box y un
              manual técnico de explotación y escalada de privilegios.
            </p>
          </Reveal>
        </div>

        {/* métricas */}
        <StaggerReveal
          className="mb-16 grid grid-cols-1 border-t sm:grid-cols-3"
          stagger={0.1}
          y={20}
        >
          <div className="flex flex-col justify-between gap-6 border-b py-8 pr-8 sm:border-r">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Writeups
            </span>
            <span className="text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-none tracking-tight">
              <Counter to={all.length} />
            </span>
          </div>
          <div className="flex flex-col justify-between gap-6 border-b py-8 sm:border-r sm:px-8">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Máquinas resueltas
            </span>
            <span className="text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-none tracking-tight">
              <Counter to={stats.done} />
              <span className="text-muted-foreground">/{stats.total}</span>
            </span>
          </div>
          <div className="flex flex-col justify-between gap-6 border-b py-8 sm:pl-8">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Roadmap completado
            </span>
            <div>
              <span className="text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-none tracking-tight text-brand">
                <Counter to={pct} suffix="%" />
              </span>
              <div className="mt-4 h-px w-full bg-border">
                <div
                  className="h-px bg-brand transition-[width] duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </StaggerReveal>

        {/* últimos writeups */}
        <Reveal>
          <p className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            Últimos writeups
          </p>
        </Reveal>

        <StaggerReveal selector="[data-row]" className="border-t" stagger={0.08} y={20}>
          {latest.map((w) => (
            <Link
              key={w.slug}
              href={`/cybersec/writeups/${w.slug}`}
              data-row
              className="group relative flex items-center gap-5 border-b py-5 transition-colors"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-[-1rem] inset-y-0 -z-10 origin-left scale-x-0 bg-foreground/[0.03] transition-transform duration-500 ease-out group-hover:scale-x-100"
              />

              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted transition-colors group-hover:border-brand/40">
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

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span>{w.category}</span>
                  {w.difficulty && (
                    <span className={cn("font-medium", diffColor(w.difficulty))}>
                      · {w.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="truncate text-[17px] font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-1.5">
                  {w.title}
                </h3>
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

              <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand group-hover:opacity-100" />
            </Link>
          ))}
        </StaggerReveal>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/cybersec/maquinas"
            className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver roadmap de máquinas
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <Link
            href="/cybersec"
            className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-widest"
          >
            <span className="border-b border-brand pb-0.5 transition-colors group-hover:text-brand">
              Entrar al lab
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-brand transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
