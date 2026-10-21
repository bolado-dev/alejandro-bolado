import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { GithubIcon } from "@/components/icons/github-icon"
import { LinkedinIcon } from "@/components/icons/linkedin-icon"
import { Mail } from "@/components/icons/solar"
import { Button } from "@/components/ui/button"
import { PROFILE } from "@/lib/home-data"
import { getMachines, getMachineStats } from "@/lib/machines"
import { getAllWriteups } from "@/lib/writeups"
import { cn } from "@/lib/utils"

/* Indicador en vivo con halo pulsante. */
const tones = {
  success: { dot: "bg-emerald-500", halo: "bg-emerald-500/60" },
  warning: { dot: "bg-amber-500", halo: "bg-amber-500/60" },
  danger: { dot: "bg-red-500", halo: "bg-red-500/60" },
  neutral: { dot: "bg-foreground", halo: "bg-foreground/30" },
}

interface StatusDotProps extends React.ComponentProps<"span"> {
  tone?: keyof typeof tones
  pulse?: boolean
}

function StatusDot({
  tone = "success",
  pulse = true,
  className,
  ...props
}: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn("relative flex size-2 shrink-0", className)}
      {...props}
    >
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full motion-reduce:animate-none",
            tones[tone].halo,
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex size-full rounded-full",
          tones[tone].dot,
        )}
      />
    </span>
  )
}

const COLUMNS = [
  {
    title: "Portfolio",
    links: [
      { label: "Proyectos", href: "/#proyectos" },
      { label: "Sobre mí", href: "/#about" },
      { label: "Stack", href: "/#stack" },
      { label: "Archivo", href: "/#archivo" },
    ],
  },
  {
    title: "Cybersec",
    links: [
      { label: "Máquinas", href: "/cybersec/maquinas" },
      { label: "Writeups", href: "/cybersec/writeups" },
      { label: "Manual", href: "/cybersec/manual" },
    ],
  },
  {
    title: "Visuals",
    links: [
      { label: "Fotografía", href: "/visuals/fotografia" },
      { label: "Filmmaking", href: "/visuals/filmmaking" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "Correo", href: `mailto:${PROFILE.email}` },
      { label: "GitHub", href: PROFILE.github },
      { label: "LinkedIn", href: PROFILE.linkedin },
    ],
  },
]

const SOCIALS = [
  { name: "GitHub", href: PROFILE.github, Icon: GithubIcon },
  { name: "LinkedIn", href: PROFILE.linkedin, Icon: LinkedinIcon },
  { name: "Correo", href: `mailto:${PROFILE.email}`, Icon: Mail },
]

/**
 * Pie del sitio. El contenedor es el de 1008px de la superficie, no el
 * max-w-6xl de la plantilla, para que alinee con el resto de secciones.
 *
 * La cifra del indicador se lee de las mismas fuentes que el resto del sitio,
 * así que no se desincroniza.
 */
export async function SiteFooter({ wordmark = "bolado" }: { wordmark?: string }) {
  const [writeups, machineList] = await Promise.all([
    getAllWriteups(),
    getMachines(),
  ])
  const machines = getMachineStats(machineList)

  return (
    // Fondo opaco a propósito: el lienzo de la lluvia es fijo y queda detrás
    // de todo, y aquí hay mucha superficie vacía donde se notaba demasiado y
    // además enturbiaba el degradado del wordmark. El filete superior hace de
    // corte, así que la transición se lee como intencionada.
    <footer className="relative overflow-hidden border-t border-[var(--ink-line)] bg-[var(--ink-bg)]">
      <div className="mx-auto w-full max-w-[1008px] px-8 pt-16 sm:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="flex max-w-sm flex-col gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-semibold tracking-tight text-[var(--ink-fg-strong)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PROFILE.logo}
                alt=""
                aria-hidden
                className="h-5 w-auto object-contain"
              />
              {PROFILE.name}
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              {PROFILE.role}. {PROFILE.location}. Entre el código y la cámara,
              documentando el proceso por el camino.
            </p>
            {/* La plantilla traía un alta de newsletter. No hay nada detrás que
                reciba esos correos, así que en su lugar va la acción real. */}
            <Button asChild className="w-fit">
              <a href={`mailto:${PROFILE.email}`}>
                Hablemos
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>

          <nav
            aria-label="Pie de página"
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-medium text-[var(--ink-fg-strong)]">
                  {column.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => {
                    const external = link.href.startsWith("http")
                    return (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noreferrer" : undefined}
                          className="text-sm text-muted-foreground transition-colors hover:text-[var(--ink-fg-strong)]"
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 border-t border-[var(--ink-line)] py-8 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
            <span>
              © {new Date().getFullYear()} {PROFILE.name}
            </span>
            <Link
              href="/cybersec/writeups"
              className="inline-flex items-center gap-2 transition-colors hover:text-[var(--ink-fg-strong)]"
            >
              <StatusDot />
              {writeups.length} writeups · {machines.done} máquinas resueltas
            </Link>
          </div>
          <div className="flex items-center gap-1">
            {SOCIALS.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                aria-label={name}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-[var(--ink-fg-strong)]"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none mx-auto w-full max-w-[1008px] px-8 select-none"
      >
        <p className="-mb-[0.22em] bg-gradient-to-b from-foreground/15 to-transparent bg-clip-text text-center text-[clamp(5rem,22vw,16rem)] leading-none font-semibold tracking-tighter text-transparent">
          {wordmark}
        </p>
      </div>
    </footer>
  )
}
