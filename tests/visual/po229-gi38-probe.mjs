#!/usr/bin/env node
/* SONDA PO-229 — «UNO-DUE CHE RACCONTA UN ASSIST MA NON LO GIOCA» (gi38 «Dai e vai preciso»).

   Misurato dalla sessione principale: riquadro «Passaggio vincente!», premio assist, ma in 3D il
   pallone atterra ai piedi dell'eroe e resta li'; nessun compagno conclude; il ramo `onetwo_back`
   non parte (`__CPM_O2` vuoto).

   COSA MISURA. Forza la scena (default gi38, `CPM_SIT=38,180`), sceglie l'azione con premio assist
   (o `CPM_ACT`), forza il successo e campiona ogni ~60 ms, finche' la scena non esce da `hl_result`:
   post-arco (`__CPM_ARC.pa`), arco in volo, restituzione (`__CPM_O2`), pallone (`__CPM_BALL`) e chi ce
   l'ha (`__CPM_OWN`: i=-2 eroe, altrimenti indice del giocatore).

   VERDETTO (per scena con premio assist):
     A. la restituzione e' partita (`onetwo_back` visto, `__CPM_O2` scritto);
     B. dopo la restituzione il pallone e' stato servito al compagno (`assist_recv` visto);
     C. la conclusione del compagno e' partita (`assist_shot` o `cross_goal` visto);
     D. il pallone NON finisce la scena fermo ai piedi dell'eroe.
   Su esito OCCASIONE (`chance`) la conclusione e' della catena: basta A.
   Esce 1 se una scena fallisce, 2 se cieca.

     CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node po229-gi38-probe.mjs
     CPM_NO_PO229=1 …   prova del rosso (spegne la correzione)                                        */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const SITS = (process.env.CPM_SIT || '38').split(',').map(Number);
const ROSSO = process.env.CPM_NO_PO229 ? 1 : 0;
const VERB = process.argv.includes('--verbose');

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(r => {
  window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = 1;
  if (r) window.__CPM_NO_PO229 = 1;
  try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {}
}, ROSSO);
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);

const esiti = [];
for (const gi of SITS) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) { console.log(`  gi${gi}: non forzabile`); continue; }
  await sleep(420);
  await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_O2 = null; });
  const acts = await page.evaluate(() => (window.__CPM_ACTSO && window.__CPM_ACTSO()) || null);
  const k = process.env.CPM_ACT != null ? +process.env.CPM_ACT
    : (acts ? ((acts.find(a => /assist/i.test(String(a.rew || ''))) || acts[0] || {}).i) : 0);
  const lab = acts && acts.find(a => a.i === k);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; });
  try { await page.evaluate(i => window.__CPM_RESOLVE(i), k); } catch (e) { console.log(`  gi${gi}: resolve fallito`); continue; }
  const camp = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 25000) {
    const s = await page.evaluate(() => {
      try {
        const ph = window.__CPM_PHASE && window.__CPM_PHASE();
        const a = window.__CPM_ARC || {}; const o = window.__CPM_OWN && window.__CPM_OWN();
        const st = window.__CPM_STATE && null;
        return { ph, pa: a.pa || null, arc: !!a.arc, ht: a.ht || null, ek: a.ek || null, o2: !!window.__CPM_O2, tl: a.tl || 0, bx: o && o.x, by: o && o.y, own: o && o.i, od: o && o.d };
      } catch (e) { return null; }
    });
    if (!s) break;
    camp.push(s);
    if (s.ph && s.ph !== 'hl_result' && camp.length > 5) break;
    await sleep(60);
  }
  const res = camp.filter(s => s.ph === 'hl_result');
  const pas = [...new Set(res.map(s => s.pa).filter(Boolean))];
  const seq = []; for (const s of res) if (s.pa && seq[seq.length - 1] !== s.pa) seq.push(s.pa);
  const ultimo = res[res.length - 1] || {};
  const st = await page.evaluate(() => { try { const s = window.__CPM_STATE(); return s.act; } catch (e) { return null; } });
  const r = {
    gi, act: lab ? lab.label || lab.l || JSON.stringify(lab) : k, rew: lab && lab.rew, n: res.length, seq,
    o2: res.some(s => s.o2), ht: (res.find(s => s.ht) || {}).ht, ek: (res.find(s => s.ek) || {}).ek,
    fine: { x: ultimo.bx, y: ultimo.by, own: ultimo.own, d: ultimo.od }, st,
  };
  const assist = /assist/i.test(String(r.rew || ''));
  r.A = r.seq.includes('onetwo_back') && r.o2;
  r.B = r.seq.indexOf('assist_recv') > r.seq.indexOf('onetwo_back') && r.seq.includes('assist_recv');
  r.C = r.seq.some(p => /assist_shot|cross_goal|in_net/.test(p));
  r.D = !(ultimo.own === -2 && ultimo.od != null && ultimo.od < 3.4);
  /* su OCCASIONE (`chance`, 7.8.10) la conclusione arriva dalla CATENA: la scena deve solo restituire il pallone all'eroe */
  r.verde = !assist || (r.ek === 'chance' ? r.A : (r.A && r.B && r.C && r.D));
  esiti.push(r);
  console.log(`  ${r.verde ? '✅' : '❌'} gi${gi} «${r.act}» rew=${r.rew} ht=${r.ht} esito=${r.ek} · ${r.n} campioni · post-arco: ${r.seq.join(' → ') || '(nessuno)'}`);
  console.log(`     restituzione ${r.A ? 'si' : 'NO'} · servizio al compagno dopo ${r.B ? 'si' : 'NO'} · conclusione ${r.C ? 'si' : 'NO'} · fine scena palla a (${r.fine.x},${r.fine.y}) padrone ${r.fine.own === -2 ? 'EROE' : r.fine.own} a ${r.fine.d}u`);
  if (VERB) { console.log('     ' + JSON.stringify(r.st)); console.log('     arco in volo in ' + res.filter(s => s.arc).length + ' campioni · fasi ' + [...new Set(camp.map(s => s.ph))].join(','));
    console.log('     ARCEND ' + JSON.stringify(await page.evaluate(() => (window.__CPM_ARCEND457 || []).slice(-4))));
    console.log('     ARCCALL ' + JSON.stringify(await page.evaluate(() => (window.__CPM_ARCCALL457 || []).slice(-3))));
    console.log('     TLSEG ' + JSON.stringify(await page.evaluate(() => window.__CPM_TLSEG || null)));
    console.log('     tl in ' + res.filter(s => s.tl).length + ' campioni');
    console.log('     palla: ' + res.filter((s, i) => i % 15 === 0).map(s => `${s.bx},${s.by}/${s.own}`).join(' ')); }
}
await b.close(); srv.close();
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (!esiti.length || esiti.every(r => r.n < 5)) { console.log('❌ sonda cieca: nessuna scena campionata'); process.exit(2); }
const ko = esiti.filter(r => !r.verde);
if (ko.length) { console.log(`\n❌ FAIL — ${ko.length}/${esiti.length} scene raccontano un assist che il 3D non gioca`); process.exit(1); }
console.log(`\n✅ PASS — ${esiti.length} scene: restituzione, servizio al compagno e conclusione giocati`);
