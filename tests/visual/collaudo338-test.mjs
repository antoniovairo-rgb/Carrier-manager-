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
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

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
  const dSpine = Math.hypot(rig.pad.p[0] - rig.spine[0], rig.pad.p[2] - rig.spine[2]);
  /* [7.340.0] l'invariante è «mai DI TAGLIO»: si misura quanto la faccia del blocchetto guarda la camera
     (1 = faccia piena · 0 = solo il bordo = la lama del collaudo «film horror»). Il vecchio test sull'ingombro
     verticale valeva finché il taccuino stava in orizzontale sul palmo; col braccio disteso ora PENDE dal pugno. */
  console.log(`(A/${tag}) taccuino: faccia verso camera ${rig.padFace} · dal busto ${dSpine.toFixed(3)} · dalla mano ${rig.padFromHand}`);
  if (!(rig.padFace >= 0.45)) issues.push(`(A/${tag}) il taccuino si vede DI TAGLIO (faccia verso camera ${rig.padFace}, serve ≥0.45)`);
  if (rig.padFromHand > 0.13) issues.push(`(A/${tag}) taccuino staccato dalla mano (${rig.padFromHand}u)`);
  if (dSpine < 0.14) issues.push(`(A/${tag}) taccuino dentro il busto (${dSpine.toFixed(3)}u dall'asse)`);
  /* [7.340.0 collaudo PO «la mano non è collegata al braccio, sembra incollata al corpo»] la catena del braccio
     libero si misura in SPAZIO PERSONAGGIO (asse laterale = congiungente spalla-spalla): deve uscire dal busto
     e scendere, mai finire sulla linea mediana davanti alla pancia (misurato prima del fix: lat −0.02, fwd +0.19). */
  const B = rig.body;
  if (!B || !B.lHand || !B.lFore || !B.lArm) issues.push(`(A/${tag}) misure in spazio personaggio assenti`);
  else {
    console.log(`(A/${tag}) braccio: spalla lat ${B.lArm.lat} · gomito ${B.lFore.lat} · mano ${B.lHand.lat} (fwd ${B.lHand.fwd}, dy ${B.lHand.dy})`);
    if (B.lHand.lat < 0.22) issues.push(`(A/${tag}) la mano libera è addosso al busto (lat ${B.lHand.lat}, serve ≥0.22)`);
    if (!(B.lArm.lat < B.lFore.lat && B.lFore.lat < B.lHand.lat)) issues.push(`(A/${tag}) la catena del braccio non esce progressivamente dal corpo: spalla ${B.lArm.lat} · gomito ${B.lFore.lat} · mano ${B.lHand.lat}`);
    if (B.lHand.dy > -0.25) issues.push(`(A/${tag}) la mano libera non scende lungo il fianco (dy ${B.lHand.dy})`);
    if (Math.abs(B.lHand.fwd) > 0.30) issues.push(`(A/${tag}) la mano libera è troppo avanti/indietro rispetto al busto (fwd ${B.lHand.fwd})`);
  }
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
    /* [7.417.0 collaudo PO «ho rifiutato un'offerta dell'Atletico Madrid, nessuna reazione?!»] LA
       STELLA NEL TOP CLUB: per lei nessuna offerta e' piu' un «salto» (dP mai ≥5) e il vecchio tier
       taceva PER SEMPRE. Il calibro dell'offerente conta: corazzata laterale senza rilancio →
       almeno «importante»; big quasi pari col rilancio vero → «storica». */
    const star = { ...base, club: { id: 'mad', n: 'CF Madrid', p: 88, lg: 'Liga Ibérica' }, contract: { wage: 90000 }, fanLegend: [{ clubId: 'mad', seasons: 2 }] };
    const lat = window.refuseEcho(star, { club: { n: 'Atletico Madrid', p: 86 }, wage: 126000 });
    const lat2 = window.refuseEcho(star, { club: { n: 'Atletico Madrid', p: 84 }, wage: 90000 });
    const det = JSON.stringify(window.refuseEcho(base, off(92, 70000))) === JSON.stringify(big);
    /* heal della migration su un save col campo già corrotto (stringa, come lo lasciava il 7.307.0) */
    const heal = window.__CPM_MIGRATE({ name: 'X', proStatus: 'pro', season: 3, week: 5, ovr: 70, stats: {}, form: 70,
      club: { id: 'sal', n: 'FC Salernum', a: 'SAL', lg: 'Lega A', p: 52 }, fanLegend: '2', calendar: [], standings: [] });
    return { big: big && { tier: big.tier, nv: big.voices.length, who: big.voices.map(v => v.who), fx: big.fx, head: big.head },
      mid: mid && { tier: mid.tier, nv: mid.voices.length, fx: mid.fx },
      low: low && { tier: low.tier, nv: low.voices.length, fx: low.fx }, det,
      lat: lat && { tier: lat.tier, nv: lat.voices.length }, lat2: lat2 && { tier: lat2.tier, nv: lat2.voices.length },
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
  if (!r.lat || r.lat.tier !== 'storica' || r.lat.nv < 3) issues.push('(B) [7.417] big quasi pari col rilancio: attesa «storica», avuto ' + JSON.stringify(r.lat));
  if (!r.lat2 || r.lat2.tier !== 'importante' || !r.lat2.nv) issues.push('(B) [7.417] corazzata laterale senza rilancio: la stella non deve rifiutare NEL SILENZIO — avuto ' + JSON.stringify(r.lat2));
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

/* ─────────── (D) [7.339.0] la ⚠️ ABBOZZA da sola l'appunto da ciò che ha visto ─────────── */
{
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('(D) pageerror: ' + String(e.message).slice(0, 120)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => typeof window.draftBugNote === 'function', null, { timeout: 45000 });
  /* motore puro su tracce sintetiche: ogni classe di difetto deve avere la sua frase, e una traccia PULITA
     non deve produrre nulla (mai gridare al lupo) — compreso lo STACCO DI SCENA, che non è un teletrasporto */
  const d = await page.evaluate(() => {
    const mk = (pts) => ({ samples: pts, goalX: 46, now: 0 });
    const base = (n, fn) => { const a = []; for (let i = 0; i < n; i++) a.push(Object.assign({ t: i * 16, x: 0, y: 0.5, z: 0, hx: 0, md: 1.5, f: 1, sk: 5 }, fn(i))); return a; };
    return {
      back: window.draftBugNote(mk(base(240, i => ({ x: i < 120 ? 5 + i * 0.18 : 26.6 - (i - 120) * 0.16 }))), {}),
      tele: window.draftBugNote(mk(base(240, i => ({ x: i === 120 ? 40 : -10 + i * 0.12 }))), {}),
      snap: window.draftBugNote(mk(base(240, i => ({ x: i < 120 ? -20 + i * 0.12 : 20 + (i - 120) * 0.12, sk: i < 120 ? 5 : 6 }))), {}),/* traccia dentro i limiti del campo: qui deve emergere SOLO lo stacco (che non è un difetto) */
      still: window.draftBugNote(mk(base(240, i => ({ x: i < 40 ? 10 + i * 0.2 : 18 }))), {}),
      out: window.draftBugNote(mk(base(240, i => ({ x: 20 + i * 0.16 }))), {}),
      mateNo: window.draftBugNote(mk(base(240, i => ({ x: -10 + i * 0.12, md: 9 }))), { intent: 'pass', ok: true }),
      mateShot: window.draftBugNote(mk(base(240, i => ({ x: -10 + i * 0.12, md: 9 }))), { intent: 'shot', ok: true }),
      mateFail: window.draftBugNote(mk(base(240, i => ({ x: -10 + i * 0.12, md: 9 }))), { intent: 'pass', ok: false }),/* [7.341.0] su una giocata FALLITA nessuno deve arrivare sul pallone: non e' un difetto */
      net: window.draftBugNote(mk(base(240, i => ({ x: i < 220 ? 10 + i * 0.16 : 46.3, z: 0, y: 1 }))), { out: 'saved' }),
      /* [7.341.0] tre trappole di misura che nel setaccio segnalavano azioni SANE */
      corner: window.draftBugNote(mk(base(240, i => ({ x: 47 - Math.min(i, 160) * 0.045, z: -32 + Math.min(i, 160) * 0.19 }))), { out: 'miss' }),/* battuta d'angolo: arretra sempre in x, non e' un boomerang */
      assistShort: window.draftBugNote(mk(base(240, i => ({ x: -10 + i * 0.1, md: 1.2 }))), { out: 'assist', intent: 'pass', ok: true }),/* l'assist finisce sui piedi del compagno, non in porta */
      goalSettle: window.draftBugNote(mk(base(240, i => ({ x: i < 200 ? 10 + i * 0.2 : 49.4 - (i - 200) * 0.04, z: 0.5, y: i < 200 ? 1.2 : 0.45 }))), { out: 'goal', intent: 'shot', ok: true }),/* gol vero: entra e poi si assesta nella bocca della porta */
      clean: window.draftBugNote(mk(base(240, i => ({ x: -10 + i * 0.12, md: 1.4 }))), {}),
      /* [gi187] LA FINE DELLA SCENA È UNO STACCO: nei +320ms dopo la caduta del bit hl (f&8) la camera
         torna in broadcast (~33u) e la palla viene ri-piazzata per la cronaca (~18u) — tagli voluti,
         non teletrasporti. Il caso mid* prova che la sensibilità sui salti VERI a scena viva resta. */
      endCutBall: window.draftBugNote(mk(base(240, i => ({ x: i === 201 ? 30 : -10 + i * 0.12, f: i < 200 ? 9 : 0 }))), {}),
      endCutCam: window.draftBugNote(mk(base(240, i => ({ x: -10 + i * 0.12, f: i < 200 ? 9 : 0, cx: i <= 200 ? 10 : 43, cy: 8, cz: 20, lx: 0, ly: 1, lz: 0 }))), {}),
      midCutBall: window.draftBugNote(mk(base(240, i => ({ x: i === 150 ? 30 : -10 + i * 0.12, f: 9 }))), {}),
      midCutCam: window.draftBugNote(mk(base(240, i => ({ x: -10 + i * 0.12, f: 9, cx: i <= 150 ? 10 : 43, cy: 8, cz: 20, lx: 0, ly: 1, lz: 0 }))), {}),
    };
  });
  const has = (k, rx) => rx.test(d[k] || '');
  console.log('(D) motore:', Object.entries(d).map(([k, v]) => `${k}:${v ? 'sì' : 'no'}`).join(' · '));
  if (!has('back', /INDIETRO/)) issues.push('(D) il pallone che torna indietro non viene descritto');
  if (!has('tele', /teletrasporto/)) issues.push('(D) il teletrasporto non viene descritto');
  if (d.snap) issues.push('(D) lo STACCO DI SCENA viene scambiato per un difetto: ' + d.snap.slice(0, 90));
  if (!has('still', /FERMA/)) issues.push('(D) la palla ferma non viene descritta');
  if (!has('out', /uscita dal campo/)) issues.push('(D) la palla fuori campo non viene descritta');
  if (!has('mateNo', /nessun compagno/)) issues.push('(D) il destinatario mancante non viene descritto su un passaggio');
  if (has('mateShot', /nessun compagno/)) issues.push('(D) su un TIRO non deve lamentare il compagno assente (falso allarme)');
  if (has('mateFail', /nessun compagno/)) issues.push('(D) su una giocata FALLITA non deve lamentare il compagno assente (falso allarme)');
  if (!has('net', /IN RETE/)) issues.push('(D) esito «parata» con palla in rete non viene descritto');
  if (has('corner', /INDIETRO/)) issues.push('(D) la battuta d\'angolo viene scambiata per un pallone che torna indietro: ' + d.corner.slice(0, 90));
  if (has('assistShort', /dalla porta|in porta/)) issues.push('(D) un ASSIST non deve dover arrivare in porta: ' + d.assistShort.slice(0, 90));
  if (has('goalSettle', /mai arrivata in porta|IN RETE/)) issues.push('(D) un GOL entrato e poi assestato viene segnalato: ' + d.goalSettle.slice(0, 90));
  if (d.clean) issues.push('(D) una traccia PULITA non deve produrre bozza: ' + d.clean.slice(0, 90));
  /* [gi187] il rientro in cronaca (camera in broadcast + palla ri-piazzata, dopo la caduta del bit hl)
     non deve finire in bozza; lo stesso salto a SCENA VIVA sì (sensibilità intatta) */
  if (has('endCutBall', /teletrasporto/)) issues.push('(D) gi187: il ri-piazzamento della palla a fine scena viene scambiato per teletrasporto: ' + d.endCutBall.slice(0, 110));
  if (has('endCutCam', /CAMERA salta|CAMERA trema/)) issues.push('(D) gi187: il ritorno in broadcast a fine scena viene scambiato per salto di camera: ' + d.endCutCam.slice(0, 110));
  if (!has('midCutBall', /teletrasporto/)) issues.push('(D) gi187: il teletrasporto VERO a scena viva non viene più descritto (sensibilità persa)');
  if (!has('midCutCam', /CAMERA salta|CAMERA trema/)) issues.push('(D) gi187: il salto di camera VERO a scena viva non viene più descritto (sensibilità persa)');
  if (d.midCutCam && !/codice 007/.test(d.midCutCam)) issues.push('(D) gi108: la riga-camera non porta l\'etichetta «codice 007»');
  /* dal vivo: azione vera → il tasto ⚠️ precompila la nota con la bozza (o la lascia vuota, mai un errore) */
  await page.close();
  const pg2 = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(pg2);
  pg2.on('pageerror', e => issues.push('(D-live) pageerror: ' + String(e.message).slice(0, 120)));
  await pg2.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(pg2, port);
  await sleep(1000);
  await pg2.evaluate(() => window.__CPM_FORCE_SIT(7, true)); await sleep(900);
  await pg2.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(500);
  await pg2.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); });
  await sleep(3000);
  const snapOk = await pg2.evaluate(() => { try { const s = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP(); return !!(s && s.samples && s.samples.length > 5); } catch (e) { return false; } });
  console.log('(D) testimone attivo dal vivo:', snapOk);
  if (!snapOk) issues.push('(D) il testimone del render-loop non registra la traccia dal vivo');
  await pg2.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').includes('⚠️')); b && b.click(); });
  await sleep(700);
  const live = await pg2.evaluate(() => { const t = document.querySelector('textarea'); return t ? t.value : null; });
  console.log('(D) bozza dal vivo:', live ? live.split('\n')[1] : '(vuota: nessuna anomalia)');
  if (live && !/Cosa ho visto/.test(live)) issues.push('(D) bozza dal vivo malformata: ' + live.slice(0, 80));
  await pg2.close();
}

/* ─────────── (E) [7.340.0] il testimone copre TUTTA la partita e si sceglie quale azione annotare ─────────── */
{
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('(E) pageerror: ' + String(e.message).slice(0, 120)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(page, port);
  await sleep(900);
  for (const gi of [7, 30, 12]) {
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(900);
    await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(400);
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); });
    await sleep(2500);
  }
  const snap = await page.evaluate(() => { const s = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP(); return s ? { n: s.samples.length, span: s.span, res: s.res } : null; });
  console.log('(E) traccia:', JSON.stringify(snap));
  if (!snap || snap.span < 12) issues.push('(E) il testimone non copre l\'intera partita (span ' + (snap && snap.span) + 's dopo 3 azioni)');
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').includes('⚠️')); b && b.click(); });
  await sleep(700);
  const chips = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => /^\d+'/.test((b.textContent || '').trim())).length);
  console.log('(E) azioni selezionabili nel campo appunti:', chips);
  if (chips < 3) issues.push('(E) il campo appunti non offre le azioni PASSATE da annotare (trovate ' + chips + ')');
  /* scegliendo un'azione passata, il contesto della nota deve cambiare di conseguenza */
  const ctx0 = await page.evaluate(() => { const d = [...document.querySelectorAll('div')].find(e => /^\[KE /.test((e.textContent || '').trim())); return d ? d.textContent : ''; });
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(x => /^\d+'/.test((x.textContent || '').trim()))[2]; b && b.click(); });
  await sleep(600);
  const ctx1 = await page.evaluate(() => { const d = [...document.querySelectorAll('div')].find(e => /^\[KE /.test((e.textContent || '').trim())); return d ? d.textContent : ''; });
  const sit0 = (ctx0.match(/SIT #(\d+)/) || [])[1], sit1 = (ctx1.match(/SIT #(\d+)/) || [])[1];
  console.log('(E) scena corrente #' + sit0 + ' → scelta passata #' + sit1);
  if (!sit1 || sit1 === sit0) issues.push('(E) scegliendo un\'azione passata il contesto della nota non cambia');
  await page.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '\n❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '\n✅ COLLAUDO 7.338→7.340 OK (braccio e taccuino · reazioni al rifiuto · appunti nel live · bozza automatica · tutta la partita)');
process.exit(issues.length ? 1 : 0);
