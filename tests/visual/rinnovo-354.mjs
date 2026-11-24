#!/usr/bin/env node
/* [giro 354 · PO-522, decisione PO «Mai coperto»] GUARDIANO rinnovo-354 — sul gioco vero (?cpmtest=1), una pagina nuova per braccio.
   La corsa «Vai al prossimo momento» si ferma sul rinnovo (sett. 27 → 28). La sonda PROVOCA le due finestre che misura-354 ha visto
   arrivare dopo la fermata (un momento di carriera, «L'Offerta della Notte», e un evento della settimana vissuta) invece di sperare
   nel caso, poi giudica:
   A. nessuna finestra copre il riquadro: «Vai al rinnovo →» e' il primo elemento sotto il dito al suo centro; le due finestre
      sono TENUTE (stato vivo, testimone __CPM_ATT354), non buttate.
   B. il tasto porta all'Agente, ancora scoperto; rinnovo rifiutato col gestore vero (rifiuta165b) → la finestra in coda si apre
      (nessun evento perso) e risponderle funziona.
   C. pagina nuova, stessa fermata con le finestre in coda: un tocco su «Avanza» chiude la coda e mostra la finestra (mai un tasto
      che non fa nulla davanti a una finestra invisibile).
   Rosso window.__CPM_NO_G354: le finestre si aprono sopra il tasto → A DEVE essere bocciato. «Non giudicato» = rosso.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node rinnovo-354.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const CLUB = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 90, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
const salva = () => { const s = 80; return { name: 'Guardiano Rinnovo', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 27, weekLived: true, age: 25, ovr: s, tutorialDone: true, position: 'ATT',
  club: CLUB, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
  form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 1, wage: 9000, expiresAtSeason: 3 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
  hasAgent: true, agent: { id: 'ag1', name: 'Marco Gestini', style: 'boutique', rapport: 60 }, agentTask: null, richiamo198: { s: 3, n: 2 }, renewWarn94: 3,
  history: [], worldMemory: [], rival: null, totalMatches: 61, totalGoals: 31, log: [], ...AP }; };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

/* pagina nuova, corsa fino alla fermata sul rinnovo, poi le due finestre provocate */
async function fermata(flag) {
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, f]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (f) window[f] = 1;
    Math.random = () => 0.99;/* nessun momento/evento estratto a caso: le finestre le provoca la sonda */
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [salva(), flag]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(900);
  await page.evaluate(() => { window.__CPM_CAREER.resolveOpening(); window.__CPM_SALTA153 = []; }); await sleep(700);
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); } catch (e) {} }); await sleep(400);
  const premuto = await page.evaluate(() => { const t = document.querySelector('[data-cpm="salta163-tasto"]'); if (!t || t.disabled) return false; t.click(); return true; });
  await sleep(450);
  const vai = premuto && await page.evaluate(() => { const v = document.querySelector('[data-cpm="salta163-vai"]'); if (!v) return false; v.click(); return true; });
  const t0 = Date.now(); await sleep(400);
  while (vai && Date.now() - t0 < 60000) { const st = await page.evaluate(() => { const e = document.querySelector('[data-cpm="salta163"]'); return e && e.getAttribute('data-salta163'); }); if (st !== 'corsa') break; await sleep(200); }
  await sleep(500);
  const mot = await page.evaluate(() => { const L = window.__CPM_SALTA153 || []; return (L[L.length - 1] || {}).motivo || null; });
  /* le due finestre che arrivano dopo la fermata (misura-354: il momento a ~250 ms) */
  const prov = await page.evaluate(() => ({ m: window.__CPM_CAREER.forceMoment('cm_presidente_notte'), s: window.__CPM_CAREER.apriSettimana('spogliatoio') }));
  await sleep(900);
  return { page, errors, mot, avviata: !!(premuto && vai), prov };
}
const stato = (page) => page.evaluate(() => {
  const b = document.querySelector('[data-cpm="salta198-vai"]'); let sotto = null;
  if (b) { b.scrollIntoView({ block: 'center', behavior: 'instant' }); const R = b.getBoundingClientRect(); const el = document.elementFromPoint(R.left + R.width / 2, R.top + R.height / 2); sotto = !!el && b.contains(el); }
  const fin = [...document.querySelectorAll('.cpm-velo150')].map(f => (f.innerText || '').split('\n').filter(Boolean)[0] || '?').map(t => t.slice(0, 40));
  return { tasto: !!b, libero: sotto, finestre: fin, att: window.__CPM_ATT354 || null };
});

try {
  for (const [flag, rosso] of [[null, false], ['__CPM_NO_G354', true]]) {
    console.log(`${rosso ? 'ROSSO __CPM_NO_G354' : 'VERDE'} — A/B: fermata sul rinnovo con due finestre in arrivo`);
    const { page, errors, mot, avviata, prov } = await fermata(flag);
    const a = await stato(page);
    console.log(`    corsa ${avviata} · fermata «${mot}» · provocate ${JSON.stringify(prov)} · ${JSON.stringify(a)}`);
    const giudicato = avviata && mot === 'rinnovo' && a.tasto && prov.m === true && prov.s === true && a.libero !== null;
    if (!giudicato) { ok(false, `${rosso ? 'rosso' : 'verde'} A non giudicato (fermata/tasto/finestre provocate mancanti)`); await page.close(); continue; }
    const verdeA = a.libero === true && a.finestre.length === 0 && !!a.att && a.att.attivo === true && a.att.tenute.includes('momento') && a.att.tenute.includes('settimana');
    if (rosso) { ok(!verdeA && a.finestre.length > 0, `rosso A bocciato (finestre sopra il tasto: ${a.finestre.join(' / ')})`); await page.close(); continue; }
    ok(verdeA, 'verde A: «Vai al rinnovo →» scoperto e toccabile, momento ed evento della settimana tenuti in coda');
    /* B: si va all'Agente, poi il rinnovo si rifiuta col gestore vero */
    await page.click('[data-cpm="salta198-vai"]'); await sleep(900);
    const b1 = await page.evaluate(() => ({ tab: /^agente$/i.test((document.querySelector('[data-cpm=titolo235]') || {}).textContent || '') || !!document.querySelector('[data-cpm="agente-v2"]'), fin: document.querySelectorAll('.cpm-velo150').length, att: (window.__CPM_ATT354 || {}).attivo }));
    ok(b1.tab && b1.fin === 0 && b1.att === true, `verde B1: il tasto porta all'Agente, ancora nessuna finestra sopra (${JSON.stringify(b1)})`);
    await page.evaluate(() => window.__CPM_CAREER.rifiuta165b()); await sleep(1000);
    const b2 = await page.evaluate(() => ({ fin: [...document.querySelectorAll('.cpm-velo150')].map(f => (f.innerText || '').split('\n').filter(Boolean)[0] || '?').map(t => t.slice(0, 40)), att: window.__CPM_ATT354 || null }));
    ok(b2.fin.length >= 1 && b2.att && b2.att.attivo === false && b2.att.tenute.length >= 1, `verde B2: rinnovo gestito → la finestra in coda si apre (${JSON.stringify(b2)})`);
    /* le finestre escono una alla volta (coda 23: il momento aspetta la settimana): si risponde finche' non ne resta nessuna */
    let chiuse = 0;
    for (let i = 0; i < 6; i++) {
      const fatto = await page.evaluate(() => { const v = document.querySelector('.cpm-velo150'); if (!v) return null; const bt = [...v.querySelectorAll('button')].filter(x => x.offsetParent && !x.disabled); if (!bt.length) return 'senza tasti'; bt[0].click(); return 'ok'; });
      if (fatto === null) break; if (fatto === 'ok') chiuse++; await sleep(800);
    }
    const b3 = await page.evaluate(() => ({ fin: document.querySelectorAll('.cpm-velo150').length, att: window.__CPM_ATT354 || null, fired: (window.__CPM_CAREER.snapshot().momentsFired || []).includes('cm_presidente_notte') }));
    ok(b3.fin === 0 && b3.att.tenute.length === 0 && b3.fired && chiuse >= 2, `verde B3: risposto a entrambe (${chiuse} tocchi), il momento risulta vissuto (${JSON.stringify(b3)})`);
    ok(!errors.length, `verde: nessun errore di pagina (${errors.join(' · ') || 'zero'})`);
    await page.close();

    console.log('VERDE — C: un tocco su «Avanza» con le finestre in coda');
    const c = await fermata(null);
    const c0 = await stato(c.page);
    const giudC = c.mot === 'rinnovo' && c0.tasto && c0.att && c0.att.attivo === true;
    if (!giudC) ok(false, `verde C non giudicato (${JSON.stringify({ mot: c.mot, c0 })})`);
    else {
      const w0 = await c.page.evaluate(() => window.__CPM_CAREER.snapshot().week);
      await c.page.evaluate(() => { const t = document.querySelector('[data-cpm="avanza23"]'); if (t) t.click(); }); await sleep(900);
      const c1 = await c.page.evaluate(() => ({ fin: document.querySelectorAll('.cpm-velo150').length, att: (window.__CPM_ATT354 || {}).attivo, w: window.__CPM_CAREER.snapshot().week }));
      ok(c1.fin >= 1 && c1.att === false && c1.w === w0, `verde C: «Avanza» mostra la finestra in coda e non salta la settimana (${JSON.stringify(c1)})`);
    }
    ok(!c.errors.length, 'verde C: nessun errore di pagina');
    await c.page.close();
  }
} finally { await browser.close(); srv.close(); }
console.log(fails.length ? `❌ ROSSO — ${fails.length} controlli: ${fails.join(' · ')}` : '✅ VERDE — rinnovo-354 (finestre della settimana in coda dietro la fermata sul rinnovo, nessun evento perso), rosso bocciato');
process.exit(fails.length ? 1 : 0);
