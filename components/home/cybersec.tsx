import Link from "next/link"

import { ArrowUpRight, BookOpen, FileText, Server } from "@/components/icons/solar"
import { InkSection } from "@/components/ink"
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
        className="group flex items-start justify-between gap-6 rounded-3xl border border-[var(--ink-line-strong)] bg-[var(--ink-surface)] p-6 transition-colors hover:bg-[var(--ink-surface-hi)]"
      >
        <div>
          <p className="font-display text-2xl italic text-[var(--ink-fg-strong)]">
            Del recon a root
          </p>
          <p className="mt-2 max-w-[62ch] text-[14px] leading-[1.6]">
            Una sección entera dedicada a seguridad ofensiva: máquinas de Hack
            The Box resueltas paso a paso y un manual técnico propio, de
            reconocimiento a Active Directory y binary exploitation.
          </p>
        </div>
        <ArrowUpRight className="size-5 shrink-0 text-[var(--ink-fg-dim)] opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map(({ href, icon: Icon, title, meta }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-3xl border border-[var(--ink-line-strong)] px-5 py-4 transition-colors hover:bg-[var(--ink-surface)]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--ink-line-strong)]">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-medium text-[var(--ink-fg-strong)]">
                {title}
              </span>
              <span className="block text-[13px] text-[var(--ink-fg-dim)]">
                {meta}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </InkSection>
  )
}
