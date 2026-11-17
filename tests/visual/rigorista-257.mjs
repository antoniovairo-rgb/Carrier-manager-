#!/usr/bin/env node
/* [giro 257 · PO-496 seguito, decisioni PO 17/11] GUARDIANO DEL RIGORISTA VISIBILE. Rosso del giro: window.__CPM_NO_G257.
   (A) «Sì, segnato nella Rosa»: il rigorista scelto dal gioco (rigorista257, src/14: fra i dieci compagni titolari dell'undici del club
       l'attaccante con l'attitudine al dischetto piu' alta, attitudine fissa dal nome) porta una «R» accanto al nome nella Rosa e nelle
       formazioni della partita; col premio «il rigorista sei tu» la «R» e' sull'eroe. Il motore fa calciare QUEL compagno.
   (B) «In Nazionale tira l'eroe»: in Nazionale e nel provino i rigori li tira l'eroe (comportamento di prima della 197).
   (C) Dubbio 4 del 249: il ponte verso una scena programmata a palla ferma (chiedi.piazzato con batt: HERO) senza premio non nomina
       l'eroe sul dischetto.
   Parti, verde e rosso ognuna:
   A1 · ROSA (gioco vero, 360x800, fisarmoniche aperte): una «R» sola fra i titolari, sul nome che rigorista257 da' per l'undici del club;
        col premio sull'eroe; nessuna riga piu' larga delle altre e nessuno scorrimento orizzontale (la «R» non allarga le righe a 360 px).
        ROSSO: nessuna «R».
   A2 · FORMAZIONI della partita vera (salvataggio S12): una «R» sul compagno designato. ROSSO: nessuna «R».
   A3 · MOTORE (creaMotorePossesso vero, 20 partite, K=1): col rigorista segnato su un CENTROCAMPISTA (indice 5) ogni rigore della
        squadra lo calcia lui. ROSSO: lo calcia l'attaccante della regola del 249.
   B1 · MOTORE, Nazionale/provino (rig257 {eroe:true}, senza premio): ogni rigore della squadra e' dell'eroe (occasione di scena o
        battuta). ROSSO: nessuno.
   B2 · regola dei contesti (rigorista257 nel gioco): national / nationsCup / euroMondiale_* / trial -> eroe; career senza premio ->
        compagno; career col premio -> eroe. ROSSO: null in tutti.
   B3 · PROVINO VERO (openMatch, contesto trial): il motore del live riceve rig257 {eroe:true}; un rigore della squadra chiesto senza
        battitore (la sonda lo provoca: il provino non arriva al 90' e i rigori sono rari) ha l'eroe sul dischetto. ROSSO: un compagno.
   C1 · MOTORE: 20 partite, ponte simulato al 30' (chiedi.piazzato pen, batt HERO): senza premio il battitore resta il compagno; col
        premio e in Nazionale l'eroe. ROSSO: senza premio l'eroe.
   C2 · PARTITA VERA (sonda-rigore-139, S12 senza premio, CPM_PROVOCA=30: la stessa chiamata del ponte): il rigore al dischetto ha un
        compagno (il designato passato al motore), scena di sola visione del compagno, nessuna battuta ne' scena dell'eroe.
        ROSSO: l'eroe sul dischetto.
   «Non giudicato» (meno campioni, partita non finita, Rosa non trovata) = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node rigorista-257.mjs   (~8-10 minuti) */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { salva, apri } from './misura-199.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const OUT = process.env.CPM_TMP || '/tmp';
const save190 = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const esiti = []; let tutto = true; const giudica = (c, m) => { esiti.push(`${c ? '✅' : '❌'} ${m}`); tutto = tutto && !!c; };

/* ---------- C2 · partite vere in parallelo (sonda-rigore-139), mentre girano le altre parti ---------- */
const gioca = (nome, env) => new Promise((fine) => { const f = `${OUT}/rigorista-257-${nome}.json`; try { fs.unlinkSync(f); } catch (e) {}
  const p = spawn('node', ['sonda-rigore-139.mjs'], { env: { ...process.env, CPM_NOMI: 'r257-c2', CPM_SEMI: '12', CPM_PROD: '1', CPM_SENZA_PREMIO: '1', CPM_PROVOCA: '30', CPM_OUT: f, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; p.stdout.on('data', d => { log += d; }); p.stderr.on('data', d => { log += d; });
  p.on('close', () => { let J = null; try { J = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {} fine({ nome, J, log }); }); });
const pC2 = Promise.all([gioca('verde', {}), gioca('rosso', { CPM_ROSSO257: '1' })]);

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

/* ---------- A1 · Rosa ---------- */
async function rosa(rosso, premio) {
  const a = await apri(b, port, salva({ position: 'Centravanti' }), ['__CPM_FIS_APERTE', ...(rosso ? ['__CPM_NO_G257'] : [])], 360, 800);
  try {
    if (premio) { await a.page.evaluate(() => { const P = window.__CPM_CAREER.snapshot(); window.__CPM_CAREER.patch({ premiPatto227: { rig: P.club.id } }); }); await sleep(600); }
    await a.page.evaluate(() => window.__CPM_CAREER.goTab('club')); await sleep(1200);
    return await a.page.evaluate(() => {
      const P = window.__CPM_CAREER.snapshot();
      const xi = generateTeamRoster(P.club, P.season || 1).slice(0, 11).map((r, i) => i === 10 ? { ...r, name: P.name, role: P.position || r.role } : r);
      const atteso = window.__CPM_RIG257 ? window.__CPM_RIG257.rigorista(P, 'career', xi) : null;
      const righe = [...document.querySelectorAll('[data-cpm="rosa-ruolo228"]')].map(e => e.parentElement);
      const R = [...document.querySelectorAll('[data-cpm="rigorista257"]')];
      const segnate = R.map(r => { const riga = r.closest('div'); const nome = riga ? [...riga.querySelectorAll('span')].map(s => s.textContent).find(t => t && t.length > 2 && !/^R$/.test(t)) : null;
        const rr = r.getBoundingClientRect(), rg = riga.getBoundingClientRect(); return { nome: String(nome || '').replace(/^★ /, ''), dentro: rr.left >= rg.left - 0.5 && rr.right <= rg.right + 0.5 }; });
      const larg = righe.map(r => Math.round(r.getBoundingClientRect().width * 10) / 10);
      const sw = document.scrollingElement.scrollWidth, iw = window.innerWidth;
      return { atteso, eroe: P.name, righe: righe.length, segnate, largMin: Math.min(...larg), largMax: Math.max(...larg), sw, iw };
    });
  } finally { await a.page.close(); }
}
try {
  const V = await rosa(false, false), C = await rosa(false, true), R = await rosa(true, false);
  console.log('A1 verde ' + JSON.stringify(V)); console.log('A1 premio ' + JSON.stringify(C)); console.log('A1 rosso ' + JSON.stringify(R));
  const pari = (q) => q.righe >= 20 && q.largMax - q.largMin <= 0.5 && q.sw <= q.iw && q.segnate.every(s => s.dentro);
  giudica(V.atteso && !V.atteso.eroe && V.segnate.length === 1 && V.segnate[0].nome === V.atteso.nome && pari(V), `A1 Rosa a 360 px: «R» su ${V.segnate.map(s => s.nome).join('/') || 'nessuno'} (atteso ${V.atteso ? V.atteso.nome : '—'}) · righe ${V.righe} larghe ${V.largMin}-${V.largMax} px · pagina ${V.sw}/${V.iw} px`);
  giudica(C.atteso && C.atteso.eroe && C.segnate.length === 1 && C.segnate[0].nome === C.eroe && pari(C), `A1 Rosa col premio «il rigorista sei tu»: «R» su ${C.segnate.map(s => s.nome).join('/') || 'nessuno'} (eroe ${C.eroe}) · righe larghe ${C.largMin}-${C.largMax} px`);
  giudica(R.righe >= 20 && R.segnate.length === 0, `A1 rosso __CPM_NO_G257: «R» nella Rosa ${R.segnate.length} (righe ${R.righe})`);
} catch (e) { giudica(false, 'A1 errore: ' + e.message); }

/* ---------- A2 · formazioni della partita vera ---------- */
async function formazioni(rosso) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G257 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save190, rosso]);
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    const atteso = await page.evaluate(() => { const P = window.__CPM_CAREER.snapshot(); const xi = generateTeamRoster(P.club, P.season || 1).slice(0, 11).map((r, i) => i === 10 ? { ...r, name: P.name } : r); const q = window.__CPM_RIG257 && window.__CPM_RIG257.rigorista(P, 'career', xi); return q ? q.nome : null; });
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const t0 = Date.now();
    while (Date.now() - t0 < 60000) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph === 'matchday') { try { await page.getByText('Vedi le formazioni', { exact: false }).first().click({ timeout: 2000 }); } catch (e) {} }
      if (ph === 'formations') { await sleep(600); break; } await sleep(500); }
    const r = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), R: [...document.querySelectorAll('[data-cpm="rigorista257"]')].map(e => e.parentElement.innerText.replace(/\s+/g, ' ').trim()) }));
    return { atteso, ...r };
  } finally { await ctx.close(); }
}
try {
  const V = await formazioni(false), R = await formazioni(true);
  console.log('A2 verde ' + JSON.stringify(V)); console.log('A2 rosso ' + JSON.stringify(R));
  const cog = V.atteso ? V.atteso.trim().split(/\s+/).pop().toUpperCase() : '§';
  giudica(V.ph === 'formations' && V.R.length === 1 && V.R[0].toUpperCase().indexOf(cog) >= 0, `A2 formazioni della partita: «R» su «${V.R.join(' | ') || 'nessuno'}» (designato ${V.atteso || '—'}, fase ${V.ph})`);
  giudica(R.ph === 'formations' && R.R.length === 0, `A2 rosso __CPM_NO_G257: «R» nelle formazioni ${R.R.length} (fase ${R.ph})`);
} catch (e) { giudica(false, 'A2 errore: ' + e.message); }

/* ---------- A3 · B1 · C1 · motore; B2 regola dei contesti; B3 provino vero ---------- */
async function motore(rosso) {
  const page = await b.newPage(); await installCdnRoutes(page);
  await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G257 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Rigorista257' });
  await page.waitForFunction(() => typeof creaMotorePossesso === 'function', null, { timeout: 60000 });
  const R = await page.evaluate(() => { window.__CPM_RIG190_K = 1;
    const NOMI = ['Rossi', 'Bianchi', 'Greco', 'Conti', 'Marino', 'Galli', 'Costa', 'Fontana', 'Ricci', 'Moretti'];
    const P = [[8, 50, 1], [18, 12], [18, 38], [18, 62], [18, 88], [38, 25], [38, 50], [38, 75], [55, 22], [55, 78]];
    const Q = [[95, 50, 1], [82, 12], [82, 38], [82, 62], [82, 88], [62, 25], [62, 50], [62, 75], [48, 20], [48, 50], [48, 80]];
    const Rl = i => i === 0 ? 'GK' : i <= 4 ? 'DF' : i <= 7 ? 'MF' : 'AT';
    const corri = (rig257, premi, ponte) => { const T = { pen: 0, eroe: 0, occ: 0, batt: {}, ponte: { n: 0, eroe: 0 } };
      for (let s = 1; s <= 20; s++) {
        const gio = P.map((p, i) => ({ team: 'home', gk: !!p[2], name: NOMI[i].toUpperCase(), rl: Rl(i), x: p[0], y: p[1] })).concat(Q.map((p, i) => ({ team: 'away', gk: !!p[2], name: 'A' + (i + 1), rl: Rl(i), x: p[0], y: p[1] })));
        const M = creaMotorePossesso({ v2: true, brainLive: true, seed: s * 7919, giocatori: gio, eroe: { name: 'EROE', x: 58, y: 50, ovr: 75, premi, rig257 }, forza: { home: 70, away: 70 }, lato: 'home' });
        try { M.chiedi.origini(false, 15, true); } catch (e) {}
        for (let m = 1; m <= 90; m++) {
          if (ponte && m === 30) { M.chiedi.piazzato({ lato: 'home', kind: 'pen', x: 89, y: 50, batt: M.HERO, hold: 6 }); if (M._S.fermo && M._S.fermo.kind === 'pen') { T.ponte.n++; if (M._S.fermo.batt === M.HERO) T.ponte.eroe++; } }
          for (let k = 0; k < 22; k++) { const o = M.tick({ min: m, dt: 1 / 22, dec: true }) || [];
            for (const e of o) { if (e.t === 'battuta' && e.kind === 'pen' && e.chi && e.chi.team === 'home') { T.pen++; if (e.chi.eroe) T.eroe++; const n = e.chi.eroe ? 'EROE' : e.chi.nome; T.batt[n] = (T.batt[n] | 0) + 1; }
              if (e.t === 'occasione_eroe' && e.origine && e.origine.kind === 'rigore') T.occ++; } } } }
      return T; };
    const des = { i: 5, cog: 'GALLI' };
    const P0 = { name: 'Eroe Prova', club: { id: 'c257', n: 'Club 257' }, season: 2, premiPatto227: {} };
    const xi = [{ name: 'Uno Porta', role: 'Portiere' }, { name: 'Due Dif', role: 'Difensore' }, { name: 'Tre Dif', role: 'Difensore' }, { name: 'Quattro Ter', role: 'Terzino' }, { name: 'Cinque Ter', role: 'Terzino' }, { name: 'Sei Med', role: 'Mediano' }, { name: 'Sette Cen', role: 'Centrocampista' }, { name: 'Otto Tre', role: 'Trequartista' }, { name: 'Nove Ala', role: 'Ala' }, { name: 'Dieci Ala', role: 'Ala' }, { name: 'Eroe Prova', role: 'Centravanti' }];
    const F = window.__CPM_RIG257 || null; const ctx = (c, p) => { try { const q = F ? F.rigorista(p || P0, c, xi) : null; return q ? (q.eroe ? 'eroe' : 'compagno:' + q.nome) : 'null'; } catch (e) { return 'errore'; } };
    const contesti = { national: ctx('national'), nationsCup: ctx('nationsCup'), euroMondiale_group: ctx('euroMondiale_group'), euroMondiale_ko: ctx('euroMondiale_ko'), trial: ctx('trial'), career: ctx('career'), cup: ctx('cup'), careerPremio: ctx('career', { ...P0, premiPatto227: { rig: 'c257' } }) };
    return { des: corri(des, null), naz: corri({ eroe: true }, null), ponteSenza: corri(des, null, true).ponte, ponteNaz: corri({ eroe: true }, null, true).ponte, ponteCon: corri(null, { rig: true }, true).ponte, contesti };
  });
  /* B3 · il provino vero che sta girando su questa pagina: rig257 passato al motore e un rigore della squadra chiesto senza battitore */
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 3, policy: 'seeded', tickMs: 150 })).catch(() => {});
  let prov = null; const t0 = Date.now();
  while (Date.now() - t0 < 120000 && !prov) {
    prov = await page.evaluate(() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const ph = window.__CPM_PHASE && window.__CPM_PHASE();
      if (!M || !M._S || ph !== 'playing' || (M._S.min | 0) < 6 || M._S.poss.stato === 'kickoff' || M._S.poss.stato === 'fermo') return null;
      M.chiedi.piazzato({ lato: 'home', kind: 'pen', x: 89, y: 50 }); const f = M._S.fermo;
      return { min: M._S.min | 0, rig257: JSON.stringify((M._cfg && M._cfg.eroe && M._cfg.eroe.rig257) || null), kind: f ? f.kind : null, eroe: !!(f && f.batt === M.HERO), batt: f ? f.batt : null, attivo: !!(M._g && M._g[M.HERO]) }; } catch (e) { return { err: String(e.message) }; } });
    if (!prov) await sleep(400); }
  await page.close(); return { ...R, prov };
}
try {
  const V = await motore(false), R = await motore(true);
  console.log('A3/B/C1 verde ' + JSON.stringify(V)); console.log('A3/B/C1 rosso ' + JSON.stringify(R));
  giudica(V.des.pen >= 5 && V.des.batt.GALLI === V.des.pen, `A3 motore (20 partite, K=1): rigorista segnato sul centrocampista GALLI -> calcia ${JSON.stringify(V.des.batt)} su ${V.des.pen}`);
  giudica(R.des.pen >= 5 && !(R.des.batt.GALLI > 0), `A3 rosso __CPM_NO_G257: ${JSON.stringify(R.des.batt)} su ${R.des.pen} (la regola del 249, non il segnato)`);
  const ne = T => T.eroe + T.occ;
  giudica(V.naz.pen >= 5 && ne(V.naz) === V.naz.pen, `B1 motore in Nazionale/provino senza premio: rigori dell'eroe ${ne(V.naz)}/${V.naz.pen}`);
  giudica(R.naz.pen >= 5 && ne(R.naz) === 0, `B1 rosso __CPM_NO_G257: rigori dell'eroe ${ne(R.naz)}/${R.naz.pen}`);
  const c = V.contesti; giudica(['national', 'nationsCup', 'euroMondiale_group', 'euroMondiale_ko', 'trial', 'careerPremio'].every(k => c[k] === 'eroe') && /^compagno:/.test(c.career) && /^compagno:/.test(c.cup), `B2 regola dei contesti: ${JSON.stringify(c)}`);
  giudica(Object.values(R.contesti).every(v => v === 'null'), `B2 rosso __CPM_NO_G257: ${JSON.stringify(R.contesti)}`);
  giudica(!!V.prov && V.prov.rig257 === '{"eroe":true}' && V.prov.kind === 'pen' && V.prov.eroe, `B3 provino vero: rig257 ${V.prov ? V.prov.rig257 : '—'} · rigore chiesto al ${V.prov ? V.prov.min : '?'}' battitore ${V.prov ? (V.prov.eroe ? "l'eroe" : 'compagno ' + V.prov.batt) : 'NON GIUDICATO'}`);
  giudica(!!R.prov && R.prov.kind === 'pen' && !R.prov.eroe, `B3 rosso __CPM_NO_G257 provino: battitore ${R.prov ? (R.prov.eroe ? "l'eroe" : 'compagno ' + R.prov.batt) : 'NON GIUDICATO'}`);
  giudica(V.ponteSenza.n >= 15 && V.ponteSenza.eroe === 0 && V.ponteCon.n >= 15 && V.ponteCon.eroe === V.ponteCon.n && V.ponteNaz.eroe === V.ponteNaz.n && V.ponteNaz.n >= 15, `C1 motore, ponte (pen batt HERO al 30'): senza premio eroe ${V.ponteSenza.eroe}/${V.ponteSenza.n} · col premio ${V.ponteCon.eroe}/${V.ponteCon.n} · Nazionale ${V.ponteNaz.eroe}/${V.ponteNaz.n}`);
  giudica(R.ponteSenza.n >= 15 && R.ponteSenza.eroe === R.ponteSenza.n, `C1 rosso __CPM_NO_G257: senza premio eroe ${R.ponteSenza.eroe}/${R.ponteSenza.n}`);
} catch (e) { giudica(false, 'A3/B/C1 errore: ' + e.message); }
await b.close(); srv.close();

/* ---------- C2 · partite vere ---------- */
const leggi = (r) => { const x = r.J && r.J.res && r.J.res[0]; if (!x || !(x.fine === 'ended' || x.fine === 'ceremony')) return null; const P = x.pen || [];
  const prov = P.find(e => e.t === 'provocato'); const battEroe = P.filter(e => e.t === 'battuta' && e.eroe && e.min >= 30 && e.min <= 40).length;
  let occ = -99, scene = 0; for (const e of P) { if (e.t === 'occasione_eroe') occ = e.min; if (e.t === 'piazzato_giocato' && e.min - occ <= 6 && e.min >= 30 && e.min <= 40) scene++; }
  const comp = (x.rig249 || []).filter(c => c.min >= 30 && c.min <= 40);
  return { prov: prov ? prov.fermo : null, min: prov ? prov.min : null, rig257: x.rig257, comp: comp.map(c => c.min + "' " + c.nome + ' ' + c.esito), compNomi: comp.map(c => c.nome), battEroe, scene, errs: x.errs }; };
const [cv, cr] = await pC2; const CV = leggi(cv), CR = leggi(cr);
console.log('C2 verde ' + JSON.stringify(CV)); console.log('C2 rosso ' + JSON.stringify(CR));
{ const des = CV && CV.rig257 && CV.rig257.cog; const battDes = CV && CV.prov && des && CV.prov === 'pen:' + CV.rig257.i;
  giudica(!!CV && CV.errs === 0 && !!CV.prov && CV.prov !== 'pen:21' && battDes && CV.comp.length >= 1 && CV.compNomi.every(n => n === des) && CV.battEroe === 0 && CV.scene === 0,
    `C2 partita vera senza premio, ponte provocato: ${CV ? `al ${CV.min}' dischetto ${CV.prov} (designato ${JSON.stringify(CV.rig257)}) · scene del compagno ${CV.comp.join(' | ') || '0'} · eroe battute ${CV.battEroe} scene ${CV.scene}` : 'NON GIUDICATO (partita non finita)'}`); }
giudica(!!CR && CR.prov === 'pen:21', `C2 rosso __CPM_NO_G257: ${CR ? `al ${CR.min}' dischetto ${CR.prov} · scene del compagno ${CR.comp.length} · eroe battute ${CR.battEroe} scene ${CR.scene}` : 'NON GIUDICATO'}`);
if (!tutto) for (const q of [cv, cr]) if (!q.J) console.log(`--- ${q.nome} (nessun json) ---\n${q.log.slice(-1500)}`);
for (const e of esiti) console.log(e);
console.log(tutto ? '✅ rigorista-257 verde (e il rosso si vede)' : '❌ rigorista-257 rosso');
process.exit(tutto ? 0 : 1);
