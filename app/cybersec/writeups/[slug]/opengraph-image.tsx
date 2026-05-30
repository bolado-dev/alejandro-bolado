import { ImageResponse } from "next/og"
import { getWriteup } from "@/lib/writeups"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Writeup"

const DIFF_COLOR: Record<string, string> = {
  Easy: "#34d399",
  Medium: "#fbbf24",
  Hard: "#f87171",
  Insane: "#e879f9",
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const w = await getWriteup(slug)
  const title = w?.title ?? "Writeup"
  const category = w?.category ?? "HackTheBox"
  const difficulty = w?.difficulty ?? null
  const tags = (w?.tags ?? []).filter(
    (t) => !["Easy", "Medium", "Hard", "Insane"].includes(t)
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#a1a1aa",
            }}
          >
            {category}
          </div>
          {difficulty && (
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 600,
                color: DIFF_COLOR[difficulty] ?? "#a1a1aa",
              }}
            >
              {`· ${difficulty}`}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {tags.slice(0, 3).map((t) => (
              <div
                key={t}
                style={{
                  fontSize: 22,
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: "1px solid #3f3f46",
                  color: "#d4d4d8",
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, color: "#a1a1aa" }}>
            Alejandro Bolado
          </div>
        </div>
      </div>
    ),
    size
  )
}
