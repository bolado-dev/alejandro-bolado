import Link from "next/link"

import { ArrowUpRight, BookOpen, FileText, Server } from "@/components/icons/solar"
import { InkSection } from "@/components/ink"
import { InkStagger } from "@/components/ink-reveal"
import { getMachines, getMachineStats } from "@/lib/machines"
import { getManualNav } from "@/lib/manual"
import { getAllWriteups } from "@/lib/writeups"

/**
 * Puerta de entrada a /cybersec desde el portfolio. Las cifras salen de las
 * mismas fuentes que la propia sección, así que no se desincronizan.
 */
export async function Cybersec() {
  const [writeups, manual, machineList] = await Promise.all([
    getAllWriteups(),
    getManualNav(),
    getMachines(),
  ])
  const machines = getMachineStats(machineList)
  const manualPages = manual.reduce((acc, s) => acc + s.pages.length, 0)

  const tiles = [
    {
      href: "/cybersec/maquinas",
      icon: Server,
      title: "Máquinas",
      meta: `${machines.done}/${machines.total} resueltas`,
    },
    {
      href: "/cybersec/writeups",
      icon: FileText,
      title: "Writeups",
      meta: `${writeups.length} entradas`,
    },
    {
      href: "/cybersec/manual",
      icon: BookOpen,
      title: "Manual",
      meta: `${manualPages} páginas`,
    },
  ]

  return (
    <InkSection eyebrow="Seguridad ofensiva" title="Cybersec">
      <Link
        href="/cybersec"
        data-cursor-label="Entrar"
        className="group flex items-start justify-between gap-8 rounded-3xl border border-[var(--ink-line)] bg-[var(--ink-surface)] p-8 transition-colors hover:border-[var(--ink-accent)] hover:bg-[var(--ink-surface-hi)] sm:p-12"
      >
        <div>
          <p className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight italic text-[var(--ink-fg-strong)]">
            Del recon a root
          </p>
          <p className="mt-4 max-w-[62ch] text-[16px] leading-[1.7]">
            Una sección entera dedicada a seguridad ofensiva: máquinas de Hack
            The Box resueltas paso a paso y un manual técnico propio, de
            reconocimiento a Active Directory y binary exploitation.
          </p>
        </div>
        <ArrowUpRight className="size-6 shrink-0 text-[var(--ink-fg-dim)] transition-colors group-hover:text-[var(--ink-accent)]" />
      </Link>

      <InkStagger className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3" delay={120}>
        {tiles.map(({ href, icon: Icon, title, meta }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-3xl border border-[var(--ink-line)] px-6 py-6 transition-colors hover:border-[var(--ink-accent)] hover:bg-[var(--ink-surface)]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--ink-line-strong)] text-[var(--ink-accent)]">
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[1.05rem] font-medium text-[var(--ink-fg-strong)]">
                {title}
              </span>
              <span className="block text-[13px] text-[var(--ink-fg-dim)]">
                {meta}
              </span>
            </span>
          </Link>
        ))}
      </InkStagger>
    </InkSection>
  )
}
