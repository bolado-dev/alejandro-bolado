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
    <main className="px-4 pt-16 pb-28">
      <div className="container mx-auto max-w-5xl">
        <p className="mb-4 text-[11px] tracking-widest text-muted-foreground uppercase">
          Hack The Box · Roadmap
        </p>
        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl">
          Máquinas
        </h1>
        <p className="mt-4 mb-12 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
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
