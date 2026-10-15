#!/usr/bin/env node
/* [giro 19 PO-246] GUARDIANO: la scheda del mister lasciata senza risposta si chiude da sola e la sua scelta ARRIVA AL MOTORE.
   Collaudo 165 N2: una scheda a schermo dal 54' al 76' e l'ultima (78') aperta fino al fischio senza arrivare al motore.
   Partita vera (save-194 come interazioni-226), pilota seedato, nessuna risposta alle schede, timer di scadenza corto (__CPM_SCMS681).
   Due bracci di misura:
     · GIOCATORE (__CPM_SCFREEZE_TEST=1: il pilota rispetta il blocco del cronometro come una persona): minuti di gioco trascorsi
       con la scheda aperta (atteso 0) e schede arrivate al motore;
     · PILOTA (come la sonda del collaudo 165: il pilota salta il blocco) : stessa misura, il cronometro corre con la scheda aperta.
   ESITO DELLA MISURA (giro 19): il difetto del collaudo nasce dal PILOTA, che per costruzione salta il blocco del cronometro
   (src/15, gate del clock: `__CPM_AUTOPLAY_ON` senza `__CPM_SCFREEZE_TEST`); con il blocco attivo la partita si ferma finche' la scheda
   non e' scelta (timer 35 s) e la scelta arriva al motore. Il braccio PILOTA si stampa ma non si giudica (CPM_PILOTA=0 lo salta).
   VERDE (braccio giocatore): 0-1 minuti a scheda aperta e ogni scheda arriva al motore (__CPM_INT226.scelte).
   ROSSO (__CPM_NO682F, l'interruttore esistente che toglie il blocco): il cronometro corre con la scheda aperta (> 3 minuti).
   Uso: node schede-246.mjs  (CPM_PARTITE=1, CPM_SPEED=4, CPM_SCMS=6000) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const NP = +(process.env.CPM_PARTITE || 1), SPEED = process.env.CPM_SPEED || '4', SCMS = +(process.env.CPM_SCMS || 6000), TETTO = 420000;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function partita(i, braccio, rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Guard246 ' + ['Rossi', 'Bianchi', 'Verdi', 'Neri'][i % 4] + i;
  await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_NO_SCHEDE259 = 1;/* [PO-259] le schede 226/234 vivono sotto il rosso del 259: questo guardiano le custodisce li' */ window.__CPM_SCMS681 = o.scms; if (o.freeze) window.__CPM_SCFREEZE_TEST = 1; if (o.rosso) window.__CPM_NO682F = 1;
    localStorage.setItem('cpm-match-speed', o.speed); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, rosso, speed: SPEED, scms: SCMS, freeze: braccio === 'giocatore' });
  const out = { i, braccio, rosso, finita: false, aperte: [] };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
    await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {});
    await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2460 + i * 37);
    const t1 = Date.now(); let cur = null;
    while (Date.now() - t1 < TETTO) { await sleep(400);
      const d = await page.evaluate(() => { const el = document.querySelector('[data-cpm="pop919"]'); return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, ck: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, sc: el ? (el.innerText || '').slice(0, 40) : null }; });
      if (d.sc && !cur) cur = { da: d.ck, a: d.ck, t: (d.sc || '').replace(/\s+/g, ' ') };
      else if (d.sc && cur) cur.a = d.ck;
      else if (!d.sc && cur) { out.aperte.push(cur); cur = null; }
      if (d.ph === 'ended' || d.ph === 'ceremony') { if (cur) { cur.alFischio = true; out.aperte.push(cur); cur = null; } out.finita = true; break; } }
    await sleep(1500);
    const W = await page.evaluate(() => ({ w: window.__CPM_INT226 || { schede: [], scelte: [] }, tmr: window.__CPM_SC681_TMR | 0, fire: window.__CPM_SC681_FIRE | 0, clr: window.__CPM_SC681_CLR | 0 }));
    out.schede = (W.w.schede || []).length; out.scelte = (W.w.scelte || []).map(s => s.id + '@' + s.min + (s.auto ? 'a' : '')); out.tmr = W.tmr; out.fire = W.fire;
    out.mostrate = out.aperte.length; out.maxMin = Math.max(0, ...out.aperte.map(a => (a.a | 0) - (a.da | 0)));
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
const R = [];
for (const rosso of [false, true]) for (const br of ['giocatore', 'pilota']) for (let i = 0; i < NP; i++) {
  if (br === 'pilota' && (rosso || process.env.CPM_PILOTA === '0')) continue;
  const o = await partita(i, br, rosso); R.push(o);
  console.log((rosso ? 'ROSSO ' : 'VERDE ') + br + ' p' + i + ' · fine ' + o.finita + ' · schede a schermo ' + o.mostrate + ' · arrivate al motore ' + (o.scelte || []).length + ' ' + JSON.stringify(o.scelte) + ' · minuti a scheda aperta max ' + o.maxMin + ' · aperte ' + JSON.stringify((o.aperte || []).map(a => a.da + '-' + a.a + (a.alFischio ? ' FISCHIO' : ''))) + ' · timer armati/scaduti ' + o.tmr + '/' + o.fire + (o.errore ? ' · ERRORE ' + o.errore : '') + (o.errori.length ? ' · pageerror ' + o.errori.join(' | ') : ''));
}
await b.close(); srv.close();
const g = [], V = R.filter(o => !o.rosso && o.braccio === 'giocatore'), Ro = R.filter(o => o.rosso);
const persa = o => (o.mostrate || 0) > (o.scelte || []).length || (o.aperte || []).some(a => a.alFischio);
V.forEach(o => { if (!o.finita) g.push('verde p' + o.i + ': partita non finita'); if (persa(o)) g.push('verde p' + o.i + ': scheda persa (' + o.mostrate + ' a schermo, ' + (o.scelte || []).length + ' al motore)');
  if (o.maxMin > 1) g.push('verde p' + o.i + ': il cronometro corre con la scheda aperta (' + o.maxMin + ' minuti)'); if (o.errori.length) g.push('verde: errori di pagina'); });
if (!V.some(o => o.mostrate > 0)) g.push('verde: nessuna scheda comparsa, guardiano cieco');
if (!Ro.some(o => o.maxMin > 3)) g.push('rosso: il cronometro non corre con la scheda aperta, il difetto non si vede');
if (g.length) { console.log('❌ schede-246'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ schede-246 verde (col blocco la partita aspetta la scheda e la scelta arriva al motore) e il rosso si vede');
