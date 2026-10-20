import { InkSection } from "@/components/ink"

/**
 * Rejilla de contribuciones de GitHub.
 *
 * El API REST de GitHub no expone el calendario de contribuciones y el de
 * GraphQL exige token, así que se tira de un servicio público de solo lectura.
 * Si falla o no responde, la sección se oculta en vez de enseñar un hueco.
 */

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }

const LEVEL_ALPHA = [0.05, 0.25, 0.45, 0.7, 1] as const

async function getContributions(user: string): Promise<Day[] | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${user}?y=last`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) return null
    const data = (await res.json()) as { contributions?: Day[] }
    return data.contributions?.length ? data.contributions : null
  } catch {
    return null
  }
}

export async function GithubActivity({ user }: { user: string }) {
  const days = await getContributions(user)
  if (!days) return null

  const total = days.reduce((n, d) => n + d.count, 0)

  // Columnas de 7 días empezando en domingo, como el calendario de GitHub
  const weeks: Day[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <InkSection title="Actividad en GitHub">
      <div className="rounded-3xl border border-[var(--ink-line-strong)] bg-[var(--ink-surface)] p-5">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-[3px]">
            {weeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {week.map((d) => (
                  <span
                    key={d.date}
                    title={`${d.count} contribuciones · ${d.date}`}
                    className="size-[10px] rounded-full"
                    style={{
                      backgroundColor: `rgb(255 255 255 / ${LEVEL_ALPHA[d.level]})`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-[13px] text-[var(--ink-fg-dim)]">
          {total.toLocaleString("es-ES")} contribuciones en el último año
        </p>
      </div>
    </InkSection>
  )
}
