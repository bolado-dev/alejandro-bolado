import type { Metadata } from "next"
import { CyberHeader } from "@/components/cybersec/cyber-header"
import {
  CommandPalette,
  type PaletteItem,
} from "@/components/cybersec/command-palette"
import { getAllWriteups } from "@/lib/writeups"
import { getManualNav } from "@/lib/manual"

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
  const [writeups, manual] = await Promise.all([getAllWriteups(), getManualNav()])

  const items: PaletteItem[] = [
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

  return (
    <div className="min-h-screen">
      <CyberHeader />
      {children}
      <CommandPalette items={items} />
    </div>
  )
}
