"use client"

import { Reveal } from "@/components/animated/reveal"
import { Magnetic } from "@/components/animated/magnetic"
import { ArrowUpRight } from "@/components/icons/solar"
import { VisualsMark } from "@/components/visuals/mark"

function scrollTo(href: string) {
  const el = document.getElementById(href.replace("#", ""))
  if (el) el.scrollIntoView({ behavior: "smooth" })
}

export function VisualsHero() {
  return (
    <section className="px-6 pt-40 pb-20 md:pt-48">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal y={20}>
          <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            Fotografía &amp; Filmmaking · Cantabria
          </span>
        </Reveal>

        <Reveal y={20} delay={0.06}>
          <h1 className="visuals-display mt-6 text-[clamp(2.75rem,8vw,6rem)] leading-[1.02] text-balance">
            Damos forma a tu historia visual
          </h1>
        </Reveal>

        <Reveal y={16} delay={0.14}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Bolado Visuals es el estudio de fotografía y vídeo de Alejandro
            Bolado. Composición, luz y ritmo al servicio de tu marca, tu
            historia o tu evento.
          </p>
        </Reveal>

        <Reveal y={16} delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <button
                onClick={() => scrollTo("#portfolio")}
                data-cursor-label="Ver trabajos"
                className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90"
              >
                Ver portfolio
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </Magnetic>
            <Magnetic>
              <button
                onClick={() => scrollTo("#contacto")}
                data-cursor-label="Contacto"
                className="rounded-full border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Trabajemos juntos
              </button>
            </Magnetic>
          </div>
        </Reveal>
      </div>

      <Reveal y={28} delay={0.28}>
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-secondary">
            <VisualsMark className="h-28 w-auto text-brand md:h-36" />
          </div>
          <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 text-sm backdrop-blur">
            <VisualsMark className="h-4 w-auto text-brand" />
            <span className="font-medium">Bolado Visuals</span>
          </div>
        </div>
      </Reveal>

      <div className="mt-20 flex flex-col items-center gap-2 text-xs tracking-[0.25em] text-muted-foreground uppercase">
        <span>Desliza</span>
        <span className="animate-bounce">↓</span>
      </div>
    </section>
  )
}
