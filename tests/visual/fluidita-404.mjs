#!/usr/bin/env node
/* [giro 404 · PO-580 «risoluzione adattiva in partita sui telefoni lenti»] GUARDIANO della fluidita' in partita.
   Percorso vero: carriera → «Gioca la partita» → ingresso saltato → partita a regime (corpi 3D ACCESI, notte, pilota automatico).
   Banco: telefono emulato 412x915 (isMobile + hasTouch, dpr 2 → pixelRatio di partenza 1,5). Il freno della CPU e' quello di CDP
   (Emulation.setCPUThrottlingRate), messo a partita aperta. La risoluzione adattiva e' spenta sotto ?cpmtest=1 come ogni regola di
   presentazione: la sonda la arma con __CPM_ADATTA404=1 in TUTTI i bracci (il braccio rosso la spegne con __CPM_NO_G404).
   Misura, per braccio: intervalli fra due requestAnimationFrame della pagina in una finestra di FIN ms (tempo della pagina) dopo un
   assestamento di ASS ms; pixelRatio del renderer della partita a inizio e fine finestra (testimone __CPM_ADA404).
   BRACCI (CPM_BRACCI=lento,lento-rosso,fluido,ritorno):
     lento        freno CPM_FRENO (default 4), adattiva accesa;
     lento-rosso  stesso freno, __CPM_NO_G404 (gioco com'era: il pixelRatio non si muove mai);
     fluido       nessun freno, tempo del fotogramma DICHIARATO a 1/60 s (__CPM_FT404, solo collaudo): il telefono fluido che il banco
                  non ha (MISURATO: il banco headless negli highlight gira a 7-13 fps anche senza freno e coi corpi spenti);
     ritorno      tempo dichiarato 0,1 s per 12 s, poi 1/60 per 30 s: scende fino al pavimento e risale (isteresi).
     libero, libero-rosso: senza freno, tempo vero — SOLO MISURA, stampata e non giudicata (sul banco anche «senza freno» e' lento).
   VERDE:
     V1 lento: il pixelRatio scende (fine < partenza) e non va sotto il pavimento dichiarato (testimone pav);
     V2 lento: fotogramma mediano della finestra < quello di lento-rosso (stesso freno) di almeno MIGLIORA (frazione, 0,10);
     V3 fluido: il pixelRatio non cambia (nessun passo ne' in giu' ne' in su);
     V5 ritorno: nel tratto lento arriva esattamente al pavimento, tornato fluido risale alla partenza;
     V4 lento-rosso: il pixelRatio non cambia (prova che il rosso spegne davvero) e nessun errore di pagina in nessun braccio.
   Un braccio non misurato (partita a regime non raggiunta, testimone assente, meno di 30 intervalli) e' ROSSO.
   Rosso: CPM_ROSSO=1 → anche il braccio «lento» gira con __CPM_NO_G404 e il guardiano DEVE uscire rosso (V1/V2).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node fluidita-404.mjs   (CPM_OUT=<json> · CPM_FRENO=4 · CPM_FIN=25000 · CPM_ASS=12000)
   Soglie: non si abbassano. */
import fs from 'node:fs';
import { sleep } from './lib/harness.mjs';
import { apriCarriera166, apriPrompt166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const BRACCI = (process.env.CPM_BRACCI || 'lento,lento-rosso,fluido,ritorno').split(',');
const FRENO = +(process.env.CPM_FRENO || 4), FIN = +(process.env.CPM_FIN || 40000), ASS = +(process.env.CPM_ASS || 10000);
const MIGLIORA = 0.10, ROSSO = process.env.CPM_ROSSO === '1', OUT = process.env.CPM_OUT || '';
const fase = (p) => p.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (e) { return null; } }).catch(() => null);
async function finoA(p) {
  const t0 = Date.now();
  while (Date.now() - t0 < 300000) { const f = await fase(p); if (f === 'playing' || (f && /^hl_/.test(f))) return true;
    if (f === 'walkout') { await p.evaluate(() => { const b = document.querySelector('[data-cpm="salta-ingresso-v2"]'); if (b && !window.__s404) { window.__s404 = 1; b.click(); } }); await sleep(500); continue; }
    await p.evaluate(() => { try { const C = window.__CPM_CAREER; if (C && C.dismiss) C.dismiss(); } catch (e) {} const B = [...document.querySelectorAll('button')].filter(x => x.offsetParent && /^(Vedi le formazioni|Gioca la partita|Ingresso in campo|Continua|Avanti|Vai in campo|In campo|Entra in campo|Chiudi|OK|Ok|Siamo pronti)/i.test((x.textContent || '').trim()) && !/Salta/i.test(x.textContent || '')); if (B[0]) B[0].click(); });
    await sleep(600); }
  return false;
}
const aRegime = async (p) => { for (let i = 0; i < 720; i++) { if (await p.evaluate(() => { try { return !!window.__CPM_PRONTI196().pronti && !window.__CPM_ATT196; } catch (e) { return false; } }).catch(() => false)) return true; await sleep(250); } return false; };
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const ada = (p) => p.evaluate(() => { try { const A = window.__CPM_ADA404; return A ? { pr: A.pr, base: A.base, pav: A.pav, giu: A.giu, su: A.su, ft: +(A.ft * 1000).toFixed(1) } : null; } catch (e) { return null; } }).catch(() => null);

const GI = [3, 21, 44, 62, 87, 105, 128, 150];
/* scene forzate a ciclo: il ciclo 3D gira solo negli highlight (in gioco fluido il campo e' 2D, misurato: contatore fermo) */
async function scene(p, ms, ogni = 5000, cb = null) { const t0 = Date.now(); let k = 0;
  while (Date.now() - t0 < ms) { await p.evaluate((gi) => { try { window.__CPM_FORCE_SIT(gi, false); } catch (e) {} }, GI[k++ % GI.length]).catch(() => {});
    const t1 = Date.now(); while (Date.now() - t1 < ogni && Date.now() - t0 < ms) { if (cb) await cb(); await sleep(1000); } } }

async function braccio(nome) {
  const rosso = nome === 'lento-rosso' || nome === 'libero-rosso' || (ROSSO && (nome === 'lento' || nome === 'ritorno')); const freno = /^lento/.test(nome) ? FRENO : 1;/* «libero»/«libero-rosso»: senza freno, solo misura (dichiarata, non giudicata) */
  const init = { __CPM_PRESENT: 1, __CPM_T196ON: 1, __CPM_TOD: 'night', __CPM_ADATTA404: 1, ...(rosso ? { __CPM_NO_G404: 1 } : {}), ...(nome === 'fluido' ? { __CPM_FT404: 1 / 60 } : {}) };
  const r = { braccio: nome, freno, rosso };
  const A = await apriCarriera166({ vp: { width: 412, height: 915 }, mobile: true, init, glb: true, nome: 'Fluidita Quattro' }); const p = A.page; const cdp = await A.ctx.newCDPSession(p);
  try {
    await apriPrompt166(p);
    await p.evaluate(() => { const b = [...document.querySelectorAll('[data-cpm="partita23"] button')].find(x => /^Gioca la partita/.test((x.textContent || '').trim())); if (b) b.click(); });
    if (!(await finoA(p) && await aRegime(p))) { r.err = 'partita a regime non raggiunta (fase ' + (await fase(p)) + ')'; }
    else {
      r.prima = await ada(p);
      if (nome === 'ritorno') {/* tempo del fotogramma dichiarato: 0,1 s per SLOW ms (telefono lento), poi 1/60 per FAST ms (torna fluido) */
        const serie = []; const cb = async () => { const a = await ada(p); if (a) serie.push(a.pr); };
        await p.evaluate(() => { window.__CPM_FT404 = 0.1; }); await scene(p, 12000, 6000, cb); r.minLento = Math.min(...serie); r.fineLento = serie[serie.length - 1];
        await p.evaluate(() => { window.__CPM_FT404 = 1 / 60; }); serie.length = 0; await scene(p, 30000, 6000, cb); r.dopo = await ada(p); r.serieFluida = serie;
        r.n = 999; r.mediano = null;
      } else {
        if (freno > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: freno });
        await scene(p, ASS);
        r.inizio = await ada(p);
        await p.evaluate((fin) => { const W = window.__F404 = { out: [], fin: false }; let u = 0; const t0 = performance.now();
          const g = (t) => { let f = null; try { f = window.__CPM_PHASE(); } catch (e) {} if (u && f && /^hl_/.test(f)) W.out.push(+(t - u).toFixed(1)); u = t; if (performance.now() - t0 < fin) requestAnimationFrame(g); else W.fin = true; }; requestAnimationFrame(g); }, FIN);
        await scene(p, FIN + 500);
        for (let i = 0; i < 60 && !(await p.evaluate(() => window.__F404.fin)); i++) await sleep(1000);
        const fr = await p.evaluate(() => window.__F404.out);
        r.dopo = await ada(p);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
        r.n = fr.length; r.mediano = med(fr); r.p90 = (() => { const s = [...fr].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length * 0.9)] : null; })();
      }
      r.fase = await fase(p);
    }
  } catch (e) { r.err = e.message; }
  r.errori = A.errs.slice(0, 3);
  await A.b.close(); A.srv.close();
  console.log('  ' + JSON.stringify(r));
  return r;
}

const R = {};
for (const b of BRACCI) { console.log(`▶ braccio ${b}`); R[b] = await braccio(b); }
const ko = [];
const misurato = (r) => r && !r.err && r.prima && r.dopo && r.n >= 30;
for (const b of BRACCI.filter(x => !/^libero/.test(x))) { const r = R[b]; if (!misurato(r)) ko.push(`${b}: non giudicato (${r && r.err ? r.err : !r || !r.prima ? 'testimone __CPM_ADA404 assente' : 'intervalli ' + (r && r.n)})`); else if (r.errori.length) ko.push(`${b}: errori di pagina ${r.errori.join(' | ')}`); }
if (misurato(R.lento)) { const L = R.lento;
  if (!(L.dopo.pr < L.dopo.base)) ko.push(`V1 lento: il pixelRatio non scende (${L.dopo.base} → ${L.dopo.pr})`);
  if (L.dopo.pr < L.dopo.pav - 1e-9) ko.push(`V1 lento: pixelRatio ${L.dopo.pr} sotto il pavimento ${L.dopo.pav}`);
  if (misurato(R['lento-rosso'])) { const Q = R['lento-rosso']; if (!(L.mediano <= Q.mediano * (1 - MIGLIORA))) ko.push(`V2 fotogramma mediano ${L.mediano} ms contro ${Q.mediano} del rosso: miglioramento < ${MIGLIORA * 100}%`); }
  else if (BRACCI.includes('lento-rosso')) ko.push('V2 non giudicato (manca il braccio lento-rosso)'); }
if (misurato(R.fluido)) { const F = R.fluido; if (F.dopo.pr !== F.dopo.base || F.dopo.giu > 0 || F.dopo.su > 0) ko.push(`V3 fluido: il pixelRatio si e' mosso su un telefono a 60 fps (${F.dopo.base} → ${F.dopo.pr}, passi giu' ${F.dopo.giu} su ${F.dopo.su})`); }
if (misurato(R.ritorno)) { const T = R.ritorno; if (!(T.minLento <= T.dopo.pav + 1e-9 && T.minLento >= T.dopo.pav - 1e-9)) ko.push(`V5 ritorno: nel tratto lento il pixelRatio non arriva al pavimento ${T.dopo.pav} (minimo ${T.minLento})`);
  if (T.dopo.pr !== T.dopo.base || !(T.dopo.su >= 1)) ko.push(`V5 ritorno: tornato fluido il pixelRatio non risale (${T.dopo.pr} su ${T.dopo.base}, passi su ${T.dopo.su})`); }
if (misurato(R['lento-rosso'])) { const Q = R['lento-rosso']; if (Q.dopo.pr !== Q.dopo.base || Q.dopo.giu > 0) ko.push(`V4 lento-rosso: il pixelRatio si e' mosso col rosso acceso (${Q.dopo.base} → ${Q.dopo.pr})`); }
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ R, ko }, null, 1));
if (ROSSO) { const v = ko.some(k => /^V1|^V2|^V5/.test(k)); console.log(v ? '✅ ROSSO ATTESO: col gioco com\'era il guardiano boccia (' + ko.filter(k => /^V1|^V2|^V5/.test(k)).join(' · ') + ')' : '❌ IL ROSSO NON BOCCIA: ' + (ko.join(' · ') || 'nessun difetto trovato')); process.exit(v ? 0 : 1); }
console.log(ko.length ? '❌ FLUIDITA-404 ROSSO\n  ' + ko.join('\n  ') : '✅ FLUIDITA-404 VERDE');
process.exit(ko.length ? 1 : 0);
