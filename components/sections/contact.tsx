import { Button } from "@/components/ui/button"

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
            <Button type="button" className="w-full">
              Enviar mensaje
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
