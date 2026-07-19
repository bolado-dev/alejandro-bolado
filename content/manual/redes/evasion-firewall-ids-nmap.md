---
title: "Evasión de Firewalls e IDS con Nmap"
order: 16
description: "Técnicas de Nmap para eludir firewalls e IDS simples: fragmentación, decoys, spoofing, puerto de origen, timing e idle scan."
---

## Por qué necesitas evadir firewalls e IDS

En un pentest real, el objetivo casi nunca responde con todos los puertos abiertos y sin interferencias. Entre tu máquina y el host hay firewalls de perímetro, WAFs, e IDS/IPS que inspeccionan el tráfico. La diferencia entre un escaneo que devuelve `filtered` en todos los puertos y uno que revela servicios reales puede ser sencillamente la técnica que uses.

> [!IMPORTANT]
> Estas técnicas están diseñadas para entornos de laboratorio autorizado y exámenes como el OSCP. Usarlas sin permiso explícito contra sistemas ajenos es ilegal.

Antes de profundizar, asegúrate de entender cómo funciona un escaneo SYN estándar: consulta [Escaneo de Puertos — Teoría](/cybersec/manual/redes/escaneo-de-puertos-teoria).

---

## Fragmentación de paquetes

### Cómo funciona

Un IDS/firewall simple inspecciona paquetes completos buscando firmas (patrones de bytes). Si fragmentas el paquete TCP/IP en trozos pequeños, la firma queda dividida entre fragmentos y el motor de inspección —si no reensambla antes de analizar— no la reconoce.

```bash
# Fragmentos de exactamente 8 bytes (mínimo IPv4)
nmap -f <objetivo>

# Fragmentos de tamaño personalizado (debe ser múltiplo de 8)
nmap --mtu 16 <objetivo>
nmap --mtu 24 <objetivo>
```

El flag `-f` parte el encabezado TCP en fragmentos de 8 bytes. `--mtu` te da control fino. Cuanto menor el MTU, más fragmentos y más difícil el reensamblado para un IDS sin estado.

> [!NOTE]
> Para entender la relación entre MTU, fragmentación IP y cómo los routers manejan estos fragmentos, consulta la lección [MTU y Fragmentación](/cybersec/manual/redes/mtu-y-fragmentacion).

### Límites

Un firewall stateful moderno o un IDS que reensambla flujos antes de inspeccionarlos (como Snort con el preprocesador de defragmentación activado) ve el paquete completo y detecta el escaneo igualmente.

---

## Decoys (señuelos)

### Cómo funciona

Con `-D` Nmap lanza el escaneo mezclando tu IP real con IPs falsas (decoys). El objetivo recibe paquetes de todas esas IPs simultáneamente. En los logs del firewall o IDS aparecen múltiples orígenes y es difícil distinguir cuál es el atacante real.

```bash
# 10 IPs aleatorias + la tuya (ME puede omitirse; Nmap la incluye)
nmap -D RND:10 <objetivo>

# Decoys específicos con tu IP en posición concreta
nmap -D 192.168.1.5,192.168.1.6,ME,192.168.1.9 <objetivo>
```

```text
Logs del firewall sin decoys:
  SYN  10.10.14.5 → 10.10.10.50:80

Logs con -D RND:10:
  SYN  203.45.12.1 → 10.10.10.50:80
  SYN  91.20.33.8  → 10.10.10.50:80
  SYN  10.10.14.5  → 10.10.10.50:80   ← tu IP real (entre el ruido)
  SYN  172.16.5.2  → 10.10.10.50:80
  ...
```

### Por qué NO te hace anónimo

Los paquetes con IPs señuelo salen igualmente desde tu interfaz con tu MAC. En una red local, un switch o un sniffer en el mismo segmento puede correlacionar la MAC con tu IP. Además, los paquetes decoy generan tráfico que puede hacer sonar alarmas por volumen. Las IPs aleatorias pueden pertenecer a hosts reales y generar respuestas inesperadas.

---

## Spoofing de dirección de origen

### Cuándo (y por qué solo a veces) funciona

```bash
nmap -S <IP-falsa> -e eth0 -Pn <objetivo>
```

El flag `-S` reemplaza tu IP de origen por la indicada. `-e` especifica la interfaz de red (obligatorio para que Nmap sepa por dónde enviar). `-Pn` desactiva el ping previo, ya que las respuestas no llegarán a ti.

> [!WARNING]
> Las respuestas del objetivo van a la IP falsa, no a ti. Solo es útil si puedes inferir el resultado por otros medios (p. ej., en un idle scan, ver más abajo) o si el objetivo está en el mismo segmento y puedes capturar el tráfico.

---

## Puerto de origen falso

### Por qué funciona contra algunos firewalls

Ciertos firewalls tienen reglas que permiten tráfico de entrada si el **puerto de origen** es uno de confianza (53/DNS, 80/HTTP). El razonamiento original era "si viene del puerto 53 es una respuesta DNS legítima". Es una configuración errónea, pero existe.

```bash
# Equivalentes: ambas flags hacen lo mismo
nmap --source-port 53 <objetivo>
nmap -g 53 <objetivo>
```

> [!TIP]
> En el OSCP, si un puerto aparece como `filtered` con un escaneo normal pero como `open` con `--source-port 53`, esa es la pista para explotar el servicio usando `nc` con el flag `-p 53` o herramientas que permitan elegir puerto de origen.

---

## Control de temporización (Timing)

### Por qué el IDS se basa en umbrales de velocidad

Un IDS detecta escaneos en parte porque llegan muchos paquetes en poco tiempo. Ralentizar el escaneo puede evitar superar esos umbrales.

```bash
# -T0 Paranoid: 5 minutos entre sondas; evita casi todos los IDS por umbrales
nmap -T0 <objetivo>

# -T1 Sneaky: 15 segundos entre sondas
nmap -T1 <objetivo>

# Control granular del retardo entre sondas
nmap --scan-delay 5s <objetivo>
nmap --max-rate 1 <objetivo>     # máximo 1 paquete por segundo
```

| Nivel | Nombre    | Retardo típico | Uso recomendado          |
|-------|-----------|----------------|--------------------------|
| -T0   | Paranoid  | 5 min/sonda    | IDS con umbral muy bajo  |
| -T1   | Sneaky    | 15 s/sonda     | Redes con monitorización |
| -T2   | Polite    | 0,4 s/sonda    | No sobrecargar red       |
| -T3   | Normal    | (por defecto)  | Uso general              |
| -T4   | Aggressive| reducido       | Redes rápidas/labs       |
| -T5   | Insane    | mínimo         | Labs, puede perder datos |

> [!CAUTION]
> `-T0` y `-T1` hacen el escaneo extremadamente lento. Un escaneo completo de 65535 puertos con `-T0` puede durar días. Úsalos solo en rangos de puertos reducidos en el OSCP.

---

## Relleno de datos (`--data-length`)

Algunos IDS reconocen los paquetes de Nmap por su tamaño característico (p. ej., un SYN con exactamente N bytes de encabezado). Añadir bytes aleatorios altera esa firma.

```bash
nmap --data-length 25 <objetivo>
```

Esto añade 25 bytes aleatorios al payload del paquete, haciendo que el paquete tenga un tamaño atípico y diferente entre sondas.

---

## Idle/Zombie Scan (`-sI`)

### La técnica más sigilosa

El idle scan es conceptualmente brillante: Nmap nunca envía paquetes con tu IP real al objetivo. En su lugar, usa un tercer host (el "zombie") cuyo campo **IPID** (IP Identification) se incrementa de forma predecible.

```text
Paso 1: Nmap sondea el zombie → obtiene su IPID actual (ej: 1234)
Paso 2: Nmap envía un SYN al objetivo suplantando la IP del zombie
Paso 3a: Puerto abierto → objetivo envía SYN/ACK al zombie
          → zombie responde con RST → su IPID sube a 1235
Paso 3b: Puerto cerrado → objetivo envía RST al zombie → zombie lo ignora
          → IPID del zombie no cambia
Paso 4: Nmap vuelve a sondear el zombie → compara IPID
          Si subió 2: puerto ABIERTO
          Si subió 1: puerto CERRADO o FILTRADO
```

```bash
nmap -sI <zombie> <objetivo>
nmap -sI 192.168.1.100 10.10.10.50 -p 80,443,22
```

> [!NOTE]
> El zombie debe tener tráfico de red mínimo (IPID predecible y sin mucho tráfico propio que incremente el contador). Hosts Windows inactivos o impresoras de red suelen ser buenos candidatos.

### Límites del idle scan

- Encontrar un zombie con IPID predecible es cada vez más difícil (Linux moderno usa IPID aleatorio).
- El zombie debe tener conectividad con el objetivo.
- Es lento y requiere múltiples sondas por puerto.

---

## Resumen de técnicas

```text
Técnica             Flag(s)                    Evade
─────────────────── ────────────────────────── ──────────────────────────────
Fragmentación       -f / --mtu <n>             IDS sin reensamblado
Decoys              -D RND:10 / -D ip1,ME,ip2  Logs/correlación de IP
Spoof de origen     -S <IP> -e <iface> -Pn     Atribución (con limitaciones)
Puerto de origen    --source-port 53 / -g 53   Reglas basadas en puerto origen
Timing lento        -T0/-T1 / --scan-delay     Umbrales de velocidad del IDS
Relleno de datos    --data-length <n>           Firmas de tamaño de paquete
Idle scan           -sI <zombie>               Todo (no envías con tu IP real)
```

> [!WARNING]
> Un firewall stateful moderno (iptables con conntrack, pf, Cisco ASA) o un IDS bien configurado con reensamblado de flujos detecta o bloquea la mayoría de estas técnicas. Son más eficaces contra reglas simples basadas en IP/puerto o IDS sin estado. Combinar varias técnicas a la vez aumenta las posibilidades de éxito.

---

## Práctica

**Ejercicio 1.** ¿Qué flag usarías para que tu escaneo parezca venir del puerto 53 y por qué a veces funciona contra firewalls mal configurados?

<details>
<summary>Ver solución</summary>

Usarías `--source-port 53` (o su equivalente `-g 53`):

```bash
nmap --source-port 53 -sS -p 80,443,8080 <objetivo>
```

Funciona porque algunos firewalls tienen reglas del tipo "permitir tráfico entrante cuyo puerto de origen sea 53", asumiendo que es una **respuesta DNS legítima**. Esta es una configuración defectuosa: un firewall correcto inspecciona el estado de la conexión (stateful), no solo el puerto de origen. Sin embargo, en dispositivos más antiguos o configuraciones simplificadas, esta regla existe y puede ser abusada para que el firewall deje pasar tus sondas.

</details>

**Ejercicio 2.** Explica qué hace `-D RND:10` y por qué **no** te vuelve completamente anónimo.

<details>
<summary>Ver solución</summary>

`-D RND:10` hace que Nmap genere **10 IPs de origen aleatorias** y las mezcle con tus propios paquetes reales. El objetivo recibe paquetes SYN aparentemente procedentes de 11 fuentes distintas (las 10 falsas más la tuya), dificultando identificar cuál es el atacante real en los logs.

**Por qué no es anonimato real:**

1. **MAC address**: En una red local, todos los paquetes (incluso los que llevan IP falsa) salen con tu dirección MAC real. Un administrador con acceso al switch puede correlacionar la MAC con tu IP.
2. **Volumen de tráfico**: El tráfico adicional de los decoys puede disparar alertas por volumen anómalo.
3. **IPs aleatorias activas**: Las IPs generadas por `RND` pueden coincidir con hosts reales que respondan de forma inesperada, dejando trazas.
4. **Análisis de flujo**: Un IDS avanzado puede correlacionar que todos los paquetes (con distintas IPs de origen) llegaron exactamente al mismo tiempo, lo que es imposible en un escenario real distribuido.

</details>

**Ejercicio 3.** Tienes un host zombie con IPID predecible en `192.168.1.15`. ¿Cómo harías un idle scan contra `10.10.10.50` para verificar si el puerto 445 está abierto?

<details>
<summary>Ver solución</summary>

```bash
nmap -sI 192.168.1.15 10.10.10.50 -p 445 -Pn -v
```

Nmap enviará paquetes SYN al objetivo suplantando la IP del zombie (`192.168.1.15`). Antes y después de cada sonda, comprobará si el IPID del zombie incrementó en 1 (puerto cerrado/filtrado) o en 2 (puerto abierto, porque el objetivo respondió con SYN/ACK y el zombie emitió un RST). Tu IP real **nunca aparece** en los paquetes hacia el objetivo.

</details>

---

## Recursos

- [Nmap — Evasión de Firewalls e IDS (documentación oficial)](https://nmap.org/book/man-bypass-firewalls-ids.html)
- [Nmap Book (referencia completa)](https://nmap.org/book/)
- [Lección: Escaneo de Puertos — Teoría](/cybersec/manual/redes/escaneo-de-puertos-teoria)
- [Lección: MTU y Fragmentación](/cybersec/manual/redes/mtu-y-fragmentacion)
- [HackTricks — Nmap](https://book.hacktricks.wiki/network-services-pentesting/pentesting-nmap)
