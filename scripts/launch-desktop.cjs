const { spawnSync } = require('node:child_process');
const path = require('node:path');

let executable;
try { executable = require('electron'); } catch {
  console.log('Downloading the official Electron runtime for Sprout…');
  const install = spawnSync(process.execPath, [require.resolve('electron/install.js')], { stdio: 'inherit', timeout: 90000, windowsHide: true });
  if (install.error || install.status !== 0) {
    console.error('Sprout could not download Electron. Check that github.com and its release downloads are reachable, then run npm run desktop again.');
    process.exit(1);
  }
  executable = require('electron');
}
const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;
const review = process.argv.includes('--review-ui');
const connectionReview = process.argv.includes('--review-connection');
const result = spawnSync(executable, [path.resolve(connectionReview ? 'desktop/review-connection.cjs' : review ? 'desktop/review-ui.cjs' : 'desktop/main.cjs'), ...process.argv.slice(2).filter(arg => arg !== '--review-ui' && arg !== '--review-connection')], { stdio: 'inherit', env: environment });
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
