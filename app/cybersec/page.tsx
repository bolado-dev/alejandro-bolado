import Link from "next/link"
import { FileText, BookOpen, Server, ArrowUpRight, Terminal } from "@/components/icons/solar"
import { getAllWriteups } from "@/lib/writeups"
import { getManualNav } from "@/lib/manual"
import { getMachines, getMachineStats } from "@/lib/machines"
import { GithubIcon } from "@/components/icons/github-icon"

export default async function CybersecLanding() {
  const [writeups, manual, machineList] = await Promise.all([
    getAllWriteups(),
    getManualNav(),
    getMachines(),
  ])
  const machineStats = getMachineStats(machineList)
  const manualPages = manual.reduce((acc, s) => acc + s.pages.length, 0)

  return (
    <main className="px-4 pt-24 pb-28">
      <div className="container mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="mb-4 text-[11px] tracking-widest text-muted-foreground uppercase">
          Ciberseguridad
        </p>
        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl">
          Hacking ético & writeups
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Una sección dedicada a la seguridad ofensiva: resoluciones de máquinas
          de Hack The Box y un manual técnico de referencia. Enumeración,
          explotación, post-explotación y escalada de privilegios.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-3">
          <Stat value={writeups.length} label="Writeups" />
          <Stat
            value={`${machineStats.done}/${machineStats.total}`}
            label="Máquinas resueltas"
          />
          <Stat value={manualPages} label="Páginas de manual" />
        </div>

        <div className="mt-14 grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          <LandingCard
            href="/cybersec/maquinas"
            icon={<Server className="h-5 w-5" />}
            eyebrow="Roadmap"
            title="Máquinas"
            desc="El listado completo: resueltas y pendientes, con buscador por técnica, OS, dificultad y certificación."
            meta={`${machineStats.done}/${machineStats.total} resueltas`}
          />
          <LandingCard
            href="/cybersec/writeups"
            icon={<FileText className="h-5 w-5" />}
            eyebrow="Resoluciones"
            title="Writeups"
            desc="Máquinas de Hack The Box resueltas paso a paso, filtrables por dificultad y técnica."
            meta={`${writeups.length} entradas`}
          />
          <LandingCard
            href="/cybersec/manual"
            icon={<BookOpen className="h-5 w-5" />}
            eyebrow="Referencia"
            title="Manual"
            desc="Apuntes técnicos de referencia. Conceptos, protecciones y técnicas de explotación."
            meta={`${manual.length} ${manual.length === 1 ? "sección" : "secciones"}`}
          />
        </div>

        <Link
          href="https://github.com/bolado-dev/BoladoBSPWM"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 flex w-full items-center justify-between gap-6 rounded-xl border border-dashed bg-card px-6 py-5 text-left transition-colors hover:bg-secondary"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background">
              <Terminal className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
                Mi entorno de hacking
              </p>
              <p className="mt-0.5 font-medium">BoladoBSPWM</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Setup personalizado de escritorio sobre BSPWM: Polybar, Rofi, Kitty y scripts propios para un entorno orientado a ciberseguridad.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <GithubIcon className="h-4 w-4" />
            <span className="hidden sm:inline">bolado-dev/BoladoBSPWM</span>
            <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </Link>
      </div>
    </main>
  )
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-medium">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

function LandingCard({
  href,
  icon,
  eyebrow,
  title,
  desc,
  meta,
}: {
  href: string
  icon: React.ReactNode
  eyebrow: string
  title: string
  desc: string
  meta: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-xl border bg-card p-6 transition-colors hover:bg-secondary"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
            {icon}
          </span>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="mt-5 text-[11px] tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-medium">{title}</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </div>
      <p className="mt-8 text-[13px] text-muted-foreground">{meta}</p>
    </Link>
  )
}
