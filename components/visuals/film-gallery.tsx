"use client"

import { useMemo, useState } from "react"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { Magnetic } from "@/components/animated/magnetic"
import { SectionHeading } from "@/components/visuals/section-heading"
import { Lightbox, type LightboxItem } from "@/components/lightbox"
import { Play } from "@/components/icons/solar"
import { films, showreel } from "@/lib/gallery"

export function FilmGallery() {
  const [index, setIndex] = useState<number | null>(null)

  const sequence = useMemo(() => [...(showreel ? [showreel] : []), ...films], [])
  const items: LightboxItem[] = sequence.map((f) => ({
    type: "video",
    src: f.src,
    embed: f.embed,
    poster: f.poster,
    title: f.title,
  }))

  if (sequence.length === 0) return null

  return (
    <section id="portfolio" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal y={24}>
          <SectionHeading
            eyebrow="Portfolio"
            title="Filmmaking"
            description="Del concepto al montaje final. Rodaje, color y ritmo para contar historias en movimiento."
          />
        </Reveal>

        <div className="mt-12 space-y-6">
          {showreel && (
            <Reveal y={24}>
              <button
                onClick={() => setIndex(0)}
                data-cursor-label="Reproducir"
                className="group relative block aspect-video w-full overflow-hidden rounded-3xl border border-border bg-secondary"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-widest text-muted-foreground/40 uppercase">
                  {showreel.title}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={showreel.poster}
                  alt={showreel.title}
                  className="relative h-full w-full object-cover grayscale transition duration-700 ease-out group-hover:scale-[1.02] group-hover:grayscale-0"
                />
                <span className="absolute bottom-0 left-0 flex w-full items-center gap-4 p-6">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                    <Play className="h-5 w-5 translate-x-px fill-current" />
                  </span>
                  <span className="text-left">
                    <span className="block text-[11px] tracking-widest text-muted-foreground uppercase">
                      {showreel.category}
                      {showreel.year ? ` · ${showreel.year}` : ""}
                    </span>
                    <span className="block text-2xl font-bold tracking-tight">
                      {showreel.title}
                    </span>
                  </span>
                </span>
              </button>
            </Reveal>
          )}

          <StaggerReveal
            selector="[data-film]"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.1}
            y={24}
          >
            {films.map((f, i) => (
              <Magnetic key={f.title} className="block" strength={0.12}>
                <button
                  data-film
                  data-cursor-label="Reproducir"
                  onClick={() => setIndex((showreel ? 1 : 0) + i)}
                  className="group relative block aspect-video w-full overflow-hidden rounded-3xl border border-border bg-secondary text-left"
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-widest text-muted-foreground/40 uppercase">
                    {f.category}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.poster}
                    alt={f.title}
                    loading="lazy"
                    className="relative h-full w-full object-cover grayscale transition duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                  />
                  <span className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
                    <Play className="h-4 w-4 translate-x-px fill-current" />
                  </span>
                  <span className="absolute bottom-4 left-4">
                    <span className="block text-[10px] tracking-widest text-muted-foreground uppercase">
                      {f.category}
                    </span>
                    <span className="block text-sm font-medium">{f.title}</span>
                  </span>
                </button>
              </Magnetic>
            ))}
          </StaggerReveal>
        </div>
      </div>

      <Lightbox
        items={items}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </section>
  )
}
