#!/usr/bin/env node
/* [giro 380 PO-664 «clip di testa nella salita»] SONDA E GUARDIANO DEL COMPAGNO CHE STACCA SUL CROSS. GLB acceso (direttiva PO 29/07),
   teatro acceso (__CPM_PRESENT + __CPM_CINE), tempo di scena a 1/60 s (__CPM_DT60), una pagina nuova per scena (7.483).
   Due testimoni di src/12, accesi solo da __CPM_G380_REC (sola lettura):
     __CPM_G380J  una riga per fotogramma mentre il compagno dell'incornata salta (`_rcvT`): [scena, tempo del salto, quota del corpo,
                  clip montata, suo peso, peso della corsa]
     __CPM_G380   una riga al contatto dell'incornata (fine di `_cgHold`): clip, suo tempo e scala, peso, quota, vicino/basso
   Grandezze:
     aria    = fotogrammi del salto con il corpo sopra 0,05 u · senza = di questi, quelli con la clip `header` sotto peso 0,5
     scClip  = (tempo della clip al contatto - 0,79 s) / scala: di quanti secondi di scena la frustata della testa (profilo del giro 342,
               _TC342) cade prima (+) o dopo (-) il contatto
   Modi:  node misura-380.mjs                     tutte le azioni «cross» offensive delle situazioni (riuscite) → out/giro380/<eti>.json
          node misura-380.mjs --guardiano         scene fisse (GUARDIA): esce 0 solo se tutte dentro le soglie; non giudicata = rosso
          CPM_ROSSO=__CPM_NO_G380 …               braccio rosso (comportamento di prima): valido solo se almeno 2 scene PO-664 e almeno 1
                                                  scena PO-640 cadono su misura
   Col --guardiano gira anche PO-640 (TESTA640: rimbalzi e sponde dell'eroe, grandezze e soglie di testa-342, provocazione __CPM_FORZA380).
          CPM_DUMP=1 · CPM_LOG=1 · --casi=gi:k,…  righe grezze · fasi stampate · scene a scelta
   SOGLIE (scritte prima della correzione, sulla regola del giro 342): senza = 0 fotogrammi · |scClip| <= 0,08 s. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname } from './lib/harness.mjs';
import { scena as scena342, giudica as giudica342 } from './testa-342.mjs';

const ARG = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : null; };
const GUARD = process.argv.includes('--guardiano');
const ROSSO = process.env.CPM_ROSSO || '';
const ETI = ARG('eti') || (ROSSO ? 'rosso' : 'verde') + (GUARD ? '-guardiano' : '');
const PAR = +(ARG('par') || process.env.CPM_PAR || 2);
const OUT = path.join(__dirname, '..', 'out', 'giro380'); fs.mkdirSync(OUT, { recursive: true });
/* [giro 380 PO-640] rimbalzi e sponde dell'eroe (testa-342, stesse grandezze e soglie del giro 342), con __CPM_FORZA380 in ENTRAMBI i bracci:
   la fine costruzione si comporta come nel caso misurato (pallone sulla testa ma oltre il punto di contatto dichiarato, 1 pagina su 4 da
   sola). Verde: tutte dentro le soglie del 342. Rosso: gi53 e gi1 cadono (misurato: picco -0,36/-0,37 s, nessuna clip al contatto). */
export const TESTA640 = [[53, 1, 'rimbalzo'], [1, 1, 'rimbalzo'], [103, 1, 'rimbalzo'], [124, 0, 'sponda'], [126, 0, 'sponda']];
export const SOGLIA = { senza: 0, aria: 0.05, scClip: 0.08 };
/* scene del guardiano: cross offensivi riusciti con un compagno che incorna (scelte dal censimento del giro, vedi rapporto) */
export const GUARDIA = (process.env.CPM_GUARDIA || '46:0,63:2,96:0,93:2,176:1,165:1').split(',').filter(Boolean).map(x => x.split(':').map(Number));
/* 46:0 e 96:0 = rifinitore della scena larga (giro 364: incornata 0,14 s dopo l'arrivo) · 63:2 · 93:2 · 176:1 · 165:1 = consegna e incornata
   (0,22 s): scelte fra le 18 azioni cross con incornata del compagno del censimento (rapporto giro 380 §2).
   Tolte perche' la messa in scena forzata non porta sempre il compagno sul pallone (incornata assente, near 0): gi102:0 (passata nel
   censimento, non giudicata nel rosso e nelle prove del giro), gi185:2 (passata nel censimento e nel giro, poi 9 pagine su 9 senza
   incornata, a qualunque ora della partita), gi99:2 (incornata solo alla terza pagina). */

async function scena(b, port, gi, k) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(([rosso, tod]) => { if (tod) window.__CPM_TOD = tod; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_DT60 = 1; window.__CPM_G380_REC = 1; if (rosso) rosso.split(',').forEach(x => { if (x) window[x] = 1; }); }, [ROSSO, process.env.CPM_TOD || '']);
  let R = null, post = null;
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Testa 380' }); await sleep(1200);
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 120000 }).catch(() => {});
    await page.evaluate(g => { window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
    const scelta = await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 150000 }).then(() => 1).catch(() => 0);
    if (!scelta) throw new Error('la scena non e\' arrivata alla scelta');
    await sleep(700);
    await page.evaluate(([a]) => { window.__CPM_G380 = []; window.__CPM_G380J = []; window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(a); }, [k]);
    /* fine scena = uscita da hl_result (evento), oppure salto finito dopo il contatto, oppure nulla di nuovo per 30 controlli */
    let prev = -1, fermo = 0; const t0 = Date.now();
    while (Date.now() - t0 < 240000) { await sleep(900); const st = await page.evaluate(() => ({ n: (window.__CPM_G380J || []).length, c: (window.__CPM_G380 || []).length, fine: (window.__CPM_G380J || []).some(r => r[1] >= 0.52), ph: window.__CPM_PHASE && window.__CPM_PHASE(), post: window.__CPM_DISPATCH ? window.__CPM_DISPATCH.post || null : null }));
      if (st.ph && !/^hl_/.test(st.ph) && Date.now() - t0 > 3000) break; if (st.c && st.fine) break; if (st.post && st.post !== 'cross_goal' && Date.now() - t0 > 4000) { post = st.post; break; }/* nessuna incornata in questa scena: il dispatcher l'ha detto */
      if (process.env.CPM_LOG) console.log('   gi' + gi + ':' + k, Math.round((Date.now() - t0) / 1000) + 's', JSON.stringify(st));
      const tot = st.n + st.c; if (tot === 0 && Date.now() - t0 > (GUARD ? 240000 : 100000)) break;/* censimento: scena senza incornata (il dispatcher non sempre la dichiara) */ if (tot === prev && tot > 0) { if (++fermo >= 30) break; } else fermo = 0; prev = tot; }/* prima del contatto si aspetta l'evento (tetto 240 s): sotto carico la costruzione dura minuti */
    R = await page.evaluate(() => ({ c: window.__CPM_G380 || [], j: window.__CPM_G380J || [] }));
  } catch (e) { R = { err: String(e && e.message || e).slice(0, 120) }; } finally { await page.close().catch(() => {}); }
  if (process.env.CPM_DUMP && R && !R.err) fs.writeFileSync(path.join(OUT, `dump-${ETI}-gi${gi}-a${k}.json`), JSON.stringify(R));
  return { gi, k, post, ...analizza(R) };
}
/* salto = righe del testimone __CPM_G380J [scena, tempo del salto, quota, clip, peso, corsa] · contatto = __CPM_G380 */
export function analizza(R) {
  if (!R || R.err) return { err: (R && R.err) || 'nessun dato' };
  const J = R.j || [], C = (R.c || []).find(x => x.near) || (R.c || [])[0] || null;
  let aria = 0, senza = 0, quota = 0, quotaSenza = 0, corsa = null;
  for (const r of J) { if (r[2] <= SOGLIA.aria) continue; aria++; quota = Math.max(quota, r[2]); if (!(r[3] === 'header' && r[4] >= 0.5)) { senza++; if (r[2] > quotaSenza) { quotaSenza = r[2]; corsa = r[5]; } } }
  const scClip = (C && C.g === 'header' && C.clip === 'header' && C.ts > 0) ? +((C.ct - 0.79) / C.ts).toFixed(3) : null;
  return { salto: J.length, aria, senza, quota: +quota.toFixed(2), quotaSenza: +quotaSenza.toFixed(2), corsa, contatto: C, scClip };
}
export function giudica(r) {
  if (!r || r.err) return ['non giudicato (' + ((r && r.err) || 'nessun dato') + ')'];
  if (!r.contatto || !r.contatto.near || r.contatto.low) return ['non giudicato (nessuna incornata del compagno' + (r.contatto && !r.contatto.near ? ': non e\' arrivato sul pallone' : '') + ')'];
  const m = [];
  if (!r.salto) m.push('il compagno ha incornato senza saltare');
  if (r.senza > SOGLIA.senza) m.push(`${r.senza} fotogrammi in aria senza la clip di testa (fino a ${r.quotaSenza} u, corsa ${r.corsa})`);
  if (!(r.scClip != null && Math.abs(r.scClip) <= SOGLIA.scClip)) m.push(`frustata della clip ${r.scClip == null ? 'assente al contatto (' + (r.contatto.g || 'nessuna clip') + ')' : 'a ' + (-r.scClip) + ' s dal contatto'} (oltre ±${SOGLIA.scClip})`);
  return m;
}

async function main() {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  let lista = GUARD ? GUARDIA : null;
  if (ARG('casi')) lista = ARG('casi').split(',').map(x => x.split(':').map(Number));
  if (!lista || !lista.length) { /* enumerazione dal gioco: azioni «cross» offensive (deriveHL), come testa-342 per le teste */
    const page = await b.newPage(); await installCdnRoutes(page); await openMatch(page, port, { skipLoadAll: true, name: 'Testa 380' });
    lista = await page.evaluate(() => { const o = []; const S = window.__CPM_SITS || []; for (let gi = 0; gi < S.length; gi++) { const s = S[gi]; if (!s || s.def || s.type === 'def') continue; (s.actions || s.acts || []).forEach((a, k) => { try { const h = deriveHL(s, a); if (h && h.type === 'cross') o.push([gi, k]); } catch (e) {} }); } return o; });
    await page.close(); console.log('azioni cross: ' + lista.length + ' → ' + lista.map(x => x.join(':')).join(','));
  }
  const out = []; let idx = 0;
  const worker = async () => { while (idx < lista.length) { const [gi, k] = lista[idx++]; let r = null, prove = 0;
    /* RIPETIZIONE DICHIARATA (PROCESSO.md, controlli instabili): la messa in scena forzata non porta sempre il compagno sul pallone (MISURATO
       gi185:2, quattro pagine su sei: contatto con near 0, nessuna incornata). Cio' che il gioco non produce si provoca: fino a 3 pagine nuove
       finche' l'incornata avviene; si giudica la prima che la produce; dopo 3 senza incornata la scena e' «non giudicata» = rosso. */
    while (prove < 3) { prove++; r = await scena(b, port, gi, k); if (r.err) continue; if (r.contatto && r.contatto.near && !r.contatto.low && r.salto) break; if (r.contatto && r.contatto.near && !r.contatto.low && r.contatto.m) break; }
    r.prove = prove; out.push(r); console.log(JSON.stringify(r)); } };
  await Promise.all(Array.from({ length: PAR }, worker));
  const out640 = []; if (GUARD) { let j = 0; const w640 = async () => { while (j < TESTA640.length) { const [gi, k, tipo] = TESTA640[j++]; let r = await scena342(b, port, gi, k, 'success', { extra: ['__CPM_FORZA380'] }); if (r.err) r = await scena342(b, port, gi, k, 'success', { extra: ['__CPM_FORZA380'] }); r.tipo = tipo; out640.push(r); } };
    await Promise.all(Array.from({ length: PAR }, w640)); }
  await b.close(); srv.close();
  out.sort((a, c) => a.gi - c.gi || a.k - c.k);
  fs.writeFileSync(path.join(OUT, ETI + '.json'), JSON.stringify({ quando: new Date().toISOString(), rosso: ROSSO || null, scene: out }, null, 1));
  let boc = 0, ng = 0; for (const r of out) { const m = giudica(r); if (m.length) { boc++; if (m.some(x => /non giudicato/.test(x))) ng++; console.log(`NO   gi${r.gi} a${r.k} (${r.prove} pagine): ${m.join(' · ')}`); } else console.log(`ok   gi${r.gi} a${r.k} (pagina ${r.prove} di 3): in aria ${r.aria} fotogrammi (quota ${r.quota}), tutti con la clip di testa · frustata a ${r.scClip} s`); }
  let boc640 = 0, ng640 = 0; for (const r of out640.sort((a, c) => a.gi - c.gi)) { const m = giudica342(r); if (m.length) { boc640++; if (m.some(x => /non giudicato/.test(x))) ng640++; console.log(`NO   PO-640 gi${r.gi} a${r.k} (${r.tipo}): ${m.join(' · ')}`); } else console.log(`ok   PO-640 gi${r.gi} a${r.k} (${r.tipo}): testa-pallone ${r.dCont} u · picco ${r.scPicco} s · frustata ${r.scClip} s · peso ${r.peso}`); }
  if (!GUARD) return 0;
  if (ROSSO) { const veri640 = boc640 - ng640; console.log(`braccio ROSSO PO-640: ${veri640} scene bocciate su misura (${ng640} non giudicate)`); const veri = boc - ng; const ok = veri >= 2 && veri640 >= 1; console.log(`\nbraccio ROSSO (${ROSSO}): ${veri} scene bocciate su misura (${ng} non giudicate, non contano) — ${ok ? 'il difetto si vede: ROSSO COL ROSSO, valido' : 'IL ROSSO NON CADE: guardiano cieco'}`); return ok ? 0 : 1; }
  console.log(`\nbraccio VERDE: PO-664 ${out.length - boc}/${out.length} scene dentro la soglia${ng ? ' · ' + ng + ' NON GIUDICATE (= rosso)' : ''} · PO-640 ${out640.length - boc640}/${out640.length}${ng640 ? ' · ' + ng640 + ' NON GIUDICATE (= rosso)' : ''} — ${boc || boc640 ? 'FALLITO' : 'PASS'}`); return (boc || boc640) ? 1 : 0;
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__dirname, '..', 'misura-380.mjs')) { main().then(c => process.exit(c)).catch(e => { console.error('FATALE', e); process.exit(2); }); }
