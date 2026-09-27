"use client"

import Link from "next/link"
import { ArrowUpRight } from "@/components/icons/solar"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { Magnetic } from "@/components/animated/magnetic"
import { SectionHeading } from "@/components/visuals/section-heading"
import { visualsCards } from "@/lib/visuals-cards"

export function VisualsCards() {
  return (
    <section id="disciplinas" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal y={24}>
          <SectionHeading
            eyebrow="Portfolio"
            title="Dos disciplinas, cada una con su espacio"
            description="Elige por dónde quieres empezar. Cada una tiene su propio portfolio, servicios y contacto."
          />
        </Reveal>

        <StaggerReveal
          selector="[data-visuals-card]"
          className="mt-14 grid gap-6 sm:grid-cols-2"
          stagger={0.12}
          y={24}
        >
          {visualsCards.map((card) => (
            <Magnetic key={card.href} className="block" strength={0.1}>
              <Link
                href={card.href}
                data-visuals-card
                data-cursor-label={`Ver ${card.title}`}
                className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl border border-border p-8"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover grayscale transition duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-background/5" />

                <div className="relative z-10">
                  <h3 className="visuals-display text-3xl md:text-4xl">
                    {card.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-muted-foreground">
                    {card.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    Ver portfolio
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </Magnetic>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
