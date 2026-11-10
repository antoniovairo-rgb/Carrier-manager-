#!/usr/bin/env node
/* [giro 156 · PO-360, SOLO MISURA] «se simulo le partite l'eroe gioca sempre male, soprattutto ad inizio carriera, è normale?»
   Sonda di misura, NON guardiano (esce sempre 0, non giudica). Tre fasi:
     funzione — sulle funzioni VERE del gioco (simulateMatch col motore + _pSimStats + la stessa correzione del voto di
                simulateAndAdvance, src/18 ~3446) a OVR 55..80, Primavera st.1 e prima squadra: voto, gol, assist, scelta del
                mister (stato156/quota156), esito della squadra. N partite per gruppo (CPM_N, default 160).
     simula   — percorso vero del tasto «Simula» (__CPM_CAREER.step → simulateAndAdvance) per CPM_SETT settimane da due
                salvataggi del PO (fixtures/save-c177-s1w15 Primavera, save-c177-s5w20 prima squadra): voci simulate nuove.
     vivo     — le stesse gare giocate dal vivo col pilota automatico (__CPM_CAREER.playMatch + __CPM_AUTOPLAY), CPM_VIVO
                partite per salvataggio: voto registrato in matchHistory (simulated:false).
   Uso: node sim-voto-156.mjs   (CPM_FASI=funzione,simula,vivo · CPM_JSON=<file> per salvare i numeri). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const FASI = (process.env.CPM_FASI || 'funzione,simula,vivo').split(',');
const N = +(process.env.CPM_N || 160), SETT = +(process.env.CPM_SETT || 14), VIVO = +(process.env.CPM_VIVO || 3);
const fx = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f + '.json', import.meta.url)));
const SALVA = { primavera: fx('save-c177-s1w15'), pro: fx('save-c177-s5w20') };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const out = { funzione: [], simula: [], vivo: [], storico: {} };

async function apri(saveObj, nome, extra) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const s = JSON.parse(JSON.stringify(saveObj)); const pl = JSON.parse(s['cpm-v3']);
  if (nome) pl.player.name = nome;
  if (extra) Object.assign(pl.player, extra);
  s['cpm-v3'] = JSON.stringify(pl);
  await page.addInitScript((S) => { window.__CPM_GLB = false; for (const k of Object.keys(S)) { try { localStorage.setItem(k, typeof S[k] === 'string' ? S[k] : JSON.stringify(S[k])); } catch (e) {} } try { localStorage.setItem('cpm-match-speed', '2'); localStorage.removeItem('cpm-match-resume'); } catch (e) {} }, s);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1200);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  return { ctx, page };
}
const media = (v) => v.length ? v.reduce((a, x) => a + x, 0) / v.length : NaN;
const mediana = (v) => { if (!v.length) return NaN; const s = [...v].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const f2 = (x) => isFinite(x) ? x.toFixed(2) : '-';
const pc = (a, n) => n ? (100 * a / n).toFixed(1) + '%' : '-';
function riassunto(nome, righe) {
  const conV = righe.filter(r => r.voto != null);
  const v = conV.map(r => r.voto);
  const fasce = { '<5,5': 0, '5,5-5,9': 0, '6,0-6,4': 0, '6,5-6,9': 0, '>=7': 0 };
  v.forEach(x => { fasce[x < 5.5 ? '<5,5' : x < 6 ? '5,5-5,9' : x < 6.5 ? '6,0-6,4' : x < 7 ? '6,5-6,9' : '>=7']++; });
  const haStato = righe.some(r => r.stato != null);
  const st = (k) => righe.filter(r => r.stato === k).length;
  const W = righe.filter(r => r.esito === 'V').length, D = righe.filter(r => r.esito === 'N').length, L = righe.filter(r => r.esito === 'P').length;
  const vPer = (k) => f2(media(conV.filter(r => r.stato === k).map(r => r.voto)));
  const vEs = (k) => f2(media(conV.filter(r => r.esito === k).map(r => r.voto)));
  const R = { gruppo: nome, n: righe.length, conVoto: conV.length, media: +f2(media(v)), mediana: mediana(v), sotto6: pc(v.filter(x => x < 6).length, v.length),
    golPP: +f2(media(righe.map(r => r.g || 0))), assPP: +f2(media(righe.map(r => r.a || 0))),
    presenze: pc(righe.filter(r => r.presente !== false).length, righe.length),
    quotaMin: righe.some(r => r.quota != null) ? f2(media(righe.filter(r => r.quota != null).map(r => r.quota))) : '-',
    titolare: haStato ? pc(st('starter'), righe.length) : '-', panchina: haStato ? pc(st('bench'), righe.length) : '-', nonConv: haStato ? pc(st('not_called'), righe.length) : '-',
    votoTit: vPer('starter'), votoPan: vPer('bench'), VNP: `${pc(W, righe.length)}/${pc(D, righe.length)}/${pc(L, righe.length)}`,
    votoV: vEs('V'), votoN: vEs('N'), votoP: vEs('P'), fasce };
  console.log(`  ${nome.padEnd(34)} n=${String(R.n).padStart(3)} voto ${f2(R.media)} (med ${f2(R.mediana)}) <6 ${R.sotto6.padStart(6)} · gol/p ${f2(R.golPP)} ass/p ${f2(R.assPP)} · pres ${R.presenze} quota ${R.quotaMin} · tit ${R.titolare} pan ${R.panchina} nc ${R.nonConv} · voto tit/pan ${R.votoTit}/${R.votoPan} · V/N/P ${R.VNP} · voto V/N/P ${R.votoV}/${R.votoN}/${R.votoP}`);
  const conHs = righe.filter(r => r.hs != null), segna = conHs.filter(r => r.hs > 0);
  R.squadraASegno = conHs.length ? pc(segna.length, conHs.length) : '-'; R.golSeSegna = segna.length ? +f2(media(segna.map(r => r.g || 0))) : null;
  R.golSquadra = conHs.length ? +f2(media(conHs.map(r => r.hs))) : null;
  console.log(`  ${''.padEnd(34)} fasce ${JSON.stringify(fasce)}${conHs.length ? ` · squadra a segno ${R.squadraASegno} (gol squadra/p ${f2(R.golSquadra)}) · gol eroe quando la squadra segna ${f2(R.golSeSegna)}` : ''}`);
  return R;
}

/* ── i dati che il PO ha già nei salvataggi ─────────────────────────────────────────────────────────────── */
for (const [k, s] of Object.entries(SALVA)) {
  const p = JSON.parse(s['cpm-v3']).player; const mh = p.matchHistory || [];
  const righe = (sim) => mh.filter(m => !!m.simulated === sim && !m.injured).map(m => ({ voto: m.rating > 0 ? m.rating : null, g: m.goals || 0, a: m.assists || 0, esito: m.won ? 'V' : m.drew ? 'N' : 'P', presente: !(m.nonConvocato || m.squalificato || m.svincolato), stato: null }));
  console.log(`\n── storico del salvataggio ${k} (S${p.season} W${p.week}, OVR ${p.ovr}, età ${p.age}, club ${p.club && p.club.n} p${p.club && p.club.p}) ──`);
  out.storico[k] = { simulate: riassunto(k + ' · simulate (storico)', righe(true)), vivo: riassunto(k + ' · dal vivo (storico)', righe(false)) };
}

/* ── FASE 1: funzioni vere, gruppi per OVR ────────────────────────────────────────────────────────────── */
if (FASI.includes('funzione')) {
  const { ctx, page } = await apri(SALVA.primavera, 'Sonda Voto');
  const GRUPPI = [
    ...[55, 60, 65, 70, 75, 80].map(o => ({ nome: `Primavera st.1 OVR ${o} (club p25)`, base: 'primavera', ovr: o, age: 17 })),
    ...[62, 70].map(o => ({ nome: `Primavera st.1 OVR ${o} (club medio p55)`, base: 'primavera', ovr: o, age: 17, clubP: 55 })),
    ...[60, 65, 70, 75, 80].map(o => ({ nome: `Prima squadra 19 anni OVR ${o} (p79)`, base: 'pro', ovr: o, age: 19 })),
    ...[70, 80].map(o => ({ nome: `Prima squadra 26 anni OVR ${o} (p79)`, base: 'pro', ovr: o, age: 26 })),
  ];
  console.log(`\n── FASE funzione: simulateMatch(motore) + _pSimStats + correzione voto di simulateAndAdvance · N=${N} per gruppo ──`);
  for (const G of GRUPPI) {
    const base = JSON.parse(SALVA[G.base]['cpm-v3']).player;
    const righe = await page.evaluate(({ base, G, N }) => {
      const club = { ...base.club, ...(G.clubP ? { p: G.clubP } : {}) };
      let p = { ...base, ovr: G.ovr, age: G.age, club, coachTrust: 60, form: 70, fatigue: 10, matchHistory: [], name: 'Sonda Voto' };
      const pool = getLeagueClubs(p).filter(c => c && c.id !== club.id);/* gli avversari veri della lega (Primavera 2 = U18_CLUBS_P2) */
      if (!pool.length) return { err: 'pool vuoto' };
      try { p.squadRole = calcSquadRole(p); } catch (e) {}
      const R = [];
      for (let i = 0; i < N; i++) {
        const w = (i % 34) + 1, season = 1 + Math.floor(i / 34); p = { ...p, week: w, season };
        const opp = pool[i % pool.length]; const isHome = (i % 2) === 0;
        /* stessi semi del percorso vero (src/18 ~3353-3445): _aSd = standingsSeed(club, stagione, settimana), gara _aSd+md*31+1, G/A _aSd+2 */
        const _aSd = standingsSeed(club.id || club.n, season, w); const seed = (_aSd + w * 31 + 1) >>> 0, seedPS = (_aSd + 2) >>> 0;
        const sim = simulateMatch(p.club, opp, p.ovr, isHome, seed, {}, { motore: true, giocatore: p, stileEroe: (typeof stileMotore === 'function' ? stileMotore(p) : null), stile: (p.coach && p.coach.style) || null });
        const ps = _pSimStats(sim, p.ovr, p.archetype?.id || p.archetype || '', seededRng(seedPS));
        const voto = Math.round(clamp(sim.rating + ps.goals * 0.4 + ps.assists * 0.2, 4.0, 9.5) * 10) / 10;
        const r = { voto, base: sim.rating, g: ps.goals, a: ps.goals != null ? ps.assists : 0, esito: sim.won ? 'V' : sim.drew ? 'N' : 'P', stato: sim.stato156 || null, quota: sim.quota156 != null ? sim.quota156 : null, hs: sim.homeScore, as: sim.awayScore };
        R.push(r);
        p = { ...p, matchHistory: [...p.matchHistory, { rating: voto, simulated: true }].slice(-5) };/* la scelta del mister legge la media degli ultimi 3 voti */
      }
      return { R, oppP: pool.reduce((a, c) => a + (c.p || 65), 0) / pool.length, lega: club.lg };
    }, { base, G, N });
    if (righe.err) { console.log('  ' + G.nome + ': ' + righe.err); continue; }
    console.log(`  [${G.nome}] lega ${righe.lega} · prestigio medio avversari ${righe.oppP.toFixed(1)} · prestigio club ${G.clubP || base.club.p}`);
    out.funzione.push({ ...riassunto(G.nome, righe.R), ...G, oppP: righe.oppP, lega: righe.lega });
  }
  await ctx.close();
}

/* ── FASE 2: percorso vero del tasto Simula ───────────────────────────────────────────────────────────── */
async function storiaNuova(page, da) { return page.evaluate((da) => { const s = window.__CPM_CAREER.snapshot(); return { mh: (s.matchHistory || []).slice(da), ovr: s.ovr, week: s.week, season: s.season }; }, da); }
if (FASI.includes('simula')) {
  console.log(`\n── FASE simula: tasto «Simula» vero (__CPM_CAREER.step) per ${SETT} settimane dai salvataggi del PO ──`);
  for (const k of Object.keys(SALVA)) {
    const { ctx, page } = await apri(SALVA[k], null, { ovrSonda156: undefined });
    const da = await page.evaluate(() => (window.__CPM_CAREER.snapshot().matchHistory || []).length);
    const ovr0 = await page.evaluate(() => window.__CPM_CAREER.snapshot().ovr);
    let it = 0, giocate = 0;
    while (it++ < SETT * 4 && giocate < SETT) {
      const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); return res; });
      if (r === 'simulated') giocate++;
      if (r === 'seasonEnd') break;
      if (String(r).startsWith('blocked:')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
      await sleep(120);
    }
    const st = await storiaNuova(page, da);
    const righe = st.mh.filter(m => m.simulated && !m.injured).map(m => ({ voto: m.rating > 0 ? m.rating : null, g: m.goals || 0, a: m.assists || 0, esito: m.won ? 'V' : m.drew ? 'N' : 'P', presente: !(m.nonConvocato || m.squalificato || m.svincolato), stato: null }));
    out.simula.push({ ...riassunto(`${k} · Simula vero (OVR ${ovr0}→${st.ovr})`, righe), salvataggio: k });
    await ctx.close();
  }
}

/* ── FASE 3: dal vivo col pilota automatico ───────────────────────────────────────────────────────────── */
if (FASI.includes('vivo')) {
  console.log(`\n── FASE vivo: ${VIVO} partite dal vivo per salvataggio (pilota automatico, politica seeded) ──`);
  const DA = +(process.env.CPM_VIVO_DA || 0);/* per spezzare la fase in chiamate brevi: indice di partenza (cambia il nome, quindi la partita) */
  for (const k of Object.keys(SALVA)) {
    const righe = [];
    for (let i = DA; i < DA + VIVO; i++) {
      const { ctx, page } = await apri(SALVA[k], 'Sonda Vivo ' + i);
      const da = await page.evaluate(() => (window.__CPM_CAREER.snapshot().matchHistory || []).length);
      let pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
      for (let t = 0; t < 30 && pm !== true; t++) { /* settimana senza gara o apertura: si avanza col percorso vero finché c'è una gara */
        await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; }); await sleep(150);
        pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
      }
      await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
      await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), 1000 + i);
      const t0 = Date.now(); let ph = '';
      while (Date.now() - t0 < 300000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => ''); if (ph === 'ended' || ph === 'ceremony') break; await sleep(1000); }
      const res = await page.evaluate(() => { try { return window.__CPM_ENDRESULT20 ? window.__CPM_ENDRESULT20() : null; } catch (e) { return null; } }).catch(() => null);
      /* chiusura del post-partita: il risultato entra in matchHistory solo dopo onMatchEnd */
      for (let t = 0; t < 8; t++) { try { await page.getByText(/continua|torna|chiudi/i).first().click({ timeout: 1500 }); } catch (e) {} await sleep(500); }
      const st = await storiaNuova(page, da);
      const m = st.mh.filter(x => !x.simulated).pop() || null;
      const voto = m && m.rating > 0 ? m.rating : (res && res.rating != null ? +res.rating : null);
      righe.push({ voto, g: m ? m.goals || 0 : (res ? res.goals || 0 : 0), a: m ? m.assists || 0 : (res ? res.assists || 0 : 0), esito: m ? (m.won ? 'V' : m.drew ? 'N' : 'P') : (res ? (res.won ? 'V' : res.drew ? 'N' : 'P') : '?'), stato: (m && m.matchStatus) || (res && res.matchStatus) || null, quota: res && res.minutesPlayed != null ? res.minutesPlayed / 90 : null });
      console.log(`    ${k} vivo ${i}: fase ${ph} · voto ${voto} · ${m ? m.homeScore + '-' + m.awayScore : res ? res.homeScore + '-' + res.awayScore : '?'} · stato ${righe[righe.length - 1].stato} · fonte ${m ? 'matchHistory' : res ? 'endResult' : 'nessuna'}`);
      await ctx.close();
    }
    out.vivo.push({ ...riassunto(`${k} · dal vivo (pilota)`, righe), salvataggio: k });
  }
}
await browser.close(); srv.close();
if (process.env.CPM_JSON) fs.writeFileSync(process.env.CPM_JSON, JSON.stringify(out, null, 1));
console.log('\nsim-voto-156: misura completata (sonda di sola misura, nessun giudizio)');
