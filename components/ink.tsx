import { InkReveal } from "@/components/ink-reveal"
import { cn } from "@/lib/utils"

/**
 * Primitivos de la home.
 *
 * El contenedor mide 1200px y no dibuja retícula: las secciones se separan por
 * aire y por una hairline que se desvanece en los extremos, no por raíles
 * punteados. Los rótulos de sección van en serif a tamaño grande, con un
 * antetítulo en el azul de marca.
 */

const CONTAINER = "mx-auto w-full max-w-[1200px] px-6 sm:px-10"

/** Línea de separación entre secciones, a sangre completa. */
export function InkDivider() {
  return (
    <div aria-hidden className="relative h-px w-full">
      <div className="ink-hr absolute inset-0" />
    </div>
  )
}

type InkSectionProps = {
  children: React.ReactNode
  /** Rótulo en serif que abre la sección ("Experience", "Selected Work"…). */
  title?: string
  /** Rótulo pequeño encima del título ("About"). */
  eyebrow?: string
  className?: string
  id?: string
  /** `false` quita la línea superior (solo la portada la necesita). */
  divider?: boolean
  /**
   * `false` cuando el contenido trae su propia cascada (InkStagger): evita
   * que se anime el bloque entero y además cada hijo.
   */
  revealContent?: boolean
}

/** Antetítulo en el azul de marca: versalitas pequeñas sobre el rótulo. */
export function InkEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[12px] font-medium tracking-[0.18em] text-[var(--ink-accent)] uppercase">
      {children}
    </p>
  )
}

/** Rótulo de sección: serif itálica, grande. */
export function InkTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        "font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.01em] text-[var(--ink-fg-strong)] italic",
        className,
      )}
    >
      {children}
    </h2>
  )
}

export function InkSection({
  children,
  title,
  eyebrow,
  className,
  id,
  divider = true,
  revealContent = true,
}: InkSectionProps) {
  return (
    <>
      {divider ? <InkDivider /> : null}
      <section id={id} className="relative">
        <div className={cn(CONTAINER, "ink-rail py-20 sm:py-28", className)}>
          {eyebrow || title ? (
            <InkReveal className="mb-12">
              {eyebrow ? <InkEyebrow>{eyebrow}</InkEyebrow> : null}
              {title ? <InkTitle>{title}</InkTitle> : null}
            </InkReveal>
          ) : null}
          {revealContent ? (
            <InkReveal delay={eyebrow || title ? 90 : 0}>{children}</InkReveal>
          ) : (
            children
          )}
        </div>
      </section>
    </>
  )
}

/** Contenedor sin rótulo ni padding vertical, para la portada. */
export function InkContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn(CONTAINER, "ink-rail", className)}>{children}</div>
}

/** Etiqueta de stack: píldora de borde sutil. */
export function StackPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--ink-line-strong)] px-3 py-1 text-[13px] text-[var(--ink-fg-dim)]">
      {children}
    </span>
  )
}

const STATUS_COLOR: Record<string, string> = {
  Activo: "var(--ink-ok)",
  Completado: "var(--ink-fg-dim)",
  Archivado: "var(--ink-fg-dim)",
}

/** Punto + etiqueta de estado de un proyecto. */
export function StatusDot({ status }: { status: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[13px] text-[var(--ink-fg-dim)]">
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{ backgroundColor: STATUS_COLOR[status] ?? "var(--ink-fg-dim)" }}
      />
      {status}
    </span>
  )
}

/** Enlace "View All →" alineado a la derecha. */
export function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <div className="mt-12 flex justify-end">
      <a
        href={href}
        className="group inline-flex items-center gap-2 rounded-full border border-[var(--ink-line-strong)] px-5 py-2.5 text-[14px] text-[var(--ink-fg)] transition-colors hover:border-[var(--ink-accent)] hover:text-[var(--ink-accent)]"
      >
        {children}
        <span
          aria-hidden
          className="transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </a>
    </div>
  )
}
