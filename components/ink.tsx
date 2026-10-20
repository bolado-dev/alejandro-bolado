import { cn } from "@/lib/utils"

/**
 * Primitivos de la home.
 *
 * El contenedor mide 1008px (contenido de 944 + 32 de padding a cada lado) y
 * lleva raíles verticales punteados en sus bordes. Cada sección abre con una
 * línea horizontal punteada a sangre completa, y en los dos cruces con los
 * raíles se dibuja una marca `+`. Las medidas salen de la retícula de
 * referencia: contenido 944, columnas de 458 con 28 de gap.
 */

const CONTAINER = "mx-auto w-full max-w-[1008px] px-8"

/** Cruz de 9px en la intersección de la línea de sección con un raíl. */
function Crosshair({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("absolute block h-[9px] w-[9px]", className)}
    >
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--ink-line-strong)]" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[var(--ink-line-strong)]" />
    </span>
  )
}

/** Línea punteada a sangre completa con las dos marcas `+` en los raíles. */
export function InkDivider() {
  return (
    <div aria-hidden className="relative h-px w-full">
      <div className="ink-hr absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0">
        <div className={cn(CONTAINER, "relative")}>
          <Crosshair className="-left-[4px] -top-[4px]" />
          <Crosshair className="-right-[4px] -top-[4px]" />
        </div>
      </div>
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
}

export function InkSection({
  children,
  title,
  eyebrow,
  className,
  id,
  divider = true,
}: InkSectionProps) {
  return (
    <>
      {divider ? <InkDivider /> : null}
      <section id={id} className="relative">
        <div className={cn(CONTAINER, "ink-rail py-12", className)}>
          {eyebrow ? (
            <p className="mb-1 text-[13px] text-[var(--ink-fg-dim)]">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="font-display mb-7 text-xl italic">{title}</h2>
          ) : null}
          {children}
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

/** Píldora de stack: borde sutil, texto pequeño. */
export function StackPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--ink-line-strong)] px-2.5 py-1 text-[13px] text-[var(--ink-fg-dim)]">
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
    <div className="mt-8 flex justify-end">
      <a
        href={href}
        className="text-[13px] text-[var(--ink-fg-dim)] transition-colors hover:text-[var(--ink-fg-strong)]"
      >
        {children} <span aria-hidden>→</span>
      </a>
    </div>
  )
}
