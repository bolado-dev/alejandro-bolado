---
title: "mitm6 y NTLM Relay"
order: 24
description: "Combina mitm6 y ntlmrelayx para retransmitir hashes NetNTLM a LDAP/SMB sin necesidad de crackearlos y comprometer el dominio."
---

## El vector: Windows prefiere IPv6 (pero nadie lo configura)

Windows tiene soporte IPv6 activo **por defecto** y, según la especificación del sistema, prefiere IPv6 a IPv4 cuando ambos están disponibles. El problema en redes corporativas es que casi nunca existe un servidor **DHCPv6 legítimo**: las redes se configuran solo con IPv4.

**mitm6** explota exactamente esa brecha. Responde a las peticiones DHCPv6 que emiten periódicamente los clientes Windows (`SOLICIT`, `REQUEST`) asignándoles como **servidor DNS IPv6** la dirección de la máquina atacante. A partir de ese momento, el atacante controla la resolución de nombres IPv6 de las víctimas.

```text
  [Víctima Windows]                 [Red]              [Atacante / mitm6]
        |                             |                        |
        |=== DHCPv6 SOLICIT =========>=======================>|
        |   "¿Hay algún servidor      |                        |
        |    DHCPv6 en la red?"       |                        |
        |                             |         mitm6 responde |
        |<════════════════════════════════════════════════════ |
        |   "Aquí. Tu DNS IPv6        |                        |
        |    es [fd00::atacante]"     |                        |
        |                             |                        |
        |─── DNS Query (IPv6) ────────────────────────────── >|
        |   "¿Dónde está WPAD?"      |                        |
        |<── DNS Response ────────────────────────────────── -|
        |   "[fd00::atacante]"        |                        |
        |                             |                        |
        |─── Auth HTTP/SMB ──────────────────────────────── ->|
        |   (NetNTLM hash)            |                  capturado / relay
```

La lectura en profundidad del protocolo IPv6 y por qué los ataques de DHCPv6 son tan efectivos está en la lección [IPv6 para pentest](/cybersec/manual/redes/ipv6-para-pentest).

> [!WARNING]
> Estas técnicas solo deben emplearse en redes y sistemas sobre los que tienes autorización explícita (laboratorios OSCP, HTB, entornos de práctica). El uso no autorizado es ilegal y puede interrumpir servicios de red en entornos de producción.

## Relay vs. crackeo: cuándo usar cada uno

Cuando capturas un hash NetNTLMv2 (por ejemplo con Responder, ver [Envenenamiento LLMNR/NBT-NS](/cybersec/manual/redes/llmnr-nbtns-poisoning)) tienes dos opciones:

| Estrategia | Cómo funciona | Cuándo usarla |
|------------|--------------|---------------|
| **Crackeo offline** | Recuperas la contraseña en texto claro con hashcat `-m 5600` | La contraseña es débil y está en wordlists; necesitas reutilizarla en otros servicios |
| **NTLM Relay** | Retransmites el hash a otro servicio autenticándote como la víctima en tiempo real | La contraseña es fuerte; el objetivo tiene SMB signing desactivado o aceptas relay a LDAP |

El relay tiene una ventaja clave: **no necesitas conocer la contraseña**. Mientras el hash sea válido (está en tránsito), puedes usarlo directamente para autenticarte contra otro servicio.

> [!IMPORTANT]
> No puedes relayear un hash a la **misma máquina** de la que salió. La mitigación MS08-068 (y posteriores) bloquea la reflexión de credenciales NTLM: si el hash viene de `VÍCTIMA01`, no puedes retransmitirlo de vuelta a `VÍCTIMA01`. Debes apuntarlo a un tercer objetivo.

## Requisitos y limitaciones

### Relay a SMB

- El objetivo debe tener **SMB signing desactivado**. Si está activo, el relay a SMB falla porque el servidor exige que los mensajes estén firmados con la clave de sesión, que el atacante no posee.
- Puedes comprobar qué hosts tienen SMB signing desactivado con:

```bash
netexec smb <rango> --gen-relay-list relay_targets.txt
```

### Relay a LDAP/LDAPS

- LDAP no requiere signing por defecto (a diferencia de SMB). Esto lo hace un objetivo habitual.
- Con relay a **LDAPS** puedes realizar ataques de delegación o **crear cuentas de equipo** en el dominio (por defecto cualquier usuario puede añadir hasta 10 equipos → `ms-DS-MachineAccountQuota`), lo que abre la puerta a ataques posteriores como Resource-Based Constrained Delegation (RBCD).

> [!CAUTION]
> Relay a LDAP (no LDAPS) puede fallar si el DC requiere channel binding o LDAP signing. Siempre prueba primero con LDAPS (puerto 636).

## Comandos: ataque combinado mitm6 + ntlmrelayx

El ataque requiere dos terminales simultáneas.

**Terminal 1 — mitm6: envenenamiento DHCPv6 y DNS**

```bash
mitm6 -d dominio.local
```

- `-d dominio.local`: limita el ataque al dominio especificado (importante para no contaminar toda la red).
- mitm6 responderá a peticiones DHCPv6 y resolverá nombres como `WPAD` apuntando al atacante.

**Terminal 2 — ntlmrelayx: recibe y retransmite los hashes**

```bash
ntlmrelayx.py -6 -t ldaps://<DC> -wh fakewpad.dominio.local --delegate-access
```

| Flag | Significado |
|------|-------------|
| `-6` | Escucha en IPv6 (necesario para recibir el tráfico redirigido por mitm6) |
| `-t ldaps://<DC>` | Objetivo del relay: el Domain Controller vía LDAPS |
| `-wh fakewpad.dominio.local` | Nombre del host WPAD falso que ntlmrelayx servirá; los clientes lo resolverán a través de mitm6 |
| `--delegate-access` | Al crear una cuenta de equipo via relay LDAP, configura delegación para que esa cuenta pueda impersonar usuarios en el objetivo |

Cuando una víctima se autentica contra el WPAD falso, ntlmrelayx retransmite automáticamente esas credenciales al DC via LDAPS, creando una cuenta de equipo controlada por el atacante.

### Variante: relay a SMB para ejecución de comandos

```bash
ntlmrelayx.py -6 -tf relay_targets.txt -smb2support -c "whoami"
```

- `-tf relay_targets.txt`: lista de IPs con SMB signing desactivado.
- `-smb2support`: habilita SMBv2.
- `-c "whoami"`: ejecuta un comando en el sistema remoto si el relay tiene privilegios de administrador.

## Por qué este ataque lleva frecuentemente a Domain Admin

La cadena completa es:

```text
mitm6 envenena DNS IPv6
        ↓
Víctima se autentica contra WPAD falso
        ↓
ntlmrelayx relay a LDAPS del DC
        ↓
Crea cuenta de equipo controlada por atacante
        ↓
Configura RBCD → impersonación de usuarios privilegiados
        ↓
Obtiene ticket de servicio como Domain Admin (S4U2Proxy)
        ↓
→ Domain Admin
```

El ataque funciona con cualquier usuario autenticado del dominio como víctima (no necesita privilegios). Basta con que algún equipo del dominio haga tráfico de red mientras mitm6 está activo, algo que ocurre de forma constante en redes activas.

> [!NOTE]
> La mitigación más efectiva es **deshabilitar IPv6** en hosts donde no se necesite, o bloquear DHCPv6 en los switches gestionados. Adicionalmente, habilitar SMB signing y LDAP signing/channel binding reduce drásticamente la superficie de relay.

## Práctica

**Ejercicio 1.** ¿Qué característica del comportamiento de red de Windows hace posible el ataque de mitm6?

<details>
<summary>Ver solución</summary>

Windows tiene soporte IPv6 activo por defecto y **prefiere IPv6 sobre IPv4**. Además, emite periódicamente peticiones DHCPv6 (`SOLICIT`) buscando un servidor que le asigne configuración IPv6, incluso en redes donde no hay infraestructura IPv6. Como no existe ningún servidor DHCPv6 legítimo que responda, mitm6 puede hacerse pasar por ese servidor y asignar al atacante como servidor DNS IPv6 de la víctima, tomando control de la resolución de nombres.

</details>

**Ejercicio 2.** ¿En qué se diferencia hacer relay de un hash NetNTLM frente a crackearlo? ¿Qué ventaja tiene el relay?

<details>
<summary>Ver solución</summary>

**Crackear** el hash implica recuperar la contraseña en texto claro mediante ataque de diccionario u fuerza bruta offline (por ejemplo `hashcat -m 5600`). Requiere que la contraseña sea débil o esté en un wordlist, y puede llevar tiempo o ser imposible con contraseñas fuertes.

**El relay** no intenta recuperar la contraseña. En su lugar, retransmite el intercambio de autenticación NetNTLM **en tiempo real** a otro servicio, autenticándose como la víctima sin saber su contraseña. La ventaja es que **funciona independientemente de la fortaleza de la contraseña**: si el hash es válido y el objetivo no tiene SMB signing activo (o acepta relay a LDAP), el ataque tiene éxito incluso con contraseñas de 30 caracteres.

</details>

## Recursos

- [mitm6 — dirkjanm/mitm6 (GitHub)](https://github.com/dirkjanm/mitm6)
- [impacket — fortra/impacket (GitHub)](https://github.com/fortra/impacket)
- [HackTricks — mitm6 & NTLM Relay](https://book.hacktricks.wiki)
- [Lección Envenenamiento LLMNR/NBT-NS](/cybersec/manual/redes/llmnr-nbtns-poisoning)
- [Lección IPv6 para pentest](/cybersec/manual/redes/ipv6-para-pentest)
