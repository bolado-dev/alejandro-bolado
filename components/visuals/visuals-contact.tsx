"use client"

import { useState } from "react"
import { SiInstagram } from "@icons-pack/react-simple-icons"
import { ArrowUpRight, Mail } from "@/components/icons/solar"
import { Reveal } from "@/components/animated/reveal"
import { VisualsMark } from "@/components/visuals/mark"

// Contacto de la submarca. Actualiza el email/handles si difieren de los del
// portfolio principal.
const EMAIL = "a.bolado.dev@gmail.com"

const links = [
  { label: "Email", href: `mailto:${EMAIL}`, Icon: Mail },
  { label: "Instagram", href: "https://instagram.com/bolado.visuals", Icon: SiInstagram },
]

const inputClass =
  "w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand"

export function VisualsContact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(
      `Bolado Visuals: consulta de ${name || "un proyecto"}`
    )
    const body = encodeURIComponent(
      `${message}\n\n${name}${email ? ` (${email})` : ""}`
    )
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <section id="contacto" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-2xl">
        <Reveal y={24}>
          <div className="text-center">
            <VisualsMark className="mx-auto h-10 w-auto text-brand" />
            <h2 className="visuals-display mt-8 text-[clamp(2.25rem,6vw,4rem)] leading-[1.03] text-balance">
              ¿Hablamos de tu proyecto?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-muted-foreground">
              Cuéntame qué necesitas: sesión, evento, marca o vídeo. Te
              respondo con ideas y presupuesto. Sin compromiso.
            </p>
          </div>
        </Reveal>

        <Reveal y={20} delay={0.12}>
          <form
            onSubmit={handleSubmit}
            className="mt-10 rounded-3xl border border-border bg-card p-6 md:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Nombre
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Mensaje
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Cuéntame tu proyecto…"
                className={`${inputClass} resize-none`}
              />
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90"
            >
              Enviar mensaje
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        </Reveal>

        <Reveal y={16} delay={0.2}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {links.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {label}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
