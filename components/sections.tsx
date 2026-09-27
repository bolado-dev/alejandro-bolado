"use client"

import Link from "next/link"
import { ArrowUpRight, Mail, Send } from "@/components/icons/solar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { SplitText } from "@/components/animated/split-text"
import { Magnetic } from "@/components/animated/magnetic"
import { SectionLabel } from "@/components/section-label"
import { GithubIcon } from "@/components/icons/github-icon"
import { LinkedinIcon } from "@/components/icons/linkedin-icon"
import { cn } from "@/lib/utils"

type IconProps = { className?: string; style?: React.CSSProperties }
type IconCmp = React.ComponentType<IconProps>

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

type Project = {
  title: string
  category: string
  description: string
  href?: string
  repoLabel?: string
  comingSoon?: boolean
  /** Captura/preview grande para la parte superior de la tarjeta. */
  image?: string
}

const projects: Project[] = [
  {
    title: "Spotted",
    category: "App móvil · React Native",
    description:
      "App para amantes del motor: fotografía los coches que te encuentras (los “spotteas”), guárdalos en tu garaje y descúbrelos en un mapa por ubicación.",
    href: "https://spotted.es",
    image: "/projects/spotted/screenshot.webp",
  },
  {
    title: "BoladoBSPWM",
    category: "Entorno / Dotfiles",
    description:
      "Setup personalizado de escritorio sobre BSPWM orientado a hacking y desarrollo. Incluye Polybar, Rofi, Kitty, Picom y scripts propios para un entorno enfocado en ciberseguridad.",
    href: "https://github.com/bolado-dev/BoladoBSPWM",
    repoLabel: "bolado-dev/BoladoBSPWM",
  },
]

function TerminalPreview() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2.5 bg-[#0a0a0a] px-6 font-mono text-[13px]">
      <p className="text-zinc-400">
        <span className="text-emerald-400">➜</span>{" "}
        <span className="text-sky-400">~/dotfiles</span>{" "}
        <span className="text-zinc-600">git:(main)</span>
      </p>
      <p className="text-zinc-500">$ ./install.sh --bspwm</p>
      <p className="text-zinc-500">
        <span className="text-emerald-400">✓</span> polybar{"  "}
        <span className="text-emerald-400">✓</span> rofi{"  "}
        <span className="text-emerald-400">✓</span> kitty{"  "}
        <span className="text-emerald-400">✓</span> picom
      </p>
      <p className="text-zinc-400">
        <span className="text-emerald-400">➜</span>{" "}
        <span className="text-sky-400">~/dotfiles</span>{" "}
        <span className="animate-pulse text-zinc-500">▍</span>
      </p>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const content = (
    <>
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <TerminalPreview />
        )}
        {project.comingSoon && (
          <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] tracking-widest text-white uppercase backdrop-blur">
            <span className="bg-brand h-1.5 w-1.5 rounded-full" />
            Próximamente
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-1">
            {project.title}
          </h3>
          {project.href && (
            <ArrowUpRight className="text-brand h-4 w-4 shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          )}
        </div>
        <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
          {project.category}
        </p>
        <p className="text-[15px] leading-[1.7] text-muted-foreground">
          {project.description}
        </p>
        {project.repoLabel && (
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <GithubIcon className="h-4 w-4" />
            <span>{project.repoLabel}</span>
          </div>
        )}
      </div>
    </>
  )

  const base =
    "group flex h-full flex-col overflow-hidden rounded-3xl border bg-card transition-colors hover:border-brand/40"

  if (project.href) {
    return (
      <Link
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor-label="Ver proyecto"
        className={base}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={cn(base, "cursor-default")} aria-disabled>
      {content}
    </div>
  )
}

export function Projects() {
  return (
    <section id="projects" className="px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-5xl">
        <SectionLabel>Proyectos</SectionLabel>
        <StaggerReveal
          selector="[data-project]"
          className="grid gap-6 sm:grid-cols-2"
          stagger={0.12}
          y={24}
        >
          {projects.map((project) => (
            <div key={project.title} data-project>
              <ProjectCard project={project} />
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────

const contactLinks: { Icon: IconCmp; label: string; href: string }[] = [
  {
    Icon: Mail,
    label: "a.bolado.dev@gmail.com",
    href: "mailto:a.bolado.dev@gmail.com",
  },
  {
    Icon: GithubIcon,
    label: "github.com/bolado-dev",
    href: "https://github.com/bolado-dev",
  },
  {
    Icon: LinkedinIcon,
    label: "linkedin.com/in/alejandrobolado",
    href: "https://linkedin.com/in/alejandrobolado",
  },
]

export function Contact() {
  return (
    <section id="contact" className="px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <SectionLabel>Contacto</SectionLabel>
        <div className="grid gap-16 md:grid-cols-2 md:items-start">
          <div>
            <SplitText
              as="h2"
              stagger={0.05}
              duration={1}
              className="mb-4 text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[0.98] tracking-tight"
            >
              ¿Hablamos de seguridad?
            </SplitText>
            <Reveal delay={0.2}>
              <p className="text-[17px] leading-[1.7] text-muted-foreground">
                Abierto a aprender, recibir consejos y participar en iniciativas
                de ciberseguridad. Escríbeme y hablamos.
              </p>
            </Reveal>
            <StaggerReveal
              className="mt-8 flex flex-col gap-3.5"
              selector="[data-link]"
              stagger={0.08}
              y={14}
            >
              {contactLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  data-link
                  href={href}
                  className="group hover:text-brand inline-flex items-center gap-2.5 text-[15px] text-muted-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <ArrowUpRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </a>
              ))}
            </StaggerReveal>
          </div>
          <StaggerReveal
            className="flex flex-col gap-5"
            selector="[data-field]"
            stagger={0.08}
            y={18}
          >
            <div data-field className="flex flex-col gap-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Nombre
              </Label>
              <Input placeholder="Tu nombre" />
            </div>
            <div data-field className="flex flex-col gap-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Email
              </Label>
              <Input type="email" placeholder="tu@email.com" />
            </div>
            <div data-field className="flex flex-col gap-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Mensaje
              </Label>
              <Textarea placeholder="¿En qué puedo ayudarte?" rows={4} />
            </div>
            <div data-field>
              <Magnetic strength={0.2} className="w-full">
                <Button
                  data-cursor-label="Enviar"
                  className="bg-brand text-brand-foreground hover:bg-brand/85 w-full gap-2"
                >
                  Enviar mensaje
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </Magnetic>
            </div>
          </StaggerReveal>
        </div>
      </div>
    </section>
  )
}
