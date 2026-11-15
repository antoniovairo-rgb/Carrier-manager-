#!/usr/bin/env node
/* [giro 213 · PO-475 «quando tocco un pulsante ci deve essere un'animazione tocco»] SONDA di misura (non giudica): per i tasti
   principali del gioco, su telefono emulato 375x667 (isMobile + hasTouch → pointer:coarse, tocco vero via CDP) e su PC 1366x768
   (mouse), misura con lib/tocco-213.mjs dopo quanti ms il tasto CAMBIA ASPETTO (riscontro), dopo quanti ms parte l'EFFETTO
   (cambio schermata o simile), il lavoro sincrono dentro i gestori (Event Timing), se compare la rotellina, se il layout si muove
   e se l'area di tocco resta la stessa mentre il tasto e' premuto.
   Segnala: ritardo > 100 ms senza riscontro · effetto > 400 ms (candidato alla rotellina).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node misura-213.mjs [--rosso]   (CPM_DOVE=tel,pc · CPM_OUT=<json>)
   --rosso accende window.__CPM_NO_G213 (il gioco come prima del giro 213). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166, gioca166 } from './lib/partita-166.mjs';
import { INIT } from './lib/banco-g0.mjs';
import { misura } from './lib/tocco-213.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROSSO = process.argv.includes('--rosso');
const DOVE = (process.env.CPM_DOVE || 'tel,pc').split(',');
const OUT = process.env.CPM_OUT || '';
const GR = (process.env.CPM_GRUPPI || 'casa,vai,simula,doppio,partita,rassegna,offerte').split(',');
const RIGHE = [];

const perTesto = (rx, dentro = '', fl = '') => `const r=new RegExp(${JSON.stringify(rx)},${JSON.stringify(fl)});return [...document.querySelectorAll(${JSON.stringify((dentro ? dentro + ' ' : '') + 'button')})].filter(b=>b.offsetParent&&!b.disabled&&r.test((b.textContent||'').trim())).pop()||null;`;
const perSel = (s) => `const L=[...document.querySelectorAll(${JSON.stringify(s)})].filter(b=>b.offsetParent!==null||getComputedStyle(b).position==='fixed');return L[0]||null;`;
const TESTO = `return !el.isConnected || document.body.innerText!==window.__T213.txt0;`;
const FASE = (f) => `try{return window.__CPM_PHASE&&window.__CPM_PHASE()!==${JSON.stringify(f)};}catch(e){return false;}`;
const fase = (p) => p.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } }).catch(() => null);

async function registra(dove, nome, page, cdp, mobile, o) {
  const r = await misura(page, cdp, mobile, o);
  const riga = r ? { dove, nome, testo: r.testo, w: r.w, h: r.h, riscontro: r.riscontro == null ? null : Math.round(r.riscontro), effetto: r.effetto == null ? null : Math.round(r.effetto),
    rotella: r.rotella == null ? null : Math.round(r.rotella), lavoro: r.lavoro, ingresso: r.ritardoIngresso, durFot: r.durFot, fotEff: r.fotEff, premuto: r.premuto, traccia: r.traccia, sostituito: r.sostituito, clickElab: r.clickElab, lay0: r.lay0, layPremuto: r.layPremuto, fotRisc: r.fotRisc, dopoGestore: r.dopoGestore, eventi: r.eventi, layoutMosso: r.layoutMosso, area: r.area, areaSint: r.areaSint, punti: r.punti, click: r.click, giu: r.giu } : { dove, nome, assente: true };
  if (riga.assente) riga.flag = 'TASTO NON TROVATO';
  else { const f = []; const rit = riga.effetto == null ? 9999 : riga.effetto;
    if (riga.riscontro == null && rit > 100) f.push('ritardo>100 SENZA riscontro'); else if (riga.riscontro != null && riga.riscontro > 50) f.push('riscontro>50');
    if (riga.effetto != null && riga.effetto > 400) f.push('effetto>400 (rotellina)'); if (riga.layoutMosso) f.push('layout mosso'); if (riga.area && riga.area.some(x => !x)) f.push('area ristretta'); else if (!riga.area && riga.areaSint && riga.areaSint.punti.some(x => !x)) f.push('area ristretta (prova sintetica)'); riga.flag = f.join(' · '); }
  RIGHE.push(riga); console.log('  ' + JSON.stringify(riga)); return riga;
}

for (const dove of DOVE) {
  const mobile = dove === 'tel'; const vp = mobile ? { width: 375, height: 667 } : { width: 1366, height: 768 };
  const RIDOTTO = process.env.CPM_RIDOTTO === '1';
  const init = ROSSO ? { __CPM_NO_G213: 1 } : {};
  console.log(`\n== ${dove} ${vp.width}x${vp.height} ${ROSSO ? '[ROSSO __CPM_NO_G213]' : ''}`);
  /* 1) casa: schede, Vai al prossimo momento, Vivi la settimana */
  if (GR.includes('casa')) { const A = await apriCarriera166({ vp, mobile, init }); const p = A.page; if (RIDOTTO) await p.emulateMedia({ reducedMotion: 'reduce' }); const cdp = mobile ? await A.ctx.newCDPSession(p) : null;
    try {
      await registra(dove, 'scheda Stagione', p, cdp, mobile, { trova: perTesto('^Stagione$'), effetto: TESTO });
      await registra(dove, 'scheda Home', p, cdp, mobile, { trova: perTesto('^Home$'), effetto: TESTO });
      await registra(dove, 'Simula (casa)', p, cdp, mobile, { trova: perSel('[data-cpm="simula-v2"]'), effetto: TESTO });
      await registra(dove, 'Vivi la Settimana', p, cdp, mobile, { trova: perSel('[data-cpm="avanza23"]'), effetto: TESTO });
    } catch (e) { console.log('  ! casa: ' + e.message); }
    await A.b.close(); A.srv.close(); }
  if (GR.includes('vai')) { const A = await apriCarriera166({ vp, mobile, init }); const p = A.page; const cdp = mobile ? await A.ctx.newCDPSession(p) : null;
    try { await registra(dove, 'Vai al prossimo momento', p, cdp, mobile, { trova: perSel('[data-cpm="salta163-tasto"]'), effetto: TESTO });
      await sleep(400); await registra(dove, 'Vai (conferma corsa)', p, cdp, mobile, { trova: perSel('[data-cpm="salta163-vai"]'), effetto: TESTO, finestra: 6000 });
    } catch (e) { console.log('  ! vai: ' + e.message); }
    await A.b.close(); A.srv.close(); }
  /* 2) prompt della partita: Simula */
  if (GR.includes('simula')) { const A = await apriCarriera166({ vp, mobile, init }); const p = A.page; const cdp = mobile ? await A.ctx.newCDPSession(p) : null;
    try { await apriPrompt166(p);
      await registra(dove, 'Simula (prompt)', p, cdp, mobile, { trova: perTesto('^Simula', '[data-cpm="partita23"]'), effetto: TESTO, finestra: 6000 });
    } catch (e) { console.log('  ! simula: ' + e.message); }
    await A.b.close(); A.srv.close(); }
  /* 2b) doppio tocco rapido su Simula: le partite salvate devono crescere di UNA */
  if (GR.includes('doppio')) { const A = await apriCarriera166({ vp, mobile, init }); const p = A.page; const cdp = mobile ? await A.ctx.newCDPSession(p) : null;
    try { await apriPrompt166(p); const st = () => p.evaluate(() => ((JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {}).matchHistory || []).length);
      const n0 = await st(); const r = await registra(dove, 'Simula doppio tocco', p, cdp, mobile, { trova: perTesto('^Simula', '[data-cpm="partita23"]'), effetto: TESTO, finestra: 4000, doppio: true, pausa: +(process.env.CPM_DP_PAUSA || 90), tieni: +(process.env.CPM_DP_TIENI || 50) });
      let n1 = n0; for (let i = 0; i < 16; i++) { await sleep(500); n1 = await st(); } r.partite = n1 - n0; r.assorbiti = await p.evaluate(() => window.__CPM_DOPPIO213 | 0);
      console.log(`  doppio tocco: partite salvate +${r.partite} · tocchi assorbiti ${r.assorbiti} · click arrivati ${r.click}`);
    } catch (e) { console.log('  ! doppio: ' + e.message); }
    await A.b.close(); A.srv.close(); }
  /* 3) prompt → Gioca → partita: avanti del pre-partita, Salta ingresso, pad, giocata, Salta festeggiamenti, rassegna */
  if (GR.includes('partita')) { const A = await apriCarriera166({ vp, mobile, init }); const p = A.page; const cdp = mobile ? await A.ctx.newCDPSession(p) : null;
    try { await apriPrompt166(p);
      await registra(dove, 'Gioca la partita', p, cdp, mobile, { trova: perTesto('^Gioca la partita', '[data-cpm="partita23"]'), effetto: `try{return !!(window.__CPM_PHASE&&window.__CPM_PHASE());}catch(e){return false;}`, finestra: 6000 });
      for (let i = 0; i < 8; i++) { const f = await fase(p); if (f && f !== 'matchday' && f !== 'formations') break;
        if (f === 'matchday' || f === 'formations') { const r = await registra(dove, 'Avanti pre-partita (' + f + ')', p, cdp, mobile, { trova: perTesto(f === 'matchday' ? '^Vedi le formazioni' : '^(Ingresso in campo|Avanti|Continua|In campo|Entra|Inizia|Gioca|Calcio|Salta e gioca|Scendi)', '', 'i'), effetto: FASE(f) }); if (r.assente) { const t = await p.evaluate(() => [...document.querySelectorAll('button')].filter(x => x.offsetParent).map(x => (x.textContent || '').trim().slice(0, 25))); console.log('  tasti ' + f + ': ' + JSON.stringify(t)); await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /Salta e gioca|Gioca|Avanti|Continua/i.test(x.textContent || '')); if (b) b.click(); }); } }
        else await p.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /^(Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok)/i.test((x.textContent || '').trim())); if (B.length) B[B.length - 1].click(); });
        await sleep(500); }
      for (let i = 0; i < 40 && (await fase(p)) !== 'walkout'; i++) await sleep(250);
      if ((await fase(p)) === 'walkout') { await sleep(1500); await registra(dove, 'Salta ingresso', p, cdp, mobile, { trova: perSel('[data-cpm="salta-ingresso-v2"]'), effetto: FASE('walkout'), finestra: 5000 }); }
      /* highlight: il pad si misura in hl_move (la prima volta che compare), la giocata in hl_choose (la prima volta); il resto si
         lascia scorrere: in hl_move dopo la misura si preme il tasto che chiude il movimento, in hl_choose si sceglie la prima riga */
      let padFatto = false, giocataFatta = false; const tH = Date.now();
      while (Date.now() - tH < 150000 && !(padFatto && giocataFatta)) {
        const f = await fase(p); if (f === 'ended' || f == null) break;
        if (f === 'hl_move') { await sleep(700);
          if (!padFatto && await p.evaluate(() => !!document.querySelector('[data-cpm="dpad"] button'))) { padFatto = true;
            await registra(dove, 'pad (freccia)', p, cdp, mobile, { trova: perSel('[data-cpm="dpad"] button'), effetto: TESTO, finestra: 1500 }); }
          else await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(x => x.offsetParent && !x.closest('[data-cpm="dpad"]')).find(x => /Conferma|Pronto|Scegli|Fatto|Avanti|Vai|Ok/i.test(x.textContent || '')); if (b) b.click(); });
        } else if (f === 'hl_choose') { await sleep(1200);
          if (!giocataFatta) { giocataFatta = true; await registra(dove, 'giocata highlight', p, cdp, mobile, { trova: `return [...document.querySelectorAll('[data-cpm="scelte-righe"] button')].filter(b=>!b.disabled&&b.offsetParent)[0]||null;`, effetto: FASE('hl_choose') }); }
          else await p.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="scelte-righe"] button')].filter(b => !b.disabled && b.offsetParent)[0]; if (b) b.click(); });
          for (let i = 0; i < 40 && (await fase(p)) === 'hl_choose'; i++) await sleep(250);
        } else if (f === 'hl_intro') { await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /Avanti|Continua|Vai/.test(x.textContent || '')); if (b) b.click(); }); await sleep(300); }
        else await sleep(300);
      }
      if (!padFatto) console.log('  ! pad non comparso'); if (!giocataFatta) console.log('  ! giocata non comparsa');
    } catch (e) { console.log('  ! partita: ' + e.message); }
    await A.b.close(); A.srv.close(); }
  /* 3b) partita a soli highlight col pilota (come rassegna-202), poi festa forzata: Salta festeggiamenti e rassegna */
  if (GR.includes('rassegna')) { const A = await apriCarriera166({ vp, mobile, init }); const p = A.page; const cdp = mobile ? await A.ctx.newCDPSession(p) : null;
    try { await apriPrompt166(p); const g = await gioca166(p, 'solo', { seme: 7304 }); await sleep(1200); console.log('  partita finita ' + g.finita);
      await p.evaluate(() => window.__CPM_FORCE_CEREMONY && window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI!', kind: 'league' })); await sleep(1500);
      await registra(dove, 'Salta festeggiamenti', p, cdp, mobile, { trova: perSel('[data-cpm="salta"]'), effetto: `try{return !el.isConnected||(window.__CPM_PHASE&&window.__CPM_PHASE()!=='ceremony');}catch(e){return !el.isConnected;}`, finestra: 6000 });
      await sleep(1200);
      await registra(dove, 'Avanti (rassegna)', p, cdp, mobile, { trova: perSel('[data-cpm="avanti200"]'), effetto: TESTO });
      await registra(dove, 'Salta (rassegna)', p, cdp, mobile, { trova: perSel('[data-cpm="salta200"]'), effetto: TESTO, finestra: 5000 });
    } catch (e) { console.log('  ! rassegna: ' + e.message); }
    await A.b.close(); A.srv.close(); }
  /* 4) offerte dei club (fine provini) */
  if (GR.includes('offerte')) { const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
    const ctx = await b.newContext(mobile ? { viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: vp });
    const p = await ctx.newPage(); await installCdnRoutes(p); const cdp = mobile ? await ctx.newCDPSession(p) : null;
    const TRIAL = { ph: 'offers', slot: 0, res: [{ goals: 2, assists: 1, rating: 7.4 }, { goals: 2, assists: 0, rating: 7.6 }, { goals: 3, assists: 1, rating: 8.1 }],
      p: { name: 'Tocco Probe', nation: 'Italia', avatarId: 0, ovr: 58, age: 16, proStatus: 'youth', archetype: 'finalizzatore', stats: { 'velocità': 60, tecnica: 58, fisico: 56, 'mentalità': 57, tiro: 62, passaggio: 56, dribbling: 60, posizionamento: 58 } } };
    await p.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: ROSSO ? ['__CPM_NO_G213'] : [], trial: TRIAL });
    try { await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 120000 });
      await p.waitForFunction(() => /Offerte ricevute/.test(document.body.innerText || ''), null, { timeout: 60000 }); await sleep(800);
      const t = await p.evaluate(() => [...document.querySelectorAll('button')].filter(x => x.offsetParent).map(x => (x.textContent || '').trim().slice(0, 30)));
      console.log('  tasti offerte: ' + JSON.stringify(t));
      await registra(dove, 'offerta (scegli club)', p, cdp, mobile, { trova: perTesto('Accetta|Firma|Scegli|Valuta|Dettagli|Vedi'), effetto: TESTO });
    } catch (e) { console.log('  ! offerte: ' + e.message); }
    await b.close(); srv.close(); }
}
console.log('\nRIEPILOGO (ms dal pointerdown)');
for (const r of RIGHE) console.log(`  ${r.dove.padEnd(3)} ${r.nome.padEnd(32)} riscontro ${String(r.riscontro).padStart(5)} · effetto ${String(r.effetto).padStart(5)} · lavoro ${String(r.lavoro).padStart(4)} · rotella ${String(r.rotella).padStart(5)}  ${r.flag || ''}`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify(RIGHE, null, 1));
