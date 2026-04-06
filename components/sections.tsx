import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

// ─── ABOUT ────────────────────────────────────────────────────────────────────

export function About() {
  return (
    <section id="about" className="px-4 py-20 border-b">
      <div className="container mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-12">
          Sobre mí
        </p>
        <div className="grid grid-cols-[100px_1fr] gap-10 items-start">
          <div className="w-[100px] h-[100px] rounded-lg border bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src="/alejandro.png"
              alt="Alejandro Bolado"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-medium mb-1">Alejandro Bolado</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Full Stack Developer · Madrid, España
            </p>
            <p className="text-[15px] leading-[1.75] text-muted-foreground">
              Desarrollo aplicaciones web modernas con énfasis en arquitectura
              limpia y experiencias de usuario precisas. Me especializo en el
              stack React/Next.js con TypeScript y en construir productos SaaS
              escalables desde cero.
            </p>
            <p className="text-[15px] leading-[1.75] text-muted-foreground mt-4">
              Cuando no estoy programando, exploro nuevas tecnologías,
              contribuyo a proyectos open source o me pierdo en el mundo JDM.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────

const stack = {
  Frontend: ["React · Next.js", "TypeScript", "Tailwind CSS"],
  Backend: ["Node.js", "Python", "PostgreSQL"],
  Infra: ["Docker", "Vercel · AWS", "Git"],
}

export function Skills() {
  return (
    <section id="skills" className="px-4 py-20 border-b">
      <div className="container mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-12">
          Stack tecnológico
        </p>
        <div className="grid grid-cols-3 divide-x border-b">
          {Object.entries(stack).map(([category, items]) => (
            <div key={category} className="pb-6 pr-6 first:pl-0 pl-6">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
                {category}
              </p>
              <div className="flex flex-col gap-1.5">
                {items.map((item) => (
                  <span key={item} className="text-sm font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

const projects = [
  {
    id: 1,
    title: "Hawkr",
    category: "SaaS · Web App",
    description:
      "Plataforma de inteligencia y monitorización de redes sociales. Dashboard con análisis multi-perfil, comparativas y exportación de datos.",
    tags: ["Next.js", "TypeScript", "Recharts"],
    href: "#",
  },
  {
    id: 2,
    title: "Proyecto Dos",
    category: "Dashboard · Analytics",
    description:
      "Dashboard de análisis con datos en tiempo real y visualizaciones interactivas para equipos de producto.",
    tags: ["React", "PostgreSQL", "Node.js"],
    href: "#",
  },
  {
    id: 3,
    title: "Proyecto Tres",
    category: "API · Backend",
    description:
      "API RESTful con autenticación JWT, rate limiting y documentación OpenAPI completa.",
    tags: ["Node.js", "Docker", "PostgreSQL"],
    href: "#",
  },
]

export function Projects() {
  return (
    <section id="projects" className="px-4 py-20 border-b">
      <div className="container mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-12">
          Proyectos
        </p>
        <div className="flex flex-col">
          {projects.map((project, i) => (
            <div
              key={project.id}
              className={`grid grid-cols-[1fr_2fr] gap-8 py-6 items-start ${
                i < projects.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="aspect-video bg-muted rounded-md border" />
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  {project.category}
                </p>
                <h3 className="text-[15px] font-medium mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground leading-[1.65]">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────

const jobs = [
  {
    id: 1,
    role: "Senior Developer",
    company: "Tech Company",
    period: "2022 – Hoy",
    description:
      "Liderando el desarrollo de aplicaciones web de alto tráfico. Arquitectura de sistemas, revisiones de código y mentoría de equipo junior.",
  },
  {
    id: 2,
    role: "Full Stack Developer",
    company: "Startup",
    period: "2020 – 2022",
    description:
      "Construí desde cero aplicaciones escalables para B2B. Implementé infraestructura CI/CD y reduje el tiempo de despliegue un 60%.",
  },
  {
    id: 3,
    role: "Junior Developer",
    company: "Agency",
    period: "2018 – 2020",
    description:
      "Desarrollé proyectos web para clientes de distintos sectores. Primeros pasos con React y arquitecturas REST.",
  },
]

export function Experience() {
  return (
    <section id="experience" className="px-4 py-20 border-b">
      <div className="container mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-12">
          Experiencia
        </p>
        <div className="flex flex-col">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className={`grid grid-cols-[120px_1fr] gap-8 py-6 ${
                i < jobs.length - 1 ? "border-b" : ""
              }`}
            >
              <p className="text-sm text-muted-foreground">{job.period}</p>
              <div>
                <h3 className="text-[15px] font-medium">{job.role}</h3>
                <p className="text-[13px] text-muted-foreground mt-0.5 mb-3">
                  {job.company}
                </p>
                <p className="text-sm text-muted-foreground leading-[1.65]">
                  {job.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── EDUCATION + ACHIEVEMENTS ─────────────────────────────────────────────────

export function Education() {
  return (
    <section id="education" className="px-4 py-20 border-b">
      <div className="container mx-auto max-w-3xl">
        <div className="grid grid-cols-2 gap-16">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-12">
              Educación
            </p>
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-[15px] font-medium">Grado en Ingeniería Informática</h3>
                <p className="text-[13px] text-muted-foreground mt-1 mb-2">
                  Universidad · 2014 – 2018
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fundamentos de software, algoritmos y sistemas distribuidos.
                </p>
              </div>
              <div>
                <h3 className="text-[15px] font-medium">Máster en Desarrollo Web</h3>
                <p className="text-[13px] text-muted-foreground mt-1 mb-2">
                  Instituto · 2018 – 2020
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Especialización en tecnologías web modernas y arquitectura frontend.
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-12">
              Reconocimientos
            </p>
            <div className="flex flex-col gap-8">
              {[
                { title: "AWS Certified Developer", sub: "Amazon Web Services · Professional" },
                { title: "Google Cloud Professional", sub: "Google Cloud Platform · Certified" },
                { title: "Open Source Contributor", sub: "Contribuidor activo en proyectos de la comunidad." },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-[15px] font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────

export function Contact() {
  return (
    <section id="contact" className="px-4 py-20">
      <div className="container mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-12">
          Contacto
        </p>
        <div className="grid grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-2xl font-medium leading-snug mb-4">
              ¿Tienes un proyecto en mente?
            </h2>
            <p className="text-[15px] text-muted-foreground leading-[1.7]">
              Estoy disponible para proyectos freelance y nuevas oportunidades.
              Escríbeme y hablamos.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">hola@alejandro.dev</p>
              <p className="text-sm text-muted-foreground">github.com/bolado-dev</p>
              <p className="text-sm text-muted-foreground">linkedin.com/in/alejandro</p>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Nombre
              </Label>
              <Input placeholder="Tu nombre" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Email
              </Label>
              <Input type="email" placeholder="tu@email.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Mensaje
              </Label>
              <Textarea placeholder="Cuéntame tu proyecto..." rows={4} />
            </div>
            <Button className="w-full">Enviar mensaje</Button>
          </div>
        </div>
      </div>
    </section>
  )
}