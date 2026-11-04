#!/usr/bin/env node
/* [giro 100] SONDA/GUARDIANO «parata scritta = pallone che arriva al portiere che para» (highlight-95 D3, tiro del COMPAGNO dopo un
   passaggio dell'eroe). Partite vere dal salvataggio S5 del collaudo 177 (dove sono stati visti SEIFERT/ROTH/«Palla in area»), pilota
   automatico politica «re» sui passaggi, pagina NUOVA per partita. Un registratore nella pagina (requestAnimationFrame, stesso clock dei
   fotogrammi) annota per ogni fotogramma di hl_result: distanza portiere-pallone (__CPM_GKB95), post-arco (__CPM_ARC.pa), esito rivelato
   (__CPM_REVAT95) e indice del testimone __CPM_RES218. Per ogni scena col riquadro «parata» (stessa espressione di highlight-95) misura:
     minGB  minimo della distanza portiere-pallone da hl_result a 1,5 s dopo la rivelazione (highlight-95 D3: difetto se > 6);
     tiro   istante (rispetto alla rivelazione) in cui parte il tiro del compagno (post-arco assist_shot/cross_goal).
   Regimi: «gioco» (__CPM_PRESENT=1 + __CPM_REALWAIT: come il giocatore) e «prova» (solo __CPM_REALWAIT, come highlight-95).
   Rosso: __CPM_NO_G100D3 (deve far ricomparire il difetto). Uso: node parata-100.mjs  (CPM_SEMI, CPM_REGIMI=gioco,prova, CPM_ARMI,
   CPM_MISURA=1 stampa senza giudicare, CPM_RIGHE=1 una riga per scena, CPM_PAR=2; il rosso gira nel solo regime «prova», CPM_REGIMI_ROSSO).
   ⚠️ Due pagine per volta al massimo: con tre la riserva della scena scatta per la guardia di parete (30 s) e le parate diventano non giudicabili. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const SEMI = (process.env.CPM_SEMI || '7,2021').split(',').map(Number);
const SAVES = (process.env.CPM_SALVA || 's5').split(',');
const REGIMI = (process.env.CPM_REGIMI || 'gioco,prova').split(',');
const PAR = +(process.env.CPM_PAR || 2);
const RE_PASS = 'Filtrante|Uno-due|Lancio smarcante|Servi .* libero|Sponda|scarica su|Appoggio|Cross|Palla in area';
const RE_PARATA = /parat|portiere|respint|dice di no|centrale/i;
const srv = await startServer(); const b = await launchBrowser();
async function gioca(sk, sd, rosso, regime) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const raw = FX(SALVA[sk]); let ls;
  if (raw['cpm-v3']) { ls = { ...raw }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' ' + sd; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else { const sv = JSON.parse(JSON.stringify(raw)); (sv.player || sv).name += ' ' + sd; ls = { 'cpm-v3': JSON.stringify(sv) }; }
  ls['cpm-match-speed'] = '2';
  if (process.env.CPM_FLAG) await page.addInitScript(f => { f.split(',').forEach(k => { if (k) window[k] = 1; }); }, process.env.CPM_FLAG);
  await page.addInitScript(([s, r, pr]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000;/* [giro 103] la riserva conta 6 s DI SCENA anche a macchina carica: niente parate «non giudicabili» per la guardia di parete */ if (pr) window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_G100D3 = 1;
    if (!sessionStorage.getItem('__p100')) { for (const k of Object.keys(s)) localStorage.setItem(k, s[k]); sessionStorage.setItem('__p100', '1'); }
    const L = window.__P100 = []; const f = () => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); if (ph === 'hl_result' && L.length < 40000) { const a = window.__CPM_ARC || {};
      L.push([Date.now(), (window.__CPM_RES218 || []).length, window.__CPM_GKB95 ? window.__CPM_GKB95() : null, a.pa || null, window.__CPM_REVAT95 || 0, a.ok || null, a.pt, a.tl ? 1 : 0, a.arc ? 1 : 0]); } } catch (e) {} requestAnimationFrame(f); }; requestAnimationFrame(f); },
  [ls, rosso, regime === 'gioco']);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(([s, re]) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 're', re, tickMs: 150 }), [sd, RE_PASS]);
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 480000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => 'x'); if (ph === 'ended' || ph === 'ceremony' || ph === 'x') break; await sleep(1000); }
  const R = await page.evaluate(() => window.__CPM_RES218 || []).catch(() => []);
  const L = await page.evaluate(() => window.__P100 || []).catch(() => []);
  const REV = await page.evaluate(() => window.__CPM_REV95 || []).catch(() => []);
  await ctx.close();
  /* una scena = fotogrammi consecutivi di hl_result con lo stesso indice del testimone (n = lunghezza, la scena e' R[n-1]) */
  const scene = []; let cur = null;
  for (const f of L) { if (!cur || cur.n !== f[1]) { cur = scene.find(x => x.n === f[1]) || null; if (!cur) { cur = { n: f[1], fr: [] }; scene.push(cur); } } cur.fr.push(f); }/* una scena per indice del testimone: i fotogrammi lenti non la spezzano */
  const out = [];
  for (const s of scene) { const r = R[s.n - 1]; if (!r) continue; const ovl = String(r.ovl || ''); if (!RE_PARATA.test(ovl)) continue;
    const rev = (s.fr.find(f => f[4] > 0) || [])[4] || 0; const lim = rev ? rev + 1500 : Infinity;
    let minGB = 99; for (const f of s.fr) if (f[0] <= lim && f[2] != null) minGB = Math.min(minGB, f[2]);
    const fs0 = s.fr.find(f => f[3] === 'assist_shot' || f[3] === 'cross_goal'); const dive = s.fr.find(f => f[5] === 'gk_dive');
    const pas = [...new Set(s.fr.map(f => f[3]))].join('>');
    out.push({ lab: r.label, ovl, key: r.key, min: r.min != null ? r.min : (r.clock != null ? r.clock : null), g: r.g137 ? r.g137.fam + ':' + r.g137.esito : '-', minGB, rev: !!rev,
      tr: (() => { const x = []; let k = ''; for (const f of s.fr) { const q = (f[3] || '-') + (f[7] ? '/tl' : '') + (f[8] ? '/arc' : ''); if (q !== k) { x.push((rev ? f[0] - rev : f[0] - s.fr[0][0]) + ':' + q + '@' + (f[2] != null ? f[2].toFixed(0) : '-')); k = q; } } return x.slice(0, 30).join(' '); })(), tiro: fs0 && rev ? fs0[0] - rev : null, tuffo: dive && rev ? dive[0] - rev : null, pas, nfr: s.fr.length, dur: s.fr[s.fr.length - 1][0] - s.fr[0][0], rv: REV.find(x => x.hl === r.hl) || null });
  }
  return { out, ph, n: scene.length };
}
const esito = {};
for (const arm of ARMI) { const rosso = arm === 'rosso'; const lav = []; for (const rg of (rosso ? (process.env.CPM_REGIMI_ROSSO || 'prova').split(',') : REGIMI)) for (const sk of SAVES) for (const sd of SEMI) lav.push({ rg, sk, sd });
  const fatti = new Array(lav.length); let k = 0;
  await Promise.all(Array.from({ length: Math.min(PAR, lav.length) }, async () => { while (k < lav.length) { const i = k++; const L = lav[i];
    try { fatti[i] = await gioca(L.sk, L.sd, rosso, L.rg); } catch (e) { fatti[i] = { out: [], ph: 'errore ' + String(e).slice(0, 80), n: 0 }; } } }));
  /* [giro 103] copertura: il pilota gioca in tempo reale e la stessa partita non e' riproducibile a seme fisso. Se un braccio resta senza
     la scena che deve giudicare (verde: nessuna parata sul ramo cross_goal o meno di 3 del compagno; rosso: nessuna parata giudicabile)
     si rigiocano le stesse partite, al massimo due volte, dichiarandolo. Le soglie non cambiano. */
  const _cieco = () => { const o = fatti.flatMap(M => (M && M.out) || []).filter(x => !(x.rv && x.rv.cap === 'parete'));
    return rosso ? !o.length : (o.filter(x => /assist/.test(x.g)).length < 3 || !o.some(x => /cross_goal/.test(x.pas))); };
  for (let giro = 1; giro <= 2 && _cieco(); giro++) { console.log(arm + ' copertura insufficiente: secondo giro ' + giro); const base = lav.length; const ext = lav.slice(0, base).map(L => ({ ...L, rip: giro }));
    let j = 0; await Promise.all(Array.from({ length: Math.min(PAR, ext.length) }, async () => { while (j < ext.length) { const i = j++; const L = ext[i];
      try { fatti.push(await gioca(L.sk, L.sd, rosso, L.rg)); } catch (e) { fatti.push({ out: [], ph: 'errore ' + String(e).slice(0, 80), n: 0 }); } lav.push(L); } })); }
  const T = { par: 0, dif: [], comp: 0 };
  lav.forEach((L, i) => { const M = fatti[i]; console.log(arm + ' ' + L.rg + ' ' + L.sk + '/' + L.sd + (L.rip ? ' (ripetuta ' + L.rip + ')' : '') + ' fine ' + M.ph + ' scene ' + M.n + ' parate ' + M.out.length);
    for (const o of M.out) { T.par++; if (/assist/.test(o.g)) T.comp++; if (/cross_goal/.test(o.pas)) T.cg = (T.cg | 0) + 1; const tag = L.rg + ' ' + L.sk + '/' + L.sd + ' «' + String(o.lab).slice(0, 30) + '»';
      if (o.rv && o.rv.cap === 'parete') { T.ng = (T.ng | 0) + 1; continue; }
      if (o.minGB > 6) T.dif.push(tag + ' «' + o.ovl + '» minGB ' + o.minGB.toFixed(1));
      if (process.env.CPM_RIGHE) console.log('    ' + tag + ' g=' + o.g + ' key=' + o.key + ' minGB=' + o.minGB.toFixed(1) + ' tiro=' + o.tiro + ' tuffo=' + o.tuffo + ' rev=' + o.rev + ' via=' + (o.rv ? o.rv.via + (o.rv.wpa ? '+wpa' : '') + (o.rv.cap ? '+' + o.rv.cap : '') : '-') + ' dur=' + o.dur + ' fr=' + o.nfr + ' pa=' + o.pas + ' «' + o.ovl + '»' + (process.env.CPM_TR ? '\n      ' + o.tr : '')); } });
  esito[arm] = T; console.log(arm.toUpperCase() + ' parate ' + T.par + ' (tiro del compagno ' + T.comp + ') · sul ramo cross_goal ' + (T.cg | 0) + ' · non giudicabili ' + (T.ng | 0) + ' · difetti ' + T.dif.length); T.dif.slice(0, 12).forEach(x => console.log('  · ' + x));
}
await b.close(); srv.close();
if (process.env.CPM_MISURA) process.exit(0);
const g = [], V = esito.verde, R = esito.rosso;
if (V) { if (V.comp < 3) g.push('verde: cieco, solo ' + V.comp + ' parate sul tiro del compagno (pavimento 3)'); if (!(V.cg > 0)) g.push('verde: nessuna parata sul ramo cross_goal (il ramo corretto dal giro 100 non e\' stato guardato)'); if (V.dif.length) g.push('verde: ' + V.dif.length + ' parate senza pallone al portiere'); }
if (R && !R.dif.length) g.push('rosso: il difetto non si vede (' + R.par + ' parate)');
if (g.length) { console.log('❌ parata-100'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ parata-100' + (V ? ' verde' : '') + (R ? ' · il rosso si vede' : ''));
