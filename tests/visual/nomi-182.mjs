#!/usr/bin/env node
/* [giro 182 · PO-378 «nomi di squadra lunghi: SELEZIONE GRAN...»] GUARDIANO nomi-182.
   Sul gioco vero (?cpmtest=1), a telefono 375 e 412, tablet 768 e PC 1280:
   1. DIZIONARIO (puro): Selezione→Sel., Polisportiva→Pol., Atletico→Atl., Sporting→Sp., Unione Sportiva→U.S., Associazione
      Calcio→A.C., Football Club→FC, Deportivo→Dep.; «Real» resta Real; un nome senza parole del dizionario resta com'e'.
   2. CENSIMENTO DEI TRONCAMENTI: un osservatore nella pagina scandisce ogni 250 ms tutti gli elementi visibili; un elemento
      che contiene un nome di squadra (CLUBS, Primavera, avversari dei provini, Selezione Granata) ed e' TAGLIATO (scrollWidth >
      clientWidth con overflow nascosto) o mostra i tre puntini su un nome di squadra e' un rosso. Percorsi: provino vero
      (schermata del provino, ingresso, barra della partita) e carriera in Primavera con il club dal nome piu' lungo (cruscotto,
      classifica, calendario, coppe, club).
   3. ABBREVIAZIONE SOLO DOVE SERVE: ogni nome passato dalla funzione unica (data-cpm nome-squadra-182 e derivati) che non e' al
      livello 0 deve avere il nome intero che davvero non ci sta; e il nome mostrato ci sta.
   4. TUTTI I CLUB: per ogni punto della funzione unica visto a schermo, con il suo carattere e la sua larghezza, si misurano i
      candidati di TUTTI i club: deve sempre esserci un candidato che ci sta (al peggio la sigla). Si stampa quanti club
      scendono al dizionario e quanti alla sigla, per punto.
   Braccio rosso: CPM_ROSSO182=1 accende __CPM_NO_G182_NOMI → il guardiano DEVE uscire 1. «Non giudicato» = rosso.
   Foto: CPM_FOTO182=<cartella> (barra della partita del provino a 375/412, prima/dopo secondo il braccio).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node nomi-182.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
import fs from 'fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO182 === '1';
const FOTO = process.env.CPM_FOTO182 || '';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const VPS = [{ width: 375, height: 812 }, { width: 412, height: 915 }, { width: 768, height: 1024 }, { width: 1280, height: 800 }];

/* l'osservatore: gira nella pagina, accumula in window.__N182 */
function osservatore() {
  window.__N182 = { tagli: {}, nomi: {}, scan: 0 };
  let NOMI = null;
  const nomi = () => {
    if (NOMI && NOMI.length > 50) return NOMI;
    const s = new Set(['Selezione Granata']);
    try { for (const c of CLUBS) s.add(c.n); } catch (e) {}
    try { for (const c of U18_CLUBS) s.add(c.n); for (const c of U18_CLUBS_P2) s.add(c.n); } catch (e) {}
    try { for (const c of TRIAL_OPPONENTS) s.add(c.n); } catch (e) {}
    NOMI = [...s].filter(x => x && x.length >= 4).map(x => x.toUpperCase()).sort((a, b) => b.length - a.length);
    return NOMI;
  };
  const dentro = (t) => { const T = t.toUpperCase(); for (const n of nomi()) { if (T.includes(n)) return n; } return null; };
  /* un nome di squadra coi puntini: il testo prima dei puntini e' l'inizio di un nome, piu' corto del nome */
  const puntini = (t) => { const m = t.match(/([^\n·|]{3,}?)\s*(…|\.\.\.)\s*$/); if (!m) return null; const pre = m[1].trim().toUpperCase(); if (pre.length < 4) return null;
    for (const n of nomi()) { if (n.startsWith(pre) && n.length > pre.length) return n; } return null; };
  const visibile = (el) => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return false;
    const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05; };
  const fase = () => { try { return (window.__CPM_PHASE && window.__CPM_PHASE()) || (document.querySelector('[data-cpm="barra"]') ? 'partita' : 'carriera'); } catch (e) { return '?'; } };
  const via = (el) => { const p = []; let e = el; for (let i = 0; i < 4 && e; i++, e = e.parentElement) { const d = e.getAttribute && e.getAttribute('data-cpm'); if (d) { p.push(d); break; } } return p.join('/') || el.tagName.toLowerCase(); };
  setInterval(() => {
    const N = window.__N182; N.scan++;
    const f = fase();
    for (const el of document.querySelectorAll('body *')) {
      if (el.children.length > 2) continue;
      const t = (el.innerText || '').trim(); if (!t || t.length > 80) continue;
      if (el.getAttribute('data-nome182') != null) {
        if (!visibile(el)) continue;
        const k = via(el) + '|' + el.getAttribute('data-intero182') + '|' + innerWidth;
        N.nomi[k] = { cpm: el.getAttribute('data-cpm'), intero: el.getAttribute('data-intero182'), mostrato: t, liv: +el.getAttribute('data-nome182'), w: el.clientWidth, sw: el.scrollWidth, fase: f };
      }
      const cs = getComputedStyle(el);
      const tagliato = (cs.overflow.includes('hidden') || cs.overflowX === 'hidden' || cs.overflow.includes('clip')) && el.scrollWidth > el.clientWidth + 1 && el.children.length === 0;
      let n = null, perche = null;
      if (tagliato && (n = dentro(t))) perche = 'tagliato';
      else if (tagliato && cs.textOverflow === 'ellipsis' && (n = puntini(t + '…') || null)) perche = 'puntini (ellissi CSS)';
      else if ((n = puntini(t))) perche = 'puntini nel testo';
      if (perche && visibile(el)) { const k = via(el) + '|' + n + '|' + innerWidth; if (!N.tagli[k]) N.tagli[k] = { via: via(el), nome: n, testo: t, w: el.clientWidth, sw: el.scrollWidth, perche, fase: f, vw: innerWidth }; }
    }
  }, 250);
}

/* tutti i club su ogni punto della funzione unica visto a schermo */
const tuttiIClub = (page) => page.evaluate(() => {
  const club = []; try { club.push(...CLUBS, ...U18_CLUBS, ...U18_CLUBS_P2, ...TRIAL_OPPONENTS); } catch (e) {}
  club.push({ n: 'Selezione Granata', a: 'GRA' });
  const out = [];
  for (const el of document.querySelectorAll('[data-nome182]')) {
    const r = el.getBoundingClientRect(); if (r.width < 2) continue;
    const cs = getComputedStyle(el);
    const prova = document.createElement('span');
    prova.style.cssText = `position:absolute;left:-9999px;top:0;white-space:nowrap;font:${cs.font};letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform};font-feature-settings:${cs.fontFeatureSettings}`;
    document.body.appendChild(prova);
    /* lo spazio DISPONIBILE, non quello del testo attuale: un gemello con un testo lunghissimo al posto dell'elemento */
    const gem = el.cloneNode(true); gem.textContent = 'W'.repeat(80); const d0 = el.style.display; el.style.display = 'none'; el.parentNode.insertBefore(gem, el);
    const w = gem.clientWidth; gem.remove(); el.style.display = d0; let liv = [0, 0, 0], nessuno = [];
    for (const c of club) {
      const cand = window.__CPM_NOMI182.candidati(c);
      let scelto = -1; for (let i = 0; i < cand.length; i++) { prova.textContent = cand[i]; if (prova.getBoundingClientRect().width <= w + 0.5) { scelto = i; break; } }
      if (scelto < 0) nessuno.push(c.n); else { const tipo = scelto === 0 ? 0 : (cand[scelto] === (c.a || c.abbr) ? 2 : 1); liv[tipo]++; }
    }
    prova.remove();
    out.push({ cpm: el.getAttribute('data-cpm'), w, liv, nessuno: nessuno.slice(0, 5), nNessuno: nessuno.length });
  }
  return out;
});

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const raccolta = { tagli: {}, nomi: {}, club: {} };
let percorsi = 0;
async function nuovaPagina(vp) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: FOTO ? 2 : 1 });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([rosso, oss]) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G182_NOMI = 1; (0, eval)('(' + oss + ')()'); }, [ROSSO, osservatore.toString()]);
  return { page, errors };
}
async function raccogli(page, vp, etichetta) {
  const N = await page.evaluate(() => window.__N182);
  if (!N || !N.scan) return 0;
  Object.assign(raccolta.tagli, N.tagli); Object.assign(raccolta.nomi, N.nomi);
  for (const x of await tuttiIClub(page)) { const k = x.cpm + '|' + vp.width; if (!raccolta.club[k] || raccolta.club[k].nNessuno < x.nNessuno) raccolta.club[k] = { ...x, vw: vp.width, dove: etichetta }; }
  return N.scan;
}
try {
  console.log('1) dizionario (funzione unica)');
  {
    const { page } = await nuovaPagina(VPS[1]);
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!window.__CPM_NOMI182, null, { timeout: 60000 });
    const casi = [['Selezione Granata', 'Sel. Granata'], ['Polisportiva Centro', 'Pol. Centro'], ['Atletico Sud', 'Atl. Sud'], ['Sporting Lido', 'Sp. Lido'],
      ['Unione Sportiva Lago', 'U.S. Lago'], ['Associazione Calcio Monte', 'A.C. Monte'], ['Football Club Riva', 'FC Riva'], ['Deportivo Norte', 'Dep. Norte'],
      ['Real Valle', 'Real Valle'], ['Torino Athletic', 'Torino Athletic'], ['FC Kaiserslautern Primavera', 'FC Kaiserslautern Primavera']];
    const r = await page.evaluate((c) => c.map(([a, b]) => [a, window.__CPM_NOMI182.abbrevia(a), b]), casi);
    for (const [a, got, exp] of r) ok(got === exp, `«${a}» → «${got}» (atteso «${exp}»)`);
    const cand = await page.evaluate(() => window.__CPM_NOMI182.candidati({ n: 'Selezione Granata', a: 'GRA' }));
    ok(JSON.stringify(cand) === JSON.stringify(['Selezione Granata', 'Sel. Granata', 'GRA']), `ordine dei candidati: ${cand.join(' → ')}`);
    await page.close();
  }
  for (const vp of VPS) {
    console.log(`2) provino vero a ${vp.width}px (schermata del provino, ingresso, barra)`);
    const { page, errors } = await nuovaPagina(vp);
    try {
      await openMatch(page, port, { skipLoadAll: true, name: 'Collaudo Nomi' });
      for (let i = 0; i < 24; i++) {
        await sleep(500);
        const ph = await page.evaluate(() => { try { return window.__CPM_PHASE && window.__CPM_PHASE(); } catch (e) { return null; } });
        if (ph === 'playing' && i > 8) break;
      }
      if (FOTO && vp.width <= 412) { const el = await page.$('[data-cpm="barra"]'); if (el) await el.screenshot({ path: `${FOTO}/barra-provino-${vp.width}-${ROSSO ? 'prima' : 'dopo'}.png` }); }
      const sc = await raccogli(page, vp, 'provino');
      ok(sc > 5 && errors.length === 0, `provino ${vp.width}: osservatore attivo (${sc} scansioni), errori di pagina ${errors.length} ${errors.slice(0, 1).join('')}`);
      if (sc > 5) percorsi++;
    } catch (e) { ok(false, `provino ${vp.width}: non giudicato (${String(e.message).slice(0, 160)})`); }
    await page.close();

    console.log(`3) carriera in Primavera a ${vp.width}px (cruscotto, classifica, calendario, coppe, club)`);
    const P = await nuovaPagina(vp);
    try {
      await P.page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await P.page.waitForFunction(() => typeof U18_CLUBS !== 'undefined', null, { timeout: 60000 });
      await P.page.evaluate(() => {
        const club = [...U18_CLUBS, ...U18_CLUBS_P2].sort((a, b) => b.n.length - a.n.length)[0];
        const s = 64; const pl = { name: 'Max Blond', nation: 'Italia', avatarId: 0, proStatus: 'u18', isU18: true, season: 1, week: 3, weekLived: false, age: 17, position: 'Attaccante', club,
          stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s }, ovr: s, form: 70, morale: 70, fatigue: 0, coachTrust: 60, popularity: 20,
          contract: { duration: 1, wage: 577, expiresAtSeason: 2 }, matchHistory: [], u18Seasons: 0, campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1, tutorialDone: true };
        localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl }));
      });
      await P.page.reload({ waitUntil: 'load' });
      await P.page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
      await sleep(1200);
      try { await P.page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
      await P.page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
      await P.page.evaluate(() => { try { window.__CPM_CAREER.resolveOpening(); } catch (e) {} });
      for (const t of ['dashboard', 'standings', 'calendar', 'coppe', 'club', 'dashboard']) {
        await P.page.evaluate((t) => window.__CPM_CAREER.goTab(t), t); await sleep(900);
        await P.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(500); await P.page.evaluate(() => window.scrollTo(0, 0)); await sleep(400);
        await raccogli(P.page, vp, 'carriera/' + t);
      }
      const sc = await raccogli(P.page, vp, 'carriera');
      ok(sc > 5 && P.errors.length === 0, `carriera ${vp.width}: osservatore attivo (${sc} scansioni), errori di pagina ${P.errors.length} ${P.errors.slice(0, 1).join('')}`);
      if (sc > 5) percorsi++;
    } catch (e) { ok(false, `carriera ${vp.width}: non giudicato (${String(e.message).slice(0, 160)})`); }
    await P.page.close();
  }
} catch (e) { ok(false, 'eccezione: ' + String(e && e.message || e).slice(0, 300)); }
await browser.close(); srv.close();

console.log('\n— censimento —');
const T = Object.values(raccolta.tagli);
for (const t of T) console.log(`    ✗ ${t.vw}px ${t.fase} · ${t.via} · «${t.testo}» (${t.perche}, ${t.sw}>${t.w}px, nome ${t.nome})`);
ok(T.length === 0, `nomi di squadra tagliati o coi puntini: ${T.length}`);
const Nm = Object.values(raccolta.nomi);
const scesi = Nm.filter(x => x.liv > 0), stretti = Nm.filter(x => x.sw > x.w + 1);
for (const x of scesi) console.log(`    · ${x.cpm} «${x.intero}» → «${x.mostrato}» (livello ${x.liv}, ${x.w}px)`);
ok(Nm.length >= 8, `nomi visti dalla funzione unica: ${Nm.length} (almeno 8 per giudicare)`);
ok(stretti.length === 0, `nomi della funzione unica che non ci stanno: ${stretti.length} ${stretti.slice(0, 3).map(x => x.intero + '@' + x.w).join(', ')}`);
ok(!ROSSO ? scesi.length > 0 : true, `almeno un nome abbreviato dove l'intero non ci sta (visti ${scesi.length})`);
console.log('\n— tutti i club, per punto (intero / dizionario / sigla) —');
const C = Object.values(raccolta.club);
for (const c of C.sort((a, b) => a.vw - b.vw)) console.log(`    ${c.vw}px ${c.cpm} (${c.dove}, ${c.w}px): ${c.liv[0]} / ${c.liv[1]} / ${c.liv[2]}${c.nNessuno ? ` · NESSUNO ci sta: ${c.nNessuno} (${c.nessuno.join(', ')})` : ''}`);
ok(C.length > 0 && C.every(c => c.nNessuno === 0), `tutti i club hanno un nome che ci sta in ogni punto (${C.length} punti misurati)`);
ok(percorsi === VPS.length * 2, `percorsi giudicati ${percorsi}/${VPS.length * 2}`);
console.log(`\n${ROSSO ? '[braccio ROSSO __CPM_NO_G182_NOMI] ' : ''}nomi-182: ${fails.length ? 'ROSSO' : 'VERDE'} (${oks.length} ok · ${fails.length} ko)`);
process.exit(fails.length ? 1 : 0);
