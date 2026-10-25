# Security cleanup

The three obfuscated JavaScript payloads previously quarantined here have been deleted from the working tree. Two masqueraded as WOFF2 fonts; one was appended to the Tailwind configuration. They were not executed during this cleanup.

Earlier project notes reported a failed DNS request to `eth-mainnet.public.blastapi.io` during a build. That does not establish whether earlier executions compromised the host. Deleting files does not remove them from Git history or undo effects of previous execution.

## Controls

- VS Code automatic tasks are disabled; the embedded folder-open shell task was removed.
- The extension has an explicit content security policy. All-page injection remains necessary for the pet overlay; page context is disabled by default.
- Electron uses isolated, sandboxed renderers, main-frame-only IPC, denied navigation/popups/webviews/downloads/permissions, and a renderer policy that blocks network access. The main process handles explicitly selected room connections.
- Builds run a static security check for the known payloads, fake font files, unexpected dependency sources, and root installation hooks. This is a regression guard, not an antivirus or a proof of safety.
- Build dependencies were patched. The selector parser override keeps the existing Tailwind 3 styling while replacing its vulnerable parser dependency. Recheck compatibility when updating Tailwind.

## Maintenance

Run `npm run security:check`, `npm audit`, and `npm audit --prefix server` regularly. Install reproducibly with `npm ci --ignore-scripts`. Electron may need its official runtime download on first desktop launch.

Dependency advisories cover known vulnerabilities, not every malicious package. This repository cleanup is not a machine security audit. If you ran the original infected configuration, run a full host malware scan; rotate credentials from a clean device if compromise is detected.
