import { getManualNav } from "@/lib/manual"
import { ManualShell } from "@/components/cybersec/manual-shell"

export default async function ManualLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nav = await getManualNav()
  return <ManualShell nav={nav}>{children}</ManualShell>
}
