/* [7.153.0] PROBE ready stance portiere (procedurale/GLB-OFF): forza una situation, congela in hl_choose
   (il GK è fermo in porta), screenshot + crop della porta avversaria per vedere la posa di guardia. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
import { execSync } from 'node:child_process';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
await page.addInitScript(() => { window.__CPM_GLB = false; });
await installCdnRoutes(page);
await openMatch(page, port);
await sleep(300);
await forceSituation(page, 8, { settle: 900, choose: true }); // "Tiro dal limite" → GK resta sulla linea, non esce
await sleep(1400); // ready stance stabilizzata (blend rb→0)
await page.screenshot({ path: 'out/gk-stance-full.png' });
await browser.close(); srv.close();
// crop porta avversaria (fascia alta-centrale) + zoom
try {
  execSync(`python3 - <<'PY'
from PIL import Image
im=Image.open('out/gk-stance-full.png')
W,H=im.size
im.crop((int(W*0.30),int(H*0.14),int(W*0.70),int(H*0.30))).resize((520,420)).save('out/gk-stance-crop.png')
print('crop',W,H)
PY`, { stdio: 'inherit' });
} catch (e) { console.error('crop fail', e.message); }
console.log('→ out/gk-stance-full.png · out/gk-stance-crop.png');
