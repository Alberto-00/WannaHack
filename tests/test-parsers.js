#!/usr/bin/env node
// Smoke test for js/output-parsers.js — verifies each built-in parser against
// realistic tool output. Run: `node tests/test-parsers.js`.

const fs = require('fs');
const path = require('path');

// Hydrate the IIFE-style parser bundle.
global.window = global;
require(path.join(__dirname, '..', 'js', 'output-parsers.js'));
const parsers = global.WannaOutputParsers;

let pass = 0;
let fail = 0;
function check(label, cond, extra) {
  if (cond) { pass += 1; console.log('  \x1b[32m✓\x1b[0m', label); }
  else      { fail += 1; console.log('  \x1b[31m✗\x1b[0m', label, extra ? '\n     ' + JSON.stringify(extra) : ''); }
}

console.log('\n── nmap parser ──');

// 1) Classic -sV
{
  const t = `Starting Nmap 7.94 ( https://nmap.org ) at 2024-05-22 14:30
Nmap scan report for dc01.corp.local (10.10.10.5)
Host is up (0.012s latency).
Not shown: 65530 closed ports
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2024-05-22 13:30:00Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP
445/tcp  open  microsoft-ds  Windows Server 2019
3389/tcp open  ms-wbt-server Microsoft Terminal Services`;
  const r = parsers.autoExtract(t);
  check('classic -sV: hits include nmap', r.hits.some((h) => h.parser === 'nmap'));
  check('target_ip = 10.10.10.5', r.vars.target_ip === '10.10.10.5', r.vars.target_ip);
  check('target_hostname present', r.vars.target_hostname === 'dc01.corp.local', r.vars.target_hostname);
  check('all 7 tcp ports captured', Array.isArray(r.vars.open_ports) && r.vars.open_ports.length === 7, r.vars.open_ports);
  check('port 88 mapped to kerberos-sec', r.vars.services && r.vars.services['88'] === 'kerberos-sec', r.vars.services);
}

// 2) Just IP, no rDNS
{
  const t = `Nmap scan report for 192.168.1.100
Host is up.
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http`;
  const r = parsers.autoExtract(t);
  check('IP-only: target_ip captured', r.vars.target_ip === '192.168.1.100', r.vars.target_ip);
  check('IP-only: 2 ports', Array.isArray(r.vars.open_ports) && r.vars.open_ports.length === 2, r.vars.open_ports);
  check('IP-only: no hostname (rDNS missing)', !r.vars.target_hostname);
}

// 3) UDP with open|filtered
{
  const t = `Nmap scan report for sneaky (10.10.10.50)
PORT      STATE         SERVICE
53/udp    open          domain
161/udp   open|filtered snmp
500/udp   open          isakmp
1194/udp  open|filtered openvpn`;
  const r = parsers.autoExtract(t);
  check('UDP: target_hostname=sneaky', r.vars.target_hostname === 'sneaky', r.vars.target_hostname);
  check('UDP: 4 ports inc. open|filtered', Array.isArray(r.vars.open_ports) && r.vars.open_ports.length === 4, r.vars.open_ports);
  check('UDP: 161 mapped to snmp', r.vars.services && r.vars.services['161'] === 'snmp', r.vars.services);
}

console.log('\n── impacket GetNPUsers (AS-REP roast) ──');
{
  const t = `[*] Getting TGT for alice
$krb5asrep$23$alice@CORP.LOCAL:abcdef1234567890$0123456789abcdef0123456789abcdef
$krb5asrep$23$bob@CORP.LOCAL:fedcba0987654321$fedcba0987654321fedcba0987654321`;
  const r = parsers.autoExtract(t);
  check('asrep: 2 hashes', Array.isArray(r.vars.asrep_hashes) && r.vars.asrep_hashes.length === 2, r.vars.asrep_hashes);
  check('asrep: 2 users extracted', Array.isArray(r.vars.roastable_users) && r.vars.roastable_users.length === 2 && r.vars.roastable_users.includes('alice'), r.vars.roastable_users);
}

console.log('\n── impacket GetUserSPNs (kerberoast) ──');
{
  const t = `[*] Getting TGS for sqlsvc
$krb5tgs$23$*sqlsvc$CORP.LOCAL$MSSQLSvc/sql.corp.local:1433*$abcd1234$ffff...
$krb5tgs$23$*webapi$CORP.LOCAL$HTTP/web.corp.local*$bbbb2222$dddd...`;
  const r = parsers.autoExtract(t);
  check('tgs: 2 hashes', Array.isArray(r.vars.tgs_hashes) && r.vars.tgs_hashes.length === 2, r.vars.tgs_hashes);
  check('tgs: kerberoastable users captured', Array.isArray(r.vars.kerberoastable_users) && r.vars.kerberoastable_users.includes('sqlsvc'), r.vars.kerberoastable_users);
}

console.log('\n── secretsdump ──');
{
  const t = `Administrator:500:aad3b435b51404eeaad3b435b51404ee:e19ccf75ee54e06b06a5907af13cef42:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:abc123def456abc123def456abc123de:::
SUPPORT_388945a0:1001:aad3b435b51404eeaad3b435b51404ee:11112222333344445555666677778888:::`;
  const r = parsers.autoExtract(t);
  check('dump: 4 NTLM entries', Array.isArray(r.vars.ntlm_hashes) && r.vars.ntlm_hashes.length === 4, r.vars.ntlm_hashes && r.vars.ntlm_hashes.length);
  check('dump: krbtgt found', r.vars.ntlm_hashes && r.vars.ntlm_hashes.some((h) => h.user === 'krbtgt'));
  check('dump: users_dumped populated', Array.isArray(r.vars.users_dumped) && r.vars.users_dumped.includes('Administrator'));
}

console.log('\n── hashcat-cracked ──');
{
  // Note: this parser is intentionally conservative; AS-REP-uncracked lines
  // should NOT be misclassified as cracked.
  const t = `aad3b435b51404eeaad3b435b51404ee:e19ccf75ee54e06b06a5907af13cef42:Summer2024!
$krb5asrep$23$alice@CORP.LOCAL:abc:not-cracked-yet`;
  const r = parsers.autoExtract(t);
  check('hashcat: cracked entry present', r.vars.cracked_creds && r.vars.cracked_creds.length >= 1, r.vars.cracked_creds);
  // The asrep line gets matched as a candidate but my parser rejects $krb5-prefixed passwords
  // — verify no spurious "not-cracked-yet" entry in cracked_creds.
  if (r.vars.cracked_creds) {
    const bad = r.vars.cracked_creds.some((c) => c.password && c.password.startsWith('$krb5'));
    check('hashcat: no AS-REP false-positive', !bad);
  }
}

console.log('\n── BloodHound JSON ──');
{
  const t = `{"data": [{"ObjectIdentifier": "S-1-5-21-...", "Properties": {"name": "ALICE@CORP.LOCAL"}}], "meta": {"type": "users", "count": 1, "version": 5}}`;
  const r = parsers.autoExtract(t);
  check('bh: type=users', r.vars.bh_type === 'users');
  check('bh: count=1', r.vars.bh_count === 1);
}

console.log('\n── evil-winrm prompt ──');
{
  const t = `Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\\Users\\Administrator\\Documents> whoami
corp\\administrator`;
  const r = parsers.autoExtract(t);
  check('evil-winrm: shell_active', r.vars.shell_active === true);
  check('evil-winrm: shell_pwd captured', r.vars.shell_pwd && r.vars.shell_pwd.includes('Administrator'), r.vars.shell_pwd);
}

console.log('\n──────── summary ────────');
console.log(`  ${pass} passed   ${fail} failed`);
if (fail > 0) process.exit(1);
