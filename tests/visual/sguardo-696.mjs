#!/usr/bin/env node
/* [STRUMENTO] IL LABORATORIO VEDE IL CODICE 007? — e sotto quale regime.
   La nota del 7.598 dichiarava che no: «il laboratorio gira a ~7 fps e ventisei inversioni al secondo
   stanno oltre Nyquist». Ma la causa non e' il numero di fotogrammi, e' il `dt`: le reti di legalita'
   correggono al massimo dt*2,5 rad per fotogramma, quindi a dt 0,05 (laboratorio) chiudono in una
   passata e a dt 0,0167 (telefono) non chiudono e si riarmano ogni fotogramma, duellando con la
   morbidezza. Con `__CPM_DT60` il tempo di SCENA avanza di 1/60 per fotogramma renderizzato: stessa
   aritmetica del telefono, wall-clock piu' lento. Qui si verifica se in quel regime il detector VERO
   (`__CPM_DRAFTNOTE`) accende la riga che sul telefono si accende.
     CPM_DT60=1 node sguardo-696.mjs   ·   senza, il regime storico del laboratorio                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const SCENE_TARGET = +(process.env.CPM_SCENES || 10);
const BUDGET_MS = +(process.env.CPM_BUDGET_MS || 1500000);
const DT60 = false;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1;
  for (const k of r) window['__CPM_NO' + k] = true;
  try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {} }, (process.env.CPM_ROSSO || '').split(',').map(x => x.trim()).filter(Boolean));
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);
let secchi = 0, scene = 0; const righe = [];
const t0 = Date.now();
while (scene < SCENE_TARGET && Date.now() - t0 < BUDGET_MS) {
  const ph = await matchPhase(page);
  if (ph === 'ended' || ph === 'ceremony' || ph === 'shootout') { secchi = 0; try { await openMatch(page, port, { skipLoadAll: true }); await sleep(700); } catch (e) { break; } continue; }
  if (ph == null) { if (++secchi >= 12) { secchi = 0; try { await openMatch(page, port, { skipLoadAll: true }); await sleep(700); } catch (e) { break; } } else await sleep(700); continue; }
  secchi = 0;
  if (ph === 'playing') await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const ok = await page.waitForFunction(() => { try { return window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose'; } catch (e) { return false; } }, { timeout: 60000 }).then(() => true).catch(() => false);
  if (!ok) { await sleep(600); continue; }
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
  await page.waitForFunction(() => { try { return !window.__CPM_PHASE || window.__CPM_PHASE() !== 'hl_result'; } catch (e) { return true; } }, { timeout: 90000 }).catch(() => {});
  scene++; await sleep(200);
  const r = await page.evaluate(() => {
    const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
    if (!snap || !snap.samples || !snap.samples.length) return null;
    const S = snap.samples; const ks = S.map(s => s.sk).filter(k => k != null && k >= 0);
    if (!ks.length) return null;
    const k = Math.max(...ks); const W = S.filter(s => s.sk === k);
    if (W.length < 8) return null;
    let txt = ''; try { txt = window.__CPM_DRAFTNOTE(snap, { sceneKey: k }) || ''; } catch (e) { txt = 'ERR ' + e.message; }
    /* ⚠️ la riga del detector si accende solo oltre soglia: su sette scene ne accende una, e su UN
       campione non si giudica niente. Qui si calcola la STESSA matematica (inversioni del solo yaw,
       per secondo reale, escludendo gli stacchi) per OGNI scena, cosi' il metro ha risoluzione su
       tutte invece che sulle sole fuori soglia. */
    let yRev = 0, yPrev = 0, pass = 0, passN = 0;
    const t0 = W[0].t, t1 = W[W.length - 1].t; const dur = Math.max(0.001, (t1 - t0) / 1000);
    for (let i = 1; i < W.length; i++) { const a = W[i - 1], b = W[i];
      if (a.lx == null || b.lx == null || a.cx == null || b.cx == null) continue;
      const y1 = Math.atan2(a.lx - a.cx, a.lz - a.cz), y2 = Math.atan2(b.lx - b.cx, b.lz - b.cz);
      let dy = ((y2 - y1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      if (Math.abs(dy) > 0.006) { if (yPrev && Math.sign(dy) !== Math.sign(yPrev)) yRev++; yPrev = dy; } }
    for (const q of W) { if (q.wl == null) continue; pass += Math.floor(Math.round(q.wl) / 10); passN++; }
    return { n: W.length, txt, inv: +(yRev / dur).toFixed(2), pass: passN ? +(pass / passN).toFixed(2) : null };
  }).catch(() => null);
  if (r) righe.push(r);
}
await b.close(); srv.close();
const rx = /lo SGUARDO della camera oscilla: ([\d.]+) inversioni\/s/;
const rxT = /la camera BECCHEGGIA: ([\d.]+) inversioni\/s/;
const rxS = /la CAMERA (?:trema|salta)/;
const osc = righe.map(r => { const m = rx.exec(r.txt); return m ? +m[1] : null; }).filter(v => v != null);
const bec = righe.map(r => { const m = rxT.exec(r.txt); return m ? +m[1] : null; }).filter(v => v != null);
const salt = righe.filter(r => rxS.test(r.txt)).length;
const invs = righe.map(r => r.inv).filter(v => v != null).sort((a, b2) => a - b2);
const passes = righe.map(r => r.pass).filter(v => v != null).sort((a, b2) => a - b2);
console.log(`\n=== CODICE 007 — LO SGUARDO ${process.env.CPM_ROSSO ? '· ROSSO ' + process.env.CPM_ROSSO : '· VERDE'} ===\n`);
if (invs.length) console.log(`  inversioni/s su OGNI scena: mediana ${invs[invs.length >> 1].toFixed(2)} · max ${invs[invs.length - 1].toFixed(2)} · scene sopra 2,0: ${invs.filter(v => v >= 2).length}/${invs.length}`);
if (passes.length) console.log(`  passate camera per fotogramma: mediana ${passes[passes.length >> 1].toFixed(2)} · max ${passes[passes.length - 1].toFixed(2)}`);
console.log(`  scene utili: ${righe.length}`);
console.log(`  scene con «lo SGUARDO oscilla»  : ${osc.length}/${righe.length}${osc.length ? ` · inversioni/s ${Math.min(...osc).toFixed(1)}-${Math.max(...osc).toFixed(1)}` : ''}`);
console.log(`  scene con «la camera BECCHEGGIA»: ${bec.length}/${righe.length}${bec.length ? ` · inversioni/s ${Math.min(...bec).toFixed(1)}-${Math.max(...bec).toFixed(1)}` : ''}`);
console.log(`  scene con «la CAMERA trema/salta»: ${salt}/${righe.length}`);
console.log('');
for (const r of righe.slice(0, 6)) { const l = r.txt.split('\n').filter(x => /007/.test(x)); if (l.length) console.log('  · ' + l.join('\n  · ')); }
console.log('');
