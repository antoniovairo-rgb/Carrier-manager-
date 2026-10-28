#!/usr/bin/env node
/* [giro 98, collaudo carriera 177 n.4] GUARDIANO: IL COMPAGNO SCELTO E' QUELLO CHE SEGNA (D1), LA PROTEZIONE SI GIOCA PER QUELLO CHE DICE
   (D3-bis), NESSUN ASSIST DOPO UN PASSAGGIO NON RIUSCITO (D4), NIENTE RETROCESSIONE SENZA SERIE SOTTO (D7), IL RINNOVO TOGLIE DALLA
   LISTA CESSIONI (D8).
   Parte A — partite vere dal salvataggio S12 (fixtures/save-190-s12-ovr93.json), pilota automatico con la politica «assist» (sceglie la
   giocata da assist quando c'e'), testimone __CPM_RES218 (solo __CPM_REC) arricchito dal giro 98 con ric98 (ricevente del cast del
   motore), to98 (compagno accreditato del gol: riquadro, cinema e «Assist per X»), ch98/na98 (scena di seguito, seguito senza assist).
     D1: ogni assist riuscito con il ricevente nominato nella scelta accredita QUEL compagno (to98 = cognome di ric98) e il motore
         registra il gol a lui (evento gol(nome)).
     D4: nessuna scena di seguito nata dal passaggio respinto (chance su una giocata d'assist) offre di nuovo un'opzione d'assist.
     D3-bis: «Proteggi palla e scarica» (politica re) non e' mai un passaggio «intercettato»: si perde nel duello fisico.
   Parte B — stato forzato (handler veri, ?cpmtest=1):
     D7: club in Lega B, 16° su 18 a fine stagione → la schermata di fine stagione non dice «RETROCESSIONE»; la classifica non ha
         la zona/legenda «Retrocesse».
     D8: in lista cessioni, «Negozia rinnovo» → «Accetta l'offerta del club» → transferListed false.
   Rossi: CPM_ARMI=rosso arma __CPM_NO_G98D1/D3/D4/D7/D8 (ogni difetto deve vedersi). CPM_SEMI=… per altri semi, CPM_MISURA=1 non
   giudica, CPM_PARTI=A|B per una parte sola.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node assist-nome-98.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const lista = (v, d) => (v || d).split(',').filter(x => /^[0-9]+$/.test(x)).map(Number);
/* semi per braccio: «assist» = partita normale con la politica assist (D1) · «protegge» = politica re «Proteggi palla» (D3, solo verde:
   il rosso del D3 lo giudica la parte C) · «d4» = stessa politica col percorso senza giocaScena (__CPM_NO_BRAIN137, stato forzato): e' li'
   che il passaggio riuscito diventa «occasione» e apre il seguito (dal giro 93 il percorso col motore non lo apre piu'). */
const SEMI = { verde: { assist: lista(process.env.CPM_SEMI, '1234,2021,7'), protegge: lista(process.env.CPM_SEMI_PR, '5'), d4: lista(process.env.CPM_SEMI_D4, '11,77') },
  rosso: { assist: lista(process.env.CPM_SEMI_R, '1234'), protegge: [], d4: lista(process.env.CPM_SEMI_D4R, '11,77') } };
const ARMI = (process.env.CPM_ARMI || 'verde,rosso').split(',');
const PARTI = (process.env.CPM_PARTI || 'A,B').split(',');
const ROSSI = ['__CPM_NO_G98D1', '__CPM_NO_G98D3', '__CPM_NO_G98D4', '__CPM_NO_G98D7', '__CPM_NO_G98D8'];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = {};
const URL0 = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
const ult = (s) => String(s || '').trim().split(/\s+/).pop();

async function partita(sd, rosso, pol) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
  await page.addInitScript(([s, r, R, d4]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_B4REC = true; if (d4) { window.__CPM_NO_BRAIN137 = 1; setInterval(() => { try { if (window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose') window.__CPM_FORCE_OUTCOME = 'success'; } catch (e) {} }, 60); } if (r) R.forEach(k => { window[k] = 1; }); localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso, ROSSI, pol === 'd4']);
  await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(([s, p]) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, p === 'protegge' ? { seed: s, policy: 're', re: 'Proteggi palla', tickMs: 150 } : p === 'seeded' ? { seed: s, tickMs: 150 } : { seed: s, policy: 'assist', tickMs: 150 }), [sd, pol]);
  const t0 = Date.now(); let ph = '';
  while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(1000); }
  const R = await page.evaluate(() => window.__CPM_RES218 || []);
  const B4 = await page.evaluate(() => window.__CPM_B4 || {});
  const sc = await page.evaluate(() => { try { return window.__CPM_SCORE ? window.__CPM_SCORE() : null; } catch (e) { return null; } });
  await ctx.close(); return { R, B4, ph, sc };
}

async function parteA(arm) {
  const rosso = arm === 'rosso'; const T = { assist: 0, d1Giud: 0, d1Ok: 0, d1Bad: [], d1Mot: 0, d3d: 0, d3n: 0, d3Int: 0, d3Bad: [], d4Seg: 0, d4Bad: [], gol: 0, ass: 0, partite: 0, b4: { ok: 0, n: 0 }, righe: [] };
  const S = SEMI[arm] || SEMI.verde;
  for (const [sd, pol] of [...S.assist.map(s => [s, 'assist']), ...S.protegge.map(s => [s, 'protegge']), ...S.d4.map(s => [s, 'd4'])]) {
    const { R, B4, ph } = await partita(sd, rosso, pol); if (pol !== 'd4') T.partite++;
    let pend = false;/* l'ultima scena era una giocata d'assist finita in «occasione» (passaggio respinto): la prossima scena di seguito e' la ribattuta */
    for (const r of R) {
      if (pol !== 'd4') { if (r.ok && r.key === 'goal') T.gol++; if (r.ok && r.key === 'assist') T.ass++; }
      if (r.ch98 && pend) { T.d4Seg++; const offre = /Servi|Filtrante|Uno-due|Sponda|Scarico|Appoggio|Proteggi/i.test(String(r.label || '')) && r.rew === 'assist';
        if (offre) T.d4Bad.push(sd + ' seguito con la giocata d\'assist «' + r.label + '» key=' + r.key); }
      pend = (r.rew === 'assist' && r.key === 'chance');
      if (r.ok && r.key === 'assist') { T.assist++;
        const nominato = r.ric98 && String(r.label || '').includes(ult(r.ric98));
        if (nominato) { T.d1Giud++; const atteso = ult(r.ric98); const okN = ult(r.to98) === atteso;
          const golMot = (r.ev || []).find(e => /^gol/.test(e)); const okM = !golMot || golMot.includes(atteso);
          if (okN) T.d1Ok++; else T.d1Bad.push(sd + ' «' + r.label + '» accreditato a ' + r.to98 + ' (atteso ' + atteso + ')');
          if (!okM) T.d1Bad.push(sd + ' «' + r.label + '» il motore registra ' + golMot);
          if (golMot) T.d1Mot++;
          const k = Object.keys(B4).find(x => x.endsWith('|' + r.hl)); const e = k && B4[k] && B4[k].ricevente; if (e) { T.b4.n++; if (e.idx === e.brain) T.b4.ok++; } } }
      if (/Proteggi palla/i.test(String(r.label || ''))) { T.d3n++; if (r.key === 'intercept') T.d3Int++;
        if (r.g137) T.d3d++;
        const _bugia = !r.ok && (/intercett|passaggio|letto dalla difesa|regalato/i.test(String(r.ovl || '') + ' ' + String(r.txt || '')) || r.outKind === 'intercepted');
        if (r.g137 && !r.ok && !r.g137.duello && r.g137.esito === 'intercettato') T.d3Bad.push(sd + ' «' + r.label + '» persa come un passaggio (motore: intercettato senza duello)');
        if (_bugia) T.d3Bad.push(sd + ' «' + r.label + '» raccontata come passaggio intercettato (key ' + r.key + ', esito ' + r.outKind + ', riquadro «' + r.ovl + '» «' + r.txt + '»)');
        T.righe.push(sd + ' «' + String(r.label).slice(0, 34) + '» key=' + r.key + ' ok=' + r.ok + ' motore=' + (r.g137 ? r.g137.fam + ':' + r.g137.esito : '-') + ' duello=' + (r.g137 ? r.g137.duello : '-') + ' esito=' + r.outKind + ' tipo3D=' + r.tipo + ' «' + r.ovl + '» «' + String(r.txt || '').slice(0, 60) + '»'); }
    }
    console.log(arm + ' ' + pol + ' seme ' + sd + ' fine ' + ph + ' scene ' + R.length);
  }
  const pc = (a, n) => n ? (100 * a / n).toFixed(1) + '%' : '-';
  console.log(arm.toUpperCase() + ' A · partite ' + T.partite + ' · gol eroe ' + (T.gol / T.partite).toFixed(2) + '/p · assist eroe ' + (T.ass / T.partite).toFixed(2) + '/p');
  console.log('  D1 assist con ricevente nominato ' + T.d1Giud + ' (assist totali ' + T.assist + ') · nome coerente ' + pc(T.d1Ok, T.d1Giud) + ' · gol del motore attribuito ' + T.d1Mot + ' · 3D ricevente = cast ' + T.b4.ok + '/' + T.b4.n);
  console.log('  D3 «Proteggi palla» ' + T.d3n + ' scene · key intercept ' + T.d3Int + ' · risolte come passaggio intercettato ' + T.d3Bad.length);
  console.log('  D4 scene di seguito dopo passaggio respinto ' + T.d4Seg + ' · con giocata d\'assist ' + T.d4Bad.length);
  if (process.env.CPM_RIGHE) T.righe.forEach(x => console.log('    ' + x));
  [...T.d1Bad, ...T.d3Bad, ...T.d4Bad].slice(0, 8).forEach(x => console.log('    · ' + x));
  return T;
}

async function nuovaPagina(s, rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([sv, r, R]) => { window.__CPM_GLB = false; if (r) R.forEach(k => { window[k] = 1; }); localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, [s, rosso, ROSSI]);
  await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }); await sleep(800);
  for (let i = 0; i < 12; i++) { const n = await page.evaluate(() => { try { return (window.__CPM_CAREER.openingPending() || []).length; } catch (e) { return 0; } }); if (!n) break; await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300); }
  return { ctx, page };
}
const base = (name, lg, club, extra) => ({ phase: 'career', player: Object.assign({ name, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 1, age: 22, ovr: 72,
  tutorialDone: true, club, coachTrust: 85, stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 1, wage: 6000, expiresAtSeason: 4 }, matches: 30, totalMatches: 60, goals: 5, totalGoals: 9,
  matchHistory: [], bankBalance: 0, sessionsThisWeek: 3, yellAccum: 0, seasonCards: { y: 0, r: 0 } }, extra || {}) });

async function parteB(arm) {
  const rosso = arm === 'rosso'; const out = { d7: null, d7cl: null, d8: null, errori: [] };
  /* D7: club di Lega B 16° su 18, fine stagione */
  { const { ctx, page } = await nuovaPagina(base('Collaudo Lega B', '', { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' }), rosso);
    const club = await page.evaluate(() => { const c = CLUBS.filter(x => !x.isU18 && x.lg === 'Lega B'); return { pool: c.length, club: c[0] }; });
    await ctx.close();
    const s2 = base('Collaudo Lega B', 'Lega B', club.club, { week: 39 }); const P = await nuovaPagina(s2, rosso);
    await P.page.evaluate(() => { const cl = CLUBS.filter(x => !x.isU18 && x.lg === 'Lega B').slice(0, 18); const me = window.__CPM_CAREER.get ? null : null;
      const st = cl.map((c, i) => ({ id: c.id, n: c.n, a: c.a, p: c.p, pts: i === 0 ? 10 : 60 - i, gd: 0, gf: 30, ga: 30, w: 0, d: 0, l: 0, played: 38 }));
      window.__CPM_CAREER.patch({ standings: st, week: 39 }); });
    await sleep(800);
    await P.page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await sleep(900);
    out.d7cl = await P.page.evaluate(() => /Retrocesse/.test(document.body.innerText || ''));
    await P.page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(700);
    let chiuso = false;
    for (let k = 0; k < 5 && !chiuso; k++) {
      try { await P.page.getByText(/Firmo|Rifiuto|Chiudi$/).first().click({ timeout: 1500 }); await sleep(500); } catch (e) {}
      try { await P.page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      const ch = P.page.getByText('Chiudi la stagione', { exact: false }).first();
      if (await ch.count()) { try { await ch.scrollIntoViewIfNeeded({ timeout: 3000 }); await ch.click({ timeout: 3000 }); chiuso = true; } catch (e) {} }
      else { try { await P.page.getByText('Vivi la Settimana', { exact: false }).first().click({ timeout: 3000 }); } catch (e) {} }
      await sleep(1200); }
    if (!chiuso) out.errori.push('D7: «Chiudi la stagione» non raggiunto');
    await sleep(2500); await P.page.evaluate(() => window.__CPM_CAREER.goScreen('seasonEnd')); await sleep(1500);
    const t = await P.page.evaluate(() => document.body.innerText || ''); if (process.env.CPM_DEBUG) console.log('--- D7 ---\n' + t);
    out.d7 = { retro: /retroces/i.test(t), fine: /Fine stagione|PROMOZIONE|RETROCESSIONE/.test(t), pos: (t.match(/(\d+)°/) || [])[1] || null };
    await P.ctx.close(); }
  /* D8: in lista cessioni, rinnovo negoziato */
  { const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
    const s = base('Collaudo Rinnovo A', 'Deutsche Liga', CLUB, { season: 2, week: 1, transferListed: true, contract: { duration: 1, wage: 6000, expiresAtSeason: 3 } });
    const { ctx, page } = await nuovaPagina(s, rosso);
    await page.evaluate(() => window.__CPM_CAREER.goTab('agente')); await sleep(600);
    try { const bt = page.getByText('Negozia rinnovo', { exact: false }).first(); await bt.scrollIntoViewIfNeeded({ timeout: 5000 }); await bt.click({ timeout: 5000 }); await sleep(500);
      await page.getByText("Accetta l'offerta del club", { exact: false }).first().click({ timeout: 5000 }); await sleep(900); } catch (e) { out.errori.push('D8: percorso del rinnovo non trovato'); }
    out.d8 = await page.evaluate(() => { const p = (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || {}; return { listed: !!p.transferListed, dur: p.contract && p.contract.duration }; });
    await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(700);
    out.d8.home = await page.evaluate(() => /Sei in lista cessioni/.test(document.body.innerText || ''));
    await ctx.close(); }
  console.log(arm.toUpperCase() + ' B · D7 fine stagione ' + JSON.stringify(out.d7) + ' · classifica con «Retrocesse» ' + out.d7cl + ' · D8 ' + JSON.stringify(out.d8) + (out.errori.length ? ' · ' + out.errori.join(' | ') : ''));
  return out;
}

/* Parte C (node, senza browser) — D3-bis sul motore: «Proteggi palla e scarica» giocata con giocaScena({fam:'assist',stat:'fisico',prot})
   sulle 24 configurazioni vere della vissuta S12 (fixtures/cfg-202-s12.json). Verde: ogni palla persa e' un duello (duello:true) e la
   quota persa scende col FISICO dell'eroe (50 → 95) e non col passaggio. Rosso __CPM_NO_G98D3: si perde come un passaggio. */
function parteC(arm) {
  const src = fs.readFileSync(new URL('../../src/14-motore-possesso.jsx', import.meta.url), 'utf8');
  const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
  const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));
  const W = arm === 'rosso' ? { __CPM_NO_G98D3: 1 } : {};
  const crea = Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, W);
  const giro = (fis, pas) => { let n = 0, persi = 0, duelli = 0;
    for (let k = 0; k < CFG.length; k++) for (let r = 0; r < 25; r++) { const M = crea(Object.assign({}, CFG[k], { seed: ((CFG[k].seed >>> 0) ^ ((r + 1) * 2654435761)) >>> 0 }));
      const g = M.giocaScena({ fam: 'assist', stat: 'fisico', prot: true, x: 84, y: 46, stats: { fisico: fis, passaggio: pas } }); if (!g) continue; n++;
      if (!g.ok && g.esito === 'intercettato') { persi++; if (g.duello) duelli++; } }
    return { n, persi, duelli, q: n ? persi / n : null }; };
  const out = { f50: giro(50, 80), f95: giro(95, 80), p50: giro(80, 50), p95: giro(80, 95) };
  const pc = (x) => x.q == null ? '-' : (100 * x.q).toFixed(1) + '%';
  console.log(arm.toUpperCase() + ' C · D3 protezione: persa con fisico 50 ' + pc(out.f50) + ' · fisico 95 ' + pc(out.f95) + ' · passaggio 50 ' + pc(out.p50) + ' · passaggio 95 ' + pc(out.p95) + ' · duelli/persi ' + (out.f50.duelli + out.f95.duelli + out.p50.duelli + out.p95.duelli) + '/' + (out.f50.persi + out.f95.persi + out.p50.persi + out.p95.persi) + ' (n=' + out.f50.n + ' per braccio)');
  return out;
}

/* CPM_GOL=semi: misura gol e assist dell'eroe a partita col pilota seminato (scelte casuali, nessuna politica), dal tabellino del
   motore (pagelle dell'eroe); il rosso (tutti gli interruttori del giro 98) e' il «prima». Solo misura, non giudica. */
if (process.env.CPM_GOL) { for (const arm of ARMI) { let g = 0, a = 0, n = 0;
    for (const sd of lista(process.env.CPM_GOL, '')) { const { R, ph, sc } = await partita(sd, arm === 'rosso', 'seeded'); n++;
      R.forEach(r => { if (r.ok && r.key === 'goal') g++; if (r.ok && r.key === 'assist') a++; });
      console.log(arm + ' seeded seme ' + sd + ' fine ' + ph + ' scene ' + R.length + ' punteggio ' + JSON.stringify(sc)); }
    console.log(arm.toUpperCase() + ' GOL · partite ' + n + ' · gol eroe (scene) ' + (g / n).toFixed(2) + '/p · assist eroe ' + (a / n).toFixed(2) + '/p'); }
  await b.close(); srv.close(); process.exit(0); }

for (const arm of ARMI) { esito[arm] = {}; if (PARTI.includes('C') || !process.env.CPM_PARTI) esito[arm].C = parteC(arm); if (PARTI.includes('A')) esito[arm].A = await parteA(arm); if (PARTI.includes('B')) esito[arm].B = await parteB(arm); }
await b.close(); srv.close();
if (process.env.CPM_MISURA) process.exit(0);
const g = [];
const V = esito.verde, R = esito.rosso;
if (V && V.A) { const A = V.A;
  if (A.d1Giud < 4) g.push('verde D1: solo ' + A.d1Giud + ' assist con ricevente nominato (pavimento 4)');
  if (A.d1Bad.length) g.push('verde D1: ' + A.d1Bad.length + ' assist accreditati al compagno sbagliato');
  if (A.d3Bad.length) g.push('verde D3: ' + A.d3Bad.length + ' protezioni risolte come passaggio intercettato');
  if (A.d4Seg < 1) g.push('verde D4: nessun seguito dopo un passaggio respinto (cieco)');
  if (A.d4Bad.length) g.push('verde D4: ' + A.d4Bad.length + ' seguiti del passaggio respinto con una giocata d\'assist'); }
if (V && V.B) { const B = V.B;
  if (B.errori.length) g.push('verde B: ' + B.errori.join(' | '));
  if (!B.d7 || !B.d7.fine) g.push('verde D7: schermata di fine stagione non raggiunta');
  else if (B.d7.retro) g.push('verde D7: «RETROCESSIONE» in Lega B');
  if (B.d7cl) g.push('verde D7: la classifica di Lega B mostra «Retrocesse»');
  if (!B.d8 || B.d8.listed || B.d8.home) g.push('verde D8: dopo il rinnovo ancora in lista cessioni ' + JSON.stringify(B.d8)); }
if (V && V.C) { const C = V.C; const persi = C.f50.persi + C.f95.persi + C.p50.persi + C.p95.persi, du = C.f50.duelli + C.f95.duelli + C.p50.duelli + C.p95.duelli;
  if (C.f50.n < 300) g.push('verde D3: motore senza giocaScena (n=' + C.f50.n + ')');
  if (du !== persi) g.push('verde D3: ' + (persi - du) + ' protezioni perse come passaggio (senza duello)');
  if (!(C.f50.q > C.f95.q + 0.08)) g.push('verde D3: la protezione non dipende dal fisico (' + C.f50.q + ' contro ' + C.f95.q + ')');
  if (!(Math.abs(C.p50.q - C.p95.q) <= 0.06)) g.push('verde D3: la protezione dipende ancora dal passaggio (' + C.p50.q + ' contro ' + C.p95.q + ')');
  if (!(C.f95.q >= 0.03 && C.f50.q <= 0.50)) g.push('verde D3: quote poco credibili (fisico 95 ' + C.f95.q + ', fisico 50 ' + C.f50.q + ')'); }
if (R && R.C) { const C = R.C; if ((C.f50.duelli + C.f95.duelli) > 0 || Math.abs(C.p50.q - C.p95.q) <= 0.06) g.push('rosso D3 (motore): il difetto non si vede'); }
if (R && R.A) { const A = R.A;
  if (!A.d1Bad.length) g.push('rosso D1: il difetto non si vede (' + A.d1Giud + ' assist nominati)');
  if (!A.d4Bad.length) g.push('rosso D4: il difetto non si vede (' + A.d4Seg + ' seguiti)'); }
if (R && R.B) { const B = R.B;
  if (!(B.d7 && B.d7.retro)) g.push('rosso D7: il difetto non si vede ' + JSON.stringify(B.d7));
  if (!(B.d8 && B.d8.listed)) g.push('rosso D8: il difetto non si vede ' + JSON.stringify(B.d8)); }
if (g.length) { console.log('❌ assist-nome-98'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ assist-nome-98 ' + ARMI.join('+') + ' (' + PARTI.join('+') + ')');
