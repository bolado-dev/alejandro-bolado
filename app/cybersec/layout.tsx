import type { Metadata } from "next"
import { BottomBlur } from "@/components/bottom-blur"
import { InkRain } from "@/components/ink-rain"
import { CyberFooter } from "@/components/cybersec/cyber-footer"
import {
  CommandPalette,
  type PaletteItem,
} from "@/components/cybersec/command-palette"
import { getAllWriteups } from "@/lib/writeups"
import { getManualNav } from "@/lib/manual"
import { getMachines, getMachineStats } from "@/lib/machines"

export const metadata: Metadata = {
  title: {
    default: "Cybersec · Alejandro Bolado",
    template: "%s · Ciberseguridad",
  },
  description:
    "Writeups de Hack The Box y un manual técnico de ciberseguridad.",
}

export default async function CybersecLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [writeups, manual, machines] = await Promise.all([
    getAllWriteups(),
    getManualNav(),
    getMachines(),
  ])

  const items: PaletteItem[] = [
    {
      title: "Máquinas",
      href: "/cybersec/maquinas",
      kind: "machine" as const,
      sub: "Roadmap · resueltas y pendientes",
      keywords: "htb hack the box listado roadmap progreso",
    },
    ...machines.map((m) => ({
      title: m.name,
      href: m.done ? (m.writeup as string) : "/cybersec/maquinas",
      kind: "machine" as const,
      sub: `${m.os} · ${m.difficulty} · ${m.done ? "Hecha" : "Pendiente"}`,
      keywords: [m.ip, ...m.techniques, ...m.certs].join(" "),
    })),
    ...writeups.map((w) => ({
      title: w.title,
      href: `/cybersec/writeups/${w.slug}`,
      kind: "writeup" as const,
      sub: [w.category, w.difficulty].filter(Boolean).join(" · "),
      keywords: w.tags.join(" "),
    })),
    ...manual.flatMap((s) =>
      s.pages.map((p) => ({
        title: p.title,
        href: p.href,
        kind: "manual" as const,
        sub: `Manual · ${s.title}`,
        keywords: p.description,
      }))
    ),
  ]

  const machineStats = getMachineStats(machines)
  const manualPages = manual.reduce((acc, s) => acc + s.pages.length, 0)

  return (
    // Misma superficie que el portfolio: la paleta ink redefine también los
    // tokens de shadcn, así que los exploradores que hay debajo la adoptan
    // sin tocarles una clase.
    <div data-surface="ink" className="relative min-h-screen">
      <InkRain />
      <div className="relative z-10">
        {children}
        <CyberFooter
          writeupsCount={writeups.length}
          machineStats={machineStats}
          manualPages={manualPages}
        />
      </div>
      <CommandPalette items={items} />
      <BottomBlur size="md" strength={18} hideWithin={460} />
    </div>
  )
}
