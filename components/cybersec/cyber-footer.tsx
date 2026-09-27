import Link from "next/link"
import { Mail } from "@/components/icons/solar"
import { GithubIcon } from "@/components/icons/github-icon"
import { LinkedinIcon } from "@/components/icons/linkedin-icon"
import type { MachineStats } from "@/lib/machines"

const EMAIL = "a.bolado.dev@gmail.com"

const EXPLORE_LINKS = [
  { label: "Máquinas", href: "/cybersec/maquinas" },
  { label: "Writeups", href: "/cybersec/writeups" },
  { label: "Manual", href: "/cybersec/manual" },
]

const CONNECT_LINKS = [
  { label: "GitHub", href: "https://github.com/bolado-dev", Icon: GithubIcon },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/alejandrobolado",
    Icon: LinkedinIcon,
  },
  { label: "Email", href: `mailto:${EMAIL}`, Icon: Mail },
]

const PORTFOLIO_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Sobre mí", href: "/#about" },
  { label: "Visuals", href: "/visuals" },
]

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-4 text-[11px] uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <ul className="flex flex-col gap-2.5 text-sm">{children}</ul>
    </div>
  )
}

export function CyberFooter({
  writeupsCount,
  machineStats,
  manualPages,
}: {
  writeupsCount: number
  machineStats: MachineStats
  manualPages: number
}) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div>
            <span className="text-sm font-semibold tracking-tight">
              Cybersec
            </span>
            <p className="mt-4 max-w-[20ch] text-sm text-muted-foreground">
              Hacking ético, writeups de Hack The Box y un manual técnico de
              referencia.
            </p>
          </div>

          <FooterColumn title="Explorar">
            {EXPLORE_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Conecta">
            {CONNECT_LINKS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </a>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Portfolio">
            {PORTFOLIO_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
        </div>

        {/* Franja de diagnostics: mismos datos reales del hero */}
        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-2 border-t pt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>Writeups {writeupsCount}</span>
          <span>
            Máquinas {machineStats.done}/{machineStats.total}
          </span>
          <span>Manual {manualPages} páginas</span>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Alejandro Bolado</span>
          <Link
            href="/"
            className="transition-colors hover:text-foreground"
          >
            Volver al portfolio
          </Link>
        </div>
      </div>
    </footer>
  )
}
