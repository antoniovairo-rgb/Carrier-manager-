import { apri, testo, sleep, bottoni, shot, caricaCarriera, snap, clic } from './c177-car1-lib.mjs';
import fs from 'node:fs';
const save = JSON.parse(fs.readFileSync('../../docs/collaudi/dati-carriera-177-1/stato-ritiro.json','utf8'));
console.log('keys', Object.keys(save).join(','));
const p = JSON.parse(save['cpm-v3']||'{}'); console.log('phase', p.phase, 'retired', p.player&&p.player.retired, p.player&&p.player.careerEnded, Object.keys(p.player||{}).filter(k=>/ritir|retire|end|legac/i.test(k)));
const g = await apri({ save, glb: false }); const page = g.page; await sleep(3000);
console.log('SCREEN', await page.evaluate(() => window.__CPM_CAREER && window.__CPM_CAREER.screen && window.__CPM_CAREER.screen()));
console.log(JSON.stringify(await bottoni(page)).slice(0,600)); console.log((await testo(page)).slice(0,700)); await shot(page,'ritiro-reload');
await g.close();
