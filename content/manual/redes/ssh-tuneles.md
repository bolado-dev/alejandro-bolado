---
title: "SSH a Fondo: Túneles y ProxyJump"
order: 19
description: Local, Remote y Dynamic forwarding con SSH explicados con diagramas — más ProxyJump, ~/.ssh/config multi-salto y sshuttle para pivotar en OSCP.
---

## SSH como herramienta de pivoting

En OSCP, SSH no es solo "acceso remoto seguro". Es una **VPN instantánea** que ya viene instalada en casi todo servidor Linux. Cuando comprometes una máquina con SSH habilitado y credenciales válidas, puedes tunelizar tráfico hacia redes internas sin instalar nada extra.

> [!IMPORTANT]
> Los túneles SSH requieren que `AllowTcpForwarding` esté a `yes` en el servidor (es el valor por defecto). En hardening extremo puede estar desactivado — en ese caso recurre a chisel o socat. Ver [Firewalls, NAT y Tunneling](/cybersec/manual/redes/firewalls-nat-y-tunneling).

---

## Los tres reenvíos SSH

### Local Port Forwarding (`-L`)

**Sintaxis:** `ssh -L <puerto_local>:<destino>:<puerto_destino> user@pivot`

**Pregunta clave:** ¿qué servicio ve el pívot pero tú no puedes alcanzar directamente?

```text
  Tu Kali                  Pívot SSH               Red interna
  ┌──────────────┐         ┌─────────┐         ┌──────────────┐
  │ localhost:8080│────────►│ SSH srv │────────►│ 10.10.10.5:80│
  └──────────────┘  túnel  └─────────┘  TCP    └──────────────┘
```

```bash
ssh -L 8080:10.10.10.5:80 user@pivot
# Ahora: curl http://localhost:8080  →  llega al puerto 80 de 10.10.10.5
```

El tráfico va cifrado entre Kali y el pívot; dentro de la red interna va en claro.

### Remote Port Forwarding (`-R`)

**Sintaxis:** `ssh -R <puerto_remoto>:<destino>:<puerto_destino> user@pivot`

**Caso de uso:** quieres que el servidor SSH (u otras máquinas que lo vean) accedan a algo que **tú** ofreces.

```text
  Tu Kali                  Pívot SSH
  ┌──────────────┐         ┌─────────────────┐
  │ tu servicio  │◄────────│ 0.0.0.0:9090    │
  │ localhost:80 │  túnel  │ (abre el pívot) │
  └──────────────┘         └─────────────────┘
```

```bash
ssh -R 9090:localhost:80 user@pivot
# En el pívot: curl http://localhost:9090  →  llega a tu puerto 80
```

> [!TIP]
> El Remote forwarding es útil cuando quieres entregar un payload o archivo desde tu Kali a máquinas de la red interna que **sí ven** al pívot pero **no te ven a ti**.

### Dynamic Port Forwarding (`-D`) — Proxy SOCKS

**Sintaxis:** `ssh -D <puerto_local> user@pivot`

Crea un **proxy SOCKS5** local. Todo lo que configures para pasar por ese proxy viajará a través del túnel SSH y saldrá por el pívot.

```text
  Tu Kali                  Pívot SSH               Red interna
  ┌──────────────┐         ┌─────────┐         ┌──────────────┐
  │ SOCKS5:1080  │────────►│ SSH srv │────────►│  cualquier   │
  │ proxychains  │  túnel  └─────────┘  TCP    │   host:port  │
  └──────────────┘                             └──────────────┘
```

```bash
# Abrir el proxy SOCKS
ssh -D 1080 user@pivot

# Usar proxychains para enrutar herramientas a través del proxy
proxychains nmap -sT -Pn -p 22,80,443 10.10.10.0/24
```

> [!WARNING]
> Con proxychains, usa siempre `nmap -sT -Pn` (TCP connect, sin ping). Los escaneos SYN (`-sS`) y UDP no funcionan a través de SOCKS porque requieren privilegios de raw socket que el proxy no reenvía. Ver [Escaneo de Puertos: Teoría](/cybersec/manual/redes/escaneo-de-puertos-teoria).

### Tabla resumen

| Reenvío | Flag | ¿Quién abre el puerto? | Caso típico en OSCP |
|---------|------|------------------------|----------------------|
| Local   | `-L` | Tu Kali | Acceder a servicio interno (MySQL, RDP, web interna) |
| Remote  | `-R` | El pívot | Exponer tu servidor de archivos a la red interna |
| Dynamic | `-D` | Tu Kali (SOCKS) | Escanear toda la red interna con proxychains |

---

## Flags útiles para túneles

| Flag | Efecto | Por qué usarlo |
|------|--------|----------------|
| `-f` | Manda SSH al background | No bloquea la terminal |
| `-N` | No ejecuta comando remoto | Solo para el túnel, no abre shell |
| `-C` | Compresión del tráfico | Útil en conexiones lentas |
| `-T` | Desactiva pseudo-TTY | Evita warnings en combinación con `-N` |

Combinación habitual para abrir un proxy SOCKS en background:

```bash
ssh -fND 1080 user@pivot
```

Para cerrar ese túnel después:

```bash
# Busca el PID
ps aux | grep "ssh -fND"
kill <PID>
```

---

## ProxyJump: saltar bastiones

`ProxyJump` (`-J`) conecta a un destino **a través** de uno o más saltos intermedios. SSH maneja el túnel internamente — no necesitas abrir un puerto local primero.

```bash
# Llegar a destino_interno usando pivot como bastión
ssh -J user@pivot user@destino_interno
```

```text
  Tu Kali ──SSH──► pivot ──SSH──► destino_interno
```

Para múltiples saltos en cadena:

```bash
ssh -J user@pivot1,user@pivot2 user@destino_final
```

---

## `~/.ssh/config`: configuración permanente

Escribir los flags en cada comando es propenso a errores. El fichero `~/.ssh/config` guarda alias de hosts con todas sus opciones.

```text
# ~/.ssh/config

# Bastión / pívot
Host pivot
    HostName 10.10.10.100
    User pentester
    IdentityFile ~/.ssh/id_rsa_htb

# Máquina interna — salta automáticamente por pivot
Host interno
    HostName 172.16.0.50
    User admin
    ProxyJump pivot

# Proxy SOCKS permanente (levanta el túnel con: ssh socks-proxy)
Host socks-proxy
    HostName 10.10.10.100
    User pentester
    DynamicForward 1080
    RequestTTY no
    RemoteCommand none
```

Con esta config:

```bash
ssh interno          # conecta a 172.16.0.50 a través de pivot automáticamente
ssh socks-proxy      # levanta el SOCKS en :1080
```

> [!NOTE]
> `ProxyCommand` es la forma más antigua y explícita: `ProxyCommand ssh -W %h:%p pivot`. `ProxyJump` es el alias moderno equivalente disponible desde OpenSSH 7.3.

---

## sshuttle: "VPN de pobre"

`sshuttle` enruta subredes completas a través de SSH sin necesitar proxychains ni configurar SOCKS. Funciona inyectando reglas de `iptables`/`nftables` transparentemente.

```bash
# Instalar en Kali
sudo apt install sshuttle

# Enrutar la subred 172.16.0.0/24 a través del pívot
sshuttle -r user@pivot 172.16.0.0/24

# Enrutar TODO el tráfico (cuidado: incluye tu propio tráfico)
sshuttle -r user@pivot 0.0.0.0/0
```

Ventajas sobre SOCKS + proxychains:

- Funciona con herramientas que **no soportan proxychains** (resolución DNS, ICMP básico).
- `nmap -sT` y `nmap -sU` funcionan directamente sin flags especiales.
- No requiere tocar la config de cada herramienta.

> [!CAUTION]
> sshuttle modifica las tablas de routing de tu Kali. Si enrutas `0.0.0.0/0`, TODO tu tráfico de internet pasará por el pívot. Usa subredes específicas en OSCP para no perder acceso a otros recursos.

---

## Encaje en el workflow de pivoting

```text
  Kali ──[SSH -D 1080]──► Pívot ──► Red interna (172.16.0.0/24)
                                         │
                              proxychains nmap -sT -Pn
                              proxychains crackmapexec
                              proxychains curl http://172.16.0.50
```

El flujo típico en OSCP:

1. Comprometer el pívot (shell o SSH con credenciales).
2. `ssh -fND 1080 user@pivot` — levantar SOCKS.
3. Editar `/etc/proxychains4.conf` — asegurar `socks5 127.0.0.1 1080`.
4. `proxychains nmap -sT -Pn 172.16.0.0/24` — descubrir hosts internos.
5. Para pivoting más complejo (múltiples saltos), ver [Pivoting Avanzado](/cybersec/manual/redes/pivoting-avanzado).

---

## Práctica

**Ejercicio 1.** Escenario: tu Kali NO puede alcanzar el puerto MySQL (3306) de `172.16.0.10`, pero el pívot `10.10.10.100` sí. ¿Qué tipo de reenvío usas (`-L`, `-R` o `-D`) y cuál es el comando exacto para que `mysql -h 127.0.0.1 -P 3306` funcione desde tu Kali?

<details>
<summary>Ver solución</summary>

Usas **Local Port Forwarding (`-L`)** porque quieres que un puerto de **tu Kali** llegue a un servicio que ve el pívot:

```bash
ssh -L 3306:172.16.0.10:3306 user@10.10.10.100
```

Ahora en otra terminal:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p
```

El tráfico viaja: `Kali:3306 → túnel SSH → pívot → 172.16.0.10:3306`.

Si el puerto 3306 local ya está en uso (tienes MySQL local), usa uno alternativo:

```bash
ssh -L 13306:172.16.0.10:3306 user@10.10.10.100
mysql -h 127.0.0.1 -P 13306 -u root -p
```

</details>

**Ejercicio 2.** Escribe un bloque `~/.ssh/config` que permita hacer `ssh interno` y llegar a `192.168.1.50` saltando por `pivot` (`10.10.10.100`), usando la clave `~/.ssh/id_rsa_lab` para ambos saltos y el usuario `kali` en el pívot y `administrator` en el destino interno.

<details>
<summary>Ver solución</summary>

```text
# ~/.ssh/config

Host pivot
    HostName 10.10.10.100
    User kali
    IdentityFile ~/.ssh/id_rsa_lab

Host interno
    HostName 192.168.1.50
    User administrator
    IdentityFile ~/.ssh/id_rsa_lab
    ProxyJump pivot
```

Con esta configuración:

```bash
ssh interno
# Equivale a: ssh -J kali@10.10.10.100 administrator@192.168.1.50 -i ~/.ssh/id_rsa_lab
```

SSH usa la `IdentityFile` del bloque `pivot` para el primer salto y la del bloque `interno` para el segundo.

</details>

---

## Recursos

- [ssh(1) — manpage Ubuntu](https://manpages.ubuntu.com/manpages/noble/man1/ssh.1.html)
- [ssh_config(5) — manpage Ubuntu](https://manpages.ubuntu.com/manpages/noble/man5/ssh_config.5.html)
- [sshuttle — repositorio oficial](https://github.com/sshuttle/sshuttle)
- [HTB Academy — Pivoting, Tunneling & Port Forwarding](https://academy.hackthebox.com/course/preview/pivoting-tunneling-and-port-forwarding)
- [HackTricks — Tunneling and Port Forwarding](https://book.hacktricks.wiki/generic-methodologies-and-resources/tunneling-and-port-forwarding/)
