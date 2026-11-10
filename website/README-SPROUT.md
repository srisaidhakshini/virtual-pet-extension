# Sprout website

Marketing and tester-download website, separate from the extension application.

The homepage has an interactive care preview, existing Sprout artwork, installation instructions, FAQs, and a privacy page. The download is `/downloads/Sprout-Chrome-1.0.0.zip`, generated from the parent project's build with `python scripts/package-share.py`.

To refresh it: build the extension in the parent directory, run its packaging script, and copy the new Chrome ZIP into `public/downloads`. Update the homepage version and size when they change. Never include user profiles, node_modules, or the room-service source in the public download.

When the Chrome Web Store listing is approved, replace the main download links with the verified listing URL and update installation instructions. Keep AI chat and a desktop installer described as planned until they ship.

Production is [sprout.dhakshini.studio](https://sprout.dhakshini.studio), hosted on Vercel in `dhakshini/sprout`. The legacy Sites identity in `.openai/hosting.json` is retained for reference; do not use the Sites publishing workflow for production updates.

## Vercel hosting

`npm run build:vercel` generates the static Next.js export in `out/`. `vercel.json` selects this build for Vercel. Deploy from this website directory, not the parent extension project. The custom domain is `sprout.dhakshini.studio`; obtain its exact DNS target from the linked Vercel project. Legacy Sites identity remains in `.openai/hosting.json` for reference.


Build and deploy from this directory:

```powershell
npm run build:vercel
npx vercel deploy --prod --scope dhakshini
```

Vercel serves the export as a static site (`framework: null`, output `out/`) with clean URLs. Its TypeScript configuration is `tsconfig.vercel.json`, which excludes the legacy Sites build configuration. The custom domain uses a Name.com CNAME record: host `sprout`, answer `843c3acda7a8cbb3.vercel-dns-017.com`.

The Play preview preloads eight original PNG frames and advances every 90 ms. Reduced-motion preferences stop the animation. The downloadable ZIP includes an inner `Sprout-Chrome` folder; users must select the folder containing `manifest.json` when loading it in Chrome. The current ZIP removes the invalid IPv6 localhost CSP source.

Website hosting does not run the friend-room WebSocket service. Text chat, AI memory, a Chrome Web Store listing, and a desktop installer are not shipped.
