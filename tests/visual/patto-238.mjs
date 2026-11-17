#!/usr/bin/env node
/* [giro 238 · PO-496, decisione PO 16/11 «Collegarli nella 197»] GUARDIANO patto-238: I PREMI DEL PATTO COL MISTER SI USANO.
   Il giro 227 registrava il premio (premiPatto227[id] = id del club) ma nessuno lo leggeva. Qui si giudica che ogni premio abbia
   il suo effetto, verde col verde e rosso col rosso (window.__CPM_NO_G238 = comportamento del giro 227).
   A · MOTORE (creaMotorePossesso vero, partita vissuta brainLive, scene dei piazzati chieste come nel live, 120 semi per braccio):
       con premi {rig,piaz} l'eroe batte almeno l'80% delle punizioni della sua squadra dalla trequarti avversaria (avanzamento >= 70;
       senza premi meno della meta': quelle senza scena le batte un compagno, giro 154) e ogni rigore e' suo (occasione di scena);
       angoli e numero di piazzati (rigori+punizioni+angoli) restano quelli senza premi entro il 15% (PO-065).
       ROSSO: con premi le punizioni dalla trequarti tornano ai compagni (eroe sotto la meta').
   B · PARTITA VERA dal salvataggio 190 (FC Merseyside) con premiPatto227 {rig,piaz}: il motore del live riceve premi {rig,piaz}
       (cfg.eroe.premi) e le punizioni della squadra dalla trequarti NON tirabili (le tirabili dal limite sono dell'eroe anche senza
       premio, 7.999.27) viste nel motore hanno l'eroe come battitore designato (>= 90%); ROSSO: sotto la meta' (almeno una vista,
       altrimenti non giudicato = rosso).
   C · CARRIERA (salvataggio 190): profilo con la card «La parola del mister» (vice, voce, rigori, piazzati); bio «vice-capitano»;
       la voce alza la chimica di 1 nella settimana (weeklyStaffRel, chokepoint dei tre percorsi); il premio non vale in Nazionale
       (premiMotore238 → null) ne' in un altro club; cambiando club le voci del club lasciato spariscono dal salvataggio.
       ROSSO: niente card, chimica uguale, voci rimaste.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node patto-238.mjs   (CPM_SOLO238=A,B,C) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SOLO = (process.env.CPM_SOLO238 || 'A,B,C').split(',');
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const esiti = []; let tutto = true; const giudica = (c, m) => { esiti.push(`${c ? '✅' : '❌'} ${m}`); tutto = tutto && !!c; };

/* ---------- A · motore ---------- */
async function motore(rosso) {
  const page = await b.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G238 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Patto238' });
  await page.waitForFunction(() => typeof creaMotorePossesso === 'function', null, { timeout: 60000 });
  const R = await page.evaluate(() => {
    const corri = (premi, vissuta = true) => { const T = { pen: 0, penE: 0, occRig: 0, foul: 0, foulE: 0, corner: 0, cornerE: 0, bat70: 0, bat70E: 0 };
      const P = [[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]];
      const Q = [[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]];
      const Rl = i => i === 0 ? 'GK' : i <= 4 ? 'DF' : i <= 7 ? 'MF' : 'AT';
      for (let s = 1; s <= 120; s++) {
        const gio = P.map((p, i) => ({ team: 'home', gk: !!p[2], name: 'H' + (i + 1), rl: Rl(i), x: p[0], y: p[1] })).concat(Q.map((p, i) => ({ team: 'away', gk: !!p[2], name: 'A' + (i + 1), rl: Rl(i), x: p[0], y: p[1] })));
        const M = creaMotorePossesso({ v2: true, brainLive: vissuta, seed: s * 7919, giocatori: gio, eroe: { name: 'EROE', x: 58, y: 50, ovr: 75, premi }, forza: { home: 70, away: 70 }, lato: 'home' });
        if (vissuta) try { M.chiedi.origini(false, 15, true); } catch (e) {}
        for (let m = 1; m <= 90; m++) for (let k = 0; k < 22; k++) { const E = M.tick({ min: m, dt: 1 / 22, dec: true }) || [];
          for (const e of E) { if (e.t === 'rigore' && e.per === 'home') T.pen++; if (e.t === 'fallo' && e.per === 'home') T.foul++; if (e.t === 'corner' && e.per === 'home') T.corner++;
            if (e.t === 'battuta' && e.chi && e.chi.team === 'home' && e.chi.eroe) { if (e.kind === 'pen') T.penE++; if (e.kind === 'foul') T.foulE++; if (e.kind === 'corner') T.cornerE++; }
            if (e.t === 'battuta' && e.kind === 'foul' && e.chi && e.chi.team === 'home' && e.adv >= 70) { T.bat70++; if (e.chi.eroe) T.bat70E++; }
            if (e.t === 'occasione_eroe' && e.origine && e.origine.kind === 'rigore') T.occRig++; } } }
      return T; };
    return { senza: corri(null), con: corri({ rig: true, piaz: true }), dSenza: corri(null, false), dCon: corri({ rig: true, piaz: true }, false) };
  });
  await page.close(); return R;
}
/* ---------- B · partita vera ---------- */
async function partita(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player; pl.name = pl.name + ' P238'; pl.premiPatto227 = { rig: pl.club.id, piaz: pl.club.id };
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) { window.__CPM_NO_G238 = 1; window.__CPM_NO_G249 = 1; }/* [giro 249] il rosso e' il comportamento del giro 227 per intero: anche il rigore dell'eroe senza premio (prima del giro 249). Senza, il rigore del compagno cambia la partita del braccio rosso e il suo campione (2 punizioni, una dell'eroe piu' vicino) */ localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 12, policy: 'assist', tickMs: 150 }));
  const visti = {}; let premi = 'assente'; const t0 = Date.now();
  while (Date.now() - t0 < 300000) {
    const o = await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); const ph = window.__CPM_PHASE && window.__CPM_PHASE();
      if (!M) return { ph }; const f = M._S && M._S.fermo; return { ph, premi: JSON.stringify((M._cfg && M._cfg.eroe && M._cfg.eroe.premi) || null), f: f && f.lato === 'home' && f.kind === 'foul' && f.x >= 70 && !(f.x >= 78 && Math.abs(f.y - 50) <= 18) ? { k: f.kind + '@' + (M._S.min | 0) + ':' + Math.round(f.x) + ',' + Math.round(f.y), eroe: f.batt === M.HERO } : null }; });
    if (o.premi) premi = o.premi; if (o.f) visti[o.f.k] = o.f.eroe;
    if (o.ph === 'ended' || o.ph === 'ceremony') break; await sleep(250);
  }
  await ctx.close();
  const v = Object.values(visti); return { premi, piazzati: v.length, eroe: v.filter(Boolean).length };
}
/* ---------- C · carriera ---------- */
async function carriera(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player; const cl = pl.club.id; pl.premiPatto227 = { vice: cl, voce: cl, rig: cl, piaz: cl }; pl.isCaptain = false; pl.teamChemistry = 60;
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G238 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.goTab('profile')); await sleep(1500);
  const card = await page.evaluate(() => { const c = document.querySelector('[data-cpm="premi238"]'); return c ? [...c.querySelectorAll('[data-cpm^="premio238-"]')].map(e => e.getAttribute('data-cpm').slice(10)) : null; });
  const bio = await page.evaluate(() => { try { return /vice-capitano del/.test(generateBio(window.__CPM_CAREER.snapshot())); } catch (e) { return 'errore: ' + e.message; } });
  const r = await page.evaluate(() => { const P = window.__CPM_CAREER.snapshot(); const W = window.__CPM_CAREER.weeklyStaffRel; const T = window.__CPM_PATTO238 || {};
    const con = W({ ...P, teamChemistry: 60 }).teamChemistry, senza = W({ ...P, teamChemistry: 60, premiPatto227: {} }).teamChemistry;
    const naz = T.motore ? T.motore(P, 'national') : 'manca', club = T.motore ? T.motore(P, 'career') : 'manca', altro = T.motore ? T.motore({ ...P, club: { ...P.club, id: 'altro238' } }, 'career') : 'manca';
    const cap = T.premio ? T.premio({ ...P, isCaptain: true }, 'vice') : 'manca';
    return { con, senza, naz: JSON.stringify(naz), club: JSON.stringify(club), altro: JSON.stringify(altro), cap }; });
  await page.evaluate(() => window.__CPM_CAREER.patch({ club: { ...window.__CPM_CAREER.snapshot().club, id: 'nuovo238', n: 'Club Nuovo' } })); await sleep(1500);
  const dopo = await page.evaluate(() => JSON.stringify(window.__CPM_CAREER.snapshot().premiPatto227 || null));
  await ctx.close();
  return { card, bio, ...r, dopo };
}
try {
  if (SOLO.includes('A')) {
    const V = await motore(false), R = await motore(true);
    console.log('A verde', JSON.stringify(V)); console.log('A rosso', JSON.stringify(R));
    const nS = V.senza.pen + V.senza.foul + V.senza.corner, nC = V.con.pen + V.con.foul + V.con.corner;
        giudica(V.dCon.bat70 >= 60 && V.dCon.bat70E >= V.dCon.bat70 * 0.9 && V.dSenza.bat70E < V.dSenza.bat70 * 0.5, `con «piazzati» l'eroe e' il battitore designato delle punizioni dalla trequarti avversaria (motore senza scene): ${V.dCon.bat70E}/${V.dCon.bat70} (senza premi ${V.dSenza.bat70E}/${V.dSenza.bat70}); nella partita vissuta ${V.con.bat70E}/${V.con.bat70} (senza premi ${V.senza.bat70E}/${V.senza.bat70}: le tirabili senza scena le batte un compagno, giro 154)`);
    giudica(Math.abs(V.con.corner - V.senza.corner) <= V.senza.corner * 0.15, `angoli invariati entro il 15% (PO-065: l'eroe resta in area): senza ${V.senza.corner} · con ${V.con.corner}`);
    giudica(V.con.pen >= 1 && V.con.occRig === V.con.pen, `con «rigorista» ogni rigore è suo (occasione di scena): ${V.con.occRig}/${V.con.pen}`);
    giudica(Math.abs(nC - nS) <= nS * 0.15, `numero di piazzati invariato entro il 15% (PO-065): senza ${nS} · con ${nC}`);
    { const vis = R.dCon.bat70 >= 60 && R.dCon.bat70E < R.dCon.bat70 * 0.5; giudica(vis, `rosso __CPM_NO_G238: con i premi le punizioni dalla trequarti tornano ai compagni (${R.dCon.bat70E}/${R.dCon.bat70})${vis ? '' : ' — rosso NON visto'}`); }
  }
  if (SOLO.includes('B')) {
    const V = await partita(false); console.log('B verde', JSON.stringify(V));
    giudica(V.premi === '{"rig":true,"piaz":true}', `partita vera: il motore riceve i premi ${V.premi}`);
    giudica(V.piazzati >= 1 && V.eroe >= V.piazzati * 0.9, `partita vera: punizioni dalla trequarti non tirabili con l'eroe battitore designato ${V.eroe}/${V.piazzati} (non giudicato = rosso)`);
    const R = await partita(true); console.log('B rosso', JSON.stringify(R));
    { const vis = R.piazzati >= 1 && R.eroe < R.piazzati * 0.5; giudica(vis, `rosso __CPM_NO_G238 partita vera: eroe battitore ${R.eroe}/${R.piazzati} (le batte il compagno piu' vicino)${vis ? '' : ' — rosso NON visto o non giudicato'}`); }
  }
  if (SOLO.includes('C')) {
    const V = await carriera(false); console.log('C verde', JSON.stringify(V));
    giudica(V.card && ['vice', 'voce', 'rig', 'piaz'].every(k => V.card.includes(k)), `profilo: card dei premi ${JSON.stringify(V.card)}`);
    giudica(V.bio === true, `bio del profilo (generateBio): «vice-capitano del …» ${V.bio}`);
    giudica(V.con === V.senza + 1, `voce nello spogliatoio: chimica della settimana ${V.senza} → ${V.con}`);
    giudica(V.naz === 'null' && V.club === '{"rig":true,"piaz":true}' && V.altro === 'null' && V.cap === false, `durata e contesto: club ${V.club} · Nazionale ${V.naz} · altro club ${V.altro} · vice se capitano ${V.cap}`);
    giudica(V.dopo === '{}', `cambiando club i premi del club lasciato spariscono: ${V.dopo}`);
    const R = await carriera(true); console.log('C rosso', JSON.stringify(R));
    giudica(!R.card && R.bio === false && R.con === R.senza && R.dopo !== '{}', `rosso __CPM_NO_G238: niente card (${JSON.stringify(R.card)}), bio ${R.bio}, chimica ${R.senza}→${R.con}, voci rimaste ${R.dopo}`);
  }
} catch (e) { giudica(false, 'errore del guardiano: ' + e.message); }
for (const e of esiti) console.log(e);
console.log(tutto ? '✅ patto-238 verde (e il rosso si vede)' : '❌ patto-238 rosso');
await b.close(); srv.close();
process.exit(tutto ? 0 : 1);
