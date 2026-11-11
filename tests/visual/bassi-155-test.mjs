#!/usr/bin/env node
/* [giro 155] GUARDIANO DEI BASSI corretti nel giro 155 (verifica del giro 140 sui bassi del collaudo 177).
   Per ogni correzione una prova sul gioco vero (funzioni del gioco chiamate nella pagina, oppure misura sul DOM, oppure flusso
   `__CPM_CAREER`), e la stessa prova con l'interruttore rosso: il guardiano e' verde solo se ogni prova e' VERDE a correzione accesa
   e ROSSA a correzione spenta. Tre bracci:
     A · verde (nessun interruttore)
     B · rosso per codice: window.__CPM_NO_G155_<codice> acceso solo per la prova di quel codice, nella stessa pagina
     C · rosso unico: window.__CPM_NO_G155 dal caricamento, tutte le prove devono cadere
   «Non giudicato» (prova che non riesce a misurare) conta come ROSSO in A e come NON caduta in B/C.
   Soglie fisse, scritte qui sotto; non si abbassano. */
import fs from 'node:fs';
import { startServer, launchBrowser, apriPagina, entraInCarriera, sleep, SAVE, ferma, premi } from './c178-graf-lib.mjs';
const ROOT = new URL('../../', import.meta.url).pathname;
const TEL = { k: 'tel', w: 412, h: 915, touch: true };
const HTML = fs.readFileSync(ROOT + 'CARRIER-MANAGER-AV.html', 'utf8');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = [];

/* 0 · le funzioni provate devono essere USATE dove il difetto viveva (definizione + almeno un uso) */
const USI = { B1: 'trofeiOro155(', B2: 'sottopagato155(', B6: 'popAvviso155(', B8: 'etichettaPrimaParte155(', B10: 'bannerEuropa155(',
  B11: 'stagioniLettera155(', B13: 'stagioneVoce155(', D9: 'nettoMostrato155(', D14: 'gradinoLeader155(', D15: 'poolMister155(', T359: 'titoloAllievo359(' };
const statico = {}; for (const [k, f] of Object.entries(USI)) statico[k] = HTML.split(f).length - 1;
statico.D9firma = HTML.includes(':nettoFirma155(player,wage);');
statico.B3 = HTML.includes('(_g155("B3")||_gara154(p))');
statico.D15cup = (HTML.match(/\{result:"cup",style:null,txt:/g) || []).length;
statico.D21 = HTML.includes('gap:(_g155("D21")?4:SP.sm)');
statico.B12 = HTML.includes('data-cpm="fine155-piede"');
statico.L358 = HTML.includes('Math.min(trophies*80,LEGACY_TETTI358.trofei)');
const staticoOk = Object.entries(USI).every(([k]) => statico[k] >= 2) && statico.D9firma && statico.B3 && statico.D15cup >= 2 && statico.D21 && statico.B12 && statico.L358;

/* prove di logica: girano nella pagina, ritornano {ok, dato} */
const LOGICA = {
  B1: () => { const s = trofeiOro155({ trofei: 'campione · coppa nazionale' }); return { ok: /🏆 campione/.test(s), dato: s }; },
  B2: () => { const est = _ovrToWageWeekly133(80, 55); const p = { ovr: 80, club: { p: 55 }, contract: { wage: Math.round(est * 1.05) } };
    const s = sottopagato155(p); return { ok: s === false, dato: { stima: est, stipendio: p.contract.wage, sottopagato: s } }; },
  B3: () => { const im = WEEKLY_IMPULSES.find(x => x.id === 'wi_tv_primaserata'); const fuori = { popularity: 70, week: 39, season: 1, calendar: [{ week: 30, played: true }] };
    const dentro = { popularity: 70, week: 12, season: 1, calendar: [{ week: 12, played: false, matchday: 12 }] };
    const a = !!im.cond(fuori), c = !!im.cond(dentro); return { ok: a === false && c === true, dato: { stagioneChiusa: a, settimanaConGara: c } }; },
  B6: () => { const p = { popularity: 30, totalMatches: 0, season: 1 }; const d = popAvviso155(p, 3); const ap = clamp(30 + popGain(p, 3), 0, 100) - 30; return { ok: d === ap && d !== 3, dato: { avviso: d, applicato: ap } }; },
  B8: () => { const s = etichettaPrimaParte155('FC Clermont'); return { ok: !/con il/.test(s) && /FC Clermont/.test(s), dato: s }; },
  B10: () => { const x = bannerEuropa155(true, false, 'FC Prova', 'Coppa dei Campioni'); const y = bannerEuropa155(false, false, 'FC Prova', 'Coppa dei Campioni');
    return { ok: !/IN EUROPA|IMPRESA|qualificato/.test(x.titolo + x.riga) && /IN EUROPA/.test(y.titolo), dato: { conCoppa: x, senza: y.titolo } }; },
  B11: () => { const p = { season: 18, history: Array.from({ length: 18 }, (_, i) => ({ season: i + 1 })) }; const l = stagioniLettera155(p), t = stagioniGiocate94(p); return { ok: l === t, dato: { lettera: l, intestazione: t } }; },
  B13: () => { const v = stagioneVoce155({ season: 7 }); return { ok: v.season === 7, dato: v }; },
  D9: () => { const p = { hasAgent: true, agentRenewalBonus: 0.1 }; const m = nettoMostrato155(p, 1000); return { ok: m === Math.round(1000 * 1.15 * 1.1), dato: { mostrato: m, firmato: nettoFirma155(p, 1000) } }; },
  D10: () => { const f = getCareerPhase(24).label; return { ok: f !== 'Titolare affermato' && !/Titolare|Riserva|Rotazione|Leader/.test(f), dato: f }; },
  D14: () => { const s = gradinoLeader155({ age: 33, totalMatches: 602, coachTrust: 100, ovr: 86, popularity: 40, club: { p: 70 } }); return { ok: /popolarità 58\+ \(ora 40\)/.test(s) && /OVR 80\+/.test(s) && /non subito/.test(s), dato: s }; },
  D15: () => { const c = classeMister155({ cupChamp: true, top: true }); const z = poolMister155('good', 95, null, 0).some(d => d.result === 'any'); const u = poolMister155('good', 95, null, 20).some(d => d.result === 'any');
    const pc = poolMister155('cup', 50, null, 20).length; return { ok: c === 'cup' && !z && u && pc >= 2, dato: { classe: c, fiducia0presenze: z, fiducia20presenze: u, frasiCoppa: pc } }; },
  L358: () => { const d18 = { totalGoals: 319, totalAssists: 119, trophies: new Array(6).fill({}), ovr: 90, season: 17, nationalCaps: 0, history: [] };
    const leg = { totalGoals: 999, totalAssists: 999, trophies: new Array(20).fill({}), ovr: 99, season: 40, nationalCaps: 99, history: [], academy24: { tot: 10 }, beni24: ['fondazione'], bankBalance: 99000000 };
    const a = calcLegacyScore(d18), c = calcLegacyScore(leg), noTr = calcLegacyScore({ ...leg, trophies: [] });
    const somma = Object.values(LEGACY_TETTI358).reduce((x, y) => x + y, 0);
    return { ok: a < 1000 && c === 1000 && noTr < 1000 && somma === 1000, dato: { carrieraD18: a, leggenda: c, leggendaSenzaTrofei: noTr, sommaTetti: somma } }; },
  T359: () => { const t = titoloAllievo359(), d = isDerby('mun', 'liv'); return { ok: t === 'Il tuo allievo' && d && !/Ovest Lontano/.test(d.name), dato: { arco: t, derby: d && d.name } }; },
};
const ORD = Object.keys(LOGICA);
const proveLogica = async (page, rossoPerCodice) => { const out = {};
  for (const k of ORD) { out[k] = await page.evaluate(([k, src, rosso]) => { try { if (rosso) window['__CPM_NO_G155_' + k] = true; const f = eval('(' + src + ')'); return f(); } catch (e) { return { ok: null, dato: 'non giudicato: ' + e.message }; } finally { delete window['__CPM_NO_G155_' + k]; } }, [k, LOGICA[k].toString(), rossoPerCodice]); }
  return out; };

/* B12 · tasto di chiusura della fine stagione dentro lo schermo del telefono */
const provaB12 = async (page, rosso) => { if (rosso) await page.evaluate(() => { window.__CPM_NO_G155_B12 = true; });
  const r = await page.evaluate(() => window.__CPM_CAREER.apriFine302('stagione')); await sleep(2500); await ferma(page, 9000);
  const m = await page.evaluate(() => { const H = innerHeight; const bt = [...document.querySelectorAll('button')].filter(x => /Inizia Stagione|giorno dell'addio|Riepilogo in corso/.test(x.textContent || ''));
    return bt.map(x => { const q = x.getBoundingClientRect(); const cx = q.left + q.width / 2, cy = q.top + q.height / 2; const e = cy >= 0 && cy <= H ? document.elementFromPoint(cx, cy) : null; return { t: (x.textContent || '').trim().slice(0, 30), top: Math.round(q.top), bottom: Math.round(q.bottom), H, toccabile: !!(e && (e === x || x.contains(e))) }; }); });
  await page.evaluate(() => { delete window.__CPM_NO_G155_B12; try { window.__CPM_CAREER.goTab('dashboard'); } catch (e) {} }); await sleep(600);
  if (r !== true || !m.length) return { ok: null, dato: { apri: r, bottoni: m } };
  return { ok: m.every(x => x.bottom <= x.H && x.top >= 0 && x.toccabile), dato: m }; };

/* D17 · registro delle giornate e cup.club: lo stato VIVO e' gia' quello che il caricamento ricostruirebbe */
const provaD17 = async (page, rosso) => { if (rosso) await page.evaluate(() => { window.__CPM_NO_G155_D17 = true; });
  for (let i = 0; i < 6; i++) { await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} return window.__CPM_CAREER.step(); }); await sleep(450); }
  await sleep(1500);
  const reg = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); const sn = s.season || 1; const giocate = (s.calendar || []).filter(m => m && m.played && m.matchday != null).map(m => m.matchday);
    const md = (s.playedMd && s.playedMd.s === sn && s.playedMd.md) || []; return { week: s.week, giocate, mancanti: giocate.filter(n => md.indexOf(n) < 0), registro: md.length }; });
  const ns = await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} return window.__CPM_CAREER.startNewSeason(); }); await sleep(2500);
  const cup = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { season: s.season, cupClub: s.cup ? (s.cup.club || null) : 'nessuna coppa', club: s.club && s.club.id, cupSeason: s.cup && s.cup.season }; });
  await page.evaluate(() => { delete window.__CPM_NO_G155_D17; });
  if (!reg.giocate.length || ns !== true || cup.cupClub === 'nessuna coppa') return { ok: null, dato: { reg, nuovaStagione: ns, cup } };
  return { ok: reg.mancanti.length === 0 && cup.cupClub === cup.club, dato: { reg, cup } }; };

/* D21 · distanza fra i bottoni dell'elenco «Club dei sogni» (Creazione) */
const SOGLIA_D21 = 7.5;
const provaD21 = async (page, rosso) => { if (rosso) await page.evaluate(() => { window.__CPM_NO_G155_D21 = true; });
  await sleep(800); await premi(page, 'Nuova carriera'); await sleep(900); await ferma(page);
  await page.evaluate(() => { const s = [...document.querySelectorAll('summary')].find(x => /Club dei sogni/.test(x.textContent || '')); if (s && s.parentElement && !s.parentElement.open) s.click(); }); await sleep(500);
  const m = await page.evaluate(() => { const box = document.querySelector('[data-cpm="sogni155"]'); if (!box) return null; const bt = [...box.querySelectorAll('button')].map(x => x.getBoundingClientRect()).filter(r => r.height > 0);
    const g = []; for (let i = 0; i + 1 < bt.length; i++) g.push(Math.round((bt[i + 1].top - bt[i].bottom) * 10) / 10); g.sort((a, c) => a - c); return { n: bt.length, min: g[0], mediana: g[g.length >> 1] }; });
  await page.evaluate(() => { delete window.__CPM_NO_G155_D21; });
  if (!m || m.n < 3) return { ok: null, dato: m };
  return { ok: m.mediana >= SOGLIA_D21 && m.min >= SOGLIA_D21, dato: m }; };

const braccio = async (nome, rossi, rossoPerCodice) => { const R = {};
  { const { ctx, page } = await apriPagina(b, port, TEL, { rossi }, '?cpmtest=1', errs); R.D21 = await provaD21(page, rossoPerCodice); await ctx.close(); }
  { const { ctx, page } = await apriPagina(b, port, TEL, { save: SAVE, rossi }, '?cpmtest=1', errs);
    if (await entraInCarriera(page, errs)) { Object.assign(R, await proveLogica(page, rossoPerCodice)); R.B12 = await provaB12(page, rossoPerCodice); R.D17 = await provaD17(page, rossoPerCodice); }
    await ctx.close(); }
  console.log(`\n── braccio ${nome}`); for (const [k, v] of Object.entries(R)) console.log(`  ${k.padEnd(5)} ${v.ok === true ? 'VERDE' : v.ok === false ? 'ROSSO' : 'NON GIUDICATO'}  ${JSON.stringify(v.dato).slice(0, 230)}`);
  return R; };

const A = await braccio('A · verde', [], false);
const B = await braccio('B · rosso per codice (__CPM_NO_G155_<codice>)', [], true);
const C = await braccio('C · rosso unico (__CPM_NO_G155)', ['__CPM_NO_G155'], false);
await b.close(); srv.close();

const CODICI = [...ORD, 'B12', 'D17', 'D21'];
const guasti = [];
if (!staticoOk) guasti.push('uso nel codice mancante: ' + JSON.stringify(statico));
for (const k of CODICI) {
  if (!A[k] || A[k].ok !== true) guasti.push(`${k}: verde non verde (${A[k] ? (A[k].ok === null ? 'non giudicato' : 'rosso') : 'assente'})`);
  if (!B[k] || B[k].ok !== false) guasti.push(`${k}: il rosso per codice non cade (${B[k] ? (B[k].ok === null ? 'non giudicato' : 'verde') : 'assente'})`);
  if (!C[k] || C[k].ok !== false) guasti.push(`${k}: il rosso unico non cade (${C[k] ? (C[k].ok === null ? 'non giudicato' : 'verde') : 'assente'})`);
}
if (errs.length) guasti.push('errori di pagina: ' + errs.slice(0, 3).join(' | '));
fs.mkdirSync(ROOT + 'tests/visual/out', { recursive: true });
fs.writeFileSync(ROOT + 'tests/visual/out/bassi-155.json', JSON.stringify({ statico, A, B, C, guasti }, null, 1));
const riga = (R) => CODICI.map(k => `${k}:${R[k] ? (R[k].ok === true ? 'V' : R[k].ok === false ? 'R' : '?') : '-'}`).join(' ');
console.log('\n════ bassi-155 ════');
console.log('uso nel codice:', staticoOk ? 'ok' : 'MANCANTE');
console.log('VERDE (A)        ', riga(A));
console.log('ROSSO per codice ', riga(B));
console.log('ROSSO unico      ', riga(C));
if (guasti.length) { console.log('\n❌ BASSI-155 ROSSO —\n  ' + guasti.join('\n  ')); process.exit(1); }
console.log(`\n✅ BASSI-155 VERDE — ${CODICI.length} correzioni: verdi accese, ciascuna cade col suo interruttore e con __CPM_NO_G155`);
