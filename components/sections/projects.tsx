import Link from "next/link"
import { ArrowUpRight, Terminal } from "lucide-react"
import { GithubIcon } from "@/components/icons/github-icon"

const projects = [
  {
    id: "boladobspwm",
    title: "BoladoBSPWM",
    category: "Entorno / Dotfiles",
    description:
      "Setup de escritorio personalizado para hacking y desarrollo sobre BSPWM. Incluye configuración de Polybar, Rofi, Kitty, Picom y scripts propios para un entorno enfocado en ciberseguridad.",
    href: "https://github.com/bolado-dev/BoladoBSPWM",
    featured: true,
  },
]

export function Projects() {
  return (
    <section id="projects" className="px-4 py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
          <p className="mt-4 text-muted-foreground">
            Proyectos públicos y herramientas propias
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-secondary"
            >
              <div className="flex aspect-video items-center justify-center bg-muted">
                <Terminal className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-primary uppercase tracking-widest">
                      {project.category}
                    </p>
                    <h3 className="mt-1 font-semibold text-lg">{project.title}</h3>
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GithubIcon className="h-3.5 w-3.5" />
                  <span>bolado-dev/BoladoBSPWM</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
