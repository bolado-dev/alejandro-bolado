---
title: Teoría del Escaneo de Puertos
order: 15
description: Cada tipo de escaneo de nmap explicado desde el comportamiento TCP/IP — SYN, Connect, FIN/NULL/Xmas, ACK y UDP — y qué significan realmente sus estados.
---

## Escanear = provocar y escuchar

Un escáner de puertos manda paquetes cuidadosamente diseñados y **deduce el estado** del puerto según cómo (o si) responde. Toda la magia de nmap se reduce a las respuestas TCP/IP que ya estudiaste. Esta lección junta las piezas.

> [!IMPORTANT]
> Repaso de la Lección TCP: **abierto** → `SYN/ACK`; **cerrado** → `RST`; **filtrado** → silencio (o `ICMP unreachable`). Con esto entiendes cada scan.

## Los estados que reporta nmap

| Estado | Significado |
|--------|-------------|
| `open` | Un servicio acepta conexiones ahí |
| `closed` | Alcanzable, pero sin servicio escuchando (responde `RST`) |
| `filtered` | Un firewall bloquea; nmap no obtiene respuesta clara |
| `open\|filtered` | No puede distinguir (típico en UDP y scans sigilosos) |
| `unfiltered` | Alcanzable pero no sabe si abierto (típico del ACK scan) |

## Escaneos TCP, uno a uno

### SYN scan — `-sS` (el estándar)

Manda `SYN`. Lee la respuesta y **no completa** el handshake (envía `RST` si estaba abierto). Rápido y algo sigiloso. Requiere privilegios (root).

```text
Puerto abierto:   →SYN   ←SYN/ACK   →RST      (nmap: open)
Puerto cerrado:   →SYN   ←RST                 (nmap: closed)
Puerto filtrado:  →SYN   (silencio)           (nmap: filtered)
```

### Connect scan — `-sT`

Completa el handshake entero usando la pila del sistema (`connect()`). No necesita root, pero es **más ruidoso** (queda en logs de la aplicación) y más lento.

```text
Puerto abierto:   →SYN  ←SYN/ACK  →ACK  (…luego cierra)   (nmap: open)
```

> [!TIP]
> Usa `-sT` cuando escaneas **a través de un túnel/proxychains** (pivoting): proxychains solo sabe reenviar conexiones TCP completas del sistema, no paquetes SYN crudos. Por eso en pivoting el patrón es `proxychains nmap -sT -Pn ...`.

### FIN, NULL y Xmas — `-sF`, `-sN`, `-sX`

Explotan una regla del RFC 793: un puerto **cerrado** debe responder `RST` a un segmento que no tenga `SYN`/`ACK`/`RST`; un puerto **abierto** debe **ignorarlo** (silencio). Así distinguen abierto de cerrado *sin* mandar un SYN, lo que evade firewalls y logs que solo vigilan SYN.

- **NULL (`-sN`)** → ninguna flag activada.
- **FIN (`-sF`)** → solo `FIN`.
- **Xmas (`-sX`)** → `FIN` + `PSH` + `URG` ("iluminado como un árbol de Navidad").

```text
Puerto cerrado:   →(FIN/NULL/Xmas)   ←RST            (nmap: closed)
Puerto abierto:   →(FIN/NULL/Xmas)   (silencio)      (nmap: open|filtered)
```

> [!WARNING]
> Estos scans **no funcionan contra Windows**: su pila TCP responde `RST` siempre, así que todo saldría "cerrado". Son útiles sobre todo contra sistemas tipo Unix y para probar reglas de firewall.

### ACK scan — `-sA` (mapear firewalls)

No dice si un puerto está abierto: **mapea reglas de firewall**. Manda `ACK`. Un firewall *stateful* que bloquea el puerto se traga el paquete (→ `filtered`); si el puerto no está filtrado, la máquina responde `RST` (→ `unfiltered`, aunque no sepas si hay servicio).

## Escaneo UDP — `-sU`

Sin handshake que explotar (ver Lección UDP): nmap infiere por `ICMP port unreachable` (cerrado), respuesta del protocolo (abierto) o silencio (`open|filtered`). Lento; escanea solo top-ports.

## Recetas prácticas para OSCP

```bash
# 1) Descubrimiento rápido de TODOS los puertos abiertos
sudo nmap -p- --open -sS --min-rate 5000 -n -Pn 10.10.10.10 -oG nmap/allPorts

# 2) Enumeración dirigida (versión + scripts) solo de los abiertos
nmap -p 22,80,445 -sCV 10.10.10.10 -oN nmap/targeted

# 3) UDP a los sospechosos habituales
sudo nmap -sU --top-ports 20 --open -n -Pn 10.10.10.10 -oN nmap/udp

# 4) A través de un pívot (proxychains → siempre -sT y -Pn)
proxychains nmap -sT -Pn -p 445,3389 172.16.0.10
```

| Flag | Qué hace |
|------|----------|
| `-p-` | Todos los puertos (1–65535) |
| `--open` | Muestra solo abiertos |
| `-sS` / `-sT` | SYN scan / Connect scan |
| `-sC` / `-sV` | Scripts por defecto / versión del servicio |
| `-Pn` | No hacer ping previo (asume host vivo) |
| `-n` | No resolver DNS (más rápido) |
| `--min-rate` | Paquetes/segundo mínimos |

## Práctica

**Ejercicio 1.** Un Xmas scan (`-sX`) reporta un puerto como `open|filtered`, pero un SYN scan (`-sS`) lo reporta `closed`. ¿Cómo es posible y en qué te fías más?

<details>
<summary>Ver solución</summary>

Probablemente el objetivo es **Windows** (o hay un firewall que descarta los paquetes Xmas). Ante un Xmas, un cerrado *debería* responder `RST`; si no llega, nmap dice `open|filtered`. Pero la pila de Windows no sigue esa regla del RFC, así que el resultado del Xmas no es fiable en Windows. El **SYN scan es fiable** aquí: si dice `closed`, hubo un `RST` real. Confía en el `-sS`.

</details>

**Ejercicio 2.** Estás pivotando y lanzas `proxychains nmap -sS -Pn 172.16.0.10`. Da errores o resultados absurdos. ¿Por qué y cómo lo arreglas?

<details>
<summary>Ver solución</summary>

`-sS` manda **paquetes SYN crudos**, que proxychains **no puede reenviar** (solo intercepta llamadas `connect()` TCP completas). Cambia a **`-sT`** (Connect scan): `proxychains nmap -sT -Pn -p <puertos> 172.16.0.10`. Además conviene limitar puertos y usar `-Pn`, porque el ICMP/ping tampoco cruza bien el proxy.

</details>

## Recursos

- [**nmap — "Port Scanning Techniques"**](https://nmap.org/book/man-port-scanning-techniques.html) — el capítulo oficial de cada tipo de scan.
- [**HTB Academy — "Network Enumeration with Nmap"**](https://academy.hackthebox.com/course/preview/network-enumeration-with-nmap) — práctica guiada.
- [**nmap — man page**](https://nmap.org/book/man.html) — referencia completa de flags.
- **Lección [TCP a fondo](/cybersec/manual/redes/tcp-a-fondo)** — la base de todo esto.
