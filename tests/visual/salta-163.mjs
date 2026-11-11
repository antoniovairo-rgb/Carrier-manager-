#!/usr/bin/env node
/* [giro 163 · PO-356 idea 3] GUARDIANO salta-163 — «Vai al prossimo momento importante».
   Gioca una stagione Primavera INTERA solo col tasto (sul gioco vero, ?cpmtest=1, percorsi veri della settimana) e giudica:
   1. CHIEDE PRIMA: il primo tocco apre il pannello di conferma e non cambia nulla (settimana, storico, calendario);
      «Annulla» chiude senza toccare nulla.
   2. NON SALTA PARTITE CHIAVE: ogni gara simulata dal tasto (testimone __CPM_SALTA153_SIM) e' NON chiave secondo la regola
      letta nell'istante; ogni fermata «partita chiave» lascia il prompt Gioca/Simula aperto e la gara NON giocata.
   3. NON ROMPE LA SETTIMANA: a fine stagione 34 gare di lega nello storico, una per settimana, nessuna settimana ripetuta,
      calendario tutto giocato, classifica a 18 righe, nessun errore di pagina.
   4. MERCATO: un'offerta che arriva durante la corsa la ferma con l'offerta aperta.
   5. FERMA: il tasto Ferma interrompe la corsa.
   6. SOLO PRIMAVERA: per un professionista il tasto non c'e'.
   Conta i tocchi serviti per finire la stagione (bersaglio del progetto: da 39 a 12 o meno — dichiarato, non giudicato).
   Braccio rosso: CPM_ROSSO163=1 accende __CPM_NO_SALTA153 (tasto assente) → il guardiano DEVE uscire 1.
   Foto: CPM_FOTO163=<cartella> salva tasto, pannello e riepilogo a 412x915 e 1280x800.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node salta-163.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';

const ROSSO = process.env.CPM_ROSSO163 === '1';
const FOTO = process.env.CPM_FOTO163 || '';
const fails = [], oks = [], note = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };

function savePlayer(over = {}) {
  const s = 68;
  return { name: 'Guardiano Salta', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 1, age: 17, ovr: 68, tutorialDone: true, position: 'Attaccante',
    club: { id: 'milan', n: 'AC Dorvelli Primavera', a: 'ACR', p: 78, c: '#dc2626', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Primavera 1', isU18: true },
    stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
    form: 72, morale: 72, fatigue: 10, coachTrust: 60, contract: { duration: 1, wage: 200 }, ...over };
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(vp, player) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: FOTO ? 2 : 1 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, rosso]) => {
    window.__CPM_GLB = false; if (rosso) window.__CPM_NO_SALTA153 = 1;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl }));
  }, [player, ROSSO]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 25000 });
  await sleep(1200);
  return { page, errors };
}
const stato = (page) => page.evaluate(() => { const p = window.__CPM_CAREER.snapshot();
  return { s: p.season || 1, w: p.week || 1, lived: !!p.weekLived, mh: (p.matchHistory || []).length, calPlayed: (p.calendar || []).filter(m => m.played).length, pro: p.proStatus,
    salta: (document.querySelector('[data-cpm="salta163"]') || {}).getAttribute ? document.querySelector('[data-cpm="salta163"]').getAttribute('data-salta163') : null,
    tasto: !!document.querySelector('[data-cpm="salta163-tasto"]'), screen: window.__CPM_CAREER.screen() }; });
const clicca = async (page, sel, prova = 0) => { const el = await page.$(sel); if (!el) return false; if (await el.isDisabled().catch(() => false)) return false; try { await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 8000 }); return true; } catch (e) { if (prova < 3) { await sleep(400); return clicca(page, sel, prova + 1); } throw e; } };
async function aspettaFine(page, maxMs = 240000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const st = await page.evaluate(() => { const el = document.querySelector('[data-cpm="salta163"]'); return el ? el.getAttribute('data-salta163') : 'assente'; });
    if (st !== 'corsa') return st;
    await sleep(400);
  }
  return 'scaduto';
}
const foto = async (page, nome) => { if (!FOTO) return; fs.mkdirSync(FOTO, { recursive: true }); const el = await page.$('[data-cpm="corsa163"]'); if (el) { await el.scrollIntoViewIfNeeded(); await sleep(250); await el.screenshot({ path: `${FOTO}/${nome}.png` }); } await page.screenshot({ path: `${FOTO}/${nome}-schermo.png` }); };

try {
  const { page, errors } = await apri({ width: 412, height: 915 }, savePlayer());
  await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; window.__CPM_SALTA153_SIM = []; });
  await sleep(800);
  /* settimana 1 vissuta col tasto principale (come farebbe il giocatore), cosi' il tasto si accende */
  console.log('1) chiede prima di partire');
  const s0 = await stato(page);
  ok(s0.tasto, 'il tasto «Vai al prossimo momento importante» c\'è sulla home in Primavera');
  if (!s0.tasto) throw new Error('tasto assente: non si puo\' proseguire');
  await clicca(page, '[data-cpm="salta163-tasto"]'); await sleep(900);
  const s1 = await stato(page);
  const pann = await page.evaluate(() => { const el = document.querySelector('[data-cpm="salta163-conferma"]'); return el ? el.innerText.replace(/\s+/g, ' ') : null; });
  ok(!!pann, `primo tocco: pannello di conferma («${(pann || '').slice(0, 90)}…»)`);
  ok(s1.w === s0.w && s1.mh === s0.mh && s1.calPlayed === s0.calPlayed && s1.lived === s0.lived, 'primo tocco: nulla e\' cambiato (settimana, storico, calendario)');
  await foto(page, 'conferma-telefono');
  await clicca(page, '[data-cpm="salta163-annulla"]'); await sleep(900);
  const s2 = await stato(page);
  ok(s2.tasto && s2.w === s0.w && s2.mh === s0.mh, '«Annulla»: torna il tasto, nulla e\' cambiato');

  console.log('2-3) una stagione intera col solo tasto');
  let tocchi = 0, giri = 0, fermate = {}, chiaviAperte = 0, chiaviOk = 0;
  while (giri++ < 80) {
    const st = await stato(page);
    if (st.pro !== 'u18' || st.w > 38 || st.screen !== 'dashboard') break;
    if (!(await clicca(page, '[data-cpm="salta163-tasto"]'))) { note.push(`ultime fermate: ${JSON.stringify(await page.evaluate(() => (window.__CPM_SALTA153 || []).slice(-3)))} · modali: ${await page.evaluate(() => [...document.querySelectorAll('[role=dialog],[data-cpm=settimana23],[data-cpm=partita23]')].map(e => (e.getAttribute('data-cpm') || 'dialog') + ':' + e.innerText.replace(/\s+/g, ' ').slice(0, 80)).join(' | '))}`); note.push(`tasto non cliccabile a S${st.s} W${st.w}: ${await page.evaluate(() => (document.querySelector('[data-cpm="salta163-motivo"]') || {}).innerText || '?')}`); break; }
    tocchi++; await sleep(500);
    if (!(await clicca(page, '[data-cpm="salta163-vai"]'))) { note.push('pannello senza «Vai»'); break; }
    tocchi++;
    const esito = await aspettaFine(page);
    if (esito === 'scaduto') { ok(false, 'la corsa non si e\' fermata entro 240 s'); break; }
    await sleep(700);
    const fine = await page.evaluate(() => { const L = window.__CPM_SALTA153 || []; return L[L.length - 1] || null; });
    const motivo = fine ? fine.motivo : '?';
    fermate[motivo] = (fermate[motivo] || 0) + 1;
    if (giri === 1) await foto(page, 'riepilogo-telefono');
    if (motivo === 'partita chiave') {
      chiaviAperte++;
      const k = await page.evaluate(() => { const C = window.__CPM_CAREER, md = C.thisWeekMd(), p = C.snapshot();
        const e = (p.calendar || []).find(m => m.week === (p.week || 1) && m.matchday === (md && md.matchday));
        return { prompt: !!document.querySelector('[data-cpm="partita23"]') || /Simula e avanza|Simula partita/i.test(document.body.innerText), chiave: C.chiave163(), giocata: !!(e && e.played) }; });
      if (k.prompt && k.chiave && !k.giocata) chiaviOk++;
      else note.push(`fermata chiave anomala: ${JSON.stringify(k)}`);
      /* il giocatore qui sceglie: il banco simula dal prompt aperto (stesso bottone del gioco) */
      tocchi++;
      if (!(await clicca(page, '[data-cpm="simula-conferma"]'))) { await page.getByText('Simula partita', { exact: false }).first().click({ timeout: 5000 }).catch(() => {}); }
      await sleep(1500);
    } else if (motivo === 'fine stagione') { break; }
    else {
      /* fermate diverse (impulso importante, intervista, momento, mercato): il banco chiude come il giocatore che legge */
      tocchi++;
      await page.evaluate(() => { try { window.__CPM_CAREER.scegli(0); } catch (e) {} window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); });
      await sleep(900);
    }
    try { await page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="salta163-riepilogo"] button')].pop(); if (b) b.click(); }); } catch (e) {}
    await sleep(300);
  }
  const fin = await page.evaluate(() => { const C = window.__CPM_CAREER, p = C.snapshot();
    const lega = (p.matchHistory || []).filter(m => (m.season || 1) === 1 && !m.cup && !m.euro && !m.national);
    const wk = lega.map(m => m.week); const dup = wk.filter((w, i) => wk.indexOf(w) !== i);
    return { s: p.season, w: p.week, pro: p.proStatus, lega: lega.length, dup, calTot: (p.calendar || []).filter(m => !m.type || m.type === 'league').length, calGioc: (p.calendar || []).filter(m => (!m.type || m.type === 'league') && m.played).length,
      st: (p.standings || []).length, sim: (window.__CPM_SALTA153_SIM || []), fermate: (window.__CPM_SALTA153 || []) }; });
  const simChiave = fin.sim.filter(x => x.chiave);
  ok(fin.sim.length > 0, `il tasto ha simulato ${fin.sim.length} gare`);
  ok(simChiave.length === 0, `nessuna partita chiave simulata dal tasto (${simChiave.length}${simChiave.length ? ': ' + JSON.stringify(simChiave.slice(0, 3)) : ''})`);
  ok(chiaviAperte === chiaviOk, `ogni fermata «partita chiave» lascia il prompt aperto e la gara non giocata (${chiaviOk}/${chiaviAperte})`);
  ok(fin.w > 38 && fin.s === 1, `stagione arrivata in fondo (S${fin.s} W${fin.w})`);
  ok(fin.lega === 34, `34 gare di lega nello storico (${fin.lega})`);
  ok(fin.dup.length === 0, `una gara per settimana, nessuna settimana ripetuta (${fin.dup.length ? fin.dup.join(',') : 'nessuna'})`);
  ok(fin.calGioc === fin.calTot && fin.calTot === 34, `calendario di lega tutto giocato (${fin.calGioc}/${fin.calTot})`);
  ok(fin.st === 18, `classifica a 18 righe (${fin.st})`);
  ok(errors.length === 0, `nessun errore di pagina${errors.length ? ' — ' + errors[0] : ''}`);
  note.push(`fermate «momento importante»: ${JSON.stringify(fin.fermate.filter(f => f.motivo === 'momento importante').map(f => 'W' + f.w + ' ' + f.chi + (f.imp ? ' ' + f.imp : '')))}`);
  note.push(`tocchi per la stagione: ${tocchi} (giri del tasto ${giri}) · fermate: ${JSON.stringify(fermate)} · gare simulate dal tasto ${fin.sim.length}, decisioni del mister ${JSON.stringify(fin.sim.reduce((a, x) => (a[x.dec] = (a[x.dec] || 0) + 1, a), {}))}`);
  await page.close();

  console.log('4) mercato ferma la corsa');
  {
    const W = await apri({ width: 412, height: 915 }, savePlayer({ week: 5, weekLived: false, campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1 }));
    await W.page.evaluate(() => { window.__CPM_SALTA153 = []; });
    await clicca(W.page, '[data-cpm="salta163-tasto"]'); await sleep(500); await clicca(W.page, '[data-cpm="salta163-vai"]');
    await sleep(150);
    const fo = await W.page.evaluate(() => window.__CPM_CAREER.forceOffer());
    const e = await aspettaFine(W.page, 30000); await sleep(400);
    const m = await W.page.evaluate(() => { const L = window.__CPM_SALTA153 || []; return { motivo: (L[L.length - 1] || {}).motivo, offerta: /offert|trasferiment|contratto/i.test(document.body.innerText) }; });
    ok(fo === true && m.motivo === 'mercato', `offerta durante la corsa → fermata «mercato» (offerta ${fo}, motivo ${m.motivo}, stato ${e})`);
    await W.page.close();
  }
  console.log('5) Ferma');
  {
    const W = await apri({ width: 1280, height: 800 }, savePlayer({ week: 3, campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1 }));
    await W.page.evaluate(() => { window.__CPM_SALTA153 = []; });
    await foto(W.page, 'tasto-pc');
    await clicca(W.page, '[data-cpm="salta163-tasto"]'); await sleep(500);
    await foto(W.page, 'conferma-pc');
    await clicca(W.page, '[data-cpm="salta163-vai"]'); await sleep(250);
    await foto(W.page, 'corsa-pc');
    const fe = await clicca(W.page, '[data-cpm="salta163-ferma"]');
    const e = await aspettaFine(W.page, 20000); await sleep(500);
    const m = await W.page.evaluate(() => { const L = window.__CPM_SALTA153 || []; return (L[L.length - 1] || {}).motivo; });
    ok(fe && (m === 'fermato da te' || m === 'partita chiave' || m === 'mercato'), `«Ferma» interrompe la corsa (motivo ${m}, stato ${e})`);
    await foto(W.page, 'riepilogo-pc');
    await W.page.close();
  }
  console.log('6) solo Primavera');
  {
    const W = await apri({ width: 412, height: 915 }, savePlayer({ proStatus: 'pro', week: 4, campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1, club: { id: 'milan', n: 'AC Dorvelli', a: 'ACR', p: 90, c: '#dc2626', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Lega A' } }));
    const t = await W.page.evaluate(() => !!document.querySelector('[data-cpm="salta163-tasto"]'));
    ok(!t, 'professionista: il tasto non c\'è');
    await W.page.close();
  }
} catch (e) { fails.push('eccezione: ' + (e && e.message)); console.log('  ✗ eccezione', e && e.message); }

await browser.close(); srv.close();
for (const n of note) console.log('  · ' + n);
console.log(`\nsalta-163 ${ROSSO ? '[BRACCIO ROSSO __CPM_NO_SALTA153]' : '[verde atteso]'}: ${oks.length} verdi, ${fails.length} rossi`);
console.log(fails.length ? 'ESITO: ROSSO' : 'ESITO: VERDE');
process.exit(fails.length ? 1 : 0);
