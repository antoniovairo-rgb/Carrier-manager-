#!/usr/bin/env node
/* [7.999.57 guardiano — collaudo PO «scena sballata, l'eroe rimane freezato per un po'» (festa di fine partita)] Nella festa
   LEGGERA (niente trofeo) la clip d'esultanza dell'eroe restava in pausa al 34% — a meta' salto — per tutta la festa: il
   congelamento all'apice e' della premiazione con la coppa in mano. Coi corpi 3D accesi, durante la fase `ceremony` si campiona
   il tempo della clip mx-victory-jump dell'eroe (__CPM_ANIM_AUDIT.heroMx). VERDE: la clip avanza (mai piu' di 2 campioni di fila sullo stesso
   tempo). ROSSO __CPM_NO_FESTA57: la clip resta ferma (almeno 4 campioni di fila sullo stesso tempo).
   [giro 138 PO-336] campionamento a EVENTO (clip ferma / clip ripartita, tetto 90 campioni) con la festa tenuta aperta da
   __CPM_CER_HOLD; clip = gesto mx-* di peso massimo; braccio e motivo stampati per ultimi. CPM_BRACCI=verde,rosso,rosso61 per
   una corsa parziale (esce sempre 1: non vale come verdetto). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso, rosso61) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(([r, r61]) => { window.__CPM_GLB = true; if (r) window.__CPM_NO_FESTA57 = 1; if (r61) window.__CPM_NO_FESTA61 = 1; window.__CPM_FESTA942_FORCE = { goals: 2, assists: 1, rb: 18 }; window.__CPM_CER_HOLD = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, [rosso, rosso61]);
  await openMatch(page, port, { skipLoadAll: true, name: 'Festa2' });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
  const t0 = Date.now(); let f = false;
  while (Date.now() - t0 < 480000) { f = await page.evaluate(() => !!document.querySelector('[data-cpm="festa47"]')).catch(() => false); if (f) break; await sleep(400); }
  /* [giro 138 PO-336] CAMPIONAMENTO A EVENTO, NON A 12 CAMPIONI DI PARETE. MISURATO sulla 7.999.188: il rosso si congela davvero
     (mx-victory ferma a 2,04 = 45% della clip, il tetto della posa 191), ma ci arriva al 9° campione su 12 e mostra solo 3 campioni
     fermi: la finestra fissa (12 x 600 ms di parete) finiva prima della prova. Dal giro 61 la clip della festa e' mx-victory (4,5 s,
     piu' lunga del salto) e il punto di congelamento e' passato dal 34% al 45% (giro 118): la stessa finestra non bastava piu'.
     La festa leggera si chiude a 9,5 s di PARETE (src/15): a fps headless la clip non arriva in fondo prima del fischio (verde
     misurato fino a 2,37 su 4,5). La sonda la tiene aperta con __CPM_CER_HOLD (gia' del gioco, solo sotto ?cpmtest=1): ciò che il
     gioco non produce in tempo si provoca dalla sonda. Ora si campiona finche' arriva l'EVENTO che decide (clip ferma per FERMO campioni di fila, oppure clip ripartita da capo = ha
     superato ogni punto di congelamento), con tetto di 90 campioni; se la festa finisce prima, il braccio e' «non giudicato».
     La clip campionata e' il GESTO dell'eroe (azione mx-* di peso massimo), non solo quelle che si chiamano «victory»: il rosso 61
     deve poter dire QUALE clip suona invece di mx-victory. Soglie invariate (verde <= 2 di fila, rosso >= 4). */
  const camp = [], nomi = new Set(); let evento = null, ultFase = null, prev = null, run = 0;
  for (let i = 0; i < 90 && !evento; i++) {
    const r = await page.evaluate(() => { const a = window.__CPM_ANIM_AUDIT && window.__CPM_ANIM_AUDIT(); const ph = window.__CPM_PHASE && window.__CPM_PHASE();
      const acts = (a && a.heroMx && a.heroMx.acts) || []; let best = null, bw = -1;
      for (const x of acts) { const m = x.match(/^([^:]+):([\d.]+)@([\d.]+)/); if (!m || !/^mx-/.test(m[1])) continue; if (+m[2] > bw) { bw = +m[2]; best = { n: m[1], t: m[3] }; } }
      return { ph, t: best ? best.t : null, n: best ? best.n : null, tutti: acts.map(x => x.split(':')[0]) }; }).catch(() => ({ ph: 'ERRORE', t: null, n: null, tutti: [] }));
    ultFase = r.ph; r.tutti.forEach(x => nomi.add(x));
    if (f && r.ph !== 'ceremony' && camp.length) { evento = 'festa finita'; break; }
    if (r.ph === 'ceremony' && r.t != null) {
      camp.push(r);
      /* il fermo e la ripartenza si contano sulla STESSA clip: al primo campione della festa puo' pesare ancora la clip di prima
         (misurato: mx-disappunto @0,29 al primo campione del rosso 61) */
      const stessa = prev && prev.n === r.n;
      if (stessa && +r.t === +prev.t) run++; else run = 1;
      if (run >= 4) evento = 'clip ferma';
      else if (stessa && +r.t < +prev.t - 0.3) evento = 'clip ripartita';
      prev = r;
    }
    await sleep(600);
  }
  await page.close();
  /* clip DOMINANTE della festa (la piu' campionata); tempi e fermo si giudicano su di lei */
  const cnt = {}; camp.forEach(c => { cnt[c.n] = (cnt[c.n] || 0) + 1; }); const dom = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || null;
  const tempi = camp.filter(c => c.n === dom).map(c => c.t), clip = new Set(dom ? [dom] : []);
  let fermo = 1; run = 1; for (let i = 1; i < tempi.length; i++) { run = tempi[i] === tempi[i - 1] ? run + 1 : 1; if (run > fermo) fermo = run; }
  return { festa: f, evento: evento || 'tetto di 90 campioni', ultFase, tempi, fermo, max: tempi.length ? Math.max(...tempi.map(Number)) : null, clip: [...clip], altre: Object.keys(cnt).filter(n => n !== dom), nomi: [...nomi] };
}
const BR = (process.env.CPM_BRACCI || 'verde,rosso,rosso61').split(',');
const v = BR.includes('verde') ? await braccio(false) : null; if (v) console.log('VERDE', JSON.stringify(v));
const r = BR.includes('rosso') ? await braccio(true) : null; if (r) console.log('ROSSO', JSON.stringify(r));
const r61 = BR.includes('rosso61') ? await braccio(false, true) : null; if (r61) console.log('ROSSO61', JSON.stringify(r61));
await Promise.race([b.close(), sleep(5000)]); srv.close();
/* verde: la clip mx-victory avanza E supera il punto in cui il rosso si ferma (senza, un verde troppo corto passerebbe a vuoto) */
const puntoRosso = r && r.fermo >= 4 ? Math.max(...r.tempi.map(Number)) : null;
const okV = !!v && v.festa && v.tempi.length >= 6 && v.fermo <= 2 && v.clip.length === 1 && v.clip[0] === 'mx-victory' && (puntoRosso == null || v.max > puntoRosso);
const okR = !!r && r.festa && r.fermo >= 4;
const ok61 = !!r61 && r61.festa && r61.clip.length > 0 && !r61.clip.includes('mx-victory');
const why = [];
if (v && !okV) why.push(`verde: ${!v.festa ? 'festa mai comparsa' : v.tempi.length < 6 ? 'non giudicato, ' + v.tempi.length + ' campioni (' + v.evento + ')' : v.fermo > 2 ? 'clip ferma ' + v.fermo + ' campioni di fila' : (v.clip.length !== 1 || v.clip[0] !== 'mx-victory') ? 'clip ' + JSON.stringify(v.clip) : 'non supera il punto del rosso (' + v.max + ' <= ' + puntoRosso + ')'}`);
if (r && !okR) why.push(`rosso __CPM_NO_FESTA57: non riproduce il congelamento (fermo ${r.fermo} campioni, evento ${r.evento}, ${r.tempi.length} campioni)`);
if (r61 && !ok61) why.push(`rosso __CPM_NO_FESTA61: non si distingue (clip ${JSON.stringify(r61.clip)}, ${r61.tempi.length} campioni, evento ${r61.evento})`);
console.log(okV ? `✅ nella festa l'esultanza dell'eroe si muove (fino a ${v.max}, oltre il ${puntoRosso} del rosso)` : '❌ esultanza ferma o non giudicata nella festa');
console.log(okR ? `✅ il rosso __CPM_NO_FESTA57 mostra l'eroe congelato (${r.fermo} campioni fermi a ${puntoRosso})` : '❌ il rosso non riproduce il congelamento');
console.log(ok61 ? `✅ il rosso __CPM_NO_FESTA61 suona un'altra clip: ${r61.clip.join(', ')}` : '❌ il rosso 61 non si distingue');
const tutti = BR.length === 3;
console.log(`BRACCI ${BR.join('+')} · MOTIVO ${why.length ? why.join(' · ') : 'nessuno'}${tutti ? '' : ' · corsa PARZIALE: non vale come verdetto'}`);
process.exit(tutti && okV && okR && ok61 ? 0 : 1);
