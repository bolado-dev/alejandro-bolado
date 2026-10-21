import Link from "next/link"

import { CyberHero } from "@/components/cybersec/cyber-hero"
import { GithubIcon } from "@/components/icons/github-icon"
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Server,
  Terminal,
} from "@/components/icons/solar"
import { InkSection } from "@/components/ink"
import { InkStagger } from "@/components/ink-reveal"
import { getMachines, getMachineStats } from "@/lib/machines"
import { getManualNav } from "@/lib/manual"
import { getAllWriteups } from "@/lib/writeups"

export default async function CybersecLanding() {
  const [writeups, manual, machineList] = await Promise.all([
    getAllWriteups(),
    getManualNav(),
    getMachines(),
  ])
  const machineStats = getMachineStats(machineList)
  const manualPages = manual.reduce((acc, s) => acc + s.pages.length, 0)

  return (
    <main>
      <CyberHero
        writeups={writeups.length}
        machines={machineStats}
        manualPages={manualPages}
      />

      <InkSection title="Secciones" revealContent={false}>
        <InkStagger className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3" step={90}>
          <LandingCard
            href="/cybersec/maquinas"
            icon={<Server className="size-[18px]" />}
            eyebrow="Roadmap"
            title="Máquinas"
            desc="El listado completo: resueltas y pendientes, con buscador por técnica, OS, dificultad y certificación."
            meta={`${machineStats.done}/${machineStats.total} resueltas`}
          />
          <LandingCard
            href="/cybersec/writeups"
            icon={<FileText className="size-[18px]" />}
            eyebrow="Resoluciones"
            title="Writeups"
            desc="Máquinas de Hack The Box resueltas paso a paso, filtrables por dificultad y técnica."
            meta={`${writeups.length} entradas`}
          />
          <LandingCard
            href="/cybersec/manual"
            icon={<BookOpen className="size-[18px]" />}
            eyebrow="Referencia"
            title="Manual"
            desc="Apuntes técnicos de referencia. Conceptos, protecciones y técnicas de explotación."
            meta={`${manual.length} ${manual.length === 1 ? "sección" : "secciones"}`}
          />
        </InkStagger>
      </InkSection>

      <InkSection title="Entorno">
        <Link
          href="https://github.com/bolado-dev/BoladoBSPWM"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-label="Ver repo"
          className="group flex flex-col gap-5 rounded-3xl border border-[var(--ink-line-strong)] bg-[var(--ink-surface)] p-6 transition-colors hover:bg-[var(--ink-surface-hi)] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--ink-line-strong)]">
              <Terminal className="size-[18px]" />
            </span>
            <div>
              <p className="text-[13px] text-[var(--ink-fg-dim)]">
                Mi entorno de hacking
              </p>
              <p className="mt-0.5 text-[15px] font-medium text-[var(--ink-fg-strong)]">
                BoladoBSPWM
              </p>
              <p className="mt-2 max-w-[62ch] text-[14px] leading-[1.6]">
                Setup de escritorio sobre BSPWM: Polybar, Rofi, Kitty y scripts
                propios para un entorno orientado a ciberseguridad.
              </p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--ink-line-strong)] px-3 py-1.5 text-[13px] text-[var(--ink-fg-dim)]">
            <GithubIcon className="size-3.5" />
            bolado-dev/BoladoBSPWM
            <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
        </Link>
      </InkSection>
    </main>
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
      data-cursor-label="Entrar"
      className="group flex flex-col justify-between rounded-3xl border border-[var(--ink-line-strong)] bg-[var(--ink-surface)] p-6 transition-colors hover:bg-[var(--ink-surface-hi)]"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-full border border-[var(--ink-line-strong)]">
            {icon}
          </span>
          <ArrowUpRight className="size-4 text-[var(--ink-fg-dim)] opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="mt-5 text-[13px] text-[var(--ink-fg-dim)]">{eyebrow}</p>
        <h2 className="font-display mt-1 text-2xl italic text-[var(--ink-fg-strong)]">
          {title}
        </h2>
        <p className="mt-2 text-[14px] leading-[1.6]">{desc}</p>
      </div>
      <p className="mt-8 text-[13px] text-[var(--ink-fg-dim)]">{meta}</p>
    </Link>
  )
}
