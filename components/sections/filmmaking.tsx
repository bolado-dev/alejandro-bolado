"use client"

import { useState } from "react"
import { Play } from "@/components/icons/solar"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { SplitText } from "@/components/animated/split-text"
import { SectionLabel } from "@/components/section-label"
import { Lightbox, type LightboxItem } from "@/components/lightbox"
import { films, showreel } from "@/lib/gallery"

export function Filmmaking() {
  const [index, setIndex] = useState<number | null>(null)

  const sequence = [...(showreel ? [showreel] : []), ...films]
  if (sequence.length === 0) return null

  const items: LightboxItem[] = sequence.map((f) => ({
    type: "video",
    src: f.src,
    embed: f.embed,
    poster: f.poster,
    title: f.title,
  }))

  return (
    <section id="filmmaking" className="border-b px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <SectionLabel>Filmmaking</SectionLabel>
        <SplitText
          as="h2"
          stagger={0.05}
          duration={0.9}
          className="mb-4 text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.95] tracking-tight"
        >
          Historias en movimiento
        </SplitText>
        <Reveal delay={0.2}>
          <p className="mb-12 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
            Del concepto al montaje final. Rodaje, color y ritmo.
          </p>
        </Reveal>

        {showreel && (
          <Reveal y={24} className="mb-4">
            <button
              onClick={() => setIndex(0)}
              className="group relative block aspect-video w-full overflow-hidden bg-muted"
            >
              <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-widest text-muted-foreground/40 uppercase">
                {showreel.title}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={showreel.poster}
                alt={showreel.title}
                className="relative h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brand/0 transition-all duration-300 group-hover:ring-brand/40" />
              <span className="absolute bottom-0 left-0 flex w-full items-center gap-4 p-6">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brand/40 bg-background/70 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-brand group-hover:bg-brand group-hover:text-brand-foreground">
                  <Play className="h-5 w-5 translate-x-px fill-current" />
                </span>
                <span className="text-left">
                  <span className="block text-[11px] tracking-widest text-brand uppercase">
                    {showreel.category}
                    {showreel.year ? ` · ${showreel.year}` : ""}
                  </span>
                  <span className="block text-2xl font-medium tracking-tight">
                    {showreel.title}
                  </span>
                </span>
              </span>
            </button>
          </Reveal>
        )}

        <StaggerReveal
          selector="[data-film]"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.1}
          y={24}
        >
          {films.map((f, i) => (
            <button
              key={f.title}
              data-film
              onClick={() => setIndex((showreel ? 1 : 0) + i)}
              className="group relative block aspect-video w-full overflow-hidden bg-muted text-left"
            >
              <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-widest text-muted-foreground/40 uppercase">
                {f.category}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.poster}
                alt={f.title}
                loading="lazy"
                className="relative h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
              <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brand/0 transition-all duration-300 group-hover:ring-brand/40" />
              <span className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/70 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-brand group-hover:bg-brand group-hover:text-brand-foreground">
                <Play className="h-4 w-4 translate-x-px fill-current" />
              </span>
              <span className="absolute bottom-3 left-3">
                <span className="block text-[10px] tracking-widest text-brand/90 uppercase">
                  {f.category}
                </span>
                <span className="block text-sm font-medium">{f.title}</span>
              </span>
            </button>
          ))}
        </StaggerReveal>
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
