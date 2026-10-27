#!/usr/bin/env node
/* [giro 95] GUARDIANO degli highlight dell'eroe trovati dal collaudo carriera 177 n.1 (regola PO: ogni difetto degli highlight vale
   almeno «medio» e blocca il rilascio). Partite vere dai salvataggi del collaudo (S1 Primavera, S5, S12), pilota automatico con la
   politica «re» (sceglie la prima giocata il cui nome risponde all'espressione), testimone __CPM_RES218 (solo __CPM_REC) e lettura del
   riquadro dal DOM. Giudica:
     D1  ogni giocata di PASSAGGIO (filtrante, uno-due, lancio, servi libero, sponda, scarico, appoggio, cross): passaggio arrivato =
         giocata riuscita (mai raccontata persa, mai chiave di fallimento), gol del compagno = assist registrato; quota di passaggi
         arrivati sopra il pavimento (70%).
     D2  «Finta e cambio di passo» e le altre scelte di DRIBBLING si giocano come dribbling: famiglia del motore «dribbling», tipo 3D
         «dribble», esito raccontato da dribbling (mai tiro, mai passaggio intercettato).
     D3  riquadro «parata del portiere» ⟹ nel 3D il portiere avversario e' vicino al pallone; l'eroe non calcia dentro un difensore.
     D4  ogni highlight mostra il suo esito (riquadro con l'esito) prima che la scena si chiuda: mai solo «LA GIOCATA».
   Rossi: __CPM_NO_G95D1 … __CPM_NO_G95D4 (CPM_ARMI=verde,rosso; il rosso li accende tutti e quattro e ogni difetto deve vedersi).
   Uso: node highlight-95.mjs   (CPM_MISURA=1 stampa e non giudica; CPM_SEMI=1,2; CPM_SALVA=s1,s5,s12; CPM_RIGHE=1). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const SEMI = (process.env.CPM_SEMI || '1234,2021').split(',').map(Number);
const SAVES = (process.env.CPM_SALVA || 's1,s5,s12').split(',');
const RE_PASS = 'Filtrante|Uno-due|Lancio smarcante|Servi .* libero|Sponda|scarica su|Appoggio|Cross';
const RE_DRIB = 'Finta e cambio|cerca il fallo|il fallo c|Doppio passo|Sterzata|Dribbling';
const POLITICHE = (process.env.CPM_POL || 'pass,drib').split(',');
const REALWAIT = process.env.CPM_REALWAIT !== '0';/* il gioco vero aspetta la scena (7.461): sotto ?cpmtest=1 senza REALWAIT la finestra d'esito e' quella fissa del gate */
const PAR = +(process.env.CPM_PAR || 3);
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
const isPass = (l) => new RegExp(RE_PASS, 'i').test(l || '') && !/dribbling sul fondo|doppio passo|sterzata/i.test(l || '');
const isDrib = (l) => /Finta e cambio/i.test(l || '');
const isFallo = (l) => /cerca il fallo|il fallo c'|provocator/i.test(l || '');
const _PERSO = /intercett|palla persa|anticipat|legge la giocata|fuori misura|non arriva|portano via|chius/i;
async function gioca(saveKey, sd, rosso, pol, senza) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const raw = FX(SALVA[saveKey]); let ls;
  if (raw['cpm-v3']) { ls = { ...raw }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' ' + sd; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
  else { const sv = JSON.parse(JSON.stringify(raw)); (sv.player || sv).name += ' ' + sd; ls = { 'cpm-v3': JSON.stringify(sv) }; }
  ls['cpm-match-speed'] = '2';
  await page.addInitScript(([s, r, rw, se]) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (rw) window.__CPM_REALWAIT = 1; if (r) { window.__CPM_NO_G95D1 = 1; window.__CPM_NO_G95D2 = 1; window.__CPM_NO_G95D3 = 1; window.__CPM_NO_G95D4 = 1; window.__CPM_NO_ASSIST298 = 1; } if (se) window.__CPM_G95_SENZAESITO = 1; if (!sessionStorage.getItem('__g95')) { for (const k of Object.keys(s)) localStorage.setItem(k, s[k]); sessionStorage.setItem('__g95', '1'); } }, [ls, rosso, REALWAIT, senza]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(([s, re]) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 're', re, tickMs: 150 }), [sd, pol === 'drib' ? RE_DRIB : RE_PASS]);
  const hls = []; let cur = null; const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 480000) {
    const st = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const inc = !!document.querySelector('[data-cpm="incorso94"]');
      const res = (window.__CPM_RES218 || []).length; const txt = ph === 'hl_result' ? document.body.innerText.slice(0, 900) : ''; return { ph, inc, res, txt }; }).catch(() => null);
    if (!st) break; ph = st.ph;
    if (ph === 'ended' || ph === 'ceremony') break;
    if (ph === 'hl_result' && !cur) {
      cur = { t: Date.now(), rev: null, n: st.res, inc0: st.inc };
      cur.st = await page.evaluate(() => { try { const s = window.__CPM_STATE(); return { act: s.act, ball: s.ball && { x: s.ball.x, y: s.ball.y }, hero: s.hero && { x: s.hero.x, y: s.hero.y } }; } catch (e) { return null; } }).catch(() => null);
    }
    if (ph === 'hl_result' && cur && cur.rev == null && !st.inc && /Continua/.test(st.txt)) {
      cur.rev = Date.now() - cur.t; cur.rv = await page.evaluate(() => (window.__CPM_REV95 || []).slice(-1)[0] || null).catch(() => null); cur.txt = st.txt.split('\n').slice(0, 30).join(' / ');
      cur.d3 = await page.evaluate(() => { try { const s = window.__CPM_STATE(); const gk = s.players.find(p => p.team === 'away' && p.gk); const opp = s.players.filter(p => p.team === 'away' && !p.gk);
        const dh = Math.min(...opp.map(p => Math.hypot(p.x - s.hero.x, p.y - s.hero.y))); return { gk: gk && { x: gk.x, y: gk.y }, ball: { x: s.ball.x, y: s.ball.y, h: s.ball.worldY }, hero: { x: s.hero.x, y: s.hero.y }, dHeroOpp: +dh.toFixed(2), gkBall: gk ? +Math.hypot(gk.x - s.ball.x, gk.y - s.ball.y).toFixed(1) : null }; } catch (e) { return null; } }).catch(() => null);
    }
    if (ph === 'hl_result' && cur && (cur.rev == null || Date.now() - cur.t - cur.rev < 1500)) { const dd = await page.evaluate(() => { try { const s = window.__CPM_STATE(); const opp = s.players.filter(p => p.team === 'away' && !p.gk); const gk = s.players.find(p => p.team === 'away' && p.gk); return { d: Math.min(...opp.map(p => Math.hypot(p.x - s.hero.x, p.y - s.hero.y))), gb: gk ? Math.hypot(gk.x - s.ball.x, gk.y - s.ball.y) : 99 }; } catch (e) { return null; } }).catch(() => null);
      if (dd) { if (cur.rev == null) cur.minDHO = Math.min(cur.minDHO == null ? 99 : cur.minDHO, dd.d); cur.minGB = Math.min(cur.minGB == null ? 99 : cur.minGB, dd.gb); } }
    if (ph !== 'hl_result' && cur) { cur.durata = Date.now() - cur.t; hls.push(cur); cur = null; }
    await sleep(120);
  }
  const R = await page.evaluate(() => window.__CPM_RES218 || []).catch(() => []);
  const tab = await page.evaluate(() => { try { return window.__CPM_SCORE ? window.__CPM_SCORE() : null; } catch (e) { return null; } }).catch(() => null);
  await ctx.close();
  hls.forEach(h => { h.r = R[h.n] || null; });
  return { hls, R, ph, tab };
}
for (const arm of ARMI) { const rosso = arm === 'rosso';
  const T = { hl: 0, pass: 0, pasOk: 0, pasGiud: 0, golComp: 0, assistTab: 0, drib: 0, dribOk: 0, d4: 0, d3giud: 0, difetti: [], righe: [], esitiPass: {}, esitiDrib: {} };
  const lavori = []; for (const sk of SAVES) for (const sd of SEMI) for (const pol of POLITICHE) lavori.push({ sk, sd, pol });
  if (!process.env.CPM_NO_SENZA) lavori.push({ sk: 's12', sd: SEMI[0], pol: 'pass', senza: 1 });/* rete di sicurezza D4: scena che non dichiara mai l'esito */
  const fatti = new Array(lavori.length); let prossimo = 0;
  await Promise.all(Array.from({ length: Math.min(PAR, lavori.length) }, async () => { while (prossimo < lavori.length) { const i = prossimo++; const L = lavori[i];
    try { fatti[i] = await gioca(L.sk, L.sd, rosso, L.pol, L.senza); } catch (e) { fatti[i] = { hls: [], ph: 'errore ' + String(e).slice(0, 80), tab: null }; } } }));
  for (let i = 0; i < lavori.length; i++) { const { sk, sd, pol, senza } = lavori[i]; const M = fatti[i];
    for (const h of M.hls) { T.hl++; const r = h.r; const lab = r ? r.label : '?'; const tag = sk + '/' + sd + ' «' + String(lab).slice(0, 34) + '»';
      if (h.rev != null && h.durata - h.rev < 1200) { T.d4++; T.difetti.push('D4 ' + tag + ': esito a schermo solo ' + (h.durata - h.rev) + ' ms prima della chiusura'); }
      if (h.rev == null) { T.d4++; T.difetti.push('D4 ' + tag + ': esito mai mostrato in ' + h.durata + ' ms (solo «LA GIOCATA»)'); }
      if (!r) continue;
      const ovl = String(r.ovl || ''); const g = r.g137;
      if (isPass(lab)) { T.pass++; const k = (g ? g.esito : 'nog') + '/' + r.key; T.esitiPass[k] = (T.esitiPass[k] | 0) + 1;
        const arr = g ? g.esito !== 'intercettato' : (r.ok || r.key === 'chance');
        T.pasGiud++; if (arr) T.pasOk++;
        if (g && g.esito !== 'intercettato') {
          if (!r.ok || !/^(assist|chance|goal)$/.test(r.key)) T.difetti.push('D1 ' + tag + ': passaggio arrivato ma chiave ' + r.key + ' ok=' + r.ok);
          if (_PERSO.test(ovl) && !/compagno|spreca|para|fuori|palo|traversa|mura/i.test(ovl)) T.difetti.push('D1 ' + tag + ': passaggio arrivato raccontato perso «' + ovl + '»');
          if (/intercept|dispos/.test(String(r.outKind || ''))) T.difetti.push('D1 ' + tag + ': 3D intercetta un passaggio arrivato (' + r.outKind + ')');
        }
        if (g && g.ok) { T.golComp++; const ass = (r.ev || []).some(e => /^gol/.test(e)) && r.key === 'assist'; if (ass) T.assistTab++; else T.difetti.push('D1 ' + tag + ': gol del compagno senza assist (chiave ' + r.key + ')'); }
        if (!g && r.rew === 'assist') T.difetti.push('D1 ' + tag + ': passaggio non giocato dal motore (giocaScena assente, tipo ' + r.tipo + ')');
      }
      if (isDrib(lab)) { T.drib++; const k = (h.st && h.st.act ? h.st.act.t : '?') + '/' + r.key + '/' + (r.outKind || '-'); T.esitiDrib[k] = (T.esitiDrib[k] | 0) + 1; if (r.ok) T.dribOk++;
        if (r.tipo !== 'dribble') T.difetti.push('D2 ' + tag + ': dribbling giocato come «' + r.tipo + '»');
        if (g && g.fam !== 'dribbling') T.difetti.push('D2 ' + tag + ': il motore lo gioca come ' + g.fam);
        if (/tiro|para|fuori di poco|specchio|intercett/i.test(ovl)) T.difetti.push('D2 ' + tag + ': esito «' + ovl + '» non da dribbling');
      }
      if (h.rv && h.rv.via === 'riserva' && h.rv.busy) T.difetti.push('D3 ' + tag + ': esito «' + ovl + '» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione');
      if (/parat|portiere|respint|dice di no|centrale/i.test(ovl) && h.minGB != null) { T.d3giud++;
        if (h.minGB > 6) T.difetti.push('D3 ' + tag + ': «' + ovl + '» ma il pallone non arriva mai al portiere entro 1,5 s dall\'esito (minimo ' + h.minGB.toFixed(1) + ')');
      }
      if (isFallo(lab)) { T.fallo = (T.fallo | 0) + 1; if ((g && g.fam === 'assist') || /assist|compagno|intercett|servit/i.test(ovl)) T.difetti.push('D1 ' + tag + ': fallo cercato giocato/raccontato come passaggio «' + ovl + '» (motore ' + (g ? g.fam : '-') + ')'); }
      T.righe.push(tag + ' tipo=' + r.tipo + ' 3D=' + (h.st && h.st.act ? h.st.act.t : '-') + ' g=' + (g ? g.fam + ':' + g.esito : '-') + ' key=' + r.key + ' ok=' + r.ok + ' kind=' + (r.outKind || '-') + ' rev=' + h.rev + ' dur=' + h.durata + ' «' + ovl + '»' + (h.d3 ? ' gk-palla=' + h.d3.gkBall + ' eroe-dif=' + h.d3.dHeroOpp + ' palla-eroe=' + (h.d3.ball ? Math.hypot(h.d3.ball.x - h.d3.hero.x, h.d3.ball.y - h.d3.hero.y).toFixed(1) : '-') : '') + ' minGB=' + (h.minGB != null ? h.minGB.toFixed(1) : '-') + ' minDHO=' + (h.minDHO != null ? h.minDHO.toFixed(2) : '-') + ' via=' + (h.rv ? h.rv.via + (h.rv.busy ? '+occupata' : '') : '-'));
    }
    console.log(arm + ' ' + sk + ' seme ' + sd + ' ' + pol + (senza ? ' (scena senza esito)' : '') + ' fine ' + M.ph + ' highlight ' + M.hls.length + ' tabellone ' + JSON.stringify(M.tab));
  }
  esito[arm] = T; const pc = (a, n) => n ? (100 * a / n).toFixed(1) + '%' : '-';
  console.log(arm.toUpperCase() + ' highlight ' + T.hl + ' · D4 senza esito ' + T.d4 + ' · passaggi ' + T.pass + ' arrivati ' + pc(T.pasOk, T.pasGiud) + ' gol compagno ' + T.golComp + ' assist ' + T.assistTab + ' esiti ' + JSON.stringify(T.esitiPass) + ' · finte ' + T.drib + ' riuscite ' + pc(T.dribOk, T.drib) + ' ' + JSON.stringify(T.esitiDrib) + ' · falli cercati ' + (T.fallo | 0) + ' · parate giudicate ' + T.d3giud + ' · difetti ' + T.difetti.length);
  if (process.env.CPM_RIGHE) T.righe.forEach(x => console.log('    ' + x));
  T.difetti.slice(0, 14).forEach(x => console.log('  · ' + x));
}
await b.close(); srv.close();
if (process.env.CPM_MISURA) process.exit(0);
const g = [], V = esito.verde, R = esito.rosso;
if (V) {
  if (V.pass < 12) g.push('verde: solo ' + V.pass + ' passaggi giudicati (pavimento 12)');
  if (V.drib < 4) g.push('verde: solo ' + V.drib + ' finte giudicate (pavimento 4)');
  if (V.difetti.length) g.push('verde: ' + V.difetti.length + ' difetti');
  if (!(V.pasOk / Math.max(1, V.pasGiud) >= 0.70)) g.push('verde: passaggi arrivati ' + (100 * V.pasOk / Math.max(1, V.pasGiud)).toFixed(1) + '% (pavimento 70%)');
}
if (R) { for (const d of ['D1', 'D2', 'D3', 'D4']) if (!R.difetti.some(x => x.startsWith(d))) g.push('rosso: ' + d + ' non si vede'); }
if (g.length) { console.log('❌ highlight-95'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(V ? '✅ highlight-95 verde' + (R ? ' (e il rosso si vede)' : ' (braccio rosso non eseguito)') : '✅ highlight-95: il rosso si vede (braccio verde non eseguito)');
