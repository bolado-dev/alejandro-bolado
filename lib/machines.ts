import "server-only"
import data from "@/content/machines.json"
import { getWriteupSlugs } from "@/lib/writeups"

export interface Machine {
  slug: string
  name: string
  ip: string
  os: string
  difficulty: string
  difficultyRank: number
  techniques: string[]
  certs: string[]
  video: string | null
  /** Resuelta por mí: existe un writeup con el mismo slug. */
  done: boolean
  /** Ruta a mi writeup, sólo si done. */
  writeup: string | null
}

export interface MachineStats {
  total: number
  done: number
  pending: number
  byOs: Record<string, number>
  byDifficulty: { label: string; rank: number; total: number; done: number }[]
  certs: string[]
  techniqueCount: number
}

type RawMachine = Omit<Machine, "done" | "writeup">

export async function getMachines(): Promise<Machine[]> {
  const writeupSlugs = new Set(await getWriteupSlugs())
  return (data.machines as RawMachine[]).map((m) => ({
    ...m,
    done: writeupSlugs.has(m.slug),
    writeup: writeupSlugs.has(m.slug) ? `/cybersec/writeups/${m.slug}` : null,
  }))
}

export function getMachineStats(machines: Machine[]): MachineStats {
  const byOs: Record<string, number> = {}
  const diffMap = new Map<string, { label: string; rank: number; total: number; done: number }>()
  const certSet = new Set<string>()
  let done = 0
  let techniqueCount = 0

  for (const m of machines) {
    byOs[m.os] = (byOs[m.os] ?? 0) + 1
    if (m.done) done++
    techniqueCount += m.techniques.length
    m.certs.forEach((c) => certSet.add(c))

    const d = diffMap.get(m.difficulty) ?? {
      label: m.difficulty,
      rank: m.difficultyRank,
      total: 0,
      done: 0,
    }
    d.total++
    if (m.done) d.done++
    diffMap.set(m.difficulty, d)
  }

  return {
    total: machines.length,
    done,
    pending: machines.length - done,
    byOs,
    byDifficulty: [...diffMap.values()].sort((a, b) => a.rank - b.rank),
    certs: [...certSet].sort((a, b) => a.localeCompare(b)),
    techniqueCount,
  }
}
