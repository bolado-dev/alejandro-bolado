---
title: "VLANs y Switching (802.1Q)"
order: 8
description: "Cómo los switches segmentan el tráfico con VLANs, el estándar 802.1Q y los ataques de capa 2 más relevantes para redes internas."
---

## Switches y la tabla CAM

Un **switch** opera en la **capa 2** del modelo OSI. Su función principal es reenviar tramas Ethernet únicamente al puerto donde se encuentra el destino, en lugar de replicarlas a todos los puertos como hace un hub.

Para conseguirlo, el switch mantiene la **tabla CAM** (*Content Addressable Memory*), también llamada tabla de direcciones MAC:

```text
Puerto | Dirección MAC           | VLAN
-------|-------------------------|------
Fa0/1  | aa:bb:cc:dd:ee:01       | 10
Fa0/2  | aa:bb:cc:dd:ee:02       | 10
Fa0/3  | aa:bb:cc:dd:ee:03       | 20
```

Cuando llega una trama, el switch:

1. Aprende la MAC de origen y la asocia al puerto de entrada.
2. Busca la MAC de destino en la tabla CAM.
3. Si la encuentra, reenvía solo a ese puerto. Si no, hace **flooding** (replica a todos los puertos de la misma VLAN), igual que un hub.

> [!NOTE]
> La tabla CAM tiene capacidad limitada. Cuando se llena, el switch no puede añadir nuevas entradas y trata las tramas desconocidas con flooding, comportándose temporalmente como un hub.

## Dominio de broadcast y VLANs

Un **dominio de broadcast** es el conjunto de dispositivos que reciben un frame de broadcast (destino `ff:ff:ff:ff:ff:ff`). Sin segmentación, todos los puertos de un switch pertenecen al mismo dominio, lo que genera ruido de red y es un vector de ataque (ARP poisoning, DHCP rogue, etc. — ver [ARP y ataques de capa 2](/cybersec/manual/redes/udp-icmp-arp)).

Una **VLAN** (*Virtual LAN*) divide lógicamente un switch físico en múltiples dominios de broadcast independientes. Los dispositivos en VLAN 10 no pueden comunicarse directamente con los de VLAN 20 sin pasar por un router (o un switch de capa 3).

```text
Switch físico
┌──────────────────────────────────┐
│  VLAN 10 (Oficina)               │
│  [PC-A] ──── [PC-B]              │
│                                  │
│  VLAN 20 (Servidores)            │
│  [SRV-1] ─── [SRV-2]            │
│                                  │
│  VLAN 10 y VLAN 20 aisladas      │
└──────────────────────────────────┘
```

## Estándar 802.1Q: el tag de VLAN

Para que un switch identifique a qué VLAN pertenece una trama, se inserta un **tag de 4 bytes** en la cabecera Ethernet según el estándar **IEEE 802.1Q**:

```text
Trama Ethernet sin tag:
┌──────────┬──────────┬──────┬─────────┬─────┐
│ DST MAC  │ SRC MAC  │ Type │ Payload │ FCS │
│  6 bytes │  6 bytes │  2 B │   ...   │  4B │
└──────────┴──────────┴──────┴─────────┴─────┘

Trama Ethernet con tag 802.1Q:
┌──────────┬──────────┬──────────┬──────┬─────────┬─────┐
│ DST MAC  │ SRC MAC  │ 802.1Q   │ Type │ Payload │ FCS │
│  6 bytes │  6 bytes │  4 bytes │  2 B │   ...   │  4B │
└──────────┴──────────┴──────────┴──────┴─────────┴─────┘
                              ↑
                    TPID (0x8100) + PCP + DEI + VLAN ID
```

El campo **VLAN ID** tiene **12 bits**, lo que permite hasta 4094 VLANs distintas (IDs 1–4094; 0 y 4095 son reservados).

| Campo  | Bits | Descripción                          |
|--------|------|--------------------------------------|
| TPID   | 16   | `0x8100` — identifica trama 802.1Q   |
| PCP    | 3    | Prioridad (QoS)                       |
| DEI    | 1    | Drop Eligible Indicator               |
| VLAN ID| 12   | Identificador de VLAN (1–4094)        |

## Tipos de puerto: access vs trunk

### Puerto access

- Pertenece a **una sola VLAN**.
- El tráfico que sale del puerto va **sin tag** (el dispositivo final no necesita saber la VLAN).
- Uso típico: conectar un PC, impresora o servidor.

```bash
# Configuración Cisco (referencia de concepto)
switchport mode access
switchport access vlan 10
```

### Puerto trunk

- Transporta **varias VLANs simultáneamente** con tag 802.1Q.
- Uso típico: enlace entre switches, o switch ↔ router (router-on-a-stick).

```bash
# Configuración Cisco (referencia de concepto)
switchport mode trunk
switchport trunk allowed vlan 10,20,30
```

### Native VLAN

En un enlace trunk, se puede definir una **native VLAN**: el tráfico de esa VLAN específica circula **sin tag**. Por defecto suele ser la VLAN 1. Esto tiene implicaciones de seguridad relevantes.

```text
Trunk entre SW-A y SW-B:
 [SW-A] ════════════ [SW-B]
   │                    │
   │  Tráfico VLAN 10   │  → con tag 0x8100, VID=10
   │  Tráfico VLAN 20   │  → con tag 0x8100, VID=20
   │  Tráfico VLAN 1    │  → SIN tag (native VLAN)
```

## Ataques de capa 2

### MAC flooding

El atacante satura la tabla CAM del switch enviando un aluvión de tramas con MACs de origen falsas y distintas. Cuando la tabla se llena, el switch no puede aprender nuevas entradas y hace flooding de todas las tramas desconocidas, convirtiendo la red en un hub temporal.

**Resultado:** el atacante puede capturar tráfico de toda la VLAN con un sniffer.

**Herramienta:** `macof` (parte del paquete `dsniff`).

```bash
# Inundar la CAM del switch (solo en laboratorio autorizado)
macof -i eth0
```

> [!WARNING]
> `macof` puede generar miles de tramas por segundo y colapsar switches de producción. Úsalo exclusivamente en laboratorios autorizados.

### VLAN hopping — Switch spoofing (DTP)

Los switches Cisco usan **DTP** (*Dynamic Trunking Protocol*) para negociar automáticamente enlaces trunk. Si un puerto está en modo `dynamic desirable` o `dynamic auto`, un atacante puede enviar tramas DTP desde su equipo y hacer que el switch lo trate como otro switch, estableciendo un trunk.

**Resultado:** el atacante recibe tráfico etiquetado de todas las VLANs del trunk.

**Herramienta:** `yersinia` (ataques de capa 2).

```bash
# Interfaz interactiva de yersinia (solo en laboratorio)
yersinia -G
```

### VLAN hopping — Double tagging

Este ataque funciona incluso sin DTP y explota la **native VLAN**:

1. El atacante está en la VLAN nativa (p. ej., VLAN 1) de un puerto trunk.
2. Envía una trama con **dos tags 802.1Q**: el externo con VID de la native VLAN (1) y el interno con la VLAN objetivo (p. ej., VLAN 20).
3. El primer switch **elimina el tag externo** (es la native VLAN, sin tag) y reenvía la trama con el tag interno hacia el siguiente switch.
4. El segundo switch lee el tag interno y entrega la trama en la **VLAN 20**.

```text
Atacante (VLAN 1, native)
    │
    │  [tag VLAN 1][tag VLAN 20] Payload
    ▼
 [SW-A]  ← elimina tag externo (native VLAN 1)
    │
    │  [tag VLAN 20] Payload
    ▼
 [SW-B]  ← entrega en VLAN 20
    │
    ▼
 Víctima (VLAN 20)
```

> [!IMPORTANT]
> El double tagging es **unidireccional**: la víctima no puede responder directamente al atacante a través de este mecanismo. Sirve para inyectar tráfico, no para establecer una sesión bidireccional directamente.

> [!TIP]
> La contramedida más eficaz es cambiar la native VLAN a una VLAN no usada (p. ej., VLAN 999) y desactivar DTP en todos los puertos de acceso (`switchport nonegotiate`).

## Relevancia en OSCP

En los exámenes y labs de OSCP, los ataques de switching puro son menos frecuentes que los de capa 3 o superior. Sin embargo, entender la segmentación por VLANs es fundamental para:

- Comprender por qué un host en una VLAN no puede alcanzar a otro sin pasar por un router.
- Identificar si una red interna está correctamente segmentada (o mal configurada).
- Aprovechar configuraciones deficientes (p. ej., VLAN 1 como native VLAN en trunks accesibles).

## Práctica

**Ejercicio 1.** ¿Cuál es la diferencia funcional entre un puerto access y un puerto trunk? ¿Qué ocurre con el tag 802.1Q en cada caso?

<details>
<summary>Ver solución</summary>

Un **puerto access** pertenece a una única VLAN y transmite el tráfico **sin tag 802.1Q**: el dispositivo final (PC, impresora) no necesita conocer la VLAN, el switch se encarga de asociar el tráfico a la VLAN configurada.

Un **puerto trunk** transporta tráfico de **varias VLANs** simultáneamente. Cada trama lleva un **tag 802.1Q de 4 bytes** con el VLAN ID correspondiente, para que el switch receptor sepa a qué VLAN pertenece. La excepción es la **native VLAN**, cuyo tráfico circula sin tag por el trunk.

</details>

**Ejercicio 2.** Explica en 2 frases cómo funciona el ataque de double tagging y por qué la native VLAN es la clave del ataque.

<details>
<summary>Ver solución</summary>

El atacante envía una trama con dos tags 802.1Q anidados: el tag externo corresponde a la native VLAN (que el primer switch elimina sin reenviar el tag), y el tag interno apunta a la VLAN víctima, que el segundo switch acepta como legítima.

La native VLAN es clave porque los switches eliminan su tag automáticamente en los trunks, lo que permite "esconder" el segundo tag y hacer que el tráfico llegue a una VLAN diferente a la del atacante sin que ningún switch lo detecte como anómalo.

</details>

## Recursos

- [Yersinia — GitHub oficial](https://github.com/tomac/yersinia)
- [Explicación de 802.1Q VLAN tagging — Cloudflare](https://www.cloudflare.com/learning/network-layer/what-is-a-virtual-lan/)
- [Lección hermana: UDP, ICMP y ARP (MAC/ARP en capa 2)](/cybersec/manual/redes/udp-icmp-arp)
- [Lección hermana: MITM y Sniffing](/cybersec/manual/redes/mitm-y-sniffing)
