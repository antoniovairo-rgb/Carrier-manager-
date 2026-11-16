#!/usr/bin/env node
/* [giro 209 PO-470] GUARDIANO avviso3d-209 — decisione del PO (15/11): «Eviterei proprio il ripiego 2D, se non va il 3D avvisare il
   player che non puo' procedere perche' ha la connessione lenta o non ne ha proprio».
   Percorso vero: salvataggio da professionista con una gara di Coppa (ottavi) in settimana → partita (__CPM_CAREER.playMatch, pilota
   seedato) → la scena 3D non arriva. Due casi, su telefono 375x667 e PC 1366x768:
     LENTO   i file CGTrader restano appesi (rete lentissima) e il tetto e' basso (__CPM_CAP196=4000): deve comparire l'AVVISO
             (data-cpm="avviso3d209", motivo «lento») con «Riprova» e «Simula», mai la partita 2D. Poi «Riprova» con la rete tornata
             (e il tetto di sempre, 120 s): la scena 3D si rimonta da capo (i file CGTrader si richiedono di nuovo), l'avviso sparisce,
             i corpi diventano pronti e la partita va avanti in 3D.
     FALLITO i file CGTrader falliscono (richiesta abortita) col tetto di sempre: l'avviso compare SUBITO (entro 20 s, non dopo 120),
             motivo «fallito». Poi «Simula»: la partita si chiude, si torna alla carriera con l'avviso del risultato, la gara conta UNA
             volta (matchHistory +1, voce di Coppa +1, gara segnata giocata) anche dopo altri 8 s e dopo un ricaricamento della pagina,
             e nessuna ripresa della partita lasciata a meta'.
   In tutti: mai __CPM_2D196 ne' il campo dall'alto (data-cpm="vista2d"); tasti alti >= 48 px e dentro lo schermo; nessun errore di
   pagina (tolte le richieste bloccate apposta e la nota di Babel).
   ROSSO window.__CPM_NO_G209 (comportamento della 194: ripiego 2D): DEVE essere bocciato. «Non giudicato» = rosso.
   Uso: node avviso3d-209.mjs · CPM_PARTE=verde|rosso · CPM_MISURA=1 (stampa e basta, esce 0) · CPM_FOTO=<cartella> CPM_TAG=<nome> */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SCHERMI, mkSave } from './misura-205.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const PARTE = process.env.CPM_PARTE || 'tutto', MISURA = !!process.env.CPM_MISURA;
const FOTO = process.env.CPM_FOTO || '', TAG = process.env.CPM_TAG || 'dopo';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();

const stato = (pg) => pg.evaluate(() => { const q = s => document.querySelector(s); const P = JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {};
  const a = q('[data-cpm="avviso3d209"]'); const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.x), y: Math.round(b.y), b: Math.round(b.bottom), rr: Math.round(b.right) }; };
  const md = (P.calendar || []).find(m => m.matchday === 992);
  return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, d2: !!window.__CPM_2D196, v2d: !!q('[data-cpm="vista2d"]') && !(window.__CPM_PHASE && window.__CPM_PHASE() === 'playing'),/* la mappa dall'alto del gioco fluido e' normale: conta solo al posto di una scena 3D */ tela: (() => { const c = document.querySelector('[data-cpm="vista3d-box"] canvas') || document.querySelector('canvas'); return c ? (c.__g209 ? 'vecchia' : 'nuova') : 'nessuna'; })(), att: !!q('[data-cpm="attesa196"]'),
    avv: !!a, mot: a ? a.getAttribute('data-motivo') : null, testo: a ? a.innerText.replace(/\s+/g, ' ').trim() : '', rip: r(q('[data-cpm="avviso3d209-riprova"]')), sim: r(q('[data-cpm="avviso3d209-simula"]')),
    vw: innerWidth, vh: innerHeight, nRip: window.__CPM_RIPROVA209 | 0, nSim: window.__CPM_SIM209 | 0, att196: !!window.__CPM_ATT196,
    pronti: (() => { try { const x = window.__CPM_PRONTI196 && window.__CPM_PRONTI196(); return x ? (x.pronti ? 'pronti' : x.motivo) : null; } catch (e) { return 'err'; } })(),
    mh: (P.matchHistory || []).length, cupN: ((P.cup || {}).results || []).length, mdPlayed: md ? !!md.played : null, week: P.week, resume: localStorage.getItem('cpm-match-resume') || '',
    corpo: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 400), carriera: !window.__CPM_PHASE || !q('[data-cpm="vista3d-box"]') }; }).catch(e => ({ err: String(e.message).slice(0, 100) }));

async function apri(schermo, caso, flags) {
  const ctx = await browser.newContext({ viewport: SCHERMI[schermo], serviceWorkers: 'block', ...(schermo === 'telefono' ? { isMobile: true, hasTouch: true } : {}) });
  const pg = await ctx.newPage(); await installCdnRoutes(pg);
  const rete = { appesi: [], libera: false, richieste: 0 };
  await pg.route('**/assets/cgtrader-*.glb', async r => { rete.richieste++;
    if (caso === 'fallito') return r.abort().catch(() => {});
    if (rete.libera) return r.fallback().catch(() => {});
    rete.appesi.push(r); });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  pg.on('console', m => { if (m.type() === 'error' && !/\[BABEL\] Note|Failed to load resource|ERR_FAILED|net::/.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)); });
  await pg.addInitScript(([sv, f, cap]) => { window.__CPM_GLB = true; window.__CPM_T196ON = 1; if (cap) window.__CPM_CAP196 = cap; for (const k of f) window[k] = 1;
    if (!sessionStorage.getItem('g209')) { sessionStorage.setItem('g209', '1'); localStorage.setItem('cpm-v3', JSON.stringify(sv)); } }, [mkSave(2, 9090), flags, caso === 'lento' ? 4000 : 0]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  const s0 = await stato(pg);
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break;
    await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 9090, policy: 'seeded', tickMs: 300 }));
  return { pg, ctx, errs, rete, s0 };
}
/* aspetta l'avviso (o il 2D) campionando; ritorna la storia dei campioni */
async function aspettaAvviso(pg, tetto) {
  const C = []; const t0 = Date.now(); let s = null;
  while (Date.now() - t0 < tetto) { s = await stato(pg); s.t = Date.now() - t0; C.push(s); if (s.avv || s.d2) break; await sleep(250); }
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false)).catch(() => {});
  return { C, s, t: Date.now() - t0 };
}
const tastiOk = s => !!(s.rip && s.sim && s.rip.h >= 48 && s.sim.h >= 48 && s.rip.x >= 0 && s.sim.x >= 0 && s.rip.rr <= s.vw && s.sim.rr <= s.vw && s.rip.y >= 0 && s.sim.b <= s.vh);
const foto = async (pg, n) => { if (FOTO) await pg.screenshot({ path: `${FOTO}/${TAG}-${n}.png` }).catch(() => {}); };

async function lento(schermo, flags) {
  const g = []; const { pg, ctx, errs, rete } = await apri(schermo, 'lento', flags);
  const A = await aspettaAvviso(pg, 60000); const s = A.s || {};
  await foto(pg, `${schermo}-lento-avviso`);
  const mai2D = A.C.every(c => !c.d2 && !c.v2d);
  g.push([s.avv && s.mot === 'lento' && mai2D, `lento: avviso ${s.avv ? 'si' : 'no'} (motivo ${s.mot}) dopo ${(A.t / 1000).toFixed(1)} s in fase ${s.ph} · 2D ${s.d2} · campo dall'alto ${s.v2d}`]);
  g.push([tastiOk(s), `lento: tasti Riprova ${JSON.stringify(s.rip)} · Simula ${JSON.stringify(s.sim)} su ${s.vw}x${s.vh}`]);
  g.push([/3D/.test(s.testo) && /lent|piano|internet/i.test(s.testo), `lento: testo «${(s.testo || '').slice(0, 140)}»`]);
  let rip = null;
  if (s.avv) {
    await sleep(3000); const s2 = await stato(pg);
    g.push([s2.avv && !s2.d2 && !s2.v2d && s2.att196, `lento: l'avviso resta e il 3D resta fermo (avviso ${s2.avv}, 2D ${s2.d2}, 3D sospeso ${s2.att196})`]);
    /* la rete torna: i file appesi ripartono, il tetto torna quello di sempre; Riprova */
    const r0 = rete.richieste; rete.libera = true; for (const r of rete.appesi.splice(0)) r.fallback().catch(() => {});
    await pg.evaluate(() => { window.__CPM_CAP196 = 120000; document.querySelectorAll('canvas').forEach(c => { c.__g209 = 1; }); });
    await pg.click('[data-cpm="avviso3d209-riprova"]');
    const C = []; const t0 = Date.now(); let x = null;
    while (Date.now() - t0 < 150000) { x = await stato(pg); x.t = Date.now() - t0; C.push(x); if (x.tela === 'nuova' && !x.avv && !x.att && x.pronti === 'pronti' && !x.att196 && x.ph && x.ph !== 'walkout') break; await sleep(500); }
    await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 9090, policy: 'seeded', tickMs: 300 })).catch(() => {});
    let ph2 = new Set(); for (let i = 0; i < 20; i++) { const y = await stato(pg); ph2.add(y.ph); C.push(y); if ([...ph2].some(p => /^hl_/.test(p || ''))) break; await sleep(1000); }
    await foto(pg, `${schermo}-lento-dopo-riprova`);
    rip = { t: x && x.t, rich: rete.richieste - r0, fasi: [...ph2] };
    g.push([x && x.nRip === 1, `riprova: tasto premuto una volta (contatore ${x && x.nRip})`]);
    g.push([C.some(c => c.tela === 'nuova'), `riprova: la scena 3D si rimonta da capo (tela 3D nuova: ${C.some(c => c.tela === 'nuova')})`]);
    g.push([x && x.tela === 'nuova' && x.pronti === 'pronti' && !x.avv && !x.att196 && C.every(c => !c.d2 && !c.v2d), `riprova: corpi pronti in ${x ? (x.t / 1000).toFixed(1) : '—'} s, avviso via, partita in 3D (fasi dopo: ${[...ph2].join(',')}) · 2D mai`]);
  } else g.push([false, 'riprova: non giudicato (nessun avviso)']);
  g.push([errs.length === 0, `lento: errori ${errs.length} ${errs.length ? JSON.stringify(errs.slice(0, 2)) : ''}`]);
  await ctx.close(); return { g, info: { t: A.t, fase: s.ph, rip } };
}
async function fallito(schermo, flags) {
  const g = []; const { pg, ctx, errs, s0, rete } = await apri(schermo, 'fallito', flags);
  const A = await aspettaAvviso(pg, 60000); const s = A.s || {};
  await foto(pg, `${schermo}-fallito-avviso`);
  const mai2D = A.C.every(c => !c.d2 && !c.v2d);
  g.push([s.avv && s.mot === 'fallito' && A.t < 20000 && mai2D, `fallito: avviso ${s.avv ? 'si' : 'no'} (motivo ${s.mot}) dopo ${(A.t / 1000).toFixed(1)} s in fase ${s.ph} · 2D ${s.d2} · campo dall'alto ${s.v2d}`]);
  g.push([tastiOk(s), `fallito: tasti Riprova ${JSON.stringify(s.rip)} · Simula ${JSON.stringify(s.sim)} su ${s.vw}x${s.vh}`]);
  g.push([/3D/.test(s.testo) && /internet|scaricare/i.test(s.testo), `fallito: testo «${(s.testo || '').slice(0, 140)}»`]);
  if (s.avv) {
    /* Riprova col caricamento che fallisce ancora: i file si richiedono di nuovo e l'avviso torna, con la stessa regola */
    const r0 = rete.richieste; await pg.click('[data-cpm="avviso3d209-riprova"]'); await sleep(800);
    const via = await stato(pg); const B = await aspettaAvviso(pg, 30000); const b = B.s || {};
    g.push([b.avv && b.mot === 'fallito' && b.nRip === 1 && rete.richieste - r0 >= 1 && B.C.every(c => !c.d2 && !c.v2d), `fallito: Riprova (${b.nRip}) richiede di nuovo i file CGTrader (${rete.richieste - r0} richieste) e l'avviso torna dopo ${((B.t + 800) / 1000).toFixed(1)} s (subito dopo il tocco: avviso ${via.avv}) · 2D mai`]);
    await pg.click('[data-cpm="avviso3d209-simula"]');
    let x = null, toast = ''; const t0 = Date.now();
    while (Date.now() - t0 < 20000) { x = await stato(pg); if (/\(sim\)|Vittoria|Pareggio|Sconfitta/.test(x.corpo)) toast = (x.corpo.match(/[^.·]{0,40}\(sim\)[^·]{0,60}/) || [x.corpo.slice(0, 80)])[0]; if (x.mh > s0.mh && x.carriera && toast) break; await sleep(400); }
    await foto(pg, `${schermo}-fallito-dopo-simula`);
    await sleep(8000); const y = await stato(pg);
    g.push([x && x.nSim === 1 && x.carriera && !x.avv, `simula: tasto premuto una volta (${x && x.nSim}), partita chiusa, carriera a schermo (${x && x.carriera})`]);
    g.push([!!toast, `simula: avviso del risultato «${toast}»`]);
    g.push([y.mh === s0.mh + 1 && y.cupN === (s0.cupN | 0) + 1 && y.mdPlayed === true && y.week === s0.week + 1, `simula: conta una volta (matchHistory ${s0.mh}→${y.mh}, Coppa ${s0.cupN}→${y.cupN}, gara giocata ${y.mdPlayed}, settimana ${s0.week}→${y.week}) dopo 8 s`]);
    g.push([!y.resume, `simula: nessuna ripresa della partita lasciata a meta' (cpm-match-resume «${y.resume.slice(0, 40)}»)`]);
    await pg.reload({ waitUntil: 'load' }); await sleep(4000); try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {} await sleep(3000);
    const z = await stato(pg);
    g.push([z.mh === y.mh && z.cupN === y.cupN && z.mdPlayed === true && !z.avv && !(z.ph && /^(playing|walkout|hl_)/.test(z.ph)), `simula: dopo il ricaricamento stesso salvataggio (matchHistory ${z.mh}, Coppa ${z.cupN}) e nessuna partita riaperta (fase ${z.ph})`]);
  } else g.push([false, 'simula: non giudicato (nessun avviso)']);
  g.push([errs.length === 0, `fallito: errori ${errs.length} ${errs.length ? JSON.stringify(errs.slice(0, 2)) : ''}`]);
  await ctx.close(); return { g, info: { t: A.t, fase: s.ph, d2: s.d2 } };
}
const verde = [], rosso = [];
if (PARTE !== 'rosso') for (const sc of ['telefono', 'pc']) {
  console.log(`… verde ${sc}: caricamento fallito → Simula`); const F = await fallito(sc, []); F.g.forEach(([ok, m]) => verde.push([ok, sc + ' · ' + m]));
  console.log(`… verde ${sc}: caricamento lento → Riprova`); const L = await lento(sc, []); L.g.forEach(([ok, m]) => verde.push([ok, sc + ' · ' + m]));
}
if (PARTE !== 'verde') {
  console.log('… rosso telefono (__CPM_NO_G209): caricamento fallito'); const R = await fallito('telefono', ['__CPM_NO_G209']);
  const a = R.g[0]; rosso.push([!a[0], `rosso telefono: ${a[1]} → ${a[0] ? 'NON bocciato' : 'bocciato'}`]);
  console.log('… rosso telefono (__CPM_NO_G209): caricamento lento'); const R2 = await lento('telefono', ['__CPM_NO_G209']);
  const b = R2.g[0]; rosso.push([!b[0], `rosso telefono: ${b[1]} → ${b[0] ? 'NON bocciato' : 'bocciato'}`]);
}
await browser.close(); srv.close();
for (const [ok, m] of verde) console.log((ok ? '  ✓ ' : '  ✗ ') + m);
for (const [ok, m] of rosso) console.log((ok ? '  ✓ ' : '  ✗ ') + m);
const vOk = PARTE === 'rosso' || (verde.length > 0 && verde.every(x => x[0])), rOk = PARTE === 'verde' || (rosso.length > 0 && rosso.every(x => x[0]));
if (PARTE !== 'rosso') console.log(`VERDE: ${verde.filter(x => x[0]).length}/${verde.length} ${vOk ? '✓' : '✗'}`);
if (PARTE !== 'verde') console.log(`ROSSO __CPM_NO_G209 bocciato: ${rOk ? '✓' : '✗'}`);
console.log(vOk && rOk ? `✅ avviso3d-209 superato (${PARTE}: verde col verde, rosso col rosso)` : `❌ avviso3d-209 rosso (${PARTE})`);
process.exit(MISURA ? 0 : (vOk && rOk ? 0 : 1));
