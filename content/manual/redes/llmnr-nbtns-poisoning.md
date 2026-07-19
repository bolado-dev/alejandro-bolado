---
title: "Envenenamiento LLMNR / NBT-NS con Responder"
order: 22
description: "Aprende cómo Responder captura hashes NetNTLMv2 abusando de los protocolos de resolución por broadcast en redes Windows."
---

## El problema: resolución de nombres por difusión

En entornos Windows, cuando un host no puede resolver un nombre a través de DNS, el sistema operativo recurre automáticamente a protocolos alternativos de resolución **por difusión (broadcast/multicast)**:

| Protocolo | Puerto | Alcance |
|-----------|--------|---------|
| **LLMNR** (Link-Local Multicast Name Resolution) | UDP 5355 | Multicast local |
| **NBT-NS** (NetBIOS Name Service) | UDP 137 | Broadcast de subred |
| **mDNS** (Multicast DNS) | UDP 5353 | Multicast local |

El flujo normal es: el host primero consulta DNS. Si no obtiene respuesta, lanza una pregunta a toda la red: *"¿Alguien sabe quién es `\\SERVIDOR01`?"*. Esta pregunta la escucha **cualquier máquina** en el mismo segmento de red. Ahí está el problema: no existe ningún mecanismo de autenticación ni verificación de la respuesta.

> [!NOTE]
> LLMNR fue diseñado como sucesor de NBT-NS. Ambos coexisten en Windows moderno. En redes con una configuración de DNS correcta ambos deberían estar desactivados, pero en la práctica casi nunca lo están.

## El ataque: cómo funciona Responder

**Responder** es una herramienta que escucha esos protocolos de broadcast y responde a *cualquier* petición de resolución de nombres haciéndose pasar por el host solicitado. La víctima cree que ha encontrado al servidor y, siguiendo el flujo estándar de autenticación Windows, intenta conectarse enviando sus credenciales en forma de **hash NetNTLMv2**.

```text
  [Víctima]                        [Red]                   [Atacante / Responder]
      |                              |                              |
      |--- DNS Query ──────────────>|── DNS Server ──────────────>|
      |<── DNS: NXDOMAIN (falla) ───|<─────────────────────────── |
      |                              |                              |
      |=== LLMNR/NBT-NS Broadcast ==>=========================>   |
      |   "¿Quién es \\SERVIDOR01?"  |                             |
      |                              |          Responder escucha  |
      |<══════════════════════════════════════════════════════════ |
      |   "¡Yo soy \\SERVIDOR01!"    |                             |
      |                              |                              |
      |─── Auth: NetNTLMv2 hash ──────────────────────────────── >|
      |   (intento de autenticación) |                 hash capturado
```

La víctima manda un **hash NetNTLMv2** porque el protocolo de autenticación NTLM funciona mediante un mecanismo de reto/respuesta:

1. El cliente (víctima) anuncia que quiere autenticarse.
2. El servidor (Responder, haciéndose pasar por el destino) envía un reto (challenge) aleatorio.
3. El cliente responde cifrando el reto con su hash de contraseña → eso es el **NetNTLMv2**.

Responder captura ese intercambio completo. No necesita conocer la contraseña de antemano.

> [!WARNING]
> Estas técnicas solo deben emplearse en redes y sistemas sobre los que tienes autorización explícita (laboratorios OSCP, HTB, entornos de práctica). El uso no autorizado es ilegal.

## Ejecutar Responder

```bash
# Modo activo: envenena y captura (uso en laboratorio)
sudo responder -I eth0

# Modo análisis: solo escucha, NO responde (reconocimiento pasivo)
sudo responder -I eth0 -A
```

El modo `-A` (Analyze) es útil para observar el tráfico de resolución sin alterar la red, lo que puede ser valioso en una evaluación donde no quieres generar ruido antes de tiempo.

Los hashes capturados se guardan automáticamente en:

```text
/usr/share/responder/logs/
```

Un hash NetNTLMv2 capturado tiene este aspecto:

```text
Administrator::DOMINIO:1122334455667788:AABBCCDDEEFF...:0101000000...
```

## Qué hacer con el hash NetNTLMv2

Tienes dos caminos:

### (a) Crackeo offline con hashcat

El hash NetNTLMv2 corresponde al **modo 5600** de hashcat:

```bash
hashcat -m 5600 hash.txt /usr/share/wordlists/rockyou.txt
```

Si tienes reglas:

```bash
hashcat -m 5600 hash.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule
```

> [!TIP]
> El modo 5600 es NetNTLMv2. No lo confundas con el modo 5500 (NetNTLMv1) ni con el 1000 (NTLM puro, que sí permite pass-the-hash). NetNTLMv2 **no** puede usarse directamente para pass-the-hash.

### (b) Relay (si no crackea)

Si la contraseña es fuerte y no aparece en wordlists, puedes **retransmitir (relay)** el hash a otro servicio en lugar de crackearlo. En vez de intentar recuperar la contraseña, usas el hash directamente para autenticarte contra un objetivo. Consulta la lección [mitm6 y NTLM Relay](/cybersec/manual/redes/mitm6-ntlm-relay) para el flujo completo.

## Por qué este ataque es tan frecuente en entornos AD

- **LLMNR y NBT-NS están activos por defecto** en Windows. Requieren configuración explícita (GPO) para desactivarlos.
- En redes corporativas siempre hay **tráfico de resolución fallida**: scripts con rutas mal escritas, impresoras, recursos compartidos temporales, etc.
- No requiere ninguna vulnerabilidad específica ni credenciales previas: solo estar en el mismo segmento de red.
- Es prácticamente el **primer paso** en casi cualquier evaluación de AD.

> [!IMPORTANT]
> La defensa más efectiva es desactivar LLMNR via GPO (`Computer Configuration → Administrative Templates → Network → DNS Client → Turn off multicast name resolution`) y NBT-NS en las propiedades del adaptador de red o via DHCP option 001.

Para entender mejor cómo interactúa este ataque con la resolución de nombres, repasa la lección [DNS](/cybersec/manual/redes/dns).

## Práctica

**Ejercicio 1.** Explica con tus palabras: ¿por qué la víctima acaba enviándote un hash NetNTLMv2 en lugar de simplemente ignorar la respuesta del atacante?

<details>
<summary>Ver solución</summary>

Porque Windows confía en la respuesta de Responder: al recibir la respuesta LLMNR/NBT-NS que dice "yo soy `\\SERVIDOR01`", el sistema operativo inicia automáticamente el flujo de autenticación NTLM para conectarse al recurso. Ese flujo implica enviar un reto/respuesta cifrado con las credenciales del usuario (NetNTLMv2). No hay verificación de que el servidor que responde sea legítimo, por lo que la víctima manda el hash sin saberlo.

</details>

**Ejercicio 2.** ¿Qué modo de hashcat usas para crackear un hash NetNTLMv2? ¿Y qué alternativa tienes si la contraseña no aparece en tu wordlist?

<details>
<summary>Ver solución</summary>

El modo es **5600** (`hashcat -m 5600 hash.txt rockyou.txt`). Si la contraseña no crackea, la alternativa es el **NTLM relay**: en lugar de descifrar el hash, lo retransmites a otro servicio (SMB, LDAP…) para autenticarte directamente como la víctima. Esto lo puedes hacer combinando mitm6 con `ntlmrelayx.py` de impacket. Ver la lección [mitm6 y NTLM Relay](/cybersec/manual/redes/mitm6-ntlm-relay).

</details>

## Recursos

- [Responder — lgandx/Responder (GitHub)](https://github.com/lgandx/Responder)
- [HackTricks — LLMNR/NBT-NS Poisoning](https://book.hacktricks.wiki)
- [Lección DNS de este manual](/cybersec/manual/redes/dns)
- [Lección mitm6 y NTLM Relay](/cybersec/manual/redes/mitm6-ntlm-relay)
