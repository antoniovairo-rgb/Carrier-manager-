/* [7.166.0] SHOT ready-stance GK CH38 (GLB ON): forza una situation d'attacco, attende l'aggancio GLB,
   crop della porta avversaria → posa di guardia (busto avanti, braccia larghe) e facing verso la palla. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
import { execSync } from 'node:child_process';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
await page.addInitScript(() => { window.__CPM_GLB = true; });
await installCdnRoutes(page);
await openMatch(page, port);
await sleep(1500);
await forceSituation(page, 8, { settle: 900, choose: true }); // "Tiro dal limite" → GK sulla linea
await sleep(4500); // aggancio GLB + stance stabilizzata
await page.screenshot({ path: 'out/gk-glb-full.png' });
await browser.close(); srv.close();
try { execSync(`python3 - <<'PY'
from PIL import Image
im=Image.open('out/gk-glb-full.png'); W,H=im.size
im.crop((int(W*0.28),int(H*0.12),int(W*0.72),int(H*0.34))).resize((640,460)).save('out/gk-glb-crop.png')
print('crop ok')
PY`, { stdio: 'inherit' }); } catch (e) { console.error(e.message); }
console.log('→ out/gk-glb-crop.png');
