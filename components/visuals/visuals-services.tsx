"use client"

import {
  Camera,
  Clapperboard,
  User,
  Target,
  ArrowUpRight,
} from "@/components/icons/solar"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { Magnetic } from "@/components/animated/magnetic"
import { SectionHeading } from "@/components/visuals/section-heading"

const services = [
  {
    icon: User,
    title: "Retrato & Personal branding",
    desc: "Sesiones de retrato y marca personal. Imágenes que transmiten quién eres, para redes, web o prensa.",
  },
  {
    icon: Camera,
    title: "Eventos & Bodas",
    desc: "Cobertura de eventos, celebraciones y bodas. Los momentos que importan, capturados con naturalidad.",
  },
  {
    icon: Target,
    title: "Comercial & Producto",
    desc: "Fotografía de producto, espacios y marca para catálogos, e-commerce y campañas publicitarias.",
  },
  {
    icon: Clapperboard,
    title: "Filmmaking & Reels",
    desc: "Vídeo corporativo, videoclips, reels y piezas de redes. Del guion al montaje final con color y ritmo.",
  },
]

function scrollTo(href: string) {
  const el = document.getElementById(href.replace("#", ""))
  if (el) el.scrollIntoView({ behavior: "smooth" })
}

export function VisualsServices() {
  return (
    <section id="servicios" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal y={24}>
          <SectionHeading
            eyebrow="Servicios"
            title="Qué puedo hacer por ti"
            description="Fotografía y vídeo a medida. Cada proyecto empieza con una conversación para entender qué quieres contar."
          />
        </Reveal>

        <StaggerReveal
          selector="[data-card]"
          className="mt-14 grid gap-6 sm:grid-cols-2"
          stagger={0.1}
          y={24}
        >
          {services.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.title}
                data-card
                className="group flex flex-col gap-5 rounded-3xl border border-border bg-card p-8 transition-colors hover:border-foreground/30"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </StaggerReveal>

        <Reveal y={24} delay={0.1}>
          <div className="mt-6 flex flex-col items-start justify-between gap-6 rounded-[2.5rem] bg-foreground px-8 py-12 text-background md:flex-row md:items-center md:px-14">
            <div>
              <h3 className="visuals-display text-2xl md:text-3xl">
                ¿Tienes algo en mente?
              </h3>
              <p className="mt-2 max-w-md text-zinc-400">
                Cuéntame tu proyecto y preparamos una propuesta a medida, sin
                compromiso.
              </p>
            </div>
            <Magnetic>
              <button
                onClick={() => scrollTo("#contacto")}
                className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90"
              >
                Pedir presupuesto
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
