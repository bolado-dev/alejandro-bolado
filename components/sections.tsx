export function About() {
  return (
    <section id="about" className="px-4 py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Sobre mí</h2>
          <p className="mt-4 text-muted-foreground">Conoce más sobre mí</p>
        </div>
        <div className="rounded-lg border bg-card p-8">
          <p className="text-center text-muted-foreground">
            Soy un desarrollador apasionado con experiencia creando aplicaciones
            web modernas. Me encanta resolver problemas complejos y crear
            experiencias de usuario intuitivas. Cuando no programo, me
            encontrarás explorando nuevas tecnologías o contribuyendo a
            proyectos open source.
          </p>
        </div>
      </div>
    </section>
  )
}

export function Skills() {
  const skills = [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "Tailwind CSS",
    "PostgreSQL",
    "Docker",
  ]

  return (
    <section id="skills" className="px-4 py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Habilidades</h2>
          <p className="mt-4 text-muted-foreground">
            Tecnologías con las que trabajo
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Projects() {
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

export function Experience() {
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

export function Education() {
  const education = [
    {
      id: 1,
      degree: "Grado en Informática",
      school: "Universidad",
      period: "2014 - 2018",
      description: "Formación en desarrollo de software",
    },
    {
      id: 2,
      degree: "Máster en Desarrollo Web",
      school: "Instituto",
      period: "2018 - 2020",
      description: "Especialización en tecnologías web",
    },
  ]

  return (
    <section id="education" className="px-4 py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Educación</h2>
          <p className="mt-4 text-muted-foreground">Mi formación académica</p>
        </div>
        <div className="space-y-6">
          {education.map((edu) => (
            <div key={edu.id} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-sm text-primary">{edu.school}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {edu.period}
                </span>
              </div>
              <p className="mt-2 text-muted-foreground">{edu.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Achievements() {
  const achievements = [
    {
      id: 1,
      title: "Mejor Proyecto",
      description: "Award por el proyecto más innovador",
    },
    {
      id: 2,
      title: "Open Source",
      description: "Contribuidor activo en proyectos open source",
    },
    {
      id: 3,
      title: "Certificaciones",
      description: "AWS Certified Developer, Google Cloud Professional",
    },
  ]

  return (
    <section id="achievements" className="px-4 py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Logros</h2>
          <p className="mt-4 text-muted-foreground">Reconocimientos y extras</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="rounded-lg border bg-card p-6 text-center"
            >
              <h3 className="font-semibold">{achievement.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section id="contact" className="px-4 py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Contacto</h2>
          <p className="mt-4 text-muted-foreground">Ponte en contacto</p>
        </div>
        <div className="mx-auto max-w-md rounded-lg border bg-card p-8">
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mensaje</label>
              <textarea
                placeholder="Tu mensaje"
                rows={4}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              />
            </div>
            <button
              type="button"
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Enviar mensaje
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
