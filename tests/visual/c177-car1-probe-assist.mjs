/* Collaudo 177 carriera 1 — D assist: partita live scegliendo SEMPRE il passaggio, registra banner dell'esito nel tempo + stato 3D */
import { apri, testo, sleep, bottoni, shot, caricaCarriera, clic, cta, overlay, giocaPartita } from './c177-car1-lib.mjs';
import fs from 'node:fs';
const save = JSON.parse(fs.readFileSync(process.argv[2],'utf8')); save['cpm-match-speed']='2';
const g = await apri({ save, glb: true }); const page = g.page; await caricaCarriera(page); await sleep(1500);
const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
const click = (re) => page.evaluate(src => { const rx = new RegExp(src); const e=[...document.querySelectorAll('button')].find(x=>x.offsetParent&&rx.test(x.innerText.trim())); if(e){e.click();return true;} return false; }, re.source);
for (let i = 0; i < 40; i++) {
  const p = await ph(); if (p === 'matchday') { await click(/Vedi le formazioni/); await sleep(1200); break; } if (p && p!=='dashboard') break;
  const o = await overlay(page);
  if (o) { const b = o.btns.find(x=>/Gioca la partita/.test(x)) || o.btns.find(x=>/^(Capito|Continua|Tieni|Chiudi)/.test(x.replace(/^[^A-Za-zÀ-ù]+/,''))) || o.btns[0]; await click(new RegExp(b.slice(0,18).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))); await sleep(1500); continue; }
  const sc = await page.evaluate(()=>window.__CPM_CAREER.screen());
  if (sc==='nationalCallup') { await click(/Gioca la partita/); await sleep(2000); continue; }
  const c = await cta(page); if (c && c.t) { await page.evaluate(() => document.querySelector('[data-cpm="avanza23"]').click()); await sleep(1800); } else await sleep(800);
}
await click(/Salta l'ingresso/); await sleep(1500);
const PASS = /Filtrante|Uno-due|Lancio|Servi|Sponda|Cross|Passaggio|Apri|Verticalizz|Imbecca|Cambio/i;
const log = [];
const r = await giocaPartita(page, { tag: 'AS', foto: 0, maxMs: 330000, politica: (n, sc) => { const i = sc.findIndex(x => PASS.test(x)); return i >= 0 ? i : 0; },
  onHL: async (h, pg) => { log.push({ scelta: h.scelta, act: h.act, esito: (h.esitoTxt||'').split(' / ').slice(10, 16).join(' / '), dopo: (h.dopoTxt||'').slice(150,300) }); } });
fs.writeFileSync('/tmp/claude-0/assist-probe.json', JSON.stringify({ log, ph: r.ph }, null, 1));
console.log(JSON.stringify(log.map(x=>[x.scelta.slice(0,32), x.act&&x.act.kind, x.esito.slice(0,70)]), null, 0));
await g.close();
