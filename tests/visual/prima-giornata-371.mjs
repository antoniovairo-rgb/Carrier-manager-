#!/usr/bin/env node
/* [giro 371 · PO-420] GUARDIANO prima-giornata-371 — «Il campionato parte da zero: alla 1ª giornata niente posizione in classifica
   né "scontro al vertice", c'è il pronostico».
   Gioco vero (?cpmtest=1), salvataggi sintetici alla settimana 1 (calendario e classifica rigenerati dal gioco, tutte a 0 punti),
   telefono 412x915 dpr 2. Casi: tre club di leghe diverse (prestigio alto/medio/basso), una Primavera, una gara di Coppa alla 1ª
   settimana. Su ogni caso:
     - card «Prossima» della Home: nessun «Nª in classifica», nessun «Nª» accanto alla forma, nessuna etichetta di classifica
       (vertice · capolista · retrocessione · scontro diretto); c'è «Pronostico: …» (salvo derby, che ha la precedenza);
     - scheda Stagione › Classifica: nessun «dalla vetta» / «sulla seconda»;
     - pre-partita (playMatch → matchday): nessuna posizione né etichetta di classifica.
   Non-regressione: dopo una giornata giocata (classifica con punti, la mia squadra con 1 gara) la card mostra di nuovo la posizione
   e NON il pronostico.
   Rosso window.__CPM_NO_G371 (le posizioni contano sempre, com'era) → DEVE essere bocciato su ogni caso di campionato.
   Foto (dpr 2) in docs/sviluppo/giro371/. Uscita 0 solo se il verde passa E il rosso e' bocciato. «Non giudicato» = rosso.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node prima-giornata-371.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { salva, apri } from './misura-199.mjs';

const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro371'); fs.mkdirSync(FOTO, { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const RE_POS = /\d+\s*ª(?!\s*giornata)(\s*in classifica)?/i;/* «1ª giornata» non e' una posizione */
const RE_ETI = /vertice|capolista|retrocessione|scontro diretto/i;
const RE_VETTA = /dalla vetta|sulla seconda/i;

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

/* i club dei casi, letti dal gioco (nessun nome scritto a mano) */
async function scegliClub() {
  const page = await browser.newPage(); await installCdnRoutes(page);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => typeof CLUBS !== 'undefined' && typeof U18_CLUBS !== 'undefined', null, { timeout: 60000 });
  const r = await page.evaluate(() => {
    const lgs = [...new Set(CLUBS.map(c => c.lg))];
    const by = (lg) => CLUBS.filter(c => c.lg === lg).sort((a, b) => b.p - a.p);
    const alto = by(lgs[0])[0], medio = by(lgs[1 % lgs.length])[3] || by(lgs[1 % lgs.length])[0], basso = by(lgs[2 % lgs.length]).slice(-1)[0];
    const u18 = U18_CLUBS[5] || U18_CLUBS[0];
    return { alto, medio, basso, u18 };
  });
  await page.close(); return r;
}
const pulisci = (c) => ({ id: c.id, n: c.n, a: c.a, p: c.p, c: c.c, c2: c.c2, nat: c.nat, lg: c.lg, ...(c.isU18 ? { isU18: true, name: c.name, prestige: c.prestige } : {}) });

async function misura(page) {
  return page.evaluate(() => {
    const c = document.querySelector('[data-cpm="prossima-v2"]');
    const p = window.__CPM_CAREER.snapshot();
    return { card: c ? c.innerText.replace(/\s+/g, ' ') : null, wk: p.week, pts: (p.standings || []).reduce((s, t) => s + (t.pts || 0), 0), nst: (p.standings || []).length };
  });
}
async function stagione(page) {
  await page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await sleep(700);
  const t = await page.evaluate(() => { const e = document.querySelector('[data-cpm="vetta-v2"]'); return { vetta: e ? e.innerText : null }; });
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(600);
  return t;
}
async function prepartita(page) {
  let r = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  if (r === 'opening') { await page.evaluate(() => { try { window.__CPM_CAREER.resolveOpening(); } catch (e) {} }); await sleep(500); r = await page.evaluate(() => window.__CPM_CAREER.playMatch()); }
  for (let i = 0; i < 20; i++) { await sleep(400); const ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'matchday') break; }
  const ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null);
  const tx = ph === 'matchday' ? await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')) : null;
  return { ph, tx };
}

try {
  const C = await scegliClub();
  const casi = [
    { k: 'alto', over: { club: pulisci(C.alto) } },
    { k: 'medio', over: { club: pulisci(C.medio) } },
    { k: 'basso', over: { club: pulisci(C.basso) } },
    { k: 'primavera', over: { club: pulisci(C.u18), proStatus: 'u18', age: 17 } },
  ];
  for (const fl of [[], ['__CPM_NO_G371']]) {
    const rosso = fl.length > 0;
    console.log(rosso ? '\nB) rosso __CPM_NO_G371: deve essere bocciato' : 'A) verde: 1ª giornata senza posizioni, c\'e\' il pronostico');
    for (const cs of casi) {
      const a = await apri(browser, port, salva({ week: 1, season: 3, calendar: undefined, standings: undefined, ...cs.over }), fl, 412, 915);
      const m = await misura(a.page);
      if (!m.card || m.wk !== 1 || m.pts !== 0 || m.nst < 4) { ok(false, `${cs.k}: non giudicato (card ${!!m.card}, settimana ${m.wk}, punti ${m.pts}, squadre ${m.nst})`); await a.page.close(); continue; }
      const derby = /derby|🔥/i.test(m.card);
      const pos = RE_POS.test(m.card), eti = RE_ETI.test(m.card), pron = /Pronostico:/.test(m.card);
      if (cs.k === 'alto') await a.page.screenshot({ path: path.join(FOTO, (rosso ? 'prima' : 'dopo') + '-home-1giornata-412.png') });
      if (!rosso) {
        const s = await stagione(a.page);
        if (cs.k === 'alto') { await a.page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await sleep(600); await a.page.screenshot({ path: path.join(FOTO, 'dopo-stagione-1giornata-412.png') }); await a.page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(500); }
        const pp = await prepartita(a.page);
        ok(!pos && !eti && (pron || derby) && !(s.vetta && RE_VETTA.test(s.vetta)) && pp.ph === 'matchday' && !RE_POS.test(pp.tx.replace(/Giornata \d+ di \d+/g, '')) && !RE_ETI.test(pp.tx) && !a.errors.length,
          `${cs.k} (${m.card.slice(0, 70)}…): posizione ${pos} · etichetta ${eti} · pronostico ${pron}${derby ? ' (derby)' : ''} · stagione «${s.vetta}» · pre-partita ${pp.ph} · errori ${a.errors.length}`);
      } else {
        ok(pos && !pron, `rosso ${cs.k} bocciato: posizione ${pos} · pronostico ${pron}`);
      }
      await a.page.close();
    }
  }
  console.log('\nC) verde: dopo la 1ª giornata giocata la posizione torna, il pronostico no');
  { const a = await apri(browser, port, salva({ week: 1, season: 3, calendar: undefined, standings: undefined, club: pulisci(C.alto) }), [], 412, 915);
    await a.page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const cid = p.club.id;
      const st = (p.standings || []).map((t, i) => ({ ...t, played: 1, pts: i % 3 === 0 ? 3 : i % 3 === 1 ? 1 : 0, wins: i % 3 === 0 ? 1 : 0, draws: i % 3 === 1 ? 1 : 0, losses: i % 3 === 2 ? 1 : 0 }));
      const wk = 2; const cal = (p.calendar || []).map(m => m.week === 1 ? { ...m, played: true, result: 'W' } : m);
      window.__CPM_CAREER.patch({ standings: st, week: wk, calendar: cal }); window.__CPM_CAREER.goTab('dashboard'); });
    await sleep(1200); await a.page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }); await sleep(400);
    const m = await misura(a.page);
    ok(!!m.card && m.pts > 0 && RE_POS.test(m.card) && !/Pronostico:/.test(m.card), `dopo la giornata: «${(m.card || '').slice(0, 110)}»`);
    await a.page.close(); }

  console.log('\nD) verde: gara di Coppa alla 1ª settimana, nessuna posizione dal campionato');
  { const a = await apri(browser, port, salva({ week: 1, season: 3, calendar: undefined, standings: undefined, club: pulisci(C.medio) }), [], 412, 915);
    const fatto = await a.page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const lg = (p.calendar || []).find(m => m.week === 1 && (!m.type || m.type === 'league'));
      if (!lg) return false; const cal = (p.calendar || []).map(m => m === lg ? { ...m, week: 3 } : m);
      cal.push({ matchday: 0, week: 1, type: 'cup', opponentId: lg.opponentId, opponentName: lg.opponentName, isHome: true, played: false });
      window.__CPM_CAREER.patch({ calendar: cal }); window.__CPM_CAREER.goTab('dashboard'); return true; });
    await sleep(1000); await a.page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }); await sleep(400);
    const m = await misura(a.page);
    ok(fatto && !!m.card && /coppa/i.test(m.card) && !RE_POS.test(m.card) && !RE_ETI.test(m.card), `coppa: «${(m.card || 'non giudicato').slice(0, 110)}»`);
    await a.page.close(); }

  console.log('\nE) regola pura: classificaViva371 / pronostico371');
  { const page = await browser.newPage(); await installCdnRoutes(page);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => !!window.__CPM_VIVA371, null, { timeout: 60000 });
    const r = await page.evaluate(() => {
      const V = window.__CPM_VIVA371, P = window.__CPM_PRON371;
      const zero = [{ id: 'a', pts: 0, played: 0 }, { id: 'b', pts: 0, played: 0 }];
      const dopo = [{ id: 'a', pts: 3, played: 1 }, { id: 'b', pts: 0, played: 1 }];
      const rinv = [{ id: 'a', pts: 0, played: 0 }, { id: 'b', pts: 3, played: 1 }];
      return [V(zero, 'a') === false, V(dopo, 'b') === true, V(rinv, 'a') === false, V(rinv, 'b') === true,
        /favoriti/.test(P(80, 70, true)), /sfavoriti/.test(P(60, 70, false)), /aperta/.test(P(70, 70, true)), P(null, 70, true) === null,
        P(75, 70, true) === P(75, 70, true)];
    });
    ok(r.every(Boolean), 'regola: ' + r.map(x => x ? '✓' : '✗').join(''));
    await page.close(); }
} finally { await browser.close(); srv.close(); }
console.log(fails.length ? `\n✗ prima-giornata-371 ROSSO (${fails.length})` : '\n✓ prima-giornata-371 VERDE');
process.exit(fails.length ? 1 : 0);
