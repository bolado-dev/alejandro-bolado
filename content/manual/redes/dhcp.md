---
title: "DHCP (el proceso DORA)"
order: 9
description: "Cómo DHCP asigna automáticamente configuración de red mediante el proceso DORA y los ataques de starvation y rogue server para MITM."
---

## Qué es DHCP y por qué importa

**DHCP** (*Dynamic Host Configuration Protocol*) permite que un cliente de red obtenga automáticamente su configuración IP sin intervención manual. Sin él, cada dispositivo necesitaría una IP estática configurada a mano.

Los parámetros que DHCP puede asignar son:

| Parámetro         | Ejemplo             |
|-------------------|---------------------|
| Dirección IP      | `192.168.1.100`     |
| Máscara de subred | `255.255.255.0`     |
| Gateway por defecto | `192.168.1.1`    |
| Servidores DNS    | `8.8.8.8, 1.1.1.1` |
| Tiempo de concesión | 86400 segundos   |

DHCP opera sobre **UDP**:

- **Puerto 67**: servidor DHCP (escucha peticiones).
- **Puerto 68**: cliente DHCP (envía peticiones y recibe respuestas).

> [!NOTE]
> Se usa UDP en lugar de TCP porque en el momento del Discover el cliente aún no tiene IP asignada y no puede establecer una conexión TCP. El broadcast UDP permite la comunicación antes de tener identidad en la red.

## El proceso DORA

DORA es el acrónimo de los 4 mensajes que componen el intercambio estándar entre cliente y servidor:

```text
Cliente                                    Servidor
   │                                          │
   │──── 1. DHCP DISCOVER (broadcast) ───────►│
   │     src: 0.0.0.0:68                      │
   │     dst: 255.255.255.255:67              │
   │                                          │
   │◄─── 2. DHCP OFFER ──────────────────────│
   │     src: 192.168.1.1:67                  │
   │     dst: 255.255.255.255:68              │
   │     Oferta: IP 192.168.1.100             │
   │                                          │
   │──── 3. DHCP REQUEST (broadcast) ────────►│
   │     "Acepto la oferta de 192.168.1.1"    │
   │                                          │
   │◄─── 4. DHCP ACK ────────────────────────│
   │     Confirma: IP, máscara, GW, DNS       │
   │     Lease time: 86400 s                  │
   │                                          │
[Cliente configura interfaz con los parámetros recibidos]
```

### 1. DHCP Discover

El cliente no tiene IP. Envía un **broadcast** a `255.255.255.255` desde la dirección `0.0.0.0` pidiendo que algún servidor DHCP en la red le asigne una configuración. Todos los dispositivos de la LAN lo reciben, pero solo los servidores DHCP responden.

### 2. DHCP Offer

El servidor responde con una **oferta**: una IP disponible de su pool, junto con máscara, gateway, DNS y tiempo de concesión. La oferta también se envía en broadcast porque el cliente aún no tiene IP confirmada. Si hay varios servidores DHCP, cada uno puede enviar su propia Offer.

### 3. DHCP Request

El cliente elige una de las ofertas recibidas (normalmente la primera) y envía un **Request en broadcast**. Se hace en broadcast para que todos los servidores sepan qué oferta fue aceptada (los que no fueron elegidos liberan su reserva temporal).

### 4. DHCP ACK

El servidor seleccionado confirma la asignación con un **ACK**. A partir de este momento, el cliente puede configurar su interfaz de red con los parámetros recibidos.

> [!TIP]
> Puedes capturar el proceso DORA completo con Wireshark filtrando por `bootp` (DHCP usa el formato de paquete BOOTP). También puedes descubrirlo activamente:
> ```bash
> nmap --script broadcast-dhcp-discover
> ```

## Lease: concesión y renovación

La IP no se asigna de forma permanente, sino mediante una **concesión** (*lease*) con tiempo de expiración:

```text
t=0          t=T/2         t=T*7/8       t=T
├────────────┼─────────────┼─────────────┤
│  IP activa │  Renovación │  Rebinding  │  Expiración
│            │  (unicast)  │  (broadcast)│
```

- En `T/2` el cliente intenta renovar enviando un **Request unicast** al servidor original.
- En `T×7/8` si no hubo respuesta, hace un **broadcast** buscando cualquier servidor (rebinding).
- En `T` la IP expira y el cliente debe reiniciar el proceso DORA.

## Sin DHCP: APIPA y link-local

Si un cliente no recibe respuesta de ningún servidor DHCP, en sistemas Windows y algunos Linux se asigna automáticamente una dirección **APIPA** (*Automatic Private IP Addressing*) del rango `169.254.0.0/16`.

> [!NOTE]
> Las direcciones `169.254.x.x` son **link-local**: solo son válidas en el segmento de red local y no son enrutables. Ver [Direccionamiento y subnetting](/cybersec/manual/redes/direccionamiento-y-subnetting) para los rangos especiales de IPv4.

Una IP en `169.254.x.x` es un indicador claro de que el cliente no pudo contactar con un servidor DHCP.

## Ataques contra DHCP

### DHCP Starvation (DoS)

El atacante envía una gran cantidad de mensajes **DHCP Discover** con MACs de origen falsas y distintas, agotando el pool de direcciones IP del servidor legítimo.

```text
Atacante
   │
   │──── DISCOVER (MAC: aa:bb:cc:00:00:01) ──►│ IP asignada
   │──── DISCOVER (MAC: aa:bb:cc:00:00:02) ──►│ IP asignada
   │──── DISCOVER (MAC: aa:bb:cc:00:00:03) ──►│ IP asignada
   │     ... (miles de peticiones)             │
   │                                           │
[Pool agotado — nuevos clientes no obtienen IP]
```

**Resultado:** denegación de servicio. Los clientes legítimos que intenten conectarse no recibirán configuración IP.

**Herramientas:** `yersinia`, `dhcpstarv`.

```bash
# DHCP starvation con yersinia (solo en laboratorio autorizado)
yersinia dhcp -attack 1
```

> [!WARNING]
> Un ataque de starvation contra una red de producción puede dejar sin conectividad a todos los dispositivos de una LAN. Úsalo exclusivamente en laboratorios autorizados.

### Rogue DHCP Server (MITM)

El ataque más peligroso en entornos corporativos. El atacante levanta un **servidor DHCP falso** que responde más rápido que el legítimo (o tras un starvation previo que lo silencia).

El rogue DHCP distribuye configuración maliciosa:

- **Gateway**: la IP del atacante → todo el tráfico pasa por él.
- **DNS**: servidores DNS controlados por el atacante → resolución de nombres manipulable.

```text
[PC víctima] ──DISCOVER──► [broadcast]
                                │
                     ┌──────────┴───────────┐
                     │                      │
              [Servidor legítimo]    [Atacante (rogue)]
                     │                      │
                     │◄── OFFER (lento) ────│
                     │                      │──── OFFER (rápido) ──►[PC víctima]
                                                  GW: 192.168.1.99 (atacante)
                                                  DNS: 192.168.1.99

[PC víctima acepta la oferta del rogue]
[Todo el tráfico del PC pasa por el atacante → MITM]
```

**Resultado:** MITM completo de toda la LAN. El atacante puede leer, modificar o redirigir el tráfico de todos los clientes que obtengan configuración del rogue server. Ver [MITM y Sniffing](/cybersec/manual/redes/mitm-y-sniffing) para técnicas de explotación posteriores.

```bash
# Descubrir servidores DHCP en la red (incluyendo rogues)
nmap --script broadcast-dhcp-discover

# Alternativa: escuchar respuestas DHCP con tcpdump
tcpdump -i eth0 port 67 or port 68 -n
```

> [!IMPORTANT]
> Un rogue DHCP es especialmente efectivo combinado con starvation previo: primero se agota el pool del servidor legítimo (que deja de responder por falta de IPs), y luego el rogue es el único que responde a los Discover.

> [!TIP]
> La contramedida en switches gestionados es **DHCP Snooping**: solo permite respuestas DHCP (Offer/ACK) desde puertos marcados como "trusted" (los que conectan con el servidor DHCP legítimo). Las respuestas DHCP desde puertos "untrusted" son descartadas.

## Práctica

**Ejercicio 1.** Ordena y nombra correctamente los 4 mensajes del proceso DORA, indicando quién los envía (cliente o servidor) y si son unicast o broadcast.

<details>
<summary>Ver solución</summary>

| Orden | Nombre    | Emisor   | Tipo      | Descripción                                      |
|-------|-----------|----------|-----------|--------------------------------------------------|
| 1     | Discover  | Cliente  | Broadcast | Solicita configuración IP a cualquier servidor DHCP de la LAN |
| 2     | Offer     | Servidor | Broadcast | Propone una IP disponible junto con máscara, GW y DNS |
| 3     | Request   | Cliente  | Broadcast | Acepta la oferta de un servidor concreto (en broadcast para notificar a todos) |
| 4     | ACK       | Servidor | Broadcast | Confirma la asignación; el cliente configura su interfaz |

</details>

**Ejercicio 2.** ¿Cómo consigue un rogue DHCP server realizar un MITM de toda una LAN? Describe los pasos y qué parámetro DHCP es la clave del ataque.

<details>
<summary>Ver solución</summary>

El ataque se desarrolla en dos fases:

1. **Posicionamiento:** el atacante levanta un servidor DHCP falso en la LAN. Opcionalmente realiza un **DHCP starvation** previo para agotar el pool del servidor legítimo y que este deje de responder.

2. **Distribución de configuración maliciosa:** cuando un cliente hace un DHCP Discover, el rogue server responde con una Offer donde el campo **default gateway** apunta a la IP del atacante (en lugar del router real). El cliente acepta la oferta y configura su interfaz con ese gateway falso.

3. **MITM:** a partir de ese momento, todo el tráfico del cliente destinado fuera de la LAN se envía al atacante. Este puede reenviarlo al gateway real (actuando como proxy transparente), con lo que la víctima no nota ningún fallo de conectividad, mientras el atacante inspecciona o modifica el tráfico.

La clave es el parámetro **default gateway**: controlar el gateway equivale a controlar todo el tráfico de salida del cliente. El campo **DNS server** es el segundo vector más poderoso, ya que permite redirigir dominios a IPs controladas por el atacante.

</details>

## Recursos

- [RFC 2131 — Dynamic Host Configuration Protocol](https://www.rfc-editor.org/rfc/rfc2131)
- [Yersinia — GitHub oficial](https://github.com/tomac/yersinia)
- [Lección hermana: MITM y Sniffing](/cybersec/manual/redes/mitm-y-sniffing)
- [Lección hermana: Direccionamiento y Subnetting (rangos especiales)](/cybersec/manual/redes/direccionamiento-y-subnetting)
