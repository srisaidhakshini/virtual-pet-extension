# Quarantined original project code

During the first production build, an obfuscated executable block appended after the exported object in `tailwind.config.js` attempted to resolve `eth-mainnet.public.blastapi.io`. The request failed with `ENOTFOUND` in the restricted environment. The block was removed from the Tailwind configuration and preserved verbatim in `quarantined-tailwind-payload.txt`.

Two original files named `fa-solid-400.woff2` and `fa-solid-900.woff2` contained obfuscated JavaScript rather than WOFF2 font bytes. They were moved from `src/components/Accessories/public/fonts/` into `quarantined-fa-solid-400.txt` and `quarantined-fa-solid-900.txt` without executing them. The application uses Lucide icons and does not depend on these files.

Do not execute these text files. They are kept only as evidence. This folder is not copied into `dist`. The build passed after the configuration block was removed. This observation does not establish the full purpose of the payloads or whether they ran before this session; a complete machine or repository security audit was outside this implementation task.
