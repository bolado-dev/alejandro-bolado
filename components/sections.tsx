"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowUpRight, Mail, MapPin, Send } from "lucide-react"
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
                Aprendiendo
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
                Ciberseguridad · Cantabria, España
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="text-[15px] leading-[1.75] text-muted-foreground">
                Me apasiona la seguridad ofensiva: pentesting, hacking ético y
                retos estilo CTF. De forma autodidacta practico enumeración,
                explotación y escalada de privilegios resolviendo máquinas en
                plataformas como Hack The Box y TryHackMe.
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <p className="mt-4 text-[15px] leading-[1.75] text-muted-foreground">
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
              className="mt-10 grid grid-cols-3 gap-6"
              selector="[data-stat]"
              stagger={0.1}
              y={20}
            >
              <div data-stat>
                <p className="text-3xl font-medium tracking-tight">
                  <Counter to={42} />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Writeups
                </p>
              </div>
              <div data-stat>
                <p className="text-3xl font-medium tracking-tight">
                  <Counter to={42} />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Máquinas HTB
                </p>
              </div>
              <div data-stat>
                <p className="text-3xl font-medium tracking-tight">
                  <Counter to={10} suffix="+" />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
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

const primarySkills: Record<string, Skill[]> = {
  Sistemas: [
    { name: "Linux", Icon: SiLinux },
    { name: "Kali Linux", Icon: SiKalilinux },
    { name: "Bash", Icon: SiGnubash },
  ],
  Tooling: [
    { name: "Burp Suite", Icon: SiBurpsuite },
    { name: "Wireshark", Icon: SiWireshark },
    { name: "Python", Icon: SiPython },
    { name: "Git", Icon: SiGit },
    { name: "Docker", Icon: SiDocker },
  ],
  Plataformas: [
    { name: "Hack The Box", Icon: SiHackthebox },
    { name: "TryHackMe", Icon: SiTryhackme },
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
        <SectionLabel>Stack &amp; herramientas</SectionLabel>

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

// ─── EDUCATION + OBJETIVOS ────────────────────────────────────────────────────

const educationItems = [
  {
    title: "ASIR — Administración de Sistemas en Red",
    sub: "Formación profesional, en curso",
    description: "Sistemas, redes, servidores y administración Linux/Windows.",
  },
  {
    title: "Ciberseguridad autodidacta",
    sub: "Hack The Box · TryHackMe",
    description:
      "Pentesting, explotación web, Active Directory y scripting en Python.",
  },
]

const achievements = [
  {
    title: "eJPT",
    sub: "eLearnSecurity Junior Penetration Tester · objetivo",
  },
  {
    title: "OSCP",
    sub: "Offensive Security Certified Professional · objetivo",
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
      tl.fromTo(title, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, 0.2)
    }
    if (sub) {
      tl.fromTo(sub, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 }, 0.32)
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
            <SectionLabel>Formación</SectionLabel>
            <div className="flex flex-col gap-10">
              {educationItems.map((item) => (
                <EduItem key={item.title} item={item} fromLeft />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Objetivos</SectionLabel>
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
  {
    Icon: Mail,
    label: "alexbolatrue@gmail.com",
    href: "mailto:alexbolatrue@gmail.com",
  },
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
              ¿Hablamos de seguridad?
            </SplitText>
            <Reveal delay={0.2}>
              <p className="text-[15px] leading-[1.7] text-muted-foreground">
                Abierto a aprender, recibir consejos y participar en iniciativas
                de ciberseguridad. Escríbeme y hablamos.
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
