import Link from "next/link"

import { GithubIcon } from "@/components/icons/github-icon"
import { LinkedinIcon } from "@/components/icons/linkedin-icon"
import { ArrowLeft, Mail } from "@/components/icons/solar"
import { InkContainer, InkDivider } from "@/components/ink"
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer"
import { fontMono, fontUi } from "@/lib/fonts"
import { PROFILE } from "@/lib/home-data"
import type { MachineStats } from "@/lib/machines"

const CONNECT = [
  { label: "GitHub", href: PROFILE.github, Icon: GithubIcon },
  { label: "LinkedIn", href: PROFILE.linkedin, Icon: LinkedinIcon },
  { label: "Correo", href: `mailto:${PROFILE.email}`, Icon: Mail },
]

/**
 * Pie de la sección: franja de cifras, bloque de contacto y el mismo footer
 * halftone del portfolio, aquí con el wordmark "cybersec".
 */
export function CyberFooter({
  writeupsCount,
  machineStats,
  manualPages,
}: {
  writeupsCount: number
  machineStats: MachineStats
  manualPages: number
}) {
  return (
    <>
      <InkDivider />
      <InkContainer className="py-5">
        <div className="flex flex-wrap gap-x-10 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-fg-dim)]">
          <span>Writeups {writeupsCount}</span>
          <span>
            Máquinas {machineStats.done}/{machineStats.total}
          </span>
          <span>Manual {manualPages} páginas</span>
        </div>
      </InkContainer>

      <InkDivider />
      <InkContainer className="py-12">
        <h2 className="font-display text-xl italic">Conectemos</h2>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {CONNECT.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center gap-2 rounded-full border border-[var(--ink-line-strong)] px-3 py-2 text-[14px] transition-colors hover:bg-[var(--ink-surface-hi)] hover:text-[var(--ink-fg-strong)]"
            >
              <Icon className="size-4" /> {label}
            </a>
          ))}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-[var(--ink-line-strong)] px-3 py-2 text-[14px] transition-colors hover:bg-[var(--ink-surface-hi)] hover:text-[var(--ink-fg-strong)]"
          >
            <ArrowLeft className="size-4" /> Portfolio
          </Link>
        </div>
      </InkContainer>

      <InkDivider />
      {/* Las familias van por nombre real y no por var(--font-ui): el canvas
          del wordmark no resuelve variables CSS en ctx.font. */}
      <div className="ink-rail mx-auto w-full max-w-[1008px] px-8">
        <HalftoneWordmarkFooter
          className="hwf-inset"
          wordmark="cybersec"
          label="Cybersec · Alejandro Bolado"
          meta={`©${new Date().getFullYear()} · ${PROFILE.location}`}
          columns={[]}
          palette={{ background: "#0a0a0a", ink: "#d1d5dc", warm: "#ffffff" }}
          crop={-0.08}
          fontFamily={fontUi.style.fontFamily}
          monoFamily={fontMono.style.fontFamily}
          height="420px"
        />
      </div>
    </>
  )
}
