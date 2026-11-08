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
   MISURATO (giro 95, 3 salvataggi x 3 semi x politiche passaggio/dribbling + una partita «scena senza esito»):
     VERDE 118 highlight · passaggi arrivati 94,3% (35) · gol del compagno = assist 9/9 · finte 9 giocate da dribbling (riuscite 66,7%,
           mai «tiro» ne' «intercettato») · D4 0 · difetti 0 · 16 scene non giudicabili per la guardia di parete (headless lento);
     ROSSO 110 highlight · 238 difetti: D1 (passaggio arrivato raccontato intercettato), D2 (finta giocata da passaggio, riuscita 11%),
           D3 (esito rivelato dalla riserva mentre il 3D mostrava ancora la conclusione), D4 (esito mai a schermo o per 0,5 s).
   ⚠️ Macchina carica = fotogrammi lenti = scene oltre la guardia di parete (30 s): con CPM_PAR=4 il verde diventava cieco su D3; si usa 3.
   Uso: node highlight-95.mjs   (CPM_MISURA=1 stampa e non giudica; CPM_SEMI=1,2; CPM_SALVA=s1,s5,s12; CPM_RIGHE=1; CPM_PAR=3). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const SEMI = (process.env.CPM_SEMI || '1234,2021,7').split(',').map(Number);
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
  if (process.env.CPM_FLAG) await page.addInitScript(f => { f.split(',').forEach(k => { if (k) window[k] = 1; }); }, process.env.CPM_FLAG);/* [giro 99] interruttori extra per isolare la causa di un difetto (es. CPM_FLAG=__CPM_NO_G99RIC) */
  await page.addInitScript(([s, r, rw, se]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PARETE103 = 150000;/* [giro 103] riserva e chiusura contano i secondi DI SCENA anche a macchina carica: meno scene «non giudicabili» per la guardia di parete */ if (rw) window.__CPM_REALWAIT = 1; if (r) { window.__CPM_NO_G95D1 = 1; window.__CPM_NO_G95D2 = 1; window.__CPM_NO_G95D3 = 1; window.__CPM_NO_G95D4 = 1; window.__CPM_NO_ASSIST298 = 1; } if (se) window.__CPM_G95_SENZAESITO = 1; if (!sessionStorage.getItem('__g95')) { for (const k of Object.keys(s)) localStorage.setItem(k, s[k]); sessionStorage.setItem('__g95', '1'); } }, [ls, rosso, REALWAIT, senza]);
  if (process.env.CPM_G103DIAG) await page.addInitScript(() => {/* [giro 103] registratore della scena: per ogni hl_result, orologio DI SCENA all'ingresso, ultimo fotogramma occupato, rivelazione */
    const H = window.__H103 = []; let cur = null; const f = () => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const c = window.__CPM_CB95 ? window.__CPM_CB95() : null;
      if (ph === 'hl_result' && c && typeof c.ck === 'number') { if (!cur) { cur = { ck0: c.ck, occ: null, rev: null, n: (window.__CPM_REV95 || []).length, fr: 0, t0: performance.now() }; H.push(cur); }
        cur.fr++; cur.ck = c.ck; if (c.on && (c.tl || c.arc)) cur.occ = c.ck; if (cur.rev == null && (window.__CPM_REV95 || []).length > cur.n) { cur.rev = c.ck; cur.revMs = performance.now() - cur.t0; } } else cur = null; } catch (e) {} requestAnimationFrame(f); }; requestAnimationFrame(f); });
  if (process.env.CPM_G104FAIL) await page.addInitScript(() => {/* [giro 104] solo sonda: ogni highlight forzato a fallire (__CPM_FORCE_OUTCOME, gia' esistente) -> ogni uno-due diventa un intercetto, il caso D3 della catena 178 */
    setInterval(() => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); if ((ph === 'hl_choose' || ph === 'hl_move') && !window.__CPM_FORCE_OUTCOME) window.__CPM_FORCE_OUTCOME = 'fail'; } catch (e) {} }, 60); });
  if (+process.env.CPM_CPU > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +process.env.CPM_CPU }); }/* [giro 103] carico riproducibile per le misure (CDP) */
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
    const st = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); const inc = !!document.querySelector('[data-cpm="incorso94"]'); const rv = window.__CPM_REVAT95 || 0; const ie = document.querySelector('[data-cpm="incorso94"]'); const inct = ie ? ie.textContent : '';
      const res = (window.__CPM_RES218 || []).length; const txt = ph === 'hl_result' ? document.body.innerText.slice(0, 900) : ''; const sc = typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null; return { ph, inc, res, txt, rv, inct, sc }; }).catch(() => null);
    if (!st) break; ph = st.ph;
    if (ph === 'ended' || ph === 'ceremony') break;
    if (ph === 'hl_result' && !cur) {
      cur = { t: Date.now(), rev: null, n: st.res - 1, inc0: st.inc, inct: st.inct };/* il testimone della scena e' gia' scritto quando la fase diventa hl_result: e' l'ultimo */
      cur.st = await page.evaluate(() => { try { const s = window.__CPM_STATE(); return { act: s.act, ball: s.ball && { x: s.ball.x, y: s.ball.y }, hero: s.hero && { x: s.hero.x, y: s.hero.y } }; } catch (e) { return null; } }).catch(() => null);
    }
    if (ph === 'hl_result' && cur && cur.rev == null && st.rv > 0 && Date.now() - cur.t > 300) {/* l'esito e' a schermo quando il gioco lo dice (resultReveal), non quando il DOM sembra pronto */
      cur.rev = Date.now() - cur.t; cur.revSc = st.sc; cur.rv = await page.evaluate(() => (window.__CPM_REV95 || []).slice(-1)[0] || null).catch(() => null); cur.txt = st.txt.split('\n').slice(0, 30).join(' / ');
      cur.d3 = await page.evaluate(() => { try { const s = window.__CPM_STATE(); const gk = s.players.find(p => p.team === 'away' && p.gk); const opp = s.players.filter(p => p.team === 'away' && !p.gk);
        const dh = Math.min(...opp.map(p => Math.hypot(p.x - s.hero.x, p.y - s.hero.y))); return { gk: gk && { x: gk.x, y: gk.y }, ball: { x: s.ball.x, y: s.ball.y, h: s.ball.worldY }, hero: { x: s.hero.x, y: s.hero.y }, dHeroOpp: +dh.toFixed(2), gkBall: gk ? +Math.hypot(gk.x - s.ball.x, gk.y - s.ball.y).toFixed(1) : null }; } catch (e) { return null; } }).catch(() => null);
    }
    /* [giro 103] «entro 1,5 s dall'esito» in secondi DI SCENA (__CPM_SCENET), non di parete: a 1-2 fps (catena carica) 1,5 s di parete sono
       meno di un decimo di scena e il pallone del tiro del compagno, partito all'esito, veniva giudicato «mai arrivato al portiere» (47,0 e
       33,6 su ROTH s5/2021 nelle corse finali, 3,4 a carico normale). Soglia e finestra invariate; a 20+ fps parete = scena. */
    if (ph === 'hl_result' && cur && (cur.rev == null || ((cur.revSc != null && st.sc != null) ? (st.sc - cur.revSc < 1.5) : (Date.now() - cur.t - cur.rev < 1500)))) {/* il portiere va guardato FITTO: la parata dura mezzo secondo */
      for (let k = 0; k < 4; k++) { const gb = await page.evaluate(() => window.__CPM_GKB95 ? window.__CPM_GKB95() : null).catch(() => null); if (gb != null) cur.minGB = Math.min(cur.minGB == null ? 99 : cur.minGB, gb); await sleep(40); }
      /* [giro 117] + il minimo PER FOTOGRAMMA della scena (testimone __CPM_GKMIN117, src/12, solo __CPM_REC): l'interrogazione ogni ~0,5 s
         a macchina carica perdeva la parata ravvicinata (passaggio a 2,4 u, pallone respinto fermo a 6,7 — s1/2021 «Volée di collo
         potente»). Soglia (6) e finestra invariate: il testimone e' letto solo dentro la stessa finestra. */
      { const gm = await page.evaluate(() => window.__CPM_GKMIN117 ? window.__CPM_GKMIN117.min : null).catch(() => null); if (gm != null) cur.minGB = Math.min(cur.minGB == null ? 99 : cur.minGB, gm); } }
    if (ph !== 'hl_result' && cur) { cur.durata = Date.now() - cur.t; hls.push(cur); cur = null; }
    await sleep(120);
  }
  const R = await page.evaluate(() => window.__CPM_RES218 || []).catch(() => []);
  const VIS = await page.evaluate(() => window.__CPM_VIS95 || []).catch(() => []);
  const REV = await page.evaluate(() => window.__CPM_REV95 || []).catch(() => []);
  const G104 = await page.evaluate(() => ({ x: (window.__CPM_G104X || []).length, d: (window.__CPM_G104D || []).length, xs: (window.__CPM_G104X || []).slice(0, 3), ds: (window.__CPM_G104D || []).slice(0, 3) })).catch(() => null);
  if (G104 && (G104.x || G104.d)) console.log(`  [g104] ${saveKey}/${sd} ${pol}: riserva su riquadro altrui ${G104.x} ${JSON.stringify(G104.xs)} · via dichiarata prima del pavimento ${G104.d} ${JSON.stringify(G104.ds)}`);/* [giro 104] testimoni del gioco *//* [giro 104] tutte le rivelazioni della partita, per abbinarle alla scena per indice (hl) e non per ordine di lettura */
  if (process.env.CPM_G103DIAG) { const H = await page.evaluate(() => window.__H103 || []).catch(() => []); for (const x of H) if (x.occ != null) console.log(`  [g103] ${saveKey}/${sd} ${pol} occupata ${(x.occ - x.ck0).toFixed(2)} s di scena · esito a ${x.rev != null ? (x.rev - x.ck0).toFixed(2) : '-'} s (${x.revMs != null ? Math.round(x.revMs) : '-'} ms) · fotogrammi ${x.fr}`); }
  const tab = await page.evaluate(() => { try { return window.__CPM_SCORE ? window.__CPM_SCORE() : null; } catch (e) { return null; } }).catch(() => null);
  await ctx.close();
  hls.forEach((h, i) => { h.vis = VIS[i] || null; const r = R[h.n] || null; const core = r ? String(r.label || '').replace(/^\S+\s/, '').slice(0, 14) : ''; h.r = (r && (!h.inct || h.inct.indexOf(core) >= 0)) ? r : null; if (r && !h.r) h.scartato = 1; });/* l'abbinamento scena↔testimone si verifica sul nome della giocata mostrato «in corso» */
  return { hls, R, ph, tab, REV };
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
      if (h.vis) { if (!h.vis.rev) { T.d4++; T.difetti.push('D4 ' + tag + ': esito mai mostrato (solo «LA GIOCATA»)'); } else if (h.vis.out - h.vis.rev < 1200) { T.d4++; T.difetti.push('D4 ' + tag + ': esito a schermo solo ' + (h.vis.out - h.vis.rev) + ' ms prima della chiusura'); } }
      else if (h.rev == null) { T.d4++; T.difetti.push('D4 ' + tag + ': esito mai mostrato in ' + h.durata + ' ms (solo «LA GIOCATA»)'); }/* orologio della pagina (testimone __CPM_VIS95); la lettura della sonda e' solo il ripiego */
      /* [giro 104] la rivelazione si abbina alla scena per INDICE (hl, scritto dal gioco nel testimone), non come «l'ultima del registro al
         momento in cui la sonda vede l'esito»: sotto carico la sonda legge a intervalli di secondi e il registro puo' gia' avere la voce
         di un'altra scena (o non ancora quella giusta). Le letture che non corrispondono si contano e si dichiarano. */
      if (r) { const rvH = (M.REV || []).find(x => x && x.hl === r.hl) || null; if (h.rv && (!rvH || rvH.t !== h.rv.t)) { T.stantio = (T.stantio | 0) + 1; T.stantiDett = (T.stantiDett || []).concat([`${sk}/${sd} hl${r.hl}: letta hl${h.rv.hl} via ${h.rv.via}${h.rv.busy ? '+occupata' : ''} · giusta ${rvH ? 'hl' + rvH.hl + ' via ' + rvH.via + (rvH.busy ? '+occupata' : '') : 'nessuna'}`]); } if (rvH || h.rv) h.rv = rvH; }
      const _cap = h.rv && h.rv.cap === 'parete'; if (_cap) T.nonGiud = (T.nonGiud | 0) + 1;/* la riserva ha smesso per la guardia di parete: fotogrammi troppo lenti, D3 non giudicabile */
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
      if (!_cap && h.rv && h.rv.via === 'riserva' && h.rv.busy) T.difetti.push('D3 ' + tag + ': esito «' + ovl + '» rivelato dalla riserva mentre il 3D mostrava ancora la conclusione' + ' ' + JSON.stringify({ cap: h.rv.cap, c: h.rv.c103, rr: h.rv.rr103 }));/* [giro 104] la diagnosi si stampa SEMPRE: nella catena 178 il D3 e' comparso una volta senza dire cosa teneva occupata la scena */
      if (!_cap && /parat|parar|portiere|respint|dice di no|centrale/i.test(ovl) && h.minGB != null) { T.d3giud++;
        if (h.minGB > 6) T.difetti.push('D3 ' + tag + ': «' + ovl + '» ma il pallone non arriva mai al portiere entro 1,5 s dall\'esito (minimo ' + h.minGB.toFixed(1) + ')' + (process.env.CPM_D3DIAG ? ' ' + JSON.stringify({ tipo: r.tipo, kind: r.outKind || null, d3: h.d3 || null, st: h.st || null }) : ''));/* [giro 117] CPM_D3DIAG=1: dove stavano eroe, pallone e portiere */
      }
      if (isFallo(lab)) { T.fallo = (T.fallo | 0) + 1; if ((g && g.fam === 'assist') || /assist|compagno|intercett|servit/i.test(ovl)) T.difetti.push('D1 ' + tag + ': fallo cercato giocato/raccontato come passaggio «' + ovl + '» (motore ' + (g ? g.fam : '-') + ')'); }
      T.righe.push(tag + ' tipo=' + r.tipo + ' 3D=' + (h.st && h.st.act ? h.st.act.t : '-') + ' g=' + (g ? g.fam + ':' + g.esito : '-') + ' key=' + r.key + ' ok=' + r.ok + ' kind=' + (r.outKind || '-') + ' rev=' + h.rev + ' dur=' + h.durata + ' «' + ovl + '»' + (h.d3 ? ' gk-palla=' + h.d3.gkBall + ' eroe-dif=' + h.d3.dHeroOpp + ' palla-eroe=' + (h.d3.ball ? Math.hypot(h.d3.ball.x - h.d3.hero.x, h.d3.ball.y - h.d3.hero.y).toFixed(1) : '-') : '') + ' minGB=' + (h.minGB != null ? h.minGB.toFixed(1) : '-') + ' via=' + (h.rv ? h.rv.via + (h.rv.busy ? '+occupata' : '') + (h.rv.wpa ? '+tiroCompagno' : '') + ' hl' + h.rv.hl : '-'));
    }
    console.log(arm + ' ' + sk + ' seme ' + sd + ' ' + pol + (senza ? ' (scena senza esito)' : '') + ' fine ' + M.ph + ' highlight ' + M.hls.length + ' tabellone ' + JSON.stringify(M.tab));
  }
  esito[arm] = T; const pc = (a, n) => n ? (100 * a / n).toFixed(1) + '%' : '-';
  console.log(`  ${arm} rivelazioni lette da un'altra scena (abbinate per indice): ${T.stantio | 0}`); (T.stantiDett || []).slice(0, 6).forEach(x => console.log('    ~ ' + x));
  console.log(arm.toUpperCase() + ' highlight ' + T.hl + ' · D4 senza esito ' + T.d4 + ' · passaggi ' + T.pass + ' arrivati ' + pc(T.pasOk, T.pasGiud) + ' gol compagno ' + T.golComp + ' assist ' + T.assistTab + ' esiti ' + JSON.stringify(T.esitiPass) + ' · finte ' + T.drib + ' riuscite ' + pc(T.dribOk, T.drib) + ' ' + JSON.stringify(T.esitiDrib) + ' · falli cercati ' + (T.fallo | 0) + ' · parate giudicate ' + T.d3giud + ' · non giudicabili (guardia di parete) ' + (T.nonGiud | 0) + ' · difetti ' + T.difetti.length);
  if (process.env.CPM_RIGHE) T.righe.forEach(x => console.log('    ' + x));
  T.difetti.slice(0, 14).forEach(x => console.log('  · ' + x));
}
await b.close(); srv.close();
if (process.env.CPM_MISURA) process.exit(0);
const g = [], V = esito.verde, R = esito.rosso;
if (V) {
  if (V.pass < 12) g.push('verde: solo ' + V.pass + ' passaggi giudicati (pavimento 12)');
  if (V.drib < 4) g.push('verde: solo ' + V.drib + ' finte giudicate (pavimento 4)');
  if (V.difetti.length) g.push('verde: ' + V.difetti.length + ' difetti — ' + V.difetti.slice(0, 2).map(x => x.slice(0, 160)).join(' ‖ '));/* [giro 104] il verde dichiara QUALE difetto: prima la coda (le tre righe che il runner riporta) erano l'ultimo difetto ATTESO del braccio rosso, «❌» e «verde: 1 difetti» — nella catena 178-finale il «D3 Uno-due con LUZI» era del rosso, quello del verde non e' mai stato scritto */
  if ((V.nonGiud | 0) > 0.3 * V.hl) g.push('verde: cieco, ' + V.nonGiud + ' scene oltre la guardia di parete su ' + V.hl + ' (macchina troppo carica: ridurre CPM_PAR)');
  if (!(V.pasOk / Math.max(1, V.pasGiud) >= 0.70)) g.push('verde: passaggi arrivati ' + (100 * V.pasOk / Math.max(1, V.pasGiud)).toFixed(1) + '% (pavimento 70%)');
}
if (R) { for (const d of ['D1', 'D2', 'D3', 'D4']) if (!R.difetti.some(x => x.startsWith(d))) g.push('rosso: ' + d + ' non si vede'); }
if (g.length) { console.log('❌ highlight-95'); g.sort((a, b) => (/^verde: \d+ difetti/.test(a) ? 1 : 0) - (/^verde: \d+ difetti/.test(b) ? 1 : 0)).forEach(x => console.log('  · ' + x)); process.exit(1); }/* i difetti del verde per ultimi: sono quelli che restano nella coda */
console.log(V ? '✅ highlight-95 verde' + (R ? ' (e il rosso si vede)' : ' (braccio rosso non eseguito)') : '✅ highlight-95: il rosso si vede (braccio verde non eseguito)');
