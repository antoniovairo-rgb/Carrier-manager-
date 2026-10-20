#!/usr/bin/env node
/* [giro 79, collaudo 7.999.175-3d riga 2 — rosso __CPM_NO_RIG79] GUARDIANO «RIGORE PER LORO SOLO SE IL RIGORE E' LORO».
   Difetto: la scheda del mister «📢 Rigore per loro al N'» usciva dopo il rigore A FAVORE dell'eroe (k4 15', k12 8', k13 34' del salvataggio
   fixtures/save-190-s12-ovr93.json). Causa: il tabellino del motore conta il rigore sul lato di chi commette il fallo (src/14, ev 'rigore'
   con chi = difensore) e il live leggeva away.rigori, cioe' i rigori concessi dagli avversari. Ora legge INT259.rigLoro (home.rigori).
   (A) node, banco del motore (24 configurazioni S12 x CPM_SEMI, default 8): per ogni rigore del motore si guarda chi lo batte (ev 'rigore',
       campo per) e se nel minuto la regola INT259.scegli apre «rigore_contro».
       VERDE: 0 schede «rigore_contro» sui rigori della squadra dell'eroe (home); ogni rigore degli avversari (away) a partita aperta (|diff|<=1)
       e entro l'84' (INT259.ULTIMO) apre la scheda. ROSSO (__CPM_NO_RIG79): almeno un rigore della squadra dell'eroe apre la scheda, altrimenti il guardiano guarda a vuoto.
       Cieco (uscita 2) se nel banco mancano rigori di uno dei due lati.
   (B) browser, solo con CPM_BROWSER=1 (~6-8 min a braccio): la partita k12 del salvataggio (rigore dell'eroe all'8'), verde e rosso.
       VERDE: nessuna scheda «rigore_contro» in window.__CPM_S259.schede se la squadra dell'eroe non ha concesso rigori (tabellino home.rigori=0)
       e almeno un rigore a favore (away.rigori>=1). ROSSO: la scheda ricompare.
   Uso: node rigore-79.mjs · CPM_SEMI=8 · CPM_BROWSER=1 [K=12] */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const fail = []; let cieco = false;
const s14 = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = s14.slice(s14.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const carica = (W) => Function('decideExecution', 'window', code + '\nreturn {crea:creaMotorePossesso,INT259};')(undefined, W);
const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));
const SEMI = +(process.env.CPM_SEMI || 8);

function banco(W) {
  const { crea, INT259 } = carica(W);
  if (typeof INT259.rigLoro !== 'function') return { manca: true };
  const R = { nostri: 0, nostriScheda: 0, loro: 0, loroAperti: 0, loroScheda: 0, eroe: 0, esempi: [] };
  for (let s = 0; s < CFG.length * SEMI; s++) {
    const c0 = CFG[s % CFG.length];
    const M = crea(Object.assign({}, c0, { occasioniV2: true, brainLive: false, fin202: null, seed: (((c0.seed >>> 0) ^ ((1 + Math.floor(s / CFG.length)) * 2654435761)) >>> 0) }));
    const B = 22; const rig = { n: 0, m: null }; let pend = [];
    for (let m = 1; m <= 93; m++) {
      if (m === 46) M.chiedi.riprendi({ centro: true, lato: 'away' });
      const G = M._S.conta.gol; const d = (G.home | 0) - (G.away | 0);
      /* lettura del live (src/15 r. ~6188): il minuto in cui il conteggio «per loro» cresce */
      const tb = M.tabellino(); const rl = INT259.rigLoro(tb); if (rl > rig.n) { rig.n = rl; rig.m = m; }
      const f = INT259.scegli({ mn: Math.min(m, 90), diff: d, energia: 80, panchina: false, ingresso: 0, fatte: [], ultima: null, espNoi: 0, espLoro: 0, rigContro: rig.n, rigControMin: rig.m });
      /* i rigori del minuto precedente: la regola li deve vedere adesso */
      for (const p of pend) {
        const sch = f === 'rigore_contro';
        if (p.per === 'home') { R.nostri++; if (p.eroe) R.eroe++; if (sch) { R.nostriScheda++; if (R.esempi.length < 4) R.esempi.push(`seme ${s} rigore nostro al ${p.m}' → scheda al ${m}'`); } }
        else { R.loro++; if (Math.abs(d) <= 1 && m <= INT259.ULTIMO) {/* la regola tace dopo l'84' (ULTIMO) e senza partita aperta: per progetto */ R.loroAperti++; if (sch) R.loroScheda++; } }
      }
      pend = [];
      for (let b = 0; b < B; b++) { const ev = M.tick({ min: Math.min(m, 90), dt: 1 / B, dec: true }) || [];
        for (const e of ev) { if (e.t === 'rigore') pend.push({ per: e.per, m, eroe: false }); if (e.t === 'battuta' && e.kind === 'pen' && e.chi && e.chi.eroe && pend.length) pend[pend.length - 1].eroe = true; } }
    }
  }
  return R;
}

const V = banco({}), Rr = banco({ __CPM_NO_RIG79: 1 });
if (V.manca) { console.error('❌ rigore-79: INT259.rigLoro assente'); process.exit(1); }
console.log(`(A) verde: rigori della squadra dell'eroe ${V.nostri} (battuti dall'eroe ${V.eroe}) → schede «rigore per loro» ${V.nostriScheda} · rigori degli avversari ${V.loro} (a partita aperta ${V.loroAperti}) → schede ${V.loroScheda}`);
console.log(`(A) rosso: rigori della squadra dell'eroe ${Rr.nostri} → schede «rigore per loro» ${Rr.nostriScheda}${Rr.esempi.length ? ' (' + Rr.esempi.join('; ') + ')' : ''} · rigori degli avversari a partita aperta ${Rr.loroAperti} → schede ${Rr.loroScheda}`);
if (V.nostri < 2 || V.loroAperti < 2) { cieco = true; console.error(`cieco: rigori nel banco nostri ${V.nostri}, loro a partita aperta ${V.loroAperti} (servono almeno 2 per lato; alza CPM_SEMI)`); }
if (V.nostriScheda > 0) fail.push(`A verde: ${V.nostriScheda} schede «rigore per loro» su rigori della squadra dell'eroe`);
if (V.loroScheda < V.loroAperti) fail.push(`A verde: ${V.loroAperti - V.loroScheda} rigori degli avversari a partita aperta senza scheda`);
if (Rr.nostriScheda === 0) fail.push('A rosso: nessun rigore della squadra dell\'eroe apre la scheda (il guardiano guarda a vuoto)');

/* ---------- (B) browser, opzionale ---------- */
if (process.env.CPM_BROWSER) {
  const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
  const k = +(process.env.K || 12);
  const srv = await startServer(); const url = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
  const b = await launchBrowser();
  const gioca = async (rosso) => {
    const rec = { rosso, errori: [] }; const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    page.on('pageerror', e => rec.errori.push(String(e.message).slice(0, 160)));
    try {
      const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' Q190-' + k;/* stessa partita di pagella-75 e del collaudo */
      await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_RIG79 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
      await page.goto(url, { waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
      try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
      try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(() => window.__CPM_CAREER.playMatch());
      await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
      await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), k);
      const tp = Date.now(); let ph = '';
      while (Date.now() - tp < 480000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') break; await sleep(500); }
      rec.fine = ph;
      Object.assign(rec, await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const T = M && M.tabellino ? M.tabellino() : null;
        const S = window.__CPM_S259 || { schede: [] };
        return { nostriConcessi: T ? T.home.rigori | 0 : null, aFavore: T ? T.away.rigori | 0 : null, schede: (S.schede || []).map(x => x.fatto + '@' + x.min) }; }));
    } catch (e) { rec.err = String(e).slice(0, 200); }
    await ctx.close(); return rec;
  };
  for (const rosso of [false, true]) {
    const x = await gioca(rosso);
    console.log(`(B) k${k} ${rosso ? 'rosso' : 'verde'}: rigori a favore ${x.aFavore} · concessi ${x.nostriConcessi} · schede ${JSON.stringify(x.schede)} · ${x.fine}${x.err ? ' ERR ' + x.err : ''}${x.errori.length ? ' pageerror ' + x.errori.join(' | ') : ''}`);
    if (x.err || x.aFavore == null) { fail.push(`B ${rosso ? 'rosso' : 'verde'}: misura non valida`); continue; }
    if (x.errori.length) fail.push(`B: pageerror`);
    const rc = (x.schede || []).some(s => s.startsWith('rigore_contro'));
    if (!rosso) { if (x.aFavore < 1) { cieco = true; console.error('cieco: B verde senza rigore a favore'); } if (x.nostriConcessi === 0 && rc) fail.push('B verde: «rigore per loro» senza rigori concessi'); }
    else if (!rc) fail.push('B rosso: la scheda non ricompare (il braccio browser guarda a vuoto)');
  }
  await b.close(); srv.close();
}

if (fail.length) { console.error('❌ rigore-79: ' + fail.join(' · ')); process.exit(1); }
if (cieco) { console.error('⚠️ rigore-79 cieco'); process.exit(2); }
console.log('✅ rigore-79 verde: «rigore per loro» solo sui rigori degli avversari; il rosso __CPM_NO_RIG79 la riapre sui rigori dell\'eroe');
