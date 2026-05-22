// WannaHack - Chain Database
// AUTO-GENERATED — do not edit manually.
// To add or modify chains, edit the YAML files in the chains/ directory.
// Then run: node build-chains.js

const CHAIN_DATA = {
  "chains": [
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
    }
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CHAIN_DATA };
} else {
  window.CHAIN_DATA = CHAIN_DATA;
}
