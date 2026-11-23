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
const ROSSO258 = process.env.CPM_ROSSO258 === '1'; /* [giro 258] riga del calendario come prima (__CPM_NO_G258): il guardiano DEVE uscire 1 */
const ROSSO332 = process.env.CPM_ROSSO332 === '1'; /* [giro 332] solo la parte 4 col rosso __CPM_NO_G332 (discesa della scala fuori dal fotogramma): il guardiano DEVE uscire 1 */
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
  window.__dispDi182 = ((el) => {  const pe = el.parentElement; if (!pe) return el.clientWidth; const cs = getComputedStyle(pe); let w = pe.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (cs.display.includes('flex') && !cs.flexDirection.startsWith('column')) { const k = [...pe.children].filter(c => c !== el && getComputedStyle(c).position !== 'absolute' && getComputedStyle(c).display !== 'none');
      for (const c of k) { const r = c.getBoundingClientRect(); const cc = getComputedStyle(c); w -= r.width + parseFloat(cc.marginLeft) + parseFloat(cc.marginRight); }
      const gap = parseFloat(cs.columnGap) || 0; w -= gap * k.length; }
    const ce = getComputedStyle(el); const mx = parseFloat(ce.maxWidth); if (!isNaN(mx)) w = Math.min(w, mx); return Math.floor(w); });
  setInterval(() => {
    const N = window.__N182; N.scan++;
    const f = fase();
    for (const el of document.querySelectorAll('body *')) {
      if (el.children.length > 2) continue;
      const t = (el.innerText || '').trim(); if (!t || t.length > 80) continue;
      if (el.getAttribute('data-nome182') != null) {
        if (!visibile(el)) continue;
        const k = via(el) + '|' + el.getAttribute('data-intero182') + '|' + innerWidth;
        const liv = +el.getAttribute('data-nome182'); let disp = null, prec = null;
        if (liv > 0) { /* abbreviato solo dove serve: il gradino prima NON deve starci nello spazio disponibile */
          const cs2 = getComputedStyle(el); disp = window.__dispDi182(el);
          const pr = document.createElement('span'); pr.style.cssText = `position:absolute;left:-9999px;white-space:nowrap;font:${cs2.font};letter-spacing:${cs2.letterSpacing};text-transform:${cs2.textTransform}`;
          pr.textContent = (el.getAttribute('data-cand182') || '').split('|')[liv - 1] || ''; document.body.appendChild(pr); prec = pr.getBoundingClientRect().width; pr.remove(); }
        N.nomi[k] = { cpm: el.getAttribute('data-cpm'), intero: el.getAttribute('data-intero182'), mostrato: t, liv, w: el.clientWidth, sw: el.scrollWidth, fase: f, disp, prec };
      }
      const cs = getComputedStyle(el);
      const tagliato = (cs.overflow.includes('hidden') || cs.overflowX === 'hidden' || cs.overflow.includes('clip')) && el.scrollWidth > el.clientWidth + 1 && el.children.length === 0;
      let n = null, perche = null;
      if (tagliato && (n = dentro(t))) perche = 'tagliato';
      else if (tagliato && cs.textOverflow === 'ellipsis' && (n = puntini(t + '…') || null)) perche = 'puntini (ellissi CSS)';
      else if ((n = puntini(t))) perche = 'puntini nel testo';
      /* [giro 332 · PO-620] un taglio conta se SOPRAVVIVE a un passo di disegno. Il campione gira in un compito (setInterval) e forza
         il layout: puo' cadere fra un cambio del DOM e il passo di disegno in cui il ResizeObserver della scala lo corregge, cioe' su uno
         stato che lo schermo non mostra mai (misurato sul banco carico: «FC Biancocelesti Primavera» 142>76 px letto a t+0 ms, corretto
         dal ResizeObserver a t+2 ms prima del disegno). Si riguarda lo stesso elemento dopo il fotogramma successivo (requestAnimationFrame
         + compito): se e' ancora tagliato col suo testo, e' a schermo. Il lampo di UN fotogramma lo giudica la parte 4, provocato. */
      if (perche && visibile(el)) { const k = via(el) + '|' + n + '|' + innerWidth; if (!N.tagli[k] && !(N.attesa || (N.attesa = {}))[k]) { N.attesa[k] = 1; const dati = { via: via(el), nome: n, testo: t, w: el.clientWidth, sw: el.scrollWidth, perche, fase: f, vw: innerWidth };
        requestAnimationFrame(() => setTimeout(() => { delete N.attesa[k]; const t2 = (el.innerText || '').trim(); const cs2 = getComputedStyle(el);
          const ancora = el.isConnected && visibile(el) && t2 === t && (perche !== 'tagliato' || ((cs2.overflow.includes('hidden') || cs2.overflowX === 'hidden' || cs2.overflow.includes('clip')) && el.scrollWidth > el.clientWidth + 1));
          if (ancora) N.tagli[k] = dati; else N.transitori = (N.transitori || 0) + 1; }, 0)); } }
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
    const w = window.__dispDi182(el); let liv = [0, 0, 0], nessuno = [];
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
  await page.addInitScript(([rosso, oss, r258, r332]) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G182_NOMI = 1; if (r258) window.__CPM_NO_G258 = 1; if (r332) window.__CPM_NO_G332 = 1; (0, eval)('(' + oss + ')()'); }, [ROSSO, osservatore.toString(), ROSSO258, ROSSO332]);
  if (+process.env.CPM_CPU > 1) { const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +process.env.CPM_CPU }); }/* [giro 332] banco lento simulato */
  return { page, errors };
}
async function raccogli(page, vp, etichetta) {
  const N = await page.evaluate(() => window.__N182);
  if (!N || !N.scan) return 0;
  Object.assign(raccolta.tagli, N.tagli); Object.assign(raccolta.nomi, N.nomi); (raccolta.trPag || (raccolta.trPag = new Map())).set(page, N.transitori || 0);
  for (const x of await tuttiIClub(page)) { const k = x.cpm + '|' + vp.width; if (!raccolta.club[k] || raccolta.club[k].nNessuno < x.nNessuno) raccolta.club[k] = { ...x, vw: vp.width, dove: etichetta }; }
  return N.scan;
}
try {
  if (!ROSSO332) {
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
  /* [giro 258 · rapporto 254 dubbio 1] la RIGA DEL CALENDARIO con l'avversario dal nome piu' lungo nella settimana corrente
     (la riga col ▶ e il tasto «Gioca», la piu' stretta): club dal nome piu' corto della Lega A Primavera, poi nel salvataggio
     la gara della settimana corrente prende l'avversario della lega col nome piu' lungo. Verde: il nome passa dalla scala
     (cal-avv-258) e ci sta; rosso (CPM_ROSSO258): il censimento deve vedere il nome tagliato. «Non giudicato» = rosso. */
  for (const vp of [VPS[0]]) {
    console.log(`3b) calendario a ${vp.width}px: avversario dal nome piu' lungo nella riga corrente`);
    const P = await nuovaPagina(vp);
    try {
      await P.page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await P.page.waitForFunction(() => typeof U18_CLUBS !== 'undefined', null, { timeout: 60000 });
      const base = () => { const club = [...U18_CLUBS].sort((a, b) => a.n.length - b.n.length)[0]; const s = 64;
        return { name: 'Max Blond', nation: 'Italia', avatarId: 0, proStatus: 'u18', isU18: true, season: 1, week: 3, weekLived: false, age: 17, position: 'Attaccante', club,
          stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s }, ovr: s, form: 70, morale: 70, fatigue: 0, coachTrust: 60, popularity: 20,
          contract: { duration: 1, wage: 577, expiresAtSeason: 2 }, matchHistory: [], u18Seasons: 0, campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1, tutorialDone: true }; };
      await P.page.evaluate((b) => { const pl = (0, eval)('(' + b + ')')(); localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, base.toString());
      const apri = async () => { await P.page.reload({ waitUntil: 'load' });
        await P.page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
        try { await P.page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
        await P.page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
        await P.page.evaluate(() => { try { window.__CPM_CAREER.resolveOpening(); } catch (e) {} }); await sleep(1500); };
      await apri();
      /* il calendario generato e salvato (si legge dall'autosave, si rimette con l'aggancio di prova patch): la gara della settimana corrente prende l'avversario col nome piu' lungo */
      const scelto = await P.page.evaluate(() => { const sv = JSON.parse(localStorage.getItem('cpm-v3') || '{}'); const pl = sv.player; if (!pl || !Array.isArray(pl.calendar)) return null;
        const ora = pl.calendar.find(m => m.week >= pl.week && !m.played); if (!ora) return null;
        const lunghi = pl.calendar.filter(m => m.opponentName && m !== ora).sort((a, b) => b.opponentName.length - a.opponentName.length); if (!lunghi.length) return null;
        const L = lunghi[0]; const oId = ora.opponentId, oN = ora.opponentName; ora.opponentId = L.opponentId; ora.opponentName = L.opponentName; L.opponentId = oId; L.opponentName = oN;
        window.__CPM_CAREER.patch({ calendar: pl.calendar, week: ora.week }); return { nome: ora.opponentName, week: ora.week }; });
      if (!scelto) throw new Error('calendario non trovato nel salvataggio');
      await sleep(800);
      await P.page.evaluate(() => window.__CPM_CAREER.goTab('calendar')); await sleep(1500);
      const riga = await P.page.evaluate((nome) => { const r = [...document.querySelectorAll('[data-cpm="riga-cal-v2"]')].find(x => (x.innerText || '').includes('▶'));
        if (!r) return null; const el = r.querySelector('[data-cpm="cal-avv-258"]'); const t = (r.children[1] && r.children[1].children[0] && r.children[1].children[0].innerText) || '';
        if (!el) return { scala: false, testo: t, nome };
        const rg = document.createRange(); rg.selectNodeContents(el); const box = el.getBoundingClientRect().width; const cs = getComputedStyle(el);
        const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
        return { scala: true, testo: t, nome, intero: el.getAttribute('data-intero182'), mostrato: el.innerText, liv: +el.getAttribute('data-nome182'), w: rg.getBoundingClientRect().width, box: box - pad }; }, scelto.nome);
      await raccogli(P.page, vp, 'carriera/calendario-258');
      if (!riga) ok(false, `calendario ${vp.width}: riga corrente non trovata (non giudicato)`);
      else {
        console.log(`    riga corrente «${riga.testo}» (avversario messo: ${riga.nome}, sett. ${scelto.week})${riga.scala ? ` · scala: «${riga.intero}» → «${riga.mostrato}» livello ${riga.liv}, ${riga.w.toFixed(1)}/${riga.box.toFixed(1)} px` : ' · testo semplice'}`);
        ok(riga.scala && riga.intero === riga.nome && riga.w <= riga.box + 0.05, `calendario ${vp.width}: la riga corrente passa dalla scala dei nomi e il nome mostrato ci sta`);
      }
    } catch (e) { ok(false, `calendario ${vp.width}: non giudicato (${String(e.message).slice(0, 160)})`); }
    await P.page.close();
  }
  }
  /* [giro 332 · PO-620] 4) IL NOME SI ACCORCIA PRIMA DEL DISEGNO. Il rosso del runner (treno 45066026690: 412 px, slot-club-182
     «FC Biancocelesti Primavera» tagliato 142>75 px, poi «Biancocelesti» livello 3) era un fotogramma: quando la riga si stringe dopo il
     montaggio, il ResizeObserver della scala chiedeva un nuovo giro a React in un compito successivo e il fotogramma veniva disegnato
     col nome intero tagliato. Sul banco veloce il compito arrivava prima del campione dell'osservatore (ogni 250 ms), sul runner no.
     Qui il caso si PROVOCA (regola 7 di PROCESSO.md), senza dipendere dalla velocita' della macchina: la riga del salvataggio della Home
     si allarga (la scala risale all'intero), poi si stringe a 75 px; un secondo ResizeObserver creato DOPO quello della scala (i
     callback partono in ordine di creazione, prima del disegno) legge testo e larghezze nello stesso fotogramma. Verde: gia' sceso al
     gradino che ci sta. Rosso __CPM_NO_G332 (CPM_ROSSO332=1): nome intero tagliato. 3 ripetizioni, tutte devono dare lo stesso esito. */
  {
    const vp = VPS[1]; console.log(`4) Home a ${vp.width}px: la riga del salvataggio si stringe, il nome scende prima del disegno${ROSSO332 ? ' [rosso __CPM_NO_G332]' : ''}`);
    const P = await nuovaPagina(vp);
    try {
      await P.page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await P.page.waitForFunction(() => typeof U18_CLUBS !== 'undefined', null, { timeout: 60000 });
      await P.page.evaluate(() => { const club = [...U18_CLUBS, ...U18_CLUBS_P2].sort((a, b) => b.n.length - a.n.length)[0]; const s = 64;
        localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: { name: 'Max Blond', nation: 'Italia', avatarId: 0, proStatus: 'u18', isU18: true, season: 1, week: 3, age: 17, position: 'Attaccante', club,
          stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s }, ovr: s, form: 70, morale: 70, matchHistory: [], tutorialDone: true } })); });
      await P.page.reload({ waitUntil: 'load' });
      await P.page.waitForFunction(() => { const e = document.querySelector('[data-cpm="slot-club-182"]'); return e && e.getBoundingClientRect().width > 2; }, null, { timeout: 60000 });
      const esiti = [];
      for (let rip = 0; rip < 3; rip++) {
        const r = await P.page.evaluate(async () => {
          const el = document.querySelector('[data-cpm="slot-club-182"]'); const pe = el.parentElement; const raf = () => new Promise(r => requestAnimationFrame(() => r()));
          pe.style.width = '2000px'; pe.style.maxWidth = 'none';
          for (let i = 0; i < 40 && +el.getAttribute('data-nome182') !== 0; i++) await raf();
          const largo = { liv: +el.getAttribute('data-nome182'), testo: el.textContent };
          const letto = await new Promise((res) => { let fatto = false;
            const ro = new ResizeObserver(() => { if (fatto) return; const w = el.getBoundingClientRect().width; if (w > 100) return; fatto = true; ro.disconnect();
              const rg = document.createRange(); rg.selectNodeContents(el); res({ liv: +el.getAttribute('data-nome182'), testo: el.textContent, testoPx: rg.getBoundingClientRect().width, box: w, intero: el.getAttribute('data-intero182') }); });
            ro.observe(el); const sib = [...pe.children].filter(c => c !== el).reduce((t, c) => t + c.getBoundingClientRect().width, 0); requestAnimationFrame(() => { pe.style.width = (sib + 75) + 'px'; }); setTimeout(() => { if (!fatto) { fatto = true; ro.disconnect(); res(null); } }, 8000); });
          pe.style.width = ''; pe.style.maxWidth = ''; for (let i = 0; i < 4; i++) await raf();
          return { largo, letto };
        });
        esiti.push(r);
        console.log(`    ripetizione ${rip + 1}: larga «${r.largo.testo}» (livello ${r.largo.liv}) · nello stesso fotogramma a 75 px: ${r.letto ? `«${r.letto.testo}» livello ${r.letto.liv}, ${r.letto.testoPx.toFixed(1)}/${r.letto.box.toFixed(1)} px` : 'non letto'}`);
      }
      const giud = esiti.filter(r => r.largo.liv === 0 && r.letto);
      const bene = giud.filter(r => r.letto.testoPx <= r.letto.box + 0.05 && r.letto.liv > 0);
      if (giud.length < 3) ok(false, `Home 412: non giudicato (${giud.length}/3 ripetizioni con la riga larga al nome intero e la lettura nel fotogramma)`);
      else ok(bene.length === 3, `Home 412: la riga che si stringe mostra gia' il gradino che ci sta nel fotogramma stesso (${bene.length}/3)`);
    } catch (e) { ok(false, `Home 412: non giudicato (${String(e.message).slice(0, 160)})`); }
    await P.page.close();
  }
} catch (e) { ok(false, 'eccezione: ' + String(e && e.message || e).slice(0, 300)); }
await browser.close(); srv.close();

if (ROSSO332) { console.log(`\n[braccio ROSSO __CPM_NO_G332] nomi-182: ${fails.length ? 'ROSSO' : 'VERDE'} (${oks.length} ok · ${fails.length} ko)`); process.exit(fails.length ? 1 : 0); }
console.log('\n— censimento —');
const T = Object.values(raccolta.tagli);
for (const t of T) console.log(`    ✗ ${t.vw}px ${t.fase} · ${t.via} · «${t.testo}» (${t.perche}, ${t.sw}>${t.w}px, nome ${t.nome})`);
ok(T.length === 0, `nomi di squadra tagliati o coi puntini (ancora a schermo dopo un fotogramma): ${T.length} · stati transitori mai disegnati: ${[...(raccolta.trPag || new Map()).values()].reduce((x, y) => x + y, 0)}`);
const Nm = Object.values(raccolta.nomi);
const scesi = Nm.filter(x => x.liv > 0), stretti = Nm.filter(x => x.sw > x.w + 1);
for (const x of scesi) console.log(`    · ${x.cpm} «${x.intero}» → «${x.mostrato}» (livello ${x.liv}, ${x.w}px)`);
ok(Nm.length >= 8, `nomi visti dalla funzione unica: ${Nm.length} (almeno 8 per giudicare)`);
ok(stretti.length === 0, `nomi della funzione unica che non ci stanno: ${stretti.length} ${stretti.slice(0, 3).map(x => x.intero + '@' + x.w).join(', ')}`);
const inutili = scesi.filter(x => x.disp != null && x.prec != null && x.prec <= x.disp - 1);
for (const x of inutili) console.log(`    ✗ abbreviato senza bisogno: ${x.cpm} «${x.mostrato}» ma il gradino prima (${x.prec.toFixed(0)} px) sta in ${x.disp} px`);
ok(inutili.length === 0, `abbreviazioni senza bisogno: ${inutili.length}`);
ok(!ROSSO ? scesi.length > 0 : true, `almeno un nome abbreviato dove l'intero non ci sta (visti ${scesi.length})`);
console.log('\n— tutti i club, per punto (intero / dizionario / sigla) —');
const C = Object.values(raccolta.club);
for (const c of C.sort((a, b) => a.vw - b.vw)) console.log(`    ${c.vw}px ${c.cpm} (${c.dove}, ${c.w}px): ${c.liv[0]} / ${c.liv[1]} / ${c.liv[2]}${c.nNessuno ? ` · NESSUNO ci sta: ${c.nNessuno} (${c.nessuno.join(', ')})` : ''}`);
ok(C.length > 0 && C.every(c => c.nNessuno === 0), `tutti i club hanno un nome che ci sta in ogni punto (${C.length} punti misurati)`);
ok(percorsi === VPS.length * 2, `percorsi giudicati ${percorsi}/${VPS.length * 2}`);
console.log(`\n${ROSSO ? '[braccio ROSSO __CPM_NO_G182_NOMI] ' : ''}nomi-182: ${fails.length ? 'ROSSO' : 'VERDE'} (${oks.length} ok · ${fails.length} ko)`);
process.exit(fails.length ? 1 : 0);
