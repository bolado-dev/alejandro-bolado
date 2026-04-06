const jobs = [
  {
    id: 1,
    role: "Senior Developer",
    company: "Tech Company",
    period: "2022 - Presente",
    description: "Liderando desarrollo de aplicaciones web",
  },
  {
    id: 2,
    role: "Full Stack Developer",
    company: "Startup",
    period: "2020 - 2022",
    description: "Construí aplicaciones escalables desde cero",
  },
  {
    id: 3,
    role: "Junior Developer",
    company: "Agency",
    period: "2018 - 2020",
    description: "Desarrollé proyectos para clientes",
  },
]

export function Experience() {
  return (
    <section id="experience" className="px-4 py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Experiencia</h2>
          <p className="mt-4 text-muted-foreground">
            Mi trayectoria profesional
          </p>
        </div>
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{job.role}</h3>
                  <p className="text-sm text-primary">{job.company}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {job.period}
                </span>
              </div>
              <p className="mt-2 text-muted-foreground">{job.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
