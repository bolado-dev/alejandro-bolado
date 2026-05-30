---
title: Escaneo de Puertos (Nmap)
order: 1
description: Descubrir puertos abiertos y servicios con Nmap — escaneo inicial rápido, escaneo dirigido de versiones y scripts.
---

## Escaneo inicial

Primero descubrimos **qué puertos** están abiertos, lo más rápido posible:

```bash wrap=false
nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.10.10.10 -oG nmap/allPorts
```

| Parámetro         | Descripción                                        |
| ----------------- | -------------------------------------------------- |
| `-p-`             | Todos los puertos (1-65535).                       |
| `--open`          | Solo puertos abiertos.                             |
| `-sS`             | Escaneo SYN (rápido y sigiloso).                   |
| `--min-rate 5000` | Mínimo 5000 paquetes/segundo.                      |
| `-n`              | Sin resolución DNS.                                |
| `-Pn`             | Sin ping previo.                                   |

## Escaneo de versiones

Sobre los puertos abiertos, lanzamos detección de servicios y scripts por defecto:

```bash wrap=false
nmap -p 22,80,445 -sCV 10.10.10.10 -oN nmap/targeted
```

- `-sC` — scripts por defecto (NSE).
- `-sV` — versión del servicio.
- `-oN` — salida en formato normal.

## Extraer puertos rápidamente

```bash wrap=false
extractPorts() {
  ports=$(grep -oP '\d{1,5}/open' allPorts | awk -F'/' '{print $1}' | xargs | tr ' ' ',')
  echo "[*] Puertos: $ports"
}
```

## UDP

Los servicios UDP suelen pasarse por alto (SNMP, TFTP, DNS):

```bash wrap=false
nmap -sU --top-ports 100 --open -n -Pn 10.10.10.10 -oN nmap/udp
```
