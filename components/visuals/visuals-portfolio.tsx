"use client"

import { useMemo, useState } from "react"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { Magnetic } from "@/components/animated/magnetic"
import { SectionHeading } from "@/components/visuals/section-heading"
import { Lightbox, type LightboxItem } from "@/components/lightbox"
import { Play } from "@/components/icons/solar"
import { photos, films, showreel } from "@/lib/gallery"
import { cn } from "@/lib/utils"

type Tab = "foto" | "video"

export function VisualsPortfolio() {
  const hasFoto = photos.length > 0
  const hasVideo = films.length > 0 || !!showreel
  const [tab, setTab] = useState<Tab>(hasFoto ? "foto" : "video")
  const [index, setIndex] = useState<number | null>(null)

  const filmSequence = useMemo(
    () => [...(showreel ? [showreel] : []), ...films],
    []
  )

  const photoItems: LightboxItem[] = photos.map((p) => ({
    type: "image",
    src: p.src,
    alt: p.alt,
    title: p.category ?? p.alt,
  }))
  const filmItems: LightboxItem[] = filmSequence.map((f) => ({
    type: "video",
    src: f.src,
    embed: f.embed,
    poster: f.poster,
    title: f.title,
  }))

  if (!hasFoto && !hasVideo) return null

  return (
    <section id="portfolio" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal y={24}>
          <SectionHeading
            eyebrow="Portfolio"
            title="Trabajos seleccionados"
            description="Una muestra de proyectos de fotografía y vídeo. Cada pieza, una historia contada con luz, encuadre y ritmo."
          />
        </Reveal>

        {hasFoto && hasVideo && (
          <Reveal y={16} className="mt-10">
            <div className="inline-flex rounded-full border border-border p-1 text-sm">
              <TabButton active={tab === "foto"} onClick={() => setTab("foto")}>
                Fotografía
              </TabButton>
              <TabButton active={tab === "video"} onClick={() => setTab("video")}>
                Vídeo
              </TabButton>
            </div>
          </Reveal>
        )}

        {tab === "foto" && hasFoto && (
          <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
            {photos.map((p, i) => (
              <button
                key={p.src}
                onClick={() => setIndex(i)}
                data-cursor-label="Ver"
                className="group relative block w-full overflow-hidden rounded-3xl border border-border bg-secondary"
                style={{ aspectRatio: `${p.width} / ${p.height}` }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-widest text-muted-foreground/40 uppercase">
                  {p.category}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="relative h-full w-full object-cover grayscale transition duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {p.category && (
                    <span className="rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium tracking-widest uppercase backdrop-blur">
                      {p.category}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === "video" && hasVideo && (
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
        )}
      </div>

      <Lightbox
        items={tab === "foto" ? photoItems : filmItems}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </section>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-5 py-1.5 transition-colors",
        active
          ? "bg-brand text-brand-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
