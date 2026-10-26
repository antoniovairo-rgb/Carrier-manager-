/* Collaudo 177 carriera 1 — percorso del ritiro (dopo S18) */
import { apri, testo, sleep, bottoni, shot, caricaCarriera, snap, clic, dumpLS } from './c177-car1-lib.mjs';
import fs from 'node:fs';
const save = JSON.parse(fs.readFileSync('../../docs/collaudi/dati-carriera-177-1/stato-corrente.json','utf8'));
const g = await apri({ save, glb: false }); const page = g.page; await caricaCarriera(page); await sleep(1500);
const out = [];
const step = async (n) => { const sc = await page.evaluate(() => window.__CPM_CAREER.screen()); const b = await bottoni(page); const t = await testo(page); out.push({ n, sc, b, t: t.slice(0, 2500) }); console.log('##', n, sc, JSON.stringify(b).slice(0, 400)); console.log(t.slice(0, 1800)); await shot(page, 'ritiro-' + n); };
for (const rx of [/Chiudi la stagione/, /Salta il galà/, /Vai al bilancio/, /Continua →/, /Il giorno dell'addio/]) { await clic(page, rx); await sleep(1800); }
await step('01');
for (let i = 2; i <= 14; i++) {
  const b = await bottoni(page); if (!b.length) break;
  const pick = b.find(x => /^(Continua|Avanti|Prosegui|Vai|Chiudi|Fine|Concludi|Saluta|Ritir|Congeda)/i.test(x.replace(/^[^A-Za-zÀ-ù]+/, ''))) || b[0];
  console.log('>> clic', pick); await clic(page, new RegExp(pick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 25))); await sleep(2000);
  await step(String(i).padStart(2, '0'));
}
fs.writeFileSync('../../docs/collaudi/dati-carriera-177-1/ritiro.json', JSON.stringify(out));
const s = await snap(page); console.log('SNAP', JSON.stringify(s).slice(0, 600));
fs.writeFileSync('../../docs/collaudi/dati-carriera-177-1/stato-ritiro.json', JSON.stringify(await dumpLS(page)));
await g.close();
