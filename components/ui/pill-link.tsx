import Link from "next/link"
import type { ComponentProps } from "react"
import { ArrowUpRight } from "@/components/icons/solar"
import { cn } from "@/lib/utils"

type PillLinkProps = ComponentProps<typeof Link> & {
  /** `inverted` = pensado para fondos oscuros (paneles bg-foreground). */
  variant?: "default" | "inverted"
}

/**
 * Botón-enlace de referencia del sitio: píldora (full rounded) con relleno
 * reactivo al hover. Úsalo para cualquier CTA principal en vez de estilos
 * ad-hoc (subrayados, esquinas cuadradas, etc.).
 */
export function PillLink({
  href,
  children,
  variant = "default",
  className,
  ...props
}: PillLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.03] active:scale-95",
        variant === "inverted"
          ? "border-background/30 text-background hover:bg-background hover:text-foreground"
          : "border-foreground/15 text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  )
}
