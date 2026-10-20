import type { Metadata } from "next"
import { getAllWriteups } from "@/lib/writeups"
import { WriteupsExplorer } from "@/components/cybersec/writeups-explorer"

export const metadata: Metadata = {
  title: "Writeups",
  description:
    "Writeups de Hack The Box: pentesting, explotación y escalada de privilegios paso a paso.",
}

export default async function WriteupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const [writeups, { q }] = await Promise.all([getAllWriteups(), searchParams])

  return (
    <main className="pt-14 pb-24">
      <div className="ink-rail mx-auto w-full max-w-[1008px] px-8">
        <p className="text-[13px] text-[var(--ink-fg-dim)]">
          Hack The Box · Apuntes
        </p>
        <h1 className="font-display mt-1 text-4xl italic tracking-[0.01em] text-[var(--ink-fg-strong)]">
          Writeups
        </h1>
        <p className="mt-5 mb-12 max-w-[62ch] text-[18px] leading-[1.625]">
          Resoluciones documentadas paso a paso. Enumeración, explotación,
          post-explotación y escalada de privilegios.
        </p>

        <WriteupsExplorer writeups={writeups} initialQuery={q ?? ""} />
      </div>
    </main>
  )
}
