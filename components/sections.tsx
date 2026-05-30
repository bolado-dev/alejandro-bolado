"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  ArrowUpRight,
  Globe,
  Mail,
  MapPin,
  Radar,
  Send,
  ShieldAlert,
  Target,
  Terminal,
} from "lucide-react"
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
} from "@icons-pack/react-simple-icons"

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
    <section id="about" className="border-b px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <SectionLabel>Sobre mí</SectionLabel>

        <div className="grid grid-cols-[140px_1fr] items-start gap-12">
          <div className="relative">
            <div
              ref={imgRef}
              className="relative flex h-[140px] w-[140px] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted"
            >
              <img
                src="/alejandro.png"
                alt="Alejandro Bolado"
                className="h-full w-full object-cover"
              />
            </div>
            <Reveal delay={0.4} y={8}>
              <span className="absolute -bottom-2 -right-2 flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Aprendiendo
              </span>
            </Reveal>
          </div>

          <div>
            <SplitText
              as="h1"
              stagger={0.05}
              duration={0.9}
              className="mb-2 text-4xl font-medium tracking-tight"
            >
              Alejandro Bolado
            </SplitText>
            <Reveal delay={0.15} y={12}>
              <p className="mb-7 flex items-center gap-1.5 text-[15px] text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Ciberseguridad · Cantabria, España
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="text-[17px] leading-[1.8] text-muted-foreground">
                Me apasiona la seguridad ofensiva: pentesting, hacking ético y
                retos estilo CTF. De forma autodidacta practico enumeración,
                explotación y escalada de privilegios resolviendo máquinas en
                plataformas como Hack The Box y TryHackMe.
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <p className="mt-5 text-[17px] leading-[1.8] text-muted-foreground">
                Documento todo mi aprendizaje en{" "}
                <a
                  href="/cybersec"
                  className="text-foreground underline underline-offset-4"
                >
                  writeups y un manual técnico
                </a>
                . Mi objetivo es ganar experiencia práctica y certificarme
                (eJPT, OSCP).
              </p>
            </Reveal>

            <StaggerReveal
              className="mt-12 grid grid-cols-3 gap-6"
              selector="[data-stat]"
              stagger={0.1}
              y={20}
            >
              <div data-stat>
                <p className="text-4xl font-medium tracking-tight">
                  <Counter to={42} />
                </p>
                <p className="mt-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Writeups
                </p>
              </div>
              <div data-stat>
                <p className="text-4xl font-medium tracking-tight">
                  <Counter to={42} />
                </p>
                <p className="mt-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Máquinas HTB
                </p>
              </div>
              <div data-stat>
                <p className="text-4xl font-medium tracking-tight">
                  <Counter to={10} suffix="+" />
                </p>
                <p className="mt-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Páginas de manual
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

// Técnicas reales extraídas de los writeups (HTB), agrupadas por área.
const areas: { label: string; Icon: IconCmp; items: string[] }[] = [
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
]

const tools: Skill[] = [
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
]

function SkillChip({ skill }: { skill: Skill }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/25 hover:text-foreground hover:shadow-sm">
      <skill.Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
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
                    <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-foreground/40" />
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
        { opacity: 0, y: 16, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 },
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
        className="absolute left-0 top-2 h-[7px] w-[7px] rounded-full bg-foreground ring-4 ring-background"
      />
      <p data-period className="pt-1 font-mono text-sm text-muted-foreground">
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
        { opacity: 0, y: 10, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 },
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
        className="absolute left-0 top-0 block h-[60%] w-px bg-foreground"
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
              className="mb-4 text-4xl font-medium leading-tight tracking-tight"
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
                  className="group inline-flex items-center gap-2.5 text-[15px] text-muted-foreground transition-colors hover:text-foreground"
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
