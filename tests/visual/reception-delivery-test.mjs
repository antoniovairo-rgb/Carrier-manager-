#!/usr/bin/env node
/* [7.351.0] GUARDIANO DELLA CONSEGNA — «il pallone non deve nascere tra i piedi dell'eroe».
   Cinque note di collaudo del PO sulla stessa classe (4 sul 7.350.0 + gi109 «Stop e tiro fulmineo»: «la
   palla deve essere nei piedi del compagno all'inizio»). Il gate NON vede niente di tutto questo: entra
   direttamente in `hl_choose` e salta `hl_intro`, che e' esattamente la fase in cui la consegna avviene.

   Verifica:
     A. la classe RICEZIONE e' quella attesa e non si restringe (37 aeree = il perimetro del 7.350.0, +
        le ricezioni a TERRA introdotte qui) e non invade chi la palla ce l'ha davvero
     B. ORDINE DI CONGELAMENTO: nessuna situation a nascita gia' dichiarata (corner/rimessa/rinvio/off-ball/
        difensiva/piazzato) e' una ricezione. E' il bug commesso scrivendo questa release: `obj.recv` era
        calcolato PRIMA che `ballAt`/`offBall` esistessero, le esclusioni non scattavano e 4 situations
        passavano il filtro. Una probe che guarda solo il totale non lo vede: qui si guarda il DETTAGLIO.
     C. la consegna a terra nasce DAVVERO vicino a un compagno (non su un punto vuoto del campo) e lontana
        dall'eroe — cioe' la scena si apre su chi ha il possesso, che e' la richiesta del PO
     D. un passaggio con esito OCCASIONE non abbandona mai il pallone (#162 «Assist d'esterno piede»:
        `post:null`, nessuno che lo raccoglie) e non finisce MAI in rete (il falso gol e' la classe che il
        ramo `chance` esisteva per prevenire: liberandolo va riprovata)
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node reception-delivery-test.mjs                        */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(900);

/* --- A + B --- */
const cls = await page.evaluate(() => {
  const s = window.__CPM_SITS || [];
  const recv = [], bad = [];
  s.forEach((x, i) => {
    if (!window.isReceptionSit(x)) return;
    recv.push({ i, aer: window.hlBallState(x) === 'aerial', t: String(x.text || '').slice(0, 44) });
    /* l'override autoriale `tactic.rv` puo' dichiarare ricezione qualunque cosa: e' voluto, non e' un bug */
    if (x.tactic && x.tactic.rv === true) return;
    if (x.ballAt || x.offBall || x.type === 'def' || x.lockMovement)
      bad.push({ i, why: x.ballAt ? 'ballAt=' + x.ballAt : x.offBall ? 'offBall' : x.type === 'def' ? 'difensiva' : 'piazzato', t: String(x.text || '').slice(0, 40) });
  });
  return { tot: s.length, recv, bad,
    probe: [109, 24, 113, 83].map(i => [i, window.isReceptionSit(s[i])]),
    ctrl: [22, 154, 28].map(i => [i, window.isReceptionSit(s[i])]) };
});
const aer = cls.recv.filter(r => r.aer).length, gnd = cls.recv.length - aer;
console.log(`(A) ricezioni ${cls.recv.length}/${cls.tot} → aeree ${aer} · a terra ${gnd}`);
if (aer !== 37) issues.push(`(A) le ricezioni AEREE sono ${aer}, attese 37: il perimetro del 7.350.0 si e' mosso`);
if (gnd < 12) issues.push(`(A) solo ${gnd} ricezioni a terra (attese >=12): il vocabolario si e' ristretto`);
for (const [i, v] of cls.probe) if (!v) issues.push(`(A) gi${i} doveva essere una ricezione e non lo e' piu'`);
for (const [i, v] of cls.ctrl) if (v) issues.push(`(A) gi${i} NON e' una ricezione (l'eroe la palla ce l'ha): la classe sta invadendo`);
console.log(`(B) nascite gia' dichiarate classificate ricezione: ${cls.bad.length}`);
for (const b of cls.bad) issues.push(`(B) gi${b.i} (${b.why}) e' marcata ricezione: ordine di congelamento di obj.recv sbagliato — «${b.t}»`);

/* --- C --- */
const d = await page.evaluate(() => {
  const s = window.__CPM_SITS || [], st = window.__CPM_STATE ? window.__CPM_STATE() : null;
  const hx = st && st.hero ? st.hero.x : 60, hy = st && st.hero ? st.hero.y : 50;
  const mates = (st && st.players ? st.players : []).filter(p => p.team === 'home' && !p.gk);
  const out = [];
  s.forEach((x, i) => {
    if (!window.isReceptionSit(x) || window.hlBallState(x) === 'aerial') return;
    const sp = window.hlBallSpot(Object.assign({}, x, { ballAt: 'mate' }), hx, hy);
    let best = 1e9; mates.forEach(m => { const q = Math.hypot(m.x - sp.x, m.y - sp.y); if (q < best) best = q; });
    out.push({ i, mate: +best.toFixed(1), hero: +Math.hypot(sp.x - hx, sp.y - hy).toFixed(1) });
  });
  return { n: mates.length, out };
});
if (!d.n) issues.push('(C) nessun compagno leggibile da __CPM_STATE: la misura della consegna non e\' stata fatta');
else {
  const far = d.out.filter(o => o.hero < 6), empty = d.out.filter(o => o.mate > 14);
  const med = d.out.map(o => o.mate).sort((a, b) => a - b)[d.out.length >> 1];
  console.log(`(C) consegna a terra su ${d.out.length} scene → compagno piu' vicino (mediana) ${med}u · nate sull'eroe: ${far.length} · su punto vuoto: ${empty.length}`);
  if (far.length) issues.push(`(C) ${far.length} consegne nascono a meno di 6u dall'eroe: la palla e' ancora nei suoi piedi (gi ${far.slice(0, 6).map(o => o.i).join(', ')})`);
  if (empty.length > 2) issues.push(`(C) ${empty.length} consegne nascono a >14u da OGNI compagno: la scena si apre su un punto vuoto (gi ${empty.slice(0, 6).map(o => o.i).join(', ')})`);
}

/* --- D --- */
console.log('(D) passaggio con esito OCCASIONE — il pallone viene raccolto e NON entra in rete');
for (const gi of [162, 121, 185]) {
  await page.evaluate(g => { window.__CPM_DISPATCH = null; window.__CPM_FORCE_KIND = 'chance'; window.__CPM_FORCE_SIT(g, true); }, gi);
  await sleep(800);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(300);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  await sleep(2600);
  const r = await page.evaluate(() => ({ d: window.__CPM_DISPATCH, b: window.__CPM_BALL ? window.__CPM_BALL() : null }));
  const post = r.d ? r.d.post : null, ht = r.d ? r.d.ht : null;
  console.log(`    gi${gi}: ht=${ht} post=${post} ball.x=${r.b ? r.b.x : '?'}`);
  if (ht !== 'pass') continue;                       /* non e' della famiglia: niente da pretendere */
  if (!post) issues.push(`(D) gi${gi}: passaggio+occasione senza post-arco — il pallone resta in mezzo al campo e nessuno lo raccoglie (#162)`);
  if (post === 'in_net') issues.push(`(D) gi${gi}: un'OCCASIONE finisce in rete — falso gol`);
}
await page.evaluate(() => { window.__CPM_FORCE_KIND = null; });

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ CONSEGNA OK — la ricezione nasce dal compagno, le nascite dichiarate restano intatte, l\'occasione non abbandona il pallone');
