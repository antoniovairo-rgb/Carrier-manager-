/* Collaudo 177 carriera 1 — D: "Gioca la partita" della Convocazione Nazionale (S12W28) */
import { apri, testo, sleep, bottoni, shot, caricaCarriera, snap, clic, cta, overlay } from './c177-car1-lib.mjs';
import fs from 'node:fs';
const save = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const g = await apri({ save, glb: false }); const page = g.page; await caricaCarriera(page); await sleep(1500);
const s = await snap(page); console.log('PARTENZA', s.season, s.week, s.weekLived);
const scr = () => page.evaluate(() => window.__CPM_CAREER.screen());
for (let i = 0; i < 12; i++) {
  const o = await overlay(page);
  if (o) { console.log('OV', o.btns.join(' | ').slice(0,200), '::', o.txt.slice(0,120).replace(/\n/g,'|'));
    const b = o.btns.find(x => /Gioca la partita/.test(x)) || o.btns.find(x=>/^(Capito|Continua|Chiudi|Tieni)/.test(x.replace(/^[^A-Za-zÀ-ù]+/,''))) || o.btns[0];
    await page.evaluate(p => { const e=[...document.querySelectorAll('button')].find(x=>x.offsetParent&&x.innerText.trim().startsWith(p.slice(0,20))); if(e) e.click(); }, b); await sleep(1500); continue; }
  const sc = await scr(); const bt = await bottoni(page);
  console.log('SCR', sc, JSON.stringify(bt).slice(0,200));
  if (sc === 'nationalCallup') { await shot(page, 'D-nazionale-convocazione'); for (let k=0;k<3;k++){ await clic(page, /Gioca la partita/); await sleep(2500); console.log(' dopo clic', k, await scr(), JSON.stringify(await bottoni(page)).slice(0,160)); } await shot(page,'D-nazionale-dopo-clic'); break; }
  const c = await cta(page); if (c && c.t) { console.log('CTA', c.t.slice(0,80)); await page.evaluate(() => document.querySelector('[data-cpm="avanza23"]').click()); await sleep(2000); } else { await sleep(1000); }
}
await g.close();
