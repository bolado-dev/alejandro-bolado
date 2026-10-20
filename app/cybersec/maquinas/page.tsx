import type { Metadata } from "next"
import { getMachines, getMachineStats } from "@/lib/machines"
import { MachinesExplorer } from "@/components/cybersec/machines-explorer"

export const metadata: Metadata = {
  title: "Máquinas",
  description:
    "Listado completo de máquinas de Hack The Box: resueltas y pendientes, con buscador por técnica, OS, dificultad y certificación.",
}

export default async function MachinesPage() {
  const machines = await getMachines()
  const stats = getMachineStats(machines)

  return (
    <main className="pt-14 pb-24">
      <div className="ink-rail mx-auto w-full max-w-[1008px] px-8">
        <p className="text-[13px] text-[var(--ink-fg-dim)]">
          Hack The Box · Roadmap
        </p>
        <h1 className="font-display mt-1 text-4xl italic tracking-[0.01em] text-[var(--ink-fg-strong)]">
          Máquinas
        </h1>
        <p className="mt-5 mb-12 max-w-[62ch] text-[18px] leading-[1.625]">
          El listado completo que estoy trabajando: las que ya he resuelto
          enlazan a mi writeup, las pendientes marcan el camino. Filtra por
          estado, sistema operativo, dificultad, certificación o busca por
          cualquier técnica.
        </p>

        <MachinesExplorer machines={machines} stats={stats} />
      </div>
    </main>
  )
}
