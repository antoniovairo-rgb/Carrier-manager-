#!/usr/bin/env node
/* [7.338.0] GUARDIANO del batch di collaudo PO:
   (A) TACCUINO DEL GIORNALISTA — mai più «di taglio»: l'ingombro VERTICALE del blocchetto deve restare quello di
       un oggetto piatto (≤6 cm) e non quello di una lama (12,8 cm misurati prima del fix), su ENTRAMBI i modelli
       (uomo actor-presenter · donna actor-journalist); e deve stare fuori dal busto.
   (B) RIFIUTO DI UN'OFFERTA — refuseEcho: fasce dal peso reale dell'offerta, voci con nomi VERI (mister/compagno),
       effetti solo dove la fascia lo prevede, determinismo; + `fanLegend` non si corrompe più (era il bug che
       faceva sparire il pannello della curva) e i save già rotti si bonificano al caricamento.
   (C) APPUNTI DI COLLAUDO nel live match — il tasto ⚠️ mette in PAUSA, apre il campo note col contesto già
       registrato, salva in locale e li ripropone nel Profilo.
   Uso: node collaudo338-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

/* ─────────── (A) il taccuino è PIATTO su entrambi i giornalisti ─────────── */
const MEN = { id: 'j_ferretti', name: 'Marco Ferretti', paper: 'Sprint Sportivo', icon: '📰', color: '#ef4444', type: 'critico' };
const WOMEN = { id: 'j_greco', name: 'Elena Greco', f: true, paper: 'Sport in Rete', icon: '🌐', color: '#8b5cf6', type: 'investigativa' };
const ivSave = (journo) => ({ phase: 'career', player: { name: 'Hand Probe', nation: 'Italia', avatarId: 7, proStatus: 'pro', season: 3, week: 10, weekLived: true, age: 23, ovr: 76, tutorialDone: true, campDone: true, jerseyNumSeason: 3, presidentModalSeason: 3, drawSeen: 3, squadRole: 'titolare', coachTrust: 80, journalists: [journo],
  goals: 6, assists: 2, matches: 9, matchHistory: [{ opponent: 'FC Test', rating: 7.2, goals: 1, assists: 0, won: true, drew: false, homeScore: 2, awayScore: 1 }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 75, morale: 70, fatigue: 10, contract: { duration: 3, wage: 8000, expiresAtSeason: 6 } } });

for (const [tag, journo] of [['uomo', MEN], ['donna', WOMEN]]) {
  const bctx = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' });
  const page = await bctx.newPage();
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push(`(A/${tag}) pageerror: ` + String(e.message).slice(0, 120)));
  await page.addInitScript((o) => { localStorage.setItem('cpm-v3', JSON.stringify(o)); }, ivSave(journo));
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1400);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300);
  await page.evaluate(() => window.__CPM_CAREER.forceInterview('draw'));
  await sleep(6000);
  const rig = await page.evaluate(() => window.__CPM_IVRIG || null);
  if (!rig || !rig.pad) { issues.push(`(A/${tag}) taccuino assente dalla sonda`); await bctx.close(); continue; }
  const hY = +(rig.pad.bb.max[1] - rig.pad.bb.min[1]).toFixed(3);
  const wide = Math.max(rig.pad.bb.max[0] - rig.pad.bb.min[0], rig.pad.bb.max[2] - rig.pad.bb.min[2]);
  const dSpine = Math.hypot(rig.pad.p[0] - rig.spine[0], rig.pad.p[2] - rig.spine[2]);
  console.log(`(A/${tag}) taccuino: altezza ${hY} · lato ${wide.toFixed(3)} · dal busto ${dSpine.toFixed(3)} · dalla mano ${rig.padFromHand}`);
  if (hY > 0.06) issues.push(`(A/${tag}) il taccuino è ancora di TAGLIO (ingombro verticale ${hY} > 0.06)`);
  if (wide < 0.09) issues.push(`(A/${tag}) il taccuino non mostra la faccia (lato max ${wide.toFixed(3)} < 0.09)`);
  if (rig.padFromHand > 0.13) issues.push(`(A/${tag}) taccuino staccato dalla mano (${rig.padFromHand}u)`);
  if (dSpine < 0.14) issues.push(`(A/${tag}) taccuino dentro il busto (${dSpine.toFixed(3)}u dall'asse)`);
  await bctx.close();
}

/* ─────────── (B) refuseEcho + fanLegend ─────────── */
{
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('(B) pageerror: ' + String(e.message).slice(0, 120)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => typeof window.refuseEcho === 'function' && typeof window.__CPM_MIGRATE === 'function', null, { timeout: 45000 });
  const r = await page.evaluate(() => {
    const base = { name: 'Eroe Probe', season: 4, week: 12, popularity: 40, coachTrust: 70, isCaptain: false,
      club: { id: 'sal', n: 'FC Salernum', p: 52, lg: 'Lega A' }, contract: { wage: 20000 },
      coach: { name: 'Mister Baldini', style: 'Bilanciato' },
      teammates: [{ name: 'Andrea Contini', archetype: 'capitano' }],
      journalists: [{ name: 'Marco Ferretti', paper: 'Sprint Sportivo' }], fanLegend: [{ clubId: 'sal', seasons: 3 }] };
    const off = (p, wage) => ({ club: { n: 'FC Corazzata', p }, wage });
    const big = window.refuseEcho(base, off(92, 70000));
    const mid = window.refuseEcho(base, off(60, 27000));
    const low = window.refuseEcho(base, off(53, 21000));
    const det = JSON.stringify(window.refuseEcho(base, off(92, 70000))) === JSON.stringify(big);
    /* heal della migration su un save col campo già corrotto (stringa, come lo lasciava il 7.307.0) */
    const heal = window.__CPM_MIGRATE({ name: 'X', proStatus: 'pro', season: 3, week: 5, ovr: 70, stats: {}, form: 70,
      club: { id: 'sal', n: 'FC Salernum', a: 'SAL', lg: 'Lega A', p: 52 }, fanLegend: '2', calendar: [], standings: [] });
    return { big: big && { tier: big.tier, nv: big.voices.length, who: big.voices.map(v => v.who), fx: big.fx, head: big.head },
      mid: mid && { tier: mid.tier, nv: mid.voices.length, fx: mid.fx },
      low: low && { tier: low.tier, nv: low.voices.length, fx: low.fx }, det,
      healed: Array.isArray(heal && heal.player && heal.player.fanLegend) };
  });
  console.log('(B)', JSON.stringify(r));
  if (!r.big || r.big.tier !== 'storica') issues.push('(B) offerta da corazzata non classificata «storica»');
  if (!r.big || r.big.nv < 3) issues.push('(B) troppe poche reazioni sul rifiuto storico: ' + (r.big && r.big.nv));
  if (!r.big || !r.big.who.some(w => /Baldini/.test(w))) issues.push('(B) il mister non parla col SUO nome: ' + JSON.stringify(r.big && r.big.who));
  if (!r.big || !r.big.who.some(w => /Contini/.test(w))) issues.push('(B) nessun compagno REALE tra le voci');
  if (!r.big || !(r.big.fx.popularity > 0 && r.big.fx.coachTrust > 0)) issues.push('(B) il rifiuto storico non premia popolarità/fiducia');
  if (!r.mid || r.mid.tier !== 'importante' || !r.mid.nv) issues.push('(B) fascia intermedia senza reazioni: ' + JSON.stringify(r.mid));
  if (!r.low || r.low.tier !== 'normale') issues.push('(B) un sondaggio qualunque non deve essere «importante»: ' + JSON.stringify(r.low));
  if (r.low && Object.keys(r.low.fx || {}).length) issues.push('(B) il sondaggio non deve dare effetti (farming)');
  if (!r.det) issues.push('(B) refuseEcho non deterministico');
  if (!r.healed) issues.push('(B) la migration non bonifica un fanLegend corrotto (resta rotto il pannello curva)');
  await page.close();
}

/* ─────────── (B2) END-TO-END: dal modale offerta al «Rifiuta» → la SCENA delle reazioni ─────────── */
{
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('(B2) pageerror: ' + String(e.message).slice(0, 120)));
  const sv = { phase: 'career', player: { name: 'Leo Rossi', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 5, week: 20, weekLived: true, age: 25, ovr: 84, tutorialDone: true, campDone: true, jerseyNumSeason: 5, presidentModalSeason: 5, drawSeen: 5, mercatoSeen: 5, presentSeason: 5, squadRole: 'titolare', coachTrust: 78, popularity: 55,
    coach: { name: 'Mister Baldini', style: 'Bilanciato' }, fanLegend: [{ clubId: 'sal', seasons: 4 }],
    journalists: [{ id: 'j_ferretti', name: 'Marco Ferretti', paper: 'Sprint Sportivo', icon: '📰', color: '#ef4444', type: 'critico' }],
    teammates: [{ name: 'Andrea Contini', archetype: 'capitano' }],
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 52, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
    stats: { 'velocità': 84, tecnica: 83, fisico: 82, 'mentalità': 84, tiro: 86, passaggio: 83, dribbling: 85, posizionamento: 84 },
    form: 78, morale: 74, fatigue: 12, contract: { duration: 2, wage: 25000, expiresAtSeason: 7 } } };
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, sv);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1400);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300);
  const pop0 = await page.evaluate(() => window.__CPM_CAREER.get().ovr && JSON.parse(localStorage.getItem('cpm-v3')).player.popularity);
  await page.evaluate(() => window.__CPM_CAREER.setOffer({ club: { id: 'mun', n: 'FC München', a: 'MUN', p: 93, c: '#dc2626', c2: '#fff', nat: '🇩🇪', lg: 'Deutsche Liga' }, type: 'Trasferimento', wage: 78000, duration: 4, minutaggio: 80, moralBonus: 10, growthBonus: 8 }));
  await sleep(800);
  try { await page.getByRole('button', { name: /Rifiuta/ }).first().click({ timeout: 6000 }); } catch (e) { issues.push('(B2) bottone Rifiuta non trovato'); }
  await sleep(1000);
  const txt = await page.evaluate(() => document.body.innerText);
  const scene = /attestato di fedelt/i.test(txt), club = /FC M(ü|u)nchen/.test(txt), mister = /Baldini/.test(txt);
  console.log('(B2) scena:', scene, '· club citato:', club, '· mister:', mister);
  if (!scene) issues.push('(B2) la scena delle reazioni non compare dopo il rifiuto');
  if (!club) issues.push('(B2) la scena non nomina il club rifiutato');
  if (!mister) issues.push('(B2) la scena non porta la voce del mister');
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Resto qui/.test(x.textContent || '')); b && b.click(); });
  await sleep(900);
  const after = await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('cpm-v3')).player; return { pop: p.popularity, fl: Array.isArray(p.fanLegend), diary: (p.diary || []).some(d => /detto no/i.test(d.headline || '')) }; });
  console.log('(B2) dopo:', JSON.stringify(after), '(popolarità prima', pop0 + ')');
  if (!(after.pop > pop0)) issues.push(`(B2) la popolarità non è salita col rifiuto (${pop0}→${after.pop})`);
  if (!after.fl) issues.push('(B2) fanLegend corrotto dal rifiuto (regressione del bug 7.307)');
  if (!after.diary) issues.push('(B2) il rifiuto non lascia traccia nel diario');
  await page.close();
}

/* ─────────── (C) appunti di collaudo nel live match ─────────── */
{
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('(C) pageerror: ' + String(e.message).slice(0, 120)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&sit=12`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(2500);
  const hasWarn = await page.evaluate(() => [...document.querySelectorAll('button')].some(b => (b.textContent || '').includes('⚠️')));
  console.log('(C) tasto ⚠️ presente nel live:', hasWarn);
  if (!hasWarn) { issues.push('(C) tasto ⚠️ assente dalla HUD del live match'); }
  else {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').includes('⚠️')); b && b.click(); });
    await sleep(600);
    const opened = await page.evaluate(() => /Appunto sull'azione/.test(document.body.innerText));
    const ctxShown = await page.evaluate(() => /\[KE \d+\.\d+\.\d+\]/.test(document.body.innerText));
    console.log('(C) campo note aperto:', opened, '· contesto catturato:', ctxShown);
    if (!opened) issues.push('(C) il campo appunti non si apre');
    if (!ctxShown) issues.push('(C) il contesto dell\'azione non viene registrato nella nota');
    await page.evaluate(() => { const t = document.querySelector('textarea'); if (t) { const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set; set.call(t, 'la palla torna indietro dopo il cross'); t.dispatchEvent(new Event('input', { bubbles: true })); } });
    await sleep(300);
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').trim() === 'Salva'); b && b.click(); });
    await sleep(600);
    const saved = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-bugnotes') || '[]'); } catch (e) { return []; } });
    console.log('(C) appunti salvati:', saved.length, saved[0] && saved[0].txt);
    if (saved.length !== 1) issues.push('(C) l\'appunto non è stato salvato');
    else {
      if (!/torna indietro/.test(saved[0].txt || '')) issues.push('(C) testo dell\'appunto non salvato');
      if (!saved[0].ctx || !saved[0].ctx.v || saved[0].ctx.min == null) issues.push('(C) contesto non salvato con l\'appunto');
    }
    const stillOpen = await page.evaluate(() => /Appunto sull'azione/.test(document.body.innerText));
    if (stillOpen) issues.push('(C) il campo appunti resta aperto dopo il salvataggio');
  }
  await page.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '\n❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '\n✅ COLLAUDO 7.338 OK (taccuino piatto · reazioni al rifiuto · appunti nel live)');
process.exit(issues.length ? 1 : 0);
