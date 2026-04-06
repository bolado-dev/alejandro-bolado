import { Card, CardContent } from "@/components/ui/card"

export function About() {
  return (
    <section id="about" className="px-4 py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Sobre mí</h2>
        </div>
        <Card className="mx-auto max-w-2xl overflow-hidden">
          <div className="grid gap-0 md:grid-cols-[280px_1fr]">
            <div className="relative aspect-square md:aspect-auto">
              <img
                src="/alejandro.png"
                alt="Alejandro Bolado"
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="flex flex-col justify-center p-8">
              <p className="leading-relaxed text-muted-foreground">
                Soy un desarrollador Full Stack apasionado con experiencia en la
                creación de aplicaciones web modernas. Me especializo en
                construir soluciones escalables y experiencias de usuario
                intuitivas.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Cuando no estoy programando, me encontrarás explorando nuevas
                tecnologías, contribuyendo a proyectos open source o disfrutando
                de los JDM.
              </p>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  )
}
