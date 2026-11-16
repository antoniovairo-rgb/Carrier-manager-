#!/usr/bin/env node
/* [giro 218 · PO-483] GUARDIANO calendario-218 — foto del PO (7.999.194, telefono) «Illeggibile così»: nella scheda STAGIONE
   (Coppe), blocco CALENDARIO della coppa europea, le righe giocate avevano fondi CHIARI cablati (#dcfce7 vinta · #fffbeb pari ·
   #fee2e2 persa) sotto il testo del tema notte (#f4f1ea): «FC Merseyside vs FC Lumeranza» a ~1,1:1. Stesso fondo chiaro
   cablato (#fffbeb) sulle righe «tua partita» del TABELLONE della Coppa Nazionale (scheda Calendario e scheda Coppe) e sulla tua
   riga dei CAPOCANNONIERI di Coppa.
   Sul gioco vero (?cpmtest=1), salvataggio sintetico da professionista con: calendario di lega (vinta/pari/persa/da giocare),
   coppa nazionale (tabellone con la tua gara, marcatori), coppa europea (girone G1..G6 con vinta/persa/pari + gara da giocare,
   turno a eliminazione giocato e da giocare). Si aprono le schede Calendario · Coppe · Nazionale a 375×667 (touch) e 1366×768,
   ciascuna con la preferenza vecchia `cpm-dark` = "1" e = "0" (il gioco ha UN tema solo dal giro V2/4: i due «temi» devono dare
   lo stesso esito, ed e' cosi' che il guardiano copre la richiesta «tema chiaro e scuro»).
   Per OGNI elemento con testo proprio visibile: contrasto WCAG fra il colore del testo (con alfa e opacita') e il fondo
   effettivo (composizione dei fondi degli antenati; con un gradiente vale lo stop peggiore). Verde: tutti ≥ 4,5:1, e le righe
   del calendario europeo ci sono davvero in TUTTI gli stati (vinta · persa · pari · da giocare · eliminazione) — altrimenti
   «non giudicato» = rosso. Nomi delle squadre nel calendario europeo: mai tagliati coi puntini (text-overflow ellipsis con testo
   che non ci sta) — si scende sulla scala dei nomi (NomeSquadra182).
   Rosso: CPM_ROSSO218=1 accende window.__CPM_NO_G218 (righe di prima) → DEVE uscire 1.
   Foto: CPM_FOTO218=<cartella>. Uso: cd tests/visual && node calendario-218.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO218 === '1';
const FOTO = process.env.CPM_FOTO218 || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const SOGLIA = 4.5;
const VISTE = [{ nome: '375', vp: { width: 375, height: 667 }, touch: true }, { nome: 'pc', vp: { width: 1366, height: 768 }, touch: false }];
const TEMI = ['1', '0'];
const TABS = ['coppe', 'calendar', 'nazionale'];
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const errors = [];

const CLUB = { id: 'cal218', n: 'FC Merseyside', a: 'MER', p: 84, c: '#c8102e', c2: '#ffffff', nat: '🏴', lg: 'Lega A' };

async function apri(v, tema) {
  const ctx = await browser.newContext({ viewport: v.vp, deviceScaleFactor: FOTO ? 2 : 1, hasTouch: v.touch, isMobile: v.touch });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(({ rosso, club, tema }) => {
    window.__CPM_GLB = false; window.__CPM_FIS_APERTE = 1; if (rosso) window.__CPM_NO_G218 = 1;
    const s = 80;
    const save = { phase: 'career', player: { name: 'Collaudo Calendario', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 24, weekLived: false, age: 23, ovr: s, tutorialDone: true, position: 'ATT',
      club, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
      form: 70, morale: 72, fatigue: 10, coachTrust: 70, popularity: 40, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1 } };
    try { localStorage.setItem('cpm-v3', JSON.stringify(save)); localStorage.setItem('cpm-dark', tema); localStorage.removeItem('cpm-active-tab'); } catch (e) {}
  }, { rosso: ROSSO, club: CLUB, tema });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  await sleep(800);
  /* stato iniettato dopo il caricamento (la migration non lo riscrive): tutti gli stati di riga */
  await page.evaluate(() => {
    const C = window.__CPM_CAREER;
    const opp = [
      { id: 'o1', n: 'FC Lumeranza', a: 'LUM', p: 80, c: '#1d4ed8', c2: '#fff', nat: '🇫🇷' },
      { id: 'o2', n: 'FC Alkmaar', a: 'ALK', p: 78, c: '#dc2626', c2: '#fff', nat: '🇳🇱' },
      { id: 'o3', n: 'FC Bergamo', a: 'BER', p: 81, c: '#1e3a8a', c2: '#000', nat: '🇮🇹' }];
    const R = (won, drew, h, a) => ({ won, drew, homeScore: h, awayScore: a });
    const cal = [
      { matchday: 1, week: 2, opponentId: 'x1', opponentName: 'FC Valmora', isHome: true, played: true, result: R(true, false, 2, 0) },
      { matchday: 2, week: 3, opponentId: 'x2', opponentName: 'FC Brenvar', isHome: false, played: true, result: R(false, true, 1, 1) },
      { matchday: 3, week: 4, opponentId: 'x3', opponentName: 'FC Salento', isHome: true, played: true, result: R(false, false, 0, 1) },
      { matchday: 101, week: 5, type: 'euro_group', opponentId: 'o1', opponentName: 'FC Lumeranza', isHome: true, played: true, result: R(true, false, 3, 0) },
      { matchday: 102, week: 7, type: 'euro_group', opponentId: 'o2', opponentName: 'FC Alkmaar', isHome: false, played: true, result: R(false, false, 2, 1) },
      { matchday: 103, week: 10, type: 'euro_group', opponentId: 'o3', opponentName: 'FC Bergamo', isHome: true, played: true, result: R(true, false, 1, 0) },
      { matchday: 104, week: 12, type: 'euro_group', opponentId: 'o1', opponentName: 'FC Lumeranza', isHome: false, played: true, result: R(false, true, 0, 0) },
      { matchday: 105, week: 14, type: 'euro_group', opponentId: 'o2', opponentName: 'FC Alkmaar', isHome: true, played: true, result: R(true, false, 2, 0) },
      { matchday: 106, week: 16, type: 'euro_group', opponentId: 'o3', opponentName: 'FC Bergamo', isHome: false, played: false },
      { matchday: 107, week: 20, type: 'euro', euroPhase: 'r16', cupRoundName: 'Ottavi di Finale', opponentId: 'o4', opponentName: 'Sporting Valparaiso Atletico Primavera', isHome: true, played: true, result: R(true, false, 2, 1) },
      { matchday: 108, week: 26, type: 'euro', euroPhase: 'quarters', cupRoundName: 'Quarti di Finale', opponentId: 'o5', opponentName: 'FC Valdoria', isHome: false, played: false },
      { matchday: 4, week: 30, opponentId: 'x4', opponentName: 'FC Ostravia', isHome: true, played: false },
      { matchday: 201, week: 31, type: 'cup', cupRoundName: 'Semifinale', opponentId: 'x5', opponentName: 'FC Corvina', isHome: true, played: false }];
    const euro = { active: true, competition: 'UCL', groupOpponents: opp, groupResults: [{ hs: 3, as: 0, opp: 'FC Lumeranza' }, { hs: 1, as: 2, opp: 'FC Alkmaar' }, { hs: 1, as: 0, opp: 'FC Bergamo' }, { hs: 0, as: 0, opp: 'FC Lumeranza' }, { hs: 2, as: 0, opp: 'FC Alkmaar' }],
      koResults: [{ phase: 'r16', won: true, opponent: 'Sporting Valparaiso', homeScore: 2, awayScore: 1 }] };
    const pid = 'cal218';
    const cup = { round: 3, nextWeek: 31, eliminated: false, champion: false, club: pid,
      results: [{ name: 'Ottavi di Finale', won: true, opponent: 'FC Ostravia', homeScore: 2, awayScore: 0 }, { name: 'Quarti di Finale', won: true, opponent: 'FC Corvina', homeScore: 1, awayScore: 0 }],
      cupBracketMatches: { r16: [{ home: pid, away: 'x4', homeScore: 2, awayScore: 0, winner: pid, isPlayer: true }, { home: 'x6', away: 'x7', homeScore: 1, awayScore: 3, winner: 'x7' }],
        quarters: [{ home: 'x5', away: pid, homeScore: 0, awayScore: 1, winner: pid, isPlayer: true }, { home: 'x8', away: 'x7', homeScore: 2, awayScore: 2, winner: 'x8' }] } };
    const mh = [{ competition: 'cup', type: 'cup', goals: 3, assists: 0, won: true, season: 3 }];
    C.patch({ calendar: cal, euro, cup, matchHistory: mh, cupGoals: 3 });
  });
  await sleep(500);
  return page;
}

/* contrasto WCAG di ogni testo visibile dentro la scheda aperta */
async function misura(page) {
  return page.evaluate(() => {
    const parse = (s) => { const m = String(s || '').match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
    const allCols = (s) => (String(s || '').match(/rgba?\([^)]+\)/g) || []).map(parse).filter(Boolean);
    const over = (top, bot) => { const a = top.a; return { r: top.r * a + bot.r * (1 - a), g: top.g * a + bot.g * (1 - a), b: top.b * a + bot.b * (1 - a), a: 1 }; };
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    /* fondi possibili sotto l'elemento: si risale componendo; un gradiente moltiplica i casi (uno per stop) */
    const fondi = (el) => {
      const strati = [];
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const cs = getComputedStyle(e);
        const lay = [];
        const bi = cs.backgroundImage; if (bi && bi !== 'none' && /gradient/.test(bi)) lay.push(allCols(bi));
        const bc = parse(cs.backgroundColor); if (bc && bc.a > 0) lay.push([bc]);
        strati.push(...lay);
        if (bc && bc.a >= 1) break;
      }
      let casi = [{ r: 13, g: 15, b: 20, a: 1 }];/* sotto tutto: il fondo del tema */
      for (let i = strati.length - 1; i >= 0; i--) { const n = []; for (const base of casi) for (const c of strati[i]) n.push(over(c, base)); casi = n.slice(0, 64); }
      return casi;
    };
    const out = [];
    const root = document.getElementById('root');
    const all = root.querySelectorAll('*');
    for (const el of all) {
      let txt = ''; for (const n of el.childNodes) if (n.nodeType === 3) txt += n.textContent;
      txt = txt.replace(/\s+/g, ' ').trim();
      if (!txt || !/[A-Za-z0-9À-ú]/.test(txt)) continue;
      const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      let op = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity || '1');
      if (op < 0.05) continue;
      if (el.closest('nav,[data-cpm="nav-basso"],[data-cpm="barra-bassa"]')) continue;
      const fc = parse(cs.color); if (!fc) continue;
      let peggio = 99, fondo = null;
      for (const b of fondi(el)) { const t = over({ ...fc, a: fc.a * op }, b); const c = cr(t, b); if (c < peggio) { peggio = c; fondo = b; } }
      const riga = el.closest('[data-cpm="cal-euro-218"]');
      const ell = el.scrollWidth > el.clientWidth + 0.5 && cs.overflow !== 'visible';/* testo che non ci sta: puntini o ritaglio */
      out.push({ txt: txt.slice(0, 60), c: Math.round(peggio * 100) / 100, col: cs.color, fondo: fondo ? `rgb(${Math.round(fondo.r)},${Math.round(fondo.g)},${Math.round(fondo.b)})` : '', riga: riga ? riga.getAttribute('data-stato218') : null, ell, n182: el.getAttribute('data-nome182') });
    }
    const righe = []; document.querySelectorAll('[data-cpm="cal-euro-218"]').forEach(e => { righe.push(e.getAttribute('data-stato218')); if (e.getAttribute('data-ko218') === '1') righe.push('eliminazione'); });
    return { out, righe };
  });
}

const statiVisti = new Set();
let righeTot = 0;
for (const v of VISTE) for (const tema of TEMI) {
  const page = await apri(v, tema);
  /* la scheda Coppe si misura con le TRE coppe europee (testi e fondi dipendono dalla competizione) */
  const giri = []; for (const tab of TABS) { if (tab === 'coppe') for (const comp of ['UCL', 'UEL', 'UECL']) giri.push([tab, comp]); else giri.push([tab, null]); }
  for (const [tab, comp] of giri) {
    if (comp) { await page.evaluate((c) => { const C = window.__CPM_CAREER; const p = C.snapshot(); C.patch({ euro: { ...p.euro, competition: c } }); }, comp); await sleep(300); }
    await page.evaluate((t) => window.__CPM_CAREER.goTab(t), tab); await sleep(700);
    const m = await misura(page);
    m.righe.forEach(s => statiVisti.add(s)); righeTot += m.righe.length;
    const bassi = m.out.filter(x => x.c < SOGLIA);
    if (process.env.CPM_DUMP218 && v.nome === '375' && tema === '1') bassi.forEach(x => console.log(`      [${tab}] «${x.txt}» ${x.c}:1 ${x.col} su ${x.fondo}`));
    const tagli = m.out.filter(x => x.riga && x.ell);
    ok(bassi.length === 0, `${v.nome} cpm-dark=${tema} ${tab}${comp ? ' ' + comp : ''}: ${m.out.length} testi, ${bassi.length} sotto ${SOGLIA}:1` + (bassi.length ? ' → ' + bassi.slice(0, 6).map(x => `«${x.txt}» ${x.c}:1 (${x.col} su ${x.fondo})`).join(' · ') : ''));
    if (tab === 'coppe') {
      ok(m.righe.filter(x => x !== 'eliminazione').length >= 8, `${v.nome} cpm-dark=${tema} ${comp}: righe del calendario europeo ${m.righe.length} (attese ≥ 8)`);
      ok(tagli.length === 0, `${v.nome} cpm-dark=${tema} ${comp}: nomi tagliati nel calendario europeo ${tagli.length}` + (tagli.length ? ' → ' + tagli.map(x => x.txt).join(' · ') : ''));
    }
    if (FOTO && tab === 'coppe' && comp === 'UCL' && tema === '1') {
      const el = await page.$('[data-cpm="cal-euro-218"]');
      if (el) { await el.scrollIntoViewIfNeeded(); await sleep(300); }
      await page.screenshot({ path: `${FOTO}/coppe-${v.nome}${ROSSO ? '-prima' : '-dopo'}.png` });
    }
  }
  await page.context().close();
}
for (const s of ['vinta', 'persa', 'pari', 'da-giocare', 'eliminazione']) ok(statiVisti.has(s), `stato di riga «${s}» misurato`);
ok(errors.length === 0, `errori di pagina: ${errors.length}` + (errors.length ? ' → ' + errors.slice(0, 3).join(' | ') : ''));
console.log(`\ncalendario-218 ${ROSSO ? '(ROSSO __CPM_NO_G218)' : ''}: ${fails.length ? 'ROSSO — ' + fails.length + ' controlli falliti' : 'VERDE'}`);
await browser.close(); srv.close();
process.exit(fails.length ? 1 : 0);
