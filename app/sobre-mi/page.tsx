import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, MapPin } from "@/components/icons/solar"
import { Skills, Experience, Education } from "@/components/sections"
import { Reveal } from "@/components/animated/reveal"
import { SplitText } from "@/components/animated/split-text"
import { SectionLabel } from "@/components/section-label"

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Perfil técnico-creativo de Alejandro Bolado: desarrollo full-stack, seguridad ofensiva, formación y trayectoria.",
}

export default function SobreMiPage() {
  return (
    <main className="px-4 pt-24 pb-28">
      <div className="container mx-auto max-w-4xl">
        <SectionLabel>Perfil</SectionLabel>

        <SplitText
          as="h1"
          trigger="load"
          stagger={0.05}
          duration={0.9}
          className="text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.95] tracking-tight"
        >
          Sobre mí
        </SplitText>

        <Reveal delay={0.15} y={12}>
          <p className="mt-5 flex items-center gap-1.5 text-[11px] tracking-widest text-muted-foreground uppercase">
            <MapPin className="h-3.5 w-3.5 text-brand" />
            Cantabria, España
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mt-8 max-w-2xl text-[17px] leading-[1.8] text-muted-foreground">
            Soy <span className="text-foreground">Alejandro Bolado</span>, un
            perfil técnico-creativo que se mueve entre dos almas: la del{" "}
            <span className="text-foreground">código</span> y la de la{" "}
            <span className="text-foreground">cámara</span>. Desarrollo
            aplicaciones web full-stack de principio a fin —desde la
            arquitectura hasta el último detalle de interfaz— y complemento
            ese oficio con una dedicación seria a la seguridad ofensiva:
            pentesting, hacking ético y retos estilo CTF que documento en{" "}
            <Link
              href="/cybersec"
              className="text-foreground underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
            >
              writeups y un manual técnico
            </Link>
            .
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mt-5 max-w-2xl text-[17px] leading-[1.8] text-muted-foreground">
            Fuera de la terminal, cuento historias con la cámara: la
            fotografía y el filmmaking son la otra mitad de lo que hago, con
            el mismo cuidado por el detalle que pongo en el código. Esta
            página reúne lo que sería un CV clásico —habilidades,
            experiencia y formación— para no romper el ritmo editorial de la
            portada.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <Link
            href="/"
            className="group mt-10 inline-flex items-center gap-2 text-[11px] tracking-widest text-muted-foreground uppercase transition-colors hover:text-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </Link>
        </Reveal>
      </div>

      <Skills />
      <Experience />
      <Education />
    </main>
  )
}
