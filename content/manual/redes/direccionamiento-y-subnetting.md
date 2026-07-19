---
title: Direccionamiento IPv4 y Subnetting
order: 3
description: IP, máscaras, CIDR y subnetting con un método de cálculo rápido y mental — la habilidad de redes con mejor ROI en el OSCP para scoping y pivoting.
---

## Qué es una dirección IPv4

Una IPv4 son **32 bits**, escritos como 4 octetos (0–255) separados por puntos: `192.168.1.10`. Cada octeto son 8 bits, así que el máximo es `11111111` = 255.

Toda IP se divide en dos partes: **red** (identifica la red) y **host** (identifica la máquina dentro de esa red). Lo que marca dónde acaba la red y empieza el host es la **máscara**.

> [!IMPORTANT]
> Dos máquinas pueden hablar **directamente** (sin router) solo si están en la **misma red**, es decir, si su porción de *red* coincide. Esto es exactamente lo que necesitas comprobar al **pivotar**: ¿la máquina comprometida está en la misma subred que mi siguiente objetivo?

## Máscara y notación CIDR

La máscara dice cuántos bits, de izquierda a derecha, son de **red**. Se escribe de dos formas equivalentes:

- **Decimal:** `255.255.255.0`
- **CIDR:** `/24`  (= 24 bits de red)

```text
255.255.255.0  =  11111111.11111111.11111111.00000000
                  └──────── 24 bits red ───────┘└host─┘  →  /24
```

| CIDR | Máscara | Bits host | Hosts útiles | Bloque |
|------|---------|-----------|--------------|--------|
| /24 | 255.255.255.0 | 8 | 254 | 256 |
| /25 | 255.255.255.128 | 7 | 126 | 128 |
| /26 | 255.255.255.192 | 6 | 62 | 64 |
| /27 | 255.255.255.224 | 5 | 30 | 32 |
| /28 | 255.255.255.240 | 4 | 14 | 16 |
| /29 | 255.255.255.248 | 3 | 6 | 8 |
| /30 | 255.255.255.252 | 2 | 2 | 4 |

## Las dos fórmulas que lo resuelven todo

$$
\text{Hosts útiles} = 2^{(\text{bits host})} - 2 \qquad\qquad \text{Tamaño de bloque} = 2^{(\text{bits host})}
$$

Restamos 2 porque en cada subred hay dos direcciones **reservadas**:

- La **dirección de red** (todos los bits de host a 0) → identifica la subred, no es asignable.
- La **dirección de broadcast** (todos los bits de host a 1) → envía a todos, no es asignable.

![Subnetting de un /26](/manual/redes/subnetting.svg)

## Método rápido para calcular una subred

Dada `192.168.1.0/26`, resuélvela mentalmente en 4 pasos:

1. **Bits de host** = 32 − 26 = **6** → hosts útiles = 2⁶ − 2 = **62**.
2. **Tamaño de bloque** = 2⁶ = **64**. La máscara del último octeto = 256 − 64 = **192** → `255.255.255.192`.
3. **Las subredes** van de 64 en 64: `.0`, `.64`, `.128`, `.192`.
4. Para una IP dada, mira en qué bloque cae:

```text
Subred .0/26     → red .0    | hosts .1  – .62   | broadcast .63
Subred .64/26    → red .64   | hosts .65 – .126  | broadcast .127
Subred .128/26   → red .128  | hosts .129– .190  | broadcast .191
Subred .192/26   → red .192  | hosts .193– .254  | broadcast .255
```

> [!TIP]
> El "tamaño de bloque" (256 − máscara) es el truco que usan todos los que calculan subnetting de cabeza. Encuentra el bloque, y la red es el múltiplo justo por debajo de tu IP; el broadcast es el siguiente múltiplo menos 1.

## ¿Están dos IPs en la misma subred?

Ejemplo OSCP típico: comprometes `10.10.10.70` y ves una ruta a `10.10.10.130`. Con máscara `/26` (bloque 64):

- `10.10.10.70` → cae en el bloque `.64` (rango .64–.127).
- `10.10.10.130` → cae en el bloque `.128` (rango .128–.191).

**Subredes distintas** → no hablan directamente, necesitas enrutar/pivotar. Si la máscara fuera `/24`, ambas estarían en `10.10.10.0/24` y sí se alcanzarían.

## Rangos privados (RFC 1918) y especiales

Memorízalos: identifican redes internas, tu objetivo constante en post-explotación.

| Rango | CIDR | Uso |
|-------|------|-----|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 | Privado (grandes redes) |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 | Privado (medianas) |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 | Privado (domésticas) |
| 127.0.0.0/8 | — | Loopback (localhost) |
| 169.254.0.0/16 | — | APIPA (sin DHCP) |

> [!NOTE]
> Sobre **IPv6**: son 128 bits en hexadecimal (`fe80::1`). En OSCP aparece poco, pero recuerda que muchas máquinas Windows lo tienen activo y a veces un servicio escucha en IPv6 y no en IPv4. `nmap -6` escanea IPv6.

## Práctica

**Ejercicio 1.** Para `172.16.5.0/28`: ¿máscara decimal, hosts útiles, tamaño de bloque, y dirección de broadcast de la primera subred?

<details>
<summary>Ver solución</summary>

- Bits host = 32 − 28 = 4 → hosts útiles = 2⁴ − 2 = **14**.
- Bloque = 2⁴ = **16** → máscara = 256 − 16 = 240 → **255.255.255.240**.
- Primera subred `172.16.5.0/28`: red `.0`, hosts `.1–.14`, **broadcast `.15`**.

</details>

**Ejercicio 2.** ¿Están `192.168.1.100` y `192.168.1.200` en la misma subred si la máscara es `/25`?

<details>
<summary>Ver solución</summary>

`/25` → bloque = 128. Subredes: `.0` (rango .0–.127) y `.128` (rango .128–.255).
- `.100` cae en `192.168.1.0/25`.
- `.200` cae en `192.168.1.128/25`.

**No**, están en subredes distintas. Con `/24` sí estarían juntas.

</details>

**Ejercicio 3 (OSCP).** Comprometes un host con dos interfaces: `eth0 = 10.10.10.15/24` y `eth1 = 192.168.50.1/24`. Descubres el host `192.168.50.77`. ¿Puedes alcanzarlo desde tu Kali (`10.10.14.5`) directamente? ¿Qué te dice esto?

<details>
<summary>Ver solución</summary>

**No directamente.** Tu Kali está en `10.10.14.0/24`; `192.168.50.77` está en `192.168.50.0/24`, una red interna a la que solo llega el host comprometido (por su `eth1`). Ese host es *dual-homed* → es tu **pívot**: montarás un túnel a través de él para alcanzar `192.168.50.0/24`. Esto es exactamente el escenario de la lección de *Pivoting*.

</details>

**Reto diario.** Genera IPs/máscaras aleatorias y calcula red, broadcast y rango. Automatiza la comprobación:

```bash
ipcalc 192.168.1.0/26        # muestra red, broadcast, rango y hosts
sipcalc 172.16.5.10/28       # alternativa
```

## Recursos

- [**subnettingpractice.com**](https://subnettingpractice.com/) — genera ejercicios infinitos con corrección.
- [**Professor Messer — "Seven Second Subnetting"**](https://www.professormesser.com/network-plus/n10-009/n10-009-video/seven-second-subnetting-n10-009/) — el truco del cálculo mental rápido.
- [**Professor Messer — "Calculating IPv4 Subnets and Hosts"**](https://www.professormesser.com/network-plus/n10-009/n10-009-video/calculating-ipv4-subnets-and-hosts-n10-009/) — paso a paso.
- [**calculator.net — IP Subnet Calculator**](https://www.calculator.net/ip-subnet-calculator.html) y [**jodies.de/ipcalc**](http://jodies.de/ipcalc) — para verificar tus cálculos a mano.
- [**RFC 1918**](https://www.rfc-editor.org/rfc/rfc1918) — la fuente oficial de los rangos privados.
