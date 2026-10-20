import { InkContainer } from "@/components/ink"
import { GithubIcon } from "@/components/icons/github-icon"
import { LinkedinIcon } from "@/components/icons/linkedin-icon"
import { Mail } from "@/components/icons/solar"
import { PROFILE } from "@/lib/home-data"

/** Botón social circular de cristal. */
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
      className="flex size-[34px] items-center justify-center rounded-full border border-[var(--ink-line-strong)] bg-[var(--ink-surface)] text-[var(--ink-fg)] transition-colors hover:bg-[var(--ink-surface-hi)] hover:text-[var(--ink-fg-strong)]"
    >
      {children}
    </a>
  )
}

/**
 * Portada: banner a lo ancho del contenedor con la frase en serif itálica
 * encima, avatar circular solapando el borde inferior, y nombre + rol a la
 * izquierda con los sociales a la derecha.
 */
export function Cover() {
  return (
    <InkContainer className="pb-10 pt-0">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PROFILE.banner}
          alt=""
          aria-hidden
          className="h-[268px] w-full object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[var(--ink-bg)]/35"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[var(--ink-bg)] via-transparent to-transparent"
        />
        <p className="font-display absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[15px] italic text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
          {PROFILE.tagline}
        </p>
      </div>

      {/* El avatar monta sobre el borde inferior del banner */}
      <div className="relative z-10 -mt-[46px] flex items-end justify-between gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PROFILE.avatar}
          alt={PROFILE.name}
          className="size-[92px] shrink-0 rounded-full border-[3px] border-[var(--ink-bg)] object-cover"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-4">
        <div>
          <h1 className="font-display text-4xl italic tracking-[0.01em] text-[var(--ink-fg-strong)]">
            {PROFILE.name}
          </h1>
          <p className="mt-1 text-[14px] text-[var(--ink-fg-dim)]">
            {PROFILE.role} · {PROFILE.location}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SocialButton href={PROFILE.github} label="GitHub">
            <GithubIcon className="size-[15px]" />
          </SocialButton>
          <SocialButton href={PROFILE.linkedin} label="LinkedIn">
            <LinkedinIcon className="size-[15px]" />
          </SocialButton>
          <SocialButton href={`mailto:${PROFILE.email}`} label="Correo">
            <Mail className="size-4" />
          </SocialButton>
        </div>
      </div>
    </InkContainer>
  )
}
