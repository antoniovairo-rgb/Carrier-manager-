// COLLAUDO L6 fase 1-bis (giro 49) — banco corretto come da PROPOSTA-L6 §7 passo 0. SOLO MISURA: il gioco non si tocca.
// Differenze dal banco di fase 1 (career-run.mjs):
//  1) il rinnovo del contratto si ACCETTA quando il gioco lo offre: pulsante vero «Negozia rinnovo» (tab Agente, stessa guardia
//     del gioco: ultimo anno, entro W35, non svincolato/in prestito, non gia' rinnovato; da svincolato la card della Home) →
//     «Accetta l'offerta del club». Se il club rifiuta («Il club non intende rinnovare») si registra. Nessun dismiss() sulle
//     schermate di rinnovo o di offerta: l'offerta di trasferimento si legge e si risponde coi bottoni veri (Accetta solo da
//     svincolato o dopo un rifiuto di rinnovo nella stagione, altrimenti Rifiuta col suo handler).
//  2) solo gli 8 archetipi veri (ARCHETYPES), statistiche dalla creazione (baseStats dentro la pagina, Math.random seedato) poi
//     traslate perche' calcOvr = OVR del livello; archetipo/ruolo/livello da tre permutazioni indipendenti.
//  3) --mode=u18: creazione normale (Nuova carriera → provini giocati in autoplay → offerte → carriera U18).
//  4) --natlive: le amichevoli della Nazionale si GIOCANO (playMatch → schermata nationalCallup → «Gioca la partita» → autoplay).
//  5) --arm=<voce>: gemelli economici dell'Ufficio (click sui bottoni veri del tab Ufficio).
//  6) minuti/titolarita': per ogni gara di club la decisione del mister calcCoachDecision (stessa funzione del prompt partita).
// Math.random della pagina e' sostituito da un generatore seedato per carriera (riproducibilita' dei gemelli): e' una scelta del
// banco, dichiarata nel rapporto. Uso: node career-bis.mjs --mode=syn --ids=0,1 [--seasons=10] [--natlive] [--arm=nessuna] [--tag=x]
import fs from 'fs';
import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from '../lib/harness.mjs';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const MODE = args.mode || 'syn';
const IDS = String(args.ids || '0').split(',').map(Number);
const SEASONS = Number(args.seasons || 10);
const NATLIVE = !!args.natlive;
const ARM = args.arm || null;
const TAG = args.tag || (MODE === 'u18' ? 'u18' : NATLIVE ? 'naz' : ARM ? 'gem' : 'syn');
const GAME = process.env.CPM_GAME || 'CM170.html';
const OUT = path.join(ROOT, 'docs', 'collaudi', 'dati-carriere-l6-bis');
const DBG = !!process.env.CPM_DBG;
fs.mkdirSync(OUT, { recursive: true });

const NATS = ['Italia', 'Spagna', 'Francia', 'Germania', 'Inghilterra', 'Portogallo', 'Brasile', 'Argentina', 'Olanda', 'Belgio'];
const ARCH8 = ['bomber', 'fantasista', 'velocista', 'trequartista', 'leader', 'centravanti', 'enfant', 'tuttocampista'];
const ROLES = ['Attaccante', 'Centrocampista', 'Difensore', 'Portiere'];
const TIERS = [
  { tag: 'debole', ovr: 60, club: { id: 'nub', n: 'FC Nürnberg', a: 'FCN', p: 48, c: '#dc2626', c2: '#f5f5f5', nat: '🇩🇪', lg: 'Deutsche Liga 2' } },
  { tag: 'media', ovr: 68, club: { id: 'gor', n: 'FC Deventer', a: 'DEV', p: 60, c: '#f59e0b', c2: '#dc2626', nat: '🇳🇱', lg: 'Liga Oranje' } },
  { tag: 'forte', ovr: 76, club: { id: 'juve', n: 'Torino Athletic', a: 'TAT', p: 95, c: '#f5f5f5', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Lega A' } },
];
// tre permutazioni indipendenti (seed diversi) di liste bilanciate su 30 posti
const lcg = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
const shuffled = (arr, seed) => { const r = lcg(seed), a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const N = 30;
const P_ARCH = shuffled(Array.from({ length: N }, (_, i) => ARCH8[i % 8]), 4901);
const P_ROLE = shuffled(Array.from({ length: N }, (_, i) => ROLES[i % 4]), 4902);
const P_TIER = shuffled(Array.from({ length: N }, (_, i) => i % 3), 4903);
const pad = n => String(n).padStart(2, '0');
const cfgOf = k => {
  if (MODE === 'u18') return { k, mode: 'u18', nation: NATS[k % 10], archetype: ARCH8[k % 8], role: 'Attaccante (creazione)', natlive: NATLIVE, arm: ARM };
  const kk = k % N, t = TIERS[P_TIER[kk]];
  return { k, mode: 'syn', nation: NATS[k % 10], archetype: P_ARCH[kk], role: P_ROLE[kk], tier: t.tag, ovr: t.ovr, club: t.club, age: 17 + (k % 8), natlive: NATLIVE, arm: ARM };
};

// generatore seedato iniettato prima del gioco (Math.random della pagina)
const SEED_SCRIPT = (seed) => { let s = (seed >>> 0) || 1; Math.random = function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

async function prepSaves(browser, port, cfgs) {
  // statistiche della creazione: baseStats(arc) del gioco, Math.random seedato per carriera, poi traslazione all'OVR del livello
  const page = await browser.newPage(); await installCdnRoutes(page);
  await page.goto(`http://localhost:${port}/${GAME}?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => typeof baseStats === 'function' && typeof ARCHETYPES !== 'undefined', null, { timeout: 60000 }).catch(() => {});
  const res = await page.evaluate((cs) => cs.map(c => {
    let s = (9000 + c.k * 7919) >>> 0; const orig = Math.random; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const arc = ARCHETYPES.find(a => a.id === c.archetype); const st0 = baseStats(arc); Math.random = orig;
    let best = null; for (let d = -40; d <= 40; d++) { const st = {}; Object.keys(st0).forEach(k => st[k] = Math.max(1, Math.min(99, st0[k] + d))); const o = calcOvr(st); if (!best || Math.abs(o - c.ovr) < Math.abs(best.o - c.ovr)) best = { d, o, st }; }
    return { k: c.k, arc: JSON.parse(JSON.stringify(arc)), st0, stats: best.st, ovr: best.o, shift: best.d };
  }), cfgs.filter(c => c.mode === 'syn'));
  await page.close();
  return Object.fromEntries(res.map(r => [r.k, r]));
}

function saveFor(c, prep) {
  const p = prep[c.k];
  const base = { name: `Collaudo Bis ${pad(c.k)}`, nation: c.nation, avatarId: 0, proStatus: 'pro', season: 1, week: 1, age: c.age, ovr: p.ovr, tutorialDone: true, archetype: p.arc, position: c.role, foot: 'R',
    club: c.club, stats: p.stats, form: 70, morale: 72, fatigue: 10, coachTrust: 60, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } };
  if (c.bank != null) base.bankBalance = c.bank;
  return { phase: 'career', player: base };
}

const LITE = () => { const C = window.__CPM_CAREER; const p = C.snapshot(); let md = null; try { md = C.thisWeekMd(); } catch (e) {}
  return { s: p.season, w: p.week, lived: !!p.weekLived, ovr: p.ovr, bb: p.bankBalance || 0, pro: p.proStatus, dur: p.contract ? p.contract.duration : null, wage: p.contract ? p.contract.wage : null,
    exp: !!p.contractExpired, ren: p.renewalSeason || 0, loan: !!p.loan, inj: !!p.injured, nat: p.nationalCaps || 0, trust: p.coachTrust, md, scr: C.screen(), club: p.club ? p.club.id : null,
    imp: (p.recentImpulses || []).slice(-1)[0] || null, morale: p.morale, fatigue: p.fatigue, pop: p.popularity, form: p.form, role: p.squadRole || null }; };

// click sul bottone visibile piu' interno il cui testo combacia (lezione 7.491: mai il contenitore)
const clickRx = (page, rx, scope) => page.evaluate(([s, sc]) => {
  const r = new RegExp(s, 'i'); const root = sc ? document.querySelector(sc) : document; if (!root) return null;
  const bs = [...root.querySelectorAll('button,[role=button]')].filter(b => b.offsetParent && r.test((b.textContent || '').trim()));
  const el = bs[bs.length - 1]; if (el) { el.click(); return (el.textContent || '').trim().slice(0, 50); } return null;
}, [rx, scope || null]);
const hasText = (page, rx) => page.evaluate(s => new RegExp(s, 'i').test(document.body.innerText || ''), rx);

async function runCareer(browser, port, c, prep) {
  const t0 = Date.now();
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  const seed = 49000 + c.k * 131 + (ARM ? 0 : 0);
  await page.addInitScript(SEED_SCRIPT, seed);
  if (c.mode === 'syn') {
    const saveJson = JSON.stringify(saveFor(c, prep));
    await page.addInitScript((s) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; window.__CPM_CALLUP = []; try { if (!sessionStorage.getItem('bis-loaded')) { localStorage.setItem('cpm-v3', s); sessionStorage.setItem('bis-loaded', '1'); } localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, saveJson);
  } else {
    await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; window.__CPM_CALLUP = []; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
  }
  await page.goto(`http://localhost:${port}/${GAME}?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  const creation = c.mode === 'u18' ? await createU18(page, c) : null;
  if (c.mode === 'syn') { try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {} }
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 });
  await sleep(800);
  const version = await page.evaluate(() => GAME_VERSION);
  const catalog = await page.evaluate(() => WEEKLY_IMPULSES.map(im => ({ id: im.id, cond: !!im.cond })));
  const start = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { ovr: p.ovr, stats: p.stats, archetype: p.archetype && (p.archetype.id || p.archetype), position: p.position, age: p.age, club: p.club ? { id: p.club.id, n: p.club.n, p: p.club.p, lg: p.club.lg } : null, proStatus: p.proStatus, contract: p.contract || null, bank: p.bankBalance || 0 }; });

  const seasons = [], screens = {}, impEvents = [], offers = [], renewals = [], natLive = [], ufficio = [], decisions = [], proTrans = [], clubPres = [];
  let seasonsDone = 0, iter = 0, stuck = 0, prev = null, endReason = 'ok', errStep = null, lastImp = null, startSnap = null;
  let renewTriedWk = -99, renewRefusedSeason = -1, weekly = [];
  const deadline = Date.now() + Number(process.env.CPM_MAXMIN || 60) * 60000;
  while (seasonsDone < SEASONS && iter++ < 3000) {
    if (Date.now() > deadline) { endReason = 'tempo'; break; }
    let L = await page.evaluate(LITE);
    if (L.scr === 'proTransition') {
      const summary = await page.evaluate(SEASON_PICK); summary.viaProTransition = true; summary.weekly = weekly; weekly = []; summary.endBankBalance = L.bb; summary.startBankBalance = startSnap ? startSnap.bb : null;
      summary.callup = await page.evaluate(() => { const w = window.__CPM_CALLUP || []; const r = w.slice(); w.length = 0; return r; });
      seasons.push(summary); seasonsDone++; startSnap = null;
      proTrans.push(await handleProTransition(page, L)); await sleep(600); continue; }
    if (L.scr === 'careerEnd') { endReason = 'careerEnd'; break; }
    if (L.scr === 'clubPresentation') { const cp = await clickRx(page, '^(Continua|Avanti|Inizia|Entra|Prosegui|Vai)'); if (!cp) await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); clubPres.push({ s: L.s, w: L.w, click: cp }); await sleep(400); continue; }
    // --- Ufficio: gemelli (una volta per stagione, alla prima settimana pro vissuta) ---
    if (ARM && L.pro === 'pro' && L.lived && !ufficio.find(u => u.s === L.s)) ufficio.push({ s: L.s, w: L.w, ...(await applyArm(page, ARM, L)) });
    // --- rinnovo: si accetta quando il gioco lo offre ---
    const gkey = L.s * 100 + L.w;
    const window1 = L.pro === 'pro' && !L.loan && !L.exp && L.dur != null && L.dur <= 1 && L.w <= 35 && L.ren !== L.s;
    const window2 = L.pro === 'pro' && !L.loan && L.exp;
    if ((window1 || window2) && gkey - renewTriedWk >= 4 && L.scr === 'dashboard') {
      renewTriedWk = gkey;
      const r = await tryRenewal(page, window2);
      renewals.push({ s: L.s, w: L.w, ovr: L.ovr, trust: L.trust, role: L.role, dur: L.dur, exp: L.exp, ...r });
      if (r.esito === 'rifiutato') renewRefusedSeason = L.s;
      continue;
    }
    // --- Nazionale giocata ---
    if (NATLIVE && L.lived && L.md && L.md.type === 'national' && !L.inj && L.scr === 'dashboard') {
      natLive.push(await playNationalLive(page, L)); await sleep(500); continue;
    }
    // --- titolarita': la decisione del mister per la gara di club della settimana ---
    if (L.lived && L.md && L.md.type !== 'national' && L.scr === 'dashboard') {
      const d = await page.evaluate(() => { try { const p = window.__CPM_CAREER.snapshot(); const md = window.__CPM_CAREER.thisWeekMd(); const lg = !md.type || md.type === 'league';
        const cal = (p.calendar || []).find(m => m.week === p.week && !m.played) || {};
        const cd = lg ? calcCoachDecision(p, calcMatchWeight(p, cal.opponentId, p.standings || [], p.week || 1)) : null;
        return { s: p.season, w: p.week, type: md.type || 'league', st: cd ? cd.status : null, em: cd ? (cd.entryMinute ?? null) : null, role: p.squadRole || null, exp: !!p.contractExpired, inj: !!p.injured }; } catch (e) { return { err: String(e.message).slice(0, 80) }; } });
      if (!decisions.find(x => x.s === d.s && x.w === d.w)) decisions.push(d);
    }
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); return { res, scr: C.screen() }; });
    const { res, scr } = r;
    await sleep(60);
    // offerta di trasferimento: si legge e si risponde coi bottoni veri (mai dismiss cieco)
    const off = await handleOffer(page, renewRefusedSeason);
    if (off) offers.push(off);
    await handleSideModals(page);
    // pop-up della settimana / prompt partita: come in fase 1 (dismiss), per confrontabilita' sugli impulsi
    await page.evaluate(() => { const C = window.__CPM_CAREER; if (!document.querySelector('[data-cpm="offerta23"]') && !/Negoziazione Contratto/.test(document.body.innerText)) C.dismiss(); });
    L = await page.evaluate(LITE);
    screens[scr] = (screens[scr] || 0) + 1;
    if (!startSnap) startSnap = L;
    weekly.push([L.s, L.w, L.ovr, L.morale, L.fatigue, L.inj ? 1 : 0, L.pop, L.trust, L.bb, L.exp ? 1 : 0, L.role]);
    if (res && String(res).startsWith('error:')) { endReason = 'error'; errStep = res; break; }
    if (res === 'seasonEnd') {
      const summary = await page.evaluate(SEASON_PICK);
      summary.startBankBalance = startSnap ? startSnap.bb : null; summary.endBankBalance = L.bb;
      summary.weekly = weekly; weekly = [];
      summary.callup = await page.evaluate(() => { const w = window.__CPM_CALLUP || []; const r = w.slice(); w.length = 0; return r; });
      seasons.push(summary); seasonsDone++;
      if (DBG) console.log(`  S${summary.season} ovr ${summary.ovr} gol ${summary.mh.reduce((a, m) => a + (m.g || 0), 0)} dur ${summary.contract && summary.contract.duration} exp ${summary.contractExpired} club ${summary.club.id} bank ${summary.bankBalance}`);
      if (seasonsDone >= SEASONS) break;
      const ok = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
      if (ok !== true) { endReason = 'startNewSeason:' + ok; break; }
      await page.evaluate(() => window.__CPM_CAREER.dismiss());
      startSnap = null; prev = null; lastImp = null; await sleep(500); continue;
    }
    if (res && String(res).startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
    if (L.imp && L.imp !== lastImp) impEvents.push({ s: L.s, w: L.w, id: L.imp });
    lastImp = L.imp;
    const key = `${L.s}/${L.w}/${L.lived}/${L.scr}`;
    if (prev === key) { stuck++; if (stuck > 25) { endReason = `blocco S${L.s}W${L.w} res=${res} scr=${L.scr}`; break; } } else stuck = 0;
    prev = key;
  }
  const out = {
    collaudo: 'L6 fase 1-bis · giro 49 · PROPOSTA-L6 §7 passo 0', version, game: GAME, cfg: c, seed, prep: prep && prep[c.k] ? { st0: prep[c.k].st0, shift: prep[c.k].shift } : null, creation, start,
    chromium: 'CPM_CHROME=/opt/pw-browsers/chromium', seasonsDone, iter, endReason, errStep, durationMs: Date.now() - t0, pageerrors: errors,
    catalogImpulses: catalog.length, catalog, screens, impEvents, offers, renewals, natLive, ufficio, decisions, proTrans, clubPres, seasons,
  };
  const fn = `${TAG}-${pad(c.k)}${ARM ? '-' + ARM : ''}.json`;
  fs.writeFileSync(path.join(OUT, fn), JSON.stringify(out));
  console.log(`${fn} [${c.tier || c.mode}, ${c.role}, ${c.archetype}, ${c.nation}] stagioni ${seasonsDone}/${SEASONS} · ${endReason} · ${Math.round((Date.now() - t0) / 1000)}s · pageerrors ${errors.length} · rinnovi ${renewals.filter(r => r.esito === 'accettato').length}/${renewals.length} · offerte ${offers.length} · naz live ${natLive.length}`);
  await page.close();
}

async function tryRenewal(page, expired) {
  const r = { via: expired ? 'home-svincolato' : 'tab-agente' };
  await page.evaluate(t => window.__CPM_CAREER.goTab(t), expired ? 'dashboard' : 'agente'); await sleep(450);
  const b = await clickRx(page, 'Negozia rinnovo');
  if (!b) { r.esito = 'cta-assente'; await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(250); return r; }
  await sleep(450);
  if (await hasText(page, 'Il club non intende rinnovare')) { r.esito = 'rifiutato'; await clickRx(page, '^Ho capito'); }
  else if (await clickRx(page, "Accetta l.offerta del club")) {
    await sleep(400);
    const c = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { dur: p.contract && p.contract.duration, wage: p.contract && p.contract.wage, exp: !!p.contractExpired, ren: p.renewalSeason }; });
    r.esito = (c.ren != null && !c.exp) ? 'accettato' : 'accettato?'; r.contratto = c;
  } else { r.esito = 'modale-sconosciuto'; r.testo = (await page.evaluate(() => document.body.innerText.slice(0, 300))); }
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(250);
  return r;
}

async function handleOffer(page, refusedSeason) {
  const has = await page.evaluate(() => !!document.querySelector('[data-cpm="offerta23"]'));
  if (!has) return null;
  const info = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const el = document.querySelector('[data-cpm="offerta23"]'); return { s: p.season, w: p.week, exp: !!p.contractExpired, ovr: p.ovr, club: p.club && p.club.id, clubP: p.club && p.club.p, txt: (el.closest('div[role=dialog]') || el.parentElement || el).innerText.replace(/\s+/g, ' ').slice(0, 260) }; });
  const accept = info.exp || refusedSeason === info.s;
  const clicked = await clickRx(page, accept ? '^Accetta$' : '^Rifiuta$');
  await sleep(500);
  const after = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { club: p.club && p.club.id, clubP: p.club && p.club.p, lg: p.club && p.club.lg, exp: !!p.contractExpired, dur: p.contract && p.contract.duration, wage: p.contract && p.contract.wage, loan: !!p.loan }; });
  return { ...info, decisione: accept ? 'accetta' : 'rifiuta', clicked, after };
}

async function handleSideModals(page) {
  // scena del rifiuto (refuseEvent) e altre chiusure obbligate; non tocca offerta/rinnovo
  for (let i = 0; i < 3; i++) { const c = await clickRx(page, '^(Resto qui →|Avanti →)$'); if (!c) break; await sleep(250); }
}

async function applyArm(page, arm, L) {
  await page.evaluate(() => window.__CPM_CAREER.goTab('ufficio')); await sleep(500);
  const did = [];
  const clickSel = async (sel) => page.evaluate(s => { const el = document.querySelector(s); if (el) { el.click(); return true; } return false; }, sel);
  const staffUp = async (k) => { for (let i = 0; i < 4; i++) { const lv = await page.evaluate(k => { const el = document.querySelector(`[data-cpm="staff24-${k}"]`); return el ? +el.getAttribute('data-lv') : -1; }, k); if (lv < 0 || lv >= 3) return lv;
    await page.evaluate(k => { const el = document.querySelector(`[data-cpm="staff24-${k}"]`); const b = [...el.querySelectorAll('button')].find(x => /\+/.test(x.textContent)); if (b) b.click(); }, k); await sleep(200); } return -2; };
  if (arm.startsWith('staff-')) { const ks = arm === 'staff-tutti' ? ['perkTrainer', 'perkNutrition', 'perkFisio', 'perkMental'] : [{ 'staff-trainer': 'perkTrainer', 'staff-nutri': 'perkNutrition', 'staff-fisio': 'perkFisio', 'staff-mental': 'perkMental' }[arm]];
    for (const k of ks) did.push(k + ':lv' + await staffUp(k)); }
  if (arm.startsWith('invest-')) { const pr = arm.slice(7); did.push(pr + ':' + await clickSel(`[data-cpm="invest24-${pr}"]`)); }
  if (arm === 'beni') { for (const k of ['casa', 'auto', 'barca', 'fondazione']) { const ok = await clickSel(`[data-cpm="bene24-compra-${k}"]`); did.push(k + ':' + ok); await sleep(250); } }
  if (arm === 'accademia') did.push('fonda:' + await clickSel('[data-cpm="accademia24-fonda"]'));
  await sleep(300);
  const st = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { bank: p.bankBalance, perk: { t: p.perkTrainer, tl: p.perkTrainerLv, n: p.perkNutrition, nl: p.perkNutritionLv, f: p.perkFisio, fl: p.perkFisioLv, m: p.perkMental, ml: p.perkMentalLv }, invest: p.invest24 || null, beni: p.beni24 || [], acc: p.academy24 ? { tot: p.academy24.tot, paused: !!p.academy24.paused } : null }; });
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(250);
  return { did, st };
}

async function playNationalLive(page, L) {
  const t0 = Date.now(); const r = { s: L.s, w: L.w, exp: L.exp, ovr: L.ovr, capsPrima: L.nat, opp: L.md && L.md.opp };
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await sleep(500);
  r.playMatch = pm; r.screen = await page.evaluate(() => window.__CPM_CAREER.screen());
  r.callupScreen = r.screen === 'nationalCallup';
  if (r.callupScreen) { r.callupTxt = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 240)); await clickRx(page, '^Gioca la partita'); await sleep(1500); }
  r.screen2 = await page.evaluate(() => window.__CPM_CAREER && window.__CPM_CAREER.screen());
  if (r.screen2 === 'match') {
    await page.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function', null, { timeout: 30000 }).catch(() => {});
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 4900 + L.s * 50 + L.w);
    const end = Date.now() + 420000;
    while (Date.now() < end) {
      const ph = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } });
      const sc = await page.evaluate(() => window.__CPM_CAREER ? window.__CPM_CAREER.screen() : null);
      if (sc && sc !== 'match') break;
      if (ph === 'ended' || ph == null) { await page.keyboard.press('Enter').catch(() => {}); await clickRx(page, '^(Continua|Avanti|Chiudi|Salta|Prosegui|OK|Torna|Fine)'); }
      await sleep(1200);
    }
    try { await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false)); } catch (e) {}
    for (let i = 0; i < 6; i++) { const c = await clickRx(page, '^(Continua|Avanti|Chiudi|Salta|Prosegui|OK|Torna alla carriera|Fine)'); if (!c) break; await sleep(500); }
  }
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); } catch (e) {} });
  const after = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const h = (p.matchHistory || []).slice(-1)[0] || null; return { caps: p.nationalCaps || 0, goals: p.nationalGoals || 0, last: h ? { ctx: h.context || h.ctx || null, g: h.goals, a: h.assists, r: h.rating, hs: h.homeScore, as: h.awayScore, sim: !!h.simulated, min: h.minutesPlayed ?? null } : null, scr: window.__CPM_CAREER.screen(), week: p.week, lived: !!p.weekLived }; });
  r.after = after; r.ms = Date.now() - t0;
  if (DBG) console.log('  NAZ', JSON.stringify({ s: r.s, w: r.w, call: r.callupScreen, s2: r.screen2, caps: after.caps, ms: r.ms }));
  return r;
}

async function handleProTransition(page, L) {
  const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 400));
  const c = await clickRx(page, '^(Firma|Accetta|Scegli|Firmo)');
  await sleep(800);
  const c2 = await clickRx(page, '^(Continua|Avanti|Inizia|Conferma)');
  return { s: L.s, w: L.w, txt: t.slice(0, 200), click: c, click2: c2 };
}

async function createU18(page, c) {
  const t0 = Date.now(); const info = { nome: `Bis U18 ${pad(c.k)}`, nation: c.nation, archetype: c.archetype };
  const clickT = async (rx, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { const ok = await clickRx(page, rx); if (ok) return ok; await sleep(300); } throw new Error('creazione: «' + rx + '» non trovato'); };
  await clickT('Nuova carriera'); await sleep(800);
  await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const st = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; st.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, info.nome);
  await page.evaluate(n => { const s = document.querySelector('select'); if (s) { const st = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set; st.call(s, n); s.dispatchEvent(new Event('change', { bubbles: true })); } }, c.nation);
  // archetipo: bottone con il nome dell'archetipo (label in ARCHETYPES)
  const lbl = await page.evaluate(id => { const a = ARCHETYPES.find(x => x.id === id); return a ? (a.name || a.label || a.n || '') : ''; }, c.archetype);
  info.archLabel = lbl;
  info.archClick = await page.evaluate(id => { const a = ARCHETYPES.find(x => x.id === id); if (!a) return null; const want = String(a.e || '') + String(a.name || '') + String(a.desc || '');
    const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').trim() === want.trim()); if (b) { b.click(); return want.slice(0, 40); } return null; }, c.archetype);
  await sleep(300);
  await clickT('INIZIA I PROVINI'); await sleep(500);
  info.provini = [];
  // provini: si giocano in autoplay, attraversando le schermate fino alle offerte / alla carriera
  const end = Date.now() + 20 * 60000; let lastPh = null, nMatch = 0;
  while (Date.now() < end) {
    if (await page.evaluate(() => !!window.__CPM_CAREER)) break;
    const ph = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } });
    if (ph && ph !== 'ended' && lastPh !== 'live') { await page.evaluate(s => { try { window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }); } catch (e) {} }, 7700 + c.k * 3 + nMatch); lastPh = 'live'; nMatch++; info.provini.push({ t: Math.round((Date.now() - t0) / 1000) }); }
    if (ph === 'ended' || ph == null) {
      if (ph === 'ended') { await page.keyboard.press('Enter').catch(() => {}); lastPh = 'ended'; }
      const cl = await clickRx(page, '^(⚡ )?Inizia il provino|Vai al Provino|Continua|Avanti|Chiudi|Salta|Prosegui|OK$|Firma|Scegli|Accetta');
      if (cl && DBG) console.log('  crea click', cl);
      // schermata offerte U18: si sceglie la prima offerta
      if (await hasText(page, 'offert')) { const o = await clickRx(page, '^(Firma|Scegli|Accetta)'); if (o) info.offerta = o; }
    }
    await sleep(1200);
  }
  info.ms = Date.now() - t0; info.partiteProvino = nMatch;
  return info;
}

// Riepilogo di fine stagione (sola lettura)
const SEASON_PICK = () => {
  const p = window.__CPM_CAREER.snapshot();
  const s = p.season;
  const mh = (p.matchHistory || []).filter(m => m.season === s);
  const st = (p.standings || []).map(r => ({ id: r.id || r.clubId, pts: r.pts, gf: r.gf, ga: r.ga, p: r.p || r.played }));
  let legacy = null; try { legacy = { score: calcLegacyScore(p), pat: legacyPatrimonio24(p) }; } catch (e) {}
  return {
    season: s, week: p.week, age: p.age, ovr: p.ovr, stats: p.stats, position: p.position, archetype: p.archetype && (p.archetype.id || p.archetype), proStatus: p.proStatus,
    club: { id: p.club && p.club.id, n: p.club && p.club.n, p: p.club && p.club.p, lg: p.club && p.club.lg },
    mh: mh.map(m => ({ w: m.week, hs: m.homeScore, as: m.awayScore, g: m.goals, a: m.assists, r: m.rating, won: !!m.won, drew: !!m.drew, sim: !!m.simulated, sv: !!m.svincolato, min: m.minutesPlayed ?? null, st: m.matchStatus ?? null, ctx: m.context || m.ctx || null, opp: m.opponent })),
    standingsRows: st, trophies: (p.trophies || []).length,
    nationalCaps: p.nationalCaps || 0, nationalGoals: p.nationalGoals || 0, natHistory: (p.natHistory || []).filter(h => h && h.season === s).map(h => ({ ...h })).slice(0, 20),
    bankBalance: p.bankBalance ?? null, impulseSeenN: Object.keys(p.impulseSeen || {}).length, recentImpulses: p.recentImpulses || [],
    morale: p.morale, popularity: p.popularity, form: p.form, coachTrust: p.coachTrust, fatigue: p.fatigue, squadRole: p.squadRole || null,
    contract: p.contract || null, contractExpired: !!p.contractExpired, renewalSeason: p.renewalSeason ?? null, loan: p.loan ? { type: p.loan.type, parent: p.loan.parentClubId } : null,
    transferSaga: p.transferSaga ? { s: p.transferSaga.season, club: p.transferSaga.club, delivered: !!p.transferSaga.delivered } : null,
    injuryHist: (p.injuryHistory || []).length, injured: !!p.injured,
    perk: { t: p.perkTrainer, tl: p.perkTrainerLv, n: p.perkNutrition, nl: p.perkNutritionLv, f: p.perkFisio, fl: p.perkFisioLv, m: p.perkMental, ml: p.perkMentalLv },
    invest24: p.invest24 || null, investHist24: p.investHist24 || [], beni24: p.beni24 || [], academy24: p.academy24 ? { tot: p.academy24.tot, paused: !!p.academy24.paused } : null, legacy,
    logTexts: (p.log || []).slice(0, 60).map(x => String((x && (x.txt || x.text || x.msg)) || x).slice(0, 100)),
  };
};

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const cfgs = IDS.map(cfgOf);
if (ARM) cfgs.forEach(c => { c.bank = Number(process.env.CPM_BANK || 2000000); });
const prep = MODE === 'syn' ? await prepSaves(browser, port, cfgs) : {};
const PAR = Number(args.par || 1);
const queue = cfgs.slice();
await Promise.all(Array.from({ length: PAR }, async () => { while (queue.length) { const c = queue.shift(); try { await runCareer(browser, port, c, prep); } catch (e) { console.log(`carriera ${pad(c.k)} ERRORE: ${String(e.message).slice(0, 300)}`); } } }));
await browser.close(); srv.close();
console.log('FINE');
