import { Terminal, Target } from "@/components/icons/solar"
import { SiLinux } from "@icons-pack/react-simple-icons"
import { StaggerReveal } from "@/components/animated/reveal"
import { SectionLabel } from "@/components/section-label"

type IconProps = { className?: string }
type IconCmp = React.ComponentType<IconProps>

type Item = { title: string; sub: string; description: string; Icon: IconCmp }

const formacion: Item[] = [
  {
    title: "ASIR — Administración de Sistemas en Red",
    sub: "IES Miguel Herrero · en curso",
    description: "Sistemas, redes, servidores y administración Linux/Windows.",
    Icon: SiLinux,
  },
  {
    title: "Ciberseguridad autodidacta",
    sub: "Hack The Box · TryHackMe",
    description:
      "Pentesting, explotación web, Active Directory y scripting en Python.",
    Icon: Terminal,
  },
]

const objetivos: Item[] = [
  {
    title: "eJPT",
    sub: "eLearnSecurity Junior Penetration Tester",
    description: "Certificación práctica de pentesting de nivel inicial.",
    Icon: Target,
  },
  {
    title: "OSCP",
    sub: "Offensive Security Certified Professional",
    description: "El objetivo a medio plazo: explotación manual y reporte.",
    Icon: Target,
  },
]

function EduItem({ item }: { item: Item }) {
  return (
    <div className="group flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
        <item.Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h3 className="text-lg font-medium tracking-tight">{item.title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{item.sub}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </div>
    </div>
  )
}

export function Education() {
  return (
    <section className="px-4 py-28 md:py-32">
      <div className="container mx-auto max-w-6xl">
        <SectionLabel>Formación &amp; objetivos</SectionLabel>

        <div className="grid gap-x-16 gap-y-16 sm:grid-cols-2">
          <StaggerReveal
            className="flex flex-col gap-10"
            selector="[data-edu]"
            stagger={0.1}
            y={20}
          >
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Formación
            </p>
            {formacion.map((item) => (
              <div key={item.title} data-edu>
                <EduItem item={item} />
              </div>
            ))}
          </StaggerReveal>

          <StaggerReveal
            className="flex flex-col gap-10"
            selector="[data-edu]"
            stagger={0.1}
            delay={0.1}
            y={20}
          >
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Objetivos
            </p>
            {objetivos.map((item) => (
              <div key={item.title} data-edu>
                <EduItem item={item} />
              </div>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  )
}
