import {
  Camera,
  Code2,
  Film,
  Globe,
  Radar,
  ShieldAlert,
} from "@/components/icons/solar"
import {
  SiLinux,
  SiKalilinux,
  SiGnubash,
  SiPython,
  SiGit,
  SiDocker,
  SiWireshark,
  SiHackthebox,
  SiTryhackme,
  SiBurpsuite,
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiNodedotjs,
  SiTailwindcss,
  SiPostgresql,
  SiDavinciresolve,
} from "@icons-pack/react-simple-icons"
import { StaggerReveal } from "@/components/animated/reveal"
import { SectionLabel } from "@/components/section-label"
import { Marquee } from "@/components/animated/marquee"

type IconProps = { className?: string }
type IconCmp = React.ComponentType<IconProps>
type Skill = { name: string; Icon: IconCmp }

const areas: { label: string; Icon: IconCmp; items: string[] }[] = [
  {
    label: "Desarrollo web",
    Icon: Code2,
    items: [
      "React & Next.js",
      "TypeScript",
      "Node.js & APIs REST",
      "PostgreSQL",
      "Tailwind CSS",
      "Docker & despliegue",
    ],
  },
  {
    label: "Explotación web",
    Icon: Globe,
    items: [
      "SQLi & PostgreSQL RCE",
      "LFI / RFI → RCE",
      "SSTI",
      "XXE · SSRF",
      "Directory Traversal",
      "Information Leakage",
    ],
  },
  {
    label: "Post-explotación",
    Icon: ShieldAlert,
    items: [
      "Escalada Linux (sudo, PATH hijacking)",
      "Escalada Windows (SeImpersonate, PrintNightmare)",
      "Active Directory (BloodHound, RBCD)",
      "Port forwarding & pivoting",
    ],
  },
  {
    label: "Enumeración & redes",
    Icon: Radar,
    items: [
      "Nmap & fuzzing web",
      "SMB · NFS · SNMP",
      "VHOST & subdominios",
      "Enumeración de CMS",
    ],
  },
  {
    label: "Fotografía & vídeo",
    Icon: Camera,
    items: [
      "Composición & luz",
      "Retrato · calle · paisaje",
      "Edición y color grading",
      "Montaje y ritmo",
    ],
  },
]

const tools: Skill[] = [
  { name: "React", Icon: SiReact },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Node.js", Icon: SiNodedotjs },
  { name: "Tailwind CSS", Icon: SiTailwindcss },
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "Linux", Icon: SiLinux },
  { name: "Kali Linux", Icon: SiKalilinux },
  { name: "Bash", Icon: SiGnubash },
  { name: "Python", Icon: SiPython },
  { name: "Burp Suite", Icon: SiBurpsuite },
  { name: "Wireshark", Icon: SiWireshark },
  { name: "Git", Icon: SiGit },
  { name: "Docker", Icon: SiDocker },
  { name: "Hack The Box", Icon: SiHackthebox },
  { name: "TryHackMe", Icon: SiTryhackme },
  { name: "DaVinci Resolve", Icon: SiDavinciresolve },
  { name: "Lightroom", Icon: Camera },
  { name: "Premiere Pro", Icon: Film },
]

function ToolChip({ skill }: { skill: Skill }) {
  return (
    <div className="mx-2.5 flex items-center gap-3 rounded-xl bg-card px-5 py-4 text-muted-foreground">
      <skill.Icon className="h-6 w-6" />
      <span className="text-base font-medium whitespace-nowrap">
        {skill.name}
      </span>
    </div>
  )
}

export function Skills() {
  return (
    <section className="py-28 md:py-32">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionLabel>Habilidades</SectionLabel>

        <StaggerReveal
          className="grid gap-x-12 gap-y-12 sm:grid-cols-3"
          selector="[data-area]"
          stagger={0.12}
          y={24}
        >
          {areas.map((area) => (
            <div key={area.label} data-area>
              <div className="mb-5 flex items-center gap-2.5">
                <area.Icon className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {area.label}
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {area.items.map((it) => (
                  <li
                    key={it}
                    className="flex items-start gap-2.5 text-base leading-snug text-muted-foreground"
                  >
                    <span className="bg-brand/60 mt-[7px] h-1 w-1 flex-shrink-0 rounded-full" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </StaggerReveal>
      </div>

      <div className="mt-16 border-t pt-10">
        <p className="mb-5 px-4 text-[11px] uppercase tracking-widest text-muted-foreground md:container md:mx-auto md:max-w-6xl">
          Herramientas
        </p>
        <Marquee>
          {tools.map((skill) => (
            <ToolChip key={skill.name} skill={skill} />
          ))}
        </Marquee>
      </div>
    </section>
  )
}
