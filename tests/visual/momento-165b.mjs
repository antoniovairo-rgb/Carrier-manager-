#!/usr/bin/env node
/* [giro 165b · PO-364, decisioni PO 11/11 sera] GUARDIANO momento-165b — rifiniture di «Vai al prossimo momento» da professionista.
   Sul gioco vero (?cpmtest=1, percorsi veri della settimana) giudica:
   1. CLASSIFICA STORIA/ROUTINE (funzione pura storia165b sugli impulsi veri del gioco): seguiti, procuratore, mister, offerte,
      interviste, momenti di carriera → storia; impulsi qualunque (auto di lusso, padel, cena di squadra…) e un momento dello
      spogliatoio senza mister → routine; stessa risposta due volte.
   2. UNA STAGIONE DA PROFESSIONISTA (FC Salento) col solo tasto: ogni fermata «scelta da fare» e' una scelta DI STORIA (campo
      `storia` del testimone) con il riquadro davanti; almeno una scelta di routine fatta da sola; la stagione arriva a W39 con 34
      gare di lega, una per settimana; nessun errore di pagina. Dichiara tocchi, corse, fermate per tipo.
   3. RINNOVO «finche' non e' risolto»: con la card del contratto in scadenza la corsa si ferma «rinnovo» a OGNI corsa (due corse
      di fila); rifiutato il rinnovo (pulsante vero della trattativa, o il gancio rifiuta165b se il club accetta subito) la corsa
      non si ferma piu' sul rinnovo; firmato idem.
   4. PRIMAVERA: col confronto del procuratore aperto il tasto e' spento («chiudi prima la finestra aperta»); una finestra col velo
      che compare durante la corsa la ferma.
   Braccio rosso: CPM_ROSSO165B=1 accende __CPM_NO_G165B (comportamento del giro 165) → il guardiano DEVE uscire 1.
   [giro 173] le sezioni 1 e 3 giudicano il comportamento del 165b (mister letto dal testo, rinnovo che ferma a ogni corsa), che dal
   giro 173 vive nel suo rosso: si aprono con __CPM_NO_G173 (il nuovo comportamento lo giudica momento-173). La sezione 2 gira col
   giro 173 acceso; CPM_NO173=1 la gira col 173 spento (misura «prima» del rapporto 173).
   Foto: CPM_FOTO165B=<cartella> salva il riepilogo della corsa a 375x812 e 1280x800.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node momento-165b.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';

const ROSSO = process.env.CPM_ROSSO165B === '1';
const FOTO = process.env.CPM_FOTO165B || '';
const NO173 = process.env.CPM_NO173 === '1';
const SOLO = (process.env.CPM_SOLO165B || '').split(',').filter(Boolean);
const fai = (n) => !SOLO.length || SOLO.includes(String(n));
const fails = [], oks = [], note = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const STORIA = ['seguito', 'momento di carriera', 'procuratore', 'offerta', 'mister', 'intervista'];
const SALENTO = { id: 'lec', n: 'FC Salento', a: 'SLN', p: 62, c: '#f5c518', c2: '#dc2626', nat: '🇮🇹', lg: 'Lega A' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
function savePro(over = {}) {
  const s = 72;
  return { name: 'Guardiano Momento', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: false, age: 22, ovr: s, tutorialDone: true, position: 'ATT',
    club: SALENTO, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 75, popularity: 40, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1, ...AP, ...over };
}
function saveU18(over = {}) {
  const s = 68;
  return { name: 'Guardiano Momento U18', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 2, age: 17, ovr: 68, tutorialDone: true, position: 'Attaccante',
    club: { id: 'milan', n: 'AC Dorvelli Primavera', a: 'ACR', p: 78, c: '#dc2626', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Primavera 1', isU18: true },
    stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
    form: 72, morale: 72, fatigue: 10, coachTrust: 60, contract: { duration: 1, wage: 200 }, campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1, ...over };
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(vp, player, no173 = NO173) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: FOTO ? 2 : 1 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, rosso, n173]) => {
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (rosso) window.__CPM_NO_G165B = 1; if (n173) window.__CPM_NO_G173 = 1;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl }));
  }, [player, ROSSO, no173]);
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
const stato = (page) => page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const t = document.querySelector('[data-cpm="salta163-tasto"]'); const m = document.querySelector('[data-cpm="salta163-motivo"]');
  return { s: p.season || 1, w: p.week || 1, mh: (p.matchHistory || []).length, tasto: !!t, spento: !!(t && t.disabled), motivo: m ? m.innerText.trim() : null, screen: window.__CPM_CAREER.screen() }; });
const clicca = async (page, sel, prova = 0) => { const el = await page.$(sel); if (!el) return false; if (await el.isDisabled().catch(() => false)) return false; try { await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 4000 }); return true; } catch (e) { if (prova < 2) { await sleep(400); return clicca(page, sel, prova + 1); } return false; } };
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
const chiudiRiepilogo = (page) => page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="salta163-riepilogo"] button')].pop(); if (b) b.click(); });
async function corsa(page, maxMs) { if (!(await clicca(page, '[data-cpm="salta163-tasto"]'))) return { avviata: false }; await sleep(450); if (!(await clicca(page, '[data-cpm="salta163-vai"]'))) return { avviata: false };
  const e = await aspettaFine(page, maxMs); await sleep(500); return { avviata: true, esito: e, fine: await ultima(page) }; }
const foto = async (page, nome) => { if (!FOTO) return; fs.mkdirSync(FOTO, { recursive: true }); const el = await page.$('[data-cpm="corsa163"]'); if (el) { await el.scrollIntoViewIfNeeded(); await sleep(250); await el.screenshot({ path: `${FOTO}/${nome}.png` }); } await page.screenshot({ path: `${FOTO}/${nome}-schermo.png` }); };

try {
  /* ---------- 1. classifica storia/routine ---------- */
  if (fai(1)) {
    console.log('1) storia o routine (storia165b sugli impulsi veri)');
    const { page, errors } = await apri({ width: 412, height: 915 }, savePro({ week: 6 }), true);
    const r = await page.evaluate(() => {
      const C = window.__CPM_CAREER, J0 = JSON.stringify(C.snapshot());
      const wl = (id) => { const im = WEEKLY_IMPULSES.find(x => x.id === id); return im ? { isImpulse: true, impId: id, cat: im.cat, event: { txt: String(im.txt || '') }, choices: im.choices || [] } : null; };
      const q = (id) => { const w = wl(id); return w ? C.storia165b(w) : 'assente'; };
      const conti = { storia: 0, routine: 0 }, perTipo = {};
      for (const im of WEEKLY_IMPULSES) { if (!(im.choices || []).length || (im.choices || []).length < 2) continue; const t = C.storia165b(wl(im.id)); if (t) { conti.storia++; perTipo[t] = (perTipo[t] || 0) + 1; } else conti.routine++; }
      const seg = WEEKLY_IMPULSES.find(x => x.seg);
      return { conti, perTipo, seguito: seg ? q(seg.id) : 'nessun seguito', segId: seg && seg.id, procuratore: q('wi_procuratore_push'), mister: q('wi_figlia_mister'), primoMister: q('wi_primo_mister'),
        intervista: q('wi_intervista_sorpresa'), prestito: q('wi_prestito_inverno'), firma: q('wi_pro_firma'),
        r1: q('wi_auto_lusso'), r2: q('wi_torneo_padel'), r3: q('wi_cena_squadra'), r1b: q('wi_auto_lusso'),
        spo: C.storia165b({ isSpogliatoio: true, event: { txt: 'Un compagno ti chiede di restare dopo l\'allenamento per provare i calci piazzati.' }, choices: [{ txt: 'a' }, { txt: 'b' }] }),
        spoMister: C.storia165b({ isSpogliatoio: true, event: { txt: 'Il mister vi ha visti litigare: vuole parlarti.' }, choices: [{ txt: 'a' }, { txt: 'b' }] }),
        puro: JSON.stringify(C.snapshot()) === J0 };
    });
    ok(r.seguito && STORIA.includes(r.seguito), `seguito di una scelta (${r.segId}) → storia «${r.seguito}»`);
    ok(r.procuratore === 'procuratore', `procuratore → «${r.procuratore}»`);
    ok(r.mister === 'mister', `il mister (wi_figlia_mister) → «${r.mister}»`);
    ok(r.intervista === 'intervista', `intervista → «${r.intervista}»`);
    ok(r.prestito === 'offerta', `offerta di prestito → «${r.prestito}»`);
    ok(r.firma === 'momento di carriera', `momento di carriera (wi_pro_firma, mile) → «${r.firma}»`);
    ok(r.r1 === null && r.r2 === null && r.r3 === null && r.r1b === null, `routine (auto di lusso, padel, cena di squadra) → null (${r.r1}, ${r.r2}, ${r.r3}) e stessa risposta due volte`);
    ok(r.spo === null && r.spoMister === 'mister', `spogliatoio senza mister → routine (${r.spo}); col mister → «${r.spoMister}»`);
    ok(r.puro, 'la classifica è pura: il salvataggio non cambia');
    ok(errors.length === 0, `nessun errore di pagina${errors.length ? ' — ' + errors[0] : ''}`);
    note.push(`impulsi con almeno due scelte: ${r.conti.storia} di storia, ${r.conti.routine} di routine · storia per tipo ${JSON.stringify(r.perTipo)}`);
    await page.close();
  }

  /* ---------- 2. una stagione da professionista ---------- */
  if (fai(2)) {
    console.log('2) una stagione da professionista col solo tasto');
    const t0 = Date.now();
    const { page, errors } = await apri({ width: 375, height: 812 }, savePro());
    let tocchi = 0, corse = 0; const fermate = {}, storie = {}, routineFerme = [], finestre = {}; let scelteAperte = 0, scelteOk = 0, fotoFatta = false;
    while (corse < 120) {
      const st = await stato(page);
      if (st.s !== 3 || st.w > 38 || st.screen !== 'dashboard') break;
      for (let k = 0; k < 3; k++) {
        if (!st.motivo || !/finestra/.test(st.motivo)) break;
        tocchi++;
        await page.evaluate(() => { const el = document.querySelector('[data-cpm="intervista231"],[data-cpm="eroe-intervista23"]'); const b = el && [...el.querySelectorAll('button')].find(x => !x.disabled); if (b) b.click(); });
        await sleep(400); await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); }); await sleep(600);
        Object.assign(st, await stato(page));
      }
      const c = await corsa(page, 240000);
      if (!c.avviata) { note.push(`tasto non cliccabile a W${st.w}: ${st.motivo}`); break; }
      tocchi += 2; corse++;
      if (c.esito === 'scaduto') { ok(false, 'la corsa non si è fermata entro 240 s'); break; }
      const motivo = c.fine ? c.fine.motivo : '?';
      fermate[motivo] = (fermate[motivo] || 0) + 1;
      if (motivo === 'partita chiave') {
        tocchi++;
        if (!(await clicca(page, '[data-cpm="simula-conferma"]'))) { await page.getByText('Simula partita', { exact: false }).first().click({ timeout: 5000 }).catch(() => {}); }
        await sleep(1500);
      } else if (motivo === 'scelta da fare') {
        scelteAperte++; const ti = c.fine.storia || 'senza tipo'; storie[ti] = (storie[ti] || 0) + 1;
        if (!STORIA.includes(c.fine.storia) && !/^finestra/.test(c.fine.chi || '')) routineFerme.push(`W${c.fine.w} ${c.fine.imp || c.fine.chi || '?'} (${c.fine.storia || '-'})`);
        const nb = await page.evaluate(() => { const m = document.querySelector('[data-cpm="settimana23"]'); return m ? [...m.querySelectorAll('button')].filter(b => !b.disabled).length : 0; });
        if (nb >= 2 || /^finestra/.test(c.fine.chi || '')) scelteOk++;
        tocchi++;
        await page.evaluate(() => { window.__CPM_CAREER.scegli(0); }); await sleep(900); await page.evaluate(() => { window.__CPM_CAREER.chiudi163(); });
      } else if (motivo === 'fine stagione') { break; }
      else {
        tocchi++;
        await page.evaluate(() => { try { window.__CPM_CAREER.scegli(0); } catch (e) {} window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); });
        if (motivo === 'mercato') await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); if (p.transferSaga && !p.transferSaga.delivered) window.__CPM_CAREER.patch({ transferSaga: null }); });
        await sleep(900);
      }
      await chiudiRiepilogo(page); await sleep(300);
      for (let k = 0; k < 5; k++) { await sleep(450); const f = await page.evaluate(() => { const v = document.querySelector('.cpm-velo150'); if (!v) return null; const b = [...v.querySelectorAll('button')].find(x => !x.disabled); if (b) b.click(); const q = v.getAttribute('data-cpm') ? v : v.querySelector('[data-cpm]'); return (q && q.getAttribute('data-cpm')) || '?'; }); if (!f) break; finestre[f] = (finestre[f] || 0) + 1; tocchi++; }
    }
    const fin = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const L = window.__CPM_SALTA153 || [];
      const lega = (p.matchHistory || []).filter(m => (m.season || 1) === 3 && !m.cup && !m.euro && !m.national); const wk = lega.map(m => m.week);
      return { s: p.season, w: p.week, lega: lega.length, dup: wk.filter((w, i) => wk.indexOf(w) !== i), auto: L.reduce((a, f) => a + (f.auto || 0), 0) }; });
    ok(routineFerme.length === 0, `ogni fermata «scelta da fare» è una scelta di storia (${routineFerme.length} di routine${routineFerme.length ? ': ' + routineFerme.slice(0, 4).join(' · ') : ''})`);
    ok(scelteAperte === scelteOk, `ogni fermata «scelta da fare» lascia la scelta davanti (${scelteOk}/${scelteAperte})`);
    ok(fin.auto > 0, `scelte di routine fatte da sole con l'estrazione seedata: ${fin.auto}`);
    ok(fin.w > 38 && fin.s === 3, `stagione arrivata in fondo (S${fin.s} W${fin.w})`);
    ok(fin.lega === 34 && fin.dup.length === 0, `34 gare di lega, una per settimana (${fin.lega}, doppioni ${fin.dup.length})`);
    ok(errors.length === 0, `nessun errore di pagina${errors.length ? ' — ' + errors[0] : ''}`);
    note.push(`stagione: tocchi ${tocchi} · corse ${corse} · fermate ${JSON.stringify(fermate)} · scelte di storia per tipo ${JSON.stringify(storie)} · scelte fatte da sole ${fin.auto} · finestre chiuse dal banco ${JSON.stringify(finestre)} · ${Math.round((Date.now() - t0) / 1000)} s`);
    await page.close();
  }

  /* ---------- 3. rinnovo finche' non e' risolto ---------- */
  if (fai(3)) {
    console.log('3) rinnovo: ferma a ogni corsa finché non firmi o rifiuti');
    const W = await apri({ width: 412, height: 915 }, savePro({ week: 28, contract: { duration: 1, wage: 6000, expiresAtSeason: 3 }, coachTrust: 80 }), true);
    const c1 = await corsa(W.page, 60000); await chiudiRiepilogo(W.page); await sleep(300);
    const c2 = await corsa(W.page, 60000);
    const card = await W.page.evaluate(() => !!document.querySelector('[data-cpm="rinnovo94"]'));
    ok(c1.fine && c1.fine.motivo === 'rinnovo' && c2.fine && c2.fine.motivo === 'rinnovo' && card, `due corse di fila, due fermate «rinnovo» (${c1.fine && c1.fine.motivo}, ${c2.fine && c2.fine.motivo}; card ${card})`);
    await chiudiRiepilogo(W.page); await sleep(300);
    /* rifiuto dal pulsante vero: Negozia → «Chiedi +30%» → Rifiuta / Chiudi / Ho capito */
    let via = 'nessuna';
    try {
      await W.page.locator('[data-cpm="rinnovo94"] button').first().click({ timeout: 5000 }); await sleep(600);
      const ho = W.page.getByText('Ho capito', { exact: true });
      if (await ho.count()) { await ho.first().click(); via = 'il club non rinnova → Ho capito'; }
      else {
        await W.page.getByText('Chiedi +30%', { exact: false }).first().click({ timeout: 5000 }); await sleep(600);
        for (const [t, v] of [['Rifiuta', 'contro-offerta → Rifiuta'], ['Chiudi', 'richiesta respinta → Chiudi']]) { const b = W.page.getByText(t, { exact: true }); if (await b.count()) { await b.first().click(); via = v; break; } }
        if (via === 'nessuna') via = 'il club ha accettato (firmato)';
      }
    } catch (e) { via = 'errore: ' + e.message.slice(0, 80); }
    await sleep(600);
    const dopo = await W.page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { rif: p.rinnRif165b || 0, ren: p.renewalSeason || 0, s: p.season || 1 }; });
    if (via === 'nessuna' || /^errore/.test(via)) { await W.page.evaluate(() => window.__CPM_CAREER.rifiuta165b()); await sleep(400); via += ' (rifiuto dal gancio)'; }
    await W.page.evaluate(() => { window.__CPM_SALTA153 = []; });
    const c3 = await corsa(W.page, 120000);
    const L3 = await W.page.evaluate(() => (window.__CPM_SALTA153 || []).map(f => f.motivo));
    ok(c3.avviata && !L3.includes('rinnovo'), `risolto il rinnovo (${via}; rifiuto S${dopo.rif}, firma S${dopo.ren}) la corsa non si ferma più sul rinnovo (${JSON.stringify(L3)})`);
    ok(W.errors.length === 0, `nessun errore di pagina${W.errors.length ? ' — ' + W.errors[0] : ''}`);
    await W.page.close();
  }

  /* ---------- 4. Primavera ---------- */
  if (fai(4)) {
    console.log('4) Primavera: confronto del procuratore e finestre col velo');
    const A = await apri({ width: 412, height: 915 }, saveU18({ hasAgent: true, agent: { name: 'Procuratore di prova' }, agentCheckin: { due: true, s: 1, w: 2 } }));
    const a = await stato(A.page);
    const conf = await A.page.evaluate(() => !!document.querySelector('[data-cpm="confronto253"]'));
    ok(a.tasto && a.spento && /finestra/.test(a.motivo || ''), `Primavera col confronto del procuratore aperto (${conf}): tasto spento («${a.motivo}»)`);
    await A.page.close();
    const B = await apri({ width: 412, height: 915 }, saveU18());
    const okAvvio = await clicca(B.page, '[data-cpm="salta163-tasto"]') && (await sleep(450), await clicca(B.page, '[data-cpm="salta163-vai"]'));
    await sleep(300);
    await B.page.evaluate(() => { const d = document.createElement('div'); d.className = 'cpm-velo150'; d.setAttribute('data-cpm', 'prova165b'); d.style.cssText = 'position:fixed;inset:0;pointer-events:none'; document.body.appendChild(d); });
    const e = await aspettaFine(B.page, 20000); await sleep(400);
    const f = await ultima(B.page);
    ok(okAvvio && f && f.motivo === 'momento importante' && /prova165b/.test(f.chi || ''), `Primavera: una finestra col velo durante la corsa la ferma (${f && f.motivo}, ${f && f.chi}, stato ${e})`);
    ok(B.errors.length === 0, `nessun errore di pagina${B.errors.length ? ' — ' + B.errors[0] : ''}`);
    await B.page.close();
  }

  /* ---------- foto: riepilogo con le scelte fatte da sole, finestre chiuse ---------- */
  if (FOTO && fai(5)) {
    for (const [vp, nome] of [[{ width: 375, height: 812 }, 'riepilogo-telefono'], [{ width: 1280, height: 800 }, 'riepilogo-pc']]) {
      const W = await apri(vp, savePro({ week: 3 }));
      for (let k = 0; k < 8; k++) {
        const c = await corsa(W.page, 120000);
        await W.page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); }); await sleep(900);
        for (let h = 0; h < 4; h++) { const f = await W.page.evaluate(() => { const v = document.querySelector('.cpm-velo150'); if (!v) return false; const b = [...v.querySelectorAll('button')].find(x => !x.disabled); if (b) b.click(); return true; }); if (!f) break; await sleep(500); }
        if (c.fine && c.fine.auto > 0 && await W.page.$('[data-cpm="salta163-riepilogo"]')) { await foto(W.page, nome); note.push(`foto ${nome}: fermata «${c.fine.motivo}», ${c.fine.auto} scelte fatte da sole`); break; }
        await chiudiRiepilogo(W.page); await sleep(300);
      }
      await W.page.close();
    }
  }
} catch (e) { fails.push('eccezione: ' + (e && e.message)); console.log('  ✗ eccezione', e && e.message); }

await browser.close(); srv.close();
for (const n of note) console.log('  · ' + n);
console.log(`\nmomento-165b ${ROSSO ? '[BRACCIO ROSSO __CPM_NO_G165B]' : '[verde atteso]'}${NO173 ? ' [giro 173 spento: CPM_NO173]' : ''}: ${oks.length} verdi, ${fails.length} rossi`);
console.log(fails.length ? 'ESITO: ROSSO' : 'ESITO: VERDE');
process.exit(fails.length ? 1 : 0);
