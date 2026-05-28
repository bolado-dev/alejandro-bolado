"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Send,
} from "lucide-react"
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiNodedotjs,
  SiPython,
  SiPostgresql,
  SiGit,
  SiVercel,
  SiRedis,
} from "@icons-pack/react-simple-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { SplitText } from "@/components/animated/split-text"
import { Magnetic } from "@/components/animated/magnetic"
import { Counter } from "@/components/animated/counter"
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
    <section id="about" className="border-b px-4 py-24">
      <div className="container mx-auto max-w-3xl">
        <SectionLabel>Sobre mí</SectionLabel>

        <div className="grid grid-cols-[120px_1fr] items-start gap-10">
          <div className="relative">
            <div
              ref={imgRef}
              className="relative flex h-[120px] w-[120px] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted"
            >
              <img
                src="/alejandro.png"
                alt="Alejandro Bolado"
                className="h-full w-full object-cover"
              />
            </div>
            <Reveal delay={0.4} y={8}>
              <span className="absolute -bottom-2 -right-2 flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm ring-1 ring-border">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Disponible
              </span>
            </Reveal>
          </div>

          <div>
            <SplitText
              as="h1"
              stagger={0.05}
              duration={0.9}
              className="mb-1 text-3xl font-medium tracking-tight"
            >
              Alejandro Bolado
            </SplitText>
            <Reveal delay={0.15} y={12}>
              <p className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Full Stack Developer, Madrid
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="text-[15px] leading-[1.75] text-muted-foreground">
                Desarrollo aplicaciones web modernas con énfasis en arquitectura
                limpia y experiencias de usuario precisas. Me especializo en el
                stack React/Next.js con TypeScript y en construir productos SaaS
                escalables desde cero.
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <p className="mt-4 text-[15px] leading-[1.75] text-muted-foreground">
                Cuando no estoy programando, exploro nuevas tecnologías,
                contribuyo a proyectos open source o me pierdo en el mundo JDM.
              </p>
            </Reveal>

            <StaggerReveal
              className="mt-10 grid grid-cols-3 gap-6"
              selector="[data-stat]"
              stagger={0.1}
              y={20}
            >
              <div data-stat>
                <p className="text-3xl font-medium tracking-tight">
                  <Counter to={6} suffix="+" />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Años codeando
                </p>
              </div>
              <div data-stat>
                <p className="text-3xl font-medium tracking-tight">
                  <Counter to={30} suffix="+" />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Proyectos
                </p>
              </div>
              <div data-stat>
                <p className="text-3xl font-medium tracking-tight">
                  <Counter to={12} />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Clientes
                </p>
              </div>
            </StaggerReveal>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────

type Skill = { name: string; Icon: IconCmp }

const primarySkills: Record<string, Skill[]> = {
  Frontend: [
    { name: "React", Icon: SiReact },
    { name: "Next.js", Icon: SiNextdotjs },
    { name: "TypeScript", Icon: SiTypescript },
    { name: "Tailwind", Icon: SiTailwindcss },
  ],
  Backend: [
    { name: "Node.js", Icon: SiNodedotjs },
    { name: "Python", Icon: SiPython },
    { name: "PostgreSQL", Icon: SiPostgresql },
    { name: "Redis", Icon: SiRedis },
  ],
  Herramientas: [
    { name: "Git", Icon: SiGit },
    { name: "Vercel", Icon: SiVercel },
  ],
}

function SkillTile({ skill }: { skill: Skill }) {
  return (
    <div className="group flex items-center gap-3 py-2 text-muted-foreground transition-colors hover:text-foreground">
      <skill.Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
      <span className="text-sm font-medium">{skill.name}</span>
    </div>
  )
}

export function Skills() {
  return (
    <section id="skills" className="border-b px-4 py-24">
      <div className="container mx-auto max-w-3xl">
        <SectionLabel>Stack tecnológico</SectionLabel>

        <StaggerReveal
          className="grid gap-12"
          selector="[data-stack-group]"
          stagger={0.12}
          y={24}
        >
          {Object.entries(primarySkills).map(([category, items]) => (
            <div
              key={category}
              data-stack-group
              className="grid grid-cols-[120px_1fr] items-start gap-8"
            >
              <p className="pt-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                {category}
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-4">
                {items.map((skill) => (
                  <SkillTile key={skill.name} skill={skill} />
                ))}
              </div>
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

const projects = [
  {
    id: 1,
    title: "Hawkr",
    category: "SaaS · Web App",
    description:
      "Plataforma de inteligencia y monitorización de redes sociales. Dashboard con análisis multi-perfil, comparativas y exportación de datos.",
    tags: [
      { label: "Next.js", Icon: SiNextdotjs as IconCmp },
      { label: "TypeScript", Icon: SiTypescript as IconCmp },
      { label: "Postgres", Icon: SiPostgresql as IconCmp },
    ],
    href: "#",
  },
  {
    id: 2,
    title: "Analytics Dash",
    category: "Dashboard · Analytics",
    description:
      "Dashboard de análisis con datos en tiempo real y visualizaciones interactivas para equipos de producto.",
    tags: [
      { label: "React", Icon: SiReact as IconCmp },
      { label: "Node.js", Icon: SiNodedotjs as IconCmp },
      { label: "Redis", Icon: SiRedis as IconCmp },
    ],
    href: "#",
  },
  {
    id: 3,
    title: "REST API Pro",
    category: "API · Backend",
    description:
      "API RESTful con autenticación JWT, rate limiting y documentación OpenAPI completa.",
    tags: [
      { label: "Node.js", Icon: SiNodedotjs as IconCmp },
      { label: "TypeScript", Icon: SiTypescript as IconCmp },
      { label: "Postgres", Icon: SiPostgresql as IconCmp },
    ],
    href: "#",
  },
]

type Project = (typeof projects)[number]

function ProjectRow({
  project,
  isLast,
}: {
  project: Project
  isLast: boolean
}) {
  const rowRef = useRef<HTMLAnchorElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)

  useGsap(() => {
    const row = rowRef.current
    if (!row) return

    gsap.fromTo(
      row,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 85%" },
      },
    )

    const thumb = thumbRef.current
    if (thumb) {
      gsap.fromTo(
        thumb,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: thumb, start: "top 85%" },
        },
      )
    }

    const arrow = arrowRef.current
    if (!arrow) return
    const xTo = gsap.quickTo(arrow, "x", { duration: 0.35, ease: "power2.out" })
    const yTo = gsap.quickTo(arrow, "y", { duration: 0.35, ease: "power2.out" })

    const enter = () => {
      xTo(6)
      yTo(-6)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }
    row.addEventListener("mouseenter", enter)
    row.addEventListener("mouseleave", leave)
    return () => {
      row.removeEventListener("mouseenter", enter)
      row.removeEventListener("mouseleave", leave)
    }
  }, [])

  return (
    <a
      ref={rowRef}
      href={project.href}
      className={cn(
        "group grid grid-cols-[1fr_2fr] items-start gap-8 py-8",
        !isLast && "border-b",
      )}
    >
      <div
        ref={thumbRef}
        className="aspect-video overflow-hidden rounded-md bg-muted transition-transform duration-500 ease-out group-hover:scale-[1.02]"
      />
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
          {project.category}
        </p>
        <h3 className="mb-2 inline-flex items-center gap-1.5 text-lg font-medium tracking-tight">
          {project.title}
          <span ref={arrowRef} className="inline-block text-muted-foreground">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </h3>
        <p className="text-sm leading-[1.65] text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge
              key={tag.label}
              variant="outline"
              className="gap-1.5 rounded-full text-xs font-normal text-muted-foreground"
            >
              <tag.Icon className="h-3 w-3" />
              {tag.label}
            </Badge>
          ))}
        </div>
      </div>
    </a>
  )
}

export function Projects() {
  return (
    <section id="projects" className="border-b px-4 py-24">
      <div className="container mx-auto max-w-3xl">
        <SectionLabel>Proyectos</SectionLabel>
        <div className="flex flex-col">
          {projects.map((project, i) => (
            <ProjectRow
              key={project.id}
              project={project}
              isLast={i === projects.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────

const jobs = [
  {
    id: 1,
    role: "Senior Developer",
    company: "Tech Company",
    period: "2022 — Hoy",
    description:
      "Liderando el desarrollo de aplicaciones web de alto tráfico. Arquitectura de sistemas, revisiones de código y mentoría de equipo junior.",
  },
  {
    id: 2,
    role: "Full Stack Developer",
    company: "Startup",
    period: "2020 — 2022",
    description:
      "Construí desde cero aplicaciones escalables para B2B. Implementé infraestructura CI/CD y reduje el tiempo de despliegue un 60%.",
  },
  {
    id: 3,
    role: "Junior Developer",
    company: "Agency",
    period: "2018 — 2020",
    description:
      "Desarrollé proyectos web para clientes de distintos sectores. Primeros pasos con React y arquitecturas REST.",
  },
]

function JobRow({ job, isLast }: { job: (typeof jobs)[number]; isLast: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const periodRef = useRef<HTMLParagraphElement>(null)
  const roleRef = useRef<HTMLHeadingElement>(null)
  const companyRef = useRef<HTMLParagraphElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const markerRef = useRef<HTMLSpanElement>(null)

  useGsap(() => {
    const row = rowRef.current
    if (!row) return

    const tl = gsap.timeline({
      scrollTrigger: { trigger: row, start: "top 82%" },
      defaults: { ease: "power3.out" },
    })

    if (markerRef.current) {
      tl.fromTo(
        markerRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" },
        0,
      )
    }

    if (periodRef.current) {
      tl.fromTo(
        periodRef.current,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.7 },
        0.05,
      )
    }

    if (roleRef.current) {
      const chars = roleRef.current.querySelectorAll<HTMLElement>("[data-char]")
      tl.fromTo(
        chars,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.7, stagger: 0.02 },
        0.1,
      )
    }

    if (companyRef.current) {
      tl.fromTo(
        companyRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.35,
      )
    }

    if (descRef.current) {
      tl.fromTo(
        descRef.current,
        { opacity: 0, y: 12, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 },
        0.45,
      )
    }

    const enter = () => {
      gsap.to(markerRef.current, { scale: 1.6, duration: 0.3, ease: "power2.out" })
      gsap.to(row, { x: 6, duration: 0.4, ease: "power2.out" })
    }
    const leave = () => {
      gsap.to(markerRef.current, { scale: 1, duration: 0.3, ease: "power2.out" })
      gsap.to(row, { x: 0, duration: 0.4, ease: "power2.out" })
    }
    row.addEventListener("mouseenter", enter)
    row.addEventListener("mouseleave", leave)
    return () => {
      row.removeEventListener("mouseenter", enter)
      row.removeEventListener("mouseleave", leave)
    }
  }, [])

  const roleChars = job.role.split("")

  return (
    <div
      ref={rowRef}
      className={cn(
        "relative grid grid-cols-[120px_1fr] gap-8 py-8 pl-8",
        !isLast && "border-b",
      )}
    >
      <span
        ref={markerRef}
        aria-hidden
        className="absolute left-0 top-[42px] h-2 w-2 rounded-full bg-foreground"
      />
      <p ref={periodRef} className="font-mono text-sm text-muted-foreground">
        {job.period}
      </p>
      <div>
        <h3
          ref={roleRef}
          className="overflow-hidden text-base font-medium tracking-tight"
          aria-label={job.role}
        >
          {roleChars.map((c, i) => (
            <span
              key={i}
              data-char
              aria-hidden
              className="inline-block whitespace-pre will-change-transform"
            >
              {c}
            </span>
          ))}
        </h3>
        <p
          ref={companyRef}
          className="mb-3 mt-0.5 text-[13px] text-muted-foreground"
        >
          {job.company}
        </p>
        <p
          ref={descRef}
          className="text-sm leading-[1.65] text-muted-foreground"
        >
          {job.description}
        </p>
      </div>
    </div>
  )
}

export function Experience() {
  return (
    <section id="experience" className="border-b px-4 py-24">
      <div className="container mx-auto max-w-3xl">
        <SectionLabel>Experiencia</SectionLabel>
        <div className="relative flex flex-col">
          {jobs.map((job, i) => (
            <JobRow
              key={job.id}
              job={job}
              isLast={i === jobs.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── EDUCATION + ACHIEVEMENTS ─────────────────────────────────────────────────

const educationItems = [
  {
    title: "Grado en Ingeniería Informática",
    sub: "Universidad, 2014 — 2018",
    description: "Fundamentos de software, algoritmos y sistemas distribuidos.",
  },
  {
    title: "Máster en Desarrollo Web",
    sub: "Instituto, 2018 — 2020",
    description:
      "Especialización en tecnologías web modernas y arquitectura frontend.",
  },
]

const achievements = [
  {
    title: "Google Cloud Professional",
    sub: "Google Cloud Platform, Certified",
  },
  {
    title: "Open Source Contributor",
    sub: "Contribuidor activo en proyectos de la comunidad.",
  },
]

function EduItem({
  item,
  fromLeft,
}: {
  item: { title: string; sub: string; description?: string }
  fromLeft?: boolean
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

    tl.fromTo(
      el,
      { opacity: 0, x: fromLeft ? -32 : 32 },
      { opacity: 1, x: 0, duration: 0.9 },
    )
    if (accent) {
      tl.fromTo(
        accent,
        { scaleY: 0, transformOrigin: "top center" },
        { scaleY: 1, duration: 0.7, ease: "power4.out" },
        0.15,
      )
    }
    if (title) {
      tl.fromTo(
        title,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.2,
      )
    }
    if (sub) {
      tl.fromTo(
        sub,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.32,
      )
    }
    if (desc) {
      tl.fromTo(
        desc,
        { opacity: 0, y: 10, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 },
        0.42,
      )
    }

    const enter = () => {
      gsap.to(accent, { height: "100%", duration: 0.4, ease: "power2.out" })
    }
    const leave = () => {
      gsap.to(accent, { height: "60%", duration: 0.4, ease: "power2.out" })
    }
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
        className="absolute left-0 top-0 block h-[60%] w-px bg-foreground"
      />
      <h3
        data-eu-title
        className="text-[15px] font-medium tracking-tight transition-transform group-hover:translate-x-0.5"
      >
        {item.title}
      </h3>
      <p data-eu-sub className="mt-0.5 text-[13px] text-muted-foreground">
        {item.sub}
      </p>
      {item.description && (
        <p
          data-eu-desc
          className="mt-2 text-sm leading-relaxed text-muted-foreground"
        >
          {item.description}
        </p>
      )}
    </div>
  )
}

export function Education() {
  return (
    <section id="education" className="border-b px-4 py-24">
      <div className="container mx-auto max-w-3xl">
        <div className="grid grid-cols-2 gap-16">
          <div>
            <SectionLabel>Educación</SectionLabel>
            <div className="flex flex-col gap-10">
              {educationItems.map((item) => (
                <EduItem key={item.title} item={item} fromLeft />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Reconocimientos</SectionLabel>
            <div className="flex flex-col gap-10">
              {achievements.map((item) => (
                <EduItem key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────

const contactLinks: { Icon: IconCmp; label: string; href: string }[] = [
  { Icon: Mail, label: "hola@alejandro.dev", href: "mailto:hola@alejandro.dev" },
  {
    Icon: GithubIcon,
    label: "github.com/bolado-dev",
    href: "https://github.com/bolado-dev",
  },
  {
    Icon: LinkedinIcon,
    label: "linkedin.com/in/alejandro",
    href: "https://linkedin.com/in/alejandro",
  },
]

export function Contact() {
  return (
    <section id="contact" className="px-4 py-24">
      <div className="container mx-auto max-w-3xl">
        <SectionLabel>Contacto</SectionLabel>
        <div className="grid grid-cols-2 items-start gap-16">
          <div>
            <SplitText
              as="h2"
              stagger={0.05}
              duration={1}
              className="mb-4 text-3xl font-medium leading-tight tracking-tight"
            >
              ¿Tienes un proyecto en mente?
            </SplitText>
            <Reveal delay={0.2}>
              <p className="text-[15px] leading-[1.7] text-muted-foreground">
                Estoy disponible para proyectos freelance y nuevas oportunidades.
                Escríbeme y hablamos.
              </p>
            </Reveal>
            <StaggerReveal
              className="mt-8 flex flex-col gap-3"
              selector="[data-link]"
              stagger={0.08}
              y={14}
            >
              {contactLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  data-link
                  href={href}
                  className="group inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
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
              <Textarea placeholder="Cuéntame tu proyecto..." rows={4} />
            </div>
            <div data-field>
              <Magnetic strength={0.2} className="w-full">
                <Button className="w-full gap-2">
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
