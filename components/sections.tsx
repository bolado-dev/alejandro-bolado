"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  Camera,
  Code2,
  Film,
  Globe,
  Mail,
  MapPin,
  Radar,
  Send,
  ShieldAlert,
  Smartphone,
  Target,
  Terminal,
} from "@/components/icons/solar"
import {
  SiLinux,
  SiKalilinux,
  SiGnubash,
  SiPython,
  SiGit,
  SiDocker,
  SiWireshark,
  SiHackthebox,
  SiTryhackme,
  SiBurpsuite,
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiNodedotjs,
  SiTailwindcss,
  SiPostgresql,
  SiDavinciresolve,
} from "@icons-pack/react-simple-icons"

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
import { useGsap } from "@/hooks/use-gsap"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type IconProps = { className?: string; style?: React.CSSProperties }
type IconCmp = React.ComponentType<IconProps>

// ─── ABOUT ────────────────────────────────────────────────────────────────────

export function About() {
  const imgRef = useRef<HTMLDivElement>(null)

  useGsap(() => {
    const el = imgRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { clipPath: "inset(0 100% 0 0)", scale: 1.1 },
      {
        clipPath: "inset(0 0% 0 0)",
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      },
    )
  }, [])

  return (
    <section id="about" className="border-b px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <SectionLabel>Sobre mí</SectionLabel>

        <div className="grid items-start gap-10 md:grid-cols-[260px_1fr] md:gap-14">
          <div className="relative w-48 md:w-full">
            <div
              ref={imgRef}
              className="relative aspect-square overflow-hidden rounded-2xl bg-muted"
            >
              <Image
                src="/alejandro.webp"
                alt="Alejandro Bolado"
                fill
                sizes="(min-width: 768px) 260px, 192px"
                className="object-cover"
              />
            </div>
            <Reveal delay={0.4} y={8}>
              <span className="absolute -right-2 -bottom-2 flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="bg-brand absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                  <span className="bg-brand relative inline-flex h-1.5 w-1.5 rounded-full" />
                </span>
                Disponible
              </span>
            </Reveal>
          </div>

          <div>
            <SplitText
              as="h2"
              stagger={0.05}
              duration={0.9}
              className="text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.95] tracking-tight"
            >
              Entre el código y la cámara
            </SplitText>
            <Reveal delay={0.15} y={12}>
              <p className="mt-4 mb-7 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Cantabria, España
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="text-[17px] leading-[1.8] text-muted-foreground">
                Soy <span className="text-foreground">Alejandro Bolado</span>, un
                perfil técnico-creativo. Desarrollo aplicaciones web
                full-stack y me apasiona la{" "}
                <span className="text-brand">seguridad ofensiva</span>:
                pentesting, hacking ético y retos CTF que documento en{" "}
                <a
                  href="/cybersec"
                  className="decoration-brand text-foreground underline underline-offset-4 hover:text-brand"
                >
                  writeups y un manual técnico
                </a>
                . Fuera de la terminal, cuento historias con la cámara: la{" "}
                <a
                  href="#photography"
                  className="decoration-brand text-foreground underline underline-offset-4 hover:text-brand"
                >
                  fotografía
                </a>{" "}
                y el{" "}
                <a
                  href="#filmmaking"
                  className="decoration-brand text-foreground underline underline-offset-4 hover:text-brand"
                >
                  filmmaking
                </a>{" "}
                son la otra mitad de lo que hago.
              </p>
            </Reveal>

            <StaggerReveal
              className="mt-10 flex flex-col gap-y-6 border-t pt-8 sm:flex-row sm:flex-wrap sm:gap-x-12"
              selector="[data-fact]"
              stagger={0.1}
              y={16}
            >
              {[
                { k: "Disciplinas", v: "Web · Seguridad · Imagen" },
                { k: "Enfoque", v: "Detalle y oficio" },
                { k: "Ahora mismo", v: "Aprendiendo y creando" },
              ].map((f) => (
                <div key={f.k} data-fact>
                  <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
                    {f.k}
                  </p>
                  <p className="mt-1.5 text-[15px] font-medium tracking-tight">
                    {f.v}
                  </p>
                </div>
              ))}
            </StaggerReveal>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────

type Skill = { name: string; Icon: IconCmp }

// Técnicas reales extraídas de los writeups (HTB), agrupadas por área.
const areas: { label: string; Icon: IconCmp; items: string[] }[] = [
  {
    label: "Desarrollo web",
    Icon: Code2,
    items: [
      "React & Next.js",
      "TypeScript",
      "Node.js & APIs REST",
      "PostgreSQL",
      "Tailwind CSS",
      "Docker & despliegue",
    ],
  },
  {
    label: "Explotación web",
    Icon: Globe,
    items: [
      "SQLi & PostgreSQL RCE",
      "LFI / RFI → RCE",
      "SSTI",
      "XXE · SSRF",
      "Directory Traversal",
      "Information Leakage",
    ],
  },
  {
    label: "Post-explotación",
    Icon: ShieldAlert,
    items: [
      "Escalada Linux (sudo, PATH hijacking)",
      "Escalada Windows (SeImpersonate, PrintNightmare)",
      "Active Directory (BloodHound, RBCD)",
      "Port forwarding & pivoting",
    ],
  },
  {
    label: "Enumeración & redes",
    Icon: Radar,
    items: [
      "Nmap & fuzzing web",
      "SMB · NFS · SNMP",
      "VHOST & subdominios",
      "Enumeración de CMS",
    ],
  },
  {
    label: "Fotografía & vídeo",
    Icon: Camera,
    items: [
      "Composición & luz",
      "Retrato · calle · paisaje",
      "Edición y color grading",
      "Montaje y ritmo",
    ],
  },
]

const tools: Skill[] = [
  // Desarrollo
  { name: "React", Icon: SiReact },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Node.js", Icon: SiNodedotjs },
  { name: "Tailwind CSS", Icon: SiTailwindcss },
  { name: "PostgreSQL", Icon: SiPostgresql },
  // Ciberseguridad
  { name: "Linux", Icon: SiLinux },
  { name: "Kali Linux", Icon: SiKalilinux },
  { name: "Bash", Icon: SiGnubash },
  { name: "Python", Icon: SiPython },
  { name: "Burp Suite", Icon: SiBurpsuite },
  { name: "Wireshark", Icon: SiWireshark },
  { name: "Git", Icon: SiGit },
  { name: "Docker", Icon: SiDocker },
  { name: "Hack The Box", Icon: SiHackthebox },
  { name: "TryHackMe", Icon: SiTryhackme },
  // Fotografía & vídeo
  { name: "DaVinci Resolve", Icon: SiDavinciresolve },
  { name: "Lightroom", Icon: Camera },
  { name: "Premiere Pro", Icon: Film },
]

function SkillChip({ skill }: { skill: Skill }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:text-foreground hover:shadow-sm">
      <skill.Icon className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:text-brand" />
      <span className="text-[15px] font-medium">{skill.name}</span>
    </div>
  )
}

export function Skills() {
  return (
    <section id="skills" className="border-b px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <SectionLabel>Habilidades</SectionLabel>

        <StaggerReveal
          className="grid gap-x-12 gap-y-12 sm:grid-cols-3"
          selector="[data-area]"
          stagger={0.12}
          y={24}
        >
          {areas.map((area) => (
            <div key={area.label} data-area>
              <div className="mb-4 flex items-center gap-2">
                <area.Icon className="h-[18px] w-[18px] text-muted-foreground" />
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {area.label}
                </p>
              </div>
              <ul className="flex flex-col gap-2.5">
                {area.items.map((it) => (
                  <li
                    key={it}
                    className="flex items-start gap-2.5 text-[15px] leading-snug text-muted-foreground"
                  >
                    <span className="bg-brand/60 mt-[7px] h-1 w-1 flex-shrink-0 rounded-full" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </StaggerReveal>

        <div className="mt-16 border-t pt-10">
          <p className="mb-5 text-[11px] uppercase tracking-widest text-muted-foreground">
            Herramientas
          </p>
          <StaggerReveal
            className="flex flex-wrap gap-2.5"
            selector="[data-tool]"
            stagger={0.05}
            y={14}
          >
            {tools.map((skill) => (
              <div key={skill.name} data-tool>
                <SkillChip skill={skill} />
              </div>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  )
}

// ─── EXPERIENCIA PRÁCTICA ─────────────────────────────────────────────────────

const experience: {
  period: string
  title: string
  sub: string
  description: string
  Icon: IconCmp
}[] = [
  {
    period: "2025 — Hoy",
    title: "Hack The Box",
    sub: "Pentesting práctico",
    description:
      "Resolución de 42+ máquinas (Linux, Windows y Active Directory) documentando cada explotación, post-explotación y escalada de privilegios en writeups detallados.",
    Icon: SiHackthebox,
  },
  {
    period: "2025 — Hoy",
    title: "TryHackMe",
    sub: "Paths & fundamentos",
    description:
      "Recorrido de rutas de seguridad ofensiva, redes y fundamentos de sistemas mediante laboratorios guiados y retos prácticos.",
    Icon: SiTryhackme,
  },
  {
    period: "2024 — Hoy",
    title: "Investigación autodidacta",
    sub: "Scripting & documentación",
    description:
      "Estudio de técnicas de explotación, automatización con Python y Bash, y redacción de un manual técnico propio estilo HackTricks.",
    Icon: Terminal,
  },
]

function TimelineRow({
  item,
  isLast,
}: {
  item: (typeof experience)[number]
  isLast: boolean
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  useGsap(() => {
    const el = rowRef.current
    if (!el) return
    const dot = el.querySelector<HTMLElement>("[data-dot]")
    const content = el.querySelector<HTMLElement>("[data-content]")
    const period = el.querySelector<HTMLElement>("[data-period]")

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 82%" },
      defaults: { ease: "power3.out" },
    })
    if (dot) tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)" }, 0)
    if (period) tl.fromTo(period, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.7 }, 0.05)
    if (content)
      tl.fromTo(
        content,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.12,
      )
  }, [])

  return (
    <div
      ref={rowRef}
      className={cn(
        "relative grid grid-cols-[120px_1fr] gap-8 pl-8",
        !isLast && "pb-12",
      )}
    >
      {/* línea vertical */}
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[3px] top-3 h-full w-px bg-border"
        />
      )}
      <span
        data-dot
        aria-hidden
        className="bg-brand absolute left-0 top-2 h-[7px] w-[7px] rounded-full ring-4 ring-background"
      />
      <p data-period className="pt-1 text-sm text-muted-foreground">
        {item.period}
      </p>
      <div data-content>
        <div className="flex items-center gap-2.5">
          <item.Icon className="h-5 w-5" />
          <h3 className="text-lg font-medium tracking-tight">{item.title}</h3>
        </div>
        <p className="mt-1 text-[13px] uppercase tracking-widest text-muted-foreground">
          {item.sub}
        </p>
        <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
          {item.description}
        </p>
      </div>
    </div>
  )
}

export function Experience() {
  return (
    <section id="experience" className="border-b px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <SectionLabel>Trabajo &amp; práctica</SectionLabel>
        <div className="relative">
          {experience.map((item, i) => (
            <TimelineRow
              key={item.title}
              item={item}
              isLast={i === experience.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── EDUCATION + OBJETIVOS ────────────────────────────────────────────────────

const educationItems = [
  {
    title: "ASIR — Administración de Sistemas en Red",
    sub: "Formación profesional · en curso",
    description: "Sistemas, redes, servidores y administración Linux/Windows.",
  },
  {
    title: "Ciberseguridad autodidacta",
    sub: "Hack The Box · TryHackMe",
    description:
      "Pentesting, explotación web, Active Directory y scripting en Python.",
  },
]

const objectives = [
  {
    title: "eJPT",
    sub: "eLearnSecurity Junior Penetration Tester",
    description: "Certificación práctica de pentesting de nivel inicial.",
  },
  {
    title: "OSCP",
    sub: "Offensive Security Certified Professional",
    description: "El objetivo a medio plazo: explotación manual y reporte.",
  },
]

function EduItem({
  item,
  fromLeft,
  Icon,
}: {
  item: { title: string; sub: string; description?: string }
  fromLeft?: boolean
  Icon: IconCmp
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGsap(() => {
    const el = ref.current
    if (!el) return
    const accent = el.querySelector<HTMLElement>("[data-accent]")
    const title = el.querySelector<HTMLElement>("[data-eu-title]")
    const sub = el.querySelector<HTMLElement>("[data-eu-sub]")
    const desc = el.querySelector<HTMLElement>("[data-eu-desc]")

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 85%" },
      defaults: { ease: "power3.out" },
    })

    tl.fromTo(el, { opacity: 0, x: fromLeft ? -32 : 32 }, { opacity: 1, x: 0, duration: 0.9 })
    if (accent)
      tl.fromTo(
        accent,
        { scaleY: 0, transformOrigin: "top center" },
        { scaleY: 1, duration: 0.7, ease: "power4.out" },
        0.15,
      )
    if (title) tl.fromTo(title, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, 0.2)
    if (sub) tl.fromTo(sub, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 }, 0.32)
    if (desc)
      tl.fromTo(
        desc,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.42,
      )

    const enter = () => gsap.to(accent, { height: "100%", duration: 0.4, ease: "power2.out" })
    const leave = () => gsap.to(accent, { height: "60%", duration: 0.4, ease: "power2.out" })
    el.addEventListener("mouseenter", enter)
    el.addEventListener("mouseleave", leave)
    return () => {
      el.removeEventListener("mouseenter", enter)
      el.removeEventListener("mouseleave", leave)
    }
  }, [fromLeft])

  return (
    <div ref={ref} className="group relative pl-5">
      <span
        data-accent
        aria-hidden
        className="bg-brand absolute left-0 top-0 block h-[60%] w-px"
      />
      <div data-eu-title className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-base font-medium tracking-tight transition-transform group-hover:translate-x-0.5">
          {item.title}
        </h3>
      </div>
      <p data-eu-sub className="mt-1 text-[13px] text-muted-foreground">
        {item.sub}
      </p>
      {item.description && (
        <p data-eu-desc className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      )}
    </div>
  )
}

export function Education() {
  return (
    <section id="education" className="border-b px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <SectionLabel>Formación</SectionLabel>
            <div className="flex flex-col gap-12">
              {educationItems.map((item) => (
                <EduItem key={item.title} item={item} Icon={SiLinux} fromLeft />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Objetivos</SectionLabel>
            <div className="flex flex-col gap-12">
              {objectives.map((item) => (
                <EduItem key={item.title} item={item} Icon={Target} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

type Project = {
  title: string
  category: string
  description: string
  Icon: IconCmp
  href?: string
  repoLabel?: string
  comingSoon?: boolean
  /** Logo de marca en public/, p.ej. "/projects/spotted/logo.webp" */
  logo?: string
  /** El logo llena el tile (icono de app autónomo) en lugar de ir contenido */
  logoFill?: boolean
  /** Color de acento de la marca (hex/oklch) para el icono y los detalles */
  accent?: string
}

const projects: Project[] = [
  {
    title: "Spotted",
    category: "App móvil · React Native",
    description:
      "App para amantes del motor: fotografía los coches que te encuentras (los “spotteas”), guárdalos en tu garaje y descúbrelos en un mapa por ubicación.",
    Icon: Smartphone,
    href: "https://spotted.es",
    logo: "/projects/spotted/logo.webp",
    logoFill: true,
  },
  {
    title: "BoladoBSPWM",
    category: "Entorno / Dotfiles",
    description:
      "Setup personalizado de escritorio sobre BSPWM orientado a hacking y desarrollo. Incluye Polybar, Rofi, Kitty, Picom y scripts propios para un entorno enfocado en ciberseguridad.",
    Icon: Terminal,
    href: "https://github.com/bolado-dev/BoladoBSPWM",
    repoLabel: "bolado-dev/BoladoBSPWM",
  },
]

function ProjectRow({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const { Icon } = project

  const inner = (
    <>
      <p className="text-sm text-muted-foreground tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </p>

      <span
        className={cn(
          "mt-1 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background text-muted-foreground transition-colors group-hover:border-brand/40 group-hover:text-brand",
          project.logoFill && "border-transparent",
        )}
        style={project.accent ? { color: project.accent } : undefined}
      >
        {project.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.logo}
            alt={project.title}
            className={cn(
              project.logoFill
                ? "h-full w-full object-cover"
                : "h-6 w-6 object-contain",
            )}
            onError={(e) => {
              // Si aún no hay logo, mostramos el icono de respaldo.
              e.currentTarget.style.display = "none"
              e.currentTarget.nextElementSibling?.classList.remove("hidden")
            }}
          />
        ) : null}
        <Icon className={cn("h-5 w-5", project.logo && "hidden")} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-medium leading-tight tracking-tight transition-transform group-hover:translate-x-1">
            {project.title}
          </h3>
          <div className="flex items-center gap-2.5">
            <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
              {project.category}
            </p>
            {project.comingSoon && (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] tracking-widest text-muted-foreground uppercase">
                <span className="bg-brand h-1.5 w-1.5 rounded-full" />
                Próximamente
              </span>
            )}
            {project.href && (
              <ArrowUpRight className="text-brand h-4 w-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            )}
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-[16px] leading-[1.7] text-muted-foreground">
          {project.description}
        </p>
        {project.repoLabel && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <GithubIcon className="h-4 w-4" />
            <span>{project.repoLabel}</span>
          </div>
        )}
      </div>
    </>
  )

  const base =
    "group flex items-start gap-5 border-t py-8 transition-colors first:border-t-0 md:gap-8"

  if (project.href) {
    return (
      <Link
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, "hover:bg-muted/40 -mx-4 px-4")}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div className={cn(base, "cursor-default")} aria-disabled>
      {inner}
    </div>
  )
}

export function Projects() {
  return (
    <section id="projects" className="border-b px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <SectionLabel>Proyectos</SectionLabel>
        <StaggerReveal selector="[data-project]" stagger={0.1} y={24}>
          {projects.map((project, i) => (
            <div key={project.title} data-project>
              <ProjectRow project={project} index={i} />
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
                <Button className="bg-brand text-brand-foreground hover:bg-brand/85 w-full gap-2">
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
