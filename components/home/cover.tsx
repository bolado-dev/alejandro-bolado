import { InkStagger } from "@/components/ink-reveal"
import { GithubIcon } from "@/components/icons/github-icon"
import { LinkedinIcon } from "@/components/icons/linkedin-icon"
import { Mail } from "@/components/icons/solar"
import { PROFILE } from "@/lib/home-data"

/** Botón social circular. */
function SocialButton({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="flex size-11 items-center justify-center rounded-full border border-[var(--ink-line-strong)] bg-[var(--ink-surface)]/80 text-[var(--ink-fg)] backdrop-blur transition-colors hover:border-[var(--ink-accent)] hover:bg-[var(--ink-surface-hi)] hover:text-[var(--ink-fg-strong)]"
    >
      {children}
    </a>
  )
}

/**
 * Portada: imagen a sangre de pantalla completa con el nombre a tamaño de
 * cartel encima. El degradado inferior funde la foto con el fondo de la
 * página, así que el bloque no necesita borde ni marco.
 */
export function Cover() {
  return (
    <section className="relative">
      <div className="relative h-[clamp(420px,58vw,700px)] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PROFILE.banner}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-[var(--ink-bg)]/40" />
        {/* El fundido inferior ocupa la mitad baja de la foto: sobre él cae el
            nombre, y sin esta rampa el texto se pierde en la imagen. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-[var(--ink-bg)] from-25% via-[var(--ink-bg)]/55 to-transparent"
        />
      </div>

      {/* El bloque de identidad monta sobre el borde inferior de la imagen */}
      <div className="relative z-10 mx-auto -mt-[clamp(8rem,16vw,13rem)] w-full max-w-[1200px] px-6 pb-16 sm:px-10">
        <InkStagger className="flex flex-col gap-6" step={110}>
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--ink-line-strong)] bg-[var(--ink-surface-hi)] sm:size-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PROFILE.logo}
                alt={PROFILE.name}
                className="h-7 w-auto object-contain sm:h-9"
              />
            </span>
            <p className="font-display text-[clamp(1rem,2vw,1.35rem)] text-[var(--ink-fg)] italic">
              {PROFILE.tagline}
            </p>
          </div>

          <h1 className="font-display mt-2 text-[clamp(3rem,9.5vw,7.5rem)] leading-[0.95] tracking-[-0.02em] text-[var(--ink-fg-strong)] italic">
            {PROFILE.name}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-y-6">
            <p className="text-[clamp(0.95rem,1.4vw,1.1rem)] text-[var(--ink-fg-dim)]">
              {PROFILE.role} · {PROFILE.location}
            </p>
            <div className="flex items-center gap-3">
              <SocialButton href={PROFILE.github} label="GitHub">
                <GithubIcon className="size-[18px]" />
              </SocialButton>
              <SocialButton href={PROFILE.linkedin} label="LinkedIn">
                <LinkedinIcon className="size-[18px]" />
              </SocialButton>
              <SocialButton href={`mailto:${PROFILE.email}`} label="Correo">
                <Mail className="size-5" />
              </SocialButton>
            </div>
          </div>
        </InkStagger>
      </div>
    </section>
  )
}
