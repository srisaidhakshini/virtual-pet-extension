import { build } from 'vite';
import { resolve } from 'node:path';

await build();
// Manifest content scripts are classic scripts, so bundle React and all imports.
await build({
  configFile: false,
  build: {
    outDir: 'dist', emptyOutDir: false,
    lib: { entry: resolve('src/content/index.tsx'), name: 'SproutOverlay', formats: ['iife'], fileName: () => 'content.js' },
    rollupOptions: { output: { assetFileNames: 'assets/overlay.[ext]' } },
  },
});

const { build: bundle } = await import('esbuild');
await bundle({ entryPoints: ['src/connection/roomClient.ts'], outfile: 'dist/room-client.cjs', bundle: true, platform: 'node', format: 'cjs' });
