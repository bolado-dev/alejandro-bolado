import Link from "next/link"
import Image from "next/image"
import { SiKalilinux, SiHackthebox } from "@icons-pack/react-simple-icons"
import { ArrowUpRight } from "@/components/icons/solar"
import { Counter } from "@/components/animated/counter"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { SplitText } from "@/components/animated/split-text"
import { SectionLabel } from "@/components/section-label"
import { Marquee } from "@/components/animated/marquee"
import { OsIcon } from "@/components/cybersec/os-icon"
import { getAllWriteups } from "@/lib/writeups"
import { getMachines, getMachineStats, type Machine } from "@/lib/machines"

function MachineChip({ m }: { m: Machine }) {
  const inner = (
    <div className="mx-5 flex flex-col items-center gap-3">
      <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border/60 transition-all duration-500 ease-out group-hover:ring-brand/50">
        {m.image ? (
          <Image
            src={m.image}
            alt={m.name}
            width={64}
            height={64}
            className="h-full w-full object-cover grayscale transition-all duration-500 ease-out group-hover:scale-110 group-hover:grayscale-0"
          />
        ) : (
          <OsIcon os={m.os} className="h-6 w-6 text-muted-foreground" />
        )}
      </span>
      <span className="text-xs whitespace-nowrap text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
        {m.name}
      </span>
    </div>
  )

  if (m.done && m.writeup) {
    return (
      <Link
        href={m.writeup}
        data-cursor-label="Ver writeup"
        className="group transition-transform duration-500 ease-out hover:-translate-y-1"
      >
        {inner}
      </Link>
    )
  }
  return <div className="group opacity-50">{inner}</div>
}

export async function CybersecTeaser() {
  const [all, machineList] = await Promise.all([
    getAllWriteups(),
    getMachines(),
  ])
  if (all.length === 0) return null

  const stats = getMachineStats(machineList)
  const pct = Math.round((stats.done / stats.total) * 100)
  const solved = machineList.filter((m) => m.done)

  return (
    <section id="writeups" className="px-4 py-28 md:py-32">
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
          className="mb-16 grid gap-4 sm:grid-cols-3"
          selector="[data-stat]"
          stagger={0.1}
          y={20}
        >
          <div data-stat className="rounded-3xl border bg-card p-8">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Writeups
            </span>
            <p className="mt-4 text-[clamp(2.25rem,4.5vw,3.25rem)] font-medium leading-none tracking-tight">
              <Counter to={all.length} />
            </p>
          </div>
          <div data-stat className="rounded-3xl border bg-card p-8">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Máquinas resueltas
            </span>
            <p className="mt-4 text-[clamp(2.25rem,4.5vw,3.25rem)] font-medium leading-none tracking-tight">
              <Counter to={stats.done} />
              <span className="text-muted-foreground">/{stats.total}</span>
            </p>
          </div>
          <div data-stat className="rounded-3xl border bg-card p-8">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Roadmap completado
            </span>
            <p className="mt-4 text-[clamp(2.25rem,4.5vw,3.25rem)] font-medium leading-none tracking-tight text-brand">
              <Counter to={pct} suffix="%" />
            </p>
            <div className="mt-4 h-1 w-full rounded-full bg-border">
              <div
                className="h-1 rounded-full bg-brand transition-[width] duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </StaggerReveal>

        {/* máquinas resueltas: carrusel infinito */}
        {solved.length > 0 && (
          <Reveal>
            <p className="mb-5 text-[11px] uppercase tracking-widest text-muted-foreground">
              Máquinas resueltas
            </p>
            <Marquee className="py-2">
              {solved.map((m) => (
                <MachineChip key={m.slug} m={m} />
              ))}
            </Marquee>
          </Reveal>
        )}

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/cybersec/maquinas"
            data-cursor-label="Roadmap"
            className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver roadmap de máquinas
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* panel de entrada: identidad visual de /cybersec */}
        <Reveal y={24} delay={0.1}>
          <Link
            href="/cybersec"
            data-cursor-label="Ver Cybersec"
            className="group relative mt-6 flex flex-col items-start justify-between gap-8 overflow-hidden rounded-xl bg-foreground px-8 py-12 text-background transition-colors md:flex-row md:items-center md:px-12"
          >
            <SiKalilinux
              aria-hidden
              className="pointer-events-none absolute -bottom-16 left-4 h-64 w-64 text-background/10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:scale-110 group-hover:text-background/20 md:left-8 md:h-72 md:w-72"
            />
            <SiHackthebox
              aria-hidden
              className="pointer-events-none absolute -right-4 -bottom-16 h-64 w-64 text-background/10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:scale-110 group-hover:text-background/20 md:right-8 md:h-72 md:w-72"
            />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-widest text-background/60">
                /cybersec
              </p>
              <h3 className="mt-3 text-[clamp(1.5rem,3.5vw,2.25rem)] leading-[1.05] font-medium tracking-tight">
                Writeups, manual técnico &amp; CTFs
              </h3>
              <p className="mt-3 max-w-lg text-[15px] leading-[1.7] text-background/70">
                Hacking ético, pentesting y {all.length}+ writeups de Hack The
                Box documentados paso a paso: explotación, post-explotación y
                escalada de privilegios.
              </p>
            </div>
            <span className="relative flex shrink-0 items-center gap-2 rounded-full border border-background/30 px-5 py-2.5 text-sm font-medium transition-all duration-300 group-hover:scale-[1.03] group-hover:bg-background group-hover:text-foreground">
              Entrar al lab
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
