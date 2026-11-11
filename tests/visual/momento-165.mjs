#!/usr/bin/env node
/* [giro 165 · PO-364 opzione B] GUARDIANO momento-165 — «Vai al prossimo momento» da PROFESSIONISTA.
   Sul gioco vero (?cpmtest=1, percorsi veri della settimana) giudica:
   1. LA REGOLA DI POSTA (posta165, funzione pura): ex club · primo match dopo l'infortunio · 100ª presenza · a un gol dai 50 ·
      contratto in bilico · derby · scontro diretto in classifica · finale di stagione · coppa → etichetta; una partita
      qualunque di meta' classifica → null; stessa risposta due volte; il salvataggio non cambia.
   2. IL TASTO C'E' da professionista (412x915 e 1280x800), CHIEDE PRIMA (pannello, nulla cambia) e «Annulla» non cambia nulla.
   3. UNA STAGIONE INTERA (club di prestigio basso) col solo tasto: ogni gara simulata dal tasto era SENZA posta nell'istante
      (testimone __CPM_SALTA153_SIM); ogni fermata «partita» lascia il prompt aperto e la gara non giocata; ogni fermata
      «scelta da fare» lascia davanti il riquadro con almeno due scelte; almeno 8 fermate su partite con posta; la stagione
      arriva a W39 con 34 gare di lega, una per settimana, calendario tutto giocato, nessun errore di pagina.
   4. RINNOVO: con la card «Il contratto scade» la corsa si ferma «rinnovo», una volta per stagione.
   5. MERCATO: un'offerta durante la corsa la ferma.
   6. PRIMAVERA INVARIATA: in Primavera il tasto resta quello del giro 163 (testo e barra dell'Indice).
   Conta i tocchi per la stagione (dichiarato, non giudicato).
   Braccio rosso: CPM_ROSSO165=1 accende __CPM_NO_G165 (da professionista il tasto non c'e') → il guardiano DEVE uscire 1.
   Foto: CPM_FOTO165=<cartella> salva tasto, pannello e riepilogo a 375x812 e 1280x800.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node momento-165.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';

const ROSSO = process.env.CPM_ROSSO165 === '1';
const FOTO = process.env.CPM_FOTO165 || '';
const fails = [], oks = [], note = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
const SALENTO = { id: 'lec', n: 'FC Salento', a: 'SLN', p: 62, c: '#f5c518', c2: '#dc2626', nat: '🇮🇹', lg: 'Lega A' };
function savePro(over = {}) {
  const s = 72;
  return { name: 'Guardiano Momento', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: false, age: 22, ovr: s, tutorialDone: true, position: 'ATT',
    club: SALENTO, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 75, popularity: 40, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1, ...over };
}
function saveU18() {
  const s = 68;
  return { name: 'Guardiano Momento U18', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 2, age: 17, ovr: 68, tutorialDone: true, position: 'Attaccante',
    club: { id: 'milan', n: 'AC Dorvelli Primavera', a: 'ACR', p: 78, c: '#dc2626', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Primavera 1', isU18: true },
    stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
    form: 72, morale: 72, fatigue: 10, coachTrust: 60, contract: { duration: 1, wage: 200 }, campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1 };
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(vp, player) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: FOTO ? 2 : 1 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, rosso]) => {
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (rosso) window.__CPM_NO_G165 = 1;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl }));
  }, [player, ROSSO]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(1200);
  await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; window.__CPM_SALTA153_SIM = []; });
  await sleep(800);
  return { page, errors };
}
const stato = (page) => page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const t = document.querySelector('[data-cpm="salta163-tasto"]');
  return { s: p.season || 1, w: p.week || 1, lived: !!p.weekLived, mh: (p.matchHistory || []).length, calPlayed: (p.calendar || []).filter(m => m.played).length, pro: p.proStatus,
    tasto: !!t, testo: t ? t.innerText.replace(/\s+/g, ' ').trim() : null, screen: window.__CPM_CAREER.screen() }; });
const clicca = async (page, sel, prova = 0) => { const el = await page.$(sel); if (!el) return false; if (await el.isDisabled().catch(() => false)) return false; try { await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 4000 }); return true; } catch (e) { if (prova < 2) { await sleep(400); return clicca(page, sel, prova + 1); }
  velo.push(await page.evaluate(() => [...document.querySelectorAll('.cpm-velo150')].map(v => (v.getAttribute('data-cpm') || (v.firstElementChild && v.firstElementChild.getAttribute('data-cpm')) || '?') + ':' + v.innerText.replace(/\s+/g, ' ').slice(0, 90)).join(' | ')));
  return false; } };
const velo = [];
async function aspettaFine(page, maxMs = 240000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const st = await page.evaluate(() => { const el = document.querySelector('[data-cpm="salta163"]'); return el ? el.getAttribute('data-salta163') : 'assente'; });
    if (st !== 'corsa') return st;
    await sleep(400);
  }
  return 'scaduto';
}
const ultima = (page) => page.evaluate(() => { const L = window.__CPM_SALTA153 || []; return L[L.length - 1] || null; });
const foto = async (page, nome) => { if (!FOTO) return; fs.mkdirSync(FOTO, { recursive: true }); const el = await page.$('[data-cpm="corsa163"]'); if (el) { await el.scrollIntoViewIfNeeded(); await sleep(250); await el.screenshot({ path: `${FOTO}/${nome}.png` }); } await page.screenshot({ path: `${FOTO}/${nome}-schermo.png` }); };

try {
  /* ---------- 1. la regola ---------- */
  console.log('1) la regola di posta (posta165)');
  {
    const { page, errors } = await apri({ width: 412, height: 915 }, savePro({ week: 12 }));
    const r = await page.evaluate(() => {
      const C = window.__CPM_CAREER, P0 = C.snapshot(), J0 = JSON.stringify(P0);
      /* classifica sintetica con noi a meta' classifica (decimi) */
      const altri = (P0.standings || []).filter(t => t.id !== 'lec'), noi = (P0.standings || []).find(t => t.id === 'lec');
      const st = [...altri.slice(0, 9), noi, ...altri.slice(9)].map((t, i) => ({ ...t, pts: 40 - i * 2, gd: 0, gf: 0 }));
      const io = st.findIndex(t => t.id === 'lec');
      const base = { ...P0, week: 12, standings: st, history: [], worldMemory: [], rival: null, injured: false, justRecovered: false, returnPenaltyWeeks: 0, totalMatches: 40, totalGoals: 20, goals: 3, matchHistory: [{ season: P0.season, week: 11, rating: 6.5 }] };
      /* un avversario di meta' classifica lontano da noi, non derby */
      const lontano = st.find((t, i) => Math.abs(i - io) >= 5 && i >= 3 && t.id !== 'lec' && !(typeof isDerby === 'function' && isDerby('lec', t.id)));
      const md = (t, extra) => ({ type: 'league', matchday: 12, week: 12, opponentId: t.id, opponentName: t.n || t.name, ...(extra || {}) });
      const vicino = st[io + 1] && !(typeof isDerby === 'function' && isDerby('lec', st[io + 1].id)) ? st[io + 1] : st[io - 1];
      /* un derby qualunque del gioco: si gioca da quel club */
      let der = null, derDa = null; try { for (const a of CLUBS) { if (a.isU18) continue; const b = CLUBS.find(c => !c.isU18 && c.id !== a.id && isDerby(a.id, c.id)); if (b) { der = b; derDa = a; break; } } } catch (e) {}
      const q = (p, m) => C.posta165(p, m);
      const out = {
        neutra: q(base, md(lontano)),
        neutra2: q(base, md(lontano)),
        exclub: q({ ...base, history: [{ season: 1, club: lontano.n || lontano.name, clubId: lontano.id }] }, md(lontano)),
        rientro: q({ ...base, justRecovered: true, returnPenaltyWeeks: 3, matchHistory: [{ season: P0.season, week: 8, rating: 6.5 }] }, md(lontano)),
        rientroGiaGiocato: q({ ...base, justRecovered: true, returnPenaltyWeeks: 3, matchHistory: [{ season: P0.season, week: 11, rating: 6.5 }] }, md(lontano)),
        presenza100: q({ ...base, totalMatches: 99 }, md(lontano)),
        gol50: q({ ...base, totalGoals: 49 }, md(lontano)),
        contratto: q({ ...base, week: 30, coachTrust: 45, contract: { duration: 1 }, renewalSeason: 0 }, md(lontano, { week: 30 })),
        contrattoSereno: q({ ...base, week: 30, coachTrust: 80, contract: { duration: 1 }, renewalSeason: 0 }, md(lontano, { week: 30 })),
        derby: der ? q({ ...base, club: derDa, standings: [] }, md({ id: der.id, n: der.n })) : 'nessun derby',
        diretto: q(base, md(vicino)),
        finale: q({ ...base, week: 38 }, md(lontano, { week: 38 })),
        coppa: q(base, { ...md(lontano), type: 'cup' }),
        lontano: lontano && lontano.id, vicino: vicino && vicino.id, der: der && (derDa.id + '-' + der.id),
      };
      out.puro = JSON.stringify(C.snapshot()) === J0;
      return out;
    });
    ok(r.neutra === null && r.neutra2 === null, `partita qualunque di metà classifica: nessuna posta (${r.neutra}) e stessa risposta due volte`);
    ok(/ex club/i.test(r.exclub || ''), `ex club → «${r.exclub}»`);
    ok(/infortunio/i.test(r.rientro || '') && !/infortunio/i.test(r.rientroGiaGiocato || ''), `primo match dopo l'infortunio → «${r.rientro}»; con una gara già giocata dopo il rientro → ${r.rientroGiaGiocato}`);
    ok(/100/.test(r.presenza100 || ''), `99 presenze → «${r.presenza100}»`);
    ok(/50/.test(r.gol50 || ''), `49 gol → «${r.gol50}»`);
    ok(/contratto/i.test(r.contratto || '') && !/contratto/i.test(r.contrattoSereno || ''), `contratto in scadenza con fiducia 45 → «${r.contratto}»; con fiducia 80 → ${r.contrattoSereno}`);
    ok(r.derby && r.derby !== 'nessun derby' && r.derby !== null, `derby → «${r.derby}» (${r.der})`);
    ok(/diretto|vertice|capolista/i.test(r.diretto || ''), `scontro diretto in classifica → «${r.diretto}» (${r.vicino})`);
    ok(/finale/i.test(r.finale || ''), `settimana 38 → «${r.finale}»`);
    ok(/coppa/i.test(r.coppa || ''), `coppa → «${r.coppa}»`);
    ok(r.puro, 'la regola è pura: il salvataggio non cambia');
    ok(errors.length === 0, `nessun errore di pagina${errors.length ? ' — ' + errors[0] : ''}`);
    await page.close();
  }

  /* ---------- 2-3. tasto e stagione ---------- */
  console.log('2) il tasto c\'è da professionista e chiede prima');
  const { page, errors } = await apri({ width: 375, height: 812 }, savePro());
  const s0 = await stato(page);
  ok(s0.tasto && /prossimo momento/i.test(s0.testo || ''), `il tasto c'è sulla home da professionista («${s0.testo}»)`);
  await foto(page, 'tasto-telefono');
  if (!s0.tasto) throw new Error('tasto assente: non si puo\' proseguire');
  await clicca(page, '[data-cpm="salta163-tasto"]'); await sleep(900);
  const s1 = await stato(page);
  const pann = await page.evaluate(() => { const el = document.querySelector('[data-cpm="salta163-conferma"]'); return el ? el.innerText.replace(/\s+/g, ' ') : null; });
  ok(!!pann && /posta/i.test(pann), `primo tocco: pannello di conferma («${(pann || '').slice(0, 100)}…»)`);
  ok(s1.w === s0.w && s1.mh === s0.mh && s1.calPlayed === s0.calPlayed && s1.lived === s0.lived, 'primo tocco: nulla è cambiato (settimana, storico, calendario)');
  await foto(page, 'conferma-telefono');
  await clicca(page, '[data-cpm="salta163-annulla"]'); await sleep(900);
  const s2 = await stato(page);
  ok(s2.tasto && s2.w === s0.w && s2.mh === s0.mh, '«Annulla»: torna il tasto, nulla è cambiato');

  console.log('3) una stagione intera col solo tasto (club di prestigio basso)');
  let tocchi = 0, giri = 0, fermate = {}, chiaviAperte = 0, chiaviOk = 0, scelteAperte = 0, scelteOk = 0; const perche = {}, finestre = {};
  while (giri++ < 120) {
    const st = await stato(page);
    if (st.s !== 3 || st.w > 38 || st.screen !== 'dashboard') break;
    /* una finestra rimasta aperta (intervista, verifica del mister…): il banco la chiude come il giocatore che la legge */
    for (let k = 0; k < 3; k++) {
      const mot = await page.evaluate(() => { const m = document.querySelector('[data-cpm="salta163-motivo"]'); return m ? m.innerText : null; });
      if (!mot || !/finestra/.test(mot)) break;
      const aperte = await page.evaluate(() => [...document.querySelectorAll('[data-cpm]')].map(e => e.getAttribute('data-cpm')).filter(x => /intervista|settimana23|partita23|offerta|momento|verifica|traguardo|mister/i.test(x)).slice(0, 6).join(','));
      finestre[aperte || '?'] = (finestre[aperte || '?'] || 0) + 1; tocchi++;
      await page.evaluate(() => { const el = document.querySelector('[data-cpm="intervista231"],[data-cpm="eroe-intervista23"]'); const b = el && [...el.querySelectorAll('button')].find(x => !x.disabled); if (b) b.click(); });
      await sleep(400);
      await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); });
      await sleep(600);
    }
    if (!(await clicca(page, '[data-cpm="salta163-tasto"]'))) { note.push(`tasto non cliccabile a W${st.w}: ${JSON.stringify(await page.evaluate(() => { const m = document.querySelector('[data-cpm="salta163-motivo"]'); return m ? m.innerText : null; }))} · ultime fermate ${JSON.stringify(await page.evaluate(() => (window.__CPM_SALTA153 || []).slice(-2)))}`); break; }
    tocchi++; await sleep(450);
    if (!(await clicca(page, '[data-cpm="salta163-vai"]'))) { note.push('pannello senza «Vai»'); break; }
    tocchi++;
    if (giri === 1) { await sleep(150); await foto(page, 'corsa-telefono'); }
    const esito = await aspettaFine(page);
    if (esito === 'scaduto') { ok(false, 'la corsa non si è fermata entro 240 s'); break; }
    await sleep(700);
    const fine = await ultima(page);
    const motivo = fine ? fine.motivo : '?';
    fermate[motivo] = (fermate[motivo] || 0) + 1;
    if (giri === 1) await foto(page, 'riepilogo-telefono');
    if (motivo === 'partita chiave') {
      chiaviAperte++; perche[fine.perche] = (perche[fine.perche] || 0) + 1;
      const k = await page.evaluate(() => { const C = window.__CPM_CAREER, md = C.thisWeekMd(), p = C.snapshot();
        const e = (p.calendar || []).find(m => m.week === (p.week || 1) && m.matchday === (md && md.matchday));
        return { prompt: !!document.querySelector('[data-cpm="partita23"]') || /Simula e avanza|Simula partita/i.test(document.body.innerText), chiave: C.chiave163(), giocata: !!(e && e.played) }; });
      if (k.prompt && k.chiave && !k.giocata) chiaviOk++; else note.push(`fermata partita anomala: ${JSON.stringify(k)}`);
      tocchi++;
      if (!(await clicca(page, '[data-cpm="simula-conferma"]'))) { await page.getByText('Simula partita', { exact: false }).first().click({ timeout: 5000 }).catch(() => {}); }
      await sleep(1500);
    } else if (motivo === 'scelta da fare') {
      scelteAperte++;
      const nb = await page.evaluate(() => { const m = document.querySelector('[data-cpm="settimana23"]'); return m ? [...m.querySelectorAll('button')].filter(b => !b.disabled).length : 0; });
      if (nb >= 2) scelteOk++; else note.push(`fermata scelta senza riquadro (${nb} pulsanti)`);
      tocchi++;
      await page.evaluate(() => { window.__CPM_CAREER.scegli(0); });
      await sleep(900); await page.evaluate(() => { window.__CPM_CAREER.chiudi163(); });
    } else if (motivo === 'fine stagione') { break; }
    else {
      tocchi++;
      await page.evaluate(() => { try { window.__CPM_CAREER.scegli(0); } catch (e) {} window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); });

      if (motivo === 'mercato') await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); if (p.transferSaga && !p.transferSaga.delivered) window.__CPM_CAREER.patch({ transferSaga: null }); });
      await sleep(900);
    }
    try { await page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="salta163-riepilogo"] button')].pop(); if (b) b.click(); }); } catch (e) {}
    await sleep(300);
    /* una finestra in primo piano (confronto col procuratore, il mister ti cerca, patto, spogliatoio): il banco risponde col primo
       pulsante, come il giocatore che la legge — dopo OGNI fermata, perche' alcune arrivano un attimo dopo la scelta */
    for (let k = 0; k < 5; k++) { await sleep(450); const c = await page.evaluate(() => { const v = document.querySelector('.cpm-velo150'); if (!v) return null; const b = [...v.querySelectorAll('button')].find(x => !x.disabled); if (b) b.click(); const q = v.getAttribute('data-cpm') ? v : v.querySelector('[data-cpm]'); return (q && q.getAttribute('data-cpm')) || v.innerText.replace(/\s+/g, ' ').slice(0, 24); }); if (!c) break; finestre[c] = (finestre[c] || 0) + 1; tocchi++; }
  }
  const fin = await page.evaluate(() => { const C = window.__CPM_CAREER, p = C.snapshot();
    const lega = (p.matchHistory || []).filter(m => (m.season || 1) === 3 && !m.cup && !m.euro && !m.national);
    const wk = lega.map(m => m.week); const dup = wk.filter((w, i) => wk.indexOf(w) !== i);
    return { s: p.season, w: p.week, lega: lega.length, dup, calTot: (p.calendar || []).filter(m => !m.type || m.type === 'league').length, calGioc: (p.calendar || []).filter(m => (!m.type || m.type === 'league') && m.played).length,
      st: (p.standings || []).length, sim: (window.__CPM_SALTA153_SIM || []) }; });
  const simPosta = fin.sim.filter(x => x.chiave);
  ok(fin.sim.length > 0 && fin.sim.every(x => x.pro), `il tasto ha simulato ${fin.sim.length} gare, tutte da professionista`);
  ok(simPosta.length === 0, `nessuna partita con posta simulata dal tasto (${simPosta.length}${simPosta.length ? ': ' + JSON.stringify(simPosta.slice(0, 3)) : ''})`);
  ok(chiaviAperte === chiaviOk, `ogni fermata «partita» lascia il prompt aperto e la gara non giocata (${chiaviOk}/${chiaviAperte})`);
  ok(chiaviAperte >= 8, `almeno 8 fermate su partite con posta in una stagione da club basso (${chiaviAperte})`);
  ok(scelteAperte === scelteOk, `ogni fermata «scelta da fare» lascia davanti il riquadro con almeno due scelte (${scelteOk}/${scelteAperte})`);
  ok(fin.w > 38 && fin.s === 3, `stagione arrivata in fondo (S${fin.s} W${fin.w})`);
  ok(fin.lega === 34, `34 gare di lega nello storico (${fin.lega})`);
  ok(fin.dup.length === 0, `una gara per settimana, nessuna settimana ripetuta (${fin.dup.length ? fin.dup.join(',') : 'nessuna'})`);
  ok(fin.calGioc === fin.calTot && fin.calTot === 34, `calendario di lega tutto giocato (${fin.calGioc}/${fin.calTot})`);
  ok(fin.st === 18, `classifica a 18 righe (${fin.st})`);
  ok(errors.length === 0, `nessun errore di pagina${errors.length ? ' — ' + errors[0] : ''}`);
  note.push(`tocchi per la stagione: ${tocchi} (giri del tasto ${giri - 1}) · fermate: ${JSON.stringify(fermate)} · gare simulate dal tasto ${fin.sim.length}`);
  note.push(`veli che coprivano un tasto: ${JSON.stringify(velo.slice(0, 6))}`);
  note.push(`fermate «partita» per motivo: ${JSON.stringify(perche)} · finestre chiuse dal banco fra due corse: ${JSON.stringify(finestre)}`);
  await page.close();

  console.log('4) rinnovo');
  {
    const W = await apri({ width: 412, height: 915 }, savePro({ week: 28, contract: { duration: 1, wage: 6000, expiresAtSeason: 3 }, coachTrust: 80 }));
    await clicca(W.page, '[data-cpm="salta163-tasto"]'); await sleep(500); await clicca(W.page, '[data-cpm="salta163-vai"]');
    await aspettaFine(W.page, 60000); await sleep(400);
    const a1 = await ultima(W.page);
    const card = await W.page.evaluate(() => !!document.querySelector('[data-cpm="rinnovo94"]'));
    ok(a1 && a1.motivo === 'rinnovo' && card, `card del rinnovo sulla home → fermata «rinnovo» (${a1 && a1.motivo}, card ${card})`);
    await W.page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="salta163-riepilogo"] button')].pop(); if (b) b.click(); });
    await sleep(300);
    await clicca(W.page, '[data-cpm="salta163-tasto"]'); await sleep(500); await clicca(W.page, '[data-cpm="salta163-vai"]');
    await aspettaFine(W.page, 120000); await sleep(400);
    const L = await W.page.evaluate(() => (window.__CPM_SALTA153 || []).map(f => f.motivo));
    ok(L.filter(m => m === 'rinnovo').length === 1, `ripartendo, il rinnovo non riferma nella stessa stagione (${JSON.stringify(L)})`);
    await W.page.close();
  }
  console.log('5) mercato');
  {
    const W = await apri({ width: 412, height: 915 }, savePro({ week: 5 }));
    await clicca(W.page, '[data-cpm="salta163-tasto"]'); await sleep(500); await clicca(W.page, '[data-cpm="salta163-vai"]');
    await sleep(150);
    const fo = await W.page.evaluate(() => window.__CPM_CAREER.forceOffer());
    const e = await aspettaFine(W.page, 30000); await sleep(400);
    const m = await ultima(W.page);
    ok(fo === true && m && m.motivo === 'mercato', `offerta durante la corsa → fermata «mercato» (offerta ${fo}, motivo ${m && m.motivo}, stato ${e})`);
    await W.page.close();
  }
  console.log('6) PC e Primavera');
  {
    const W = await apri({ width: 1280, height: 800 }, savePro({ week: 3 }));
    const t = await stato(W.page);
    ok(t.tasto, 'a 1280×800 il tasto c\'è');
    await foto(W.page, 'tasto-pc');
    await clicca(W.page, '[data-cpm="salta163-tasto"]'); await sleep(500); await foto(W.page, 'conferma-pc');
    await clicca(W.page, '[data-cpm="salta163-vai"]'); await sleep(120);
    await clicca(W.page, '[data-cpm="salta163-ferma"]');
    await aspettaFine(W.page, 30000); await sleep(500); await foto(W.page, 'riepilogo-pc');
    const ovf = await W.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    ok(!ovf, 'nessuno scorrimento orizzontale a 1280');
    await W.page.close();
    const U = await apri({ width: 412, height: 915 }, saveU18());
    const u = await stato(U.page);
    const ip = await U.page.evaluate(() => !!document.querySelector('[data-cpm="ip163"]'));
    ok(u.tasto && /momento importante/i.test(u.testo || '') && ip, `Primavera invariata: tasto del giro 163 («${u.testo}») e barra dell'Indice (${ip})`);
    await U.page.close();
  }
} catch (e) { fails.push('eccezione: ' + (e && e.message)); console.log('  ✗ eccezione', e && e.message); }

await browser.close(); srv.close();
for (const n of note) console.log('  · ' + n);
console.log(`\nmomento-165 ${ROSSO ? '[BRACCIO ROSSO __CPM_NO_G165]' : '[verde atteso]'}: ${oks.length} verdi, ${fails.length} rossi`);
console.log(fails.length ? 'ESITO: ROSSO' : 'ESITO: VERDE');
process.exit(fails.length ? 1 : 0);
