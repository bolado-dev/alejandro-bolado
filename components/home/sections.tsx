import Link from "next/link"

import { Marquee } from "@/components/animated/marquee"
import {
  SiBurpsuite,
  SiDocker,
  SiGit,
  SiGnubash,
  SiHackthebox,
  SiKalilinux,
  SiLinux,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiWireshark,
  SiDavinciresolve,
} from "@icons-pack/react-simple-icons"

import {
  InkContainer,
  InkDivider,
  InkEyebrow,
  InkSection,
  MoreLink,
  StackPill,
  StatusDot,
} from "@/components/ink"
import { Highlighted } from "@/components/home/prose"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InkReveal, InkStagger } from "@/components/ink-reveal"
import { GithubIcon } from "@/components/icons/github-icon"
import { ArrowUpRight, Camera } from "@/components/icons/solar"
import {
  ABOUT,
  ARCHIVE,
  INTRO,
  PROFILE,
  PROJECTS,
  QUOTE,
  STACK,
  TOOLS,
} from "@/lib/home-data"

type IconCmp = React.ComponentType<{ className?: string }>

/** El paquete de simple-icons no incluye marcas de Adobe; se usa un genérico. */
const ICONS: Record<string, IconCmp> = {
  typescript: SiTypescript,
  react: SiReact,
  nextdotjs: SiNextdotjs,
  nodedotjs: SiNodedotjs,
  python: SiPython,
  postgresql: SiPostgresql,
  tailwindcss: SiTailwindcss,
  docker: SiDocker,
  linux: SiLinux,
  git: SiGit,
  kalilinux: SiKalilinux,
  burpsuite: SiBurpsuite,
  wireshark: SiWireshark,
  hackthebox: SiHackthebox,
  davinciresolve: SiDavinciresolve,
  bash: SiGnubash,
  adobelightroom: Camera,
}

// ─── Intro ────────────────────────────────────────────────────────────────────

export function Intro() {
  return (
    <>
      <InkDivider />
      <InkContainer className="py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[200px_1fr]">
          <InkReveal>
            <InkEyebrow>Intro</InkEyebrow>
          </InkReveal>
          <InkStagger
            className="max-w-[46ch] space-y-7 text-[clamp(1.15rem,2.2vw,1.6rem)] leading-[1.45]"
            step={90}
          >
            {INTRO.map((p, i) => (
              <p key={i}>
                <Highlighted text={p.text} strong={p.strong} />
              </p>
            ))}
          </InkStagger>
        </div>
      </InkContainer>
    </>
  )
}

// ─── Trabajo seleccionado ─────────────────────────────────────────────────────

export function SelectedWork() {
  return (
    <InkSection title="Trabajo seleccionado" revealContent={false}>
      <InkStagger className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2" step={90}>
        {PROJECTS.map((p) => (
          <article key={p.title} className="flex flex-col">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt=""
                aria-hidden
                className="mb-5 aspect-[16/10] w-full rounded-3xl border border-[var(--ink-line)] object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="mb-5 flex aspect-[16/10] w-full items-center justify-center rounded-3xl border border-[var(--ink-line)] bg-[var(--ink-surface)]"
              >
                <span className="font-display text-5xl text-[var(--ink-line-strong)] italic">
                  {p.title.slice(0, 2)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                {p.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.icon}
                    alt=""
                    aria-hidden
                    className="size-10 shrink-0 rounded-xl border border-[var(--ink-line-strong)]"
                  />
                ) : null}
                <h3 className="text-[1.25rem] font-medium text-[var(--ink-fg-strong)]">
                  {p.title}
                </h3>
              </div>
              <span className="shrink-0 text-[13px] text-[var(--ink-fg-dim)]">
                {p.year}
              </span>
            </div>
            <div className="mt-1.5">
              <StatusDot status={p.status} />
            </div>
            <p className="mt-3 text-[15px] leading-[1.65]">{p.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <StackPill key={s}>{s}</StackPill>
              ))}
            </div>
            {p.live || p.repo ? (
              <div className="mt-4 flex gap-2">
                {p.live ? (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-[var(--ink-line-strong)] px-4 py-2 text-[13px] transition-colors hover:border-[var(--ink-accent)] hover:text-[var(--ink-accent)]"
                  >
                    Live <ArrowUpRight className="size-3" />
                  </a>
                ) : null}
                {p.repo ? (
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-[var(--ink-line-strong)] px-4 py-2 text-[13px] transition-colors hover:border-[var(--ink-accent)] hover:text-[var(--ink-accent)]"
                  >
                    <GithubIcon className="size-3.5" /> GitHub
                  </a>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </InkStagger>
      <MoreLink href="/#proyectos">Ver todos</MoreLink>
    </InkSection>
  )
}

// ─── Sobre mí ─────────────────────────────────────────────────────────────────

export function AboutMe() {
  return (
    <InkSection eyebrow="Sobre mí" title="Quién hay detrás" revealContent={false}>
      <InkStagger
        className="grid grid-cols-1 gap-10 sm:grid-cols-[320px_1fr]"
        step={120}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PROFILE.portrait}
          alt={PROFILE.name}
          className="w-full rounded-3xl border border-[var(--ink-line)] bg-[var(--ink-surface)] object-cover"
        />
        <div>
          <h3 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight text-[var(--ink-fg-strong)] italic">
            {PROFILE.name}
          </h3>
          <div className="mt-5 space-y-4 text-[16px] leading-[1.7]">
            {ABOUT.map((p, i) => (
              <p key={i}>
                <Highlighted text={p.text} strong={p.strong} />
              </p>
            ))}
          </div>
          <h4 className="mt-10 text-[12px] font-medium tracking-[0.18em] text-[var(--ink-accent)] uppercase">
            Herramientas
          </h4>
          <div className="mt-4 flex flex-wrap gap-3">
            {TOOLS.map((t) => {
              const Icon = ICONS[t.slug]
              return (
                <Tooltip key={t.name}>
                  <TooltipTrigger asChild>
                    <span
                      tabIndex={0}
                      className="flex size-11 cursor-default items-center justify-center rounded-2xl border border-[var(--ink-line-strong)] bg-[var(--ink-surface)] transition-colors hover:border-[var(--ink-accent)] hover:bg-[var(--ink-surface-hi)] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current"
                    >
                      {Icon ? (
                        <Icon className="size-[21px]" />
                      ) : (
                        <span className="text-[11px]">{t.name[0]}</span>
                      )}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t.name}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </InkStagger>
    </InkSection>
  )
}

// ─── Stack ────────────────────────────────────────────────────────────────────

export function Stack() {
  // En bucle: el marquee duplica a sus hijos, así que la lista se repite para
  // que no se vea el corte en pantallas anchas.
  const chips = [...STACK, ...STACK]
  return (
    <InkSection title="Stack que uso">
      <p className="-mt-8 mb-10 text-[16px] text-[var(--ink-fg-dim)]">
        Las herramientas con las que construyo.
      </p>
      <Marquee
        speed={28}
        fadeFrom="from-[var(--ink-bg)]"
        className="mx-[calc(50%-50vw)] w-screen [mask-image:none]"
      >
        {chips.map((s, i) => {
          const Icon = ICONS[s.slug]
          return (
            <div
              key={`${s.slug}-${i}`}
              className="mx-2 flex w-[150px] shrink-0 flex-col items-center justify-center gap-3 rounded-3xl border border-[var(--ink-line)] bg-[var(--ink-surface)] px-2 py-8"
            >
              {Icon ? <Icon className="size-7" /> : null}
              <span className="text-[13px] text-[var(--ink-fg-dim)]">
                {s.name}
              </span>
            </div>
          )
        })}
      </Marquee>
    </InkSection>
  )
}

// ─── Archivo ──────────────────────────────────────────────────────────────────

export function Archive() {
  return (
    <InkSection title="Archivo" revealContent={false}>
      <InkStagger as="ul" className="divide-y divide-[var(--ink-line)]">
        {ARCHIVE.map((a) => (
          <li key={a.href}>
            <Link
              href={a.href}
              className="group flex items-baseline justify-between gap-6 py-6 first:pt-0"
            >
              <div>
                <h3 className="text-[1.15rem] text-[var(--ink-fg-strong)] transition-colors group-hover:text-[var(--ink-accent)]">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-[15px] text-[var(--ink-fg-dim)]">
                  {a.description}
                </p>
              </div>
              <span className="shrink-0 text-[13px] text-[var(--ink-fg-dim)]">
                {a.year}
              </span>
            </Link>
          </li>
        ))}
      </InkStagger>
    </InkSection>
  )
}

// ─── Cierre: CTA, cita, contacto y pie ────────────────────────────────────────

export function Closing() {
  return (
    <>
      <InkDivider />
      <InkContainer className="py-24 sm:py-32">
        <InkStagger step={110}>
          <p className="font-display mx-auto max-w-[18ch] text-center text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] text-[var(--ink-fg-strong)] italic">
            Si has llegado hasta aquí, igual te interesa lo que hago.
          </p>
          <div className="mt-10 flex justify-center">
            <a
              href={`mailto:${PROFILE.email}`}
              className="flex items-center gap-3 rounded-full bg-[var(--ink-accent-strong)] py-2 pr-7 pl-2 text-[16px] font-medium text-white transition-colors hover:bg-[var(--ink-accent)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PROFILE.avatar}
                alt=""
                aria-hidden
                className="size-9 rounded-full object-cover"
              />
              Hablemos
            </a>
          </div>

          <figure className="mx-auto mt-20 max-w-[380px] rounded-3xl border border-[var(--ink-line)] bg-[var(--ink-surface)] p-8">
            <span
              aria-hidden
              className="font-display block text-2xl leading-none text-[var(--ink-fg-dim)]"
            >
              &rdquo;
            </span>
            <blockquote className="font-display mt-3 text-center text-[1.25rem] leading-snug text-[var(--ink-fg-strong)] italic">
              {QUOTE.text}
            </blockquote>
            {QUOTE.author ? (
              <figcaption className="font-display mt-3 text-right text-[14px] text-[var(--ink-fg-dim)] italic">
                — {QUOTE.author}
              </figcaption>
            ) : null}
          </figure>
        </InkStagger>
      </InkContainer>
    </>
  )
}
