"use client"

import {
  Code2,
  ShieldCheck,
  Camera,
  Clapperboard,
  ArrowUpRight,
} from "@/components/icons/solar"
import { Reveal, StaggerReveal } from "@/components/animated/reveal"
import { SplitText } from "@/components/animated/split-text"
import { SectionLabel } from "@/components/section-label"

const disciplines = [
  {
    index: "01",
    icon: Code2,
    eyebrow: "Desarrollo",
    title: "Full-Stack",
    desc: "Aplicaciones web de principio a fin: interfaces cuidadas con React y Next.js, y back-ends con Node y bases de datos.",
    href: "#projects",
  },
  {
    index: "02",
    icon: ShieldCheck,
    eyebrow: "Seguridad",
    title: "Ciberseguridad",
    desc: "Hacking ético y CTFs. Writeups de Hack The Box y un manual técnico de explotación y escalada.",
    href: "/cybersec",
  },
  {
    index: "03",
    icon: Camera,
    eyebrow: "Imagen",
    title: "Fotografía",
    desc: "Composición y luz. Retrato, calle y paisaje con una mirada limpia y atenta al detalle.",
    href: "#photography",
  },
  {
    index: "04",
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
      <div className="container mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Qué hago</SectionLabel>
          <SplitText
            as="h2"
            stagger={0.05}
            duration={0.9}
            className="mb-4 text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[0.98] tracking-tight"
          >
            Cuatro disciplinas, una misma forma de trabajar
          </SplitText>
          <Reveal delay={0.2}>
            <p className="mb-16 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
              Detalle, curiosidad y oficio. Aplico el mismo método tanto si
              construyo un sistema como si compongo una imagen.
            </p>
          </Reveal>
        </div>

        <StaggerReveal
          selector="[data-row]"
          className="border-t"
          stagger={0.1}
          y={28}
        >
          {disciplines.map((d) => {
            const Icon = d.icon
            return (
              <a
                key={d.title}
                href={d.href}
                data-row
                className="group relative flex flex-col gap-4 border-b py-8 transition-colors sm:flex-row sm:items-center sm:gap-8 md:py-10"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-[-1rem] inset-y-0 -z-10 origin-left scale-x-0 bg-foreground/[0.03] transition-transform duration-500 ease-out group-hover:scale-x-100"
                />

                <span className="text-sm text-brand tabular-nums sm:w-12 sm:shrink-0">
                  {d.index}
                </span>

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors group-hover:border-brand/40 group-hover:text-brand sm:order-2">
                  <Icon className="h-5 w-5" />
                </span>

                <div className="flex-1 sm:order-1">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {d.eyebrow}
                  </p>
                  <h3 className="mt-1 text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.02] tracking-tight transition-transform duration-300 group-hover:translate-x-2">
                    {d.title}
                  </h3>
                  <p className="mt-2 max-w-md text-[15px] leading-[1.7] text-muted-foreground">
                    {d.desc}
                  </p>
                </div>

                <span className="flex shrink-0 items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 sm:order-3 sm:-translate-x-2 sm:group-hover:translate-x-0">
                  Ver
                  <ArrowUpRight className="h-4 w-4 text-brand transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            )
          })}
        </StaggerReveal>
      </div>
    </section>
  )
}
