import { InkContainer, InkDivider } from "@/components/ink"
import { InkReveal, InkStagger } from "@/components/ink-reveal"
import type { MachineStats } from "@/lib/machines"

/**
 * Portada de la sección, en el mismo lenguaje que la del portfolio: rótulo
 * pequeño, titular en serif itálica, prosa a 18px y las cifras en una fila
 * monoespaciada, todo dentro de los raíles de 1008px.
 */
export function CyberHero({
  writeups,
  machines,
  manualPages,
}: {
  writeups: number
  machines: MachineStats
  manualPages: number
}) {
  return (
    <>
      <InkContainer className="pb-10 pt-14">
        <InkStagger step={110}>
        <p className="text-[13px] text-[var(--ink-fg-dim)]">Ciberseguridad</p>
        <h1 className="font-display mt-1 text-4xl italic tracking-[0.01em] text-[var(--ink-fg-strong)]">
          Del recon a root
        </h1>
        <p className="mt-5 max-w-[62ch] text-[18px] leading-[1.625]">
          Seguridad ofensiva: resoluciones de máquinas de Hack The Box y un
          manual técnico de referencia. Enumeración, explotación,
          post-explotación y escalada de privilegios.
        </p>
        </InkStagger>
      </InkContainer>

      <InkDivider />
      <InkContainer className="py-5">
        <InkReveal className="flex flex-wrap gap-x-10 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-fg-dim)]">
          <span>Writeups {writeups}</span>
          <span>
            Máquinas {machines.done}/{machines.total}
          </span>
          <span>Manual {manualPages} páginas</span>
        </InkReveal>
      </InkContainer>
    </>
  )
}
