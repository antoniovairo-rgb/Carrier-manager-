#!/usr/bin/env node
/* [PO-154 · giro 66, decisione PO 16/10 «Memoria + seguiti + contesto»] GUARDIANO: LE SCELTE DELLA SETTIMANA SI RICORDANO,
 * HANNO UN SEGUITO E DIPENDONO DAL CONTESTO.
 *
 * A) CONTESTO (catalogo vero, __CPM_IMPULSES, contro 8 profili sintetici dalla Primavera al veterano): quante voci non hanno
 *    condizione (solo le universali dichiarate), quante sono idonee per TUTTI i profili («universali di fatto»), e il pool
 *    idoneo per profilo (non deve svuotarsi: l'impulso e' il battito garantito della settimana, 7.35.0).
 * B) SEGUITI (segOk154, la regola del pescaggio): per ogni seguito, origine scelta con la scelta giusta a meta' finestra → pronto;
 *    scelta sbagliata, fuori finestra, gia' seguito → non pronto.
 * C) FLUSSO VERO (handler __CPM_CAREER, salvataggio in localStorage): si apre il pop-up vero di «wi_ospedale», si clicca
 *    «Ci vado con i regali», si controlla che la memoria sia scritta; poi si vivono fino a 12 settimane e il seguito
 *    «wi_seg_ospedale_lettera» deve uscire nella sua finestra (4-14 settimane).
 * Verde: A senza-condizione = universali dichiarate, universali di fatto <= 12, pool minimo >= 12; B tutto coerente; C memoria
 *        scritta e seguito uscito.
 * Prova del rosso: CPM_ROSSO=1 arma __CPM_NO154 e __CPM_NO154C → memoria, seguiti e contesto spenti: il guardiano DEVE uscire 1.
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node impulsi-memoria-154.mjs   (CPM_JSON=1 stampa i numeri grezzi)
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const guasti = []; const righe = [];
const ok = (c, m) => { righe.push((c ? '✓ ' : '✗ ') + m); if (!c) guasti.push(m); };

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const baseSave = (name, extra) => ({ phase: 'career', player: { name, nation: 'Italia', avatarId: 0, proStatus: 'pro',
  season: 3, week: 6, weekLived: false, age: 22, ovr: 72, tutorialDone: true, club: CLUB, popularity: 45,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 }, yellAccum: 0, seasonCards: { y: 0, r: 0 },
  matches: 0, totalMatches: 40, goals: 0, totalGoals: 0, matchHistory: [], bankBalance: 80000, ...extra } });

async function apri(save) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) { window.__CPM_NO154 = true; window.__CPM_NO154C = true; }
    localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save, rosso: ROSSO });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  for (let i = 0; i < 12; i++) {
    const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length);
    if (!n) break;
    await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300);
  }
  return { ctx, page, errori };
}

const { ctx, page, errori } = await apri(baseSave('Collaudo Impulsi', {}));

// ---------------- A + B) catalogo e regola dei seguiti, sulla pagina (stesse funzioni del gioco)
const AB = await page.evaluate(() => {
  const L = window.__CPM_IMPULSES || [];
  const cal = (w, home) => [{ week: w, played: false, isHome: home, opponentId: 'x', opponentName: 'FC X' }];
  const win = { won: true, drew: false, rating: 7 }, loss = { won: false, drew: false, rating: 5.9 };
  const P = {
    primavera_s1: { proStatus: 'u18', season: 1, week: 4, age: 17, ovr: 62, popularity: 10, form: 66, morale: 70, fatigue: 20, coachTrust: 60, squadRole: 'primavera', bankBalance: 800, matchHistory: [loss], calendar: cal(4, true), history: [] },
    primavera_s2: { proStatus: 'u18', season: 2, week: 20, age: 18, ovr: 67, popularity: 24, form: 74, morale: 74, fatigue: 45, coachTrust: 66, squadRole: 'titolare', bankBalance: 4000, matchHistory: [win, win], calendar: cal(21, false), history: [{ clubId: 'b04' }] },
    pro_giovane_riserva: { proStatus: 'pro', season: 3, week: 10, age: 20, ovr: 68, popularity: 30, form: 64, morale: 58, fatigue: 30, coachTrust: 52, squadRole: 'riserva', bankBalance: 22000, matchHistory: [loss, loss, win], calendar: cal(10, false), history: [{ clubId: 'b04' }, { clubId: 'b04' }], totalMatches: 12 },
    pro_titolare: { proStatus: 'pro', season: 5, week: 18, age: 24, ovr: 76, popularity: 52, form: 80, morale: 78, fatigue: 50, coachTrust: 72, squadRole: 'titolare', bankBalance: 150000, matchHistory: [win, win, win], calendar: [], history: [{ clubId: 'zzz' }, { clubId: 'b04' }], totalMatches: 90 },
    pro_leader_ricco: { proStatus: 'pro', season: 9, week: 30, age: 28, ovr: 84, popularity: 78, form: 82, morale: 80, fatigue: 62, coachTrust: 85, squadRole: 'leader', bankBalance: 900000, matchHistory: [win, loss, win], calendar: cal(30, true), history: [{ clubId: 'zzz' }, { clubId: 'b04' }, { clubId: 'b04' }], totalMatches: 260, isCaptain: true },
    veterano_crisi: { proStatus: 'pro', season: 14, week: 26, age: 33, ovr: 74, popularity: 60, form: 60, morale: 55, fatigue: 70, coachTrust: 50, squadRole: 'rotazione', bankBalance: 300000, matchHistory: [loss, loss, loss], calendar: cal(26, false), history: [{ clubId: 'zzz' }, { clubId: 'b04' }], totalMatches: 380, teamChemistry: 50 },
    svincolato: { proStatus: 'pro', season: 6, week: 12, age: 26, ovr: 70, popularity: 35, form: 62, morale: 50, fatigue: 5, coachTrust: 40, squadRole: 'riserva', bankBalance: 25000, matchHistory: [], calendar: [], history: [{ clubId: 'zzz' }], totalMatches: 100, contractExpired: true },
    pro_sosta: { proStatus: 'pro', season: 4, week: 33, age: 23, ovr: 73, popularity: 40, form: 72, morale: 70, fatigue: 25, coachTrust: 66, squadRole: 'rotazione', bankBalance: 60000, matchHistory: [win], calendar: [], history: [{ clubId: 'b04' }], totalMatches: 60 },
  };
  for (const k in P) P[k] = { club: { id: 'b04', n: 'FC Werkstadt', lg: 'Deutsche Liga' }, teamChemistry: P[k].teamChemistry || 62, ...P[k] };
  const idoneo = (im, p) => { try { return !im.cond || !!im.cond(p); } catch (e) { return false; } };
  const base = L.filter(im => !im.seg);
  const senzaCond = base.filter(im => !im.cond).map(im => im.id);
  const sempre = base.filter(im => Object.values(P).every(p => idoneo(im, p))).map(im => im.id);
  const pool = {}; for (const k in P) pool[k] = base.filter(im => idoneo(im, P[k])).length;
  // B) seguiti
  const segs = L.filter(im => im.seg);
  const B = [];
  const now = (p) => ((p.season || 1) - 1) * 38 + (p.week || 1);
  for (const sg of segs) {
    const s = sg.seg; const p0 = { ...P.pro_titolare, calendar: s.ctx && /gara154/.test(String(s.ctx)) ? [{ week: 18, played: false }] : [] };
    if (s.ctx && !s.ctx(p0)) { B.push({ id: sg.id, saltato: 'contesto' }); continue; }
    const mid = Math.round(((s.min || 3) + (s.max || 20)) / 2);
    const c = Array.isArray(s.c) ? s.c[0] : s.c;
    const mem = (cc, d, extra) => ({ ...p0, impMem: { [s.da]: { c: cc, a: now(p0) - d }, ...(extra || {}) } });
    const r = {
      id: sg.id, da: s.da,
      pronto: idoneo(sg, mem(c, mid)),
      sceltaSbagliata: idoneo(sg, mem(c === 0 ? 1 : 0, mid)),
      senzaRisposta: idoneo(sg, mem(-1, mid)),
      troppoPresto: idoneo(sg, mem(c, (s.min || 3) - 1)),
      troppoTardi: idoneo(sg, mem(c, (s.max || 20) + 1)),
      giaSeguito: idoneo(sg, mem(c, mid, { [sg.id]: { c: 0, a: now(p0) - 1 } })),
      senzaMemoria: idoneo(sg, { ...p0 }),
      origineEsiste: L.some(x => x.id === s.da),
    };
    B.push(r);
  }
  const catene = segs.filter(sg => segs.some(x => x.id === sg.seg.da)).map(sg => sg.seg.da + '→' + sg.id);
  return { totale: L.length, base: base.length, nSeg: segs.length, senzaCond, sempre, pool, B, catene,
    universali: (typeof IMP_UNIVERSALI154 !== 'undefined') ? IMP_UNIVERSALI154 : null };
});

console.log(`catalogo: ${AB.totale} voci (${AB.base} impulsi + ${AB.nSeg} seguiti) · catene di secondo livello: ${AB.catene.join(', ') || 'nessuna'}`);
console.log(`senza condizione: ${AB.senzaCond.length} (${AB.senzaCond.join(', ')}) · universali dichiarate: ${JSON.stringify(AB.universali)}`);
console.log(`idonee per tutti gli 8 profili («universali di fatto»): ${AB.sempre.length} (${AB.sempre.join(', ')})`);
console.log('pool idoneo per profilo: ' + Object.entries(AB.pool).map(([k, v]) => `${k} ${v}`).join(' · '));
const univ = AB.universali || [];
ok(AB.senzaCond.every(id => univ.includes(id)) && AB.senzaCond.length <= Math.max(1, univ.length), `voci senza condizione = universali dichiarate (${AB.senzaCond.length})`);
ok(AB.sempre.length <= 12, `universali di fatto <= 12 (${AB.sempre.length})`);
const poolMin = Math.min(...Object.values(AB.pool));
ok(poolMin >= 12, `pool minimo per profilo >= 12 (${poolMin})`);
ok(AB.nSeg >= 20, `almeno 20 seguiti nel catalogo (${AB.nSeg})`);
ok(AB.catene.length >= 2, `almeno 2 catene di secondo livello (${AB.catene.length})`);
const Bg = AB.B.filter(r => !r.saltato);
const Bbad = Bg.filter(r => !r.origineEsiste || !r.pronto || r.sceltaSbagliata || r.senzaRisposta || r.troppoPresto || r.troppoTardi || r.giaSeguito || r.senzaMemoria);
ok(Bg.length >= 15, `seguiti giudicati sulla regola: ${Bg.length} (saltati per contesto: ${AB.B.length - Bg.length})`);
ok(Bbad.length === 0, `regola dei seguiti coerente su ${Bg.length} (incoerenti: ${Bbad.map(r => r.id).join(', ') || 'nessuno'})`);

// ---------------- C) flusso vero
const snap = () => page.evaluate(() => window.__CPM_CAREER.snapshot());
await page.evaluate(() => window.__CPM_CAREER.apriImpulso('wi_ospedale')); await sleep(600);
const clic = await page.evaluate((t) => { const b = [...document.querySelectorAll('button')].filter(x => (x.textContent || '').includes(t));
  if (!b.length) return false; b[b.length - 1].click(); return true; }, 'Ci vado con i regali');
await sleep(900); await page.evaluate(() => window.__CPM_CAREER.dismiss());
const s1 = await snap();
const mem = (s1.impMem || {}).wi_ospedale || null;
ok(clic, 'pop-up vero di wi_ospedale aperto e scelta cliccata');
ok(!!mem && mem.c === 0, `memoria scritta alla scelta: ${JSON.stringify(mem)}`);
const usciti = []; let uscito = null;
for (let k = 1; k <= 12 && !uscito; k++) {
  await page.evaluate((k) => window.__CPM_CAREER.patch({ week: 6 + k, weekLived: false, injured: false }), k); await sleep(250);
  const r = await page.evaluate(() => window.__CPM_CAREER.step()); await sleep(500);
  const s = await snap(); const last = (s.recentImpulses || []).slice(-1)[0] || null;
  usciti.push(`W${6 + k}:${r}:${last}`);
  if (last === 'wi_seg_ospedale_lettera') uscito = { settimane: k, mem: (s.impMem || {}).wi_seg_ospedale_lettera };
  await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(200);
}
console.log('settimane vissute: ' + usciti.join(' · '));
ok(!!uscito, `il seguito «wi_seg_ospedale_lettera» esce nella sua finestra: ${uscito ? 'dopo ' + uscito.settimane + ' settimane' : 'mai in 12 settimane'}`);
ok(errori.length === 0, `nessun errore di pagina (${errori.length}${errori.length ? ': ' + errori[0] : ''})`);
await ctx.close(); await browser.close(); srv.close();

if (process.env.CPM_JSON) console.log(JSON.stringify(AB, null, 1));
console.log(righe.join('\n'));
console.log(guasti.length ? `\n❌ FAIL impulsi-memoria-154${ROSSO ? ' (braccio rosso: atteso)' : ''} — ${guasti.length} guasti` : `\n✅ PASS impulsi-memoria-154${ROSSO ? ' — ATTENZIONE: il braccio rosso dovrebbe fallire' : ''}`);
process.exit(guasti.length ? 1 : 0);
