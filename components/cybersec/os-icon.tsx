import { Monitor } from "@/components/icons/solar"
import { SiLinux } from "@icons-pack/react-simple-icons"
import { WindowsIcon } from "@/components/icons/windows-icon"

/** Icono oficial del sistema operativo (Tux / Windows), con fallback. */
export function OsIcon({ os, className }: { os: string; className?: string }) {
  if (os === "Linux") return <SiLinux className={className} />
  if (os === "Windows") return <WindowsIcon className={className} />
  return <Monitor className={className} />
}
