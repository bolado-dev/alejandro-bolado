"use client"

import { Counter } from "@/components/animated/counter"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { MapPin } from "@/components/icons/solar"
import { GlitchPortrait } from "@/components/ui/glitch-portrait"

export function SobreMiHero() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen items-center px-4 py-24"
      aria-label="Presentación"
    >
      <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-10">
        {/* Datos: izquierda */}
        <Reveal className="hidden text-left md:block" y={24} once>
          <p className="mb-4 flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Cantabria, España
          </p>
          <h2 className="text-[clamp(2rem,3.2vw,2.75rem)] font-medium leading-[1.05] tracking-tight">
            Entre el código y la cámara
          </h2>
          <p className="mt-5 max-w-xs text-base leading-[1.7] text-muted-foreground">
            Desarrollador full-stack, hacker ético y fotógrafo. Esta es la
            historia detrás de las tres cosas.
          </p>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground/70">
            Pasa el cursor por encima
          </p>
        </Reveal>

        {/* Al pasar el cursor, la foto se rompe en bloques y se desgarra
            hacia su propio delineado. Ambas capas salen de la misma
            textura, y nada se deforma. */}
        <GlitchPortrait
          src="/alejandro-bw.webp"
          alt="Alejandro Bolado"
          className="mx-auto aspect-[3/4] w-full max-w-[360px] shrink-0 md:max-w-[480px] lg:max-w-[560px]"
        />

        {/* Datos: derecha */}
        <StaggerReveal
          className="hidden flex-col gap-8 md:flex"
          y={20}
          once
        >
          <div>
            <p className="font-mono text-4xl font-medium tracking-tight">
              <Counter to={42} suffix="+" />
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Máquinas HTB resueltas
            </p>
          </div>
          <div>
            <p className="font-mono text-4xl font-medium tracking-tight">
              <Counter to={2} />
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Proyectos propios en producción
            </p>
          </div>
          <div>
            <p className="font-mono text-4xl font-medium tracking-tight">
              ASIR
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              IES Miguel Herrero · en curso
            </p>
          </div>
        </StaggerReveal>

        {/* Fallback compacto en móvil: sin columnas laterales */}
        <div className="text-center md:hidden">
          <h2 className="text-[clamp(2rem,7vw,2.75rem)] font-medium leading-[1.05] tracking-tight">
            Entre el código y la cámara
          </h2>
          <p className="mt-4 text-base leading-[1.7] text-muted-foreground">
            Desarrollador full-stack, hacker ético y fotógrafo.
          </p>
        </div>
      </div>
    </section>
  )
}
