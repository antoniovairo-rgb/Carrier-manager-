#!/usr/bin/env node
/* [giro 129 PO-330 «A sagome»] GUARDIANO DELLA FOLLA — `npm run folla`.
   La folla dello stadio sono impostori istanziati (src/11 buildFolla129) al posto delle persone dipinte sulle tele
   (makeCrowdTex). Il guardiano apre la partita vera (stadio moderno_it forzato, contesto folla forzato) con la cadenza
   di VITA reale della folla (la stessa che il gioco usa fuori dal banco: tele ogni 110 ms, tifo animato) e giudica:
     F1  nessuna tela della folla ridisegnata durante la partita (contatore __CPM_CROWD_TICK fermo su 6 s)
     F2  zero caricamenti di texture a regime sulla GPU (texImage2D/texSubImage2D contati su 6 s, dopo la costruzione)
     F3  conteggio coerente con l'affluenza della MatchdayCard: per settore |occupati/posti - riempimento del settore| <= 0,05
         (il riempimento di settore nasce dall'affluenza: curve piu' piene, tribune meno, settore ospiti dall'awayFill —
         src/11 7.187) e sul totale |occupati/posti - atteso pesato| <= 0,03; stampato accanto a affluenza/capienza
     F4  seme deterministico: due costruzioni a pagina nuova danno la stessa firma (posizioni, varianti, fasi)
     F5  manopola di densita': 'oggi' costruisce meno della meta' dei tifosi di 'vera'
   Due contesti (grande 85% e campionato 45%). Il braccio ROSSO accende __CPM_NO_FOLLA129 (la folla dipinta di prima)
   e DEVE fallire F1-F3: e' la prova che il guardiano vede. Uscita 0 solo se il verde passa tutto e il rosso no.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node folla-129.mjs */
import fs from 'node:fs';
if (!process.env.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import('./lib/harness.mjs');

const CTX = {
  grande: { tier: 'big', fill: 0.85, awayFill: 0.6, intensity: 0.85, passion: 75, loyalty: 70, capacity: 50000, attendance: 42500, seed: 129, meteo23: '',
    profile: { market: 70, passion: 75, history: 70, loyalty: 70, econ: 60 } },
  campionato: { tier: 'league', fill: 0.45, awayFill: 0.25, intensity: 0.55, passion: 60, loyalty: 60, capacity: 30000, attendance: 13500, seed: 7, meteo23: 'rain',
    profile: { market: 50, passion: 60, history: 55, loyalty: 60, econ: 50 } },
};
function probe(o) {
  window.__CPM_GLB = false; window.__CPM_TOD = 'day'; window.__CPM_STADIUM_TPL_FORCE = 'moderno_it'; window.__CPM_STADIUM_CAP_FORCE = o.crowd.capacity;
  window.__CPM_CROWD_OVERRIDE = o.crowd; window.__CPM_CROWD_MS = 110; window.__CPM_FOLLA129_ANIM = 1;
  if (o.rosso) window.__CPM_NO_FOLLA129 = 1;
  if (o.dens) window.__CPM_FOLLA129_DENS = o.dens;
  const P = window.__F129P = { up: 0, upSz: {} };
  const hook = proto => { if (!proto) return; for (const fn of ['texImage2D', 'texSubImage2D']) { const f = proto[fn]; proto[fn] = function () {
    const a = arguments, src = a[a.length - 1]; const k = (src && src.width) ? src.width + 'x' + src.height : 'dati';
    P.up++; P.upSz[k] = (P.upSz[k] || 0) + 1; return f.apply(this, a); }; } };
  hook(window.WebGLRenderingContext && WebGLRenderingContext.prototype); hook(window.WebGL2RenderingContext && WebGL2RenderingContext.prototype);
}
async function giro(b, port, nome, o) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(probe, { crowd: CTX[nome], rosso: !!o.rosso, dens: o.dens || null });
  await openMatch(page, port, { skipLoadAll: true, name: 'Folla129' }); await sleep(800);
  await page.evaluate(() => window.__CPM_FORCE_SIT(13, true)); await sleep(4000);
  const a0 = await page.evaluate(() => ({ tick: window.__CPM_CROWD_TICK || 0, up: window.__F129P.up }));
  await page.evaluate(() => { window.__F129P.upSz = {}; });
  await sleep(6000);
  const a1 = await page.evaluate(() => ({ tick: window.__CPM_CROWD_TICK || 0, up: window.__F129P.up, upSz: window.__F129P.upSz, f: window.__CPM_FOLLA129 || null, err: window.__CPM_FOLLA129_ERR || null }));
  await ctx.close();
  return { redraw: a1.tick - a0.tick, uploads: a1.up - a0.up, upSz: a1.upSz, f: a1.f, err: a1.err, errs };
}
function giudica(r, crowd) {
  const out = {};
  out.F1 = { ok: r.redraw === 0, msg: `tele ridisegnate in 6 s: ${r.redraw}` };
  out.F2 = { ok: r.uploads === 0, msg: `caricamenti di texture in 6 s: ${r.uploads} ${JSON.stringify(r.upSz)}` };
  if (!r.f || !r.f.n) { out.F3 = { ok: false, msg: `tifosi contabili: nessuno (folla dipinta, non giudicabile = rosso)${r.err ? ' · errore ' + r.err : ''}` }; return out; }
  let worst = 0, exp = 0, sl = 0; const righe = [];
  for (const [k, s] of Object.entries(r.f.per)) { const q = s.occ / Math.max(1, s.slots); const d = Math.abs(q - s.fill); worst = Math.max(worst, d); exp += s.slots * s.fill; sl += s.slots;
    righe.push(`${k} ${s.occ}/${s.slots}=${q.toFixed(3)} (settore ${s.fill})`); }
  const glob = r.f.occ / Math.max(1, r.f.slots), att = crowd.attendance / crowd.capacity, atteso = exp / Math.max(1, sl);
  out.F3 = { ok: worst <= 0.05 && Math.abs(glob - atteso) <= 0.03,
    msg: `${r.f.n} tifosi · occupati/posti ${glob.toFixed(3)} · atteso pesato ${atteso.toFixed(3)} · affluenza/capienza MatchdayCard ${crowd.attendance}/${crowd.capacity}=${att.toFixed(3)} · scarto peggiore di settore ${worst.toFixed(3)}\n      ${righe.join('\n      ')}` };
  return out;
}
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let verdeOk = true, rossoVisto = true; const sigs = {}; const nVera = {};
for (const nome of Object.keys(CTX)) {
  for (const braccio of ['verde', 'verde2', 'rosso']) {
    const r = await giro(b, port, nome, { rosso: braccio === 'rosso' });
    const g = giudica(r, CTX[nome]);
    console.log(`\n[${nome} · ${braccio}]${r.errs.length ? ' errori pagina: ' + r.errs.slice(0, 2).join(' | ') : ''}`);
    for (const [k, v] of Object.entries(g)) console.log(`  ${v.ok ? '✓' : '✗'} ${k} ${v.msg}`);
    if (braccio === 'rosso') { const fallite = Object.values(g).filter(v => !v.ok).length; if (fallite < 3) rossoVisto = false; console.log(`  → rosso: ${fallite}/3 controlli falliscono ${fallite >= 3 ? '(il guardiano vede)' : '(IL GUARDIANO NON VEDE)'}`); }
    else { if (Object.values(g).some(v => !v.ok) || r.errs.length) verdeOk = false; (sigs[nome] = sigs[nome] || []).push(r.f && r.f.sig); if (r.f) nVera[nome] = r.f.n; }
  }
  const s = sigs[nome]; const det = s.length === 2 && s[0] != null && s[0] === s[1];
  console.log(`  ${det ? '✓' : '✗'} F4 firma deterministica su due pagine nuove: ${s.join(' / ')}`); if (!det) verdeOk = false;
}
{ const r = await giro(b, port, 'grande', { dens: 'oggi' }); const n = r.f && r.f.n;
  const ok = !!n && n < nVera.grande * 0.5; if (!ok) verdeOk = false;
  console.log(`\n  ${ok ? '✓' : '✗'} F5 manopola di densita': 'oggi' ${n} tifosi contro 'vera' ${nVera.grande}`); }
await b.close(); srv.close();
console.log(`\nFOLLA: verde ${verdeOk ? 'PASSA' : 'NON PASSA'} · rosso ${rossoVisto ? 'visto' : 'NON visto'}`);
process.exit(verdeOk && rossoVisto ? 0 : 1);
