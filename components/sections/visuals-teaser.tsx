"use client"

import Link from "next/link"
import { ArrowUpRight } from "@/components/icons/solar"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { SplitText } from "@/components/animated/split-text"
import { SectionLabel } from "@/components/section-label"
import { visualsCards } from "@/lib/visuals-cards"

export function VisualsTeaser() {
  return (
    <section id="visuals" className="px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Bolado Visuals</SectionLabel>
          <SplitText
            as="h2"
            stagger={0.05}
            duration={0.9}
            className="mb-4 text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[0.98] tracking-tight"
          >
            Fotografía y filmmaking, aparte
          </SplitText>
          <Reveal delay={0.2}>
            <p className="mb-16 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
              La otra mitad de lo que hago tiene su propio espacio. Portfolio
              completo, servicios y contacto en cada uno.
            </p>
          </Reveal>
        </div>

        <StaggerReveal
          selector="[data-visuals-card]"
          className="grid gap-6 md:grid-cols-2"
          stagger={0.12}
          y={28}
        >
          {visualsCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              data-visuals-card
              data-cursor-label={`Ver ${card.title}`}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl border p-8 sm:aspect-[16/10]"
            >
              {card.video ? (
                <video
                  src={card.video}
                  poster={card.image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover grayscale transition duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover grayscale transition duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-background/5 transition-opacity duration-500 group-hover:from-background/90 group-hover:via-background/30" />

              <div className="relative z-10">
                <h3 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.02] tracking-tight transition-transform duration-300 group-hover:-translate-y-1">
                  {card.title}
                </h3>
                <p className="mt-2 max-w-sm text-[15px] leading-[1.7] text-muted-foreground">
                  {card.description}
                </p>
                <span className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Ver
                  <ArrowUpRight className="h-4 w-4 text-brand transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
