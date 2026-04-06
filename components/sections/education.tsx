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

export function Education() {
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
