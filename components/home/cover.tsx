import { InkContainer } from "@/components/ink"
import { InkReveal, InkStagger } from "@/components/ink-reveal"
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
    <InkContainer className="pt-0 pb-10">
      <InkReveal className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PROFILE.banner}
          alt=""
          aria-hidden
          className="h-[clamp(160px,30vw,268px)] w-full object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-[var(--ink-bg)]/35" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[var(--ink-bg)] via-transparent to-transparent"
        />
        <p className="font-display absolute inset-x-0 bottom-3 px-6 text-center text-[13px] text-white/90 italic drop-shadow-[0_1px_8px_rgba(0,0,0,0.75)] sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:text-[15px]">
          {PROFILE.tagline}
        </p>
      </InkReveal>

      {/* El avatar monta sobre el borde inferior del banner */}
      <InkReveal
        className="relative z-10 -mt-[36px] flex items-end justify-between gap-6 sm:-mt-[46px]"
        delay={120}
      >
        <span className="flex size-[72px] shrink-0 items-center justify-center rounded-full border-[3px] border-[var(--ink-bg)] bg-[var(--ink-surface-hi)] sm:size-[92px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PROFILE.logo}
            alt={PROFILE.name}
            className="h-[26px] w-auto object-contain sm:h-[34px]"
          />
        </span>
      </InkReveal>

      <InkStagger
        className="mt-4 flex flex-wrap items-center justify-between gap-y-4"
        delay={200}
        step={110}
      >
        <div>
          <h1 className="font-display text-4xl tracking-[0.01em] text-[var(--ink-fg-strong)] italic">
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
      </InkStagger>
    </InkContainer>
  )
}
