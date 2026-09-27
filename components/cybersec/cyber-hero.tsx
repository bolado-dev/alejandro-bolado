import type { MachineStats } from "@/lib/machines"

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
    <div className="container mx-auto flex max-w-3xl flex-col items-center pt-8 pb-16 text-center">
      <p className="mb-6 text-[11px] tracking-widest text-muted-foreground uppercase">
        Ciberseguridad
      </p>
      <h1 className="text-[clamp(2.5rem,6.5vw,5.5rem)] font-medium leading-[0.95] tracking-tight">
        Del recon
        <br />a root.
      </h1>
      <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        Una sección dedicada a la seguridad ofensiva: resoluciones de máquinas
        de Hack The Box y un manual técnico de referencia. Enumeración,
        explotación, post-explotación y escalada de privilegios.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <span>Writeups {writeups}</span>
        <span>
          Máquinas {machines.done}/{machines.total}
        </span>
        <span>Manual {manualPages} páginas</span>
      </div>
    </div>
  )
}
