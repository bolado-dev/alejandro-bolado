const projects = [
  {
    id: 1,
    title: "Proyecto Uno",
    category: "Web App",
    description: "Una aplicación web moderna construida con Next.js",
  },
  {
    id: 2,
    title: "Proyecto Dos",
    category: "Mobile App",
    description: "Aplicación móvil multiplataforma",
  },
  {
    id: 3,
    title: "Proyecto Tres",
    category: "Design",
    description: "Sistema de diseño UI/UX",
  },
  {
    id: 4,
    title: "Proyecto Cuatro",
    category: "E-commerce",
    description: "Plataforma de comercio electrónico full-stack",
  },
  {
    id: 5,
    title: "Proyecto Cinco",
    category: "Dashboard",
    description: "Dashboard de análisis con datos en tiempo real",
  },
  {
    id: 6,
    title: "Proyecto Seis",
    category: "API",
    description: "API RESTful con autenticación",
  },
]

export function Projects() {
  return (
    <section id="projects" className="px-4 py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
          <p className="mt-4 text-muted-foreground">
            Echa un vistazo a mi trabajo reciente
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-lg border bg-card"
            >
              <div className="flex aspect-video items-center justify-center bg-muted">
                <span className="text-4xl">💼</span>
              </div>
              <div className="p-4">
                <p className="text-xs text-primary">{project.category}</p>
                <h3 className="mt-1 font-semibold">{project.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
