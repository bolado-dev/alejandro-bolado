---
title: UDP, ICMP y ARP
order: 7
description: Los protocolos sin conexión y de soporte — por qué escanear UDP es lento, cómo se descubren hosts con ICMP y cómo ARP hace posible (y vulnerable) la red local.
---

## UDP: rápido, sin garantías

UDP es lo contrario de TCP: **sin conexión, sin handshake, sin confirmaciones**. Manda el datagrama y se olvida. A cambio es rápido y ligero, ideal para lo que tolera perder algún paquete: DNS, DHCP, SNMP, TFTP, VoIP, NTP.

```text
TCP:  handshake → datos confirmados → cierre        (fiable, ordenado, más lento)
UDP:  datagrama →  (nada más)                        (rápido, sin garantías)
```

### Por qué escanear UDP es un dolor

Como no hay `RST` garantizado para puertos cerrados, nmap tiene que **inferir**:

| Respuesta al datagrama UDP | Interpretación de nmap |
|----------------------------|------------------------|
| `ICMP port unreachable` (tipo 3, código 3) | **cerrado** |
| Respuesta del propio protocolo (p. ej. DNS contesta) | **abierto** |
| Silencio | **open\|filtered** (ambiguo) |

El silencio es ambiguo *y* los sistemas limitan la tasa de mensajes ICMP → por eso `-sU` es **lento**. En la práctica, escanea solo los puertos UDP que importan:

```bash
sudo nmap -sU --top-ports 20 --open -n -Pn 10.10.10.10 -oN nmap/udp
```

> [!TIP]
> No ignores UDP en OSCP. Servicios como **SNMP (161)**, **TFTP (69)**, **DNS (53)** o **IKE/VPN (500)** viven en UDP y a menudo son el vector que a todos se les pasa por alto.

## ICMP: el mensajero de la red

ICMP no transporta datos de usuario: transporta **mensajes de control y error** sobre IP (capa 3, sin puertos). Es lo que hay detrás de `ping` y `traceroute`.

| Tipo | Mensaje | Uso |
|------|---------|-----|
| 8 / 0 | Echo request / reply | `ping` — ¿está viva la máquina? |
| 3 | Destination unreachable | Puerto/host/red inalcanzable (código lo precisa) |
| 11 | Time exceeded | TTL llegó a 0 → base de `traceroute` |
| 5 | Redirect | "usa otra ruta" |

- **`ping`** manda Echo request (8) y espera Echo reply (0).
- **`traceroute`** manda paquetes con TTL creciente (1, 2, 3…); cada router que decrementa el TTL a 0 devuelve un `Time exceeded` (11), revelando el camino salto a salto.

> [!WARNING]
> Muchos hosts (sobre todo Windows) **ignoran el ping** por firewall. Si haces `nmap` sin `-Pn` y la máquina no responde a ICMP, nmap la dará por "caída" y no la escaneará. Por eso en OSCP se usa casi siempre **`-Pn`** (asume que está viva y escanea igual).

## ARP: el pegamento de la red local

Aquí está la pieza que conecta capa 3 (IP) con capa 2 (MAC). Para entregar una trama en tu LAN necesitas la **MAC** del destino, pero tú solo conoces su **IP**. ARP resuelve ese salto:

```text
Host A (quiere hablar con 192.168.1.20 pero no sabe su MAC)

A → BROADCAST (a toda la LAN):  "¿Quién tiene 192.168.1.20? Dímelo a mi MAC"   (ARP Request)
20 → A (unicast):               "192.168.1.20 está en aa:bb:cc:dd:ee:ff"        (ARP Reply)

A guarda el par IP↔MAC en su TABLA ARP (caché) y ya puede enviar la trama.
```

Míralo tú mismo:

```bash
ip neigh          # tabla ARP actual (IP ↔ MAC de tu LAN)
arp -a            # equivalente clásico
```

### Por qué ARP es un problema de seguridad

ARP **no autentica** nada: cualquiera puede responder "yo soy esa IP". En eso consiste el **ARP spoofing**: envías respuestas ARP falsas para que las víctimas asocien la IP del gateway con **tu** MAC. Su tráfico pasa entonces por ti (Man-in-the-Middle).

> [!IMPORTANT]
> ARP solo existe dentro de un **dominio de broadcast** (tu segmento de capa 2). Por eso el ARP spoofing **solo funciona en tu red local**, no contra máquinas al otro lado de un router. Es la razón práctica de por qué la capa 2 y la capa 3 son mundos distintos.

## Práctica

**Ejercicio 1.** Ejecutas `nmap -sU -p 161 10.10.10.10` y no obtienes respuesta alguna. ¿Está el puerto abierto, cerrado o filtrado? ¿Qué harías para salir de dudas?

<details>
<summary>Ver solución</summary>

Estado **`open|filtered`**: el silencio es ambiguo en UDP. Para desambiguar, sondea el **protocolo real**: si es SNMP, prueba `snmpwalk -v2c -c public 10.10.10.10` o `nmap -sU -p161 --script snmp-info`. Si el servicio responde a una consulta SNMP válida, está **abierto** aunque no devolviera `ICMP unreachable`.

</details>

**Ejercicio 2.** Captura y observa ARP en tu red:

```bash
sudo tcpdump -i eth0 -n arp -c 6      # deja corriendo
ping -c 1 <ip-de-tu-gateway>          # en otra terminal, fuerza una resolución
```

¿Ves el `Request` en broadcast y el `Reply` en unicast? ¿A qué MAC se dirige el reply?

<details>
<summary>Ver solución</summary>

Verás `ARP, Request who-has <gateway> tell <tu-ip>` enviado a `ff:ff:ff:ff:ff:ff` (broadcast), y `ARP, Reply <gateway> is-at <mac>` dirigido a **tu** MAC (unicast). Tras eso, `ip neigh` mostrará el par IP↔MAC cacheado. Ese caché es justo lo que envenena un ataque de ARP spoofing.

</details>

## Recursos

- [**nmap — UDP scan**](https://nmap.org/book/scan-methods-udp-scan.html) — por qué el escaneo UDP es lento y ambiguo.
- [**bettercap**](https://www.bettercap.org/) — framework de referencia para ARP spoofing / MITM en laboratorio.
- [**RFC 826 — ARP**](https://www.rfc-editor.org/rfc/rfc826) y [**RFC 768 — UDP**](https://www.rfc-editor.org/rfc/rfc768) — los protocolos en su fuente original.
- [**Practical Packet Analysis** (Sanders)](https://nostarch.com/packetanalysis3) — capítulos de ARP e ICMP con Wireshark.
