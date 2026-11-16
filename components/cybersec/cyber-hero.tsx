import { InkContainer, InkDivider, InkEyebrow } from "@/components/ink"
import { InkReveal, InkStagger } from "@/components/ink-reveal"
import type { MachineStats } from "@/lib/machines"

/**
 * Portada de la sección, en el mismo lenguaje que la del portfolio: antetítulo
 * en azul, titular en serif itálica a tamaño de cartel y las cifras en una
 * fila de números grandes.
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
  const stats = [
    { value: String(writeups), label: "Writeups" },
    { value: `${machines.done}/${machines.total}`, label: "Máquinas" },
    { value: String(manualPages), label: "Páginas de manual" },
  ]

  return (
    <>
      <InkContainer className="pt-24 pb-20 sm:pt-32">
        <InkStagger step={110}>
          <InkEyebrow>Ciberseguridad</InkEyebrow>
          <h1 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.98] tracking-[-0.02em] text-[var(--ink-fg-strong)] italic">
            Del recon a root
          </h1>
          <p className="mt-8 max-w-[52ch] text-[clamp(1.05rem,1.8vw,1.35rem)] leading-[1.55]">
            Seguridad ofensiva: resoluciones de máquinas de Hack The Box y un
            manual técnico de referencia. Enumeración, explotación,
            post-explotación y escalada de privilegios.
          </p>
        </InkStagger>
      </InkContainer>

      <InkDivider />
      <InkContainer className="py-12">
        <InkReveal className="grid grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-none text-[var(--ink-fg-strong)] italic">
                {s.value}
              </p>
              <p className="mt-3 text-[13px] tracking-[0.14em] text-[var(--ink-fg-dim)] uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </InkReveal>
      </InkContainer>
    </>
  )
}
