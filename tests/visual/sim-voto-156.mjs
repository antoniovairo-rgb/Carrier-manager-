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
  s['cpm-v3'] = JSON.stringify(pl); if (process.env.CPM_ROSSO === '1') s.__rosso158 = 1;/* [giro 158] braccio rosso: voto con la formula di prima */
  await page.addInitScript((S) => { window.__CPM_GLB = false; if (S.__rosso158) window.__CPM_NO_G158 = 1; delete S.__rosso158; for (const k of Object.keys(S)) { try { localStorage.setItem(k, typeof S[k] === 'string' ? S[k] : JSON.stringify(S[k])); } catch (e) {} } try { localStorage.setItem('cpm-match-speed', '2'); localStorage.removeItem('cpm-match-resume'); } catch (e) {} }, s);
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
        const voto = (typeof votoSimEroe === 'function') ? votoSimEroe(sim, ps) : Math.round(clamp(sim.rating + ps.goals * 0.4 + ps.assists * 0.2, 4.0, 9.5) * 10) / 10;/* [giro 158] la funzione del gioco */
        /* [giro 158] doppio conteggio: «C ingenuo» = pagella del motore intera (gol del motore dentro) compressa coi minuti + 0,4 a gol + 0,2 ad assist registrati */
        const pg = sim.pag158 || null, qq = sim.quota156 != null ? sim.quota156 : 1;
        const naive = pg ? Math.round(clamp(6 + (pg.voto - 6) * (0.3 + 0.7 * qq) + ps.goals * 0.4 + ps.assists * 0.2, 4.0, 9.5) * 10) / 10 : null;
        const r = { voto, naive, eg: pg ? pg.gol | 0 : null, ea: pg ? pg.assist | 0 : null, base: sim.rating, g: ps.goals, a: ps.goals != null ? ps.assists : 0, esito: sim.won ? 'V' : sim.drew ? 'N' : 'P', stato: sim.stato156 || null, quota: sim.quota156 != null ? sim.quota156 : null, hs: sim.homeScore, as: sim.awayScore };
        R.push(r);
        p = { ...p, matchHistory: [...p.matchHistory, { rating: voto, simulated: true }].slice(-5) };/* la scelta del mister legge la media degli ultimi 3 voti */
      }
      return { R, oppP: pool.reduce((a, c) => a + (c.p || 65), 0) / pool.length, lega: club.lg };
    }, { base, G, N });
    if (righe.err) { console.log('  ' + G.nome + ': ' + righe.err); continue; }
    console.log(`  [${G.nome}] lega ${righe.lega} · prestigio medio avversari ${righe.oppP.toFixed(1)} · prestigio club ${G.clubP || base.club.p}`);
    const RR = righe.R, conP = RR.filter(r => r.naive != null);
    if (conP.length) { const mm = (f) => media(conP.map(f)); const egSenza = conP.filter(r => r.eg > 0 && !r.g).length, gSenza = conP.filter(r => r.g > 0 && !(r.eg > 0)).length, ent = conP.filter(r => r.eg > 0 && r.g > 0).length;
      const dG = conP.filter(r => r.eg > 0 || r.g > 0);
      console.log(`  ${''.padEnd(34)} [158] doppio conteggio: voto C ingenuo ${f2(mm(r => r.naive))} contro ${f2(mm(r => r.voto))} · gol eroe motore/p ${f2(mm(r => r.eg))} registrati/p ${f2(mm(r => r.g))} · partite con gol del motore NON registrato ${egSenza}, registrato senza gol del motore ${gSenza}, entrambi ${ent} · scarto medio ingenuo-corretto dove c'e' un gol ${f2(media(dG.map(r => r.naive - r.voto)))} (n ${dG.length})`);
      out.funzione158 = out.funzione158 || []; out.funzione158.push({ gruppo: G.nome, naive: +f2(mm(r => r.naive)), corretto: +f2(mm(r => r.voto)), egPP: +f2(mm(r => r.eg)), gPP: +f2(mm(r => r.g)), egSenza, gSenza, entrambi: ent, scartoConGol: +f2(media(dG.map(r => r.naive - r.voto))), nConGol: dG.length }); }
    out.funzione.push({ ...riassunto(G.nome, righe.R), ...G, oppP: righe.oppP, lega: righe.lega });
  }
  await ctx.close();
}

/* ── FASE opzioni: tre tarature possibili, calcolate sulle stesse partite (NESSUNA applicata al gioco) ───────────
   A = base del voto spostata verso il dal vivo: pareggio 6,0 (era 5,8), sconfitta 5,7 - 0,15 x scarto (max -0,4) (era 5,5 - 0,18 x scarto, max -0,5)
   B = in Primavera (u18) l'OVR neutro e' 60 invece di 71 (stesso +0,05 a punto, tetto +0,6)
   C = il voto e' la PAGELLA dell'eroe che il motore senza grafica ha gia' calcolato (simulaPartitaMotore con dettaglio, stesso
       seme e stessa forza della gara simulata), compressa verso 6 con la quota minuti come oggi; + gol/assist come oggi. */
if (FASI.includes('opzioni')) {
  const { ctx, page } = await apri(SALVA.primavera, 'Sonda Voto');
  const GR = [[55, 'primavera', 17], [62, 'primavera', 17], [70, 'primavera', 17], [60, 'pro', 19], [70, 'pro', 19], [80, 'pro', 19], [75, 'pro', 26]];
  console.log(`\n── FASE opzioni (N=${N} per gruppo; voto medio · % sotto 6 · mediana) ──`);
  out.opzioni = [];
  for (const [ovr, b, age] of GR) {
    const base = JSON.parse(SALVA[b]['cpm-v3']).player;
    const r = await page.evaluate(({ base, ovr, age, N }) => {
      const club = base.club; let p = { ...base, ovr, age, coachTrust: 60, form: 70, fatigue: 10, matchHistory: [], name: 'Sonda Voto' };
      try { p.squadRole = calcSquadRole(p); } catch (e) {}
      const pool = getLeagueClubs(p).filter(c => c && c.id !== club.id);
      const V = { att: [], A: [], B: [], C: [] }; let stessa = 0, conPag = 0;
      for (let i = 0; i < N; i++) {
        const w = (i % 34) + 1, season = 1 + Math.floor(i / 34); p = { ...p, week: w, season };
        const opp = pool[i % pool.length]; const isHome = (i % 2) === 0;
        const _aSd = standingsSeed(club.id || club.n, season, w); const seed = (_aSd + w * 31 + 1) >>> 0, seedPS = (_aSd + 2) >>> 0;
        const sim = simulateMatch(p.club, opp, p.ovr, isHome, seed, {}, { motore: true, giocatore: p, stileEroe: (typeof stileMotore === 'function' ? stileMotore(p) : null), stile: null });
        const ps = _pSimStats(sim, p.ovr, p.archetype?.id || p.archetype || '', seededRng(seedPS));
        const gaBonus = ps.goals * 0.4 + ps.assists * 0.2, q = sim.quota156 != null ? sim.quota156 : 1, ov = sim.ovr156 != null ? sim.ovr156 : ovr;
        const fin = (x) => Math.round(clamp(x + gaBonus, 4.0, 9.5) * 10) / 10;
        const att = fin(sim.rating); V.att.push(att);
        const m = sim.homeScore - sim.awayScore, nz = sim.rating - (m > 0 ? (6.2 + Math.min(m * 0.25, 0.8)) : m === 0 ? 5.8 : (5.5 - Math.min(-m * 0.18, 0.5)));/* rumore+bonus OVR gia' dentro il voto di oggi (prima della compressione: approssimato) */
        const baseA = m > 0 ? (6.2 + Math.min(m * 0.25, 0.8)) : m === 0 ? 6.0 : (5.7 - Math.min(-m * 0.15, 0.4));
        const baseO = m > 0 ? (6.2 + Math.min(m * 0.25, 0.8)) : m === 0 ? 5.8 : (5.5 - Math.min(-m * 0.18, 0.5));
        const comp = (r) => 6 + (r - 6) * (0.3 + 0.7 * q);
        const ovB = (base.proStatus === 'u18') ? ov - 60 : ov - 71 - (age >= 31 ? 3 : 0);
        const ovO = ov - 71 - (age >= 31 ? 3 : 0);
        const rn = (seededRng((seed ^ 0xa156) >>> 0)() - 0.5) * 0.4;
        V.A.push(fin(comp(baseA + clamp(ovO * 0.05, 0, 0.6) + rn)));
        V.B.push(fin(comp(baseO + clamp(ovB * 0.05, 0, 0.6) + rn)));
        let vC = null;
        try { const fz = clamp((ov - 70) * 1.0, 0, 15) * q; const cp = clamp((club.p || 65), 30, 99), op = clamp((opp.p || 65), 30, 99);
          const R = simulaPartitaMotore({ seed: (seed >>> 0) ^ 0x5a17, forzaH: clamp(cp + fz, 30, 99), forzaA: op, stadio: isHome ? 'home' : 'away', ovr: ovr, stile: (typeof stileMotore === 'function' ? stileMotore(p) : null), dettaglio: true });
          if (R.home === sim.homeScore && R.away === sim.awayScore) stessa++;
          const e = (R.pag || []).find(x => x && x.eroe); if (e && typeof e.voto === 'number') { conPag++; vC = fin(comp(e.voto)); } } catch (e) {}
        V.C.push(vC);
        p = { ...p, matchHistory: [...p.matchHistory, { rating: att, simulated: true }].slice(-5) };
      }
      return { V, stessa, conPag };
    }, { base, ovr, age, N });
    const st = (a) => { const v = a.filter(x => x != null); return `${f2(media(v))} · <6 ${pc(v.filter(x => x < 6).length, v.length)} · med ${f2(mediana(v))}`; };
    const nome = `${b === 'pro' ? 'Prima squadra ' + age + ' anni' : 'Primavera st.1'} OVR ${ovr}`;
    console.log(`  ${nome.padEnd(30)} oggi ${st(r.V.att)} | A ${st(r.V.A)} | B ${st(r.V.B)} | C ${st(r.V.C)} (pagella trovata ${r.conPag}/${N}, stesso risultato della gara simulata ${r.stessa}/${N})`);
    out.opzioni.push({ nome, oggi: st(r.V.att), A: st(r.V.A), B: st(r.V.B), C: st(r.V.C), conPag: r.conPag, stessa: r.stessa });
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
      console.log(`    ${k} vivo ${i}: fase ${ph} · voto ${voto} · ${m ? m.homeScore + '-' + m.awayScore : res ? res.homeScore + '-' + res.awayScore : '?'} · gol ${righe[righe.length - 1].g} assist ${righe[righe.length - 1].a} · stato ${righe[righe.length - 1].stato} · fonte ${m ? 'matchHistory' : res ? 'endResult' : 'nessuna'}`);
      await ctx.close();
    }
    out.vivo.push({ ...riassunto(`${k} · dal vivo (pilota)`, righe), salvataggio: k });
  }
}
await browser.close(); srv.close();
if (process.env.CPM_JSON) fs.writeFileSync(process.env.CPM_JSON, JSON.stringify(out, null, 1));
console.log('\nsim-voto-156: misura completata (sonda di sola misura, nessun giudizio)');
