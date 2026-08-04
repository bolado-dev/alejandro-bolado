"use client"

import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { SectionHeading } from "@/components/visuals/section-heading"
import { VisualsMark } from "@/components/visuals/mark"

const pillars = [
  {
    k: "Creative",
    t: "Mirada propia",
    d: "Cada encargo se piensa desde la idea: qué queremos contar y cómo hacerlo memorable.",
  },
  {
    k: "Strategy",
    t: "Con intención",
    d: "La imagen sirve a un objetivo. Planificamos luz, encuadre y narrativa para que funcione.",
  },
  {
    k: "Impact",
    t: "Que deje huella",
    d: "Resultados cuidados al detalle, listos para publicar y pensados para emocionar.",
  },
]

export function VisualsAbout() {
  return (
    <section id="sobre" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal y={24}>
            <SectionHeading
              eyebrow="Sobre Bolado Visuals"
              title="Detrás del objetivo"
            />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Soy Alejandro Bolado, fotógrafo y realizador. Bolado Visuals nace
              de la misma curiosidad con la que escribo código: observar,
              componer y cuidar cada detalle.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Trabajo la fotografía y el vídeo con una estética limpia y
              honesta, ya sea un retrato, un evento o la imagen de una marca.
              Cerca, cuidado y sin postureo.
            </p>
          </Reveal>

          <Reveal y={24} delay={0.1}>
            <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-border bg-secondary">
              <VisualsMark className="h-28 w-auto text-brand" />
            </div>
          </Reveal>
        </div>

        <StaggerReveal
          selector="[data-pillar]"
          className="mt-16 grid gap-6 sm:grid-cols-3"
          stagger={0.1}
          y={20}
        >
          {pillars.map((p) => (
            <div
              key={p.k}
              data-pillar
              className="rounded-3xl border border-border bg-card p-8"
            >
              <span className="text-[11px] tracking-[0.2em] text-brand uppercase">
                {p.k}
              </span>
              <h3 className="mt-3 text-lg font-bold tracking-tight">{p.t}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {p.d}
              </p>
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
