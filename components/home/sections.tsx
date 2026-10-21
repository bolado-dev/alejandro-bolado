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
  InkSection,
  MoreLink,
  StackPill,
  StatusDot,
} from "@/components/ink"
import { Highlighted } from "@/components/home/prose"
import { InkReveal, InkStagger } from "@/components/ink-reveal"
import { GithubIcon } from "@/components/icons/github-icon"
import { LinkedinIcon } from "@/components/icons/linkedin-icon"
import { ArrowUpRight, Camera, Mail } from "@/components/icons/solar"
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
      <InkContainer className="py-10 text-[18px] leading-[1.625]">
        <InkStagger className="space-y-5" step={90}>
          {INTRO.map((p, i) => (
            <p key={i}>
              <Highlighted text={p.text} strong={p.strong} />
            </p>
          ))}
        </InkStagger>
      </InkContainer>
    </>
  )
}

// ─── Trabajo seleccionado ─────────────────────────────────────────────────────

export function SelectedWork() {
  return (
    <InkSection title="Trabajo seleccionado" revealContent={false}>
      <InkStagger className="grid grid-cols-1 gap-7 sm:grid-cols-2" step={90}>
        {PROJECTS.map((p) => (
          <article key={p.title} className="flex flex-col">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt=""
                aria-hidden
                className="mb-3 aspect-[16/10] w-full rounded-3xl border border-[var(--ink-line)] object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="mb-3 flex aspect-[16/10] w-full items-center justify-center rounded-3xl border border-[var(--ink-line)] bg-[var(--ink-surface)]"
              >
                <span className="font-display text-5xl italic text-[var(--ink-line-strong)]">
                  {p.title.slice(0, 2)}
                </span>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[15px] font-medium text-[var(--ink-fg-strong)]">
                {p.title}
              </h3>
              <span className="shrink-0 text-[13px] text-[var(--ink-fg-dim)]">
                {p.year}
              </span>
            </div>
            <div className="mt-1.5">
              <StatusDot status={p.status} />
            </div>
            <p className="mt-2 text-[14px] leading-[1.6]">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
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
                    className="flex items-center gap-1.5 rounded-full border border-[var(--ink-line-strong)] px-2.5 py-1.5 text-[13px] transition-colors hover:bg-[var(--ink-surface-hi)] hover:text-[var(--ink-fg-strong)]"
                  >
                    Live <ArrowUpRight className="size-3" />
                  </a>
                ) : null}
                {p.repo ? (
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-[var(--ink-line-strong)] px-2.5 py-1.5 text-[13px] transition-colors hover:bg-[var(--ink-surface-hi)] hover:text-[var(--ink-fg-strong)]"
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
    <InkSection eyebrow="Sobre mí" title="Mí" revealContent={false}>
      <InkStagger
        className="grid grid-cols-1 gap-7 sm:grid-cols-[218px_1fr]"
        step={120}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PROFILE.portrait}
          alt={PROFILE.name}
          className="w-full rounded-3xl border border-[var(--ink-line)] bg-[var(--ink-surface)] object-cover"
        />
        <div>
          <h3 className="font-display text-3xl italic text-[var(--ink-fg-strong)]">
            {PROFILE.name}
          </h3>
          <div className="mt-3 space-y-3 text-[14px] leading-[1.65]">
            {ABOUT.map((p, i) => (
              <p key={i}>
                <Highlighted text={p.text} strong={p.strong} />
              </p>
            ))}
          </div>
          <h4 className="mt-6 text-[14px] font-medium text-[var(--ink-fg-strong)]">
            Herramientas
          </h4>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {TOOLS.map((t) => {
              const Icon = ICONS[t.slug]
              return (
                <span
                  key={t.name}
                  title={t.name}
                  className="flex size-8 items-center justify-center rounded-full border border-[var(--ink-line-strong)] bg-[var(--ink-surface)]"
                >
                  {Icon ? (
                    <Icon className="size-[17px]" />
                  ) : (
                    <span className="text-[11px]">{t.name[0]}</span>
                  )}
                </span>
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
      <p className="-mt-4 mb-6 text-[14px] text-[var(--ink-fg-dim)]">
        Las herramientas con las que construyo.
      </p>
      <Marquee
        speed={28}
        fadeFrom="from-[var(--ink-bg)]"
        className="-mx-8 [mask-image:none]"
      >
        {chips.map((s, i) => {
          const Icon = ICONS[s.slug]
          return (
            <div
              key={`${s.slug}-${i}`}
              className="mx-1.5 flex w-[132px] shrink-0 flex-col items-center justify-center gap-2 rounded-3xl border border-[var(--ink-line-strong)] bg-[var(--ink-surface)] px-2 py-6"
            >
              {Icon ? <Icon className="size-6" /> : null}
              <span className="text-[12px] text-[var(--ink-fg-dim)]">
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
              className="group flex items-baseline justify-between gap-6 py-4 first:pt-0"
            >
              <div>
                <h3 className="text-[15px] text-[var(--ink-fg-strong)]">
                  {a.title}
                </h3>
                <p className="mt-1 text-[14px] text-[var(--ink-fg-dim)]">
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
      <InkContainer className="py-14">
        <InkStagger step={110}>
        <p className="font-display text-center text-[21px] italic text-[var(--ink-fg-strong)]">
          Si has llegado hasta aquí, igual te interesa lo que hago.
        </p>
        <div className="mt-6 flex justify-center">
          <a
            href={`mailto:${PROFILE.email}`}
            className="flex items-center gap-2 rounded-full border border-[var(--ink-line-strong)] bg-[var(--ink-surface)] py-1.5 pl-1.5 pr-4 text-[14px] transition-colors hover:bg-[var(--ink-surface-hi)] hover:text-[var(--ink-fg-strong)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PROFILE.avatar}
              alt=""
              aria-hidden
              className="size-6 rounded-full object-cover"
            />
            Hablemos
          </a>
        </div>

        <figure className="mx-auto mt-12 max-w-[226px] rounded-3xl border border-[var(--ink-line-strong)] bg-[var(--ink-surface)] p-5">
          <span
            aria-hidden
            className="font-display block text-2xl leading-none text-[var(--ink-fg-dim)]"
          >
            &rdquo;
          </span>
          <blockquote className="font-display mt-2 text-center text-[15px] italic text-[var(--ink-fg-strong)]">
            {QUOTE.text}
          </blockquote>
          {QUOTE.author ? (
            <figcaption className="font-display mt-3 text-right text-[14px] italic text-[var(--ink-fg-dim)]">
              — {QUOTE.author}
            </figcaption>
          ) : null}
        </figure>
        </InkStagger>
      </InkContainer>

      <InkDivider />
      <InkContainer className="py-12">
        <InkReveal>
        <h2 className="font-display text-xl italic">Conectemos</h2>
        <p className="mt-5 text-[15px] text-[var(--ink-fg-strong)]">
          Me encuentras aquí
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {[
            { href: PROFILE.github, label: "GitHub", Icon: GithubIcon },
            { href: PROFILE.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
            { href: `mailto:${PROFILE.email}`, label: "Correo", Icon: Mail },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center gap-2 rounded-full border border-[var(--ink-line-strong)] px-3 py-2 text-[14px] transition-colors hover:bg-[var(--ink-surface-hi)] hover:text-[var(--ink-fg-strong)]"
            >
              <Icon className="size-4" /> {label}
            </a>
          ))}
          </div>
        </InkReveal>
      </InkContainer>
    </>
  )
}
