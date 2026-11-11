#!/usr/bin/env node
/* [giro 163 · PO-356 F] GUARDIANO indice-163 — l'Indice Primavera e la sua barra sulla home.
   Giudica, sul gioco vero (?cpmtest=1), due cose insieme:
   A) LA FUNZIONE PURA `indicePrimavera` (la stessa che disegna la barra, esposta come __CPM_CAREER.ip153):
      null fuori dalla Primavera · {pronto:false} sotto le 6 partite di lega · estremi 0 e 100 sui casi limite ·
      monotona sul voto · non conta coppa/Nazionale/squalifiche · non modifica il salvataggio · deterministica.
   B) LA BARRA SULLA HOME (412x915 e 1280x800): presente in Primavera, con la tacca uguale a quella della funzione,
      l'etichetta giusta e MAI il numero; assente per un professionista.
   Braccio rosso: CPM_ROSSO163=1 accende __CPM_NO_IP153 (barra spenta) → il guardiano DEVE uscire 1.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node indice-163.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';

const ROSSO = process.env.CPM_ROSSO163 === '1';
const FOTO = process.env.CPM_FOTO163 || '';
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };

function mh(n, { rating = 6.8, goals = 0, assists = 0, season = 1, extra = {} } = {}) {
  return Array.from({ length: n }, (_, i) => ({ season, week: i + 2, opponent: 'FC Prova ' + i, homeScore: 1, awayScore: 0, goals, assists, rating, won: true, drew: false, simulated: true, ...extra }));
}
function savePlayer(over = {}) {
  const s = 66;
  return { name: 'Guardiano Indice', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 12, weekLived: false, age: 17, ovr: 66, tutorialDone: true, position: 'Attaccante',
    campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1,
    club: { id: 'milan', n: 'AC Dorvelli Primavera', a: 'ACR', p: 78, c: '#dc2626', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Primavera 1', isU18: true },
    stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s + 2, passaggio: s, dribbling: s, posizionamento: s },
    form: 74, morale: 72, fatigue: 10, coachTrust: 62, contract: { duration: 1, wage: 200 }, matchHistory: mh(9, { rating: 7.1, goals: 1 }), ...over };
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(vp, player) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: FOTO ? 2 : 1 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, rosso]) => {
    window.__CPM_GLB = false; if (rosso) window.__CPM_NO_IP153 = 1;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl }));
  }, [player, ROSSO]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 25000 });
  await sleep(1500);
  return { page, errors };
}

try {
  /* ---------- A) la funzione pura ---------- */
  console.log('A) funzione indicePrimavera');
  const { page, errors } = await apri({ width: 412, height: 915 }, savePlayer());
  const A = await page.evaluate(() => {
    const C = window.__CPM_CAREER, base = C.snapshot();
    const mk = (n, o = {}) => Array.from({ length: n }, (_, i) => ({ season: 1, week: i + 2, goals: 0, assists: 0, rating: 6.5, won: true, ...o }));
    const r = {};
    r.pro = C.ip153({ ...base, proStatus: 'pro' });
    r.cinque = C.ip153({ ...base, matchHistory: mk(5) });
    r.sei = C.ip153({ ...base, matchHistory: mk(6) });
    r.max = C.ip153({ ...base, matchHistory: mk(10, { rating: 9, goals: 1 }), form: 95, coachTrust: 100, ovr: 99 });
    r.min = C.ip153({ ...base, matchHistory: mk(10, { rating: 4 }), form: 30, coachTrust: 0, ovr: 40 });
    r.basso = C.ip153({ ...base, matchHistory: mk(8, { rating: 6.0 }) });
    r.alto = C.ip153({ ...base, matchHistory: mk(8, { rating: 7.6 }) });
    /* coppa, Nazionale, squalifica e stagione precedente non contano: 5 di lega + tante altre = ancora non pronto */
    r.filtri = C.ip153({ ...base, matchHistory: [...mk(5), ...mk(4, { cup: true }), ...mk(3, { national: true }), ...mk(3, { squalificato: true, rating: null }), ...mk(6, { season: 2 })] });
    const prima = JSON.stringify(base);
    const a1 = C.ip153(base), a2 = C.ip153(base);
    r.det = JSON.stringify(a1) === JSON.stringify(a2);
    r.puro = JSON.stringify(base) === prima && JSON.stringify(C.snapshot()) === prima;
    r.cur = a1;
    return r;
  });
  ok(A.pro === null, 'fuori dalla Primavera vale null');
  ok(A.cinque && A.cinque.pronto === false && A.cinque.partite === 5, 'sotto le 6 partite: non si giudica (5/6)');
  ok(A.sei && A.sei.pronto === true, 'alla 6ª partita si giudica');
  ok(A.max && A.max.valore === 100 && A.max.tacca === 4, `caso massimo = 100, tacca 5 (letto ${A.max && A.max.valore})`);
  ok(A.min && A.min.valore === 0 && A.min.tacca === 0, `caso minimo = 0, tacca 1 (letto ${A.min && A.min.valore})`);
  ok(A.basso && A.alto && A.alto.valore > A.basso.valore, `monotona sul voto (6,0 → ${A.basso && A.basso.valore} · 7,6 → ${A.alto && A.alto.valore})`);
  ok(A.filtri && A.filtri.pronto === false && A.filtri.partite === 5, `coppa/Nazionale/squalifiche/altra stagione esclusi (contate ${A.filtri && A.filtri.partite})`);
  ok(A.det, 'deterministica (due chiamate, stesso risultato)');
  ok(A.puro, 'pura: il salvataggio non cambia');

  /* ---------- B) la barra sulla home ---------- */
  console.log('B) barra sulla home');
  const leggi = (p) => p.evaluate(() => {
    const el = document.querySelector('[data-cpm="ip163"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { tacca: el.getAttribute('data-ip163'), testo: el.innerText.replace(/\s+/g, ' '), w: r.width, h: r.height, vis: r.width > 0 && r.height > 0, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
  });
  for (const [nome, vp] of [['telefono 412x915', { width: 412, height: 915 }], ['PC 1280x800', { width: 1280, height: 800 }]]) {
    const W = nome.startsWith('tel') ? { page, errors } : await apri(vp, savePlayer());
    const b = await leggi(W.page);
    const cur = await W.page.evaluate(() => window.__CPM_CAREER.ip153());
    ok(!!b && b.vis, `${nome}: barra «Corsa alla prima squadra» presente`);
    if (b && cur && cur.pronto) {
      ok(String(cur.tacca) === b.tacca, `${nome}: tacca della barra = tacca della funzione (${b.tacca} / ${cur.tacca})`);
      ok(b.testo.includes(cur.etichetta), `${nome}: etichetta «${cur.etichetta}»`);
      ok(!new RegExp('(^|[^0-9])' + cur.valore + '([^0-9]|$)').test(b.testo.replace(/ultime \d+ partite/, '')), `${nome}: il numero dell'indice (${cur.valore}) non si vede`);
      ok(b.sw <= b.cw + 1, `${nome}: nessuno scorrimento orizzontale (${b.sw}/${b.cw})`);
    }
    if (FOTO) {
      fs.mkdirSync(FOTO, { recursive: true });
      const el = await W.page.$('[data-cpm="corsa163"]');
      if (el) { await el.scrollIntoViewIfNeeded(); await sleep(300); }
      await W.page.screenshot({ path: `${FOTO}/home-${nome.startsWith('tel') ? 'telefono' : 'pc'}.png` });
      if (el) await el.screenshot({ path: `${FOTO}/corsa-${nome.startsWith('tel') ? 'telefono' : 'pc'}.png` });
    }
    ok(W.errors.length === 0, `${nome}: nessun errore di pagina${W.errors.length ? ' — ' + W.errors[0] : ''}`);
    if (W.page !== page) await W.page.close();
  }
  /* sotto le 6 partite: barra presente, nessuna tacca accesa */
  const W6 = await apri({ width: 412, height: 915 }, savePlayer({ matchHistory: mh(3) }));
  const b6 = await leggi(W6.page);
  ok(!!b6 && b6.tacca === '-' && /6ª partita/.test(b6.testo), `sotto le 6 partite: barra spenta con la spiegazione («${b6 && b6.testo.slice(0, 60)}»)`);
  await W6.page.close();
  /* professionista: niente barra */
  const WP = await apri({ width: 412, height: 915 }, savePlayer({ proStatus: 'pro', club: { id: 'milan', n: 'AC Dorvelli', a: 'ACR', p: 90, c: '#dc2626', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Lega A' } }));
  const bp = await WP.page.evaluate(() => !!document.querySelector('[data-cpm="corsa163"]'));
  ok(!bp, 'professionista: la card non c\'è (solo Primavera)');
  await WP.page.close();
  await page.close();
} catch (e) { fails.push('eccezione: ' + (e && e.message)); console.log('  ✗ eccezione', e && e.message); }

await browser.close(); srv.close();
console.log(`\nindice-163 ${ROSSO ? '[BRACCIO ROSSO __CPM_NO_IP153]' : '[verde atteso]'}: ${oks.length} verdi, ${fails.length} rossi`);
console.log(fails.length ? 'ESITO: ROSSO' : 'ESITO: VERDE');
process.exit(fails.length ? 1 : 0);
