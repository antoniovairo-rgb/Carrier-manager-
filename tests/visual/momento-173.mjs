#!/usr/bin/env node
/* [giro 173 · PO-364, decisioni PO e sessione madre 12/11] GUARDIANO momento-173 — rifiniture del tasto «Vai al prossimo momento»
   (giri 165/165b) e della partita «solo momenti salienti» (giro 166), unite. Sul gioco vero (?cpmtest=1) giudica:
   1. CLASSIFICA (pura, storia165b sugli impulsi veri): gli sponsor (wi_sponsor, wi_sponsor_auto, wi_sponsor_pers) sono «offerta»
      (punto 4); il mister si riconosce da un ELENCO di id (punto 5): wi_figlia_mister, wi_vice_infortunato, wi_infortunato_posto e lo
      spogliatoio sm_crisis → «mister»; wi_giornata_libera, wi_pioggia_scelta, wi_primo_mister → routine; uno spogliatoio che nomina il
      mister ma non e' nell'elenco → routine; il salvataggio non cambia.
   2. RINNOVO (punto 6): con la card del contratto in scadenza il tasto e' spento col motivo «Prima rispondi al rinnovo»; toccandolo si
      apre la trattativa del rinnovo e non parte nessuna corsa; rifiutato (pulsante vero) il tasto torna normale e la corsa non si
      ferma sul rinnovo.
   3. BOTTONE DEI MOMENTI SALIENTI (punto 1): segue posta165 — con la 100ª presenza in arrivo (posta165 = traguardo, peso < 5) non c'e';
      con una partita senza posta c'e'; la nota lo spiega.
   4. PARTITA A SOLI HIGHLIGHT (punti 2-3): un gol dei compagni o degli avversari nel gioco veloce mostra l'avviso («GOL! <nome> <min>'»
      o «Gol subito · <nome> <min>'») per circa 2 s (1,6-3,0 s) col minuto fermo, poi si riparte; il tasto della velocita' non c'e' in
      nessuna fase della partita a soli highlight, e c'e' nella partita intera.
   Braccio rosso: CPM_ROSSO173=1 accende __CPM_NO_G173 → il guardiano DEVE uscire 1. «Non giudicato» (nessun gol nel gioco veloce,
   partita non montata) = rosso. Foto: CPM_FOTO173=<cartella> (telefono 375 px e PC: avviso del gol, tasto spento col motivo).
   CPM_SOLO173=1,2,… gira solo alcune sezioni. CPM_G173_NOME cambia la partita della sezione 4.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node momento-173.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166 } from './lib/partita-166.mjs';
import fs from 'fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';

const ROSSO = process.env.CPM_ROSSO173 === '1';
const FOTO = process.env.CPM_FOTO173 || '';
const NOME4 = process.env.CPM_G173_NOME || 'Collaudo Salienti';
const SOLO = (process.env.CPM_SOLO173 || '').split(',').filter(Boolean);
const fai = (n) => !SOLO.length || SOLO.includes(String(n));
const fails = [], oks = [], note = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const SALENTO = { id: 'lec', n: 'FC Salento', a: 'SLN', p: 62, c: '#f5c518', c2: '#dc2626', nat: '🇮🇹', lg: 'Lega A' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
function savePro(over = {}) {
  const s = 72;
  return { name: 'Guardiano Momento', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, weekLived: false, age: 22, ovr: s, tutorialDone: true, position: 'ATT',
    club: SALENTO, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 75, popularity: 40, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1, ...AP, ...over };
}
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const init173 = ROSSO ? { __CPM_NO_G173: true } : {};

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(vp, player) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: FOTO ? 2 : 1 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, rosso]) => {
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (rosso) window.__CPM_NO_G173 = 1;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl }));
  }, [player, ROSSO]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(1200);
  await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; });
  await sleep(800);
  return { page, errors };
}
const tasto = (page) => page.evaluate(() => { const t = document.querySelector('[data-cpm="salta163-tasto"]'); const m = document.querySelector('[data-cpm="salta163-motivo"]');
  const st = document.querySelector('[data-cpm="salta163"]');
  return { c: !!t, spento: !!(t && (t.disabled || t.getAttribute('aria-disabled') === 'true')), motivo: m ? m.innerText.trim() : null, fase: st ? st.getAttribute('data-salta163') : null }; });
const negoAperta = (page) => page.evaluate(() => [...document.querySelectorAll('button')].some(b => /^(Chiedi \+15%|Chiedi \+30%|Ho capito|Accetta l'offerta del club)/.test((b.textContent || '').trim())));

try {
  /* ---------- 1. classifica ---------- */
  if (fai(1)) {
    console.log('1) sponsor = offerta · mister da un elenco di id');
    const { page, errors } = await apri({ width: 412, height: 915 }, savePro({ week: 6 }));
    const r = await page.evaluate(() => {
      const C = window.__CPM_CAREER, J0 = JSON.stringify(C.snapshot());
      const wl = (id) => { const im = WEEKLY_IMPULSES.find(x => x.id === id); return im ? { isImpulse: true, impId: id, cat: im.cat, event: { txt: String(im.txt || '') }, choices: im.choices || [] } : null; };
      const q = (id) => { const w = wl(id); return w ? C.storia165b(w) : 'assente'; };
      const sm = (id) => { const m = SPOGLIATOIO_MOMENTS.find(x => x.id === id); return C.storia165b({ isSpogliatoio: true, smId: id, event: { txt: String((m && m.txt) || '') }, choices: (m && m.choices) || [{ txt: 'a' }, { txt: 'b' }] }); };
      const out = {};
      for (const id of ['wi_sponsor', 'wi_sponsor_auto', 'wi_sponsor_pers', 'wi_figlia_mister', 'wi_vice_infortunato', 'wi_infortunato_posto', 'wi_giornata_libera', 'wi_pioggia_scelta', 'wi_primo_mister']) out[id] = q(id);
      out.sm_crisis = sm('sm_crisis');
      out.spoFuori = C.storia165b({ isSpogliatoio: true, smId: 'sm_prova173', event: { txt: 'Il mister vi ha visti litigare: vuole parlarti.' }, choices: [{ txt: 'a' }, { txt: 'b' }] });
      out.conti = { storia: 0, routine: 0, tipi: {} };
      for (const im of WEEKLY_IMPULSES) { if ((im.choices || []).length < 2) continue; const t = C.storia165b(wl(im.id)); if (t) { out.conti.storia++; out.conti.tipi[t] = (out.conti.tipi[t] || 0) + 1; } else out.conti.routine++; }
      out.spo = { storia: 0, routine: 0 }; for (const m of SPOGLIATOIO_MOMENTS) { if ((m.choices || []).length < 2) continue; if (sm(m.id)) out.spo.storia++; else out.spo.routine++; }
      out.due = q('wi_sponsor') === q('wi_sponsor') && q('wi_giornata_libera') === q('wi_giornata_libera');
      out.puro = JSON.stringify(C.snapshot()) === J0;
      return out;
    });
    ok(r.wi_sponsor === 'offerta' && r.wi_sponsor_auto === 'offerta' && r.wi_sponsor_pers === 'offerta', `sponsor → «offerta» (wi_sponsor ${r.wi_sponsor}, wi_sponsor_auto ${r.wi_sponsor_auto}, wi_sponsor_pers ${r.wi_sponsor_pers})`);
    ok(r.wi_figlia_mister === 'mister' && r.wi_vice_infortunato === 'mister' && r.wi_infortunato_posto === 'mister' && r.sm_crisis === 'mister', `elenco mister → «mister» (figlia ${r.wi_figlia_mister}, vice ${r.wi_vice_infortunato}, posto ${r.wi_infortunato_posto}, sm_crisis ${r.sm_crisis})`);
    ok(r.wi_giornata_libera === null && r.wi_pioggia_scelta === null && r.wi_primo_mister === null, `routine fuori elenco (giornata libera ${r.wi_giornata_libera}, pioggia ${r.wi_pioggia_scelta}, primo allenatore ${r.wi_primo_mister})`);
    ok(r.spoFuori === null, `spogliatoio che nomina il mister ma fuori elenco → routine (${r.spoFuori})`);
    ok(r.due && r.puro, `stessa risposta due volte (${r.due}) e salvataggio intatto (${r.puro})`);
    ok(errors.length === 0, `nessun errore di pagina${errors.length ? ' — ' + errors[0] : ''}`);
    note.push(`catalogo (impulsi con almeno due scelte): ${r.conti.storia} di storia, ${r.conti.routine} di routine · per tipo ${JSON.stringify(r.conti.tipi)} · spogliatoio ${JSON.stringify(r.spo)}`);
    await page.close();
  }

  /* ---------- 2. rinnovo: tasto spento col motivo, il tocco apre la trattativa ---------- */
  for (const [vp, nomeF] of (fai(2) ? [[{ width: 375, height: 812 }, 'telefono'], ...(FOTO ? [[{ width: 1280, height: 800 }, 'pc']] : [])] : [])) {
    console.log(`2) rinnovo aperto (${vp.width} px)`);
    const W = await apri(vp, savePro({ week: 28, contract: { duration: 1, wage: 6000, expiresAtSeason: 3 }, coachTrust: 80 }));
    const a = await tasto(W.page); const card = await W.page.evaluate(() => !!document.querySelector('[data-cpm="rinnovo94"]'));
    if (FOTO) { const el = await W.page.$('[data-cpm="corsa163"]'); if (el) { await el.scrollIntoViewIfNeeded(); await sleep(300); await el.screenshot({ path: `${FOTO}/tasto-rinnovo-${nomeF}.png` }); } await W.page.screenshot({ path: `${FOTO}/tasto-rinnovo-${nomeF}-schermo.png` }); }
    if (nomeF === 'telefono') ok(a.c && a.spento && a.motivo === 'Prima rispondi al rinnovo' && card, `tasto spento col motivo «${a.motivo}» (spento ${a.spento}, card del rinnovo ${card})`);
    await W.page.evaluate(() => { const t = document.querySelector('[data-cpm="salta163-tasto"]'); if (t) t.click(); }); await sleep(700);
    const n1 = await negoAperta(W.page); const b = await tasto(W.page); const L1 = await W.page.evaluate(() => (window.__CPM_SALTA153 || []).length);
    if (FOTO && n1) await W.page.screenshot({ path: `${FOTO}/trattativa-dal-tasto-${nomeF}.png` });
    if (nomeF === 'telefono') ok(n1 && b.fase !== 'corsa' && b.fase !== 'conferma' && L1 === 0, `toccandolo si apre la trattativa del rinnovo (${n1}) e non parte nessuna corsa (fase ${b.fase}, fermate ${L1})`);
    if (nomeF === 'telefono') {
      let via = 'nessuna';
      try {
        if (!n1) { await W.page.locator('[data-cpm="rinnovo94"] button').first().click({ timeout: 5000 }); await sleep(600); }
        const ho = W.page.getByText('Ho capito', { exact: true });
        if (await ho.count()) { await ho.first().click(); via = 'Ho capito'; }
        else {
          await W.page.getByText('Chiedi +30%', { exact: false }).first().click({ timeout: 5000 }); await sleep(600);
          for (const t of ['Rifiuta', 'Chiudi']) { const bb = W.page.getByText(t, { exact: true }); if (await bb.count()) { await bb.first().click(); via = t; break; } }
        }
      } catch (e) { via = 'errore: ' + e.message.slice(0, 80); }
      await sleep(600);
      if (!['Ho capito', 'Rifiuta', 'Chiudi'].includes(via)) { await W.page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.rifiuta165b(); }); await sleep(500); via += ' → rifiuto dal gancio'; }
      const c = await tasto(W.page);
      await W.page.evaluate(() => { window.__CPM_SALTA153 = []; const t = document.querySelector('[data-cpm="salta163-tasto"]'); if (t) t.click(); }); await sleep(500);
      await W.page.evaluate(() => { const v = document.querySelector('[data-cpm="salta163-vai"]'); if (v) v.click(); }); await sleep(600);
      const t0 = Date.now(); while (Date.now() - t0 < 120000) { const f = await tasto(W.page); if (f.fase !== 'corsa') break; await sleep(400); }
      const L = await W.page.evaluate(() => (window.__CPM_SALTA153 || []).map(f => f.motivo));
      ok(!c.spento && !c.motivo && L.length > 0 && !L.includes('rinnovo'), `dopo il rifiuto (${via}) il tasto torna normale (spento ${c.spento}, motivo ${c.motivo}) e la corsa non si ferma sul rinnovo (${JSON.stringify(L)})`);
    }
    if (nomeF === 'telefono') ok(W.errors.length === 0, `nessun errore di pagina${W.errors.length ? ' — ' + W.errors[0] : ''}`);
    await W.page.close();
  }

  /* ---------- 3. bottone dei momenti salienti con la posta allargata ---------- */
  if (fai(3)) {
    console.log('3) il bottone dei momenti salienti segue posta165');
    const A = await apriCarriera166({ init: init173 });
    try {
      const p0 = A.W ? await apriPrompt166(A.page) : { solo: false, bottoni: [] };
      const k0 = await A.page.evaluate(() => window.__CPM_CAREER.posta165());
      ok(!!A.W && p0.solo && k0 === null && /momenti salienti/i.test(p0.bottoni.join('|')), `partita senza posta (posta165 ${JSON.stringify(k0)}) → il bottone c'è`);
      await A.page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300);
      await A.page.evaluate(() => window.__CPM_CAREER.patch({ totalMatches: 99 })); await sleep(400);
      const k1 = await A.page.evaluate(() => window.__CPM_CAREER.posta165()); const a1 = await A.page.evaluate(() => window.__CPM_CAREER.avv166 ? window.__CPM_CAREER.avv166() : null);
      const p1 = await apriPrompt166(A.page);
      ok(!!k1 && !!a1 && a1.peso < 5 && !p1.solo && p1.bottoni.length >= 2, `100ª presenza in arrivo (posta165 «${k1}», peso ${a1 ? a1.peso : '?'}) → nessun bottone (bottoni ${JSON.stringify(p1.bottoni)})`);
      ok(A.errs.length === 0, `nessun errore di pagina${A.errs.length ? ' — ' + A.errs[0] : ''}`);
    } catch (e) { ok(false, 'flusso del prompt: ' + String(e.message).slice(0, 140)); }
    await A.b.close(); A.srv.close();
  }

  /* ---------- 4. partita a soli highlight: avviso sul gol e niente velocita' ---------- */
  if (fai(4)) {
    console.log(`4) soli highlight: avviso sul gol, tasto della velocità (partita «${NOME4}»)`);
    const vel = (page) => page.evaluate(() => [...document.querySelectorAll('button[aria-label]')].some(b => /^Velocità della partita/.test(b.getAttribute('aria-label') || '') && b.offsetParent !== null));
    /* 4a. partita intera: il tasto della velocita' c'e' (si guarda appena si gioca e ci si ferma) */
    {
      const A = await apriCarriera166({ init: init173, nome: NOME4 });
      let visto = false, fase = null;
      try {
        await apriPrompt166(A.page);
        await A.page.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca la partita/.test((x.textContent || '').trim())); if (b) b.click(); });
        const t0 = Date.now();
        while (Date.now() - t0 < 60000) { fase = await A.page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
          if (fase === 'playing') { await sleep(500); visto = await vel(A.page); break; }
          await A.page.evaluate(() => { if (typeof window.__CPM_AUTOPLAY === 'function' && !window.__a173) { window.__a173 = 1; window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }); } const B = [...document.querySelectorAll('button')].filter(x => /^(Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok)/i.test((x.textContent || '').trim())); if (B.length) B[B.length - 1].click(); }).catch(() => {});
          await sleep(400); }
      } catch (e) {}
      ok(fase === 'playing' && visto, `partita intera: il tasto della velocità c'è (fase ${fase}, visto ${visto})`);
      await A.b.close(); A.srv.close();
    }
    /* 4b. partita a soli highlight */
    for (const [vp, nomeF, mob] of [[{ width: 375, height: 812 }, 'telefono', true], ...(FOTO ? [[{ width: 1366, height: 768 }, 'pc', false]] : [])]) {
      const A = await apriCarriera166({ init: init173, nome: NOME4, vp, mobile: mob && !!FOTO });
      const avvisi = []; let velVisto = false, velCamp = 0, finita = false, fasiViste = {}, cur = null, fotoFatta = false, minMax = 0; const t0 = Date.now();
      try {
        const p = await apriPrompt166(A.page);
        if (!p.solo) throw new Error('bottone dei momenti salienti assente');
        await A.page.evaluate(() => document.querySelector('[data-cpm="solo-166"]').click());
        let auto = false;
        while (Date.now() - t0 < 300000) {
          const s = await A.page.evaluate(() => { const g = document.querySelector('[data-cpm="gol-173"]'); const f = window.__CPM_PHASE ? window.__CPM_PHASE() : null;
            return { f, g: g ? { txt: g.textContent.trim(), lato: g.getAttribute('data-lato') } : null, c: window.__CPM_BALL3 ? ((window.__CPM_BALL3() || {}).c | 0) : null,
              v: [...document.querySelectorAll('button[aria-label]')].some(b => /^Velocità della partita/.test(b.getAttribute('aria-label') || '') && b.offsetParent !== null), ap: typeof window.__CPM_AUTOPLAY === 'function' }; }).catch(() => null);
          if (!s) { await sleep(100); continue; }
          if (!auto && s.ap && /matchday|formations|walkout|playing/.test(String(s.f))) { auto = true; await A.page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 })); }
          if (!auto) await A.page.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(x => /^(Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok)/i.test((x.textContent || '').trim())); if (B.length) B[B.length - 1].click(); }).catch(() => {});
          if (s.f) fasiViste[s.f] = 1;
          if (s.c != null) minMax = Math.max(minMax, s.c);
          if (/^(playing|hl_)/.test(String(s.f))) { velCamp++; if (s.v) velVisto = true; }
          const now = Date.now();
          if (s.g) { if (!cur) { cur = { txt: s.g.txt, lato: s.g.lato, t0: now, c0: s.c, cMax: s.c }; avvisi.push(cur); } else cur.cMax = Math.max(cur.cMax, s.c); cur.t1 = now;
            if (FOTO && !fotoFatta && now - cur.t0 > 300) { fotoFatta = true; await A.page.screenshot({ path: `${FOTO}/avviso-gol-${nomeF}.png` }); } }
          else if (cur) { cur.dur = cur.t1 - cur.t0; cur = null; }
          if (s.f === 'ended') { finita = true; break; }
          await sleep(80);
        }
      } catch (e) { note.push(`${nomeF}: ${String(e.message).slice(0, 140)}`); }
      if (cur) cur.dur = cur.t1 - cur.t0;
      const log = await A.page.evaluate(() => window.__CPM_GOL173 || []).catch(() => []);
      const ev = await A.page.evaluate(() => ((window.__CPM_EV && window.__CPM_EV()) || []).filter(e => e.ev === 'goal')).catch(() => []);
      if (nomeF === 'telefono') {
        const testoOk = avvisi.every(a => (a.lato === 'noi' ? /^GOL! \S.* \d+'$/ : /^Gol subito · \S.* \d+'$/).test(a.txt));
        const durOk = avvisi.every(a => a.dur >= 1600 && a.dur <= 3000);
        const fermo = avvisi.every(a => a.cMax - a.c0 <= 0);
        ok(finita && avvisi.length >= 1 && log.length === avvisi.length, `gol nel gioco veloce → avviso (${avvisi.length} avvisi, testimone ${log.length}, partita finita ${finita}, minuto ${minMax}${avvisi.length ? '' : ' · NON GIUDICATO'})`);
        ok(avvisi.length >= 1 && testoOk, `testo dell'avviso: ${JSON.stringify(avvisi.map(a => a.txt))}`);
        ok(avvisi.length >= 1 && durOk && fermo, `circa 2 s col minuto fermo, poi si riparte (durate ${JSON.stringify(avvisi.map(a => a.dur))} ms, minuto fermo ${fermo})`);
        ok(velCamp > 20 && !velVisto, `il tasto della velocità non c'è nella partita a soli highlight (${velCamp} campioni in gioco, visto ${velVisto})`);
        ok(A.errs.length === 0, `nessun errore di pagina${A.errs.length ? ' — ' + A.errs[0] : ''}`);
        note.push(`sezione 4: durata reale ${((Date.now() - t0) / 1000).toFixed(1)} s · gol nel registro ${JSON.stringify(ev.map(e => e.min + "' " + e.side + ' ' + e.src))} · avvisi ${JSON.stringify(avvisi.map(a => ({ t: a.txt, ms: a.dur })))}`);
      }
      await A.b.close(); A.srv.close();
    }
  }
} catch (e) { fails.push('eccezione: ' + (e && e.message)); console.log('  ✗ eccezione', e && e.message); }

await browser.close(); srv.close();
for (const n of note) console.log('  · ' + n);
console.log(`\nmomento-173 ${ROSSO ? '[BRACCIO ROSSO __CPM_NO_G173]' : '[verde atteso]'}: ${oks.length} verdi, ${fails.length} rossi`);
console.log(fails.length ? 'ESITO: ROSSO' : 'ESITO: VERDE');
process.exit(fails.length ? 1 : 0);
