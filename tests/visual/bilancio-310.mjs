#!/usr/bin/env node
/* [giro 310] GUARDIANO DEL BILANCIAMENTO — le sei correzioni decise dal PO il 21/11, ciascuna giudicata col verde (interruttore spento)
   e col rosso (interruttore acceso): il verde deve passare, il rosso deve cadere. In pagina senza grafica (GLB spento, nessun highlight),
   tranne B che apre una partita di carriera (2D, GLB spento) per leggere la forza passata al motore.
   A __CPM_NO_G310A stampo delle giornate passate      B __CPM_NO_G310B forza unica (dal vivo prestigio + spostamenti)
   C __CPM_NO_G310C meno yo-yo (neopromossa salva)       D __CPM_NO_G310D infortuni con rischio di base
   E __CPM_NO_G310E gialli dell'eroe + squalifiche       F __CPM_NO_G310F voto simulato +0,3 sotto OVR 72
   Un punto «non giudicato» (strumento cieco) e' ROSSO. Uscita 0 solo se tutti e dodici i bracci danno l'esito atteso.
   CPM_CHROME=/opt/pw-browsers/chromium node bilancio-310.mjs   (CPM_SOLO=A,B,... per un sottoinsieme) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const SOLO = (process.env.CPM_SOLO || 'A,B,C,D,E,F').split(',');
const esiti = []; const metti = (p, braccio, ok, motivo, misura) => { esiti.push({ p, braccio, ok, motivo, misura }); console.log(`${ok ? '✓' : '✗'} ${p} ${braccio}: ${motivo} ${JSON.stringify(misura)}`); };
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const errors = [];
async function paginaCarriera(player) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.addInitScript(pl => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, player);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => typeof window.__CPM_SIM_MOTORE === 'function' && typeof window.__CPM_simMatch === 'function', null, { timeout: 90000 });
  await sleep(1200); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.cartellini310), null, { timeout: 60000 }).catch(() => {});
  await sleep(800); await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} });
  return page;
}
const page = await paginaCarriera(EROE);
const flag = (k, on) => page.evaluate(([k, on]) => { window[k] = on ? 1 : undefined; }, [k, on]);

/* A — stampo: 12 arrivi a stagione in corso (settimana 20) */
if (SOLO.includes('A')) for (const rosso of [false, true]) { await flag('__CPM_NO_G310A', rosso);
  const m = await page.evaluate(() => { legaDopoTrasferimento212._m310 = new Map(); const clubs = CLUBS.filter(c => !c.isU18); const sc = {}; let st = [], rov = 0, vit = 0, ugu = 0, inc = 0, n = 0;
    for (let k = 0; k < 12; k++) { const c = clubs[(k * 11) % clubs.length], s = 1 + (k % 6); const pp = { season: s, week: 20, clubPrestigeShifts: {} };
      const L = legaDopoTrasferimento212(pp, c, {}), L2 = legaDopoTrasferimento212(pp, c, {}); if (JSON.stringify([L.newCalendar, L.newStandings]) === JSON.stringify([L2.newCalendar, L2.newStandings])) ugu++;
      const pas = L.newCalendar.filter(e => !e.type && e.played).sort((a, b) => a.matchday - b.matchday); if (!pas.length) continue; n++;
      let best = 1, cur = 1; pas.forEach((e, i) => { const r = e.result; sc[r.homeScore + '-' + r.awayScore] = 1; if (r.won) { vit++; if (r.homeScore < r.awayScore) rov++; }
        if (i) { const q = pas[i - 1].result; if (q.won === r.won && q.drew === r.drew) { cur++; best = Math.max(best, cur); } else cur = 1; } }); st.push(best);
      const me = L.newStandings.find(t => t.id === c.id); if (!me || me.gf !== pas.reduce((a, e) => a + e.result.homeScore, 0)) inc++; }
    return { casi: n, punteggi: Object.keys(sc).length, striscia: +(st.reduce((a, b) => a + b, 0) / Math.max(1, st.length)).toFixed(2), rovescio: rov, vittorie: vit, anteprimaUguale: ugu, incoerenti: inc, ms: window.__CPM_G310A_MS }; });
  const verdeOk = m.casi >= 10 && m.punteggi >= 15 && m.striscia < 5 && m.rovescio === 0 && m.anteprimaUguale === 12 && m.incoerenti === 0;
  if (!rosso) metti('A', 'verde', verdeOk, verdeOk ? 'giornate passate dal motore, orientamento giusto, anteprima = accettazione' : 'stampo o incoerenza', m);
  else { const cade = m.casi >= 10 && (m.punteggi <= 6 || m.rovescio > 0 || m.striscia >= 5); metti('A', 'rosso', cade, cade ? 'col rosso torna lo stampo' : 'il rosso non fa cadere il controllo', m); } }
await flag('__CPM_NO_G310A', false);

/* D — infortuni: funzione vera, 1500 stagioni da 38 partite, fatica curata 38 */
if (SOLO.includes('D')) for (const braccio of ['verde', 'rosso', 'rosso311']) { const rosso = braccio !== 'verde'; await flag('__CPM_NO_G310D', braccio === 'rosso'); await flag('__CPM_NO_G311D', braccio === 'rosso311');
  const m = await page.evaluate(() => { const C = window.__CPM_CAREER; if (!C || !C.simInjuryRoll) return { cieco: true }; const P0 = C.snapshot(); let t = 0, q0 = 0;
    for (let s = 0; s < 1500; s++) { let ass = 0; for (let k = 0; k < 38; k++) { if (ass > 0) { ass--; continue; } const r = C.simInjuryRoll({ ...P0, injured: false, fatigue: 38 }, (s * 977 + k * 31 + 1) >>> 0); if (r && r.injured) { t++; ass = r.injuryWeeks; } } }
    for (let s = 0; s < 3000; s++) { const r = C.simInjuryRoll({ ...P0, injured: false, fatigue: 60 }, (s * 131 + 7) >>> 0, 0); if (r && r.injured) q0++; }
    return { infortuniStagione: +(t / 1500).toFixed(3), senzaMinuti: q0 }; });
  if (m.cieco) { metti('D', braccio, false, 'non giudicato: sonda simInjuryRoll assente', m); continue; }
  /* [giro 311, decisione PO «~0,6 IN CARRIERA»] base 1,0% -> 2,5%. Qui si misura la funzione a 90' pieni e fatica 38: con la base del
     310 dava 0,60, che in carriera (minuti scalati dal mister, settimane fuori) diventava 0,30. Ora la carriera da' 0,63 (44 in 70
     stagioni, misura-310-carriera) e la funzione a 90' pieni sta piu' in alto: banda 0,85-1,30 (attesa ~1,0). Il braccio rosso311
     (__CPM_NO_G311D = base del 310) deve tornare sotto 0,85; il rosso del 310 (__CPM_NO_G310D) sotto 0,45. */
  if (braccio === 'verde') { const ok = m.infortuniStagione >= 0.85 && m.infortuniStagione <= 1.30 && m.senzaMinuti === 0; metti('D', 'verde', ok, ok ? '~1,0 a 90\' pieni con fatica curata (= ~0,6 in carriera), nessuno senza minuti' : 'fuori banda 0,85-1,30', m); }
  else if (braccio === 'rosso311') { const cade = m.infortuniStagione < 0.85; metti('D', 'rosso311', cade, cade ? 'con la base del 310 torna ~0,6 a 90\' pieni (0,30 in carriera)' : 'il rosso 311 non fa cadere il controllo', m); }
  else { const cade = m.infortuniStagione < 0.45; metti('D', 'rosso', cade, cade ? 'col rosso la fatica curata non si infortuna mai' : 'il rosso non fa cadere il controllo', m); } }
await flag('__CPM_NO_G310D', false); await flag('__CPM_NO_G311D', false);

/* E — cartellini: (1) gialli dell'eroe nel motore e totale di squadra, (2) regola 5 gialli / rosso nella simulata */
if (SOLO.includes('E')) { const mis = {};
  for (const rosso of [false, true]) { await flag('__CPM_NO_G310E', rosso);
    mis[rosso ? 'rosso' : 'verde'] = await page.evaluate(() => { const c = CLUBS.find(x => x.id === 'aug'), L = CLUBS.filter(x => !x.isU18 && x.lg === c.lg && x.id !== c.id); let gE = 0, gH = 0, gA = 0; const N = 300;
      for (let i = 0; i < N; i++) { const o = L[i % L.length], sd = (standingsSeed(c.id, 2 + Math.floor(i / 34), 1 + (i % 38)) + (i % 34) * 31 + 1) >>> 0;
        const m = window.__CPM_SIM_MOTORE({ dettaglio: true, seed: (sd ^ 0x5a17) >>> 0, forzaH: c.p, forzaA: o.p, stadio: i % 2 ? 'away' : 'home', ovr: 70 });
        const e = (m.pag || []).find(x => x && x.eroe) || {}; gE += +e.amm || 0; gH += +((m.tab.home || {}).ammonizioni) || 0; gA += +((m.tab.away || {}).ammonizioni) || 0; }
      const C = window.__CPM_CAREER; const P0 = C && C.snapshot ? C.snapshot() : {};
      const r1 = C && C.cartellini310 ? C.cartellini310({ ...P0, yellAccum: 4, isSuspended: false }, Object.defineProperty({}, 'cart310', { value: { y: 1, r: false } }), true) : 'cieco';
      const r2 = C && C.cartellini310 ? C.cartellini310({ ...P0, yellAccum: 2, isSuspended: false }, Object.defineProperty({}, 'cart310', { value: { y: 0, r: true } }), true) : 'cieco';
      const r3 = C && C.cartellini310 ? C.cartellini310({ ...P0, yellAccum: 3, isSuspended: false }, Object.defineProperty({}, 'cart310', { value: { y: 1, r: false } }), true) : 'cieco';
      return { eroe: +(gE / N).toFixed(3), squadra: +(gH / N).toFixed(3), avversari: +(gA / N).toFixed(3), quintoGiallo: r1, rosso: r2, quartoGiallo: r3 }; }); }
  const v = mis.verde, r = mis.rosso; const cieco = typeof v.quintoGiallo === 'string';
  const okV = !cieco && v.eroe <= 0.20 && Math.abs(v.squadra - r.squadra) <= 0.03 && v.avversari === r.avversari && v.quintoGiallo.isSuspended === true && v.quintoGiallo.yellAccum === 0 && v.rosso.isSuspended === true && v.rosso.yellAccum === 2 /* giro 311: il rosso NON azzera i gialli */ && v.quartoGiallo.isSuspended === false && v.quartoGiallo.yellAccum === 4;
  metti('E', 'verde', okV, cieco ? 'non giudicato: sonda cartellini310 assente' : okV ? 'eroe vicino al medio, squadra invariata (±0,03: il compagno ammonito al posto dell\'eroe gioca poi col suo giallo), 5° giallo e rosso squalificano, il rosso tiene il conto dei gialli (giro 311)' : 'regola o tasso fuori', v);
  const cade = !cieco && (r.eroe > 0.22 && Object.keys(r.quintoGiallo || {}).length === 0); metti('E', 'rosso', cade, cade ? 'col rosso l\'eroe torna parafulmine e le simulate non squalificano' : 'il rosso non fa cadere il controllo', r); }
await flag('__CPM_NO_G310E', false);

/* F — voto simulato: OVR 66 (sotto 72) e OVR 78 (sopra), stessi semi nei due bracci */
if (SOLO.includes('F')) { const mis = {};
  for (const rosso of [false, true]) { await flag('__CPM_NO_G310F', rosso);
    mis[rosso ? 'rosso' : 'verde'] = await page.evaluate(() => { const c = CLUBS.find(x => x.id === 'aug'), L = CLUBS.filter(x => !x.isU18 && x.lg === c.lg && x.id !== c.id); const o = {};
      for (const ovr of [66, 78]) { let v = 0, n = 0; for (let i = 0; i < 60; i++) { const sd = (standingsSeed(c.id, 3, 1 + i) + i * 31 + 1) >>> 0; const sm = window.__CPM_simMatch(c, L[i % L.length], ovr, i % 2 === 0, sd, {}, { motore: true });
        const vv = window.__CPM_VOTO158(sm, { goals: 0, assists: 0 }); if (vv != null) { v += vv; n++; } } o['ovr' + ovr] = n ? +(v / n).toFixed(3) : null; } return o; }); }
  const d66 = +(mis.verde.ovr66 - mis.rosso.ovr66).toFixed(3), d78 = +(mis.verde.ovr78 - mis.rosso.ovr78).toFixed(3);
  const okV = d66 >= 0.25 && d66 <= 0.32 && Math.abs(d78) < 0.005; metti('F', 'verde', okV, okV ? '+0,3 sotto OVR 72, nulla sopra' : 'scarto fuori', { ...mis, d66, d78 });
  const cade = d66 >= 0.25;/* il rosso e' il riferimento: la differenza nasce solo se il verde aggiunge */ metti('F', 'rosso', cade, cade ? 'col rosso il voto torna quello di prima (-0,3)' : 'il rosso non fa cadere il controllo', { rosso: mis.rosso }); }
await flag('__CPM_NO_G310F', false);

/* C — meno yo-yo: neopromossa 15a su 18 in Lega A (salva) nella stagione dopo la promozione, spostamento +8 prima del rinnovo */
if (SOLO.includes('C')) for (const rosso of [false, true]) { await flag('__CPM_NO_G310C', rosso);
  const prep = await page.evaluate(() => { const pair = LEAGUE_PAIRS.find(([u, l]) => CLUBS.filter(c => !c.isU18 && c.lg === u).length >= 18); if (!pair) return null;
    const lc = CLUBS.filter(c => !c.isU18 && c.lg === pair[0]).sort((a, b) => a.p - b.p); const club = lc[0];
    let st = initStandings(lc); const ord = lc.map(c => c.id).filter(id => id !== club.id).sort(); ord.splice(14, 0, club.id);
    st = st.map(r => { const i = ord.indexOf(r.id); return { ...r, played: 34, pts: 80 - i * 3, wins: 20 - i, draws: 4, losses: 10 + i, gf: 50 - i, ga: 30 + i, gd: 20 - 2 * i }; });
    const C = window.__CPM_CAREER, P = C.snapshot(); const sh = { ...(P.clubPrestigeShifts || {}) }; sh[club.id] = 8;
    C.patch({ club: { ...club }, season: 5, week: 38, standings: st, clubPrestigeShifts: sh, promo310: { id: club.id, season: 5 }, leagueOverrides: {}, proStatus: 'pro', contract: { duration: 3, wage: 3000, expiresAtSeason: 9 } });
    return { id: club.id, lg: pair[0], p: club.p }; });
  if (!prep) { metti('C', rosso ? 'rosso' : 'verde', false, 'non giudicato: nessuna lega da 18', {}); continue; }
  await page.waitForFunction(() => window.__CPM_CAREER.snapshot().season === 5, null, { timeout: 10000 }).catch(() => {}); await sleep(700); const r = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
  await page.waitForFunction(() => window.__CPM_CAREER.snapshot().season === 6, null, { timeout: 15000 }).catch(() => {}); await sleep(500);
  const m = await page.evaluate(id => { const P = window.__CPM_CAREER.snapshot(); return { stagione: P.season, club: P.club && P.club.id, dopo: (P.clubPrestigeShifts || {})[id], lega: (P.leagueOverrides || {})[id] || (P.club && P.club.lg) }; }, prep.id);
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  const giudicabile = r === true && m.stagione === 6 && m.dopo != null;
  if (!giudicabile) { metti('C', rosso ? 'rosso' : 'verde', false, 'non giudicato: il rinnovo di stagione non e\' avvenuto', { r, ...m }); continue; }
  if (!rosso) { const ok = m.dopo >= 8; metti('C', 'verde', ok, ok ? 'la neopromossa salva non perde prestigio' : 'la neopromossa salva scende', { prima: 8, ...m }); }
  else { const cade = m.dopo < 8; metti('C', 'rosso', cade, cade ? 'col rosso la deriva la riporta giu\'' : 'il rosso non fa cadere il controllo', { prima: 8, ...m }); } }
await flag('__CPM_NO_G310C', false);
await page.close();

/* B — forza unica: partita di carriera dal salvataggio save-194, spostamenti +9 al club dell'eroe e +15 all'avversario */
if (SOLO.includes('B')) { const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
  for (const rosso of [false, true]) { const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); const pg = await ctx.newPage(); await installCdnRoutes(pg);
    pg.on('pageerror', e => errors.push('B ' + String(e.message).slice(0, 140)));
    const pl = SAVE.player; const md = (pl.calendar || []).filter(m => !m.played && !m.type).sort((a, b) => a.week - b.week)[0]; const myId = pl.club.id || pl.club.n;
    const s2 = { ...SAVE, player: { ...pl, clubPrestigeShifts: { ...(pl.clubPrestigeShifts || {}), [myId]: 9, ...(md ? { [md.opponentId]: 15 } : {}) } } };
    await pg.addInitScript(([s, rosso]) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G310B = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.setItem('cpm-match-speed', '1'); }, [s2, rosso]);
    await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    let m = { cieco: true };
    try { await pg.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(800);
      await pg.evaluate(() => [...document.querySelectorAll('button')].find(x => /Continua/.test(x.textContent || '')).click());
      await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(2000); await pg.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
      await pg.evaluate(() => window.__CPM_CAREER.playMatch()); await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE(), null, { timeout: 30000 }); await sleep(1500);
      await pg.keyboard.press('Enter'); await sleep(1500); await pg.keyboard.press('Enter');
      for (let i = 0; i < 40; i++) { await sleep(500); const ok = await pg.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta ingresso/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; }); if (ok) break; }
      await pg.waitForFunction(() => window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }); await sleep(2500);
      m = await pg.evaluate(() => ({ forza: window.__CPM_FORZA310 || null, base: window.__CPM_FORZA310_BASE || null }));
    } catch (e) { m = { cieco: true, err: String(e.message).slice(0, 120) }; }
    const base = await pg.evaluate(([myId, oid]) => { const me = CLUBS.find(c => c.id === myId || c.n === myId) || null; const op = CLUBS.find(c => c.id === oid) || null; return { me: me && me.p, op: op && op.p }; }, [myId, md && md.opponentId]).catch(() => ({}));
    await ctx.close();
    if (!rosso) { const cl = x => Math.max(30, Math.min(99, x)); const ok = !!(m.forza && m.base && m.forza.home === cl(m.base.home + 9) && m.forza.away === cl(m.base.away + 15) && (m.forza.home !== m.base.home || m.forza.away !== m.base.away));
      metti('B', 'verde', ok, m.cieco ? 'non giudicato: partita non aperta' : ok ? 'dal vivo la forza legge gli spostamenti di prestigio' : 'forza senza spostamenti', { ...m, anagrafica: base }); }
    else { const cade = !m.cieco && !!m.base && m.forza == null; metti('B', 'rosso', cade, cade ? 'col rosso il motore riceve il prestigio puro (nessuna forza 310)' : 'il rosso non fa cadere il controllo', { ...m, anagrafica: base }); } } }

await browser.close(); srv.close();
fs.mkdirSync('out/bilancio-310', { recursive: true }); fs.writeFileSync('out/bilancio-310/esito.json', JSON.stringify({ esiti, errors }, null, 1));
const attesi = SOLO.length * 2 + (SOLO.includes('D') ? 1 : 0);/* [giro 311] D ha tre bracci (verde, rosso, rosso311) */ const ok = esiti.filter(e => e.ok).length;
console.log(`bilancio-310: ${ok}/${attesi} bracci con l'esito atteso${errors.length ? ' · errori pagina: ' + errors.slice(0, 3).join(' | ') : ''}`);
process.exit(ok === attesi && esiti.length === attesi && !errors.length ? 0 : 1);
