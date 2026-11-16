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
        <InkStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" step={90}>
          <LandingCard
            href="/cybersec/maquinas"
            icon={<Server className="size-5" />}
            eyebrow="Roadmap"
            title="Máquinas"
            desc="El listado completo: resueltas y pendientes, con buscador por técnica, OS, dificultad y certificación."
            meta={`${machineStats.done}/${machineStats.total} resueltas`}
          />
          <LandingCard
            href="/cybersec/writeups"
            icon={<FileText className="size-5" />}
            eyebrow="Resoluciones"
            title="Writeups"
            desc="Máquinas de Hack The Box resueltas paso a paso, filtrables por dificultad y técnica."
            meta={`${writeups.length} entradas`}
          />
          <LandingCard
            href="/cybersec/manual"
            icon={<BookOpen className="size-5" />}
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
          className="group flex flex-col gap-6 rounded-3xl border border-[var(--ink-line)] bg-[var(--ink-surface)] p-8 transition-colors hover:border-[var(--ink-accent)] hover:bg-[var(--ink-surface-hi)] sm:flex-row sm:items-center sm:justify-between sm:p-10"
        >
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--ink-line-strong)] text-[var(--ink-accent)]">
              <Terminal className="size-5" />
            </span>
            <div>
              <p className="text-[13px] text-[var(--ink-fg-dim)]">
                Mi entorno de hacking
              </p>
              <p className="mt-1 text-[1.25rem] font-medium text-[var(--ink-fg-strong)]">
                BoladoBSPWM
              </p>
              <p className="mt-3 max-w-[62ch] text-[16px] leading-[1.7]">
                Setup de escritorio sobre BSPWM: Polybar, Rofi, Kitty y scripts
                propios para un entorno orientado a ciberseguridad.
              </p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--ink-line-strong)] px-4 py-2 text-[13px] text-[var(--ink-fg-dim)]">
            <GithubIcon className="size-3.5" />
            bolado-dev/BoladoBSPWM
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
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
      className="group flex flex-col justify-between rounded-3xl border border-[var(--ink-line)] bg-[var(--ink-surface)] p-8 transition-colors hover:border-[var(--ink-accent)] hover:bg-[var(--ink-surface-hi)]"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="flex size-12 items-center justify-center rounded-2xl border border-[var(--ink-line-strong)] text-[var(--ink-accent)]">
            {icon}
          </span>
          <ArrowUpRight className="size-5 text-[var(--ink-fg-dim)] transition-colors group-hover:text-[var(--ink-accent)]" />
        </div>
        <p className="mt-8 text-[12px] font-medium tracking-[0.18em] text-[var(--ink-accent)] uppercase">
          {eyebrow}
        </p>
        <h2 className="font-display mt-2 text-[2rem] leading-tight italic text-[var(--ink-fg-strong)]">
          {title}
        </h2>
        <p className="mt-3 text-[15px] leading-[1.65]">{desc}</p>
      </div>
      <p className="mt-10 text-[14px] text-[var(--ink-fg-dim)]">{meta}</p>
    </Link>
  )
}
