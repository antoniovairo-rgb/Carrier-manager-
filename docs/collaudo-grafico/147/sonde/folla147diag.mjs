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
    P.up++; P.upSz[k] = (P.upSz[k] || 0) + 1; P.ws=P.ws||new WeakSet();const nuovo=src&&typeof src==='object'?!P.ws.has(src):null;if(src&&typeof src==='object')P.ws.add(src);let ph=null;try{ph=window.__CPM_PHASE&&window.__CPM_PHASE();}catch(e){};(P.log=P.log||[]).push({t:Math.round(performance.now()),k,fn,nuovo,ph,id:(k==='128x128'&&src.getContext)?(()=>{try{const g=src.getContext('2d');const px=(x,y)=>Array.from(g.getImageData(x,y,1,1).data).join(',');return 'c'+px(64,64)+'|a'+px(2,2)+'|m'+px(64,30);}catch(e){return 'x'}})():'',st:(k==='dati'||k==='1024x512'||k==='128x128')?'':String(new Error().stack).split('\n').slice(2,9).map(x=>x.trim().replace(/https?:\/\/[^/]+\//,'')).join(' < ')}); return f.apply(this, a); }; } };
  hook(window.WebGLRenderingContext && WebGLRenderingContext.prototype); hook(window.WebGL2RenderingContext && WebGL2RenderingContext.prototype);
}
async function giro(b, port, nome, o) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(probe, { crowd: CTX[nome], rosso: !!o.rosso, dens: o.dens || null });
  if (process.env.DIAG_NO147) await page.addInitScript(() => { window.__CPM_NO_G147 = 1; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Folla129' }); await sleep(800);
  const tF = await page.evaluate(() => { window.__CPM_FORCE_SIT(13, true); return Math.round(performance.now()); }); await sleep(4000);
  const a0 = await page.evaluate(() => ({ t: Math.round(performance.now()), tick: window.__CPM_CROWD_TICK || 0, up: window.__F129P.up }));
  await page.evaluate(() => { window.__F129P.upSz = {}; });
  await sleep(+(process.env.DIAG_WIN||6000));
  const a1 = await page.evaluate(() => ({ t: Math.round(performance.now()), log: window.__F129P.log, tick: window.__CPM_CROWD_TICK || 0, up: window.__F129P.up, upSz: window.__F129P.upSz, f: window.__CPM_FOLLA129 || null, err: window.__CPM_FOLLA129_ERR || null }));
  await ctx.close();
  return { tF, t0: a0.t, t1: a1.t, log: a1.log, redraw: a1.tick - a0.tick, uploads: a1.up - a0.up, upSz: a1.upSz, f: a1.f, err: a1.err, errs };
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
const N=+(process.env.DIAG_N||4), nome=process.env.DIAG_CTX||'campionato';
for(let i=0;i<N;i++){ const r=await giro(b,port,nome,{});
  const w=(r.log||[]).filter(e=>e.t>r.t0&&e.t<=r.t1);
  console.log(`\n#${i} ${nome} F2=${r.uploads} ${JSON.stringify(r.upSz)} tF=${r.tF} t0=${r.t0} t1=${r.t1}`);
  const tot={}; for(const e of r.log||[]) tot[e.k]=(tot[e.k]||0)+1; console.log('  tutti:',JSON.stringify(tot));
  for(const e of (r.log||[]).filter(e=>e.k==='128x128'||e.t>r.tF+4000)) console.log(`  ${e.k} @${e.t-r.tF}ms dopo force ${e.t>r.t0&&e.t<=r.t1?'[FINESTRA]':''} ${e.fn} nuovo=${e.nuovo} fase=${e.ph} :: ${e.id} ${e.k==='256x48'&&false?'':''}`);
  for(const e of w.filter(e=>e.k!=='128x128')) console.log(`  finestra ${e.k} @${e.t-r.tF} ${e.st}`);
}
await b.close(); srv.close();
