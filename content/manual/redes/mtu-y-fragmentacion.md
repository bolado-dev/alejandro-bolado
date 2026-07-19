---
title: "MTU, MSS y Fragmentación"
order: 5
description: "Por qué el tamaño máximo de un paquete importa, cómo se fragmenta cuando se supera, y cómo explotarlo para evadir controles de red."
---

## MTU: el límite de tamaño en capa 2

El **MTU (Maximum Transmission Unit)** es el tamaño máximo, en bytes, del **payload** que puede transportar una trama de capa 2 en un medio concreto. No incluye las cabeceras de la propia trama Ethernet (14 bytes de cabecera + 4 de FCS), sino la carga útil que lleva por encima.

| Tecnología | MTU típico |
|------------|-----------|
| Ethernet (LAN estándar) | **1500 bytes** |
| PPPoE (ADSL/fibra) | 1492 bytes (8 bytes de cabecera PPPoE) |
| Wi-Fi 802.11 | 2304 bytes (en la práctica suele heredar 1500) |
| Loopback Linux | 65536 bytes |
| Túnel GRE sobre Ethernet | ~1476 bytes |
| OpenVPN / WireGuard | variable, típico 1380–1420 bytes |

El valor de 1500 bytes en Ethernet es una convención de diseño que lleva décadas siendo el estándar de facto en redes IP.

```text
Trama Ethernet:
┌──────────────┬──────────────────────────────┬─────┐
│ Cabecera ETH │   Payload IP (hasta 1500 B)  │ FCS │
│    14 bytes  │                              │ 4 B │
└──────────────┴──────────────────────────────┴─────┘
                          ▲
                     MTU = 1500
```

---

## Fragmentación IP: qué pasa cuando se supera el MTU

Si un paquete IP es mayor que el MTU del enlace por el que tiene que salir, el router (o el propio host origen) debe **fragmentarlo**: dividirlo en trozos más pequeños llamados **fragmentos**, cada uno con su propia cabecera IP.

Cada fragmento lleva en la cabecera IP:
- **Fragment Offset**: posición en bytes del fragmento dentro del datagrama original (en unidades de 8 bytes).
- **More Fragments (MF)**: flag que indica si vienen más fragmentos después.
- **Identification**: mismo valor en todos los fragmentos del mismo datagrama, para que el receptor pueda reensamblarlos.

```text
Paquete original: 3000 bytes de payload IP
MTU del enlace: 1500 bytes → payload máx. por fragmento: 1480 bytes (1500 − 20 de cabecera IP)

Fragmento 1: offset=0,    MF=1, datos: bytes 0–1479
Fragmento 2: offset=185,  MF=1, datos: bytes 1480–2959  (185 × 8 = 1480)
Fragmento 3: offset=370,  MF=0, datos: bytes 2960–2999  (último, MF=0)
```

> [!NOTE]
> La fragmentación la realiza el router intermedio (IPv4) o el host origen (IPv6, donde los routers NO fragmentan). En IPv6, si el paquete es demasiado grande, el router descarta el paquete y devuelve ICMPv6 "Packet Too Big".

---

## El bit DF (Don't Fragment)

La cabecera IP tiene un flag llamado **DF (Don't Fragment)**. Cuando está activo:

- Si el paquete supera el MTU, el router **no fragmenta**: descarta el paquete.
- El router envía de vuelta un mensaje **ICMP tipo 3, código 4** ("Fragmentation Needed and DF Set") al origen, indicando el MTU del enlace problemático.

```text
[Host A] ──→ paquete grande (DF=1) ──→ [Router] ──→ enlace MTU=1400
                                            │
                                      paquete > MTU
                                      DF=1 → no fragmenta
                                            │
                        ←── ICMP tipo 3, código 4 ──┘
                            "Fragmentation Needed, MTU=1400"
```

Este mecanismo es la base del **Path MTU Discovery**.

---

## Path MTU Discovery (PMTUD)

PMTUD permite a un host descubrir el **MTU mínimo** en toda la ruta hacia el destino, sin necesidad de fragmentar en routers intermedios. Funciona así:

1. El host envía paquetes con **DF=1** y tamaño máximo (1500 bytes).
2. Si un router intermedio tiene un MTU menor, descarta el paquete y responde con ICMP "Fragmentation Needed" indicando su MTU.
3. El host reduce el tamaño del paquete al MTU indicado y reintenta.
4. El proceso se repite hasta encontrar el MTU mínimo del camino (**Path MTU**).

### El problema: agujeros negros de PMTUD

Muchos firewalls bloquean **todo el tráfico ICMP** por política "de seguridad". Si bloquean el ICMP tipo 3 código 4, el host origen nunca recibe la notificación y sigue enviando paquetes grandes con DF=1 que los routers descartan silenciosamente.

```text
[Host A] ──→ paquete grande (DF=1) ──→ [Router MTU=1400] ──→ [Firewall]
                                               │                    │
                                         descarta paquete           │
                                               │                    │
                         ICMP "Frag Needed" ──→ [FIREWALL LO BLOQUEA]
                                               │
                         Host A nunca recibe la notificación
                         → sigue enviando paquetes grandes
                         → conexión TCP se "congela" o falla
```

Esto se llama **PMTUD Black Hole** y es una causa real de problemas de conectividad intermitentes en VPNs y túneles.

> [!WARNING]
> Si en un pentest ves conexiones TCP que se establecen pero no transfieren datos, considera que puede haber un problema de PMTUD. Herramientas como Wireshark pueden confirmarlo: busca retransmisiones TCP sin ICMP de respuesta.

---

## MSS: la negociación TCP del tamaño de segmento

El **MSS (Maximum Segment Size)** es el tamaño máximo del **payload TCP** (sin cabeceras) que un extremo está dispuesto a recibir. Se negocia en el **handshake TCP** mediante la opción MSS en los paquetes SYN y SYN-ACK.

La relación con el MTU:

```text
MTU  = 1500 bytes  (capa 2, incluyendo cabeceras IP y TCP)
IP   =   20 bytes  (cabecera IP mínima)
TCP  =   20 bytes  (cabecera TCP mínima)
─────────────────
MSS  = 1500 − 20 − 20 = 1460 bytes
```

Cada extremo anuncia su propio MSS en el SYN. TCP usará el **menor** de los dos valores anunciados. Esto se profundiza en [TCP a Fondo](/cybersec/manual/redes/tcp-a-fondo).

```text
[Cliente] ──→ SYN (MSS=1460) ──→ [Servidor]
[Cliente] ←── SYN-ACK (MSS=1460) ←── [Servidor]
  → ambos acuerdan MSS=1460
  → cada segmento TCP llevará hasta 1460 bytes de datos
```

---

## Túneles y VPNs: el MTU efectivo se reduce

Cuando el tráfico viaja dentro de un túnel (VPN, GRE, VXLAN…), cada paquete original se **encapsula** dentro de otro paquete: se le añaden nuevas cabeceras. Esas cabeceras consumen espacio, reduciendo el MTU disponible para el tráfico interior.

```text
Sin VPN:
┌────────────────────────────────────────────────────┐
│ IP (20B) │ TCP (20B) │ Datos (1460B) │   = 1500B  │
└────────────────────────────────────────────────────┘

Con túnel WireGuard (overhead ~60 bytes):
┌──────────────────────────────────────────────────────────────────┐
│ IP outer(20B)│UDP(8B)│WG header(32B)│ IP(20B)│TCP(20B)│Datos(??)│
└──────────────────────────────────────────────────────────────────┘
   Total debe caber en MTU físico (1500B)
   → MTU efectivo interior ≈ 1500 − 60 = 1440B
   → MSS interior ≈ 1440 − 40 = 1400B
```

### MSS Clamping: la solución pragmática

En lugar de depender de PMTUD (que puede fallar por ICMP bloqueado), los firewalls y routers en los extremos del túnel pueden **reescribir la opción MSS** en los paquetes SYN, reduciendo el valor al adecuado para el túnel. Esto se llama **MSS clamping**.

```bash
# Ejemplo de MSS clamping en iptables (para un túnel con MTU efectivo de 1400)
iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN \
  -j TCPMSS --set-mss 1360
```

Con esto, aunque el cliente anuncie MSS=1460, el firewall lo reduce a 1360 antes de que llegue al servidor, y viceversa. Los paquetes TCP resultantes caben en el túnel sin necesidad de fragmentación.

> [!TIP]
> Si una VPN funciona para tráfico pequeño (ping, DNS) pero falla para páginas web o transferencias de archivos, sospecha de MSS/MTU. El tráfico pequeño cabe sin fragmentar; el tráfico grande necesita MSS correcto o PMTUD funcional.

---

## Descubrir la MTU manualmente con `ping`

En Linux, `ping -M do` activa el bit DF y permite probar qué tamaño pasa sin fragmentación:

```bash
# -M do: "Don't Fragment" obligatorio
# -s: tamaño del payload ICMP (sin contar cabecera IP de 20B ni ICMP de 8B)
ping -M do -s 1472 192.168.1.1   # 1472 + 20 + 8 = 1500 → justo al límite

ping -M do -s 1473 192.168.1.1   # 1473 + 28 = 1501 → debería fallar si MTU=1500
```

Método de búsqueda binaria:

```bash
# Empieza grande, reduce hasta que funcione
ping -M do -s 1472 destino   # si falla → MTU < 1500
ping -M do -s 1400 destino   # si funciona → MTU entre 1400 y 1500
ping -M do -s 1436 destino   # sigue hasta encontrar el límite exacto
```

> [!NOTE]
> El valor de `-s` es solo el **payload ICMP**. El paquete IP total es `-s + 28` (20 IP + 8 ICMP). Para calcular el MTU: `MTU = tamaño_s_máximo_que_funciona + 28`.

---

## Uso ofensivo: evasión de IDS/firewall con fragmentación

Algunos IDS/firewalls simples inspeccionan paquetes completos pero no reensamblan fragmentos. Si el payload malicioso (p. ej., una firma de Snort) está dividido entre dos fragmentos, el IDS puede no detectarlo.

**`nmap -f`**: fragmenta los paquetes de escaneo en trozos de **8 bytes**.

```bash
nmap -f 10.10.10.5
```

**`nmap --mtu`**: fragmenta con un tamaño personalizado (debe ser múltiplo de 8).

```bash
nmap --mtu 16 10.10.10.5      # fragmentos de 16 bytes
nmap --mtu 24 -sS 10.10.10.5  # con SYN scan
```

```text
Paquete TCP SYN normal:
[ IP header | TCP SYN header (20B) | opciones TCP ]

Con nmap -f (fragmentos de 8B):
Fragmento 1: [ IP frag | primeros  8B del TCP header ]
Fragmento 2: [ IP frag | siguientes 8B del TCP header ]
Fragmento 3: [ IP frag | resto del TCP header + opciones ]
```

> [!CAUTION]
> La fragmentación elude IDS/firewalls **básicos**. Sistemas modernos (Suricata, Palo Alto, etc.) reensamblan fragmentos antes de inspeccionar. En el OSCP, úsalo cuando otras técnicas fallen o cuando el objetivo sea demostrar la debilidad. Para técnicas avanzadas de evasión de escaneo, consulta [Escaneo de Puertos: Teoría](/cybersec/manual/redes/escaneo-de-puertos-teoria).

---

## Práctica

### Ejercicio 1 — Calcular el MSS

Dado un enlace con MTU estándar de Ethernet (1500 bytes), calcula el MSS típico de TCP y explica de dónde sale ese número.

<details>
<summary>Ver solución</summary>

**MSS = MTU − cabecera IP − cabecera TCP**

```text
MTU  = 1500 bytes
IP   =   20 bytes  (cabecera IPv4 mínima, sin opciones)
TCP  =   20 bytes  (cabecera TCP mínima, sin opciones)
─────────────────
MSS  = 1500 − 20 − 20 = 1460 bytes
```

El MSS solo mide el **payload TCP puro** (datos de aplicación). No incluye ninguna cabecera. Si hubiera opciones IP o TCP (p. ej., timestamps TCP = 12 bytes extra), el MSS efectivo bajaría proporcionalmente:

```text
Con opciones TCP timestamps (12B):
MSS = 1500 − 20 − 20 − 12 = 1448 bytes
```

</details>

### Ejercicio 2 — VPN y paquetes grandes

Una VPN añade 60 bytes de overhead de encapsulación. El MTU físico del enlace es 1500 bytes. Explica por qué una página web de 80 KB puede fallar al cargar a través de la VPN si no hay MSS clamping ni PMTUD funcional, y cómo lo resuelve el MSS clamping.

<details>
<summary>Ver solución</summary>

**El problema:**

1. El MTU efectivo dentro del túnel es `1500 − 60 = 1440 bytes`.
2. El cliente negocia MSS=1460 (basado en el MTU físico local, sin saber del overhead del túnel).
3. El servidor envía segmentos TCP de 1460 bytes de payload → paquetes IP de 1500 bytes.
4. Esos paquetes entran al túnel y con el overhead quedan en 1560 bytes → superan el MTU físico.
5. Si DF=1 (habitual en TCP moderno), el router del túnel los descarta y envía ICMP "Frag Needed".
6. Si el firewall bloquea ICMP, el cliente nunca se entera → los paquetes se descartan silenciosamente → TCP retransmite una y otra vez → la conexión se "congela".

Los pings pequeños sí funcionan porque caben en el MTU físico aunque con overhead.

**La solución — MSS clamping:**

El firewall/router en el borde del túnel intercepta los paquetes SYN y reescribe la opción MSS al valor correcto:

```text
MSS clamped = MTU físico − overhead túnel − 40 bytes (IP+TCP)
            = 1500 − 60 − 40
            = 1400 bytes
```

Con MSS=1400, los segmentos TCP encapsulados miden `1400 + 40 + 60 = 1500 bytes` exactos → caben en el enlace sin fragmentar ni depender de PMTUD.

</details>

---

## Recursos

- [RFC 1191 — Path MTU Discovery](https://www.rfc-editor.org/rfc/rfc1191)
- [Nmap Network Scanning Book (evasión y fragmentación)](https://nmap.org/book/)
- [Manpage `ping(8)` — Ubuntu Noble](https://manpages.ubuntu.com/manpages/noble/en/man8/ping.8.html)
- [TCP a Fondo — MSS y handshake (lección hermana)](/cybersec/manual/redes/tcp-a-fondo)
- [Escaneo de Puertos: Teoría — evasión con nmap (lección hermana)](/cybersec/manual/redes/escaneo-de-puertos-teoria)
