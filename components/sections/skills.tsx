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

export function Skills() {
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
