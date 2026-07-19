---
title: "Routing y Tablas de Rutas"
order: 4
description: "Cómo decide el SO por qué interfaz/gateway enviar cada paquete, y cómo manipular rutas para pivotar en un pentest."
---

## Qué es el routing (capa 3)

Cuando un paquete IP necesita llegar a una red distinta a la local, alguien tiene que decidir por dónde enviarlo. Ese trabajo lo hace el **router** (o el propio sistema operativo cuando actúa como gateway), operando en la **capa 3** del modelo OSI.

El proceso es sencillo en concepto:

1. Se examina la dirección IP de destino del paquete.
2. Se consulta la **tabla de rutas** del sistema.
3. Se elige la entrada que mejor coincide con ese destino.
4. El paquete sale por la interfaz asociada, directo al siguiente salto (*next-hop*) o al destino si está en la misma red.

```text
[Host A: 192.168.1.10]
        |
    (eth0: 192.168.1.0/24)
        |
   [Router / Gateway]
        |
    (eth1: 10.0.0.0/8)
        |
   [Host B: 10.0.0.50]
```

Sin routing, dos redes IP distintas son islas incomunicadas aunque el cable las conecte.

---

## La tabla de rutas

La tabla de rutas es la "agenda" que consulta el kernel para cada paquete saliente. Cada entrada indica: *«para llegar a esta red, usa este gateway a través de esta interfaz»*.

### Linux: `ip route` y `route -n`

```bash
ip route
# o la forma clásica (muestra IPs numéricas, sin resolver DNS):
route -n
```

Salida de ejemplo de `ip route`:

```text
default via 10.10.10.1 dev eth0 proto dhcp metric 100
10.10.10.0/24 dev eth0 proto kernel scope link src 10.10.10.15
172.16.0.0/24 via 10.10.10.5 dev eth0
```

| Campo | Significado |
|-------|-------------|
| `default` o `0.0.0.0/0` | Ruta por defecto: paquetes que no encajan en ninguna otra entrada |
| `via <IP>` | Next-hop: la IP del próximo router al que enviar el paquete |
| `dev <iface>` | Interfaz de salida (eth0, tun0, ligolo…) |
| `proto kernel` | La ruta la creó el kernel automáticamente al configurar la interfaz |
| `scope link` | El destino es alcanzable directamente (misma LAN, sin gateway) |
| `metric <n>` | Coste de la ruta; si hay dos rutas al mismo destino, gana la de menor métrica |
| `src <IP>` | IP local preferida como origen para esa ruta |

### Windows: `route print`

```bash
route print
```

```text
IPv4 Route Table
===========================================================================
Active Routes:
Network Destination   Netmask          Gateway       Interface   Metric
          0.0.0.0     0.0.0.0      192.168.1.1   192.168.1.50     25
        127.0.0.0     255.0.0.0        127.0.0.1      127.0.0.1    331
      192.168.1.0   255.255.255.0    On-link      192.168.1.50     281
```

Las columnas son equivalentes a Linux: destino, máscara, gateway, interfaz y métrica.

---

## La ruta por defecto (default gateway)

La entrada `0.0.0.0/0` actúa como "cajón de sastre": cualquier paquete cuyo destino no encaje en ninguna ruta más específica sale por ahí. Es la dirección de tu router hacia Internet (o hacia la red corporativa, según el escenario).

```text
Paquete destino: 8.8.8.8
→ ¿Hay ruta para 8.8.8.8/32? No.
→ ¿Hay ruta para 8.8.0.0/16? No.
→ ¿Hay ruta para 0.0.0.0/0? SÍ → sale por el default gateway.
```

Si un host no tiene ruta por defecto, solo puede comunicarse con las redes directamente conectadas.

> [!IMPORTANT]
> En un pentest, si estás dentro de una máquina comprometida sin ruta por defecto, los paquetes hacia tu IP atacante pueden no llegar de vuelta. Comprueba siempre `ip route` antes de lanzar payloads de reverse shell.

---

## Rutas conectadas vs. rutas estáticas

### Rutas conectadas (*connected*)

El kernel las crea automáticamente cuando se asigna una IP a una interfaz. Si `eth0` tiene `10.10.10.15/24`, aparece:

```text
10.10.10.0/24 dev eth0 proto kernel scope link src 10.10.10.15
```

Significa: *«la red 10.10.10.0/24 está directamente en eth0; no necesito gateway»*.

### Rutas estáticas

Las añade el administrador (o el pentester) manualmente:

```bash
# Linux — añadir
sudo ip route add 172.16.0.0/24 via 10.10.10.5

# Linux — añadir por interfaz (útil para túneles)
sudo ip route add 172.16.0.0/24 dev ligolo

# Linux — eliminar
sudo ip route del 172.16.0.0/24

# Windows — añadir (persistente con -p)
route add 172.16.0.0 mask 255.255.255.0 10.10.10.5
```

Las rutas estáticas **no persisten** tras reinicio a menos que se añadan `-p` (Windows) o se configuren en `/etc/network/interfaces` / netplan (Linux).

---

## Longest prefix match: la regla más importante

Cuando la tabla de rutas tiene varias entradas que podrían cubrir la IP de destino, gana siempre la **más específica**, es decir, la de prefijo más largo (mayor máscara).

```text
Tabla de rutas:
  0.0.0.0/0      via 10.10.10.1   (default)
  10.0.0.0/8     via 10.10.10.2
  10.10.10.0/24  dev eth0  (connected)

¿Por dónde sale un paquete a 10.10.10.50?
  → 0.0.0.0/0      cubre 10.10.10.50  (prefijo /0)
  → 10.0.0.0/8     cubre 10.10.10.50  (prefijo /8)
  → 10.10.10.0/24  cubre 10.10.10.50  (prefijo /24)  ← GANA (más específica)

¿Por dónde sale un paquete a 10.20.0.1?
  → 0.0.0.0/0      cubre 10.20.0.1    (prefijo /0)
  → 10.0.0.0/8     cubre 10.20.0.1    (prefijo /8)   ← GANA
```

> [!TIP]
> Puedes añadir una ruta más específica para redirigir tráfico concreto sin tocar el resto. Esto es exactamente lo que haces al pivotar: añades la ruta hacia la red interna sin romper tu conectividad a Internet.

---

## Aplicación en OSCP / pivoting

En escenarios multi-segmento típicos del OSCP, comprometer una máquina te da acceso a su interfaz de red interna, pero tu equipo atacante no sabe cómo llegar a esa red. La solución: **añadir una ruta estática** que apunte al pívot.

```text
[Kali: 10.10.14.5] ──── VPN HTB ──── [Víctima-1: eth0=10.10.10.10 / eth1=172.16.0.10]
                                                          |
                                                   (red interna)
                                                          |
                                               [Víctima-2: 172.16.0.20]
```

Desde Kali, para alcanzar `172.16.0.20`:

```bash
# Añadir ruta hacia la red interna a través del pívot
sudo ip route add 172.16.0.0/24 via 10.10.10.10

# O si usas ligolo-ng (interfaz de túnel):
sudo ip route add 172.16.0.0/24 dev ligolo
```

Ahora `ping 172.16.0.20` saldrá por esa ruta en lugar del default gateway.

> [!NOTE]
> El pívot también necesita configuración (proxychains, port forwarding o ligolo-ng en modo servidor). La parte de tunneling se trata en [Firewalls, NAT y Tunneling](/cybersec/manual/redes/firewalls-nat-y-tunneling).

---

## `traceroute` / `tracert`: visualizar el camino

`traceroute` (Linux/macOS) y `tracert` (Windows) revelan cada router (salto) por el que pasa un paquete. Funcionan manipulando el **TTL** (Time To Live): envían paquetes con TTL=1, 2, 3… y cada router que agota el TTL responde con un ICMP "Time Exceeded", desvelando su IP.

```bash
# Linux (usa UDP por defecto; -I para ICMP)
traceroute 8.8.8.8
traceroute -I 8.8.8.8

# Windows
tracert 8.8.8.8
```

```text
traceroute to 8.8.8.8 (8.8.8.8), 30 hops max
 1  10.10.10.1       1.2 ms   (gateway LAN)
 2  203.0.113.1      8.4 ms   (router ISP)
 3  * * *                     (router que filtra ICMP)
 4  8.8.8.8         12.1 ms
```

Los `* * *` aparecen cuando un router descarta los ICMP o no responde. La relación completa entre TTL, ICMP y protocolos de transporte se explica en [UDP, ICMP y ARP](/cybersec/manual/redes/udp-icmp-arp).

> [!TIP]
> En un pentest interno, `traceroute` hacia una IP inalcanzable puede revelar la topología de red y dónde se corta el camino (firewall, ruta faltante…).

---

## Práctica

### Ejercicio 1 — Longest prefix match

Dada esta tabla de rutas:

```text
0.0.0.0/0       via 192.168.1.1   dev eth0
192.168.0.0/16  via 192.168.1.254 dev eth0
192.168.1.0/24  dev eth0 (connected)
10.0.0.0/8      via 192.168.1.100 dev eth0
```

¿Por qué interfaz/gateway sale un paquete con destino `192.168.2.50`? ¿Y uno con destino `192.168.1.80`?

<details>
<summary>Ver solución</summary>

**Paquete a `192.168.2.50`:**

- `0.0.0.0/0` cubre 192.168.2.50 → prefijo /0
- `192.168.0.0/16` cubre 192.168.2.50 → prefijo /16 ← **GANA (más específica)**
- `192.168.1.0/24` NO cubre 192.168.2.50
- `10.0.0.0/8` NO cubre 192.168.2.50

**Sale por `eth0` hacia el gateway `192.168.1.254`.**

---

**Paquete a `192.168.1.80`:**

- `0.0.0.0/0` cubre 192.168.1.80 → prefijo /0
- `192.168.0.0/16` cubre 192.168.1.80 → prefijo /16
- `192.168.1.0/24` cubre 192.168.1.80 → prefijo /24 ← **GANA (más específica)**

**Sale directamente por `eth0` (ruta conectada, sin gateway)** porque el destino está en la misma LAN.

</details>

### Ejercicio 2 — Añadir ruta de pivoting

Acabas de comprometer una máquina con IP `10.10.10.8` que tiene una segunda interfaz en la red `172.16.5.0/24`. Escribe el comando para que tu Kali pueda alcanzar esa red interna a través del pívot.

<details>
<summary>Ver solución</summary>

```bash
sudo ip route add 172.16.5.0/24 via 10.10.10.8
```

- `172.16.5.0/24` es la red interna que quieres alcanzar.
- `via 10.10.10.8` es la IP del pívot (la interfaz que tu Kali sí puede ver).

Verifica que la ruta se añadió:

```bash
ip route | grep 172.16.5
```

Si usas **ligolo-ng**, la sintaxis alternativa es:

```bash
sudo ip route add 172.16.5.0/24 dev ligolo
```

</details>

---

## Recursos

- [Manpage `ip-route(8)` — Ubuntu Noble](https://manpages.ubuntu.com/manpages/noble/en/man8/ip-route.8.html)
- [HTB Academy — Introduction to Networking](https://academy.hackthebox.com/course/preview/introduction-to-networking)
- [Firewalls, NAT y Tunneling (lección hermana)](/cybersec/manual/redes/firewalls-nat-y-tunneling)
- [UDP, ICMP y ARP — TTL y traceroute (lección hermana)](/cybersec/manual/redes/udp-icmp-arp)
- [Escaneo de puertos: teoría (lección hermana)](/cybersec/manual/redes/escaneo-de-puertos-teoria)
