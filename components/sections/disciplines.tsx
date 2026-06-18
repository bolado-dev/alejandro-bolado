"use client"

import {
  Code2,
  ShieldCheck,
  Camera,
  Clapperboard,
  ArrowUpRight,
} from "lucide-react"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { SplitText } from "@/components/animated/split-text"
import { SectionLabel } from "@/components/section-label"

const disciplines = [
  {
    icon: Code2,
    eyebrow: "Desarrollo",
    title: "Full-Stack",
    desc: "Aplicaciones web de principio a fin: interfaces cuidadas con React y Next.js, y back-ends con Node y bases de datos.",
    href: "#projects",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Seguridad",
    title: "Ciberseguridad",
    desc: "Hacking ético y CTFs. Writeups de Hack The Box y un manual técnico de explotación y escalada.",
    href: "/cybersec",
  },
  {
    icon: Camera,
    eyebrow: "Imagen",
    title: "Fotografía",
    desc: "Composición y luz. Retrato, calle y paisaje con una mirada limpia y atenta al detalle.",
    href: "#photography",
  },
  {
    icon: Clapperboard,
    eyebrow: "Vídeo",
    title: "Filmmaking",
    desc: "De la idea al montaje final: rodaje, color y ritmo para contar historias en movimiento.",
    href: "#filmmaking",
  },
]

export function Disciplines() {
  return (
    <section id="disciplines" className="border-b px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <SectionLabel>Qué hago</SectionLabel>
        <SplitText
          as="h2"
          stagger={0.05}
          duration={0.9}
          className="mb-4 max-w-2xl text-4xl font-medium tracking-tight"
        >
          Cuatro disciplinas, una misma forma de trabajar
        </SplitText>
        <Reveal delay={0.2}>
          <p className="mb-12 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
            Detalle, curiosidad y oficio. Aplico el mismo método tanto si
            construyo un sistema como si compongo una imagen.
          </p>
        </Reveal>

        <StaggerReveal
          selector="[data-card]"
          className="grid gap-4 sm:grid-cols-2"
          stagger={0.1}
          y={24}
        >
          {disciplines.map((d) => {
            const Icon = d.icon
            return (
              <a
                key={d.title}
                href={d.href}
                data-card
                className="group flex flex-col rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border bg-background transition-colors group-hover:border-foreground/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
                <p className="mt-6 text-[11px] tracking-widest text-muted-foreground uppercase">
                  {d.eyebrow}
                </p>
                <h3 className="mt-1 text-xl font-medium tracking-tight">
                  {d.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.7] text-muted-foreground">
                  {d.desc}
                </p>
              </a>
            )
          })}
        </StaggerReveal>
      </div>
    </section>
  )
}
